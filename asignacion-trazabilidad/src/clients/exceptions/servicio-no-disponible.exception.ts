import { ServiceUnavailableException } from '@nestjs/common';

/**
 * Excepción de dominio: el microservicio solicitado no está
 * disponible detrás de Kong (502/503/timeout).
 *
 * Hereda de ServiceUnavailableException (HTTP 503) para indicar
 * al cliente que el problema es transitorio y puede reintentarse.
 */
export class ServicioNoDisponibleException extends ServiceUnavailableException {
  constructor(servicio: string) {
    super(
      `El servicio "${servicio}" no está disponible en este momento. Intente de nuevo más tarde.`,
    );
  }
}
