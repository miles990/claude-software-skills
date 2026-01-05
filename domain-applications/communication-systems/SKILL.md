---
name: communication-systems
description: Email, notifications, and messaging system patterns
domain: domain-applications
version: 1.0.0
tags: [email, notifications, push, webhooks, messaging]
---

# Communication Systems

## Overview

Building email systems, push notifications, in-app messaging, and webhook integrations.

---

## Email Systems

### Transactional Email

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  template?: string;
  data?: Record<string, any>;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
  }>;
}

async function sendEmail(options: EmailOptions) {
  let html = options.html;

  // Use template if specified
  if (options.template) {
    html = await renderTemplate(options.template, options.data);
  }

  const { data, error } = await resend.emails.send({
    from: 'noreply@example.com',
    to: options.to,
    subject: options.subject,
    html,
    text: options.text,
    attachments: options.attachments,
  });

  if (error) {
    console.error('Email send failed:', error);
    throw error;
  }

  // Log for tracking
  await prisma.emailLog.create({
    data: {
      messageId: data.id,
      to: Array.isArray(options.to) ? options.to.join(',') : options.to,
      subject: options.subject,
      template: options.template,
      status: 'sent',
    },
  });

  return data;
}

// Email templates with React Email
import { render } from '@react-email/render';
import { WelcomeEmail } from './templates/WelcomeEmail';
import { PasswordResetEmail } from './templates/PasswordResetEmail';

const templates = {
  welcome: WelcomeEmail,
  passwordReset: PasswordResetEmail,
};

async function renderTemplate(name: string, data: Record<string, any>) {
  const Template = templates[name];
  if (!Template) throw new Error(`Template ${name} not found`);

  return render(<Template {...data} />);
}

// React Email template
import {
  Html, Head, Body, Container, Text, Button, Img,
} from '@react-email/components';

function WelcomeEmail({ name, actionUrl }: { name: string; actionUrl: string }) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'Arial, sans-serif' }}>
        <Container>
          <Img src="https://example.com/logo.png" width="120" height="40" alt="Logo" />
          <Text>Hi {name},</Text>
          <Text>Welcome to our platform! Get started by setting up your account.</Text>
          <Button
            href={actionUrl}
            style={{ background: '#007bff', color: '#fff', padding: '12px 24px' }}
          >
            Get Started
          </Button>
        </Container>
      </Body>
    </Html>
  );
}
```

### Email Queue

```typescript
import Bull from 'bull';

const emailQueue = new Bull('email', process.env.REDIS_URL);

// Add to queue
async function queueEmail(options: EmailOptions, delay?: number) {
  return emailQueue.add('send', options, {
    delay,
    attempts: 3,
    backoff: { type: 'exponential', delay: 60000 },
  });
}

// Process queue
emailQueue.process('send', async (job) => {
  await sendEmail(job.data);
});

// Handle failures
emailQueue.on('failed', async (job, error) => {
  console.error(`Email job ${job.id} failed:`, error);

  await prisma.emailLog.update({
    where: { jobId: job.id },
    data: { status: 'failed', error: error.message },
  });
});

// Bulk email with rate limiting
async function sendBulkEmail(recipients: string[], template: string, data: Record<string, any>) {
  const jobs = recipients.map((to, index) => ({
    name: 'send',
    data: { to, template, data },
    opts: { delay: index * 100 }, // Stagger sends
  }));

  await emailQueue.addBulk(jobs);
}
```

---

## Push Notifications

### Web Push

```typescript
import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:admin@example.com',
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// Store subscription
async function saveSubscription(userId: string, subscription: PushSubscription) {
  await prisma.pushSubscription.upsert({
    where: { endpoint: subscription.endpoint },
    update: { keys: subscription.keys },
    create: {
      userId,
      endpoint: subscription.endpoint,
      keys: subscription.keys,
    },
  });
}

// Send push notification
async function sendPush(userId: string, payload: {
  title: string;
  body: string;
  icon?: string;
  url?: string;
  data?: Record<string, any>;
}) {
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
  });

  const results = await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          JSON.stringify(payload)
        );
      } catch (error) {
        if (error.statusCode === 410) {
          // Subscription expired, remove it
          await prisma.pushSubscription.delete({ where: { id: sub.id } });
        }
        throw error;
      }
    })
  );

  return results;
}

// Service worker handler
// public/sw.js
self.addEventListener('push', (event) => {
  const data = event.data.json();

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || '/icon-192.png',
      data: data,
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.notification.data.url) {
    event.waitUntil(clients.openWindow(event.notification.data.url));
  }
});
```

### Mobile Push (FCM)

```typescript
import admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

interface MobileNotification {
  title: string;
  body: string;
  imageUrl?: string;
  data?: Record<string, string>;
}

async function sendMobilePush(
  tokens: string[],
  notification: MobileNotification
) {
  const message: admin.messaging.MulticastMessage = {
    tokens,
    notification: {
      title: notification.title,
      body: notification.body,
      imageUrl: notification.imageUrl,
    },
    data: notification.data,
    android: {
      priority: 'high',
      notification: {
        sound: 'default',
        clickAction: 'OPEN_ACTIVITY',
      },
    },
    apns: {
      payload: {
        aps: {
          sound: 'default',
          badge: 1,
        },
      },
    },
  };

  const response = await admin.messaging().sendEachForMulticast(message);

  // Handle failures
  response.responses.forEach((resp, idx) => {
    if (!resp.success) {
      const errorCode = resp.error?.code;
      if (
        errorCode === 'messaging/invalid-registration-token' ||
        errorCode === 'messaging/registration-token-not-registered'
      ) {
        // Remove invalid token
        removeDeviceToken(tokens[idx]);
      }
    }
  });

  return response;
}
```

---

## In-App Notifications

```typescript
interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: Date;
}

// Create notification
async function createNotification(params: {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
}) {
  const notification = await prisma.notification.create({
    data: {
      ...params,
      read: false,
    },
  });

  // Send real-time update
  await pubsub.publish(`notifications:${params.userId}`, {
    type: 'NEW_NOTIFICATION',
    notification,
  });

  return notification;
}

// Get notifications with pagination
async function getNotifications(userId: string, options: {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}) {
  const { page = 1, limit = 20, unreadOnly = false } = options;

  const where = {
    userId,
    ...(unreadOnly && { read: false }),
  };

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId, read: false } }),
  ]);

  return { notifications, total, unreadCount };
}

// Mark as read
async function markAsRead(userId: string, notificationIds: string[]) {
  await prisma.notification.updateMany({
    where: {
      id: { in: notificationIds },
      userId,
    },
    data: { read: true },
  });
}

// React hook for notifications
function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Initial fetch
    fetchNotifications().then(({ notifications, unreadCount }) => {
      setNotifications(notifications);
      setUnreadCount(unreadCount);
    });

    // Subscribe to real-time updates
    const unsubscribe = subscribeToNotifications((notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return unsubscribe;
  }, []);

  return { notifications, unreadCount, markAsRead };
}
```

---

## Webhooks

```typescript
interface Webhook {
  id: string;
  url: string;
  secret: string;
  events: string[];
  active: boolean;
}

// Register webhook
async function registerWebhook(params: {
  url: string;
  events: string[];
}) {
  const secret = crypto.randomBytes(32).toString('hex');

  return prisma.webhook.create({
    data: {
      url: params.url,
      events: params.events,
      secret,
      active: true,
    },
  });
}

// Send webhook
async function sendWebhook(webhookId: string, event: string, payload: any) {
  const webhook = await prisma.webhook.findUnique({ where: { id: webhookId } });
  if (!webhook || !webhook.active) return;

  const timestamp = Date.now().toString();
  const body = JSON.stringify({ event, data: payload, timestamp });

  // Create signature
  const signature = crypto
    .createHmac('sha256', webhook.secret)
    .update(body)
    .digest('hex');

  try {
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Timestamp': timestamp,
      },
      body,
    });

    await prisma.webhookLog.create({
      data: {
        webhookId,
        event,
        payload,
        responseStatus: response.status,
        success: response.ok,
      },
    });

    // Disable after multiple failures
    if (!response.ok) {
      await handleWebhookFailure(webhookId);
    }
  } catch (error) {
    await prisma.webhookLog.create({
      data: {
        webhookId,
        event,
        payload,
        error: error.message,
        success: false,
      },
    });

    await handleWebhookFailure(webhookId);
  }
}

// Verify webhook signature (receiver side)
function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}
```

---

## Related Skills

- [[realtime-systems]] - Real-time messaging
- [[backend]] - API development
- [[reliability-engineering]] - Delivery guarantees

