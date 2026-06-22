import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { VehiculosService } from './vehiculos.service';
import { CreateVehiculoDto } from './dto/create-vehiculo.dto';
import { UpdateAutoDto, UpdateCamionetaDto, UpdateMotocicletaDto, UpdateVehiculoDto, UpdateVehiculoPipe } from './dto/update-vehiculo.dto';
import { UUID } from 'node:crypto';
import { ApiOperation, ApiResponse, ApiBadRequestResponse, ApiConflictResponse, ApiNotFoundResponse, ApiExtraModels, ApiParam } from '@nestjs/swagger';
import { Vehiculo } from './entities/vehiculo.entity';


@Controller('vehiculos')
export class VehiculosController {
  constructor(private readonly vehiculosService: VehiculosService) { }

  @ApiOperation({ summary: 'Crear un nuevo vehículo' })
  @ApiResponse({ status: 201, description: 'Vehículo creado exitosamente.' })
  @ApiBadRequestResponse({ description: 'Datos de entrada inválidos.' })
  @ApiConflictResponse({ description: 'La placa ya existe.' })
  @Post()
  create(@Body() createVehiculoDto: CreateVehiculoDto) {
    return this.vehiculosService.create(createVehiculoDto);
  }

  @ApiOperation({ summary: 'Retorna una lista de vehículos' })
  @ApiResponse({ status: 200, description: 'Lista de vehículos retornada exitosamente.', type: [Vehiculo] })
  @Get()
  findAll() {
    return this.vehiculosService.findAll();
  }

  @ApiOperation({ summary: 'Busca un vehículo por Id' })
  @ApiResponse({ status: 200, description: 'Vehículo encontrado exitosamente.', type: Vehiculo })
  @ApiNotFoundResponse({ description: 'Vehículo no encontrado.' })
  @ApiParam({ name: 'id', description: 'UUID del vehículo a buscar', example: '123e4567-e89b-12d3-a456-426614174000' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vehiculosService.findOne(id);
  }

  //Endpoint clave para integraciones externas (sistema de tickets, LPR):
  //consulta por placa, no por UUID interno.
  @ApiOperation({ summary: 'Busca un vehículo por placa' })
  @ApiResponse({ status: 200, description: 'Vehículo encontrado exitosamente.', type: Vehiculo })
  @ApiNotFoundResponse({ description: 'Vehículo no encontrado.' })
  @ApiParam({ name: 'placa', description: 'Placa del vehículo a buscar', example: 'ABC-1234' })
  @Get('placa/:placa')
  findByPlaca(@Param('placa') placa: string) {
    return this.vehiculosService.findByPlaca(placa);
  }

  //Vehículos asociados a una persona (gestion-usuarios), ej. "mis vehículos".
  @ApiOperation({ summary: 'Busca vehículos por Id de propietario' })
  @ApiResponse({ status: 200, description: 'Vehículos encontrados exitosamente.', type: Vehiculo, isArray: true })
  @ApiNotFoundResponse({ description: 'No se encontraron vehículos para el propietario.' })
  @ApiParam({ name: 'idPropietario', description: 'ID del propietario', example: '123e4567-e89b-12d3-a456-426614174000' })
  @Get('propietario/:idPropietario')
  findByPropietario(@Param('idPropietario') idPropietario: string) {
    return this.vehiculosService.findByPropietario(idPropietario);
  }

  @ApiOperation({summary: 'Actualiza un vehículo por Id'})
  @ApiNotFoundResponse({ description: 'Vehículo no encontrado.' })
  @ApiBadRequestResponse({ description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 200, description: 'Vehículo actualizado exitosamente.', type: Vehiculo })
  @ApiExtraModels(UpdateAutoDto, UpdateMotocicletaDto, UpdateCamionetaDto)
  @ApiParam({ name: 'id', description: 'UUID del vehículo a actualizar', example: '123e4567-e89b-12d3-a456-426614174000' })
  @Patch(':id')
  update(@Param('id') id: string, @Body(UpdateVehiculoPipe) updateVehiculoDto: UpdateVehiculoDto) {
    return this.vehiculosService.update(id, updateVehiculoDto);
  }

  //Revierte la baja lógica (DELETE). Opcionalmente reasigna propietario,
  //ej. el vehículo fue vendido y vuelve a operar con otro dueño.
  @ApiOperation({summary: 'Reactivar un vehículo dado su Id'})
  @ApiNotFoundResponse({ description: 'Vehículo no encontrado.' })
  @ApiBadRequestResponse({ description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 200, description: 'Vehículo reactivado exitosamente.', type: Vehiculo })
  @ApiParam({ name: 'id', description: 'UUID del vehículo a reactivar', example: '123e4567-e89b-12d3-a456-426614174000' })
  @Patch(':id/reactivar')
  reactivar(@Param('id') id: string, @Body('idPropietario') idPropietario?: string) {
    return this.vehiculosService.reactivar(id, idPropietario);
  }

  @ApiOperation({summary: 'Elimina un vehículo por Id'})
  @ApiNotFoundResponse({ description: 'Vehículo no encontrado.' })
  @ApiResponse({ status: 200, description: 'Vehículo eliminado exitosamente.'})
  @ApiParam({ name: 'id', description: 'UUID del vehículo a eliminar', example: '123e4567-e89b-12d3-a456-426614174000' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vehiculosService.remove(id);
  }
}
