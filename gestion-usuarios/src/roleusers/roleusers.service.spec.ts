import { Test, TestingModule } from '@nestjs/testing';
import { RoleusersService } from './roleusers.service';

describe('RoleusersService', () => {
  let service: RoleusersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoleusersService],
    }).compile();

    service = module.get<RoleusersService>(RoleusersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
