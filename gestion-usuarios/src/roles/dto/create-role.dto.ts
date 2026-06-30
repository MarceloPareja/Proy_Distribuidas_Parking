import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SanitizeHtml } from '../../common/transformers/sanitize.transformer';
import { RoleName } from '../enums/role-name.enum';

export class CreateRoleDto {

  @ApiPropertyOptional({
    description: 'Descripción del rol',
    example: 'Rol con permisos de administración del sistema',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'La descripción no puede tener más de 255 caracteres' })
  @SanitizeHtml()
  description?: string;

  @ApiProperty({
    description: 'Nombre del rol (debe ser un valor del enum RoleName)',
    example: 'ADMIN',
    enum: RoleName,
  })
  @IsEnum(RoleName, {
    message: `El rol debe ser uno de los siguientes valores: ${Object.values(RoleName).join(', ')}`,
  })
  name!: RoleName;
}