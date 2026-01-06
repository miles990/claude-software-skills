# SaaS Platform Templates

Multi-tenant architecture and billing templates for SaaS applications.

## Files

| Template | Purpose |
|----------|---------|
| `tenant-schema.prisma` | Multi-tenant database schema |
| `billing-config.ts` | Plans, subscriptions, and billing types |

## Usage

### Multi-tenant Schema

```bash
# Initialize Prisma
npx prisma init

# Copy schema
cp tenant-schema.prisma prisma/schema.prisma

# Generate client
npx prisma generate

# Run migrations
npx prisma migrate dev
```

### Billing Configuration

```typescript
import {
  PLANS,
  getPlanById,
  formatPrice,
  isWithinLimit,
  getUsagePercentage,
} from './billing-config';

// Get plan
const proPlan = getPlanById('pro');

// Format price
const price = formatPrice(2900, 'usd');  // "$29.00"

// Check limits
const canAddUser = isWithinLimit(currentUsers, plan.limits.users);

// Get usage percentage
const storageUsage = getUsagePercentage(usedStorage, plan.limits.storage);
```

## Data Models

### Tenant Hierarchy
```
Tenant
├── Users (via Membership)
│   ├── Owner
│   ├── Admin
│   ├── Member
│   └── Viewer
├── Plan
├── API Keys
├── Invitations
└── Settings
```

### Subscription Lifecycle
```
trialing → active → past_due → canceled
                 ↘ unpaid
```

## Key Patterns

### Row-Level Security
```typescript
// Middleware to filter by tenant
app.use((req, res, next) => {
  const tenantId = req.user?.tenantId;
  if (tenantId) {
    prisma.$use(async (params, next) => {
      // Add tenantId filter to all queries
      if (params.args?.where) {
        params.args.where.tenantId = tenantId;
      }
      return next(params);
    });
  }
  next();
});
```

### Usage Tracking
```typescript
async function trackUsage(
  tenantId: string,
  metric: string,
  value: number
) {
  await prisma.usageRecord.create({
    data: { tenantId, metric, value, timestamp: new Date() }
  });

  // Check limit
  const summary = await getUsageSummary(tenantId);
  if (summary.metrics[metric].percentage >= 80) {
    await sendUsageAlert(tenantId, metric);
  }
}
```

### Plan Upgrade/Downgrade
```typescript
async function changePlan(
  tenantId: string,
  newPlanId: string,
  prorate: boolean = true
) {
  const subscription = await getSubscription(tenantId);

  await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
    items: [{
      id: subscription.itemId,
      price: newPlan.stripe.priceIdMonthly,
    }],
    proration_behavior: prorate ? 'create_prorations' : 'none',
  });
}
```

## Stripe Integration

### Webhook Handler
```typescript
app.post('/webhooks/stripe', async (req, res) => {
  const event = stripe.webhooks.constructEvent(
    req.body,
    req.headers['stripe-signature'],
    process.env.STRIPE_WEBHOOK_SECRET
  );

  switch (event.type) {
    case 'invoice.paid':
      await handleInvoicePaid(event.data.object);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionCanceled(event.data.object);
      break;
  }

  res.json({ received: true });
});
```

### Customer Portal
```typescript
const session = await stripe.billingPortal.sessions.create({
  customer: tenant.stripeCustomerId,
  return_url: `${BASE_URL}/settings/billing`,
});
// Redirect to session.url
```

## Environment Variables

```bash
# Database
DATABASE_URL="postgresql://..."

# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_...
```
