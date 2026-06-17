import { OmitType, PartialType } from '@nestjs/mapped-types';
import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ['id_person'] as const)){
  //No permite cambiar el ID
  
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsDateString({}, { message: 'last_login debe ser una fecha válida' })
  last_login?: string;
}
