import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AsignacionesModule } from './asignaciones/asignaciones.module';
import { TrazabilidadModule } from './trazabilidad/trazabilidad.module';
import { ClientsModule } from './clients/clients.module';

@Module({
  imports: [
    // ─── Configuración global desde .env ───
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // ─── Event Emitter para patrón Observer ───
    EventEmitterModule.forRoot(),

    // ─── Conexión a PostgreSQL con TypeORM ───
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USUARIO'),
        password: configService.get<string>('DB_CONTRASENA'),
        database: configService.get<string>('DB_NOMBRE'),
        autoLoadEntities: true, // carga entidades registradas con forFeature()
        synchronize: true,      // solo para desarrollo — NO usar en producción
        logging: true,
      }),
      inject: [ConfigService],
    }),

    // ─── Módulos de dominio ───
    AsignacionesModule,
    TrazabilidadModule,

    // ─── Clientes HTTP para integración con otros microservicios ───
    ClientsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
