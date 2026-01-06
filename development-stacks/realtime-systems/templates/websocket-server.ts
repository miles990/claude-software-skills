/**
 * WebSocket Server Template
 * Usage: Copy and adapt for your WebSocket server
 * Requires: npm install ws
 */

import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';

// ===========================================
// Types
// ===========================================

interface Client {
  id: string;
  ws: WebSocket;
  userId?: string;
  rooms: Set<string>;
  metadata: Record<string, unknown>;
}

interface Message {
  type: string;
  payload: unknown;
  room?: string;
  timestamp: number;
}

// ===========================================
// WebSocket Manager
// ===========================================

class WebSocketManager {
  private clients: Map<string, Client> = new Map();
  private rooms: Map<string, Set<string>> = new Map();

  constructor(private wss: WebSocketServer) {
    this.setupServer();
  }

  private setupServer(): void {
    this.wss.on('connection', (ws, req) => {
      const clientId = this.generateId();
      const client: Client = {
        id: clientId,
        ws,
        rooms: new Set(),
        metadata: {},
      };

      this.clients.set(clientId, client);
      console.log(`Client connected: ${clientId}`);

      // Send welcome message
      this.send(client, {
        type: 'connected',
        payload: { clientId },
        timestamp: Date.now(),
      });

      // Handle messages
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString()) as Message;
          this.handleMessage(client, message);
        } catch (error) {
          this.send(client, {
            type: 'error',
            payload: { message: 'Invalid message format' },
            timestamp: Date.now(),
          });
        }
      });

      // Handle disconnect
      ws.on('close', () => {
        this.handleDisconnect(client);
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error(`Client ${clientId} error:`, error);
      });

      // Heartbeat
      ws.on('pong', () => {
        client.metadata.lastPong = Date.now();
      });
    });

    // Start heartbeat interval
    setInterval(() => this.heartbeat(), 30000);
  }

  private handleMessage(client: Client, message: Message): void {
    switch (message.type) {
      case 'join':
        this.joinRoom(client, message.payload as string);
        break;
      case 'leave':
        this.leaveRoom(client, message.payload as string);
        break;
      case 'broadcast':
        if (message.room) {
          this.broadcastToRoom(message.room, message);
        } else {
          this.broadcast(message);
        }
        break;
      case 'ping':
        this.send(client, { type: 'pong', payload: null, timestamp: Date.now() });
        break;
      default:
        // Custom message handling
        this.onCustomMessage(client, message);
    }
  }

  // Override this for custom message handling
  protected onCustomMessage(client: Client, message: Message): void {
    console.log(`Custom message from ${client.id}:`, message);
  }

  private handleDisconnect(client: Client): void {
    // Leave all rooms
    client.rooms.forEach((room) => {
      this.leaveRoom(client, room);
    });

    this.clients.delete(client.id);
    console.log(`Client disconnected: ${client.id}`);
  }

  // ===========================================
  // Room Management
  // ===========================================

  joinRoom(client: Client, room: string): void {
    if (!this.rooms.has(room)) {
      this.rooms.set(room, new Set());
    }
    this.rooms.get(room)!.add(client.id);
    client.rooms.add(room);

    this.send(client, {
      type: 'joined',
      payload: { room },
      timestamp: Date.now(),
    });
  }

  leaveRoom(client: Client, room: string): void {
    this.rooms.get(room)?.delete(client.id);
    client.rooms.delete(room);

    // Clean up empty rooms
    if (this.rooms.get(room)?.size === 0) {
      this.rooms.delete(room);
    }
  }

  // ===========================================
  // Messaging
  // ===========================================

  send(client: Client, message: Message): void {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  }

  broadcast(message: Message, excludeId?: string): void {
    this.clients.forEach((client) => {
      if (client.id !== excludeId) {
        this.send(client, message);
      }
    });
  }

  broadcastToRoom(room: string, message: Message, excludeId?: string): void {
    const clientIds = this.rooms.get(room);
    if (!clientIds) return;

    clientIds.forEach((clientId) => {
      if (clientId !== excludeId) {
        const client = this.clients.get(clientId);
        if (client) {
          this.send(client, message);
        }
      }
    });
  }

  // ===========================================
  // Utilities
  // ===========================================

  private heartbeat(): void {
    this.clients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.ping();
      }
    });
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getClientCount(): number {
    return this.clients.size;
  }

  getRoomCount(): number {
    return this.rooms.size;
  }
}

// ===========================================
// Server Setup
// ===========================================

const PORT = process.env.WS_PORT || 8080;
const server = createServer();
const wss = new WebSocketServer({ server });
const wsManager = new WebSocketManager(wss);

server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});

export { WebSocketManager, Client, Message };
