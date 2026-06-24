import { IsBoolean, IsInt, IsOptional, IsPositive } from 'class-validator';

/**
 * DTO para actualizar una asignación.
 *
 * Permite:
 *  - Cambiar el estado (activo/inactivo) → soft-delete o reactivación.
 *  - Reasignar el vehículo a otro propietario (newUserId).
 *
 * Al menos uno de los campos debe enviarse.
 */
export class UpdateAsignacionDto {
  /** Nuevo estado de la asignación */
  @IsOptional()
  @IsBoolean({ message: 'activo debe ser un valor booleano' })
  activo?: boolean;

  /**
   * Nuevo propietario al que se reasigna el vehículo.
   * Si se proporciona, se desactiva la asignación actual y se crea una nueva.
   */
  @IsOptional()
  @IsInt({ message: 'newUserId debe ser un número entero' })
  @IsPositive({ message: 'newUserId debe ser un número positivo' })
  newUserId?: number;
}
