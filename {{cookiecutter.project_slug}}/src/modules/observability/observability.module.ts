import { DynamicModule, Module, Provider, Global } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';

import { LoggerService } from './logger/logger.service';
import { MetricsService } from './metrics/metrics.service';
import { TracingService } from './tracing/tracing.service';
import {
  ObservabilityConfig,
  defaultObservabilityConfig,
} from './config/observability.config';
import { HttpTraceInterceptor } from './interceptors/http-trace.interceptor';
import { ControllerMethodTraceInterceptor } from './interceptors/controller-method-trace.interceptor';
import { MetricsController } from './controllers/metrics.controller';

@Global()
@Module({})
export class ObservabilityModule {
  static forRoot(config?: Partial<ObservabilityConfig>): DynamicModule {
    const actualConfig = {
      ...defaultObservabilityConfig,
      ...config,
    };

    return this.registerModule(actualConfig);
  }

  static forRootAsync(options: {
    useFactory: (
      ...args: any[]
    ) => ObservabilityConfig | Promise<ObservabilityConfig>;
    inject?: any[];
  }): DynamicModule {
    const configProvider = {
      provide: 'OBSERVABILITY_CONFIG',
      useFactory: options.useFactory,
      inject: options.inject || [],
    };

    return this.registerModule(null, configProvider);
  }

  /**
   * Register the module with providers and controllers
   */
  private static registerModule(
    config: ObservabilityConfig | null,
    configProvider?: Provider,
  ): DynamicModule {
    // Core providers
    const providers: Provider[] = [
      configProvider || {
        provide: 'OBSERVABILITY_CONFIG',
        useValue: config,
      },
      {
        provide: LoggerService,
        useFactory: (config: ObservabilityConfig) => {
          return new LoggerService(config);
        },
        inject: ['OBSERVABILITY_CONFIG'],
      },
      {
        provide: MetricsService,
        useFactory: (config: ObservabilityConfig, logger: LoggerService) => {
          return new MetricsService(config, logger);
        },
        inject: ['OBSERVABILITY_CONFIG', LoggerService],
      },
      {
        provide: TracingService,
        useFactory: (config: ObservabilityConfig, logger: LoggerService) => {
          return new TracingService(config, logger);
        },
        inject: ['OBSERVABILITY_CONFIG', LoggerService],
      },
      {
        provide: APP_INTERCEPTOR,
        useFactory: (metricsService: MetricsService, logger: LoggerService) => {
          return new HttpTraceInterceptor(metricsService, logger);
        },
        inject: [MetricsService, LoggerService],
      },
      // Add the controller method trace interceptor globally
      {
        provide: APP_INTERCEPTOR,
        useFactory: (logger: LoggerService) => {
          return new ControllerMethodTraceInterceptor(logger);
        },
        inject: [LoggerService],
      },
    ];

    // Controllers array with conditional addition
    const controllers =
      config?.metrics.enabled !== false ? [MetricsController] : [];

    return {
      module: ObservabilityModule,
      imports: [ConfigModule],
      providers,
      exports: [LoggerService, MetricsService, TracingService],
      controllers,
      global: true, // Make this module global to ensure services are available everywhere
    };
  }
}
