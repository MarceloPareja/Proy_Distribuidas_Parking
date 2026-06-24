import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import {
  VehiculoNoEncontradoException,
  ServicioNoDisponibleException,
} from './exceptions';

/**
 * Cliente HTTP para el microservicio de Vehículos (vía Kong).
 *
 * Ruta Kong: /api/vehiculos
 *   - strip_path: false → el path se conserva al llegar al servicio upstream.
 *   - Ej: GET /api/vehiculos/5  →  upstream: GET /api/vehiculos/5
 *
 * ─── Seguridad (Key Auth) ───
 *   Si la ruta de Vehículos en Kong tiene Key Auth habilitado (consumer
 *   sistema-tickets), se inyecta el header `apikey` desde la variable de
 *   entorno KONG_API_KEY (definida en .env, NO hardcodeada en el código).
 *
 *   ¿Cómo se maneja de forma segura?
 *   1. La clave se lee de .env con ConfigService (nunca en el source code).
 *   2. En producción, .env NO se sube al repositorio (.gitignore lo excluye).
 *   3. Se inyecta vía variables de entorno del contenedor (Docker secrets,
 *      Kubernetes secrets, o variables de entorno del CI/CD).
 *   4. Si la clave no está configurada, se omite el header (la ruta
 *      podría no requerir auth en ciertos ambientes).
 *
 * ─── Manejo de errores ───
 *   Mismo patrón que UsuariosClient: mapeo a excepciones de dominio propias.
 */
@Injectable()
export class VehiculosClient {
  private readonly logger = new Logger(VehiculosClient.name);
  private readonly apiKey: string | undefined;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    // Se lee la API key una sola vez al instanciar el servicio
    this.apiKey = this.configService.get<string>('KONG_API_KEY');

    if (!this.apiKey) {
      this.logger.warn(
        'KONG_API_KEY no configurada — las peticiones a Vehículos se enviarán sin apikey',
      );
    }
  }

  /**
   * Verifica que un vehículo exista consultando el microservicio de Vehículos.
   * @param vehicleId ID del vehículo a verificar
   * @returns Datos del vehículo (con tipo y categoría) si existe
   * @throws VehiculoNoEncontradoException si el vehículo no existe (404)
   * @throws ServicioNoDisponibleException si el servicio no responde (502/503/timeout)
   */
  async findById(vehicleId: number): Promise<any> {
    this.logger.log(`Consultando vehículo ${vehicleId} vía Kong...`);

    try {
      const headers: Record<string, string> = {};

      // Inyectar API key solo si está configurada
      if (this.apiKey) {
        headers['apikey'] = this.apiKey;
      }

      const { data } = await firstValueFrom(
        this.httpService.get(`/api/vehiculos/${vehicleId}`, { headers }),
      );
      this.logger.log(`Vehículo ${vehicleId} verificado correctamente`);
      return data;
    } catch (error) {
      this.handleError(error, vehicleId);
    }
  }

  /**
   * Mapea errores HTTP a excepciones de dominio propias.
   */
  private handleError(error: unknown, vehicleId: number): never {
    if (error instanceof AxiosError) {
      const status = error.response?.status;

      if (status === 404) {
        throw new VehiculoNoEncontradoException(vehicleId);
      }

      if (status === 502 || status === 503) {
        this.logger.error(
          `Servicio de Vehículos no disponible (HTTP ${status})`,
        );
        throw new ServicioNoDisponibleException('Vehículos');
      }

      // Timeout (ECONNABORTED) o conexión rechazada (ECONNREFUSED)
      if (error.code === 'ECONNABORTED' || error.code === 'ECONNREFUSED') {
        this.logger.error(
          `Timeout o conexión rechazada al servicio de Vehículos: ${error.code}`,
        );
        throw new ServicioNoDisponibleException('Vehículos');
      }
    }

    this.logger.error(
      `Error inesperado al consultar vehículo ${vehicleId}`,
      error,
    );
    throw error;
  }
}
