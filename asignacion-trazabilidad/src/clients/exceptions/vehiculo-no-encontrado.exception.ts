import { NotFoundException } from '@nestjs/common';

/**
 * Excepción de dominio: el vehículo solicitado no existe en el
 * microservicio de Vehículos (consultado a través de Kong).
 *
 * Hereda de NotFoundException (HTTP 404) para que NestJS genere
 * la respuesta adecuada sin manejo adicional en el controller.
 */
export class VehiculoNoEncontradoException extends NotFoundException {
  constructor(vehicleId: string) {
    super(`El vehículo con ID ${vehicleId} no existe o no se pudo verificar`);
  }
}
