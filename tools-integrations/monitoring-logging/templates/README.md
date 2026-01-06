# Monitoring & Logging Templates

Production-ready monitoring stack configurations.

## Files

| Template | Purpose |
|----------|---------|
| `prometheus.yml` | Prometheus metrics collection config |
| `grafana-dashboard.json` | Node.js application dashboard |
| `docker-compose.monitoring.yml` | Complete monitoring stack |

## Quick Start

```bash
# Copy all templates
cp templates/prometheus.yml ./prometheus.yml
cp templates/docker-compose.monitoring.yml ./docker-compose.monitoring.yml
mkdir -p grafana/dashboards
cp templates/grafana-dashboard.json ./grafana/dashboards/

# Start monitoring stack
docker-compose -f docker-compose.monitoring.yml up -d

# Access
# Prometheus: http://localhost:9090
# Grafana:    http://localhost:3001 (admin/admin)
```

## Components

### Prometheus

Metrics collection and alerting:

```bash
# Check config
promtool check config prometheus.yml

# Reload config (if enabled)
curl -X POST http://localhost:9090/-/reload
```

### Grafana

Visualization and dashboards:

1. Login at `http://localhost:3001`
2. Go to Dashboards → Import
3. Upload `grafana-dashboard.json`

### Node Exporter

Host-level metrics (CPU, memory, disk):

```bash
curl http://localhost:9100/metrics
```

## Application Integration

### Node.js (prom-client)

```typescript
import { Counter, Histogram, collectDefaultMetrics } from 'prom-client';

// Enable default metrics
collectDefaultMetrics();

// Custom metrics
const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status'],
});

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration',
  labelNames: ['method', 'route'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 5],
});

// Expose /metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

### Python (prometheus-client)

```python
from prometheus_client import Counter, Histogram, generate_latest

http_requests = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status']
)

@app.route('/metrics')
def metrics():
    return generate_latest()
```

## Key Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `http_requests_total` | Counter | Total HTTP requests |
| `http_request_duration_seconds` | Histogram | Request latency |
| `nodejs_heap_size_used_bytes` | Gauge | Node.js heap usage |
| `process_cpu_seconds_total` | Counter | CPU time |
