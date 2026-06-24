import {
  Controller,
  Post,
  Patch,
  Delete,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AsignacionesService } from './asignaciones.service';
import { CreateAsignacionDto } from './dto/create-asignacion.dto';
import { CreateAsignacionBatchDto } from './dto/create-asignacion-batch.dto';
import { UpdateAsignacionDto } from './dto/update-asignacion.dto';
import { Asignacion } from './entities/asignacion.entity';

/**
 * Controlador REST de Asignaciones — RF1 + RF2 + RF3.
 *
 * Endpoints:
 *   POST   /asignaciones           → Crear asignación individual
 *   POST   /asignaciones/batch     → Crear asignaciones en lote
 *   PATCH  /asignaciones/:userId/:vehicleId → Actualizar (estado / reasignar)
 *   DELETE /asignaciones/:userId/:vehicleId → Eliminar (soft delete)
 *   GET    /asignaciones/flota/:userId → Consultar flota por propietario (RF3)
 *
 * Prefijo global: /api/asignacion-trazabilidad (definido en main.ts)
 *
 * ─── Auditoría automática ───
 * Cada operación POST, PATCH o DELETE emite automáticamente un evento de
 * dominio que es escuchado por TrazabilidadService, el cual registra la
 * auditoría en la tabla de auditoría.
 */
@ApiTags('Asignaciones')
@Controller('asignaciones')
export class AsignacionesController {
  constructor(private readonly asignacionesService: AsignacionesService) {}

  // ──────────────────────────────────────────────
  // POST /asignaciones — Crear asignación individual
  // ──────────────────────────────────────────────

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una nueva asignación de vehículo a propietario' })
  @ApiResponse({
    status: 201,
    description: 'Asignación creada exitosamente',
    type: Asignacion,
  })
  crear(@Body() dto: CreateAsignacionDto) {
    return this.asignacionesService.crear(dto);
  }

  // ──────────────────────────────────────────────
  // POST /asignaciones/batch — Crear asignaciones en lote
  // ──────────────────────────────────────────────

  @Post('batch')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear múltiples asignaciones en lote' })
  @ApiResponse({
    status: 201,
    description: 'Asignaciones procesadas (algunas pueden tener errores)',
  })
  crearBatch(@Body() dto: CreateAsignacionBatchDto) {
    return this.asignacionesService.crearBatch(dto);
  }

  // ──────────────────────────────────────────────
  // PATCH /asignaciones/:userId/:vehicleId — Actualizar
  // ──────────────────────────────────────────────

  @Patch(':userId/:vehicleId')
  @ApiOperation({ summary: 'Actualizar una asignación (estado o reasignación)' })
  @ApiResponse({
    status: 200,
    description: 'Asignación actualizada exitosamente',
    type: Asignacion,
  })
  actualizar(
    @Param('userId') userId: string,
    @Param('vehicleId') vehicleId: string,
    @Body() dto: UpdateAsignacionDto,
  ) {
    return this.asignacionesService.actualizar(userId, vehicleId, dto);
  }

  // ──────────────────────────────────────────────
  // DELETE /asignaciones/:userId/:vehicleId — Eliminar (soft delete)
  // ──────────────────────────────────────────────

  @Delete(':userId/:vehicleId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar una asignación (soft delete)' })
  @ApiResponse({
    status: 200,
    description: 'Asignación eliminada exitosamente',
    type: Asignacion,
  })
  eliminar(
    @Param('userId') userId: string,
    @Param('vehicleId') vehicleId: string,
  ) {
    return this.asignacionesService.eliminar(userId, vehicleId);
  }

  // ──────────────────────────────────────────────
  // GET /asignaciones/flota/:userId — Consultar flota por propietario (RF3)
  // ──────────────────────────────────────────────

  @Get('flota/:userId')
  @ApiOperation({
    summary: 'Obtener la flota de vehículos asignados a un propietario',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de vehículos asignados activos al propietario',
    type: [Asignacion],
  })
  obtenerFlota(@Param('userId') userId: string) {
    return this.asignacionesService.obtenerFlotaPorPropietario(userId);
  }
}
