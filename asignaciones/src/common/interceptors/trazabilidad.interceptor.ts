import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { TrazabilidadService } from '../../trazabilidad/trazabilidad.service';
import { TipoAccion } from '../../trazabilidad/entities/evento-auditoria.entity';

/**
 * TrazabilidadInterceptor — FASE 3 (RF2)
 *
 * Interceptor de NestJS que registra automáticamente eventos de auditoría
 * para cada operación CRUD ejecutada sobre AsignacionesController.
 *
 * ═══════════════════════════════════════════════════════════════════════
 * ¿Por qué un Interceptor y no AOP manual o eventos de dominio?
 * ═══════════════════════════════════════════════════════════════════════
 *
 * VENTAJAS frente a AOP manual:
 *   1. Es declarativo: se aplica con @UseInterceptors() sin tocar la lógica
 *      de negocio del controller ni del service.
 *   2. NestJS lo integra nativamente en el pipeline de request/response,
 *      lo cual garantiza acceso al contexto HTTP y al resultado de la operación.
 *   3. Reutilizable: se puede aplicar a cualquier controller con una línea.
 *   4. Testable: se puede instanciar aisladamente con mocks de TrazabilidadService.
 *
 * VENTAJAS frente a eventos de dominio:
 *   1. No requiere infraestructura adicional (EventEmitter, bus de mensajes).
 *   2. El interceptor tiene acceso directo al request HTTP (método, params, body)
 *      Y al response (resultado de la operación), todo en un solo lugar.
 *   3. En un microservicio pequeño como este, un sistema de eventos sería
 *      over-engineering innecesario.
 *
 * LIMITACIONES:
 *   1. El interceptor NO tiene acceso directo al "dato anterior" cuando el
 *      controller solo devuelve el dato ya modificado. Para resolverlo:
 *      → El AsignacionesService carga el estado previo ANTES de mutar y lo
 *        adjunta al objeto request como `req['__datosAnteriores']`.
 *      → El interceptor lee ese valor del request context.
 *      → Alternativa: inyectar el servicio de Asignaciones directamente en
 *        el interceptor y hacer la consulta aquí, pero eso acoplaría el
 *        interceptor al dominio y duplicaría queries.
 *   2. Si el controller lanza una excepción, el interceptor no registra
 *      el evento (porque tap() solo se ejecuta en caso de éxito).
 *      → Esto es intencional: solo se auditan cambios que realmente ocurrieron.
 *
 * ═══════════════════════════════════════════════════════════════════════
 * MECANISMO DE AISLAMIENTO (fire-and-forget)
 * ═══════════════════════════════════════════════════════════════════════
 *
 * La persistencia del evento se ejecuta de forma asíncrona NO bloqueante:
 *   1. Se llama a `trazabilidadService.registrar()` sin `await`.
 *   2. Se encadena `.catch()` para atrapar cualquier error sin propagarlo.
 *   3. Internamente, el TrazabilidadService también tiene try/catch.
 *
 * Resultado: la respuesta al cliente se envía ANTES de que la auditoría
 * termine de persistirse, y un fallo en la auditoría JAMÁS rompe la
 * respuesta al cliente.
 */
@Injectable()
export class TrazabilidadInterceptor implements NestInterceptor {
  private readonly logger = new Logger(TrazabilidadInterceptor.name);

  constructor(
    private readonly trazabilidadService: TrazabilidadService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const metodo = request.method; // GET, POST, PATCH, DELETE

    return next.handle().pipe(
      tap((resultado) => {
        // Solo auditar métodos que mutan datos
        if (!['POST', 'PATCH', 'DELETE'].includes(metodo)) {
          return;
        }

        try {
          this.registrarEvento(metodo, request, resultado);
        } catch (error) {
          // Seguridad adicional: si registrarEvento() lanza síncronamente,
          // no afecta la respuesta.
          this.logger.error('Error síncrono en registrarEvento', error);
        }
      }),
    );
  }

  /**
   * Determina el tipo de acción, extrae userId/vehicleId del request,
   * y persiste el evento de auditoría de forma desacoplada.
   */
  private registrarEvento(
    metodo: string,
    request: Request,
    resultado: any,
  ): void {
    const tipoAccion = this.mapearTipoAccion(metodo);

    // ─── Extraer userId y vehicleId ───
    // POST: vienen en el body (o en el resultado para batch)
    // PATCH/DELETE: vienen en los params de la URL
    let userId: number;
    let vehicleId: number;

    if (metodo === 'POST') {
      // Para POST individual, el resultado es la asignación creada
      // Para POST batch, no auditamos aquí (cada crear() individual se auditará
      // cuando el service adjunte los datos al request context en futuras iteraciones)
      if (resultado?.exitosas) {
        // Es un batch — auditar cada una individualmente
        for (const asignacion of resultado.exitosas) {
          this.persistirEventoAsincrono({
            userId: asignacion.userId,
            vehicleId: asignacion.vehicleId,
            accion: tipoAccion,
            datosAnteriores: null,
            datosNuevos: this.limpiarDatos(asignacion),
          });
        }
        return;
      }

      userId = resultado?.userId;
      vehicleId = resultado?.vehicleId;
    } else {
      // PATCH o DELETE — los IDs vienen en los params de la URL
      userId = parseInt(request.params.userId, 10);
      vehicleId = parseInt(request.params.vehicleId, 10);
    }

    if (!userId || !vehicleId) {
      this.logger.warn(
        `No se pudo extraer userId/vehicleId del request ${metodo} ${request.url}`,
      );
      return;
    }

    // ─── Obtener datos anteriores del request context ───
    // El service adjunta `req['__datosAnteriores']` ANTES de mutar.
    const datosAnteriores = (request as any)['__datosAnteriores'] ?? null;

    // ─── Datos nuevos: el resultado de la operación ───
    const datosNuevos =
      metodo === 'DELETE' ? null : this.limpiarDatos(resultado);

    this.persistirEventoAsincrono({
      userId,
      vehicleId,
      accion: tipoAccion,
      datosAnteriores: datosAnteriores
        ? this.limpiarDatos(datosAnteriores)
        : null,
      datosNuevos,
    });
  }

  /**
   * Mapea el método HTTP al enum TipoAccion.
   */
  private mapearTipoAccion(metodo: string): TipoAccion {
    switch (metodo) {
      case 'POST':
        return TipoAccion.CREACION;
      case 'PATCH':
        return TipoAccion.MODIFICACION;
      case 'DELETE':
        return TipoAccion.ELIMINACION;
      default:
        return TipoAccion.MODIFICACION;
    }
  }

  /**
   * Persiste el evento de forma asíncrona no bloqueante (fire-and-forget).
   *
   * NO usamos `await` → la respuesta al cliente se envía sin esperar
   * a que la auditoría se persista. `.catch()` atrapa cualquier error.
   */
  private persistirEventoAsincrono(params: {
    userId: number;
    vehicleId: number;
    accion: TipoAccion;
    datosAnteriores: Record<string, any> | null;
    datosNuevos: Record<string, any> | null;
  }): void {
    // Fire-and-forget: no se espera la promesa
    this.trazabilidadService.registrar(params).catch((error) => {
      // Doble seguridad: aunque TrazabilidadService ya tiene try/catch,
      // este catch evita unhandled promise rejection.
      this.logger.error(
        `Error al persistir evento de auditoría (fire-and-forget): ${params.accion}`,
        error,
      );
    });
  }

  /**
   * Limpia un objeto entidad para almacenarlo como JSONB,
   * eliminando propiedades circulares o innecesarias.
   */
  private limpiarDatos(obj: any): Record<string, any> | null {
    if (!obj) return null;

    // Convertir a un objeto plano (elimina métodos, getters, etc.)
    return JSON.parse(JSON.stringify(obj));
  }
}
