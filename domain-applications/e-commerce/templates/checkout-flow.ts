/**
 * E-commerce Checkout Flow Template
 * Usage: Type definitions and utilities for checkout process
 */

import type { Cart, CartCalculation } from './cart-schema';

// ===========================================
// Customer Types
// ===========================================

export interface Customer {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  addresses: Address[];
  defaultAddressId?: string;
  metadata: Record<string, unknown>;
}

export interface Address {
  id: string;
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

export interface GuestCustomer {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  acceptsMarketing: boolean;
}

// ===========================================
// Checkout Types
// ===========================================

export interface Checkout {
  id: string;
  cartId: string;
  status: CheckoutStatus;

  // Customer
  customerId?: string;
  guest?: GuestCustomer;
  email: string;

  // Addresses
  shippingAddress?: Address;
  billingAddress?: Address;
  sameAsShipping: boolean;

  // Shipping
  shippingMethod?: ShippingMethod;
  shippingRate?: ShippingRate;

  // Payment
  paymentMethod?: PaymentMethod;
  paymentIntent?: string;

  // Totals
  calculation: CartCalculation;

  // Metadata
  notes?: string;
  metadata: Record<string, unknown>;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export type CheckoutStatus =
  | 'pending'
  | 'address'
  | 'shipping'
  | 'payment'
  | 'review'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'abandoned';

// ===========================================
// Shipping Types
// ===========================================

export interface ShippingMethod {
  id: string;
  name: string;
  carrier: string;
  description: string;
  estimatedDays: {
    min: number;
    max: number;
  };
}

export interface ShippingRate {
  methodId: string;
  name: string;
  price: number;
  currency: string;
  estimatedDelivery: string;
}

export interface ShippingZone {
  id: string;
  name: string;
  countries: string[];
  states?: string[];
  postalCodes?: string[];
  methods: ShippingMethod[];
}

// ===========================================
// Payment Types
// ===========================================

export type PaymentMethod =
  | 'card'
  | 'paypal'
  | 'apple_pay'
  | 'google_pay'
  | 'bank_transfer'
  | 'cash_on_delivery';

export interface PaymentDetails {
  method: PaymentMethod;
  provider: string;            // e.g., 'stripe', 'paypal'
  intentId?: string;           // Payment intent ID
  last4?: string;              // Last 4 digits of card
  brand?: string;              // Card brand
  expiryMonth?: number;
  expiryYear?: number;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  requiresAction?: boolean;
  actionUrl?: string;
}

// ===========================================
// Order Types
// ===========================================

export interface Order {
  id: string;
  orderNumber: string;
  checkoutId: string;
  customerId?: string;
  status: OrderStatus;

  // Customer info
  email: string;
  shippingAddress: Address;
  billingAddress: Address;

  // Items
  items: OrderItem[];

  // Shipping
  shippingMethod: string;
  shippingCost: number;
  trackingNumber?: string;
  trackingUrl?: string;

  // Payment
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionId?: string;

  // Totals
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;

  // Metadata
  notes?: string;
  metadata: Record<string, unknown>;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  paidAt?: Date;
  fulfilledAt?: Date;
}

export interface OrderItem {
  id: string;
  productId: string;
  variantId?: string;
  sku: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
  subtotal: number;
  options: Array<{ name: string; value: string }>;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus =
  | 'pending'
  | 'authorized'
  | 'captured'
  | 'failed'
  | 'refunded'
  | 'partially_refunded';

// ===========================================
// Checkout Service Interface
// ===========================================

export interface CheckoutService {
  // Checkout lifecycle
  createCheckout(cartId: string): Promise<Checkout>;
  getCheckout(checkoutId: string): Promise<Checkout | null>;
  updateCheckout(checkoutId: string, data: Partial<Checkout>): Promise<Checkout>;
  abandonCheckout(checkoutId: string): Promise<void>;

  // Steps
  setCustomerInfo(checkoutId: string, customer: GuestCustomer | string): Promise<Checkout>;
  setShippingAddress(checkoutId: string, address: Address): Promise<Checkout>;
  setBillingAddress(checkoutId: string, address: Address): Promise<Checkout>;
  setShippingMethod(checkoutId: string, methodId: string): Promise<Checkout>;

  // Shipping
  getShippingRates(checkoutId: string): Promise<ShippingRate[]>;

  // Payment
  createPaymentIntent(checkoutId: string, method: PaymentMethod): Promise<string>;
  processPayment(checkoutId: string, paymentDetails: PaymentDetails): Promise<PaymentResult>;

  // Complete
  completeCheckout(checkoutId: string): Promise<Order>;
}

// ===========================================
// Checkout Validation
// ===========================================

export interface ValidationError {
  field: string;
  message: string;
}

export function validateAddress(address: Partial<Address>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!address.firstName?.trim()) {
    errors.push({ field: 'firstName', message: 'First name is required' });
  }
  if (!address.lastName?.trim()) {
    errors.push({ field: 'lastName', message: 'Last name is required' });
  }
  if (!address.address1?.trim()) {
    errors.push({ field: 'address1', message: 'Address is required' });
  }
  if (!address.city?.trim()) {
    errors.push({ field: 'city', message: 'City is required' });
  }
  if (!address.postalCode?.trim()) {
    errors.push({ field: 'postalCode', message: 'Postal code is required' });
  }
  if (!address.country?.trim()) {
    errors.push({ field: 'country', message: 'Country is required' });
  }

  return errors;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateCheckoutStep(
  checkout: Checkout,
  step: CheckoutStatus
): ValidationError[] {
  const errors: ValidationError[] = [];

  switch (step) {
    case 'address':
      if (!checkout.email || !validateEmail(checkout.email)) {
        errors.push({ field: 'email', message: 'Valid email is required' });
      }
      break;

    case 'shipping':
      if (!checkout.shippingAddress) {
        errors.push({ field: 'shippingAddress', message: 'Shipping address is required' });
      } else {
        errors.push(...validateAddress(checkout.shippingAddress));
      }
      break;

    case 'payment':
      if (!checkout.shippingMethod) {
        errors.push({ field: 'shippingMethod', message: 'Shipping method is required' });
      }
      if (!checkout.sameAsShipping && !checkout.billingAddress) {
        errors.push({ field: 'billingAddress', message: 'Billing address is required' });
      }
      break;

    case 'review':
      if (!checkout.paymentMethod) {
        errors.push({ field: 'paymentMethod', message: 'Payment method is required' });
      }
      break;
  }

  return errors;
}

// ===========================================
// Order Number Generation
// ===========================================

export function generateOrderNumber(prefix: string = 'ORD'): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

// ===========================================
// Checkout State Machine
// ===========================================

export const CHECKOUT_TRANSITIONS: Record<CheckoutStatus, CheckoutStatus[]> = {
  pending: ['address', 'abandoned'],
  address: ['shipping', 'abandoned'],
  shipping: ['payment', 'address', 'abandoned'],
  payment: ['review', 'shipping', 'abandoned'],
  review: ['processing', 'payment', 'abandoned'],
  processing: ['completed', 'failed'],
  completed: [],
  failed: ['pending'],
  abandoned: ['pending'],
};

export function canTransition(
  from: CheckoutStatus,
  to: CheckoutStatus
): boolean {
  return CHECKOUT_TRANSITIONS[from]?.includes(to) ?? false;
}
