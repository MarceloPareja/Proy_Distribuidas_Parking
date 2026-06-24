import {
  Controller,
  Get,
  Query,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { TrazabilidadService } from './trazabilidad.service';
import { Auditoria, TipoAccion } from './entities/evento-auditoria.entity';

/**
 * Controlador REST de Trazabilidad — RF2 (Auditoría).
 *
 * Endpoints de SOLO LECTURA para consultar el historial de auditoría:
 *   GET /trazabilidad/asignacion/:userId/:vehicleId → Historial por asignación
 *   GET /trazabilidad/usuario/:userId → Historial por usuario
 *   GET /trazabilidad/vehiculo/:vehicleId → Historial por vehículo
 *   GET /trazabilidad/accion/:accion → Historial por tipo de acción
 *   GET /trazabilidad → Todos los eventos con paginación
 *
 * Prefijo global: /api/asignacion-trazabilidad (definido en main.ts)
 */
@ApiTags('Trazabilidad')
@Controller('trazabilidad')
export class TrazabilidadController {
  constructor(private readonly trazabilidadService: TrazabilidadService) {}

  // ──────────────────────────────────────────────
  // GET /trazabilidad/asignacion/:userId/:vehicleId — Historial por asignación
  // ──────────────────────────────────────────────

  @Get('asignacion/:userId/:vehicleId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener el historial de auditoría de una asignación específica',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de eventos de auditoría de la asignación',
    type: [Auditoria],
  })
  obtenerHistorialAsignacion(
    @Param('userId') userId: string,
    @Param('vehicleId') vehicleId: string,
  ) {
    return this.trazabilidadService.obtenerHistorialPorAsignacion(
      userId,
      vehicleId,
    );
  }

  // ──────────────────────────────────────────────
  // GET /trazabilidad/usuario/:userId — Historial por usuario
  // ──────────────────────────────────────────────

  @Get('usuario/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener el historial de auditoría de todas las asignaciones de un usuario',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de eventos de auditoría del usuario',
    type: [Auditoria],
  })
  obtenerHistorialUsuario(@Param('userId') userId: string) {
    return this.trazabilidadService.obtenerHistorialPorUsuario(userId);
  }

  // ──────────────────────────────────────────────
  // GET /trazabilidad/vehiculo/:vehicleId — Historial por vehículo
  // ──────────────────────────────────────────────

  @Get('vehiculo/:vehicleId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener el historial de auditoría de un vehículo',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de eventos de auditoría del vehículo',
    type: [Auditoria],
  })
  obtenerHistorialVehiculo(@Param('vehicleId') vehicleId: string) {
    return this.trazabilidadService.obtenerHistorialPorVehiculo(vehicleId);
  }

  // ──────────────────────────────────────────────
  // GET /trazabilidad/accion/:accion — Historial por tipo de acción
  // ──────────────────────────────────────────────

  @Get('accion/:accion')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener el historial de auditoría filtrado por tipo de acción',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de eventos de auditoría del tipo especificado',
    type: [Auditoria],
  })
  obtenerHistorialAccion(@Param('accion') accion: TipoAccion) {
    return this.trazabilidadService.obtenerHistorialPorAccion(accion);
  }

  // ──────────────────────────────────────────────
  // GET /trazabilidad — Todos los eventos con paginación
  // ──────────────────────────────────────────────

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener el historial completo de auditoría con paginación',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    description: 'Número de resultados por página (máximo 100)',
    required: false,
  })
  @ApiQuery({
    name: 'offset',
    type: Number,
    description: 'Número de resultados a saltar (para paginación)',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Listado paginado de todos los eventos de auditoría',
  })
  obtenerTodoHistorial(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const limite = limit ? Math.min(parseInt(limit, 10), 100) : 100;
    const desplazamiento = offset ? parseInt(offset, 10) : 0;
    return this.trazabilidadService.obtenerTodoHistorial(limite, desplazamiento);
  }
}
  }

  // ──────────────────────────────────────────────
  // GET /trazabilidad/:id — Obtener evento por UUID
  // ──────────────────────────────────────────────

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async obtenerEvento(@Param('id') id: string) {
    const evento = await this.trazabilidadService.findById(id);

    if (!evento) {
      throw new NotFoundException(`Evento de trazabilidad con ID ${id} no encontrado`);
    }

    return evento;
  }
}
