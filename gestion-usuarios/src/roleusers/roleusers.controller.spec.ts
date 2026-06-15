import { Test, TestingModule } from '@nestjs/testing';
import { RoleusersController } from './roleusers.controller';
import { RoleusersService } from './roleusers.service';

describe('RoleusersController', () => {
  let controller: RoleusersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleusersController],
      providers: [RoleusersService],
    }).compile();

    controller = module.get<RoleusersController>(RoleusersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
