import { Injectable } from '@nestjs/common';
import { SystemInfoDto } from './dto/system-info.dto';
import { TraceableClass } from '../observability/decorators/traceable-class.decorator';
import { LoggerService } from '../observability/logger/logger.service';

@Injectable()
@TraceableClass()
export class SystemService {
  constructor(private readonly logger: LoggerService) {}

  async getSystemInfo(): Promise<{
    status: string;
    uptime: number;
    timestamp: string;
    environment: string | undefined;
    version: string | undefined;
  }> {
    // Add an artificial await to satisfy TypeScript
    await Promise.resolve();

    this.logger.log('Retrieving system information', 'SystemService');

    return {
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      version: process.env.SERVICE_VERSION,
    };
  }

  async runDiagnostics(options: SystemInfoDto): Promise<{
    diagnosticId: string;
    completedAt: string;
    status: string;
    details: {
      checksRun: string[];
      databaseConnected: boolean;
      servicesReachable: boolean;
    };
  }> {
    // Add an artificial await to satisfy TypeScript
    await Promise.resolve();

    // Check if options is defined before accessing its properties
    const checks = options?.checks || ['basic'];

    this.logger.log(
      `Running diagnostics with checks: ${checks.join(', ')}`,
      'SystemService',
    );

    // Simulate a diagnostic process
    return {
      diagnosticId: `diag-${Date.now()}`,
      completedAt: new Date().toISOString(),
      status: 'complete',
      details: {
        checksRun: checks,
        databaseConnected: true,
        servicesReachable: true,
      },
    };
  }
}
