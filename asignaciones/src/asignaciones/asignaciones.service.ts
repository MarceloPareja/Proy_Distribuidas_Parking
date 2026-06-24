import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Asignacion } from './entities/asignacion.entity';
import { CreateAsignacionDto } from './dto/create-asignacion.dto';
import { CreateAsignacionBatchDto } from './dto/create-asignacion-batch.dto';
import { UpdateAsignacionDto } from './dto/update-asignacion.dto';
import { UsuariosClient } from '../clients/usuarios.client';
import { VehiculosClient } from '../clients/vehiculos.client';
import {
  AsignacionCreadaEvent,
  AsignacionModificadaEvent,
  AsignacionEliminadaEvent,
} from './asignaciones.events';

/**
 * Servicio de Asignaciones — lógica de negocio para RF1 + RF2.
 *
 * Regla de negocio principal:
 *   Un vehicleId solo puede tener UNA asignación con activo = true a la vez.
 *   Esta restricción se valida aquí (nivel de servicio) y se refuerza en BD
 *   con un índice único parcial (UQ_vehicle_activo).
 *
 * ─── Validación de existencia ───
 *   Antes de crear una asignación, se verifica que el userId y vehicleId
 *   existan realmente consultando los microservicios de Usuarios y Vehículos
 *   a través de Kong. Si alguno no existe, se lanza la excepción de dominio
 *   correspondiente.
 *
 * ─── Trazabilidad mediante Eventos de Dominio ───
 *   En lugar de usar interceptores, el servicio emite eventos de dominio
 *   cuando ocurren cambios (CREACION, MODIFICACION, ELIMINACION).
 *   TrazabilidadService escucha estos eventos y los persiste en la tabla
 *   de auditoría. Esto desacopla la lógica de negocio de la auditoría.
 *
 * Eliminación lógica:
 *   Se usa soft-delete (activo = false) en lugar de DELETE físico
 *   para preservar la trazabilidad histórica de las asignaciones.
 */
@Injectable()
export class AsignacionesService {
  private readonly logger = new Logger(AsignacionesService.name);

  constructor(
    @InjectRepository(Asignacion)
    private readonly asignacionRepo: Repository<Asignacion>,
    private readonly usuariosClient: UsuariosClient,
    private readonly vehiculosClient: VehiculosClient,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // ──────────────────────────────────────────────
  // CREAR — asignación individual
  // ──────────────────────────────────────────────

  /**
   * Crea una asignación vehículo → propietario.
   * Valida que:
   *  1. El userId exista en el microservicio de Usuarios (vía Kong)
   *  2. El vehicleId exista en el microservicio de Vehículos (vía Kong)
   *  3. El vehículo no tenga ya una asignación activa
   *
   * Emite un evento AsignacionCreadaEvent para la auditoría.
   */
  async crear(dto: CreateAsignacionDto): Promise<Asignacion> {
    // ─── Validar existencia en microservicios externos ───
    await this.validarExistenciaExterna(dto.userId, dto.vehicleId);

    await this.validarVehiculoNoActivoParaOtro(dto.vehicleId);

    // Verificar si ya existe la fila (userId, vehicleId) inactiva → reactivar
    const existente = await this.asignacionRepo.findOne({
      where: { userId: dto.userId, vehicleId: dto.vehicleId },
    });

    let asignacion: Asignacion;

    if (existente) {
      if (existente.activo) {
        throw new ConflictException(
          `La asignación usuario=${dto.userId}, vehículo=${dto.vehicleId} ya está activa`,
        );
      }
      // Reactivar la asignación previamente desactivada
      existente.activo = true;
      asignacion = await this.asignacionRepo.save(existente);
    } else {
      const nueva = this.asignacionRepo.create({
        userId: dto.userId,
        vehicleId: dto.vehicleId,
        activo: true,
      });
      asignacion = await this.asignacionRepo.save(nueva);
    }

    // ─── Emitir evento de creación para auditoría ───
    this.eventEmitter.emit(
      'asignacion.creada',
      new AsignacionCreadaEvent(dto.userId, dto.vehicleId, {
        userId: dto.userId,
        vehicleId: dto.vehicleId,
        activo: true,
      }),
    );

    return asignacion;
  }

  // ──────────────────────────────────────────────
  // CREAR BATCH — varios vehículos a un propietario
  // ──────────────────────────────────────────────

  /**
   * Asigna múltiples vehículos a un mismo propietario.
   * Retorna un resumen con las asignaciones exitosas y los errores individuales.
   */
  async crearBatch(
    dto: CreateAsignacionBatchDto,
  ): Promise<{ exitosas: Asignacion[]; errores: { vehicleId: string; mensaje: string }[] }> {
    const exitosas: Asignacion[] = [];
    const errores: { vehicleId: string; mensaje: string }[] = [];

    for (const item of dto.vehiculos) {
      try {
        const asignacion = await this.crear({
          userId: dto.userId,
          vehicleId: item.vehicleId,
        });
        exitosas.push(asignacion);
      } catch (error) {
        errores.push({
          vehicleId: item.vehicleId,
          mensaje: error instanceof Error ? error.message : 'Error desconocido',
        });
      }
    }

    return { exitosas, errores };
  }

  // ──────────────────────────────────────────────
  // ACTUALIZAR — cambio de estado o reasignación
  // ──────────────────────────────────────────────

  /**
   * Actualiza una asignación existente:
   *  - Si se envía `activo`, cambia el estado (activar/desactivar).
   *  - Si se envía `newUserId`, reasigna el vehículo: desactiva la actual
   *    y crea una nueva asignación con el nuevo propietario.
   *
   * Emite un evento AsignacionModificadaEvent para la auditoría.
   */
  async actualizar(
    userId: string,
    vehicleId: string,
    dto: UpdateAsignacionDto,
  ): Promise<Asignacion> {
    if (dto.activo === undefined && dto.newUserId === undefined) {
      throw new BadRequestException(
        'Debe enviar al menos uno de los campos: activo, newUserId',
      );
    }

    const asignacion = await this.buscarOFallar(userId, vehicleId);

    // Capturar el estado anterior para el payload del evento
    const estadoAnterior = JSON.parse(JSON.stringify(asignacion));

    // ─── Reasignación a otro propietario ───
    if (dto.newUserId !== undefined) {
      if (dto.newUserId === userId) {
        throw new BadRequestException(
          'El nuevo propietario no puede ser el mismo que el actual',
        );
      }

      // Validar que el nuevo usuario exista
      await this.usuariosClient.findById(dto.newUserId);

      // Desactivar la asignación actual
      asignacion.activo = false;
      const asignacionActualizada = await this.asignacionRepo.save(asignacion);

      // Emitir evento de modificación
      this.eventEmitter.emit(
        'asignacion.modificada',
        new AsignacionModificadaEvent(userId, vehicleId, {
          anterior: estadoAnterior,
          nuevo: asignacionActualizada,
        }),
      );

      // Crear la nueva asignación con el nuevo propietario
      return this.crear({ userId: dto.newUserId, vehicleId });
    }

    // ─── Cambio de estado simple ───
    if (dto.activo !== undefined) {
      // Si se quiere activar, validar que no haya otra activa para ese vehículo
      if (dto.activo === true) {
        await this.validarVehiculoNoActivoParaOtro(vehicleId, userId);
      }
      asignacion.activo = dto.activo;
    }

    const asignacionActualizada = await this.asignacionRepo.save(asignacion);

    // ─── Emitir evento de modificación para auditoría ───
    this.eventEmitter.emit(
      'asignacion.modificada',
      new AsignacionModificadaEvent(userId, vehicleId, {
        anterior: estadoAnterior,
        nuevo: asignacionActualizada,
      }),
    );

    return asignacionActualizada;
  }

  // ──────────────────────────────────────────────
  // ELIMINAR — soft delete (eliminación lógica)
  // ──────────────────────────────────────────────

  /**
   * Eliminación lógica: marca la asignación como activo = false.
   *
   * ¿Por qué soft delete?
   *   → Necesitamos trazabilidad histórica. El registro se conserva con
   *     activo = false y se puede auditar quién fue dueño de cada vehículo.
   *   → La entidad de trazabilidad referencia estas filas.
   *
   * Emite un evento AsignacionEliminadaEvent para la auditoría.
   */
  async eliminar(userId: string, vehicleId: string): Promise<Asignacion> {
    const asignacion = await this.buscarOFallar(userId, vehicleId);

    if (!asignacion.activo) {
      throw new ConflictException(
        `La asignación usuario=${userId}, vehículo=${vehicleId} ya está inactiva`,
      );
    }

    // Capturar el estado anterior para el payload del evento
    const estadoAnterior = JSON.parse(JSON.stringify(asignacion));

    asignacion.activo = false;
    const asignacionEliminada = await this.asignacionRepo.save(asignacion);

    // ─── Emitir evento de eliminación para auditoría ───
    this.eventEmitter.emit(
      'asignacion.eliminada',
      new AsignacionEliminadaEvent(userId, vehicleId, {
        anterior: estadoAnterior,
        nuevo: asignacionEliminada,
      }),
    );

    return asignacionEliminada;
  }

  // ──────────────────────────────────────────────
  // CONSULTAR — flota por propietario (RF3)
  // ──────────────────────────────────────────────

  /**
   * Retorna la lista de vehículos asignados a un usuario.
   * Solo incluye asignaciones activas.
   */
  async obtenerFlotaPorPropietario(userId: string): Promise<Asignacion[]> {
    return this.asignacionRepo.find({
      where: {
        userId,
        activo: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  // ──────────────────────────────────────────────
  // MÉTODOS AUXILIARES PRIVADOS
  // ──────────────────────────────────────────────

  /**
   * Busca una asignación por su clave compuesta o lanza NotFoundException.
   */
  private async buscarOFallar(
    userId: string,
    vehicleId: string,
  ): Promise<Asignacion> {
    const asignacion = await this.asignacionRepo.findOne({
      where: { userId, vehicleId },
    });

    if (!asignacion) {
      throw new NotFoundException(
        `No se encontró la asignación usuario=${userId}, vehículo=${vehicleId}`,
      );
    }

    return asignacion;
  }

  /**
   * Valida que NO exista otra asignación activa para el vehicleId dado.
   * Si se proporciona `excludeUserId`, excluye esa fila de la búsqueda
   * (útil al reactivar la propia asignación).
   */
  private async validarVehiculoNoActivoParaOtro(
    vehicleId: string,
    excludeUserId?: string,
  ): Promise<void> {
    const qb = this.asignacionRepo
      .createQueryBuilder('a')
      .where('a.vehicle_id = :vehicleId', { vehicleId })
      .andWhere('a.activo = :activo', { activo: true });

    if (excludeUserId !== undefined) {
      qb.andWhere('a.user_id != :excludeUserId', { excludeUserId });
    }

    const existente = await qb.getOne();

    if (existente) {
      throw new ConflictException(
        `El vehículo ${vehicleId} ya tiene una asignación activa con el usuario ${existente.userId}`,
      );
    }
  }

  /**
   * Valida que el userId y vehicleId existan en los microservicios externos
   * consultando a través de Kong API Gateway.
   *
   * Si alguno no existe, se lanza la excepción de dominio correspondiente.
   * Si algún servicio no está disponible, se lanza ServicioNoDisponibleException.
   *
   * Las consultas se ejecutan en paralelo con Promise.all para mayor eficiencia.
   */
  private async validarExistenciaExterna(
    userId: string,
    vehicleId: string,
  ): Promise<void> {
    this.logger.log(
      `Validando existencia externa: usuario=${userId}, vehículo=${vehicleId}`,
    );

    await Promise.all([
      this.usuariosClient.findById(userId),
      this.vehiculosClient.findById(vehicleId),
    ]);

    this.logger.log(
      `Existencia verificada: usuario=${userId}, vehículo=${vehicleId}`,
    );
  }
}
