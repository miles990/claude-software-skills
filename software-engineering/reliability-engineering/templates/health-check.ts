/**
 * Health Check Template
 * Usage: Implement health endpoints for your service
 */

// ===========================================
// Types
// ===========================================

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

export interface HealthCheckResult {
  name: string;
  status: HealthStatus;
  latency?: number;
  message?: string;
  metadata?: Record<string, unknown>;
}

export interface HealthReport {
  status: HealthStatus;
  timestamp: string;
  version: string;
  uptime: number;
  checks: HealthCheckResult[];
}

export type HealthCheck = () => Promise<HealthCheckResult>;

// ===========================================
// Health Check Manager
// ===========================================

export class HealthCheckManager {
  private checks: Map<string, HealthCheck> = new Map();
  private startTime: number = Date.now();
  private version: string;

  constructor(version: string = '1.0.0') {
    this.version = version;
  }

  /**
   * Register a health check
   */
  register(name: string, check: HealthCheck): void {
    this.checks.set(name, check);
  }

  /**
   * Run all health checks
   */
  async runChecks(): Promise<HealthReport> {
    const results: HealthCheckResult[] = [];

    for (const [name, check] of this.checks) {
      const start = Date.now();
      try {
        const result = await Promise.race([
          check(),
          this.timeout(5000, name),
        ]);
        result.latency = Date.now() - start;
        results.push(result);
      } catch (error) {
        results.push({
          name,
          status: 'unhealthy',
          latency: Date.now() - start,
          message: error instanceof Error ? error.message : 'Check failed',
        });
      }
    }

    const overallStatus = this.calculateOverallStatus(results);

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: this.version,
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      checks: results,
    };
  }

  /**
   * Run liveness check (basic alive check)
   */
  async livenessCheck(): Promise<{ status: 'ok' | 'error' }> {
    return { status: 'ok' };
  }

  /**
   * Run readiness check (ready to serve traffic)
   */
  async readinessCheck(): Promise<HealthReport> {
    return this.runChecks();
  }

  private async timeout(ms: number, name: string): Promise<HealthCheckResult> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`${name} timed out after ${ms}ms`)), ms);
    });
  }

  private calculateOverallStatus(results: HealthCheckResult[]): HealthStatus {
    if (results.some(r => r.status === 'unhealthy')) {
      return 'unhealthy';
    }
    if (results.some(r => r.status === 'degraded')) {
      return 'degraded';
    }
    return 'healthy';
  }
}

// ===========================================
// Common Health Checks
// ===========================================

/**
 * Database health check
 */
export function createDatabaseCheck(
  name: string,
  queryFn: () => Promise<unknown>
): HealthCheck {
  return async () => {
    try {
      await queryFn();
      return { name, status: 'healthy' };
    } catch (error) {
      return {
        name,
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'Database error',
      };
    }
  };
}

/**
 * Redis health check
 */
export function createRedisCheck(
  name: string,
  pingFn: () => Promise<string>
): HealthCheck {
  return async () => {
    try {
      const result = await pingFn();
      if (result === 'PONG') {
        return { name, status: 'healthy' };
      }
      return { name, status: 'degraded', message: `Unexpected response: ${result}` };
    } catch (error) {
      return {
        name,
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'Redis error',
      };
    }
  };
}

/**
 * HTTP dependency health check
 */
export function createHttpCheck(
  name: string,
  url: string,
  timeoutMs: number = 5000
): HealthCheck {
  return async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        return { name, status: 'healthy', metadata: { statusCode: response.status } };
      }
      return {
        name,
        status: 'degraded',
        message: `HTTP ${response.status}`,
        metadata: { statusCode: response.status },
      };
    } catch (error) {
      clearTimeout(timeoutId);
      return {
        name,
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'HTTP error',
      };
    }
  };
}

/**
 * Memory usage check
 */
export function createMemoryCheck(
  name: string = 'memory',
  thresholdPercent: number = 90
): HealthCheck {
  return async () => {
    const used = process.memoryUsage();
    const heapUsedPercent = (used.heapUsed / used.heapTotal) * 100;

    if (heapUsedPercent < thresholdPercent) {
      return {
        name,
        status: 'healthy',
        metadata: {
          heapUsed: Math.round(used.heapUsed / 1024 / 1024),
          heapTotal: Math.round(used.heapTotal / 1024 / 1024),
          percent: Math.round(heapUsedPercent),
        },
      };
    }

    return {
      name,
      status: 'degraded',
      message: `Memory usage at ${Math.round(heapUsedPercent)}%`,
      metadata: { percent: Math.round(heapUsedPercent) },
    };
  };
}

/**
 * Disk space check (requires external command)
 */
export function createDiskCheck(
  name: string = 'disk',
  path: string = '/',
  thresholdPercent: number = 90
): HealthCheck {
  return async () => {
    // This is a placeholder - implement based on your OS
    // For Node.js, use 'diskusage' package or execute df command
    return { name, status: 'healthy', message: 'Implement disk check' };
  };
}

// ===========================================
// Express Integration
// ===========================================

/*
import express from 'express';

const app = express();
const health = new HealthCheckManager(process.env.VERSION || '1.0.0');

// Register checks
health.register('database', createDatabaseCheck('database', () => db.query('SELECT 1')));
health.register('redis', createRedisCheck('redis', () => redis.ping()));
health.register('memory', createMemoryCheck());

// Kubernetes-style endpoints
app.get('/healthz', async (req, res) => {
  const result = await health.livenessCheck();
  res.json(result);
});

app.get('/readyz', async (req, res) => {
  const report = await health.readinessCheck();
  const statusCode = report.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(report);
});

// Detailed health endpoint
app.get('/health', async (req, res) => {
  const report = await health.runChecks();
  const statusCode = report.status === 'healthy' ? 200 :
                     report.status === 'degraded' ? 200 : 503;
  res.status(statusCode).json(report);
});
*/

export { HealthCheckManager as default };
