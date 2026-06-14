import { CreateVehiculoDto } from "./vehiculos/dto/create-vehiculo.dto";
import { Vehiculo } from "./vehiculos/entities/vehiculo.entity";
import { Auto } from "./vehiculos/entities/auto.entity";
import { Motocicleta } from "./vehiculos/entities/motocicleta.entity";
import { Camioneta } from "./vehiculos/entities/camioneta.entity";
import { BadRequestException } from "@nestjs/common";

export class FactoryVehiculos {
  static crear(dto: CreateVehiculoDto): Vehiculo {
    switch (dto.tipo.toLowerCase()) {
      case 'auto':
        const auto = new Auto();
        Object.assign(auto, dto.datos);
        return auto;
      case 'motocicleta':
        const moto = new Motocicleta();
        Object.assign(moto, dto.datos);
        return moto;
      case 'camioneta':
        const camion = new Camioneta();
        Object.assign(camion, dto.datos);
        return camion;
      default:
        throw new BadRequestException(`Tipo de vehículo no soportado: ${dto.tipo}`);
    }
  }

  

}