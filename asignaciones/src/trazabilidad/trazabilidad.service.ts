import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import { Auditoria, TipoAccion } from './entities/evento-auditoria.entity';
import {
  AsignacionCreadaEvent,
  AsignacionModificadaEvent,
  AsignacionEliminadaEvent,
} from '../asignaciones/asignaciones.events';

/**
 * Servicio de Trazabilidad — escucha eventos de dominio y persiste auditoría.
 *
 * ─── Patrón de diseño: Event-Driven Architecture ───
 * En lugar de que el interceptor capture cambios, el servicio de asignaciones
 * emite eventos de dominio cuando ocurren cambios (CREACION, MODIFICACION,
 * ELIMINACION). TrazabilidadService escucha estos eventos y los persiste en
 * la tabla de auditoría.
 *
 * Ventajas:
 *   - Desacoplamiento: la lógica de negocio no conoce sobre auditoría
 *   - Testabilidad: fácil de testear emisión y escucha de eventos
 *   - Escalabilidad: se pueden agregar múltiples listeners fácilmente
 *   - Resiliencia: si la auditoría falla, no afecta la respuesta al cliente
 *
 * ─── Persistencia aislada ───
 * El método registrar() captura cualquier error interno con try/catch
 * y lo loguea en lugar de relanzarlo. De esta forma, si la inserción falla,
 * la respuesta al cliente original NO se ve afectada.
 */
@Injectable()
export class TrazabilidadService {
  private readonly logger = new Logger(TrazabilidadService.name);

  constructor(
    @InjectRepository(Auditoria)
    private readonly auditoriaRepo: Repository<Auditoria>,
  ) {}

  // ──────────────────────────────────────────────
  // LISTENERS DE EVENTOS DE DOMINIO
  // ──────────────────────────────────────────────

  /**
   * Escucha el evento 'asignacion.creada' y registra una auditoría de CREACION.
   */
  @OnEvent('asignacion.creada')
  async onAsignacionCreada(event: AsignacionCreadaEvent): Promise<void> {
    await this.registrar({
      userId: event.userId,
      vehicleId: event.vehicleId,
      accion: TipoAccion.CREACION,
      payload: event.payload,
    });
  }

  /**
   * Escucha el evento 'asignacion.modificada' y registra una auditoría de MODIFICACION.
   */
  @OnEvent('asignacion.modificada')
  async onAsignacionModificada(
    event: AsignacionModificadaEvent,
  ): Promise<void> {
    await this.registrar({
      userId: event.userId,
      vehicleId: event.vehicleId,
      accion: TipoAccion.MODIFICACION,
      payload: event.payload,
    });
  }

  /**
   * Escucha el evento 'asignacion.eliminada' y registra una auditoría de ELIMINACION.
   */
  @OnEvent('asignacion.eliminada')
  async onAsignacionEliminada(
    event: AsignacionEliminadaEvent,
  ): Promise<void> {
    await this.registrar({
      userId: event.userId,
      vehicleId: event.vehicleId,
      accion: TipoAccion.ELIMINACION,
      payload: event.payload,
    });
  }

  // ──────────────────────────────────────────────
  // REGISTRAR — persistir evento de auditoría
  // ──────────────────────────────────────────────

  /**
   * Persiste un evento de auditoría de forma aislada.
   *
   * El error se captura internamente: si la inserción falla,
   * se loguea pero NO afecta la respuesta al cliente.
   *
   * Parámetros:
   *   - userId: ID del usuario (parte de la clave compuesta)
   *   - vehicleId: ID del vehículo (parte de la clave compuesta)
   *   - accion: Tipo de acción (CREACION / MODIFICACION / ELIMINACION)
   *   - payload: Objeto JSON con información del evento
   */
  private async registrar(params: {
    userId: string;
    vehicleId: string;
    accion: TipoAccion;
    payload: Record<string, any>;
  }): Promise<void> {
    try {
      const evento = this.auditoriaRepo.create({
        userId: params.userId,
        vehicleId: params.vehicleId,
        accion: params.accion,
        payload: params.payload ?? null,
      });

      await this.auditoriaRepo.save(evento);

      this.logger.log(
        `✅ Evento de auditoría registrado: ${params.accion} → usuario=${params.userId}, vehículo=${params.vehicleId}`,
      );
    } catch (error) {
      // ─── AISLAMIENTO DE ERRORES ───
      // El error se loguea pero NO se relanza.
      // La respuesta al cliente original no se ve afectada.
      this.logger.error(
        `❌ Error al registrar evento de auditoría: ${params.accion} → ` +
          `usuario=${params.userId}, vehículo=${params.vehicleId}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }

  // ──────────────────────────────────────────────
  // CONSULTAS — endpoints de solo lectura
  // ──────────────────────────────────────────────

  /**
   * Consulta el historial de trazabilidad por usuario y vehículo.
   */
  async obtenerHistorialPorAsignacion(
    userId: string,
    vehicleId: string,
  ): Promise<Auditoria[]> {
    return this.auditoriaRepo.find({
      where: {
        userId,
        vehicleId,
      },
      order: {
        timestamp: 'DESC',
      },
    });
  }

  /**
   * Consulta el historial de trazabilidad por usuario.
   */
  async obtenerHistorialPorUsuario(userId: string): Promise<Auditoria[]> {
    return this.auditoriaRepo.find({
      where: { userId },
      order: {
        timestamp: 'DESC',
      },
    });
  }

  /**
   * Consulta el historial de trazabilidad por vehículo.
   */
  async obtenerHistorialPorVehiculo(vehicleId: string): Promise<Auditoria[]> {
    return this.auditoriaRepo.find({
      where: { vehicleId },
      order: {
        timestamp: 'DESC',
      },
    });
  }

  /**
   * Consulta el historial de trazabilidad filtrado por tipo de acción.
   */
  async obtenerHistorialPorAccion(accion: TipoAccion): Promise<Auditoria[]> {
    return this.auditoriaRepo.find({
      where: { accion },
      order: {
        timestamp: 'DESC',
      },
    });
  }

  /**
   * Obtiene todos los eventos de auditoría.
   */
  async obtenerTodoHistorial(
    limite: number = 100,
    offset: number = 0,
  ): Promise<{ eventos: Auditoria[]; total: number }> {
    const [eventos, total] = await this.auditoriaRepo.findAndCount({
      order: {
        timestamp: 'DESC',
      },
      take: limite,
      skip: offset,
    });

    return { eventos, total };
  }
}
   * @param filtros userId y/o vehicleId (ambos opcionales)
   * @returns Lista de eventos ordenados del más reciente al más antiguo
   */
  async consultarHistorial(filtros: {
    userId?: number;
    vehicleId?: number;
  }): Promise<EventoAuditoria[]> {
    const qb = this.eventoRepo.createQueryBuilder('e');

    if (filtros.userId !== undefined) {
      qb.andWhere('e.user_id = :userId', { userId: filtros.userId });
    }

    if (filtros.vehicleId !== undefined) {
      qb.andWhere('e.vehicle_id = :vehicleId', {
        vehicleId: filtros.vehicleId,
      });
    }

    qb.orderBy('e.created_at', 'DESC');

    return qb.getMany();
  }

  /**
   * Obtiene un evento específico por su UUID.
   */
  async findById(id: string): Promise<EventoAuditoria | null> {
    return this.eventoRepo.findOne({ where: { id } });
  }
}
