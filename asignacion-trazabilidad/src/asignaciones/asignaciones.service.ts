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
import { UpdateAsignacionDto } from './dto/update-asignacion.dto';
import { UsuariosClient } from '../clients/usuarios.client';
import { VehiculosClient } from '../clients/vehiculos.client';
import { TipoAccion } from '../trazabilidad/entities/evento-auditoria.entity';

/**
 * Servicio de Asignaciones — lógica de negocio para RF1 + RF2.
 *
 * Regla de negocio principal:
 *   Un vehicleId solo puede tener UNA asignación con activo = true a la vez.
 *   Esta restricción se valida aquí (nivel de servicio) y se refuerza en BD
 *   con un índice único parcial (UQ_vehicle_activo).
 *
 * ─── Validación de existencia (FASE 4) ───
 *   Antes de crear una asignación, se verifica que el userId y vehicleId
 *   existan realmente consultando los microservicios de Usuarios y Vehículos
 *   a través de Kong. Si alguno no existe, se lanza la excepción de dominio
 *   correspondiente (UsuarioNoEncontradoException / VehiculoNoEncontradoException).
 *
 * ─── Trazabilidad: patrón req['__datosAnteriores'] ───
 *   Para que el TrazabilidadInterceptor pueda capturar el estado anterior
 *   del registro ANTES de que se mute, el service carga ese estado y lo
 *   adjunta al objeto request como `req['__datosAnteriores']`.
 *
 *   ¿Por qué en el service y no en el interceptor?
 *     → El interceptor se ejecuta ANTES del handler (pre-handler) y DESPUÉS
 *       (post-handler via tap), pero no tiene acceso al repositorio de
 *       Asignaciones. Cargar el estado previo dentro del interceptor
 *       requeriría inyectar AsignacionesService, creando acoplamiento
 *       circular y duplicando queries.
 *     → El service ya tiene el repo y la lógica de búsqueda, así que es
 *       natural que él cargue y adjunte los datos al request context.
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
   */
  async crear(dto: CreateAsignacionDto): Promise<Asignacion> {
    // ─── Validar existencia en microservicios externos (FASE 4) ───
    await this.validarExistenciaExterna(dto.userId, dto.vehicleId);

    await this.validarVehiculoNoActivoParaOtro(dto.vehicleId);

    // Verificar si ya existe la fila (userId, vehicleId) inactiva → reactivar
    const existente = await this.asignacionRepo.findOne({
      where: { userId: dto.userId, vehicleId: dto.vehicleId },
    });

    if (existente) {
      if (existente.activo) {
        throw new ConflictException(
          `La asignación usuario=${dto.userId}, vehículo=${dto.vehicleId} ya está activa`,
        );
      }
      
      const datosAnteriores = JSON.parse(JSON.stringify(existente));
      
      // Reactivar la asignación previamente desactivada
      existente.activo = true;
      const asignacion = await this.asignacionRepo.save(existente);
      
      this.eventEmitter.emit('asignacion.modificada', {
        userId: asignacion.userId,
        vehicleId: asignacion.vehicleId,
        accion: TipoAccion.MODIFICACION,
        datosAnteriores,
        datosNuevos: JSON.parse(JSON.stringify(asignacion)),
      });
      return asignacion;
    }

    const nueva = this.asignacionRepo.create({
      userId: dto.userId,
      vehicleId: dto.vehicleId,
      activo: true,
    });
    const asignacion = await this.asignacionRepo.save(nueva);
    
    this.eventEmitter.emit('asignacion.creada', {
      userId: asignacion.userId,
      vehicleId: asignacion.vehicleId,
      accion: TipoAccion.CREACION,
      datosAnteriores: null,
      datosNuevos: JSON.parse(JSON.stringify(asignacion)),
    });
    
    return asignacion;
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
   * Adjunta el estado anterior a req['__datosAnteriores'] para el interceptor.
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

    // ─── Capturar estado anterior para trazabilidad ───
    const datosAnteriores = JSON.parse(JSON.stringify(asignacion));

    // ─── Reasignación a otro propietario ───
    if (dto.newUserId !== undefined) {
      if (dto.newUserId === userId) {
        throw new BadRequestException(
          'El nuevo propietario no puede ser el mismo que el actual',
        );
      }

      // Validar que el nuevo usuario exista (FASE 4)
      await this.usuariosClient.findById(dto.newUserId);

      // Desactivar la asignación actual
      asignacion.activo = false;
      await this.asignacionRepo.save(asignacion);
      
      this.eventEmitter.emit('asignacion.modificada', {
        userId: asignacion.userId,
        vehicleId: asignacion.vehicleId,
        accion: TipoAccion.MODIFICACION,
        datosAnteriores,
        datosNuevos: JSON.parse(JSON.stringify(asignacion)),
      });

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

    const actualizada = await this.asignacionRepo.save(asignacion);
    
    this.eventEmitter.emit('asignacion.modificada', {
      userId: actualizada.userId,
      vehicleId: actualizada.vehicleId,
      accion: TipoAccion.MODIFICACION,
      datosAnteriores,
      datosNuevos: JSON.parse(JSON.stringify(actualizada)),
    });
    
    return actualizada;
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
   * Adjunta el estado anterior a req['__datosAnteriores'] para el interceptor.
   */
  async eliminar(userId: string, vehicleId: string): Promise<Asignacion> {
    const asignacion = await this.buscarOFallar(userId, vehicleId);

    if (!asignacion.activo) {
      throw new ConflictException(
        `La asignación usuario=${userId}, vehículo=${vehicleId} ya está inactiva`,
      );
    }

    // ─── Capturar estado anterior para trazabilidad ───
    const datosAnteriores = JSON.parse(JSON.stringify(asignacion));

    asignacion.activo = false;
    const eliminada = await this.asignacionRepo.save(asignacion);
    
    this.eventEmitter.emit('asignacion.eliminada', {
      userId: eliminada.userId,
      vehicleId: eliminada.vehicleId,
      accion: TipoAccion.ELIMINACION,
      datosAnteriores,
      datosNuevos: null,
    });
    
    return eliminada;
  }

  // ──────────────────────────────────────────────
  // CONSULTA DE FLOTA (FASE 5)
  // ──────────────────────────────────────────────

  /**
   * Consulta la flota de vehículos activos de un propietario.
   * Agrega información local (asignaciones) con información externa (vehículos vía Kong).
   */
  async consultarFlota(propietarioId: string): Promise<any[]> {
    // 1. Validar que el propietario exista
    await this.usuariosClient.findById(propietarioId);

    // 2. Buscar asignaciones activas localmente
    const asignaciones = await this.asignacionRepo.find({
      where: { userId: propietarioId, activo: true },
      order: { createdAt: 'DESC' },
    });

    if (asignaciones.length === 0) {
      return [];
    }

    // 3. Consultar detalles de los vehículos en paralelo
    const flota = await Promise.all(
      asignaciones.map(async (asignacion) => {
        try {
          const vehiculo = await this.vehiculosClient.findById(asignacion.vehicleId);
          return {
            vehicleId: asignacion.vehicleId,
            tipo: vehiculo?.tipo || 'Desconocido',
            categoria: vehiculo?.categoria || 'Desconocida',
            fechaAsignacion: asignacion.createdAt,
          };
        } catch (error) {
          this.logger.warn(
            `No se pudo obtener el detalle del vehículo ${asignacion.vehicleId}`,
          );
          return {
            vehicleId: asignacion.vehicleId,
            tipo: 'Desconocido',
            categoria: 'Desconocida',
            fechaAsignacion: asignacion.createdAt,
          };
        }
      }),
    );

    return flota;
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
   * consultando a través de Kong API Gateway (FASE 4).
   *
   * Si alguno no existe, se lanza la excepción de dominio correspondiente
   * (UsuarioNoEncontradoException / VehiculoNoEncontradoException).
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

