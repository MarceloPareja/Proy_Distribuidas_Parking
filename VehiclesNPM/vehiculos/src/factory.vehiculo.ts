import { CreateVehiculoDto } from "./vehiculos/dto/create-vehiculo.dto";
import { Vehiculo } from "./vehiculos/entities/vehiculo.entity";
import { Auto } from "./vehiculos/entities/auto.entity";
import { Motocicleta } from "./vehiculos/entities/motocicleta.entity";
import { Camioneta } from "./vehiculos/entities/camioneta.entity";
import { BadRequestException } from "@nestjs/common";

export class FactoryVehiculos {
  static crear(dto: CreateVehiculoDto): Vehiculo {
    let vehiculo: Vehiculo;
    switch (dto.tipo.toLowerCase()) {
      case 'auto':
        vehiculo = new Auto();
        Object.assign(vehiculo, dto.datos);
        break;
      case 'motocicleta':
        vehiculo = new Motocicleta();
        Object.assign(vehiculo, dto.datos);
        break;
      case 'camioneta':
        vehiculo = new Camioneta();
        Object.assign(vehiculo, dto.datos);
        break;
      default:
        throw new BadRequestException(`Tipo de vehículo no soportado: ${dto.tipo}`);
    }
    vehiculo.idPropietario = dto.idPropietario ?? null;
    return vehiculo;
  }

}