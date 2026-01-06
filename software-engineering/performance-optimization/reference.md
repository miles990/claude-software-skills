# Performance Optimization Reference

Detailed reference for profiling, benchmarking, and optimization techniques.

## Profiling Tools

### Node.js Profiling

```bash
# Built-in profiler
node --prof app.js
node --prof-process isolate-*.log > profile.txt

# Clinic.js suite
npm install -g clinic
clinic doctor -- node app.js    # Identify bottlenecks
clinic flame -- node app.js     # CPU flame graph
clinic bubbleprof -- node app.js # Async flow
clinic heapprofiler -- node app.js # Memory

# Chrome DevTools
node --inspect app.js
# Open chrome://inspect
```

### Python Profiling

```python
# cProfile (built-in)
import cProfile
import pstats

profiler = cProfile.Profile()
profiler.enable()
# ... code to profile
profiler.disable()

stats = pstats.Stats(profiler)
stats.sort_stats('cumulative')
stats.print_stats(20)

# Line profiler (pip install line_profiler)
# Add @profile decorator to functions
# Run: kernprof -l -v script.py

# Memory profiler (pip install memory_profiler)
from memory_profiler import profile

@profile
def memory_intensive_function():
    data = [i ** 2 for i in range(1000000)]
    return data

# Run: python -m memory_profiler script.py
```

### Go Profiling

```go
import (
    "net/http"
    _ "net/http/pprof"
    "runtime/pprof"
)

// Enable HTTP profiling endpoint
func main() {
    go func() {
        http.ListenAndServe("localhost:6060", nil)
    }()
    // ...
}

// Access at:
// http://localhost:6060/debug/pprof/
// http://localhost:6060/debug/pprof/heap
// http://localhost:6060/debug/pprof/goroutine

// CPU profile to file
f, _ := os.Create("cpu.prof")
pprof.StartCPUProfile(f)
defer pprof.StopCPUProfile()

// Analyze: go tool pprof cpu.prof
```

### Rust Profiling

```bash
# Flamegraph
cargo install flamegraph
cargo flamegraph --bin myapp

# Perf (Linux)
perf record --call-graph dwarf ./target/release/myapp
perf report

# Valgrind (memory)
valgrind --tool=memcheck ./target/release/myapp
valgrind --tool=callgrind ./target/release/myapp
```

## Benchmarking

### Node.js Benchmarking

```typescript
// Using Benchmark.js
import Benchmark from 'benchmark';

const suite = new Benchmark.Suite();

suite
  .add('Array.push', function() {
    const arr = [];
    for (let i = 0; i < 1000; i++) arr.push(i);
  })
  .add('Array spread', function() {
    let arr = [];
    for (let i = 0; i < 1000; i++) arr = [...arr, i];
  })
  .on('cycle', (event) => {
    console.log(String(event.target));
  })
  .on('complete', function() {
    console.log('Fastest: ' + this.filter('fastest').map('name'));
  })
  .run({ async: true });

// Using built-in console.time
console.time('operation');
await expensiveOperation();
console.timeEnd('operation');

// High-resolution timing
const { performance } = require('perf_hooks');
const start = performance.now();
await expensiveOperation();
const duration = performance.now() - start;
console.log(`Duration: ${duration.toFixed(2)}ms`);
```

### Python Benchmarking

```python
import timeit

# Simple timing
result = timeit.timeit(
    'sum(range(1000))',
    number=10000
)
print(f"Average: {result / 10000 * 1000:.4f}ms")

# Compare implementations
setup = '''
data = list(range(1000))
'''

implementations = {
    'list_comp': '[x * 2 for x in data]',
    'map': 'list(map(lambda x: x * 2, data))',
    'loop': '''
result = []
for x in data:
    result.append(x * 2)
''',
}

for name, code in implementations.items():
    time = timeit.timeit(code, setup=setup, number=10000)
    print(f"{name}: {time:.4f}s")

# Using pytest-benchmark
# pip install pytest-benchmark
def test_benchmark(benchmark):
    result = benchmark(expensive_function, arg1, arg2)
    assert result is not None
```

### Go Benchmarking

```go
// benchmark_test.go
package main

import "testing"

func BenchmarkFunctionA(b *testing.B) {
    for i := 0; i < b.N; i++ {
        FunctionA()
    }
}

func BenchmarkFunctionB(b *testing.B) {
    for i := 0; i < b.N; i++ {
        FunctionB()
    }
}

// With memory allocation tracking
func BenchmarkWithAllocs(b *testing.B) {
    b.ReportAllocs()
    for i := 0; i < b.N; i++ {
        AllocatingFunction()
    }
}

// Run: go test -bench=. -benchmem
```

## Database Query Optimization

### PostgreSQL Query Analysis

```sql
-- Enable timing
\timing on

-- Explain analyze with buffers
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM orders
WHERE user_id = 123
ORDER BY created_at DESC
LIMIT 10;

-- Check table statistics
SELECT
    relname,
    seq_scan,
    seq_tup_read,
    idx_scan,
    idx_tup_fetch
FROM pg_stat_user_tables
ORDER BY seq_tup_read DESC;

-- Find missing indexes
SELECT
    schemaname,
    relname,
    seq_scan,
    seq_tup_read,
    idx_scan,
    idx_tup_fetch,
    seq_tup_read / NULLIF(seq_scan, 0) as avg_seq_tup
FROM pg_stat_user_tables
WHERE seq_scan > 0
ORDER BY seq_tup_read DESC
LIMIT 10;

-- Slow query log
-- postgresql.conf
-- log_min_duration_statement = 1000  -- Log queries > 1s

-- Check index usage
SELECT
    indexrelname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

### MySQL Query Analysis

```sql
-- Enable profiling
SET profiling = 1;

-- Run query
SELECT * FROM orders WHERE user_id = 123;

-- Show profile
SHOW PROFILES;
SHOW PROFILE FOR QUERY 1;

-- Explain with execution plan
EXPLAIN FORMAT=JSON
SELECT * FROM orders WHERE user_id = 123;

-- Check slow query log
-- my.cnf
-- slow_query_log = 1
-- slow_query_log_file = /var/log/mysql/slow.log
-- long_query_time = 1

-- Analyze table
ANALYZE TABLE orders;

-- Check index cardinality
SHOW INDEX FROM orders;
```

### Query Optimization Patterns

```sql
-- ❌ Using SELECT *
SELECT * FROM users WHERE id = 1;

-- ✅ Select only needed columns
SELECT id, name, email FROM users WHERE id = 1;

-- ❌ Using functions on indexed columns
SELECT * FROM orders WHERE YEAR(created_at) = 2024;

-- ✅ Use range instead
SELECT * FROM orders
WHERE created_at >= '2024-01-01'
  AND created_at < '2025-01-01';

-- ❌ Using OR with different columns
SELECT * FROM users
WHERE email = 'a@b.com' OR phone = '1234567890';

-- ✅ Use UNION for better index usage
SELECT * FROM users WHERE email = 'a@b.com'
UNION
SELECT * FROM users WHERE phone = '1234567890';

-- ❌ Using LIKE with leading wildcard
SELECT * FROM products WHERE name LIKE '%phone%';

-- ✅ Use full-text search
CREATE FULLTEXT INDEX idx_product_name ON products(name);
SELECT * FROM products WHERE MATCH(name) AGAINST('phone');

-- ❌ Selecting large result sets
SELECT * FROM logs WHERE level = 'info';

-- ✅ Use pagination
SELECT * FROM logs WHERE level = 'info'
ORDER BY id DESC
LIMIT 100 OFFSET 0;

-- ✅ Better: Keyset pagination
SELECT * FROM logs
WHERE level = 'info' AND id < 12345
ORDER BY id DESC
LIMIT 100;
```

## Caching Strategies

### Cache Patterns Comparison

| Pattern | Description | Use Case | Consistency |
|---------|-------------|----------|-------------|
| Cache-Aside | App manages cache | General reads | Eventually |
| Read-Through | Cache manages reads | Transparent caching | Eventually |
| Write-Through | Cache manages writes | Read-heavy | Strong |
| Write-Behind | Async writes | Write-heavy | Eventually |
| Refresh-Ahead | Proactive refresh | Predictable access | Strong |

### Redis Caching Implementation

```typescript
import Redis from 'ioredis';

const redis = new Redis({
  host: 'localhost',
  port: 6379,
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => Math.min(times * 50, 2000),
});

// Cache-aside with stale-while-revalidate
async function getWithSWR<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 3600,
  staleSeconds: number = 60
): Promise<T> {
  const cached = await redis.get(key);

  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    const age = Date.now() - timestamp;

    // Fresh: return immediately
    if (age < ttlSeconds * 1000) {
      return data;
    }

    // Stale: return but refresh in background
    if (age < (ttlSeconds + staleSeconds) * 1000) {
      refreshInBackground(key, fetcher, ttlSeconds);
      return data;
    }
  }

  // Expired or miss: fetch and cache
  const data = await fetcher();
  await redis.set(
    key,
    JSON.stringify({ data, timestamp: Date.now() }),
    'EX',
    ttlSeconds + staleSeconds
  );
  return data;
}

async function refreshInBackground<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number
) {
  try {
    const data = await fetcher();
    await redis.set(
      key,
      JSON.stringify({ data, timestamp: Date.now() }),
      'EX',
      ttlSeconds
    );
  } catch (error) {
    console.error('Background refresh failed:', error);
  }
}

// Cache stampede prevention with mutex
async function getWithMutex<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 3600
): Promise<T | null> {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  const lockKey = `lock:${key}`;
  const locked = await redis.set(lockKey, '1', 'EX', 10, 'NX');

  if (locked) {
    try {
      const data = await fetcher();
      await redis.set(key, JSON.stringify(data), 'EX', ttlSeconds);
      return data;
    } finally {
      await redis.del(lockKey);
    }
  } else {
    // Wait and retry
    await new Promise((r) => setTimeout(r, 100));
    return getWithMutex(key, fetcher, ttlSeconds);
  }
}
```

### HTTP Caching Headers

```typescript
// Cache-Control directives
const cacheStrategies = {
  // Static assets (JS, CSS, images)
  static: {
    'Cache-Control': 'public, max-age=31536000, immutable',
  },

  // Dynamic but cacheable
  dynamic: {
    'Cache-Control': 'private, max-age=3600, must-revalidate',
    'ETag': generateETag(content),
  },

  // Never cache
  noCache: {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  },

  // Stale-while-revalidate
  swr: {
    'Cache-Control': 'max-age=60, stale-while-revalidate=3600',
  },
};

// ETag implementation
import crypto from 'crypto';

function generateETag(content: string | Buffer): string {
  const hash = crypto.createHash('md5').update(content).digest('hex');
  return `"${hash}"`;
}

// Conditional response
app.get('/api/resource/:id', async (req, res) => {
  const data = await getResource(req.params.id);
  const etag = generateETag(JSON.stringify(data));

  if (req.headers['if-none-match'] === etag) {
    return res.status(304).end();
  }

  res.set('ETag', etag);
  res.set('Cache-Control', 'private, max-age=60');
  res.json(data);
});
```

## Memory Optimization

### Node.js Memory Management

```typescript
// Monitor memory usage
function logMemoryUsage() {
  const usage = process.memoryUsage();
  console.log({
    rss: `${(usage.rss / 1024 / 1024).toFixed(2)} MB`,
    heapTotal: `${(usage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
    heapUsed: `${(usage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
    external: `${(usage.external / 1024 / 1024).toFixed(2)} MB`,
  });
}

// Stream large files instead of loading into memory
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { createGzip } from 'zlib';

async function compressFile(input: string, output: string) {
  await pipeline(
    createReadStream(input),
    createGzip(),
    createWriteStream(output)
  );
}

// Process large datasets in chunks
async function* processInChunks<T>(
  items: T[],
  chunkSize: number
): AsyncGenerator<T[], void, unknown> {
  for (let i = 0; i < items.length; i += chunkSize) {
    yield items.slice(i, i + chunkSize);
    // Allow GC between chunks
    await new Promise((r) => setImmediate(r));
  }
}

async function processLargeDataset(items: any[]) {
  for await (const chunk of processInChunks(items, 1000)) {
    await processChunk(chunk);
  }
}

// WeakMap for object metadata (auto garbage collected)
const metadata = new WeakMap<object, any>();

function attachMetadata(obj: object, data: any) {
  metadata.set(obj, data);
}

// Object is garbage collected -> metadata is too
```

### Memory Leak Detection

```typescript
// Common leak patterns

// ❌ Leak: Growing array
const cache: any[] = [];
function processRequest(data: any) {
  cache.push(data); // Never cleared
}

// ✅ Fix: LRU cache with size limit
import LRU from 'lru-cache';
const cache = new LRU({ max: 500 });

// ❌ Leak: Event listeners not removed
class Emitter {
  handler = () => console.log('event');

  subscribe() {
    eventBus.on('event', this.handler);
  }

  // Missing unsubscribe!
}

// ✅ Fix: Always remove listeners
class Emitter {
  handler = () => console.log('event');

  subscribe() {
    eventBus.on('event', this.handler);
  }

  unsubscribe() {
    eventBus.off('event', this.handler);
  }
}

// ❌ Leak: Closures holding references
function createHandler(largeData: Buffer) {
  return function handler() {
    // largeData is retained even if not used
    console.log('handling');
  };
}

// ✅ Fix: Don't capture unnecessary data
function createHandler() {
  return function handler() {
    console.log('handling');
  };
}
```

## Network Optimization

### Request Batching

```typescript
// Batch multiple requests into one
class RequestBatcher<T, R> {
  private queue: Array<{
    key: T;
    resolve: (value: R) => void;
    reject: (error: Error) => void;
  }> = [];
  private timeout: NodeJS.Timeout | null = null;

  constructor(
    private batchFn: (keys: T[]) => Promise<R[]>,
    private maxBatchSize: number = 100,
    private maxWaitMs: number = 10
  ) {}

  async load(key: T): Promise<R> {
    return new Promise((resolve, reject) => {
      this.queue.push({ key, resolve, reject });

      if (this.queue.length >= this.maxBatchSize) {
        this.flush();
      } else if (!this.timeout) {
        this.timeout = setTimeout(() => this.flush(), this.maxWaitMs);
      }
    });
  }

  private async flush() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    const batch = this.queue.splice(0, this.maxBatchSize);
    if (batch.length === 0) return;

    try {
      const keys = batch.map((item) => item.key);
      const results = await this.batchFn(keys);
      batch.forEach((item, index) => item.resolve(results[index]));
    } catch (error) {
      batch.forEach((item) => item.reject(error as Error));
    }
  }
}

// Usage
const userLoader = new RequestBatcher<string, User>(
  async (ids) => db.users.findByIds(ids)
);

// These get batched into one query
const [user1, user2, user3] = await Promise.all([
  userLoader.load('1'),
  userLoader.load('2'),
  userLoader.load('3'),
]);
```

### Connection Pooling

```typescript
// HTTP Agent pooling
import http from 'http';
import https from 'https';

const httpAgent = new http.Agent({
  keepAlive: true,
  maxSockets: 50,
  maxFreeSockets: 10,
  timeout: 60000,
});

const httpsAgent = new https.Agent({
  keepAlive: true,
  maxSockets: 50,
  maxFreeSockets: 10,
  timeout: 60000,
});

// Use with fetch
fetch('https://api.example.com/data', {
  agent: httpsAgent,
});

// Database connection pool
import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  database: 'mydb',
  max: 20,                      // Maximum pool size
  idleTimeoutMillis: 30000,     // Close idle connections after 30s
  connectionTimeoutMillis: 5000, // Connection timeout
  allowExitOnIdle: true,        // Allow process to exit when idle
});

// Monitor pool
pool.on('connect', () => console.log('New connection'));
pool.on('remove', () => console.log('Connection removed'));
pool.on('error', (err) => console.error('Pool error', err));

console.log({
  total: pool.totalCount,
  idle: pool.idleCount,
  waiting: pool.waitingCount,
});
```

## Frontend Performance Metrics

### Web Vitals Measurement

```typescript
import { onCLS, onINP, onLCP, onFCP, onTTFB } from 'web-vitals';

function sendToAnalytics(metric: any) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    id: metric.id,
    navigationType: metric.navigationType,
  });

  // Use sendBeacon for reliability
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/analytics', body);
  } else {
    fetch('/analytics', { body, method: 'POST', keepalive: true });
  }
}

// Register observers
onCLS(sendToAnalytics);
onINP(sendToAnalytics);
onLCP(sendToAnalytics);
onFCP(sendToAnalytics);
onTTFB(sendToAnalytics);

// Custom metrics
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(`${entry.name}: ${entry.duration}ms`);
  }
});

observer.observe({ entryTypes: ['measure', 'resource', 'longtask'] });
```

### Performance Budget

```json
// performance-budget.json
{
  "resourceSizes": [
    {
      "resourceType": "script",
      "budget": 300
    },
    {
      "resourceType": "stylesheet",
      "budget": 100
    },
    {
      "resourceType": "image",
      "budget": 500
    },
    {
      "resourceType": "font",
      "budget": 100
    },
    {
      "resourceType": "total",
      "budget": 1000
    }
  ],
  "resourceCounts": [
    {
      "resourceType": "script",
      "budget": 10
    },
    {
      "resourceType": "stylesheet",
      "budget": 5
    }
  ],
  "timings": [
    {
      "metric": "first-contentful-paint",
      "budget": 1500
    },
    {
      "metric": "largest-contentful-paint",
      "budget": 2500
    },
    {
      "metric": "interactive",
      "budget": 3000
    },
    {
      "metric": "total-blocking-time",
      "budget": 300
    }
  ]
}
```

## Load Testing

### k6 Load Test Script

```javascript
// load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '30s', target: 20 },   // Ramp up
    { duration: '1m', target: 20 },    // Stay at 20
    { duration: '30s', target: 50 },   // Ramp up more
    { duration: '1m', target: 50 },    // Stay at 50
    { duration: '30s', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% under 500ms
    errors: ['rate<0.1'],               // Error rate under 10%
  },
};

export default function () {
  const res = http.get('http://localhost:3000/api/users');

  const success = check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  errorRate.add(!success);

  sleep(1);
}

// Run: k6 run load-test.js
```

## References

| Tool | Purpose | URL |
|------|---------|-----|
| Clinic.js | Node.js profiling | https://clinicjs.org/ |
| Lighthouse | Web performance | https://developers.google.com/web/tools/lighthouse |
| k6 | Load testing | https://k6.io/ |
| pg_stat_statements | PostgreSQL analysis | https://www.postgresql.org/docs/current/pgstatstatements.html |
| Redis Insight | Redis debugging | https://redis.com/redis-enterprise/redis-insight/ |
| Webpack Bundle Analyzer | Bundle size | https://www.npmjs.com/package/webpack-bundle-analyzer |
