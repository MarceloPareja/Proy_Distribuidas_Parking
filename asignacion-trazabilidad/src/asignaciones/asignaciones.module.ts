import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsignacionesController } from './asignaciones.controller';
import { AsignacionesService } from './asignaciones.service';
import { Asignacion } from './entities/asignacion.entity';
import { TrazabilidadModule } from '../trazabilidad/trazabilidad.module';
import { ClientsModule } from '../clients/clients.module';

/**
 * Módulo de Asignaciones — FASE 2 (RF1) + FASE 3 (RF2) + FASE 4.
 *
 * Importa:
 *   - TypeOrmModule.forFeature([Asignacion]) → repositorio de asignaciones
 *   - TrazabilidadModule → para que el TrazabilidadInterceptor pueda
 *     inyectar TrazabilidadService dentro de este módulo
 *   - ClientsModule → UsuariosClient y VehiculosClient para validar
 *     existencia de usuarios/vehículos antes de crear asignaciones
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
