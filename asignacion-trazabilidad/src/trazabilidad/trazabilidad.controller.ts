import {
  Controller,
  Get,
  Query,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { TrazabilidadService } from './trazabilidad.service';

/**
 * Controlador REST de Trazabilidad — FASE 3 (RF2).
 *
 * Endpoints de SOLO LECTURA para consultar el historial de auditoría:
 *   GET /trazabilidad          → Listar eventos (filtros opcionales por userId y/o vehicleId)
 *   GET /trazabilidad/:id      → Obtener un evento específico por UUID
 *
 * Prefijo global: /api/asignacion-trazabilidad (definido en main.ts)
 */
@Controller('trazabilidad')
export class TrazabilidadController {
  constructor(private readonly trazabilidadService: TrazabilidadService) {}

  // ──────────────────────────────────────────────
  // GET /trazabilidad — Consultar historial de auditoría
  // ──────────────────────────────────────────────

  /**
   * Consulta el historial de eventos de trazabilidad.
   *
   * Query params opcionales:
   *   ?userId=5          → Filtrar por usuario
   *   ?vehicleId=10      → Filtrar por vehículo
   *   ?userId=5&vehicleId=10 → Filtrar por ambos
   *   (sin filtros)      → Retorna todos los eventos
   *
   * Los resultados se ordenan del más reciente al más antiguo.
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  consultarHistorial(
    @Query('userId') userId?: string,
    @Query('vehicleId') vehicleId?: string,
  ) {
    return this.trazabilidadService.consultarHistorial({
      userId,
      vehicleId,
    });
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
