import { IsBoolean, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
  @ApiProperty({
    description: 'Nuevo estado de la asignación (activo/inactivo)',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'activo debe ser un valor booleano' })
  activo?: boolean;

  /**
   * Nuevo propietario al que se reasigna el vehículo.
   * Si se proporciona, se desactiva la asignación actual y se crea una nueva.
   */
  @ApiProperty({
    description: 'Nuevo ID del propietario para reasignar el vehículo (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440002',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'newUserId debe ser un UUID válido' })
  newUserId?: string;
}
