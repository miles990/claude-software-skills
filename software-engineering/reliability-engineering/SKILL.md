---
name: reliability-engineering
description: SRE principles, observability, and incident management
domain: software-engineering
version: 1.0.0
tags: [sre, observability, incident-management, chaos-engineering, sli, slo]
---

# Reliability Engineering

## Overview

Site Reliability Engineering (SRE) practices for building and maintaining reliable systems.

---

## SLI / SLO / SLA

### Definitions

| Term | Definition | Example |
|------|------------|---------|
| SLI | Service Level Indicator (metric) | Request latency, error rate |
| SLO | Service Level Objective (target) | 99.9% availability |
| SLA | Service Level Agreement (contract) | Refund if < 99.5% |

### Common SLIs

```yaml
# Availability SLI
availability:
  definition: "Successful requests / Total requests"
  good_events: "HTTP status < 500"
  total_events: "All HTTP requests"

# Latency SLI
latency:
  definition: "Requests faster than threshold / Total requests"
  thresholds:
    - p50: 100ms
    - p95: 500ms
    - p99: 1000ms

# Error Rate SLI
error_rate:
  definition: "Failed requests / Total requests"
  bad_events: "HTTP 5xx responses"

# Throughput SLI
throughput:
  definition: "Requests processed per second"
  target: "> 1000 RPS"
```

### Error Budget

```typescript
// Error budget calculation
const SLO = 0.999;  // 99.9% availability
const PERIOD = 30;   // 30 days

const totalMinutes = PERIOD * 24 * 60;  // 43,200 minutes
const errorBudgetMinutes = totalMinutes * (1 - SLO);  // 43.2 minutes

// Track error budget consumption
class ErrorBudget {
  private consumedMinutes = 0;
  private readonly budgetMinutes: number;

  constructor(slo: number, periodDays: number) {
    const totalMinutes = periodDays * 24 * 60;
    this.budgetMinutes = totalMinutes * (1 - slo);
  }

  recordOutage(durationMinutes: number) {
    this.consumedMinutes += durationMinutes;
  }

  get remaining(): number {
    return this.budgetMinutes - this.consumedMinutes;
  }

  get percentConsumed(): number {
    return (this.consumedMinutes / this.budgetMinutes) * 100;
  }

  get isExhausted(): boolean {
    return this.remaining <= 0;
  }
}
```

---

## Observability

### Three Pillars

```
┌─────────────────────────────────────────────────────────────┐
│                     Observability                            │
├───────────────────┬───────────────────┬────────────────────┤
│      Metrics      │       Logs        │      Traces        │
├───────────────────┼───────────────────┼────────────────────┤
│ - Counters        │ - Structured      │ - Distributed      │
│ - Gauges          │ - Contextual      │ - Request flow     │
│ - Histograms      │ - Searchable      │ - Latency breakdown│
│ - Aggregated      │ - High volume     │ - Service deps     │
└───────────────────┴───────────────────┴────────────────────┘
```

### Metrics with Prometheus

```typescript
import { Counter, Histogram, Gauge, register } from 'prom-client';

// Counter - monotonically increasing
const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'path', 'status']
});

// Histogram - distribution of values
const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration',
  labelNames: ['method', 'path'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 5]
});

// Gauge - can go up or down
const activeConnections = new Gauge({
  name: 'active_connections',
  help: 'Number of active connections'
});

// Middleware
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;

    httpRequestsTotal
      .labels(req.method, req.path, res.statusCode.toString())
      .inc();

    httpRequestDuration
      .labels(req.method, req.path)
      .observe(duration);
  });

  next();
});

// Expose metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

### Structured Logging

```typescript
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label })
  }
});

// Add request context
function createRequestLogger(req: Request) {
  return logger.child({
    requestId: req.headers['x-request-id'] || crypto.randomUUID(),
    userId: req.user?.id,
    path: req.path,
    method: req.method
  });
}

// Usage
app.use((req, res, next) => {
  req.log = createRequestLogger(req);
  next();
});

app.get('/api/users/:id', async (req, res) => {
  req.log.info({ userId: req.params.id }, 'Fetching user');

  try {
    const user = await getUser(req.params.id);
    req.log.info({ user: user.id }, 'User found');
    res.json(user);
  } catch (error) {
    req.log.error({ error }, 'Failed to fetch user');
    res.status(500).json({ error: 'Internal error' });
  }
});
```

### Distributed Tracing

```typescript
import { trace, SpanStatusCode } from '@opentelemetry/api';

const tracer = trace.getTracer('my-service');

async function processOrder(orderId: string) {
  return tracer.startActiveSpan('processOrder', async (span) => {
    span.setAttribute('order.id', orderId);

    try {
      // Child span for database
      await tracer.startActiveSpan('db.getOrder', async (dbSpan) => {
        const order = await db.orders.findById(orderId);
        dbSpan.setAttribute('order.items', order.items.length);
        dbSpan.end();
        return order;
      });

      // Child span for external API
      await tracer.startActiveSpan('payment.process', async (paymentSpan) => {
        paymentSpan.setAttribute('payment.provider', 'stripe');
        await paymentService.charge(order);
        paymentSpan.end();
      });

      span.setStatus({ code: SpanStatusCode.OK });
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message
      });
      span.recordException(error);
      throw error;
    } finally {
      span.end();
    }
  });
}
```

---

## Incident Management

### Incident Response Process

```
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│  Detect  │ → │  Triage  │ → │ Mitigate │ → │ Resolve  │ → │  Review  │
└──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘
     │              │              │              │              │
  Alerts       Severity       Stop bleeding   Root cause    Postmortem
  Monitors     On-call        Rollback        Fix issue     Learnings
  Reports      Escalate       Communicate     Deploy fix    Action items
```

### Incident Severity Levels

| Severity | Impact | Response Time | Example |
|----------|--------|---------------|---------|
| SEV1 | Complete outage | Immediate | Site down |
| SEV2 | Major degradation | < 15 min | Payment failures |
| SEV3 | Minor impact | < 1 hour | Slow performance |
| SEV4 | Minimal impact | Next business day | Minor bug |

### Runbook Template

```markdown
# Runbook: Database Connection Failures

## Symptoms
- Error logs: "ECONNREFUSED" or "Connection timeout"
- Metric: `db_connection_errors` > 10/min
- Alert: "Database connectivity degraded"

## Impact
- User requests failing
- Data writes not persisting

## Diagnosis Steps

1. Check database status
   ```bash
   kubectl get pods -l app=postgres
   psql -h $DB_HOST -U $DB_USER -c "SELECT 1"
   ```

2. Check connection pool
   ```bash
   curl localhost:8080/metrics | grep db_pool
   ```

3. Check network connectivity
   ```bash
   nc -zv $DB_HOST 5432
   ```

## Mitigation

### If database is down:
1. Check pod logs: `kubectl logs -l app=postgres`
2. Restart if necessary: `kubectl rollout restart deployment/postgres`

### If connection pool exhausted:
1. Scale up application: `kubectl scale deployment/api --replicas=5`
2. Increase pool size in config

## Escalation
- Primary: @database-team
- Secondary: @platform-team
- After hours: PagerDuty
```

### Postmortem Template

```markdown
# Postmortem: Payment Service Outage

**Date**: 2024-01-15
**Duration**: 45 minutes (14:30 - 15:15 UTC)
**Severity**: SEV1
**Author**: Jane Smith

## Summary
Payment processing was unavailable for 45 minutes due to
database connection pool exhaustion.

## Impact
- 2,500 failed transactions
- $150,000 in delayed revenue
- 500 customer support tickets

## Timeline
- 14:30 - Alert fired: "Payment error rate > 5%"
- 14:32 - On-call engineer acknowledged
- 14:35 - Identified DB connection errors in logs
- 14:45 - Root cause identified: connection leak
- 15:00 - Deployed hotfix
- 15:15 - Service fully recovered

## Root Cause
A code change introduced a connection leak where connections
were not returned to the pool after timeout errors.

## What Went Well
- Alerts fired promptly
- Team mobilized quickly
- Clear escalation path

## What Went Poorly
- Took 10 minutes to identify root cause
- No runbook for this specific scenario
- Connection pool metrics not in dashboard

## Action Items
- [ ] Add connection pool metrics to dashboard (Owner: Bob, Due: 2024-01-22)
- [ ] Create runbook for DB connection issues (Owner: Jane, Due: 2024-01-25)
- [ ] Add integration test for connection handling (Owner: Alice, Due: 2024-01-29)
- [ ] Review all DB connection code paths (Owner: Team, Due: 2024-02-01)

## Lessons Learned
Connection pool exhaustion can cascade quickly. Need better
visibility into pool utilization and earlier alerting.
```

---

## Chaos Engineering

### Principles

```
1. Start with a hypothesis about steady state
2. Introduce realistic failures
3. Run experiments in production (carefully)
4. Minimize blast radius
5. Learn and improve
```

### Chaos Experiments

```typescript
// Chaos Monkey - Random instance termination
class ChaosMonkey {
  async run() {
    const instances = await getRunningInstances();
    const victim = instances[Math.floor(Math.random() * instances.length)];

    console.log(`Terminating instance: ${victim.id}`);
    await terminateInstance(victim.id);
  }
}

// Latency injection
function withLatencyChaos(fn: Function, config: ChaosConfig) {
  return async (...args: any[]) => {
    if (config.enabled && Math.random() < config.probability) {
      const delay = config.minLatency +
        Math.random() * (config.maxLatency - config.minLatency);
      await sleep(delay);
    }
    return fn(...args);
  };
}

// Error injection
function withErrorChaos(fn: Function, config: ChaosConfig) {
  return async (...args: any[]) => {
    if (config.enabled && Math.random() < config.probability) {
      throw new Error('Chaos: Injected failure');
    }
    return fn(...args);
  };
}
```

---

## Disaster Recovery

### Recovery Objectives

| Metric | Definition | Example |
|--------|------------|---------|
| RTO | Recovery Time Objective | 4 hours |
| RPO | Recovery Point Objective | 1 hour (max data loss) |

### Backup Strategy

```yaml
# 3-2-1 Backup Rule
# 3 copies of data
# 2 different storage types
# 1 offsite location

backup_strategy:
  primary:
    type: "continuous replication"
    location: "us-east-1"
    retention: "7 days"

  secondary:
    type: "daily snapshots"
    location: "us-west-2"
    retention: "30 days"

  tertiary:
    type: "weekly archives"
    location: "S3 Glacier"
    retention: "1 year"

  testing:
    frequency: "monthly"
    procedure: "restore to staging"
```

---

## Related Skills

- [[monitoring-observability]] - Detailed monitoring
- [[devops-cicd]] - Deployment reliability
- [[system-design]] - Designing for reliability
