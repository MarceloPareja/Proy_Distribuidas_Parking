import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import { EventoAuditoria, TipoAccion } from './entities/evento-auditoria.entity';

/**
 * Servicio de Trazabilidad — persiste y consulta eventos de auditoría.
 *
 * ─── Diseño de persistencia desacoplada ───
 * El método `registrar()` captura cualquier error interno (con try/catch)
 * y lo loguea en lugar de relanzarlo. De esta forma, si la inserción en
 * la tabla eventos_auditoria falla (ej. BD llena, constraint violado),
 * la respuesta al cliente del endpoint original NO se ve afectada.
 *
 * Esto cumple con el requisito de que "un fallo en el log de auditoría
 * no rompa la respuesta al cliente".
 */
@Injectable()
export class TrazabilidadService {
  private readonly logger = new Logger(TrazabilidadService.name);

  constructor(
    @InjectRepository(EventoAuditoria)
    private readonly eventoRepo: Repository<EventoAuditoria>,
  ) {}

  // ──────────────────────────────────────────────
  // REGISTRAR — persistir evento de auditoría
  // ──────────────────────────────────────────────

  /**
   * Persiste un evento de auditoría de forma asíncrona y aislada.
   *
   * ¿Por qué no se usa `await` en el interceptor?
   *   → El interceptor fue reemplazado por el patrón Observer.
   *   → El EventEmitter emite el evento y este método lo escucha de forma asíncrona.
   *
   * ¿Cómo se asegura que un fallo aquí no rompa la respuesta?
   *   → try/catch interno: cualquier excepción se atrapa y se loguea.
   *   → @OnEvent con { async: true } asegura la ejecución no bloqueante (fire-and-forget).
   */
  @OnEvent('asignacion.*', { async: true })
  async registrar(params: {
    userId: string;
    vehicleId: string;
    accion: TipoAccion;
    datosAnteriores?: Record<string, any> | null;
    datosNuevos?: Record<string, any> | null;
  }): Promise<void> {
    try {
      const evento = this.eventoRepo.create({
        userId: params.userId,
        vehicleId: params.vehicleId,
        accion: params.accion,
        datosAnteriores: params.datosAnteriores ?? null,
        datosNuevos: params.datosNuevos ?? null,
      });

      await this.eventoRepo.save(evento);

      this.logger.log(
        `✅ Evento registrado: ${params.accion} → usuario=${params.userId}, vehículo=${params.vehicleId}`,
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
  // CONSULTAS — endpoint de solo lectura
  // ──────────────────────────────────────────────

  /**
   * Consulta el historial de trazabilidad con filtros opcionales.
   * @param filtros userId y/o vehicleId (ambos opcionales)
   * @returns Lista de eventos ordenados del más reciente al más antiguo
   */
  async consultarHistorial(filtros: {
    userId?: string;
    vehicleId?: string;
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
