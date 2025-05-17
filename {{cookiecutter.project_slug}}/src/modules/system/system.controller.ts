import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import { SystemService } from './system.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { LoggerService } from '../observability/logger/logger.service';
import { TraceableClass } from '../observability/decorators/traceable-class.decorator';
import { MetricsService } from '../observability/metrics/metrics.service';
import * as promClient from 'prom-client';
import { SystemInfoDto } from './dto/system-info.dto';

@ApiTags('system')
@Controller('system')
@TraceableClass()
export class SystemController {
  // Performance metrics
  private operationDuration: promClient.Histogram;
  private requestErrors: promClient.Counter;

  constructor(
    private readonly systemService: SystemService,
    private readonly logger: LoggerService,
    private readonly metricsService: MetricsService,
  ) {
    // Initialize histogram for operation durations
    this.operationDuration = this.metricsService.createHistogram(
      'system_operation_duration_seconds',
      'Duration of system operations in seconds',
      ['operation', 'method'],
      [0.01, 0.05, 0.1, 0.5, 1, 2, 5], // Custom buckets in seconds
    );

    // Error counter
    this.requestErrors = this.metricsService.createCounter(
      'system_request_errors_total',
      'Total number of errors in system requests',
      ['operation', 'error_type'],
    );
  }

  @Get('/info')
  @ApiOperation({ summary: 'Get system information' })
  @ApiResponse({
    status: 200,
    description: 'Returns system information like uptime, environment, etc.',
  })
  async getSystemInfo() {
    const startTime = process.hrtime();

    try {
      const result = await this.systemService.getSystemInfo();

      // Record operation duration
      const [seconds, nanoseconds] = process.hrtime(startTime);
      const duration = seconds + nanoseconds / 1e9;
      this.operationDuration.observe(
        { operation: 'getSystemInfo', method: 'GET' },
        duration,
      );
      this.logger.log('System information fetched successfully');

      return result;
    } catch (error) {
      // Record error with proper type handling
      this.requestErrors.inc({
        operation: 'getSystemInfo',
        error_type: error instanceof Error ? error.name : 'Unknown',
      });
      this.logger.error(
        {
          operation: 'getSystemInfo',
          error: error instanceof Error ? error : String(error),
        },
        'Error fetching system information',
      );
      throw new InternalServerErrorException(
        'Failed to fetch system information',
      );
    }
  }

  @Post('/diagnostics')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Run system diagnostic tests' })
  @ApiBody({ type: SystemInfoDto })
  @ApiResponse({
    status: 200,
    description: 'Diagnostic checks completed successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  async runDiagnostics(@Body() options: SystemInfoDto) {
    const startTime = process.hrtime();

    try {
      const result = await this.systemService.runDiagnostics(options);

      // Record operation duration
      const [seconds, nanoseconds] = process.hrtime(startTime);
      const duration = seconds + nanoseconds / 1e9;
      this.operationDuration.observe(
        { operation: 'runDiagnostics', method: 'POST' },
        duration,
      );
      this.logger.log('System diagnostics completed');

      return result;
    } catch (error) {
      // Record error with proper type handling
      this.requestErrors.inc({
        operation: 'runDiagnostics',
        error_type: error instanceof Error ? error.name : 'Unknown',
      });
      this.logger.error(
        {
          operation: 'runDiagnostics',
          error: error instanceof Error ? error : String(error),
        },
        'Error running system diagnostics',
      );
      throw new InternalServerErrorException(
        'Failed to run system diagnostics',
      );
    }
  }
}
