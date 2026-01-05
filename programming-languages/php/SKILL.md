---
name: php
description: Modern PHP programming patterns
domain: programming-languages
version: 1.0.0
tags: [php, laravel, composer, oop, traits]
---

# PHP

## Overview

Modern PHP (7.4+/8.x) patterns including typed properties, attributes, and modern OOP features.

---

## Modern PHP Features

### Type System

```php
<?php

declare(strict_types=1);

// Typed properties (PHP 7.4+)
class User
{
    public string $id;
    public string $email;
    public ?string $name = null;
    public bool $active = true;
    public array $roles = [];
    public DateTimeImmutable $createdAt;

    // Constructor promotion (PHP 8.0+)
    public function __construct(
        public readonly string $email,
        public readonly string $name,
        private string $password
    ) {
        $this->id = uniqid();
        $this->createdAt = new DateTimeImmutable();
    }
}

// Union types (PHP 8.0+)
function process(string|int $value): string|int
{
    return is_string($value) ? strtoupper($value) : $value * 2;
}

// Intersection types (PHP 8.1+)
function processIterable(Countable&Iterator $items): int
{
    return count($items);
}

// Return types
function findUser(string $id): ?User
{
    return $this->repository->find($id);
}

function getUsers(): array
{
    return $this->repository->findAll();
}

// Never return type (PHP 8.1+)
function fail(string $message): never
{
    throw new RuntimeException($message);
}

// Nullable types
function setName(?string $name): void
{
    $this->name = $name;
}
```

### Attributes (PHP 8.0+)

```php
<?php

use Attribute;

// Define attribute
#[Attribute(Attribute::TARGET_PROPERTY)]
class Column
{
    public function __construct(
        public string $name,
        public string $type = 'string',
        public bool $nullable = false
    ) {}
}

#[Attribute(Attribute::TARGET_METHOD)]
class Route
{
    public function __construct(
        public string $path,
        public string $method = 'GET'
    ) {}
}

#[Attribute(Attribute::TARGET_CLASS)]
class Entity
{
    public function __construct(
        public string $table
    ) {}
}

// Using attributes
#[Entity(table: 'users')]
class User
{
    #[Column(name: 'id', type: 'uuid')]
    public string $id;

    #[Column(name: 'email', type: 'string')]
    public string $email;

    #[Column(name: 'name', nullable: true)]
    public ?string $name;
}

class UserController
{
    #[Route(path: '/users', method: 'GET')]
    public function index(): array
    {
        return $this->userService->getAll();
    }

    #[Route(path: '/users/{id}', method: 'GET')]
    public function show(string $id): User
    {
        return $this->userService->find($id);
    }
}

// Reading attributes
$reflection = new ReflectionClass(User::class);
$attributes = $reflection->getAttributes(Entity::class);

foreach ($attributes as $attribute) {
    $instance = $attribute->newInstance();
    echo $instance->table; // 'users'
}
```

### Enums (PHP 8.1+)

```php
<?php

// Basic enum
enum Status
{
    case Pending;
    case Active;
    case Inactive;

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Pending Review',
            self::Active => 'Active',
            self::Inactive => 'Inactive',
        };
    }
}

// Backed enum (with values)
enum Role: string
{
    case Admin = 'admin';
    case Moderator = 'moderator';
    case User = 'user';

    public function permissions(): array
    {
        return match ($this) {
            self::Admin => ['read', 'write', 'delete', 'admin'],
            self::Moderator => ['read', 'write', 'delete'],
            self::User => ['read', 'write'],
        };
    }

    public static function fromString(string $value): self
    {
        return self::from($value);
    }

    public static function tryFromString(string $value): ?self
    {
        return self::tryFrom($value);
    }
}

// Usage
$status = Status::Active;
echo $status->label(); // "Active"

$role = Role::Admin;
echo $role->value; // "admin"

$userRole = Role::from('user');
$permissions = $userRole->permissions();
```

---

## Object-Oriented Patterns

### Traits

```php
<?php

// Trait definition
trait Timestampable
{
    protected ?DateTimeImmutable $createdAt = null;
    protected ?DateTimeImmutable $updatedAt = null;

    public function getCreatedAt(): ?DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): ?DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function touch(): void
    {
        $now = new DateTimeImmutable();
        $this->createdAt ??= $now;
        $this->updatedAt = $now;
    }
}

trait SoftDeletable
{
    protected ?DateTimeImmutable $deletedAt = null;

    public function delete(): void
    {
        $this->deletedAt = new DateTimeImmutable();
    }

    public function restore(): void
    {
        $this->deletedAt = null;
    }

    public function isDeleted(): bool
    {
        return $this->deletedAt !== null;
    }
}

// Using traits
class Document
{
    use Timestampable;
    use SoftDeletable;

    public function __construct(
        public string $title,
        public string $content
    ) {
        $this->touch();
    }
}

// Trait conflict resolution
trait A
{
    public function hello(): string
    {
        return 'Hello from A';
    }
}

trait B
{
    public function hello(): string
    {
        return 'Hello from B';
    }
}

class MyClass
{
    use A, B {
        A::hello insteadof B;
        B::hello as helloFromB;
    }
}
```

### Interfaces and Abstract Classes

```php
<?php

// Interface
interface Repository
{
    public function find(string $id): ?object;
    public function findAll(): array;
    public function save(object $entity): void;
    public function delete(string $id): void;
}

// Generic-style interface
interface Collection
{
    public function add(mixed $item): void;
    public function remove(mixed $item): bool;
    public function contains(mixed $item): bool;
    public function count(): int;
    public function toArray(): array;
}

// Abstract class
abstract class BaseRepository implements Repository
{
    public function __construct(
        protected PDO $pdo,
        protected string $table
    ) {}

    abstract protected function hydrate(array $row): object;

    public function find(string $id): ?object
    {
        $stmt = $this->pdo->prepare(
            "SELECT * FROM {$this->table} WHERE id = :id"
        );
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        return $row ? $this->hydrate($row) : null;
    }

    public function findAll(): array
    {
        $stmt = $this->pdo->query("SELECT * FROM {$this->table}");
        return array_map(
            fn(array $row) => $this->hydrate($row),
            $stmt->fetchAll(PDO::FETCH_ASSOC)
        );
    }
}

// Concrete implementation
class UserRepository extends BaseRepository
{
    public function __construct(PDO $pdo)
    {
        parent::__construct($pdo, 'users');
    }

    protected function hydrate(array $row): User
    {
        return new User(
            id: $row['id'],
            email: $row['email'],
            name: $row['name']
        );
    }

    public function findByEmail(string $email): ?User
    {
        // Custom method
    }
}
```

---

## Error Handling

```php
<?php

// Custom exceptions
class AppException extends Exception
{
    public function __construct(
        string $message,
        public readonly string $code,
        public readonly array $context = [],
        ?Throwable $previous = null
    ) {
        parent::__construct($message, 0, $previous);
    }
}

class ValidationException extends AppException
{
    public function __construct(
        public readonly array $errors,
        ?Throwable $previous = null
    ) {
        parent::__construct(
            'Validation failed',
            'VALIDATION_ERROR',
            ['errors' => $errors],
            $previous
        );
    }
}

class NotFoundException extends AppException
{
    public function __construct(
        string $resource,
        string $id,
        ?Throwable $previous = null
    ) {
        parent::__construct(
            "{$resource} not found: {$id}",
            'NOT_FOUND',
            ['resource' => $resource, 'id' => $id],
            $previous
        );
    }
}

// Result pattern
readonly class Result
{
    private function __construct(
        public mixed $value,
        public ?string $error,
        public bool $success
    ) {}

    public static function success(mixed $value): self
    {
        return new self($value, null, true);
    }

    public static function failure(string $error): self
    {
        return new self(null, $error, false);
    }

    public function map(callable $fn): self
    {
        if (!$this->success) {
            return $this;
        }
        return self::success($fn($this->value));
    }

    public function flatMap(callable $fn): self
    {
        if (!$this->success) {
            return $this;
        }
        return $fn($this->value);
    }
}

// Usage
function createUser(array $data): Result
{
    if (empty($data['email'])) {
        return Result::failure('Email is required');
    }

    try {
        $user = new User($data['email'], $data['name'] ?? '');
        $this->repository->save($user);
        return Result::success($user);
    } catch (Exception $e) {
        return Result::failure($e->getMessage());
    }
}
```

---

## Collections and Arrays

```php
<?php

// Array functions
$users = [
    ['name' => 'Alice', 'age' => 30],
    ['name' => 'Bob', 'age' => 25],
    ['name' => 'Charlie', 'age' => 35],
];

// Filter
$adults = array_filter($users, fn($u) => $u['age'] >= 30);

// Map
$names = array_map(fn($u) => $u['name'], $users);

// Reduce
$totalAge = array_reduce($users, fn($sum, $u) => $sum + $u['age'], 0);

// Find
$bob = array_filter($users, fn($u) => $u['name'] === 'Bob');
$bob = current($bob); // Get first match

// Sort
usort($users, fn($a, $b) => $a['age'] <=> $b['age']);

// Group by (custom)
function groupBy(array $items, string $key): array
{
    return array_reduce($items, function ($groups, $item) use ($key) {
        $groups[$item[$key]][] = $item;
        return $groups;
    }, []);
}

// Collection class
class Collection implements Countable, IteratorAggregate
{
    public function __construct(private array $items = []) {}

    public static function from(array $items): self
    {
        return new self($items);
    }

    public function map(callable $fn): self
    {
        return new self(array_map($fn, $this->items));
    }

    public function filter(callable $fn): self
    {
        return new self(array_filter($this->items, $fn));
    }

    public function reduce(callable $fn, mixed $initial = null): mixed
    {
        return array_reduce($this->items, $fn, $initial);
    }

    public function first(): mixed
    {
        return $this->items[array_key_first($this->items)] ?? null;
    }

    public function count(): int
    {
        return count($this->items);
    }

    public function getIterator(): Traversable
    {
        return new ArrayIterator($this->items);
    }

    public function toArray(): array
    {
        return $this->items;
    }
}

// Usage
$result = Collection::from($users)
    ->filter(fn($u) => $u['age'] >= 30)
    ->map(fn($u) => $u['name'])
    ->toArray();
```

---

## Dependency Injection

```php
<?php

// Interface definition
interface LoggerInterface
{
    public function info(string $message, array $context = []): void;
    public function error(string $message, array $context = []): void;
}

interface UserRepositoryInterface
{
    public function find(string $id): ?User;
    public function save(User $user): void;
}

// Service with constructor injection
class UserService
{
    public function __construct(
        private readonly UserRepositoryInterface $repository,
        private readonly LoggerInterface $logger,
        private readonly EventDispatcher $events
    ) {}

    public function createUser(string $email, string $name): User
    {
        $this->logger->info('Creating user', ['email' => $email]);

        $user = new User($email, $name);
        $this->repository->save($user);

        $this->events->dispatch(new UserCreated($user));

        return $user;
    }
}

// Simple container
class Container
{
    private array $bindings = [];
    private array $instances = [];

    public function bind(string $abstract, callable $concrete): void
    {
        $this->bindings[$abstract] = $concrete;
    }

    public function singleton(string $abstract, callable $concrete): void
    {
        $this->bindings[$abstract] = function ($c) use ($abstract, $concrete) {
            if (!isset($this->instances[$abstract])) {
                $this->instances[$abstract] = $concrete($c);
            }
            return $this->instances[$abstract];
        };
    }

    public function get(string $abstract): mixed
    {
        if (isset($this->bindings[$abstract])) {
            return $this->bindings[$abstract]($this);
        }

        return $this->resolve($abstract);
    }

    private function resolve(string $class): object
    {
        $reflection = new ReflectionClass($class);
        $constructor = $reflection->getConstructor();

        if (!$constructor) {
            return new $class();
        }

        $params = array_map(
            fn(ReflectionParameter $p) => $this->get($p->getType()->getName()),
            $constructor->getParameters()
        );

        return $reflection->newInstanceArgs($params);
    }
}
```

---

## Related Skills

- [[backend]] - Laravel, Symfony
- [[database]] - Doctrine, Eloquent
- [[testing]] - PHPUnit, Pest
