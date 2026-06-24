import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AsignacionesModule } from './asignaciones/asignaciones.module';
import { TrazabilidadModule } from './trazabilidad/trazabilidad.module';
import { ClientsModule } from './clients/clients.module';
import { Asignacion } from './asignaciones/entities/asignacion.entity';
import { Auditoria } from './trazabilidad/entities/evento-auditoria.entity';

/**
 * Módulo raíz de la aplicación — Microservicio de Asignación y Trazabilidad.
 *
 * Estructura:
 *   - ConfigModule: gestiona variables de entorno (.env)
 *   - TypeOrmModule: ORM para PostgreSQL
 *   - EventEmitterModule: sistema de eventos de dominio
 *   - AsignacionesModule: lógica de negocio de asignaciones
 *   - TrazabilidadModule: auditoría y logging
 *   - ClientsModule: clientes HTTP a otros microservicios
 *
 * Patrón: Modular Monolith (cada módulo es autocontenido)
 */
@Module({
  imports: [
    // ─── Configuración de variables de entorno ───
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // ─── ORM PostgreSQL ───
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USUARIO', 'postgres'),
        password: configService.get('DB_CONTRASENA', 'postgres'),
        database: configService.get('DB_NOMBRE', 'asignaciones_db'),
        entities: [Asignacion, Auditoria],
        synchronize: true,
        logging: configService.get('DB_LOGGING', 'false') === 'true',
      }),
      inject: [ConfigService],
    }),

    // ─── Sistema de eventos de dominio ───
    EventEmitterModule.forRoot(),

    // ─── Módulos de negocio ───
    AsignacionesModule,
    TrazabilidadModule,
    ClientsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
