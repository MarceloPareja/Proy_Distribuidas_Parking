import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventoAuditoria } from './entities/evento-auditoria.entity';
import { TrazabilidadService } from './trazabilidad.service';
import { TrazabilidadController } from './trazabilidad.controller';

/**
 * Módulo de Trazabilidad — FASE 3 (RF2).
 *
 * Responsabilidades:
 *   - Persistir eventos de auditoría (via TrazabilidadService)
 *   - Exponer endpoint de solo lectura para consultar historial
 *   - Exportar TrazabilidadService para que el TrazabilidadInterceptor
 *     (registrado en AsignacionesModule) pueda inyectarlo.
 */
@Module({
  imports: [TypeOrmModule.forFeature([EventoAuditoria])],
  controllers: [TrazabilidadController],
  providers: [TrazabilidadService],
  exports: [TrazabilidadService],
})
export class TrazabilidadModule {}
