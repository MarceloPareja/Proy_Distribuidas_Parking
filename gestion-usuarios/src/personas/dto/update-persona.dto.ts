import { OmitType, PartialType } from '@nestjs/mapped-types';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { CreatePersonaDto } from './create-persona.dto';

export class UpdatePersonaDto extends PartialType(OmitType(CreatePersonaDto, ['dni'] as const)) {
  //Excluye el campo de DNI y ahora permite cambiar el activo

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

