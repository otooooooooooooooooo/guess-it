import { Test, TestingModule } from '@nestjs/testing';
import { RoomsFactory } from './rooms.factory';

describe('RoomsFactory', () => {
  let service: RoomsFactory;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoomsFactory],
    }).compile();

    service = module.get<RoomsFactory>(RoomsFactory);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
