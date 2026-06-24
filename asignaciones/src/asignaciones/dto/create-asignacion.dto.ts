import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para crear una asignación: un vehículo → un propietario.
 */
export class CreateAsignacionDto {
  /** ID del propietario (usuario) — UUID */
  @ApiProperty({
    description: 'ID del propietario (usuario)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4', { message: 'userId debe ser un UUID válido' })
  userId: string;

  /** ID del vehículo — UUID */
  @ApiProperty({
    description: 'ID del vehículo',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID('4', { message: 'vehicleId debe ser un UUID válido' })
  vehicleId: string;
}
