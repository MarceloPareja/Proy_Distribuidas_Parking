import { NotFoundException } from '@nestjs/common';

/**
 * Excepción de dominio: el usuario solicitado no existe en el
 * microservicio de Usuarios (consultado a través de Kong).
 *
 * Hereda de NotFoundException (HTTP 404) para que NestJS genere
 * la respuesta adecuada sin manejo adicional en el controller.
 */
export class UsuarioNoEncontradoException extends NotFoundException {
  constructor(userId: string) {
    super(`El usuario con ID ${userId} no existe o no se pudo verificar`);
  }
}
