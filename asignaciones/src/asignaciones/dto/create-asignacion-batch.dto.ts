import { Type } from 'class-transformer';
import {
  IsInt,
  IsPositive,
  IsArray,
  ArrayMinSize,
  ArrayNotEmpty,
  ValidateNested,
} from 'class-validator';

/**
 * Elemento individual dentro del batch — solo el vehicleId,
 * ya que el userId es compartido para todo el lote.
 */
export class BatchVehicleItemDto {
  @IsInt({ message: 'vehicleId debe ser un número entero' })
  @IsPositive({ message: 'vehicleId debe ser un número positivo' })
  vehicleId: number;
}

/**
 * DTO para asignar múltiples vehículos a un mismo propietario en batch.
 *
 * Ejemplo de payload:
 * {
 *   "userId": 5,
 *   "vehiculos": [
 *     { "vehicleId": 10 },
 *     { "vehicleId": 11 },
 *     { "vehicleId": 12 }
 *   ]
 * }
 */
export class CreateAsignacionBatchDto {
  /** ID del propietario (usuario) */
  @IsInt({ message: 'userId debe ser un número entero' })
  @IsPositive({ message: 'userId debe ser un número positivo' })
  userId: number;

  /** Lista de vehículos a asignar */
  @IsArray({ message: 'vehiculos debe ser un arreglo' })
  @ArrayNotEmpty({ message: 'vehiculos no puede estar vacío' })
  @ArrayMinSize(1, { message: 'Debe incluir al menos un vehículo' })
  @ValidateNested({ each: true })
  @Type(() => BatchVehicleItemDto)
  vehiculos: BatchVehicleItemDto[];
}
