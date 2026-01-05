---
name: code-quality
description: Clean code principles, SOLID, and code review practices
domain: software-engineering
version: 1.0.0
tags: [clean-code, solid, refactoring, code-review, linting, metrics]
---

# Code Quality

## Overview

Principles and practices for writing maintainable, readable, and reliable code.

---

## Clean Code Principles

### Meaningful Names

```typescript
// ❌ Cryptic names
const d = new Date();
const u = getU();
const arr = data.filter(x => x.s === 'a');

// ✅ Descriptive names
const currentDate = new Date();
const currentUser = getCurrentUser();
const activeUsers = users.filter(user => user.status === 'active');

// ❌ Hungarian notation (outdated)
const strName = 'John';
const arrItems = [];
const bIsActive = true;

// ✅ Let the type system handle types
const name = 'John';
const items: Item[] = [];
const isActive = true;
```

### Functions

```typescript
// ❌ Does too much
function processUserData(userId: string) {
  const user = db.findUser(userId);
  const orders = db.findOrders(userId);
  const total = orders.reduce((sum, o) => sum + o.amount, 0);
  sendEmail(user.email, `Your total: ${total}`);
  updateAnalytics(userId, total);
  return { user, orders, total };
}

// ✅ Single responsibility
function getUser(userId: string): User {
  return db.findUser(userId);
}

function getUserOrders(userId: string): Order[] {
  return db.findOrders(userId);
}

function calculateTotal(orders: Order[]): number {
  return orders.reduce((sum, o) => sum + o.amount, 0);
}

function sendOrderSummary(user: User, total: number): void {
  sendEmail(user.email, `Your total: ${total}`);
}

// ❌ Too many parameters
function createUser(name, email, age, role, department, manager, startDate) {}

// ✅ Use object parameter
interface CreateUserParams {
  name: string;
  email: string;
  age?: number;
  role: Role;
  department: string;
  managerId?: string;
  startDate: Date;
}

function createUser(params: CreateUserParams): User {}
```

### Comments

```typescript
// ❌ Redundant comment
// Increment counter by 1
counter++;

// ❌ Outdated comment (code changed, comment didn't)
// Returns the user's full name
function getUserEmail(user: User) {
  return user.email;
}

// ✅ Explains WHY, not WHAT
// Use binary search because the list is sorted and can have 100k+ items
const index = binarySearch(sortedItems, target);

// ✅ Warns about non-obvious behavior
// IMPORTANT: This function mutates the input array for performance reasons
function quickSort(arr: number[]): number[] {
  // ...
}

// ✅ TODO with context
// TODO(john): Remove after migration completes - tracking in JIRA-1234
const legacyAdapter = new LegacyAdapter();
```

---

## SOLID Principles

### Single Responsibility Principle

```typescript
// ❌ Multiple responsibilities
class UserManager {
  createUser(data: UserData) { /* DB logic */ }
  validateEmail(email: string) { /* Validation logic */ }
  sendWelcomeEmail(user: User) { /* Email logic */ }
  generateReport(users: User[]) { /* Report logic */ }
}

// ✅ Single responsibility each
class UserRepository {
  create(data: UserData): User { /* DB logic */ }
  findById(id: string): User | null { /* DB logic */ }
}

class UserValidator {
  validateEmail(email: string): boolean { /* Validation */ }
  validatePassword(password: string): ValidationResult { /* Validation */ }
}

class EmailService {
  sendWelcomeEmail(user: User): void { /* Email logic */ }
}

class UserReportGenerator {
  generate(users: User[]): Report { /* Report logic */ }
}
```

### Open/Closed Principle

```typescript
// ❌ Must modify to add new payment methods
class PaymentProcessor {
  process(payment: Payment) {
    if (payment.type === 'credit') {
      // Credit card logic
    } else if (payment.type === 'paypal') {
      // PayPal logic
    } else if (payment.type === 'crypto') {
      // Crypto logic - had to modify existing code!
    }
  }
}

// ✅ Open for extension, closed for modification
interface PaymentMethod {
  process(amount: number): Promise<PaymentResult>;
}

class CreditCardPayment implements PaymentMethod {
  async process(amount: number): Promise<PaymentResult> { /* ... */ }
}

class PayPalPayment implements PaymentMethod {
  async process(amount: number): Promise<PaymentResult> { /* ... */ }
}

// New payment method - no modification to existing code
class CryptoPayment implements PaymentMethod {
  async process(amount: number): Promise<PaymentResult> { /* ... */ }
}

class PaymentProcessor {
  constructor(private method: PaymentMethod) {}

  async process(amount: number): Promise<PaymentResult> {
    return this.method.process(amount);
  }
}
```

### Liskov Substitution Principle

```typescript
// ❌ Violates LSP - Square breaks Rectangle contract
class Rectangle {
  constructor(public width: number, public height: number) {}

  setWidth(w: number) { this.width = w; }
  setHeight(h: number) { this.height = h; }
  getArea() { return this.width * this.height; }
}

class Square extends Rectangle {
  setWidth(w: number) {
    this.width = w;
    this.height = w; // Unexpected side effect!
  }
  setHeight(h: number) {
    this.width = h;
    this.height = h; // Unexpected side effect!
  }
}

// ✅ Proper abstraction
interface Shape {
  getArea(): number;
}

class Rectangle implements Shape {
  constructor(private width: number, private height: number) {}
  getArea() { return this.width * this.height; }
}

class Square implements Shape {
  constructor(private side: number) {}
  getArea() { return this.side * this.side; }
}
```

### Interface Segregation Principle

```typescript
// ❌ Fat interface
interface Worker {
  work(): void;
  eat(): void;
  sleep(): void;
  attendMeeting(): void;
  writeReport(): void;
}

// Robot can't eat or sleep!
class Robot implements Worker {
  work() { /* ... */ }
  eat() { throw new Error('Robots do not eat'); }  // Forced to implement
  sleep() { throw new Error('Robots do not sleep'); }
  // ...
}

// ✅ Segregated interfaces
interface Workable {
  work(): void;
}

interface Eatable {
  eat(): void;
}

interface Sleepable {
  sleep(): void;
}

class Human implements Workable, Eatable, Sleepable {
  work() { /* ... */ }
  eat() { /* ... */ }
  sleep() { /* ... */ }
}

class Robot implements Workable {
  work() { /* ... */ }
}
```

### Dependency Inversion Principle

```typescript
// ❌ High-level depends on low-level
class OrderService {
  private db = new MySQLDatabase();  // Concrete dependency
  private mailer = new SendGridMailer();  // Concrete dependency

  createOrder(data: OrderData) {
    const order = this.db.insert('orders', data);
    this.mailer.send(data.email, 'Order confirmed');
    return order;
  }
}

// ✅ Depend on abstractions
interface Database {
  insert(table: string, data: unknown): unknown;
  find(table: string, query: unknown): unknown[];
}

interface Mailer {
  send(to: string, message: string): void;
}

class OrderService {
  constructor(
    private db: Database,
    private mailer: Mailer
  ) {}

  createOrder(data: OrderData) {
    const order = this.db.insert('orders', data);
    this.mailer.send(data.email, 'Order confirmed');
    return order;
  }
}

// Now we can inject any implementation
const service = new OrderService(
  new PostgresDatabase(),
  new SESMailer()
);
```

---

## Code Review Best Practices

### What to Look For

```markdown
## Code Review Checklist

### Correctness
- [ ] Logic is correct and handles edge cases
- [ ] Error handling is appropriate
- [ ] No obvious bugs or regressions

### Design
- [ ] Code is at the right abstraction level
- [ ] No unnecessary complexity
- [ ] Follows existing patterns in codebase

### Readability
- [ ] Clear naming and intent
- [ ] Comments explain "why" not "what"
- [ ] Code is self-documenting where possible

### Testing
- [ ] Adequate test coverage
- [ ] Tests are meaningful (not just coverage padding)
- [ ] Edge cases are tested

### Performance
- [ ] No obvious N+1 queries or inefficiencies
- [ ] Appropriate data structures used
- [ ] Caching considered if needed

### Security
- [ ] Input validation present
- [ ] No secrets in code
- [ ] Authentication/authorization correct
```

### Giving Feedback

```markdown
# Good Review Comments

## ✅ Specific and actionable
"This loop has O(n²) complexity. Consider using a Map for O(n) lookup."

## ✅ Explain the why
"Let's extract this to a separate function - it makes the logic easier
to test and the main function more readable."

## ✅ Offer alternatives
"Instead of mutating the array, consider using `filter()` which returns
a new array: `const active = items.filter(i => i.active)`"

## ✅ Distinguish severity
- "nit: " - Minor style issue, optional
- "suggestion: " - Good to have, not blocking
- "blocking: " - Must fix before merge

# Avoid

## ❌ Vague criticism
"This code is confusing"

## ❌ Personal attacks
"You always make this mistake"

## ❌ No explanation
"Use a different approach"
```

---

## Code Metrics

### Cyclomatic Complexity

```typescript
// High complexity (10+) - hard to test and maintain
function processOrder(order: Order): Result {
  if (order.status === 'pending') {           // +1
    if (order.paymentMethod === 'card') {     // +1
      if (order.amount > 1000) {              // +1
        // ...
      } else if (order.amount > 100) {        // +1
        // ...
      } else {
        // ...
      }
    } else if (order.paymentMethod === 'cash') {  // +1
      // ...
    }
  } else if (order.status === 'processing') {  // +1
    // ...
  }
  // ... more branches
}

// Lower complexity - extract conditions
function processOrder(order: Order): Result {
  const processor = getProcessor(order.paymentMethod);
  const tier = getPricingTier(order.amount);
  return processor.process(order, tier);
}
```

### Metrics to Track

| Metric | Target | Why |
|--------|--------|-----|
| Cyclomatic Complexity | < 10 per function | Testability |
| Function Length | < 50 lines | Readability |
| File Length | < 400 lines | Maintainability |
| Test Coverage | > 80% | Confidence |
| Duplication | < 3% | DRY principle |

---

## Linting & Formatting

### ESLint Configuration

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    // Prevent bugs
    'no-unused-vars': 'error',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-misused-promises': 'error',

    // Code quality
    'complexity': ['warn', 10],
    'max-lines-per-function': ['warn', 50],
    'max-depth': ['warn', 3],

    // Consistency
    'prefer-const': 'error',
    'no-var': 'error',
  }
};
```

### Pre-commit Hooks

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

---

## Related Skills

- [[refactoring]] - Improving existing code
- [[testing-strategies]] - Ensuring quality through tests
- [[design-patterns]] - Proven solutions
