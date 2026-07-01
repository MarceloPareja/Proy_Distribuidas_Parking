import {
  Controller,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  Get,
} from '@nestjs/common';
import { AsignacionesService } from './asignaciones.service';
import { CreateAsignacionDto } from './dto/create-asignacion.dto';
import { CreateAsignacionBatchDto } from './dto/create-asignacion-batch.dto';
import { UpdateAsignacionDto } from './dto/update-asignacion.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UseGuards } from '@nestjs/common';

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
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('asignaciones')
export class AsignacionesController {
  constructor(private readonly asignacionesService: AsignacionesService) {}

  // ──────────────────────────────────────────────
  // POST /asignaciones — Crear asignación individual
  // ──────────────────────────────────────────────

  @Post()
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  crear(@Body() dto: CreateAsignacionDto) {
    return this.asignacionesService.crear(dto);
  }

  // ──────────────────────────────────────────────
  // POST /asignaciones/batch — Crear asignaciones en lote
  // ──────────────────────────────────────────────

  @Post('batch')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  crearBatch(@Body() dto: CreateAsignacionBatchDto) {
    return this.asignacionesService.crearBatch(dto);
  }

  // ──────────────────────────────────────────────
  // PATCH /asignaciones/:userId/:vehicleId — Actualizar
  // ──────────────────────────────────────────────

  @Patch(':userId/:vehicleId')
  @Roles('ADMIN')
  actualizar(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('vehicleId', ParseUUIDPipe) vehicleId: string,
    @Body() dto: UpdateAsignacionDto,
  ) {
    return this.asignacionesService.actualizar(userId, vehicleId, dto);
  }

  // ──────────────────────────────────────────────
  // DELETE /asignaciones/:userId/:vehicleId — Eliminar (soft delete)
  // ──────────────────────────────────────────────

  @Delete(':userId/:vehicleId')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  eliminar(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('vehicleId', ParseUUIDPipe) vehicleId: string,
  ) {
    return this.asignacionesService.eliminar(userId, vehicleId);
  }

  // ──────────────────────────────────────────────
  // GET /asignaciones/flota/:propietarioId — Consulta de flota (RF3)
  // ──────────────────────────────────────────────

  @Get('flota/:propietarioId')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  consultarFlota(@Param('propietarioId', ParseUUIDPipe) propietarioId: string) {
    return this.asignacionesService.consultarFlota(propietarioId);
  }
}
