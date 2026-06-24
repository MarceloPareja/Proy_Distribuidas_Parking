import { Type } from 'class-transformer';
import {
  IsUUID,
  IsArray,
  ArrayMinSize,
  ArrayNotEmpty,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Elemento individual dentro del batch — solo el vehicleId,
 * ya que el userId es compartido para todo el lote.
 */
export class BatchVehicleItemDto {
  @ApiProperty({
    description: 'ID del vehículo',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID('4', { message: 'vehicleId debe ser un UUID válido' })
  vehicleId: string;
}

/**
 * DTO para asignar múltiples vehículos a un mismo propietario en batch.
 *
 * Ejemplo de payload:
 * {
 *   "userId": "550e8400-e29b-41d4-a716-446655440000",
 *   "vehiculos": [
 *     { "vehicleId": "550e8400-e29b-41d4-a716-446655440001" },
 *     { "vehicleId": "550e8400-e29b-41d4-a716-446655440002" },
 *     { "vehicleId": "550e8400-e29b-41d4-a716-446655440003" }
 *   ]
 * }
 */
export class CreateAsignacionBatchDto {
  /** ID del propietario (usuario) — UUID */
  @ApiProperty({
    description: 'ID del propietario (usuario)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4', { message: 'userId debe ser un UUID válido' })
  userId: string;

  /** Lista de vehículos a asignar */
  @IsArray({ message: 'vehiculos debe ser un arreglo' })
  @ArrayNotEmpty({ message: 'vehiculos no puede estar vacío' })
  @ArrayMinSize(1, { message: 'Debe incluir al menos un vehículo' })
  @ValidateNested({ each: true })
  @Type(() => BatchVehicleItemDto)
  vehiculos: BatchVehicleItemDto[];
}
