import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleName } from './enums/role-name.enum';

@ApiTags('Roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear rol', description: 'Registra un nuevo rol en el sistema. Solo acepta valores del enum RoleName.' })
  @ApiResponse({ status: 201, description: 'Rol creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos o rol no pertenece al enum' })
  @ApiResponse({ status: 409, description: 'Ya existe un rol con ese nombre' })
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar roles', description: 'Obtiene la lista de todos los roles del sistema' })
  @ApiResponse({ status: 200, description: 'Lista de roles obtenida exitosamente' })
  findAll() {
    return this.rolesService.findAll();
  }

  @Get('available')
  @ApiOperation({ summary: 'Listar roles disponibles del enum', description: 'Devuelve los valores válidos del enum RoleName' })
  @ApiResponse({ status: 200, description: 'Lista de roles disponibles del enum' })
  getAvailableRoles() {
    return this.rolesService.getAvailableRoles();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener rol por ID', description: 'Busca un rol por su identificador UUID' })
  @ApiParam({ name: 'id', description: 'UUID del rol', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  @ApiResponse({ status: 200, description: 'Rol encontrado' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.rolesService.findOne(id);
  }

  @Get('/name/:name')
  @ApiOperation({ summary: 'Obtener rol por nombre', description: 'Busca un rol por su nombre (valor del enum)' })
  @ApiParam({ name: 'name', description: 'Nombre del rol (enum)', example: 'ADMIN', enum: RoleName })
  @ApiResponse({ status: 200, description: 'Rol encontrado' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  findByName(@Param('name') name: RoleName){
    return this.rolesService.findByName(name);
  }

  @Patch('/activate/:id')
  @ApiOperation({ summary: 'Activar rol', description: 'Activa un rol previamente desactivado' })
  @ApiParam({ name: 'id', description: 'UUID del rol a activar', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  @ApiResponse({ status: 200, description: 'Rol activado exitosamente' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  activate(@Param('id') id: string) {
    return this.rolesService.activate(id);
  }

  @Patch('/deactivate/:id')
  @ApiOperation({ summary: 'Desactivar rol', description: 'Desactiva un rol (borrado lógico)' })
  @ApiParam({ name: 'id', description: 'UUID del rol a desactivar', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  @ApiResponse({ status: 200, description: 'Rol desactivado exitosamente' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  deactivate(@Param('id') id: string) {
    return this.rolesService.deactivate(id);
  }
  

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar rol', description: 'Actualiza los datos de un rol existente' })
  @ApiParam({ name: 'id', description: 'UUID del rol a actualizar', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  @ApiResponse({ status: 200, description: 'Rol actualizado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar rol', description: 'Elimina un rol del sistema de forma permanente' })
  @ApiParam({ name: 'id', description: 'UUID del rol a eliminar', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  @ApiResponse({ status: 200, description: 'Rol eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.rolesService.remove(id);
  }
}
