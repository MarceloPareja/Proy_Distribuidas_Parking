import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CreateRoleuserDto {
  @IsUUID('4', { message: 'id_user debe ser un UUID v4 válido' })
  @IsNotEmpty({ message: 'El id de usuario es obligatorio' })
  id_user!: string;

  @IsUUID('4', { message: 'id_role debe ser un UUID v4 válido' })
  @IsNotEmpty({ message: 'El id de rol es obligatorio' })
  id_role!: string;

  @IsOptional()
  @IsBoolean({ message: 'active debe ser un valor booleano' })
  active?: boolean;
}

