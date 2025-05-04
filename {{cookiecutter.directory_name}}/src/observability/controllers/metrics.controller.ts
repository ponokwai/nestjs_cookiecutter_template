import { Controller, Get, Header, Inject, Res } from '@nestjs/common';
import { Response } from 'express';
import { MetricsService } from '../metrics/metrics.service';
import { LoggerService } from '../logger/logger.service';
import { ObservabilityConfig } from '../config/observability.config';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

interface MetricsError extends Error {
  message: string;
  stack?: string;
}

/**
 * Controller to expose Prometheus metrics endpoint
 */
@ApiTags('observability')
@Controller('metrics')
export class MetricsController {
  constructor(
    private readonly metricsService: MetricsService,
    private readonly logger: LoggerService,
    @Inject('OBSERVABILITY_CONFIG')
    private readonly config: ObservabilityConfig,
  ) {}

  /**
   * Endpoint that returns Prometheus metrics
   */
  @Get()
  @Header('Content-Type', 'text/plain; charset=utf-8')
  @ApiOperation({ summary: 'Get Prometheus metrics' })
  @ApiResponse({
    status: 200,
    description: 'Returns all metrics in Prometheus exposition format',
  })
  @ApiResponse({
    status: 500,
    description: 'Error collecting metrics',
  })
  async getMetrics(@Res() response: Response): Promise<void> {
    try {
      // Get metrics from Prometheus registry
      const metrics = await this.metricsService.getMetrics();
      response.send(metrics);
    } catch (error: unknown) {
      const metricsError = error as MetricsError;
      this.logger.error(
        `Error collecting metrics: ${metricsError.message}`,
        metricsError.stack || '',
        'MetricsController',
      );
      response
        .status(500)
        .send(`Error collecting metrics: ${metricsError.message}`);
    }
  }
}
