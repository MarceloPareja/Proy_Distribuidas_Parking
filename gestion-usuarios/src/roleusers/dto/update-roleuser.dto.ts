import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateRoleuserDto {
  @IsNotEmpty({ message: 'El campo active es obligatorio para actualizar' })
  @IsBoolean({ message: 'active debe ser un valor booleano' })
  active!: boolean;
}

