import { Module } from '@nestjs/common';
import { RoleusersService } from './roleusers.service';
import { RoleusersController } from './roleusers.controller';

@Module({
  controllers: [RoleusersController],
  providers: [RoleusersService],
})
export class RoleusersModule {}
