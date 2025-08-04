import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface MetricData {
  name: string;
  value: number;
  labels?: Record<string, string>;
  timestamp?: Date;
}

@Injectable()
export class MetricsService {
  private metrics: Map<string, MetricData[]> = new Map();
  private counters: Map<string, number> = new Map();
  private histograms: Map<string, number[]> = new Map();

  constructor(private readonly configService: ConfigService) {}

  // Counter metrics
  incrementCounter(name: string, labels?: Record<string, string>, value: number = 1): void {
    const key = this.getMetricKey(name, labels);
    const currentValue = this.counters.get(key) || 0;
    this.counters.set(key, currentValue + value);

    this.recordMetric({
      name: `${name}_total`,
      value: currentValue + value,
      labels,
      timestamp: new Date(),
    });
  }

  // Gauge metrics
  setGauge(name: string, value: number, labels?: Record<string, string>): void {
    this.recordMetric({
      name,
      value,
      labels,
      timestamp: new Date(),
    });
  }

  // Histogram metrics
  recordHistogram(name: string, value: number, labels?: Record<string, string>): void {
    const key = this.getMetricKey(name, labels);
    const values = this.histograms.get(key) || [];
    values.push(value);
    this.histograms.set(key, values);

    this.recordMetric({
      name: `${name}_histogram`,
      value,
      labels,
      timestamp: new Date(),
    });
  }

  // Database operation metrics
  recordDatabaseOperation(
    operation: string,
    table: string,
    duration: number,
    success: boolean,
  ): void {
    const labels = { operation, table, status: success ? 'success' : 'error' };

    this.incrementCounter('database_operations', labels);
    this.recordHistogram('database_operation_duration_ms', duration, labels);

    if (!success) {
      this.incrementCounter('database_errors', { operation, table });
    }
  }

  // API request metrics
  recordApiRequest(
    method: string,
    route: string,
    statusCode: number,
    duration: number,
  ): void {
    const labels = {
      method,
      route,
      status_code: statusCode.toString(),
      status_class: this.getStatusClass(statusCode),
    };

    this.incrementCounter('http_requests', labels);
    this.recordHistogram('http_request_duration_ms', duration, labels);

    if (statusCode >= 400) {
      this.incrementCounter('http_errors', { method, route, status_code: statusCode.toString() });
    }
  }

  // Business operation metrics
  recordBusinessOperation(
    operation: string,
    entityType: string,
    duration: number,
    success: boolean,
  ): void {
    const labels = { operation, entity_type: entityType, status: success ? 'success' : 'error' };

    this.incrementCounter('business_operations', labels);
    this.recordHistogram('business_operation_duration_ms', duration, labels);

    if (!success) {
      this.incrementCounter('business_operation_errors', { operation, entity_type: entityType });
    }
  }

  // Get metrics in Prometheus format
  getPrometheusMetrics(): string {
    let output = '';

    // Counters
    for (const [key, value] of this.counters.entries()) {
      const { name, labels } = this.parseMetricKey(key);
      const labelsStr = this.formatLabels(labels);
      output += `${name}${labelsStr} ${value}\n`;
    }

    // Current metrics
    for (const [name, metrics] of this.metrics.entries()) {
      const latest = metrics[metrics.length - 1];
      if (latest) {
        const labelsStr = this.formatLabels(latest.labels);
        output += `${latest.name}${labelsStr} ${latest.value}\n`;
      }
    }

    return output;
  }

  // Helper methods
  private recordMetric(metric: MetricData): void {
    const key = this.getMetricKey(metric.name, metric.labels);
    const metrics = this.metrics.get(key) || [];
    metrics.push(metric);

    // Keep only last 1000 metrics per key to prevent memory leaks
    if (metrics.length > 1000) {
      metrics.shift();
    }

    this.metrics.set(key, metrics);
  }

  private getMetricKey(name: string, labels?: Record<string, string>): string {
    if (!labels || Object.keys(labels).length === 0) {
      return name;
    }

    const labelPairs = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}="${value}"`)
      .join(',');

    return `${name}{${labelPairs}}`;
  }

  private parseMetricKey(key: string): { name: string; labels?: Record<string, string> } {
    const braceIndex = key.indexOf('{');
    if (braceIndex === -1) {
      return { name: key };
    }

    const name = key.substring(0, braceIndex);
    const labelsStr = key.substring(braceIndex + 1, key.length - 1);
    const labels: Record<string, string> = {};

    if (labelsStr) {
      const pairs = labelsStr.split(',');
      for (const pair of pairs) {
        const [key, value] = pair.split('=');
        labels[key] = value.replace(/"/g, '');
      }
    }

    return { name, labels };
  }

  private formatLabels(labels?: Record<string, string>): string {
    if (!labels || Object.keys(labels).length === 0) {
      return '';
    }

    const labelPairs = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}="${value}"`)
      .join(',');

    return `{${labelPairs}}`;
  }

  private getStatusClass(statusCode: number): string {
    if (statusCode >= 200 && statusCode < 300) return '2xx';
    if (statusCode >= 300 && statusCode < 400) return '3xx';
    if (statusCode >= 400 && statusCode < 500) return '4xx';
    if (statusCode >= 500) return '5xx';
    return '1xx';
  }
}
