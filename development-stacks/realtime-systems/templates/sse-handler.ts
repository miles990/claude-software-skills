/**
 * Server-Sent Events (SSE) Handler Template
 * Usage: Copy and adapt for your SSE server
 * Requires: Express or similar HTTP framework
 */

import { Request, Response } from 'express';

// ===========================================
// Types
// ===========================================

interface SSEClient {
  id: string;
  res: Response;
  userId?: string;
  channels: Set<string>;
  lastEventId: number;
}

interface SSEEvent {
  id?: number;
  event?: string;
  data: unknown;
  retry?: number;
}

// ===========================================
// SSE Manager
// ===========================================

class SSEManager {
  private clients: Map<string, SSEClient> = new Map();
  private channels: Map<string, Set<string>> = new Map();
  private eventCounter = 0;

  /**
   * Handle new SSE connection
   */
  connect(req: Request, res: Response, userId?: string): string {
    const clientId = this.generateId();

    // Set SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    });

    // Handle Last-Event-ID for reconnection
    const lastEventId = parseInt(req.headers['last-event-id'] as string) || 0;

    const client: SSEClient = {
      id: clientId,
      res,
      userId,
      channels: new Set(),
      lastEventId,
    };

    this.clients.set(clientId, client);
    console.log(`SSE client connected: ${clientId}`);

    // Send initial connection event
    this.sendToClient(client, {
      event: 'connected',
      data: { clientId },
    });

    // Handle disconnect
    req.on('close', () => {
      this.disconnect(clientId);
    });

    // Keep-alive ping
    const pingInterval = setInterval(() => {
      if (this.clients.has(clientId)) {
        this.sendToClient(client, { event: 'ping', data: {} });
      } else {
        clearInterval(pingInterval);
      }
    }, 30000);

    return clientId;
  }

  /**
   * Disconnect client
   */
  disconnect(clientId: string): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Leave all channels
    client.channels.forEach((channel) => {
      this.leaveChannel(clientId, channel);
    });

    this.clients.delete(clientId);
    console.log(`SSE client disconnected: ${clientId}`);
  }

  // ===========================================
  // Channel Management
  // ===========================================

  /**
   * Subscribe client to channel
   */
  joinChannel(clientId: string, channel: string): boolean {
    const client = this.clients.get(clientId);
    if (!client) return false;

    if (!this.channels.has(channel)) {
      this.channels.set(channel, new Set());
    }
    this.channels.get(channel)!.add(clientId);
    client.channels.add(channel);

    this.sendToClient(client, {
      event: 'subscribed',
      data: { channel },
    });

    return true;
  }

  /**
   * Unsubscribe client from channel
   */
  leaveChannel(clientId: string, channel: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      client.channels.delete(channel);
    }

    this.channels.get(channel)?.delete(clientId);

    // Clean up empty channels
    if (this.channels.get(channel)?.size === 0) {
      this.channels.delete(channel);
    }
  }

  // ===========================================
  // Event Sending
  // ===========================================

  /**
   * Send event to specific client
   */
  sendToClient(client: SSEClient, event: SSEEvent): void {
    if (!client.res.writable) return;

    const eventId = ++this.eventCounter;
    let message = '';

    message += `id: ${eventId}\n`;
    if (event.event) {
      message += `event: ${event.event}\n`;
    }
    if (event.retry) {
      message += `retry: ${event.retry}\n`;
    }
    message += `data: ${JSON.stringify(event.data)}\n\n`;

    client.res.write(message);
    client.lastEventId = eventId;
  }

  /**
   * Send event to specific client by ID
   */
  send(clientId: string, event: SSEEvent): boolean {
    const client = this.clients.get(clientId);
    if (!client) return false;

    this.sendToClient(client, event);
    return true;
  }

  /**
   * Broadcast to all clients
   */
  broadcast(event: SSEEvent, excludeId?: string): void {
    this.clients.forEach((client) => {
      if (client.id !== excludeId) {
        this.sendToClient(client, event);
      }
    });
  }

  /**
   * Broadcast to channel
   */
  broadcastToChannel(channel: string, event: SSEEvent, excludeId?: string): void {
    const clientIds = this.channels.get(channel);
    if (!clientIds) return;

    clientIds.forEach((clientId) => {
      if (clientId !== excludeId) {
        const client = this.clients.get(clientId);
        if (client) {
          this.sendToClient(client, event);
        }
      }
    });
  }

  /**
   * Send to user (all their connections)
   */
  sendToUser(userId: string, event: SSEEvent): void {
    this.clients.forEach((client) => {
      if (client.userId === userId) {
        this.sendToClient(client, event);
      }
    });
  }

  // ===========================================
  // Utilities
  // ===========================================

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getClientCount(): number {
    return this.clients.size;
  }

  getChannelCount(): number {
    return this.channels.size;
  }

  getChannelClients(channel: string): string[] {
    return Array.from(this.channels.get(channel) || []);
  }
}

// ===========================================
// Express Route Handlers
// ===========================================

const sseManager = new SSEManager();

/**
 * SSE connection endpoint
 * GET /events
 */
export function sseHandler(req: Request, res: Response): void {
  const userId = (req as any).user?.id; // From auth middleware
  sseManager.connect(req, res, userId);
}

/**
 * Subscribe to channel
 * POST /events/subscribe
 */
export function subscribeHandler(req: Request, res: Response): void {
  const { clientId, channel } = req.body;
  const success = sseManager.joinChannel(clientId, channel);
  res.json({ success, channel });
}

/**
 * Unsubscribe from channel
 * POST /events/unsubscribe
 */
export function unsubscribeHandler(req: Request, res: Response): void {
  const { clientId, channel } = req.body;
  sseManager.leaveChannel(clientId, channel);
  res.json({ success: true });
}

/**
 * Send event (internal/admin use)
 * POST /events/send
 */
export function sendEventHandler(req: Request, res: Response): void {
  const { channel, event, data } = req.body;

  if (channel) {
    sseManager.broadcastToChannel(channel, { event, data });
  } else {
    sseManager.broadcast({ event, data });
  }

  res.json({ success: true });
}

export { SSEManager, SSEClient, SSEEvent, sseManager };
