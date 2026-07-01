import { RoleName } from '../../roles/enums/role-name.enum';
import { endpointPermission } from '../entities/endpointPermission.entity';

export class EndpointPermissionRepository {
  private readonly permissions: endpointPermission[] = [
    // Autenticación y registro
    { path: '/auth/login', method: 'POST', allowedRoles: [RoleName.CLIENTE] },
    { path: '/personas', method: 'POST', allowedRoles: [RoleName.CLIENTE] },

    // Zonas y espacios
    { path: '/api/v1/zonas/', method: 'GET', allowedRoles: [RoleName.CLIENTE, RoleName.ADMIN] },
    { path: '/api/v1/zonas/desocupadas', method: 'GET', allowedRoles: [RoleName.ADMIN] },
    { path: '/api/v1/zonas/tipo/:tipo', method: 'GET', allowedRoles: [RoleName.ADMIN] },
    { path: '/api/v1/zonas/', method: 'POST', allowedRoles: [RoleName.ADMIN] },
    { path: '/api/v1/zonas/:idZona', method: 'PUT', allowedRoles: [RoleName.ADMIN] },
    { path: '/api/v1/zonas/:idZona', method: 'PATCH', allowedRoles: [RoleName.ADMIN] },

    { path: '/api/v1/espacios/', method: 'GET', allowedRoles: [RoleName.CLIENTE, RoleName.ADMIN] },
    { path: '/api/v1/espacios/estado', method: 'GET', allowedRoles: [RoleName.ADMIN] },
    { path: '/api/v1/espacios/zona-estado', method: 'GET', allowedRoles: [RoleName.ADMIN] },
    { path: '/api/v1/espacios/tipo/:tipo', method: 'GET', allowedRoles: [RoleName.ADMIN] },
    { path: '/api/v1/espacios/zona/:idZona/tipo/:tipo', method: 'GET', allowedRoles: [RoleName.ADMIN] },
    { path: '/api/v1/espacios/zona/:idZona', method: 'GET', allowedRoles: [RoleName.ADMIN] },
    { path: '/api/v1/espacios/', method: 'POST', allowedRoles: [RoleName.ADMIN] },
    { path: '/api/v1/espacios/:idEspacio', method: 'PUT', allowedRoles: [RoleName.ADMIN] },
    { path: '/api/v1/espacios/:idEspacio', method: 'DELETE', allowedRoles: [RoleName.ADMIN] },
    { path: '/api/v1/espacios/:idEspacio', method: 'POST', allowedRoles: [RoleName.ADMIN] },

    // Gestión de vehículos
    { path: '/vehiculos', method: 'POST', allowedRoles: [RoleName.CLIENTE, RoleName.ADMIN] },
    { path: '/vehiculos', method: 'GET', allowedRoles: [RoleName.CLIENTE, RoleName.ADMIN] },
    { path: '/vehiculos/:id', method: 'GET', allowedRoles: [RoleName.CLIENTE, RoleName.ADMIN] },
    { path: '/vehiculos/placa/:placa', method: 'GET', allowedRoles: [RoleName.CLIENTE, RoleName.ADMIN] },
    { path: '/vehiculos/propietario/:idPropietario', method: 'GET', allowedRoles: [RoleName.CLIENTE, RoleName.ADMIN] },
    { path: '/vehiculos/:id', method: 'PATCH', allowedRoles: [RoleName.CLIENTE, RoleName.ADMIN] },
    { path: '/vehiculos/:id/reactivar', method: 'PATCH', allowedRoles: [RoleName.CLIENTE, RoleName.ADMIN] },
    { path: '/vehiculos/:id', method: 'DELETE', allowedRoles: [RoleName.CLIENTE, RoleName.ADMIN] },

    // Personas / datos del usuario
    { path: '/personas', method: 'GET', allowedRoles: [RoleName.ADMIN] },
    { path: '/personas/:id', method: 'GET', allowedRoles: [RoleName.CLIENTE, RoleName.ADMIN] },
    { path: '/personas/dni/:dni', method: 'GET', allowedRoles: [RoleName.CLIENTE, RoleName.ADMIN] },
    { path: '/personas/:id', method: 'PATCH', allowedRoles: [RoleName.CLIENTE, RoleName.ADMIN] },
    { path: '/personas/activate/:id', method: 'PATCH', allowedRoles: [RoleName.ADMIN] },
    { path: '/personas/deactivate/:id', method: 'PATCH', allowedRoles: [RoleName.ADMIN] },

    // Roles y usuarios
    { path: '/roles', method: 'POST', allowedRoles: [RoleName.ADMIN] },
    { path: '/roles', method: 'GET', allowedRoles: [RoleName.ADMIN] },
    { path: '/roles/available', method: 'GET', allowedRoles: [RoleName.ADMIN] },
    { path: '/roles/:id', method: 'GET', allowedRoles: [RoleName.ADMIN] },
    { path: '/roles/name/:name', method: 'GET', allowedRoles: [RoleName.ADMIN] },
    { path: '/roles/activate/:id', method: 'PATCH', allowedRoles: [RoleName.ADMIN] },
    { path: '/roles/deactivate/:id', method: 'PATCH', allowedRoles: [RoleName.ADMIN] },
    { path: '/roles/:id', method: 'PATCH', allowedRoles: [RoleName.ADMIN] },
    { path: '/roles/:id', method: 'DELETE', allowedRoles: [RoleName.ADMIN] },

    { path: '/users', method: 'GET', allowedRoles: [RoleName.ADMIN] },
    { path: '/users/:id', method: 'GET', allowedRoles: [RoleName.ADMIN] },
    { path: '/users/username/:username', method: 'GET', allowedRoles: [RoleName.ADMIN] },
    { path: '/users/:id', method: 'PATCH', allowedRoles: [RoleName.ADMIN] },
    { path: '/users/activate/:id', method: 'PATCH', allowedRoles: [RoleName.ADMIN] },
    { path: '/users/deactivate/:id', method: 'PATCH', allowedRoles: [RoleName.ADMIN] },

    // Asignaciones de roles
    { path: '/roleusers', method: 'POST', allowedRoles: [RoleName.ADMIN] },
    { path: '/roleusers', method: 'GET', allowedRoles: [RoleName.ADMIN] },
    { path: '/roleusers/user/:id_user', method: 'GET', allowedRoles: [RoleName.ADMIN] },
    { path: '/roleusers/role/:role_name', method: 'GET', allowedRoles: [RoleName.ADMIN] },
    { path: '/roleusers/:id_user/:id_role', method: 'GET', allowedRoles: [RoleName.ADMIN] },
    { path: '/roleusers/activate/:id_user/:id_role', method: 'PATCH', allowedRoles: [RoleName.ADMIN] },
    { path: '/roleusers/deactivate/:id_user/:id_role', method: 'PATCH', allowedRoles: [RoleName.ADMIN] },
    { path: '/roleusers/:id_user/:id_role', method: 'DELETE', allowedRoles: [RoleName.ADMIN] },

    // Recaudador
    { path: '/tickets', method: 'POST', allowedRoles: [RoleName.RECAUDADOR] },
    { path: '/tickets/:id/cobrar', method: 'PATCH', allowedRoles: [RoleName.RECAUDADOR] },

    // Root
    { path: '/roles/:id', method: 'DELETE', allowedRoles: [RoleName.ROOT] },
    { path: '/users/:id', method: 'DELETE', allowedRoles: [RoleName.ROOT] },
    { path: '/roleusers/:id_user/:id_role', method: 'DELETE', allowedRoles: [RoleName.ROOT] },
  ];

  async find(options: { where: { path: string; method: string } }): Promise<endpointPermission | undefined> {
    const requestedPath = this.normalizePath(options.where.path);
    const requestedMethod = options.where.method.toUpperCase();

    return this.permissions.find((permission) => {
      const permissionMethod = permission.method.toUpperCase();
      return permissionMethod === requestedMethod && this.matchesPath(permission.path, requestedPath);
    });
  }

  private matchesPath(permissionPath: string, requestedPath: string): boolean {
    const left = this.normalizePath(permissionPath).split('/');
    const right = this.normalizePath(requestedPath).split('/');

    if (left.length !== right.length) {
      return false;
    }

    return left.every((segment, index) => {
      if (!segment) {
        return true;
      }

      if (segment.startsWith(':') || (segment.startsWith('{') && segment.endsWith('}'))) {
        return true;
      }

      return segment === right[index];
    });
  }

  private normalizePath(path: string): string {
    const withoutQuery = path.split('?')[0];
    const trimmed = withoutQuery.trim();
    return trimmed === '' ? '/' : trimmed.replace(/\/+$/, '');
  }
}
