import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { Logger, createLogger, format, transports } from 'winston';
import { ObservabilityConfig } from '../config/observability.config';
import { trace, diag, context, SpanContext } from '@opentelemetry/api';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Handling type issues with OpenTelemetry module
import {
  LoggerProvider,
  BatchLogRecordProcessor,
} from '@opentelemetry/sdk-logs';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Handling type issues with OpenTelemetry module
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import * as Transport from 'winston-transport';

// Define interfaces for better type safety
interface OTLogger {
  emit(record: LogRecord): void;
}

interface LogRecord {
  severityNumber: number;
  severityText: string;
  body: string;
  attributes: Record<string, string>;
}

interface WinstonLogInfo {
  timestamp?: string;
  level: string;
  message: string;
  metadata?: Record<string, unknown>;
  traceId?: string;
  spanId?: string;
  [key: string]: unknown;
}

// Interface for the LoggerProvider to avoid Function type
interface OTLoggerProvider {
  getLogger(name: string): OTLogger;
  addLogRecordProcessor(processor: unknown): void;
}

// Enable debug logging for OpenTelemetry
diag.setLogger({
  error(message) {
    console.error(`[OpenTelemetry ERROR] ${message}`);
  },
  warn(message) {
    console.warn(`[OpenTelemetry WARN] ${message}`);
  },
  info(message) {
    console.log(`[OpenTelemetry INFO] ${message}`);
  },
  debug(message) {
    console.log(`[OpenTelemetry DEBUG] ${message}`);
  },
  verbose(message) {
    console.log(`[OpenTelemetry VERBOSE] ${message}`);
  },
});

// Create a singleton LoggerProvider with proper typing
let loggerProvider: OTLoggerProvider | null = null;

function getLoggerProvider(endpoint: string): OTLoggerProvider | null {
  if (!loggerProvider) {
    try {
      console.log(`Creating LoggerProvider with endpoint: ${endpoint}`);

      // Use ignore comments to bypass type checking for OpenTelemetry SDK objects
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const exporter = new OTLPLogExporter({
        url: endpoint,
      });

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      loggerProvider = new LoggerProvider();

      if (
        loggerProvider &&
        typeof loggerProvider.addLogRecordProcessor === 'function'
      ) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        loggerProvider.addLogRecordProcessor(
          new BatchLogRecordProcessor(exporter),
        );
        console.log('LoggerProvider successfully created');
      }
    } catch (error) {
      console.error(`Failed to create LoggerProvider: ${error}`);
    }
  }
  return loggerProvider;
}

/**
 * Custom Winston transport to send logs to OpenTelemetry collector
 */
class OTLPTransport extends Transport {
  private serviceName: string;
  private environment: string;
  private logger: OTLogger | null = null;

  constructor(
    opts: Transport.TransportStreamOptions & {
      endpoint: string;
      serviceName: string;
      environment: string;
    },
  ) {
    super(opts);

    try {
      this.serviceName = opts.serviceName;
      this.environment = opts.environment;

      const provider = getLoggerProvider(opts.endpoint);
      if (provider) {
        this.logger = provider.getLogger(this.serviceName);
        console.log(
          `OTLPTransport initialized with logger for service: ${this.serviceName}`,
        );
      } else {
        console.error('Failed to get LoggerProvider');
      }
    } catch (error) {
      console.error(`Failed to initialize OTLPTransport: ${error}`);
    }
  }

  log(info: WinstonLogInfo, callback: () => void): void {
    setImmediate(() => {
      this.emit('logged', info);
    });

    if (!this.logger) {
      callback();
      return;
    }

    try {
      // Get active span context from tracer if available
      const activeSpan = trace.getSpan(context.active());
      let spanContext: SpanContext | undefined;
      if (activeSpan) {
        spanContext = activeSpan.spanContext();
      }

      // Map Winston levels to OpenTelemetry severity
      const severityNumber = this.getSeverityNumber(info.level || 'info');

      // Create attributes with metadata
      const attributes: Record<string, string> = {
        'service.name': this.serviceName,
        'service.environment': this.environment,
      };

      // Add metadata to attributes if available
      if (info.metadata && typeof info.metadata === 'object') {
        Object.keys(info.metadata).forEach((key) => {
          const value = (info.metadata as Record<string, unknown>)[key];
          if (value !== undefined && value !== null) {
            // Use JSON.stringify for object values to avoid [object Object]
            attributes[key] =
              // eslint-disable-next-line @typescript-eslint/no-base-to-string
              typeof value === 'object' ? JSON.stringify(value) : String(value);
          }
        });
      }

      // Add trace context if available
      const traceId = info.traceId || (spanContext?.traceId ?? '');
      if (traceId) {
        attributes['traceId'] = traceId;
      }

      const spanId = info.spanId || (spanContext?.spanId ?? '');
      if (spanId) {
        attributes['spanId'] = spanId;
      }

      // Get message safely
      const message = info.message ? String(info.message) : '';

      // Log using the OpenTelemetry logger
      this.logger.emit({
        severityNumber,
        severityText: (info.level || 'INFO').toUpperCase(),
        body: message,
        attributes,
      });

      const shortMessage =
        message.length > 30 ? `${message.substring(0, 30)}...` : message;

      console.log(
        `Log emitted with level ${info.level}, message: ${shortMessage}`,
      );
    } catch (error) {
      console.error(`Error in OTLPTransport log: ${error}`);
    }

    callback();
  }

  // Map Winston log levels to OpenTelemetry severity numbers
  private getSeverityNumber(level: string): number {
    switch (level.toLowerCase()) {
      case 'error':
        return 17; // ERROR
      case 'warn':
        return 13; // WARN
      case 'info':
        return 9; // INFO
      case 'http':
        return 9; // INFO
      case 'verbose':
        return 5; // DEBUG
      case 'debug':
        return 5; // DEBUG
      case 'silly':
        return 1; // TRACE
      default:
        return 9; // INFO
    }
  }
}

/**
 * Winston-based logger implementation that integrates with OpenTelemetry
 * to include trace and span IDs in log entries.
 */
@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: Logger;

  constructor(private readonly config: ObservabilityConfig) {
    this.logger = this.createLogger();
  }

  /**
   * Create and configure the Winston logger instance
   */
  private createLogger(): Logger {
    const { logging } = this.config;

    // Define the format for log messages
    const logFormat = format.combine(
      // Add timestamp in ISO format
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
      // Add trace context information (trace ID, span ID)
      format((info) => {
        const activeSpan = trace.getActiveSpan();
        if (activeSpan) {
          const spanContext = activeSpan.spanContext();
          info.traceId = spanContext.traceId;
          info.spanId = spanContext.spanId;
        }
        return info;
      })(),
      // Include service information
      format.metadata({
        fillExcept: [], // Use fillExcept instead of fillWith for proper typing
      }),
      // Choose between JSON and simple format based on config
      logging.jsonFormat ? format.json() : format.simple(),
    );

    // Set up transports based on configuration
    const loggerTransports = [] as Transport[];

    // Console transport
    if (logging.consoleOutput) {
      loggerTransports.push(
        new transports.Console({
          level: logging.level,
          format: logFormat,
        }),
      );
    }

    // OTLP transport for OpenTelemetry integration
    if (logging.otlpExport.enabled) {
      loggerTransports.push(
        new OTLPTransport({
          level: logging.level,
          endpoint: logging.otlpExport.endpoint,
          serviceName: this.config.serviceName,
          environment: this.config.environment,
        }),
      );
    }

    // Create the logger instance
    return createLogger({
      level: logging.level,
      format: logFormat,
      defaultMeta: {
        service: this.config.serviceName,
        environment: this.config.environment,
      },
      transports: loggerTransports,
      exitOnError: false,
    });
  }

  /**
   * Log a message at the 'log' level (maps to 'info')
   */
  log(message: any, context?: string): void {
    const meta = context ? { context } : {};
    this.logger.info(String(message), meta);
  }

  /**
   * Log a message at the 'error' level
   */
  error(message: any, trace?: string, context?: string): void {
    const meta = {
      ...(trace ? { trace } : {}),
      ...(context ? { context } : {}),
    };
    this.logger.error(String(message), meta);
  }

  /**
   * Log a message at the 'warn' level
   */
  warn(message: any, context?: string): void {
    const meta = context ? { context } : {};
    this.logger.warn(String(message), meta);
  }

  /**
   * Log a message at the 'debug' level
   */
  debug(message: any, context?: string): void {
    const meta = context ? { context } : {};
    this.logger.debug(String(message), meta);
  }

  /**
   * Log a message at the 'verbose' level
   */
  verbose(message: any, context?: string): void {
    const meta = context ? { context } : {};
    this.logger.verbose(String(message), meta);
  }

  /**
   * Get the underlying Winston logger instance
   */
  getWinstonLogger(): Logger {
    return this.logger;
  }
}
