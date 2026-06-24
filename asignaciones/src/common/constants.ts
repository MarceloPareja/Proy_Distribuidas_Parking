/**
 * Constantes compartidas del microservicio.
 */
export const KONG_ROUTES = {
  USUARIOS: '/api/usuarios',
  VEHICULOS: '/api/vehiculos',
  GATEWAY: '/api/gateway',
} as const;

/** Puerto por defecto del microservicio */
export const DEFAULT_PORT = 3002;
