import { EndpointPermissionRepository } from './endpointPermissions.repository';
import { RoleName } from '../../roles/enums/role-name.enum';

describe('EndpointPermissionRepository', () => {
  it('debe devolver permisos para login con rol cliente', async () => {
    const repository = new EndpointPermissionRepository();

    const result = await repository.find({
      where: { path: '/auth/login', method: 'POST' },
    });

    expect(result).toBeDefined();
    expect(result?.allowedRoles).toContain(RoleName.CLIENTE);
  });
});
