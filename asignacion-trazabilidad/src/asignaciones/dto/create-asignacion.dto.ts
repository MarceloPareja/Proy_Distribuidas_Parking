import { IsNotEmpty, IsUUID } from 'class-validator';

/**
 * DTO para crear una asignación: un vehículo → un propietario.
 */
export class CreateAsignacionDto {
  /** ID del propietario (usuario) */
  @IsNotEmpty({ message: 'userId no puede estar vacío' })
  @IsUUID('4', { message: 'userId debe ser un UUID' })
  userId: string;

  /** ID del vehículo */
  @IsNotEmpty({ message: 'vehicleId no puede estar vacío' })
  @IsUUID('4', { message: 'vehicleId debe ser un UUID' })
  vehicleId: string;
}
