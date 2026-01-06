# PHP Templates

Project configuration templates for PHP applications.

## Files

| Template | Purpose |
|----------|---------|
| `composer.json` | Dependency management |
| `phpunit.xml` | Test configuration |

## Usage

### Quick Start

```bash
# Copy templates
cp templates/composer.json ./composer.json
cp templates/phpunit.xml ./phpunit.xml

# Install dependencies
composer install

# Run tests
composer test

# Run full check
composer check
```

## Composer Dependencies

### Production

| Package | Purpose |
|---------|---------|
| guzzlehttp/guzzle | HTTP client |
| monolog/monolog | Logging |
| vlucas/phpdotenv | Environment variables |
| nesbot/carbon | Date/time handling |
| ramsey/uuid | UUID generation |

### Development

| Package | Purpose |
|---------|---------|
| phpunit/phpunit | Testing |
| mockery/mockery | Mocking |
| phpstan/phpstan | Static analysis |
| php_codesniffer | PSR-12 linting |
| php-cs-fixer | Code formatting |
| fakerphp/faker | Test data |

## Composer Scripts

```bash
composer test            # Run tests
composer test:coverage   # Run with coverage
composer lint            # Check code style
composer lint:fix        # Auto-fix style
composer analyze         # Static analysis
composer cs-fix          # Format code
composer check           # Run all checks
```

## PHPUnit Configuration

### Test Suites

| Suite | Directory |
|-------|-----------|
| Unit | `tests/Unit/` |
| Feature | `tests/Feature/` |
| Integration | `tests/Integration/` |

### Coverage Output

| Format | Location |
|--------|----------|
| HTML | `coverage/` |
| Clover XML | `coverage/clover.xml` |
| JUnit | `coverage/junit.xml` |

## Project Structure

```
my-project/
├── composer.json
├── phpunit.xml
├── .env
├── .env.example
├── src/
│   ├── Controllers/
│   ├── Models/
│   ├── Services/
│   └── bootstrap.php
├── tests/
│   ├── Unit/
│   ├── Feature/
│   └── TestCase.php
├── public/
│   └── index.php
└── storage/
    └── logs/
```

## Environment Setup

```bash
# Create .env
cp .env.example .env

# .env contents
APP_ENV=local
APP_DEBUG=true
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_DATABASE=myapp
DB_USERNAME=root
DB_PASSWORD=
```

## Test Example

```php
<?php
// tests/Unit/ExampleTest.php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class ExampleTest extends TestCase
{
    public function test_example(): void
    {
        $this->assertTrue(true);
    }
}
```

## Customization

### Add Laravel

```bash
composer require laravel/framework
```

### Add Symfony

```bash
composer require symfony/framework-bundle
```

### Change PHP Version

```json
{
    "require": {
        "php": ">=8.3"
    }
}
```

### Change PHPStan Level

```bash
composer analyze -- --level=9
```
