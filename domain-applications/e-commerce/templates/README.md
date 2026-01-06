# E-commerce Templates

Type definitions and utilities for e-commerce functionality.

## Files

| Template | Purpose |
|----------|---------|
| `cart-schema.ts` | Cart, product, and discount types |
| `checkout-flow.ts` | Checkout, order, and payment types |

## Usage

### Cart Management

```typescript
import {
  Cart,
  CartItem,
  AddToCartInput,
  calculateCartTotals,
  applyPercentageDiscount,
  validateCoupon,
} from './cart-schema';

// Add item to cart
const input: AddToCartInput = {
  productId: 'prod_123',
  variantId: 'var_456',
  quantity: 2,
};

// Calculate totals
const calculation = calculateCartTotals(
  cart.items,
  appliedDiscounts,
  0.08,  // 8% tax
  5.99   // shipping
);

// Apply coupon
const discount = applyPercentageDiscount(
  cart.subtotal,
  20,    // 20% off
  50     // max $50 discount
);
```

### Checkout Flow

```typescript
import {
  Checkout,
  CheckoutStatus,
  validateAddress,
  validateCheckoutStep,
  canTransition,
  generateOrderNumber,
} from './checkout-flow';

// Validate address
const errors = validateAddress(shippingAddress);
if (errors.length > 0) {
  // Handle validation errors
}

// Check step validation
const stepErrors = validateCheckoutStep(checkout, 'shipping');

// Generate order number
const orderNumber = generateOrderNumber('ORD');
// => "ORD-M5K8X2-AB3C"

// Check state transitions
if (canTransition(checkout.status, 'payment')) {
  // Proceed to payment
}
```

## Data Models

### Cart Structure
```
Cart
├── items[]
│   ├── productId
│   ├── variantId
│   ├── quantity
│   └── subtotal
├── couponCodes[]
├── subtotal
├── discount
├── tax
├── shipping
└── total
```

### Checkout Flow
```
pending → address → shipping → payment → review → processing → completed
                                                            ↘ failed
```

### Order Statuses
```
pending → confirmed → processing → shipped → delivered
                               ↘ cancelled
                               ↘ refunded
```

## Key Types

### Product Variant
```typescript
interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  price: number;
  options: [{ name: "Size", value: "Large" }];
  inventory: number;
}
```

### Discount Types
- `percentage` - % off order
- `fixed` - Fixed amount off
- `free_shipping` - Free shipping

### Payment Methods
- `card` - Credit/debit card
- `paypal` - PayPal
- `apple_pay` - Apple Pay
- `google_pay` - Google Pay
- `bank_transfer` - Bank transfer
- `cash_on_delivery` - COD

## Integration Notes

### With Stripe
```typescript
// Create payment intent
const intent = await stripe.paymentIntents.create({
  amount: Math.round(checkout.calculation.total * 100),
  currency: 'usd',
  metadata: { checkoutId: checkout.id },
});
```

### With Inventory
```typescript
// Reserve inventory on checkout
async function reserveInventory(items: CartItem[]) {
  for (const item of items) {
    await db.product.update({
      where: { id: item.productId },
      data: { inventory: { decrement: item.quantity } },
    });
  }
}
```

### Tax Calculation
```typescript
// Use tax service (e.g., TaxJar, Avalara)
const taxRate = await taxService.getRateForAddress(shippingAddress);
```
