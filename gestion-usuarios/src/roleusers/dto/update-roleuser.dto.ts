import { PartialType } from '@nestjs/mapped-types';
import { CreateRoleuserDto } from './create-roleuser.dto';

export class UpdateRoleuserDto extends PartialType(CreateRoleuserDto) {}
