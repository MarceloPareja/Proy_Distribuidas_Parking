import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PersonasModule } from './personas/personas.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { RoleusersModule } from './roleusers/roleusers.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Persona } from './personas/entities/persona.entity';
import { User } from './users/entities/user.entity';
import { Role } from './roles/entities/role.entity';
import { UserRole } from './roleusers/entities/roleuser.entity';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuthModule } from './auth/auth.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USUARIO'),
        password: configService.get('DB_CONTRASENA'),
        database: configService.get('DB_NOMBRE'),
        entities:[Persona, User, Role, UserRole],
        synchronize: true,
        logging: true,
      }),
      inject: [ConfigService],
    }),
    PersonasModule, UsersModule, RolesModule, RoleusersModule,
    EventEmitterModule.forRoot(),
    AuthModule
  ],
})
export class AppModule {}
