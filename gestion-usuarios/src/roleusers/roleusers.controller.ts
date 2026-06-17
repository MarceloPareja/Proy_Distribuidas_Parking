import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { RoleusersService } from './roleusers.service';
import { CreateRoleuserDto } from './dto/create-roleuser.dto';
import { UpdateRoleuserDto } from './dto/update-roleuser.dto';

@Controller('roleusers')
export class RoleusersController {
  constructor(private readonly roleusersService: RoleusersService) {}

  // POST /roleusers  { id_user, id_role, active? }
  @Post()
  create(@Body() createRoleuserDto: CreateRoleuserDto) {
    return this.roleusersService.create(createRoleuserDto);
  }

  // GET /roleusers
  @Get()
  findAll() {
    return this.roleusersService.findAll();
  }

  // GET /roleusers/user/:id_user  — todas las asignaciones de un usuario
  @Get('user/:id_user')
  findByUser(@Param('id_user', ParseUUIDPipe) id_user: string) {
    return this.roleusersService.findByUser(id_user);
  }

  @Get('role/:role_name')
  findByRole(@Param('role_name', ParseUUIDPipe) role_name: string) {
    return this.roleusersService.findByRole(role_name);
  }

  // GET /roleusers/:id_user/:id_role  — una asignación específica
  @Get(':id_user/:id_role')
  findOne(
    @Param('id_user', ParseUUIDPipe) id_user: string,
    @Param('id_role', ParseUUIDPipe) id_role: string,
  ) {
    return this.roleusersService.findOne(id_user, id_role);
  }

  // PATCH /roleusers/:id_user/:id_role  { active: boolean }
  @Patch('/activate/:id_user/:id_role')
  activate(
    @Param('id_user', ParseUUIDPipe) id_user: string,
    @Param('id_role', ParseUUIDPipe) id_role: string
  ) {
    return this.roleusersService.activate(id_user, id_role);
  }

  @Patch('/deactivate/:id_user/:id_role')
  deactivate(
    @Param('id_user', ParseUUIDPipe) id_user: string,
    @Param('id_role', ParseUUIDPipe) id_role: string,
  ) {
    return this.roleusersService.deactivate(id_user, id_role);
  }

  // DELETE /roleusers/:id_user/:id_role
  @Delete(':id_user/:id_role')
  remove(
    @Param('id_user', ParseUUIDPipe) id_user: string,
    @Param('id_role', ParseUUIDPipe) id_role: string,
  ) {
    return this.roleusersService.remove(id_user, id_role);
  }
}
