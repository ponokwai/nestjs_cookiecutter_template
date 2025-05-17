import { Test, TestingModule } from '@nestjs/testing';
import { SystemController } from './system.controller';
import { SystemService } from './system.service';
import { LoggerService } from '../observability/logger/logger.service';
import { MetricsService } from '../observability/metrics/metrics.service';

describe('SystemController', () => {
  let controller: SystemController;
  let systemServiceMock: Partial<SystemService>;
  let loggerServiceMock: Partial<LoggerService>;
  let metricsServiceMock: Partial<MetricsService>;

  beforeEach(async () => {
    // Create mocks for the dependencies
    systemServiceMock = {
      getSystemInfo: jest.fn().mockResolvedValue({
        status: 'ok',
        uptime: 123,
        timestamp: new Date().toISOString(),
        environment: 'test',
        version: '1.0.0',
      }),
    };

    loggerServiceMock = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };

    metricsServiceMock = {
      getMetrics: jest.fn(),
      createCounter: jest.fn(),
      createGauge: jest.fn(),
      createHistogram: jest.fn(),
      recordHttpRequest: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SystemController],
      providers: [
        {
          provide: SystemService,
          useValue: systemServiceMock,
        },
        {
          provide: LoggerService,
          useValue: loggerServiceMock,
        },
        {
          provide: MetricsService,
          useValue: metricsServiceMock,
        },
      ],
    }).compile();

    controller = module.get<SystemController>(SystemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
