import { BadRequestException, Body, ConflictException, Injectable, NotFoundException, Param } from '@nestjs/common';
import { CreateVehiculoDto } from './dto/create-vehiculo.dto';
import { UpdateVehiculoDto } from './dto/update-vehiculo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Vehiculo } from './entities/vehiculo.entity';
import { Repository } from 'typeorm';
import { FactoryVehiculos } from 'src/factory.vehiculo';
import { UUID } from 'crypto';
import { plainToInstance } from 'class-transformer';
import { map } from 'rxjs';
import { notContains, validate } from 'class-validator';

@Injectable()
export class VehiculosService {
  constructor(@InjectRepository(Vehiculo)
    private repositoryVehiculo: Repository<Vehiculo>,){
    }

  async create(createVehiculoDto: CreateVehiculoDto) {
    const existe = await this.repositoryVehiculo.findOne({
      where : {
        placa: createVehiculoDto.datos.placa
      }
    });
    if(existe)
    {
      throw new ConflictException("Ya existe un vehículo con esa placa");
    }

    const vehiculo = FactoryVehiculos.crear(createVehiculoDto);

    return this.repositoryVehiculo.save(vehiculo);

  }

  async findAll() {
    return await this.repositoryVehiculo.find();
  }

  async findOne(id: string) {
    const existe = await this.repositoryVehiculo.findOne(
      {
        where : {
          id : id
        }
      }
    );

    if(!existe){
      throw new NotFoundException("Vehiculo no encontrado");
    }
    return existe;
  }

  async update(id: string, dto : UpdateVehiculoDto) {
    const objVehiculo = await this.findOne(id);
    const tipo = objVehiculo.obtenerTipo().toLowerCase();

    Object.assign(objVehiculo, dto);

    return this.repositoryVehiculo.save(objVehiculo);
    
    
  }
  remove(id: number) {
    return `This action removes a #${id} vehiculo`;
  }
}
