import {
  Injectable,
  OnModuleInit,
  OnApplicationShutdown,
} from '@nestjs/common';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-node';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { WinstonInstrumentation } from '@opentelemetry/instrumentation-winston';
import {
  AlwaysOnSampler,
  AlwaysOffSampler,
  TraceIdRatioBasedSampler,
} from '@opentelemetry/sdk-trace-base';
import { Sampler } from '@opentelemetry/api';
import { ObservabilityConfig } from '../config/observability.config';
import { LoggerService } from '../logger/logger.service';

interface TracingError extends Error {
  stack?: string;
  message: string;
}

/**
 * Service for OpenTelemetry distributed tracing setup
 */
@Injectable()
export class TracingService implements OnModuleInit, OnApplicationShutdown {
  private sdk: NodeSDK;

  constructor(
    private readonly config: ObservabilityConfig,
    private readonly logger: LoggerService,
  ) {}

  onModuleInit() {
    if (!this.config.tracing.enabled) {
      this.logger.log('Tracing is disabled', 'TracingService');
      return;
    }

    try {
      // Initialize the OpenTelemetry SDK
      this.initializeTracingSdk();
      this.logger.log(
        'OpenTelemetry tracing initialized successfully',
        'TracingService',
      );
    } catch (error: unknown) {
      const tracingError = error as TracingError;
      this.logger.error(
        `Failed to initialize tracing: ${tracingError.message}`,
        tracingError.stack || '',
        'TracingService',
      );
    }
  }

  /**
   * Initialize OpenTelemetry SDK with configured options
   */
  private initializeTracingSdk(): void {
    // const { tracing, serviceName, serviceVersion, environment } = this.config;
    const { tracing, serviceName } = this.config;

    // Configure the trace exporter
    const traceExporter = new OTLPTraceExporter({
      url: tracing.exporter.endpoint,
      headers: tracing.exporter.headers,
    });

    // Configure the sampler based on configuration
    const sampler = this.configureSampler();

    // Configure instrumentations
    const instrumentations = [] as any[];

    // Add auto-instrumentations
    if (tracing.instrumentations.http) {
      instrumentations.push(
        // This will add HTTP, GRPC and other common instrumentations
        ...getNodeAutoInstrumentations({
          // Disable instrumentation for modules we don't want or will configure separately
          '@opentelemetry/instrumentation-winston': { enabled: false },
          '@opentelemetry/instrumentation-nestjs-core': { enabled: false },
        }),
      );
    }

    // Add NestJS-specific instrumentation
    if (tracing.instrumentations.nestJs) {
      instrumentations.push(new NestInstrumentation());
    }

    // Add Winston instrumentation to connect logs with traces
    if (tracing.instrumentations.winston) {
      instrumentations.push(new WinstonInstrumentation());
    }

    // Create and start the SDK
    this.sdk = new NodeSDK({
      serviceName,
      spanProcessor: new SimpleSpanProcessor(traceExporter),
      sampler,
      instrumentations,
    });

    // Start the SDK
    this.sdk.start();
  }

  /**
   * Configure the appropriate sampler based on configuration
   * @returns Configured OpenTelemetry sampler
   */
  private configureSampler(): Sampler {
    const { type, ratio } = this.config.tracing.sampler;

    switch (type) {
      case 'always_on':
        return new AlwaysOnSampler();
      case 'always_off':
        return new AlwaysOffSampler();
      case 'trace_id_ratio':
        return new TraceIdRatioBasedSampler(ratio || 0.1);
      default:
        this.logger.warn(
          `Unknown sampler type: ${String(type)}, using AlwaysOnSampler`,
          'TracingService',
        );
        return new AlwaysOnSampler();
    }
  }

  async onApplicationShutdown() {
    if (this.sdk && this.config.tracing.enabled) {
      try {
        // Shutdown the SDK properly
        await this.sdk.shutdown();
        this.logger.log(
          'OpenTelemetry tracing shut down successfully',
          'TracingService',
        );
      } catch (error: unknown) {
        const shutdownError = error as TracingError;
        this.logger.error(
          `Error shutting down tracing: ${shutdownError.message}`,
          shutdownError.stack || '',
          'TracingService',
        );
      }
    }
  }
}
