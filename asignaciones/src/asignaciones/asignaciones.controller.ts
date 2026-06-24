import {
  Controller,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';
import { AsignacionesService } from './asignaciones.service';
import { CreateAsignacionDto } from './dto/create-asignacion.dto';
import { CreateAsignacionBatchDto } from './dto/create-asignacion-batch.dto';
import { UpdateAsignacionDto } from './dto/update-asignacion.dto';
import { TrazabilidadInterceptor } from '../common/interceptors';

/**
 * Controlador REST de Asignaciones — FASE 2 (RF1) + FASE 3 (RF2).
 *
 * Endpoints:
 *   POST   /asignaciones           → Crear asignación individual
 *   POST   /asignaciones/batch     → Crear asignaciones en lote
 *   PATCH  /asignaciones/:userId/:vehicleId → Actualizar (estado / reasignar)
 *   DELETE /asignaciones/:userId/:vehicleId → Eliminar (soft delete)
 *
 * Prefijo global: /api/asignacion-trazabilidad (definido en main.ts)
 *
 * ─── Auditoría automática ───
 * El @UseInterceptors(TrazabilidadInterceptor) aplica el interceptor de
 * auditoría a TODOS los endpoints de este controller. Cada operación POST,
 * PATCH o DELETE genera automáticamente un EventoAuditoria en la tabla
 * eventos_auditoria, sin que el controller ni el service necesiten
 * invocarlo explícitamente.
 */
@Controller('asignaciones')
@UseInterceptors(TrazabilidadInterceptor)
export class AsignacionesController {
  constructor(private readonly asignacionesService: AsignacionesService) {}

  // ──────────────────────────────────────────────
  // POST /asignaciones — Crear asignación individual
  // ──────────────────────────────────────────────

  @Post()
  @HttpCode(HttpStatus.CREATED)
  crear(@Body() dto: CreateAsignacionDto) {
    return this.asignacionesService.crear(dto);
  }

  // ──────────────────────────────────────────────
  // POST /asignaciones/batch — Crear asignaciones en lote
  // ──────────────────────────────────────────────

  @Post('batch')
  @HttpCode(HttpStatus.CREATED)
  crearBatch(@Body() dto: CreateAsignacionBatchDto) {
    return this.asignacionesService.crearBatch(dto);
  }

  // ──────────────────────────────────────────────
  // PATCH /asignaciones/:userId/:vehicleId — Actualizar
  // ──────────────────────────────────────────────

  @Patch(':userId/:vehicleId')
  actualizar(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('vehicleId', ParseIntPipe) vehicleId: number,
    @Body() dto: UpdateAsignacionDto,
  ) {
    return this.asignacionesService.actualizar(userId, vehicleId, dto);
  }

  // ──────────────────────────────────────────────
  // DELETE /asignaciones/:userId/:vehicleId — Eliminar (soft delete)
  // ──────────────────────────────────────────────

  @Delete(':userId/:vehicleId')
  @HttpCode(HttpStatus.OK)
  eliminar(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('vehicleId', ParseIntPipe) vehicleId: number,
  ) {
    return this.asignacionesService.eliminar(userId, vehicleId);
  }
}
