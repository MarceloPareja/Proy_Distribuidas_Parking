import {
  IsEnum,
  IsNotEmpty,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RoleName } from '../../roles/enums/role-name.enum';

export class CreateRoleuserDto {
  @ApiProperty({
    description: 'UUID v4 del usuario al que se asigna el rol',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @IsUUID('4', { message: 'id_user debe ser un UUID v4 válido' })
  @IsNotEmpty({ message: 'El id de usuario es obligatorio' })
  id_user!: string;

  @ApiProperty({
    description: 'Nombre del rol a asignar (debe ser un valor del enum RoleName)',
    example: 'ADMIN',
    enum: RoleName,
  })
  @IsEnum(RoleName, {
    message: `El rol debe ser uno de los siguientes valores: ${Object.values(RoleName).join(', ')}`,
  })
  @IsNotEmpty({ message: 'El nombre del rol es obligatorio' })
  role_name!: RoleName;
}