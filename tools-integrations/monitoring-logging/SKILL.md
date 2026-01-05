---
name: monitoring-logging
description: Application monitoring, logging systems, and alerting
domain: tools-integrations
version: 1.0.0
tags: [monitoring, logging, metrics, alerting, datadog, grafana, prometheus]
---

# Monitoring & Logging

## Overview

Application observability through logging, metrics collection, monitoring dashboards, and alerting systems.

---

## Structured Logging

### Pino Logger (Node.js)

```typescript
import pino from 'pino';

// Base logger configuration
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
    bindings: () => ({}), // Remove pid and hostname
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: ['password', 'token', 'authorization', '*.password', '*.token'],
    censor: '[REDACTED]',
  },
});

// Child logger with context
function createRequestLogger(req: Request) {
  return logger.child({
    requestId: req.headers['x-request-id'] || crypto.randomUUID(),
    method: req.method,
    path: req.path,
    userAgent: req.headers['user-agent'],
    userId: req.user?.id,
  });
}

// Express middleware
app.use((req, res, next) => {
  req.log = createRequestLogger(req);

  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;

    req.log.info({
      statusCode: res.statusCode,
      duration,
      contentLength: res.get('content-length'),
    }, 'request completed');
  });

  next();
});

// Usage in handlers
app.get('/api/users/:id', async (req, res) => {
  req.log.info({ userId: req.params.id }, 'fetching user');

  try {
    const user = await getUser(req.params.id);
    req.log.debug({ user: user.id }, 'user found');
    res.json(user);
  } catch (error) {
    req.log.error({ error }, 'failed to fetch user');
    res.status(500).json({ error: 'Internal error' });
  }
});
```

### Log Levels

```typescript
// Log level guidelines
logger.trace('Detailed debugging info');      // 10 - Very verbose
logger.debug('Debugging information');         // 20 - Debug mode only
logger.info('Normal operation events');        // 30 - Default level
logger.warn('Warning conditions');             // 40 - Potential issues
logger.error('Error conditions');              // 50 - Errors that need attention
logger.fatal('System-critical errors');        // 60 - System failure

// Contextual logging
logger.info({ orderId, userId, amount }, 'order placed');
logger.error({ error: err.message, stack: err.stack }, 'payment failed');
logger.warn({ retryCount, maxRetries }, 'retry attempt');
```

### Log Aggregation Format

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "info",
  "message": "request completed",
  "service": "api",
  "version": "1.2.3",
  "environment": "production",
  "requestId": "abc-123",
  "traceId": "xyz-789",
  "method": "GET",
  "path": "/api/users/123",
  "statusCode": 200,
  "duration": 45,
  "userId": "user-456"
}
```

---

## Metrics Collection

### Prometheus Metrics

```typescript
import { Counter, Histogram, Gauge, Registry, collectDefaultMetrics } from 'prom-client';

const register = new Registry();

// Collect default Node.js metrics
collectDefaultMetrics({ register });

// HTTP request metrics
const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'path', 'status'],
  registers: [register],
});

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'path'],
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register],
});

// Business metrics
const ordersTotal = new Counter({
  name: 'orders_total',
  help: 'Total number of orders',
  labelNames: ['status', 'payment_method'],
  registers: [register],
});

const activeUsers = new Gauge({
  name: 'active_users',
  help: 'Number of currently active users',
  registers: [register],
});

const orderAmount = new Histogram({
  name: 'order_amount_dollars',
  help: 'Distribution of order amounts',
  buckets: [10, 50, 100, 250, 500, 1000, 5000],
  registers: [register],
});

// Middleware to collect metrics
app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer({
    method: req.method,
    path: req.route?.path || req.path,
  });

  res.on('finish', () => {
    end();
    httpRequestsTotal
      .labels(req.method, req.route?.path || req.path, res.statusCode.toString())
      .inc();
  });

  next();
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.send(await register.metrics());
});

// Business metric usage
async function createOrder(order: Order) {
  // ... create order
  ordersTotal.labels(order.status, order.paymentMethod).inc();
  orderAmount.observe(order.total);
}
```

### Custom Metrics Patterns

```typescript
// Rate limiting metrics
const rateLimitHits = new Counter({
  name: 'rate_limit_hits_total',
  help: 'Number of rate limit hits',
  labelNames: ['endpoint', 'user_tier'],
});

// Cache metrics
const cacheHits = new Counter({
  name: 'cache_hits_total',
  help: 'Number of cache hits',
  labelNames: ['cache_name'],
});

const cacheMisses = new Counter({
  name: 'cache_misses_total',
  help: 'Number of cache misses',
  labelNames: ['cache_name'],
});

// Database metrics
const dbQueryDuration = new Histogram({
  name: 'db_query_duration_seconds',
  help: 'Database query duration',
  labelNames: ['operation', 'table'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
});

const dbConnectionPool = new Gauge({
  name: 'db_connection_pool_size',
  help: 'Database connection pool size',
  labelNames: ['state'], // active, idle, waiting
});

// Queue metrics
const queueSize = new Gauge({
  name: 'queue_size',
  help: 'Number of items in queue',
  labelNames: ['queue_name'],
});

const jobDuration = new Histogram({
  name: 'job_duration_seconds',
  help: 'Job processing duration',
  labelNames: ['job_type', 'status'],
});
```

---

## Alerting

### Alert Rules (Prometheus)

```yaml
# prometheus/alerts.yml
groups:
  - name: application
    rules:
      # High error rate
      - alert: HighErrorRate
        expr: |
          sum(rate(http_requests_total{status=~"5.."}[5m]))
          / sum(rate(http_requests_total[5m])) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value | humanizePercentage }}"

      # High latency
      - alert: HighLatency
        expr: |
          histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))
          > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High latency detected"
          description: "95th percentile latency is {{ $value }}s"

      # Service down
      - alert: ServiceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Service {{ $labels.instance }} is down"

      # High memory usage
      - alert: HighMemoryUsage
        expr: |
          process_resident_memory_bytes / 1024 / 1024 / 1024 > 4
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage"
          description: "Memory usage is {{ $value | humanize }}GB"

  - name: business
    rules:
      # Low order rate
      - alert: LowOrderRate
        expr: |
          sum(rate(orders_total[1h])) < 10
        for: 30m
        labels:
          severity: warning
        annotations:
          summary: "Order rate is below normal"

      # Payment failures
      - alert: HighPaymentFailures
        expr: |
          sum(rate(orders_total{status="failed"}[15m]))
          / sum(rate(orders_total[15m])) > 0.1
        for: 10m
        labels:
          severity: critical
        annotations:
          summary: "High payment failure rate"
```

### PagerDuty Integration

```typescript
import axios from 'axios';

interface Alert {
  severity: 'critical' | 'error' | 'warning' | 'info';
  summary: string;
  source: string;
  details?: Record<string, any>;
}

async function sendPagerDutyAlert(alert: Alert) {
  const event = {
    routing_key: process.env.PAGERDUTY_ROUTING_KEY,
    event_action: 'trigger',
    dedup_key: `${alert.source}-${alert.summary}`,
    payload: {
      summary: alert.summary,
      severity: alert.severity,
      source: alert.source,
      custom_details: alert.details,
      timestamp: new Date().toISOString(),
    },
  };

  await axios.post(
    'https://events.pagerduty.com/v2/enqueue',
    event
  );
}

// Resolve alert
async function resolvePagerDutyAlert(dedupKey: string) {
  await axios.post('https://events.pagerduty.com/v2/enqueue', {
    routing_key: process.env.PAGERDUTY_ROUTING_KEY,
    event_action: 'resolve',
    dedup_key: dedupKey,
  });
}
```

---

## Dashboards

### Grafana Dashboard JSON

```json
{
  "title": "Application Overview",
  "panels": [
    {
      "title": "Request Rate",
      "type": "graph",
      "targets": [
        {
          "expr": "sum(rate(http_requests_total[5m])) by (status)",
          "legendFormat": "{{status}}"
        }
      ]
    },
    {
      "title": "Latency (p95)",
      "type": "graph",
      "targets": [
        {
          "expr": "histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, path))",
          "legendFormat": "{{path}}"
        }
      ]
    },
    {
      "title": "Error Rate",
      "type": "stat",
      "targets": [
        {
          "expr": "sum(rate(http_requests_total{status=~\"5..\"}[5m])) / sum(rate(http_requests_total[5m])) * 100"
        }
      ],
      "fieldConfig": {
        "defaults": {
          "unit": "percent",
          "thresholds": {
            "mode": "absolute",
            "steps": [
              { "color": "green", "value": null },
              { "color": "yellow", "value": 1 },
              { "color": "red", "value": 5 }
            ]
          }
        }
      }
    },
    {
      "title": "Active Users",
      "type": "stat",
      "targets": [
        { "expr": "active_users" }
      ]
    }
  ]
}
```

---

## Health Checks

```typescript
import { Router } from 'express';

const healthRouter = Router();

// Liveness probe - is the app running?
healthRouter.get('/health/live', (req, res) => {
  res.json({ status: 'ok' });
});

// Readiness probe - is the app ready to serve traffic?
healthRouter.get('/health/ready', async (req, res) => {
  const checks = await Promise.allSettled([
    checkDatabase(),
    checkRedis(),
    checkExternalApi(),
  ]);

  const results = {
    database: checks[0].status === 'fulfilled' ? 'ok' : 'error',
    redis: checks[1].status === 'fulfilled' ? 'ok' : 'error',
    externalApi: checks[2].status === 'fulfilled' ? 'ok' : 'error',
  };

  const allHealthy = Object.values(results).every(s => s === 'ok');

  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'ok' : 'degraded',
    checks: results,
    timestamp: new Date().toISOString(),
  });
});

async function checkDatabase() {
  const start = Date.now();
  await db.query('SELECT 1');
  return { latency: Date.now() - start };
}

async function checkRedis() {
  const start = Date.now();
  await redis.ping();
  return { latency: Date.now() - start };
}

async function checkExternalApi() {
  const start = Date.now();
  await fetch('https://api.example.com/health', { timeout: 5000 });
  return { latency: Date.now() - start };
}
```

---

## Related Skills

- [[reliability-engineering]] - SRE practices
- [[devops-cicd]] - CI/CD monitoring
- [[cloud-platforms]] - Cloud monitoring

