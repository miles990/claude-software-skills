/**
 * SaaS Billing Configuration Template
 * Usage: Billing, subscription, and usage tracking types
 */

// ===========================================
// Plan & Pricing Types
// ===========================================

export interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string;

  // Pricing
  pricing: {
    monthly: number;
    yearly: number;
    currency: string;
  };

  // Stripe IDs
  stripe: {
    productId: string;
    priceIdMonthly: string;
    priceIdYearly: string;
  };

  // Limits
  limits: PlanLimits;

  // Features
  features: PlanFeature[];

  // Display
  highlighted: boolean;
  sortOrder: number;
}

export interface PlanLimits {
  users: number;              // Max team members
  storage: number;            // In bytes
  apiRequests: number;        // Per month
  projects?: number;          // If applicable
  customDomains?: number;
  [key: string]: number | undefined;
}

export interface PlanFeature {
  key: string;
  name: string;
  included: boolean;
  limit?: number | 'unlimited';
  tooltip?: string;
}

// ===========================================
// Subscription Types
// ===========================================

export interface Subscription {
  id: string;
  tenantId: string;
  planId: string;

  // Stripe
  stripeSubscriptionId: string;
  stripeCustomerId: string;

  // Status
  status: SubscriptionStatus;
  billingCycle: 'monthly' | 'yearly';

  // Dates
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAt?: Date;
  canceledAt?: Date;
  trialEnd?: Date;

  // Metadata
  metadata: Record<string, unknown>;
}

export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'incomplete'
  | 'incomplete_expired';

// ===========================================
// Usage & Metering Types
// ===========================================

export interface UsageRecord {
  id: string;
  tenantId: string;
  metric: string;           // e.g., "api_requests", "storage", "users"
  value: number;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface UsageSummary {
  tenantId: string;
  period: {
    start: Date;
    end: Date;
  };
  metrics: {
    [key: string]: {
      current: number;
      limit: number;
      percentage: number;
    };
  };
}

export interface UsageAlert {
  metric: string;
  threshold: number;        // Percentage (0-100)
  notified: boolean;
  notifiedAt?: Date;
}

// ===========================================
// Invoice Types
// ===========================================

export interface Invoice {
  id: string;
  tenantId: string;
  stripeInvoiceId: string;

  // Amounts
  subtotal: number;
  tax: number;
  total: number;
  amountPaid: number;
  amountDue: number;
  currency: string;

  // Status
  status: InvoiceStatus;

  // Dates
  periodStart: Date;
  periodEnd: Date;
  dueDate?: Date;
  paidAt?: Date;

  // Items
  items: InvoiceItem[];

  // URLs
  invoicePdf?: string;
  hostedInvoiceUrl?: string;
}

export type InvoiceStatus =
  | 'draft'
  | 'open'
  | 'paid'
  | 'void'
  | 'uncollectible';

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitAmount: number;
  amount: number;
}

// ===========================================
// Plans Configuration
// ===========================================

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    slug: 'free',
    description: 'For individuals and small projects',
    pricing: {
      monthly: 0,
      yearly: 0,
      currency: 'usd',
    },
    stripe: {
      productId: '',
      priceIdMonthly: '',
      priceIdYearly: '',
    },
    limits: {
      users: 1,
      storage: 100 * 1024 * 1024,    // 100 MB
      apiRequests: 1000,
      projects: 3,
    },
    features: [
      { key: 'basic_features', name: 'Basic features', included: true },
      { key: 'community_support', name: 'Community support', included: true },
      { key: 'api_access', name: 'API access', included: false },
      { key: 'custom_domain', name: 'Custom domain', included: false },
    ],
    highlighted: false,
    sortOrder: 0,
  },
  {
    id: 'pro',
    name: 'Pro',
    slug: 'pro',
    description: 'For growing teams',
    pricing: {
      monthly: 2900,    // $29/month
      yearly: 29000,    // $290/year (2 months free)
      currency: 'usd',
    },
    stripe: {
      productId: 'prod_xxx',
      priceIdMonthly: 'price_monthly_xxx',
      priceIdYearly: 'price_yearly_xxx',
    },
    limits: {
      users: 10,
      storage: 10 * 1024 * 1024 * 1024,  // 10 GB
      apiRequests: 100000,
      projects: 50,
      customDomains: 1,
    },
    features: [
      { key: 'basic_features', name: 'All Free features', included: true },
      { key: 'api_access', name: 'API access', included: true, limit: 100000 },
      { key: 'custom_domain', name: 'Custom domain', included: true, limit: 1 },
      { key: 'priority_support', name: 'Priority support', included: true },
      { key: 'analytics', name: 'Advanced analytics', included: true },
    ],
    highlighted: true,
    sortOrder: 1,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    slug: 'enterprise',
    description: 'For large organizations',
    pricing: {
      monthly: 9900,    // $99/month
      yearly: 99000,    // $990/year
      currency: 'usd',
    },
    stripe: {
      productId: 'prod_yyy',
      priceIdMonthly: 'price_monthly_yyy',
      priceIdYearly: 'price_yearly_yyy',
    },
    limits: {
      users: -1,        // Unlimited
      storage: 100 * 1024 * 1024 * 1024,  // 100 GB
      apiRequests: -1,  // Unlimited
      projects: -1,     // Unlimited
      customDomains: -1,
    },
    features: [
      { key: 'basic_features', name: 'All Pro features', included: true },
      { key: 'unlimited_users', name: 'Unlimited users', included: true },
      { key: 'sso', name: 'SSO / SAML', included: true },
      { key: 'audit_logs', name: 'Audit logs', included: true },
      { key: 'sla', name: '99.9% SLA', included: true },
      { key: 'dedicated_support', name: 'Dedicated support', included: true },
    ],
    highlighted: false,
    sortOrder: 2,
  },
];

// ===========================================
// Billing Utilities
// ===========================================

export function getPlanById(id: string): Plan | undefined {
  return PLANS.find(p => p.id === id);
}

export function getPlanBySlug(slug: string): Plan | undefined {
  return PLANS.find(p => p.slug === slug);
}

export function formatPrice(amount: number, currency: string = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

export function isWithinLimit(
  current: number,
  limit: number
): boolean {
  return limit === -1 || current < limit;
}

export function getUsagePercentage(
  current: number,
  limit: number
): number {
  if (limit === -1) return 0;
  return Math.min(100, Math.round((current / limit) * 100));
}

export function checkLimitExceeded(
  usage: UsageSummary,
  metric: string
): boolean {
  const m = usage.metrics[metric];
  if (!m) return false;
  return m.percentage >= 100;
}

// ===========================================
// Webhook Event Types (Stripe)
// ===========================================

export type BillingEvent =
  | 'subscription.created'
  | 'subscription.updated'
  | 'subscription.deleted'
  | 'invoice.paid'
  | 'invoice.payment_failed'
  | 'customer.subscription.trial_will_end';

export interface BillingWebhookPayload {
  event: BillingEvent;
  data: {
    tenantId: string;
    subscriptionId?: string;
    invoiceId?: string;
    amount?: number;
    [key: string]: unknown;
  };
}
