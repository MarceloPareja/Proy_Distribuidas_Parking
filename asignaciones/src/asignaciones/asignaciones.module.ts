import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsignacionesController } from './asignaciones.controller';
import { AsignacionesService } from './asignaciones.service';
import { Asignacion } from './entities/asignacion.entity';
import { TrazabilidadModule } from '../trazabilidad/trazabilidad.module';
import { ClientsModule } from '../clients/clients.module';

/**
 * Módulo de Asignaciones — RF1 (Asignación) + RF2 (Trazabilidad) + RF3 (Consulta).
 *
 * Importa:
 *   - TypeOrmModule.forFeature([Asignacion]) → repositorio de asignaciones
 *   - TrazabilidadModule → proporciona TrazabilidadService que escucha
 *     eventos de dominio emitidos por AsignacionesService
 *   - ClientsModule → UsuariosClient y VehiculosClient para validar
 *     existencia de usuarios/vehículos antes de crear asignaciones
 *
 * Patrón: Event-Driven Architecture
 *   - AsignacionesService emite eventos: asignacion.creada, asignacion.modificada,
 *     asignacion.eliminada
 *   - TrazabilidadService escucha estos eventos vía @OnEvent() decorador
 *   - La auditoría se registra automáticamente de forma desacoplada
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Asignacion]),
    TrazabilidadModule,
    ClientsModule,
  ],
  controllers: [AsignacionesController],
  providers: [AsignacionesService],
  exports: [AsignacionesService],
})
export class AsignacionesModule {}
