import { IsInt, IsPositive } from 'class-validator';

/**
 * DTO para crear una asignación: un vehículo → un propietario.
 */
export class CreateAsignacionDto {
  /** ID del propietario (usuario) */
  @IsInt({ message: 'userId debe ser un número entero' })
  @IsPositive({ message: 'userId debe ser un número positivo' })
  userId: number;

  /** ID del vehículo */
  @IsInt({ message: 'vehicleId debe ser un número entero' })
  @IsPositive({ message: 'vehicleId debe ser un número positivo' })
  vehicleId: number;
}
