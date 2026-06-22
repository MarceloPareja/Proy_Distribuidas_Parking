import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { VehiculosService } from './vehiculos.service';
import { VehiculosController } from './vehiculos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vehiculo } from './entities/vehiculo.entity';
import { Auto } from './entities/auto.entity';
import { Motocicleta } from './entities/motocicleta.entity';
import { Camioneta } from './entities/camioneta.entity';
import { PersonasClientService } from './personas-client.service';

@Module({
  imports: [TypeOrmModule.forFeature([Vehiculo, Auto, Motocicleta, Camioneta]), HttpModule],
  controllers: [VehiculosController],
  providers: [VehiculosService, PersonasClientService],
  exports: [VehiculosService],
})
export class VehiculosModule {}