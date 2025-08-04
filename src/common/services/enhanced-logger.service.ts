import { Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface LogContext {
  userId?: string;
  requestId?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  responseTime?: number;
  service?: string;
  operation?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class EnhancedLoggerService implements LoggerService {
  private readonly context: string;

  constructor(
    private readonly configService: ConfigService,
    context?: string,
  ) {
    this.context = context || 'Application';
  }

  log(message: string, context?: LogContext): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: 'info',
      context: this.context,
      message,
      ...context,
    };
    console.log(JSON.stringify(logEntry));
  }

  error(message: string, trace?: string, context?: LogContext): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: 'error',
      context: this.context,
      message,
      trace,
      ...context,
    };
    console.error(JSON.stringify(logEntry));
  }

  warn(message: string, context?: LogContext): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: 'warn',
      context: this.context,
      message,
      ...context,
    };
    console.warn(JSON.stringify(logEntry));
  }

  debug(message: string, context?: LogContext): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: 'debug',
      context: this.context,
      message,
      ...context,
    };
    console.debug(JSON.stringify(logEntry));
  }

  verbose(message: string, context?: LogContext): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: 'verbose',
      context: this.context,
      message,
      ...context,
    };
    console.log(JSON.stringify(logEntry));
  }

  // Enhanced methods for database operations
  logDatabaseOperation(
    operation: string,
    table: string,
    duration: number,
    success: boolean,
    context?: LogContext,
  ): void {
    const message = `Database ${operation} on ${table} ${success ? 'completed' : 'failed'} in ${duration}ms`;

    if (success) {
      this.log(message, {
        service: 'Database',
        operation,
        table,
        duration,
        success,
        ...context,
      });
    } else {
      this.error(message, undefined, {
        service: 'Database',
        operation,
        table,
        duration,
        success,
        ...context,
      });
    }
  }

  // Enhanced methods for API operations
  logApiRequest(
    method: string,
    url: string,
    statusCode: number,
    responseTime: number,
    context?: LogContext,
  ): void {
    const message = `${method} ${url} ${statusCode} - ${responseTime}ms`;
    const logContext = {
      service: 'API',
      method,
      url,
      statusCode,
      responseTime,
      ...context,
    };

    if (statusCode >= 400) {
      this.error(message, undefined, logContext);
    } else if (statusCode >= 300) {
      this.warn(message, logContext);
    } else {
      this.log(message, logContext);
    }
  }

  // Enhanced methods for business operations
  logBusinessOperation(
    operation: string,
    entityType: string,
    entityId: string,
    success: boolean,
    duration?: number,
    context?: LogContext,
  ): void {
    const message = `Business operation ${operation} on ${entityType}:${entityId} ${success ? 'completed' : 'failed'}`;
    const logContext = {
      service: 'Business',
      operation,
      entityType,
      entityId,
      success,
      duration,
      ...context,
    };

    if (success) {
      this.log(message, logContext);
    } else {
      this.error(message, undefined, logContext);
    }
  }

  // Performance monitoring
  logPerformanceMetric(
    metric: string,
    value: number,
    unit: string,
    context?: LogContext,
  ): void {
    this.log(`Performance metric: ${metric} = ${value}${unit}`, {
      service: 'Performance',
      metric,
      value,
      unit,
      ...context,
    });
  }

  // Security events
  logSecurityEvent(
    event: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    details: Record<string, any>,
    context?: LogContext,
  ): void {
    const message = `Security event: ${event} (${severity})`;
    const logContext = {
      service: 'Security',
      event,
      severity,
      details,
      ...context,
    };

    if (severity === 'critical' || severity === 'high') {
      this.error(message, undefined, logContext);
    } else {
      this.warn(message, logContext);
    }
  }
}
