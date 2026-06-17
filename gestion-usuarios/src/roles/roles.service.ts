import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RoleDeactivatedEvent } from './roles.events';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private eventEmitter : EventEmitter2
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const existing = await this.roleRepository.findOne({
      where: { name: createRoleDto.name },
    });
    if (existing) {
      throw new ConflictException(
        `El rol "${createRoleDto.name}" ya existe`,
      );
    }

    const role = this.roleRepository.create({
      name: createRoleDto.name,
      description: createRoleDto.description
    });
    role.active = true;
    role.created_at = new Date();

    return this.roleRepository.save(role);
  }

  async findAll(): Promise<Role[]> {
    return this.roleRepository.find({ relations: { userRoles: true } });
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: { userRoles: true },
    });
    if (!role) {
      throw new NotFoundException(`Rol con id "${id}" no encontrado`);
    }
    return role;
  }

  async findByName(name: string): Promise<Role | null> {
    return this.roleRepository.findOne({ where: { name } });
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);

    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const exists = await this.roleRepository.findOne({
        where: { name: updateRoleDto.name },
      });
      if (exists) {
        throw new ConflictException(
          `El rol "${updateRoleDto.name}" ya existe`,
        );
      }
    }
    role.updated_at = new Date();

    Object.assign(role, updateRoleDto);

    if(updateRoleDto.active === false){
      this.eventEmitter.emit(RoleDeactivatedEvent.name, new RoleDeactivatedEvent(role.id));
    }
    return this.roleRepository.save(role);
  }

  async remove(id: string): Promise<{ message: string }> {
    const role = await this.findOne(id);
    await this.roleRepository.remove(role);
    return { message: `Rol con id "${id}" eliminado correctamente` };
  }
}
