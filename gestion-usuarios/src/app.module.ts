import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PersonasModule } from './personas/personas.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { RoleusersModule } from './roleusers/roleusers.module';

@Module({
  imports: [PersonasModule, UsersModule, RolesModule, RoleusersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
