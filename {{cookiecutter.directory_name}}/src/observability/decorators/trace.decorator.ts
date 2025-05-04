import {
  trace,
  Span,
  SpanStatusCode,
  Exception,
  AttributeValue,
} from '@opentelemetry/api';
import { LoggerService } from '../logger/logger.service';

/**
 * Get the logger service from the application context
 * @param target The target object that might contain a logger
 * @returns The logger service instance
 */
function getLoggerService(target: unknown): LoggerService | undefined {
  if (!target) return undefined;

  // Try to get the logger from the instance
  return (target as { logger?: unknown }).logger instanceof LoggerService
    ? (target as { logger: LoggerService }).logger
    : undefined;
}

/**
 * Decorator to trace a method execution
 *
 * @param spanName Optional custom span name (defaults to method name)
 * @param options Additional options for the span
 * @returns Method decorator
 */
export function Trace(
  spanName?: string,
  options: {
    logStart?: boolean;
    logSuccess?: boolean;
    logError?: boolean;
    captureArgs?: boolean;
  } = {},
) {
  const {
    logStart = true,
    logSuccess = true,
    logError = true,
    captureArgs = true,
  } = options;

  return function (
    target: object,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value as (
      ...args: unknown[]
    ) => Promise<unknown>;
    const methodName = propertyKey;
    const className = (target.constructor as { name: string }).name;

    descriptor.value = async function (...args: unknown[]) {
      const tracer = trace.getTracer('application-tracer');
      const logger = getLoggerService(this);
      const contextName = className;

      return tracer.startActiveSpan(
        spanName || methodName,
        async (span: Span) => {
          // Add basic attributes
          span.setAttribute('class.name', className);
          span.setAttribute('method.name', methodName);

          // Capture arguments if enabled and there are arguments
          if (captureArgs && args.length > 0) {
            try {
              // Safely capture primitive arguments and object IDs
              args.forEach((arg, index) => {
                if (arg !== null && arg !== undefined) {
                  if (typeof arg === 'object') {
                    // For objects, try to capture id or similar identifying field
                    if ('id' in arg)
                      span.setAttribute(
                        `arg.${index}.id`,
                        String((arg as { id: unknown }).id),
                      );

                    if ('name' in arg)
                      span.setAttribute(
                        `arg.${index}.name`,
                        String((arg as { name: unknown }).name),
                      );

                    if ('title' in arg)
                      span.setAttribute(
                        `arg.${index}.title`,
                        String((arg as { title: unknown }).title),
                      );
                  } else if (
                    ['string', 'number', 'boolean'].includes(typeof arg)
                  ) {
                    // For primitives, capture the actual value as string
                    if (typeof arg === 'string') {
                      span.setAttribute(`arg.${index}`, arg as AttributeValue);
                    } else if (
                      typeof arg === 'number' ||
                      typeof arg === 'boolean'
                    ) {
                      span.setAttribute(
                        `arg.${index}`,
                        String(arg) as AttributeValue,
                      );
                    }
                  }
                }
              });
            } catch {
              // Silently fail if we can't capture arguments
            }
          }

          // Log the method start if enabled
          if (logStart && logger) {
            logger.log(`Executing ${methodName}`, contextName);
          }

          try {
            // Execute the original method
            // Using type assertion to handle the result type safely
            const result: unknown = await originalMethod.apply(this, args);

            // Set the span status to OK
            span.setStatus({ code: SpanStatusCode.OK });

            // Log the method success if enabled
            if (logSuccess && logger) {
              logger.debug(`Successfully executed ${methodName}`, contextName);
            }

            return result;
          } catch (error) {
            // Set the span status to ERROR
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: (error as Error).message,
            });

            // Record the exception in the span
            span.recordException(error as Exception);

            // Log the method error if enabled
            if (logError && logger) {
              logger.error(
                `Error executing ${methodName}: ${(error as Error).message}`,
                (error as Error).stack,
                contextName,
              );
            }

            // Re-throw the error
            throw error;
          } finally {
            // End the span
            span.end();
          }
        },
      );
    };

    return descriptor;
  };
}
