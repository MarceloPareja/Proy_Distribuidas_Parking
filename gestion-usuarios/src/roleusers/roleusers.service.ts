import { Injectable } from '@nestjs/common';
import { CreateRoleuserDto } from './dto/create-roleuser.dto';
import { UpdateRoleuserDto } from './dto/update-roleuser.dto';

@Injectable()
export class RoleusersService {
  create(createRoleuserDto: CreateRoleuserDto) {
    return 'This action adds a new roleuser';
  }

  findAll() {
    return `This action returns all roleusers`;
  }

  findOne(id: number) {
    return `This action returns a #${id} roleuser`;
  }

  update(id: number, updateRoleuserDto: UpdateRoleuserDto) {
    return `This action updates a #${id} roleuser`;
  }

  remove(id: number) {
    return `This action removes a #${id} roleuser`;
  }
}
