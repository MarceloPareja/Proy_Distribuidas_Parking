import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsuariosClient } from './usuarios.client';
import { VehiculosClient } from './vehiculos.client';

/**
 * Módulo de clientes HTTP para comunicación con otros microservicios.
 * Todas las llamadas pasan a través de Kong API Gateway.
 */
@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        baseURL: configService.get<string>('KONG_BASE_URL', 'http://localhost:8000'),
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [UsuariosClient, VehiculosClient],
  exports: [UsuariosClient, VehiculosClient],
})
export class ClientsModule {}
