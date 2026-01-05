---
name: frontend
description: Modern frontend development with React, Vue, and web technologies
domain: development-stacks
version: 1.0.0
tags: [react, vue, nextjs, typescript, css, state-management, bundlers]
---

# Frontend Development

## Overview

Modern frontend development patterns, frameworks, and best practices for building performant web applications.

---

## React Ecosystem

### Component Patterns

```tsx
// Functional component with hooks
import { useState, useEffect, useCallback, useMemo } from 'react';

interface UserListProps {
  initialFilter?: string;
  onSelect: (user: User) => void;
}

function UserList({ initialFilter = '', onSelect }: UserListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState(initialFilter);
  const [loading, setLoading] = useState(true);

  // Memoized filtered list
  const filteredUsers = useMemo(
    () => users.filter(u => u.name.toLowerCase().includes(filter.toLowerCase())),
    [users, filter]
  );

  // Stable callback reference
  const handleSelect = useCallback((user: User) => {
    onSelect(user);
  }, [onSelect]);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      const data = await api.getUsers();
      setUsers(data);
      setLoading(false);
    }
    fetchUsers();
  }, []);

  if (loading) return <Skeleton count={5} />;

  return (
    <div>
      <SearchInput value={filter} onChange={setFilter} />
      {filteredUsers.map(user => (
        <UserCard
          key={user.id}
          user={user}
          onClick={() => handleSelect(user)}
        />
      ))}
    </div>
  );
}
```

### Custom Hooks

```tsx
// Data fetching hook
function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const json = await response.json();
        setData(json);
        setError(null);
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    return () => controller.abort();
  }, [url]);

  return { data, error, loading };
}

// Local storage hook
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);
    window.localStorage.setItem(key, JSON.stringify(valueToStore));
  }, [key, storedValue]);

  return [storedValue, setValue] as const;
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

### State Management

```tsx
// Zustand - simple global state
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  total: () => number;
}

const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => set((state) => ({
        items: [...state.items, item]
      })),
      removeItem: (id) => set((state) => ({
        items: state.items.filter(i => i.id !== id)
      })),
      clearCart: () => set({ items: [] }),
      total: () => get().items.reduce((sum, item) => sum + item.price, 0)
    }),
    { name: 'cart-storage' }
  )
);

// React Query / TanStack Query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => api.getUsers(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newUser: CreateUserInput) => api.createUser(newUser),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
```

---

## Next.js / App Router

### Server Components

```tsx
// app/users/page.tsx - Server Component (default)
async function UsersPage() {
  // Direct database access in server component
  const users = await db.user.findMany();

  return (
    <div>
      <h1>Users</h1>
      <UserList users={users} />
    </div>
  );
}

// Client component for interactivity
'use client';

import { useState } from 'react';

function UserList({ users }: { users: User[] }) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <ul>
      {users.map(user => (
        <li
          key={user.id}
          onClick={() => setSelected(user.id)}
          className={selected === user.id ? 'selected' : ''}
        >
          {user.name}
        </li>
      ))}
    </ul>
  );
}
```

### Server Actions

```tsx
// app/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createUser(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;

  await db.user.create({
    data: { name, email }
  });

  revalidatePath('/users');
  redirect('/users');
}

// Usage in component
function CreateUserForm() {
  return (
    <form action={createUser}>
      <input name="name" required />
      <input name="email" type="email" required />
      <button type="submit">Create</button>
    </form>
  );
}
```

### Route Handlers

```tsx
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limit = parseInt(searchParams.get('limit') || '10');

  const users = await db.user.findMany({ take: limit });
  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const user = await db.user.create({ data: body });
  return NextResponse.json(user, { status: 201 });
}
```

---

## CSS & Styling

### Tailwind CSS

```tsx
// Component with Tailwind
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm
                    hover:shadow-md transition-shadow duration-200
                    dark:bg-gray-800 dark:border-gray-700">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h2>
      <div className="text-gray-600 dark:text-gray-300">
        {children}
      </div>
    </div>
  );
}

// With clsx/cn for conditional classes
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function Button({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        {
          'bg-blue-600 text-white hover:bg-blue-700': variant === 'primary',
          'bg-gray-200 text-gray-900 hover:bg-gray-300': variant === 'secondary',
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-4 py-2 text-base': size === 'md',
          'px-6 py-3 text-lg': size === 'lg',
        },
        className
      )}
      {...props}
    />
  );
}
```

### CSS Modules

```tsx
// Button.module.css
.button {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
}

.primary {
  background-color: var(--color-primary);
  color: white;
}

.secondary {
  background-color: var(--color-gray-200);
  color: var(--color-gray-900);
}

// Button.tsx
import styles from './Button.module.css';

function Button({ variant = 'primary', children }) {
  return (
    <button className={`${styles.button} ${styles[variant]}`}>
      {children}
    </button>
  );
}
```

---

## Performance Optimization

### Code Splitting

```tsx
// Dynamic imports
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false, // Client-only component
});

// React.lazy with Suspense
const Dashboard = lazy(() => import('./Dashboard'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Dashboard />
    </Suspense>
  );
}
```

### Virtualization

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });

  return (
    <div ref={parentRef} className="h-[400px] overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              transform: `translateY(${virtualItem.start}px)`,
              height: `${virtualItem.size}px`,
            }}
          >
            {items[virtualItem.index].name}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Image Optimization

```tsx
import Image from 'next/image';

function ProductImage({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={400}
      height={300}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQ..."
      sizes="(max-width: 768px) 100vw, 400px"
      priority={false}
    />
  );
}
```

---

## Testing

### Component Testing

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('LoginForm', () => {
  it('submits with valid credentials', async () => {
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('shows validation errors', async () => {
    render(<LoginForm onSubmit={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
  });
});
```

---

## Related Skills

- [[testing-strategies]] - Frontend testing
- [[performance-optimization]] - Web performance
- [[ux-principles]] - User experience

