# Reliability Engineering Templates

Templates for building resilient services.

## Files

| Template | Purpose |
|----------|---------|
| `health-check.ts` | Health check endpoints |
| `circuit-breaker.ts` | Circuit breaker pattern |

## Usage

### Health Checks

```typescript
import {
  HealthCheckManager,
  createDatabaseCheck,
  createRedisCheck,
  createMemoryCheck,
} from './health-check';

const health = new HealthCheckManager('1.0.0');

// Register checks
health.register('database', createDatabaseCheck('db', () => db.query('SELECT 1')));
health.register('redis', createRedisCheck('redis', () => redis.ping()));
health.register('memory', createMemoryCheck());

// Express endpoints
app.get('/healthz', (req, res) => res.json({ status: 'ok' }));
app.get('/readyz', async (req, res) => {
  const report = await health.readinessCheck();
  res.status(report.status === 'healthy' ? 200 : 503).json(report);
});
```

### Circuit Breaker

```typescript
import { CircuitBreaker, CircuitOpenError } from './circuit-breaker';

const breaker = new CircuitBreaker({
  failureThreshold: 5,
  resetTimeout: 30000,
  timeout: 5000,
});

async function callService() {
  try {
    return await breaker.execute(async () => {
      return fetch('https://api.example.com/data');
    });
  } catch (error) {
    if (error instanceof CircuitOpenError) {
      return fallbackData;
    }
    throw error;
  }
}
```

## Kubernetes Endpoints

| Endpoint | Purpose | Response |
|----------|---------|----------|
| `/healthz` | Liveness | `{ status: 'ok' }` |
| `/readyz` | Readiness | Full health report |
| `/health` | Detailed | All check results |

```yaml
# Kubernetes deployment
livenessProbe:
  httpGet:
    path: /healthz
    port: 8080
  initialDelaySeconds: 10
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /readyz
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 5
```

## Circuit Breaker States

```
┌─────────┐    failure threshold    ┌──────────┐
│  CLOSED │ ───────────────────────▶│   OPEN   │
│         │                         │          │
│ Normal  │                         │ Blocking │
│ traffic │                         │ requests │
└────┬────┘                         └────┬─────┘
     ▲                                   │
     │         ┌───────────┐             │
     │         │ HALF-OPEN │             │
     │◀────────│           │◀────────────┘
  success      │ Testing   │    timeout
  threshold    │ recovery  │    expired
               └───────────┘
```

## Configuration Options

### Health Check
| Option | Default | Description |
|--------|---------|-------------|
| timeout | 5000ms | Check timeout |

### Circuit Breaker
| Option | Default | Description |
|--------|---------|-------------|
| failureThreshold | 5 | Failures to open |
| successThreshold | 2 | Successes to close |
| resetTimeout | 30000ms | Open duration |
| timeout | 10000ms | Request timeout |
| failureRateThreshold | 50% | Rate to open |
| minimumRequests | 10 | Min for rate calc |

## Best Practices

### Health Checks
- Keep checks fast (<5s)
- Check critical dependencies only
- Don't check external services in liveness
- Use readiness for dependencies

### Circuit Breakers
- Use per-service/endpoint
- Configure thresholds based on SLAs
- Implement fallback strategies
- Monitor circuit state

### Fallback Strategies
```typescript
// Cached data
const fallback = await cache.get(key);

// Default value
const fallback = { data: [] };

// Degraded response
const fallback = { partial: true, items: cachedItems };

// Queue for retry
await queue.add({ request, retryAt: Date.now() + 60000 });
```

## Monitoring

```typescript
// Expose metrics
app.get('/metrics', (req, res) => {
  const stats = registry.getAllStats();
  res.json({
    circuit_breakers: stats,
    health: health.getStats(),
  });
});
```

Key metrics to track:
- Circuit state changes
- Failure rates
- Response latencies
- Health check results
