# Real-time Systems Templates

Templates for WebSocket and Server-Sent Events (SSE) implementations.

## Files

| Template | Purpose |
|----------|---------|
| `websocket-server.ts` | WebSocket server with rooms and heartbeat |
| `sse-handler.ts` | SSE handler with channels and reconnection |

## WebSocket vs SSE

| Feature | WebSocket | SSE |
|---------|-----------|-----|
| Direction | Bidirectional | Server → Client only |
| Protocol | ws:// / wss:// | HTTP |
| Reconnection | Manual | Automatic |
| Binary data | Yes | No (text only) |
| Use case | Chat, gaming, collaboration | Notifications, feeds, progress |

## Usage

### WebSocket Server

```bash
npm install ws
```

```typescript
import { WebSocketManager } from './websocket-server';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';

const server = createServer();
const wss = new WebSocketServer({ server });
const wsManager = new WebSocketManager(wss);

server.listen(8080);
```

**Client messages:**
```javascript
// Join room
ws.send(JSON.stringify({ type: 'join', payload: 'room-1' }));

// Leave room
ws.send(JSON.stringify({ type: 'leave', payload: 'room-1' }));

// Broadcast to room
ws.send(JSON.stringify({
  type: 'broadcast',
  room: 'room-1',
  payload: { message: 'Hello!' }
}));

// Ping
ws.send(JSON.stringify({ type: 'ping' }));
```

### SSE Handler (Express)

```typescript
import express from 'express';
import { sseHandler, subscribeHandler, sendEventHandler } from './sse-handler';

const app = express();

// SSE endpoint
app.get('/events', sseHandler);

// Channel management
app.post('/events/subscribe', express.json(), subscribeHandler);
app.post('/events/send', express.json(), sendEventHandler);

app.listen(3000);
```

**Client usage:**
```javascript
const eventSource = new EventSource('/events');

eventSource.onmessage = (e) => {
  console.log('Message:', JSON.parse(e.data));
};

eventSource.addEventListener('connected', (e) => {
  const { clientId } = JSON.parse(e.data);
  // Subscribe to channel
  fetch('/events/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId, channel: 'updates' })
  });
});

// Automatic reconnection with Last-Event-ID
eventSource.onerror = () => {
  console.log('Reconnecting...');
};
```

## Key Features

### WebSocket Server
- Room-based messaging
- Heartbeat (ping/pong) every 30s
- Custom message handling (override `onCustomMessage`)
- Client metadata storage

### SSE Handler
- Channel subscriptions
- Automatic reconnection support (Last-Event-ID)
- Per-user broadcasting
- Keep-alive pings

## Production Considerations

### Scaling
```typescript
// Use Redis adapter for multi-instance
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

const pubClient = createClient({ url: 'redis://localhost:6379' });
const subClient = pubClient.duplicate();
```

### Authentication
```typescript
// WebSocket: Verify on connection
wss.on('connection', (ws, req) => {
  const token = new URL(req.url, 'http://localhost').searchParams.get('token');
  if (!verifyToken(token)) {
    ws.close(1008, 'Unauthorized');
    return;
  }
});

// SSE: Use middleware
app.get('/events', authMiddleware, sseHandler);
```

### Rate Limiting
```typescript
import rateLimit from 'express-rate-limit';

const sseLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10, // 10 connections per minute
});

app.get('/events', sseLimiter, sseHandler);
```
