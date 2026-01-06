# Communication Systems Templates

Templates for email and notification systems.

## Files

| Template | Purpose |
|----------|---------|
| `email-template.html` | Responsive email HTML |
| `notification-types.ts` | Notification system types |

## Usage

### Email Template

```bash
# Copy template
cp templates/email-template.html ./emails/base.html

# Replace variables in your templating system
{{preheader}}     # Preview text
{{logo_url}}      # Company logo
{{headline}}      # Main headline
{{content}}       # Body content
{{cta_url}}       # Button URL
{{cta_text}}      # Button text
```

### Notification Types

```bash
# Copy types
cp templates/notification-types.ts ./src/types/notifications.ts

# Import
import type { Notification, EmailNotification } from './types/notifications';
```

## Email Template Features

| Feature | Support |
|---------|---------|
| Dark Mode | CSS `prefers-color-scheme` |
| Responsive | Mobile-first, 600px breakpoint |
| Outlook | VML fallbacks |
| Gmail | Inline styles |
| Accessibility | Semantic HTML, alt text |

### Tested Clients

- Gmail (Web, iOS, Android)
- Apple Mail (macOS, iOS)
- Outlook (Desktop, Web)
- Yahoo Mail
- Samsung Mail

## Notification System

### Channels

| Channel | Use Case |
|---------|----------|
| `email` | Transactional, marketing |
| `sms` | Urgent alerts, 2FA |
| `push` | Real-time updates |
| `in_app` | Non-urgent notifications |
| `slack` | Team notifications |
| `webhook` | System integrations |

### Priority Levels

```typescript
type Priority = 'low' | 'normal' | 'high' | 'urgent';

// urgent: Bypass quiet hours, immediate delivery
// high: Important, may wake device
// normal: Standard delivery
// low: Can be batched/digested
```

### Notification Types

| Type | Example |
|------|---------|
| `transactional` | Order confirmation |
| `marketing` | Newsletter |
| `system` | Security alert |
| `social` | New follower |
| `reminder` | Appointment |
| `digest` | Weekly summary |

## Email Example

```typescript
const notification: EmailNotification = {
  id: 'notif_123',
  type: 'transactional',
  channel: 'email',
  recipient: {
    id: 'user_456',
    email: 'user@example.com',
    preferences: { ... },
    timezone: 'America/New_York',
    locale: 'en-US',
  },
  content: {
    template: 'order-confirmation',
    subject: 'Your order #{{orderId}} is confirmed',
    data: {
      orderId: 'ORD-12345',
      items: [...],
      total: 99.99,
    },
  },
  email: {
    from: { email: 'orders@example.com', name: 'Example Store' },
    to: [{ email: 'user@example.com' }],
    trackOpens: true,
    trackClicks: true,
  },
  priority: 'high',
  status: 'pending',
  scheduling: { respectQuietHours: false },
  tracking: { messageId: 'msg_789', attempts: [], events: [] },
  metadata: {},
  createdAt: new Date(),
};
```

## Push Notification Example

```typescript
const push: PushNotification = {
  // ... common fields
  channel: 'push',
  content: {
    title: 'New message',
    body: 'You have a new message from John',
    actions: [
      { id: 'reply', label: 'Reply', action: 'REPLY_ACTION' },
      { id: 'dismiss', label: 'Dismiss' },
    ],
  },
  push: {
    platform: 'ios',
    deviceTokens: ['token_abc'],
    badge: 5,
    sound: 'default',
    ttl: 3600,
  },
};
```

## User Preferences

```typescript
const preferences: NotificationPreferences = {
  channels: {
    email: true,
    push: true,
    sms: false,
  },
  types: {
    marketing: false,  // User opted out
    transactional: true,
    social: true,
  },
  quietHours: {
    enabled: true,
    start: '22:00',
    end: '08:00',
  },
  frequency: 'instant',
};
```

## Tracking Events

```typescript
const events: TrackingEvent[] = [
  { type: 'queued', timestamp: new Date('2024-01-01T10:00:00Z') },
  { type: 'sent', timestamp: new Date('2024-01-01T10:00:01Z') },
  { type: 'delivered', timestamp: new Date('2024-01-01T10:00:02Z') },
  { type: 'opened', timestamp: new Date('2024-01-01T10:05:00Z') },
  { type: 'clicked', timestamp: new Date('2024-01-01T10:05:30Z'), metadata: { url: '...' } },
];
```
