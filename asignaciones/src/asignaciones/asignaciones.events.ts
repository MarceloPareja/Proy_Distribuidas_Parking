/**
 * Eventos de dominio para la entidad Asignación.
 * Estos eventos se emiten cuando ocurren cambios en las asignaciones
 * y son escuchados por TrazabilidadService para registrar auditoría.
 */

export class AsignacionCreadaEvent {
  constructor(
    readonly userId: string,
    readonly vehicleId: string,
    readonly payload: Record<string, any>,
  ) {}
}

export class AsignacionModificadaEvent {
  constructor(
    readonly userId: string,
    readonly vehicleId: string,
    readonly payload: Record<string, any>,
  ) {}
}

export class AsignacionEliminadaEvent {
  constructor(
    readonly userId: string,
    readonly vehicleId: string,
    readonly payload: Record<string, any>,
  ) {}
}
