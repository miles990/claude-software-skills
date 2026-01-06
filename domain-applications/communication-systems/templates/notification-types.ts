/**
 * Notification System Types
 * Usage: Core types for multi-channel notification systems
 */

// ===========================================
// Notification Core
// ===========================================

export interface Notification {
  id: string;
  type: NotificationType;
  channel: NotificationChannel;
  recipient: Recipient;
  content: NotificationContent;
  priority: Priority;
  status: NotificationStatus;
  scheduling: SchedulingConfig;
  tracking: TrackingData;
  metadata: Record<string, unknown>;
  createdAt: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
}

export type NotificationType =
  | 'transactional'  // Order confirmations, receipts
  | 'marketing'      // Promotions, newsletters
  | 'system'         // Security alerts, maintenance
  | 'social'         // Comments, mentions, follows
  | 'reminder'       // Appointments, deadlines
  | 'digest';        // Daily/weekly summaries

export type NotificationChannel =
  | 'email'
  | 'sms'
  | 'push'
  | 'in_app'
  | 'slack'
  | 'webhook';

export type Priority = 'low' | 'normal' | 'high' | 'urgent';

export type NotificationStatus =
  | 'pending'
  | 'queued'
  | 'sending'
  | 'sent'
  | 'delivered'
  | 'failed'
  | 'bounced'
  | 'cancelled';

// ===========================================
// Recipient
// ===========================================

export interface Recipient {
  id: string;
  type: 'user' | 'group' | 'segment';
  email?: string;
  phone?: string;
  deviceTokens?: string[];
  preferences: NotificationPreferences;
  timezone: string;
  locale: string;
}

export interface NotificationPreferences {
  channels: {
    [K in NotificationChannel]?: boolean;
  };
  types: {
    [K in NotificationType]?: boolean;
  };
  quietHours?: {
    enabled: boolean;
    start: string; // HH:mm
    end: string;   // HH:mm
  };
  frequency?: 'instant' | 'hourly' | 'daily' | 'weekly';
}

// ===========================================
// Content
// ===========================================

export interface NotificationContent {
  template?: string;
  subject?: string;           // Email subject
  title?: string;             // Push/in-app title
  body: string;
  html?: string;              // Rich HTML content
  data?: Record<string, unknown>;  // Dynamic data for templates
  actions?: NotificationAction[];
  attachments?: Attachment[];
}

export interface NotificationAction {
  id: string;
  label: string;
  url?: string;
  action?: string;  // Custom action identifier
  style?: 'primary' | 'secondary' | 'danger';
}

export interface Attachment {
  filename: string;
  content: string;  // Base64 or URL
  contentType: string;
  size?: number;
}

// ===========================================
// Email Specific
// ===========================================

export interface EmailNotification extends Notification {
  channel: 'email';
  email: {
    from: EmailAddress;
    to: EmailAddress[];
    cc?: EmailAddress[];
    bcc?: EmailAddress[];
    replyTo?: EmailAddress;
    headers?: Record<string, string>;
    trackOpens: boolean;
    trackClicks: boolean;
  };
}

export interface EmailAddress {
  email: string;
  name?: string;
}

// ===========================================
// Push Notification Specific
// ===========================================

export interface PushNotification extends Notification {
  channel: 'push';
  push: {
    platform: 'ios' | 'android' | 'web';
    deviceTokens: string[];
    badge?: number;
    sound?: string;
    icon?: string;
    image?: string;
    clickAction?: string;
    data?: Record<string, string>;
    ttl?: number; // Time to live in seconds
    collapseKey?: string;
  };
}

// ===========================================
// SMS Specific
// ===========================================

export interface SMSNotification extends Notification {
  channel: 'sms';
  sms: {
    from: string;
    to: string;
    provider?: 'twilio' | 'nexmo' | 'aws_sns';
    maxSegments?: number;
  };
}

// ===========================================
// Scheduling
// ===========================================

export interface SchedulingConfig {
  sendAt?: Date;
  timezone?: string;
  respectQuietHours: boolean;
  retryPolicy?: RetryPolicy;
  expiresAt?: Date;
}

export interface RetryPolicy {
  maxAttempts: number;
  backoffMs: number;
  backoffMultiplier: number;
}

// ===========================================
// Tracking & Analytics
// ===========================================

export interface TrackingData {
  messageId: string;
  providerId?: string;
  attempts: DeliveryAttempt[];
  events: TrackingEvent[];
}

export interface DeliveryAttempt {
  attemptNumber: number;
  timestamp: Date;
  status: 'success' | 'failed';
  error?: string;
  provider?: string;
}

export interface TrackingEvent {
  type: TrackingEventType;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export type TrackingEventType =
  | 'queued'
  | 'sent'
  | 'delivered'
  | 'opened'
  | 'clicked'
  | 'bounced'
  | 'complained'
  | 'unsubscribed';

// ===========================================
// Templates
// ===========================================

export interface NotificationTemplate {
  id: string;
  name: string;
  description?: string;
  channel: NotificationChannel;
  type: NotificationType;
  subject?: string;
  content: string;
  variables: TemplateVariable[];
  version: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'object';
  required: boolean;
  defaultValue?: unknown;
  description?: string;
}

// ===========================================
// Batch Operations
// ===========================================

export interface NotificationBatch {
  id: string;
  name: string;
  template: string;
  recipients: Recipient[];
  content: Partial<NotificationContent>;
  scheduling: SchedulingConfig;
  status: BatchStatus;
  stats: BatchStats;
  createdAt: Date;
  completedAt?: Date;
}

export type BatchStatus = 'draft' | 'scheduled' | 'processing' | 'completed' | 'cancelled';

export interface BatchStats {
  total: number;
  sent: number;
  delivered: number;
  failed: number;
  opened: number;
  clicked: number;
}
