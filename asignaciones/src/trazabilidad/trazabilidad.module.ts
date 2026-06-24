import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auditoria } from './entities/evento-auditoria.entity';
import { TrazabilidadService } from './trazabilidad.service';
import { TrazabilidadController } from './trazabilidad.controller';

/**
 * Módulo de Trazabilidad — RF2 (Auditoría).
 *
 * Responsabilidades:
 *   - Persistir eventos de auditoría (via TrazabilidadService)
 *   - Exponer endpoints de solo lectura para consultar historial
 *   - Escuchar eventos de dominio emitidos por AsignacionesService
 *     y registrar la auditoría en la tabla de auditoría.
 *
 * Patrón: Event-Driven Architecture desacoplado
 *   - AsignacionesService emite eventos de dominio
 *   - TrazabilidadService escucha estos eventos vía @OnEvent()
 *   - La auditoría se registra automáticamente sin acoplamiento
 */
@Module({
  imports: [TypeOrmModule.forFeature([Auditoria])],
  controllers: [TrazabilidadController],
  providers: [TrazabilidadService],
  exports: [TrazabilidadService],
})
export class TrazabilidadModule {}
