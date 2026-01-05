---
name: javascript-typescript
description: Modern JavaScript and TypeScript development patterns
domain: programming-languages
version: 1.0.0
tags: [javascript, typescript, es6, nodejs, async, types]
---

# JavaScript & TypeScript

## Overview

Modern JavaScript (ES6+) and TypeScript patterns for building robust applications.

---

## TypeScript Fundamentals

### Type Definitions

```typescript
// Basic types
type UserId = string;
type Timestamp = number;

// Object types
interface User {
  id: UserId;
  email: string;
  name: string;
  createdAt: Timestamp;
  metadata?: Record<string, unknown>;
}

// Union types
type Status = 'pending' | 'active' | 'inactive';

// Discriminated unions
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

// Generic types
interface Repository<T extends { id: string }> {
  find(id: string): Promise<T | null>;
  findAll(filter?: Partial<T>): Promise<T[]>;
  create(data: Omit<T, 'id'>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

// Utility types
type CreateUserInput = Omit<User, 'id' | 'createdAt'>;
type UpdateUserInput = Partial<Pick<User, 'name' | 'metadata'>>;
type UserKeys = keyof User;

// Conditional types
type Nullable<T> = T | null;
type NonNullableFields<T> = {
  [K in keyof T]-?: NonNullable<T[K]>;
};

// Template literal types
type EventName = `on${Capitalize<string>}`;
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type ApiRoute = `/${string}`;
```

### Type Guards

```typescript
// Type predicates
function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'email' in obj &&
    typeof (obj as User).id === 'string'
  );
}

// Discriminated union guards
interface Dog {
  kind: 'dog';
  bark(): void;
}

interface Cat {
  kind: 'cat';
  meow(): void;
}

type Animal = Dog | Cat;

function handleAnimal(animal: Animal) {
  switch (animal.kind) {
    case 'dog':
      animal.bark(); // TypeScript knows this is Dog
      break;
    case 'cat':
      animal.meow(); // TypeScript knows this is Cat
      break;
  }
}

// Assertion functions
function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== 'string') {
    throw new Error('Value must be a string');
  }
}

// Exhaustive checks
function assertNever(x: never): never {
  throw new Error(`Unexpected value: ${x}`);
}
```

---

## Async Patterns

### Promises and Async/Await

```typescript
// Promise creation
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Async/await with error handling
async function fetchUser(id: string): Promise<Result<User>> {
  try {
    const response = await fetch(`/api/users/${id}`);

    if (!response.ok) {
      return {
        success: false,
        error: new Error(`HTTP ${response.status}`),
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

// Parallel execution
async function fetchAllUsers(ids: string[]): Promise<User[]> {
  const results = await Promise.all(ids.map((id) => fetchUser(id)));

  return results
    .filter((r): r is { success: true; data: User } => r.success)
    .map((r) => r.data);
}

// Promise.allSettled for partial failures
async function fetchUsersSettled(ids: string[]) {
  const results = await Promise.allSettled(
    ids.map((id) => fetch(`/api/users/${id}`).then((r) => r.json()))
  );

  return results.map((result, index) => ({
    id: ids[index],
    status: result.status,
    value: result.status === 'fulfilled' ? result.value : null,
    error: result.status === 'rejected' ? result.reason : null,
  }));
}

// Sequential execution with reduce
async function processSequentially<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>
): Promise<R[]> {
  return items.reduce(async (accPromise, item) => {
    const acc = await accPromise;
    const result = await processor(item);
    return [...acc, result];
  }, Promise.resolve([] as R[]));
}
```

### Async Iterators

```typescript
// Async generator
async function* paginate<T>(
  fetcher: (page: number) => Promise<{ data: T[]; hasMore: boolean }>
): AsyncGenerator<T[], void, unknown> {
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const result = await fetcher(page);
    yield result.data;
    hasMore = result.hasMore;
    page++;
  }
}

// Using async iterator
async function getAllItems() {
  const items: Item[] = [];

  for await (const batch of paginate(fetchPage)) {
    items.push(...batch);
  }

  return items;
}

// Async iterator utilities
async function* map<T, R>(
  iterable: AsyncIterable<T>,
  fn: (item: T) => R | Promise<R>
): AsyncGenerator<R> {
  for await (const item of iterable) {
    yield await fn(item);
  }
}

async function* filter<T>(
  iterable: AsyncIterable<T>,
  predicate: (item: T) => boolean | Promise<boolean>
): AsyncGenerator<T> {
  for await (const item of iterable) {
    if (await predicate(item)) {
      yield item;
    }
  }
}

async function* take<T>(
  iterable: AsyncIterable<T>,
  count: number
): AsyncGenerator<T> {
  let taken = 0;
  for await (const item of iterable) {
    if (taken >= count) break;
    yield item;
    taken++;
  }
}
```

---

## Functional Patterns

### Higher-Order Functions

```typescript
// Currying
const add = (a: number) => (b: number) => a + b;
const add5 = add(5);
console.log(add5(3)); // 8

// Pipe and compose
const pipe =
  <T>(...fns: Array<(arg: T) => T>) =>
  (value: T): T =>
    fns.reduce((acc, fn) => fn(acc), value);

const compose =
  <T>(...fns: Array<(arg: T) => T>) =>
  (value: T): T =>
    fns.reduceRight((acc, fn) => fn(acc), value);

// Usage
const processString = pipe(
  (s: string) => s.trim(),
  (s: string) => s.toLowerCase(),
  (s: string) => s.replace(/\s+/g, '-')
);

// Memoization
function memoize<Args extends unknown[], Result>(
  fn: (...args: Args) => Result
): (...args: Args) => Result {
  const cache = new Map<string, Result>();

  return (...args: Args): Result => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

// Debounce
function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// Throttle
function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
```

### Immutable Data Patterns

```typescript
// Object updates
const updateUser = (user: User, updates: Partial<User>): User => ({
  ...user,
  ...updates,
});

// Nested updates
interface State {
  users: Record<string, User>;
  settings: {
    theme: string;
    notifications: boolean;
  };
}

const updateNestedState = (
  state: State,
  userId: string,
  userUpdate: Partial<User>
): State => ({
  ...state,
  users: {
    ...state.users,
    [userId]: {
      ...state.users[userId],
      ...userUpdate,
    },
  },
});

// Array operations (immutable)
const addItem = <T>(arr: T[], item: T): T[] => [...arr, item];
const removeItem = <T>(arr: T[], index: number): T[] => [
  ...arr.slice(0, index),
  ...arr.slice(index + 1),
];
const updateItem = <T>(arr: T[], index: number, item: T): T[] => [
  ...arr.slice(0, index),
  item,
  ...arr.slice(index + 1),
];
```

---

## Modern JavaScript Features

### Destructuring and Spread

```typescript
// Object destructuring with defaults and rename
const { name, email, role = 'user', id: odentifier } = user;

// Nested destructuring
const {
  address: { city, country },
} = user;

// Array destructuring
const [first, second, ...rest] = items;
const [, , third] = items; // Skip elements

// Function parameter destructuring
function createUser({
  name,
  email,
  role = 'user',
}: {
  name: string;
  email: string;
  role?: string;
}) {
  return { id: generateId(), name, email, role };
}

// Spread for merging
const merged = { ...defaults, ...overrides };
const combined = [...arr1, ...arr2];
```

### Optional Chaining and Nullish Coalescing

```typescript
// Optional chaining
const city = user?.address?.city;
const firstItem = items?.[0];
const result = callback?.();

// Nullish coalescing (only null/undefined)
const value = input ?? defaultValue;

// Combining them
const displayName = user?.profile?.displayName ?? user?.name ?? 'Anonymous';

// Logical assignment operators
let config = { timeout: 0 };
config.timeout ||= 5000; // Assigns if falsy (won't assign, 0 is falsy)
config.timeout ??= 5000; // Assigns if null/undefined (won't assign)
config.retries ??= 3; // Assigns (undefined)
```

---

## Error Handling

```typescript
// Custom error classes
class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(
    message: string,
    public fields: Record<string, string[]>
  ) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

// Result type pattern (no exceptions)
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

// Using Result
function parseJSON<T>(json: string): Result<T, SyntaxError> {
  try {
    return ok(JSON.parse(json));
  } catch (e) {
    return err(e as SyntaxError);
  }
}

// Chaining Results
function map<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> {
  return result.ok ? ok(fn(result.value)) : result;
}

function flatMap<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E>
): Result<U, E> {
  return result.ok ? fn(result.value) : result;
}
```

---

## Module Patterns

```typescript
// Named exports
export const API_URL = 'https://api.example.com';
export function fetchData() {}
export class ApiClient {}

// Default export
export default class Logger {}

// Re-exports
export { UserService } from './user-service';
export { default as Logger } from './logger';
export * from './types';
export * as utils from './utils';

// Dynamic imports
async function loadModule() {
  const { default: Chart } = await import('./chart');
  return new Chart();
}

// Conditional imports
const adapter = await import(
  process.env.NODE_ENV === 'test' ? './mock-adapter' : './real-adapter'
);
```

---

## Related Skills

- [[frontend]] - React/Next.js development
- [[backend]] - Node.js server development
- [[testing]] - Jest, Vitest testing
