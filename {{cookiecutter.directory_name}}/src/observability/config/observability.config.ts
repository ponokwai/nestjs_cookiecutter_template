/**
 * Configuration for the ObservabilityModule
 * This file contains all the configuration options for the observability components
 */
export interface ObservabilityConfig {
  serviceName: string;
  serviceVersion: string;
  environment: string;

  logging: {
    level: string;
    consoleOutput: boolean;
    jsonFormat: boolean;
    otlpExport: {
      enabled: boolean;
      endpoint: string;
    };
  };

  metrics: {
    enabled: boolean;
    endpoint: string;
    defaultLabels: Record<string, string>;
    defaultMetrics: boolean;
  };

  tracing: {
    enabled: boolean;
    sampler: {
      type: 'always_on' | 'always_off' | 'trace_id_ratio';
      ratio?: number; // Only used for trace_id_ratio type
    };
    exporter: {
      type: 'otlp';
      endpoint: string;
      headers?: Record<string, string>;
    };
    instrumentations: {
      http: boolean;
      nestJs: boolean;
      winston: boolean;
    };
  };
}

/**
 * Default configuration for the ObservabilityModule
 */
export const defaultObservabilityConfig: ObservabilityConfig = {
  serviceName: process.env.SERVICE_NAME || 'nestjs-service',
  serviceVersion: '1.0.0',
  environment: process.env.NODE_ENV || 'development',

  logging: {
    level: process.env.LOG_LEVEL || 'info',
    consoleOutput: true,
    jsonFormat: process.env.NODE_ENV === 'production',
    otlpExport: {
      enabled: process.env.OTLP_LOGS_ENABLED === 'true',
      endpoint:
        process.env.OTLP_LOGS_ENDPOINT || 'http://localhost:4318/v1/logs',
    },
  },

  metrics: {
    enabled: process.env.METRICS_ENABLED !== 'false',
    endpoint: process.env.METRICS_ENDPOINT || '/metrics',
    defaultLabels: {
      service: process.env.SERVICE_NAME || 'nestjs-service',
      environment: process.env.NODE_ENV || 'development',
    },
    defaultMetrics: true,
  },

  tracing: {
    enabled: process.env.TRACING_ENABLED !== 'false',
    sampler: {
      type:
        (process.env.TRACING_SAMPLER_TYPE as
          | 'always_on'
          | 'always_off'
          | 'trace_id_ratio') || 'always_on',
      ratio: process.env.TRACING_SAMPLER_RATIO
        ? parseFloat(process.env.TRACING_SAMPLER_RATIO)
        : 1.0,
    },
    exporter: {
      type: 'otlp',
      endpoint:
        process.env.OTLP_TRACES_ENDPOINT || 'http://localhost:4318/v1/traces',
      headers: process.env.OTLP_HEADERS
        ? (JSON.parse(process.env.OTLP_HEADERS) as Record<string, string>)
        : undefined,
    },
    instrumentations: {
      http: true,
      nestJs: true,
      winston: true,
    },
  },
};
