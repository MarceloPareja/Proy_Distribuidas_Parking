import { ConflictException, Injectable } from '@nestjs/common';
import { VehiculosService } from '../vehiculos/vehiculos.service';
import { IngresoDto } from './dto/ingreso.dto';
import { SalidaDto } from './dto/salida.dto';
import { RegistroEIngresoDto } from './dto/registro-e-ingreso.dto';
import { ZonasClientService } from './zonas-client.service';

@Injectable()
export class GatewayService {
  constructor(
    private readonly vehiculosService: VehiculosService,
    private readonly zonasClient: ZonasClientService,
  ) {}

  // Consulta de "preflight" que hace el sistema de tickets antes de
  // decidir si pide registrar el vehículo o si ya puede pedir el ingreso.
  async consultarVehiculo(placa: string) {
    const vehiculo = await this.vehiculosService.findByPlacaOpcional(placa);

    if (!vehiculo) {
      return { registrado: false };
    }

    return {
      registrado: true,
      id: vehiculo.id,
      placa: vehiculo.placa,
      tipo: vehiculo.obtenerTipo(),
      clasificacion: vehiculo.clasificacion,
      estado: vehiculo.estado,
      activo: vehiculo.activo,
    };
  }

  // Flujo principal: vehículo YA registrado, llega a la garita.
  async autorizarIngreso(dto: IngresoDto) {
    const vehiculo = await this.vehiculosService.findByPlaca(dto.placa);

    await this.validarCupoSiAplica(vehiculo.obtenerTipo(), dto.permitirSinValidarCupo);

    const actualizado = await this.vehiculosService.marcarIngreso(vehiculo);

    // Esta es la "carga útil" que el módulo de tickets necesita para
    // emitir el ticket de entrada (no se emite el ticket aquí: el
    // gateway de vehículos solo certifica que el ingreso es válido).
    return {
      autorizado: true,
      vehiculoId: actualizado.id,
      placa: actualizado.placa,
      tipo: actualizado.obtenerTipo(),
      clasificacion: actualizado.clasificacion,
      fechaIngreso: actualizado.fechaUltimoIngreso,
    };
  }

  // Flujo walk-in: el vehículo no estaba registrado, se captura en
  // garita y se autoriza el ingreso en la misma operación.
  async registrarEIngresar(dto: RegistroEIngresoDto) {
    const yaExiste = await this.vehiculosService.findByPlacaOpcional(dto.vehiculo.datos.placa);
    if (yaExiste) {
      throw new ConflictException(
        'Ya existe un vehículo registrado con esa placa: use el flujo de ingreso normal',
      );
    }

    const creado = await this.vehiculosService.create(dto.vehiculo);

    try {
      await this.validarCupoSiAplica(creado.obtenerTipo(), dto.permitirSinValidarCupo);
      const actualizado = await this.vehiculosService.marcarIngreso(creado);

      return {
        autorizado: true,
        vehiculoId: actualizado.id,
        placa: actualizado.placa,
        tipo: actualizado.obtenerTipo(),
        clasificacion: actualizado.clasificacion,
        fechaIngreso: actualizado.fechaUltimoIngreso,
      };
    } catch (error) {
      // CONFLICTO DETECTADO: si la validación de cupo o el ingreso
      // fallan después de crear el vehículo, no debe quedar un registro
      // huérfano (creado pero nunca ingresado). Como todavía no existe
      // ningún ticket que lo referencie, es seguro revertir la creación.
      await this.vehiculosService.eliminarFisico(creado.id);
      throw error;
    }
  }

  async autorizarSalida(dto: SalidaDto) {
    const vehiculo = await this.vehiculosService.findByPlaca(dto.placa);
    const actualizado = await this.vehiculosService.marcarSalida(vehiculo);

    return {
      autorizado: true,
      vehiculoId: actualizado.id,
      placa: actualizado.placa,
      fechaIngreso: actualizado.fechaUltimoIngreso,
      fechaSalida: actualizado.fechaUltimaSalida,
    };
  }

  private async validarCupoSiAplica(tipoVehiculo: string, permitirSinValidar?: boolean) {
    try {
      const disponibilidad = await this.zonasClient.consultarDisponibilidad(tipoVehiculo);
      if (!disponibilidad.hayCupo) {
        throw new ConflictException(`No hay espacio disponible para vehículos tipo ${tipoVehiculo}`);
      }
    } catch (error) {
      // Si la falla es por "sin cupo" (ConflictException), siempre se respeta.
      if (error instanceof ConflictException) {
        throw error;
      }
      // Si la falla es de comunicación con ModuloZonas, se respeta la
      // decisión explícita del llamador (modo degradado vs estricto).
      if (!permitirSinValidar) {
        throw error;
      }
    }
  }
}
