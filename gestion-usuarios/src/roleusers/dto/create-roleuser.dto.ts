import {
  IsNotEmpty, IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength
} from 'class-validator';

export class CreateRoleuserDto {
  @IsUUID('4', { message: 'id_user debe ser un UUID v4 válido' })
  @IsNotEmpty({ message: 'El id de usuario es obligatorio' })
  id_user!: string;

  @IsString()
    @IsNotEmpty({ message: 'El nombre del rol es obligatorio' })
    @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
    @MaxLength(50, { message: 'El nombre no puede tener más de 50 caracteres' })
    @Matches(/^[A-Za-z_]+$/, {
      message:
        'El nombre del rol solo puede contener letras y guiones bajos',
    })
  role_name!: string;

  // @IsOptional()
  // @IsBoolean({ message: 'active debe ser un valor booleano' })
  // active?: boolean;
}

