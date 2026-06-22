import { OmitType, PartialType } from '@nestjs/mapped-types';
import { AutoDto, BaseVehiculoDto, CamionetaDto, CreateVehiculoDto, MotocicletaDto } from './create-vehiculo.dto';
import { IsInt, IsNotEmpty, IsNumber, IsString, Matches, Max, MaxLength, Min, MinLength, IsIn, ValidateNested, Validate, IsEmpty, IsEnum, IsOptional, IsUUID } from "class-validator";
import { MaxYearConstraint } from '../utils/validators';
import { Clasificacion } from '../entities/vehiculo.entity';
import { Type } from 'class-transformer';
import { Motocicleta, TipoMoto } from '../entities/motocicleta.entity';


// update-vehiculo.pipe.ts
import { ArgumentMetadata, BadRequestException, Inject, Injectable, NotFoundException, PipeTransform } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { VehiculosService } from '../vehiculos.service';
import { REQUEST } from '@nestjs/core';
import { ApiProperty } from 'node_modules/@nestjs/swagger/dist/decorators/api-property.decorator';
import { ApiExtraModels } from '@nestjs/swagger';

@Injectable()
export class UpdateVehiculoPipe implements PipeTransform {
  constructor(@Inject(REQUEST) private readonly request: any,
  private readonly vehiculosService: VehiculosService) {}

  async transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body') return value; // Solo actúa sobre el body

    // 1. Obtiene el id desde el contexto (se inyecta aparte, ver controlador)
    const id = this.request.params.id;
    if (!id) throw new BadRequestException('Falta el ID del vehículo');

    // 2. Consulta el vehículo en la BD para obtener su tipo
    const vehiculo = await this.vehiculosService.findOne(id);

    // 3. Selecciona el DTO correcto según el tipo almacenado en BD
    const dtoMap = {
      auto:        UpdateAutoDto,
      motocicleta: UpdateMotocicletaDto,
      camioneta:   UpdateCamionetaDto,
    };

    const tipo = vehiculo.obtenerTipo().toLowerCase();
    const DtoClass = dtoMap[tipo];
    if (!DtoClass) throw new BadRequestException(`Tipo de vehículo desconocido: ${tipo}`);

    // 4. Valida el body contra el DTO correcto
    const dtoInstance = plainToInstance(DtoClass, value);
    const errors = await validate(dtoInstance, { whitelist: true });

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return dtoInstance;
  }
}




export abstract class UpdateVehiculoDto extends PartialType(OmitType(BaseVehiculoDto, ['placa'] as const)){
    //Omite la placa
    @ApiProperty()
    @IsEmpty({message : "La placa no se puede modificar"})
    placa! : string;

    @ApiProperty()
    @IsEmpty({message : "No se puede cambiar la marca"})
    declare marca?: string;

    @ApiProperty()
    @IsEmpty({message : "No se puede cambiar el modelo"})
    declare modelo?: string;

    @ApiProperty()
    @IsEmpty({ message: "No se puede cambiar el año" })
    declare anio?: number;

    // Reasignación de propietario (ej. venta del vehículo a otra persona).
    // Se valida su existencia en gestion-usuarios en VehiculosService.update().
    @IsOptional()
    @IsUUID()
    idPropietario?: string;

}

//Recicla la estructura pero mantiene la herencia

export class UpdateAutoDto extends UpdateVehiculoDto{
    @ApiProperty()
    @IsOptional()
    @IsNumber()
    @IsInt()
    @Min(2)
    @Max(5)
    numeroPuertas! : number;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    @IsNotEmpty()
    @IsInt()
    @Min(150)
    @Max(800)
    capacidadMaletero! : number;
}

export class UpdateMotocicletaDto extends UpdateVehiculoDto{
    @ApiProperty()
    @IsOptional()
    @IsEnum(TipoMoto, {message : "La moto debe ser de tipo: 'Deportiva', 'Scooter' o 'Motocross'"})
    tipoMoto! : TipoMoto;
}

export class UpdateCamionetaDto extends UpdateVehiculoDto{
    @ApiProperty()
    @IsOptional()
    @IsString()
    @Matches(/^(\bsimple\b|\bdoble\b)$/, {message : "La camioneta solo puede ser 'simple' o 'doble'"})
    cabina! : string;
    
    @ApiProperty()
    @IsOptional()
    @IsNumber()
    @IsInt()
    @Min(450)
    @Max(1360)
    capacidadCarga! : number;
}

