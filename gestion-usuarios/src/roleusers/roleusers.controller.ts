import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RoleusersService } from './roleusers.service';
import { CreateRoleuserDto } from './dto/create-roleuser.dto';
import { UpdateRoleuserDto } from './dto/update-roleuser.dto';

@Controller('roleusers')
export class RoleusersController {
  constructor(private readonly roleusersService: RoleusersService) {}

  @Post()
  create(@Body() createRoleuserDto: CreateRoleuserDto) {
    return this.roleusersService.create(createRoleuserDto);
  }

  @Get()
  findAll() {
    return this.roleusersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roleusersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoleuserDto: UpdateRoleuserDto) {
    return this.roleusersService.update(+id, updateRoleuserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roleusersService.remove(+id);
  }
}
