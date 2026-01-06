/**
 * E-commerce Cart Schema Template
 * Usage: Type definitions for shopping cart functionality
 */

// ===========================================
// Product Types
// ===========================================

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  images: ProductImage[];
  variants: ProductVariant[];
  categories: string[];
  tags: string[];
  inventory: {
    quantity: number;
    trackInventory: boolean;
    allowBackorder: boolean;
  };
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  width: number;
  height: number;
  position: number;
}

export interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  options: VariantOption[];
  inventory: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'in';
  };
}

export interface VariantOption {
  name: string;   // e.g., "Size", "Color"
  value: string;  // e.g., "Large", "Blue"
}

// ===========================================
// Cart Types
// ===========================================

export interface Cart {
  id: string;
  userId?: string;           // Optional for guest checkout
  sessionId: string;         // For guest carts
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  couponCodes: string[];
  metadata: Record<string, unknown>;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
  subtotal: number;
  options: VariantOption[];
  metadata: Record<string, unknown>;
}

// ===========================================
// Discount Types
// ===========================================

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  applicableTo: {
    products?: string[];
    categories?: string[];
    all?: boolean;
  };
  startsAt: Date;
  expiresAt?: Date;
  isActive: boolean;
}

export interface AppliedDiscount {
  couponId: string;
  code: string;
  type: Coupon['type'];
  amount: number;
  description: string;
}

// ===========================================
// Cart Operations
// ===========================================

export interface AddToCartInput {
  productId: string;
  variantId?: string;
  quantity: number;
  metadata?: Record<string, unknown>;
}

export interface UpdateCartItemInput {
  itemId: string;
  quantity: number;
}

export interface CartCalculation {
  subtotal: number;
  discounts: AppliedDiscount[];
  discountTotal: number;
  taxRate: number;
  tax: number;
  shippingMethod?: string;
  shipping: number;
  total: number;
}

// ===========================================
// Cart Service Interface
// ===========================================

export interface CartService {
  // Cart CRUD
  getCart(cartId: string): Promise<Cart | null>;
  getCartBySession(sessionId: string): Promise<Cart | null>;
  createCart(sessionId: string, userId?: string): Promise<Cart>;
  deleteCart(cartId: string): Promise<void>;

  // Items
  addItem(cartId: string, input: AddToCartInput): Promise<Cart>;
  updateItem(cartId: string, input: UpdateCartItemInput): Promise<Cart>;
  removeItem(cartId: string, itemId: string): Promise<Cart>;
  clearCart(cartId: string): Promise<Cart>;

  // Coupons
  applyCoupon(cartId: string, code: string): Promise<Cart>;
  removeCoupon(cartId: string, code: string): Promise<Cart>;

  // Calculation
  calculateCart(cart: Cart): Promise<CartCalculation>;
}

// ===========================================
// Example Implementation
// ===========================================

export function calculateCartTotals(
  items: CartItem[],
  discounts: AppliedDiscount[] = [],
  taxRate: number = 0,
  shipping: number = 0
): CartCalculation {
  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);

  // Calculate discount total
  const discountTotal = discounts.reduce((sum, d) => sum + d.amount, 0);

  // Calculate tax on discounted amount
  const taxableAmount = Math.max(0, subtotal - discountTotal);
  const tax = Math.round(taxableAmount * taxRate * 100) / 100;

  // Calculate final total
  const total = Math.max(0, taxableAmount + tax + shipping);

  return {
    subtotal,
    discounts,
    discountTotal,
    taxRate,
    tax,
    shipping,
    total,
  };
}

export function applyPercentageDiscount(
  subtotal: number,
  percentage: number,
  maxDiscount?: number
): number {
  let discount = subtotal * (percentage / 100);

  if (maxDiscount && discount > maxDiscount) {
    discount = maxDiscount;
  }

  return Math.round(discount * 100) / 100;
}

export function validateCoupon(
  coupon: Coupon,
  cart: Cart
): { valid: boolean; error?: string } {
  // Check if active
  if (!coupon.isActive) {
    return { valid: false, error: 'Coupon is not active' };
  }

  // Check dates
  const now = new Date();
  if (coupon.startsAt > now) {
    return { valid: false, error: 'Coupon is not yet valid' };
  }
  if (coupon.expiresAt && coupon.expiresAt < now) {
    return { valid: false, error: 'Coupon has expired' };
  }

  // Check usage limit
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, error: 'Coupon usage limit reached' };
  }

  // Check minimum order
  if (coupon.minOrderAmount && cart.subtotal < coupon.minOrderAmount) {
    return {
      valid: false,
      error: `Minimum order amount is ${coupon.minOrderAmount}`,
    };
  }

  // Check product applicability
  if (!coupon.applicableTo.all) {
    const hasApplicableItem = cart.items.some((item) => {
      if (coupon.applicableTo.products?.includes(item.productId)) {
        return true;
      }
      // Would need product categories here
      return false;
    });

    if (!hasApplicableItem) {
      return { valid: false, error: 'Coupon not applicable to cart items' };
    }
  }

  return { valid: true };
}
