import { Test, TestingModule } from '@nestjs/testing';
import { SystemService } from './system.service';
import { LoggerService } from '../observability/logger/logger.service';

describe('SystemService', () => {
  let service: SystemService;
  let loggerServiceMock: Partial<LoggerService>;

  beforeEach(async () => {
    // Create a mock for LoggerService
    loggerServiceMock = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SystemService,
        {
          provide: LoggerService,
          useValue: loggerServiceMock,
        },
      ],
    }).compile();

    service = module.get<SystemService>(SystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
