import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import {
  UsuarioNoEncontradoException,
  ServicioNoDisponibleException,
} from './exceptions';

/**
 * Cliente HTTP para el microservicio de Usuarios (vía Kong).
 *
 * Ruta Kong: /api/usuarios
 *   - strip_path: true → el path /api/usuarios se elimina al llegar al servicio upstream.
 *   - Ej: GET /api/usuarios/users/5  →  upstream: GET /users/5
 *
 * ─── Manejo de errores ───
 *   - 404         → UsuarioNoEncontradoException (dominio)
 *   - 502 / 503   → ServicioNoDisponibleException (transitorio)
 *   - Timeout     → ServicioNoDisponibleException
 *   - Otros       → Se relanza el error original para no ocultar problemas inesperados
 */
@Injectable()
export class UsuariosClient {
  private readonly logger = new Logger(UsuariosClient.name);

  constructor(private readonly httpService: HttpService) {}

  /**
   * Verifica que un usuario exista consultando el microservicio de Usuarios.
   * @param userId ID del usuario a verificar
   * @returns Datos del usuario si existe
   * @throws UsuarioNoEncontradoException si el usuario no existe (404)
   * @throws ServicioNoDisponibleException si el servicio no responde (502/503/timeout)
   */
  async findById(userId: number): Promise<any> {
    this.logger.log(`Consultando usuario ${userId} vía Kong...`);

    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`/api/usuarios/users/${userId}`),
      );
      this.logger.log(`Usuario ${userId} verificado correctamente`);
      return data;
    } catch (error) {
      this.handleError(error, userId);
    }
  }

  /**
   * Mapea errores HTTP a excepciones de dominio propias.
   * Centraliza la lógica de manejo para mantener findById() limpio.
   */
  private handleError(error: unknown, userId: number): never {
    if (error instanceof AxiosError) {
      const status = error.response?.status;

      if (status === 404) {
        throw new UsuarioNoEncontradoException(userId);
      }

      if (status === 502 || status === 503) {
        this.logger.error(
          `Servicio de Usuarios no disponible (HTTP ${status})`,
        );
        throw new ServicioNoDisponibleException('Usuarios');
      }

      // Timeout (ECONNABORTED) o conexión rechazada (ECONNREFUSED)
      if (error.code === 'ECONNABORTED' || error.code === 'ECONNREFUSED') {
        this.logger.error(
          `Timeout o conexión rechazada al servicio de Usuarios: ${error.code}`,
        );
        throw new ServicioNoDisponibleException('Usuarios');
      }
    }

    // Error inesperado — relanzar para no enmascarar problemas
    this.logger.error(`Error inesperado al consultar usuario ${userId}`, error);
    throw error;
  }
}
