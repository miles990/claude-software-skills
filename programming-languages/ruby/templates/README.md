# Ruby Templates

Project configuration templates for Ruby applications.

## Files

| Template | Purpose |
|----------|---------|
| `Gemfile` | Dependency management |
| `.rubocop.yml` | Code style/linting |

## Usage

### Quick Start

```bash
# Copy templates
cp templates/Gemfile ./Gemfile
cp templates/.rubocop.yml ./.rubocop.yml

# Install dependencies
bundle install

# Run linter
bundle exec rubocop

# Auto-fix issues
bundle exec rubocop -A
```

## Gemfile Features

| Category | Gems |
|----------|------|
| Database | pg, sequel, redis |
| HTTP | faraday, oj |
| Auth | bcrypt, jwt, rack-attack |
| Jobs | sidekiq |
| Validation | dry-validation, dry-types |
| Testing | rspec, factory_bot, faker |
| Coverage | simplecov |
| Mocking | webmock, vcr |

## RuboCop Configuration

| Setting | Value |
|---------|-------|
| Ruby Version | 3.2 |
| Line Length | 120 |
| Method Length | 20 |
| Class Length | 150 |

### Plugins

- `rubocop-rspec` - RSpec best practices
- `rubocop-performance` - Performance optimizations

## Project Structure

```
my-project/
├── Gemfile
├── Gemfile.lock
├── .rubocop.yml
├── .ruby-version
├── lib/
│   └── my_app/
│       └── version.rb
├── spec/
│   ├── spec_helper.rb
│   └── my_app/
└── bin/
    └── console
```

## Common Commands

```bash
# Install gems
bundle install

# Update gems
bundle update

# Run tests
bundle exec rspec

# Run tests with coverage
COVERAGE=true bundle exec rspec

# Lint code
bundle exec rubocop

# Auto-fix lint issues
bundle exec rubocop -A

# Interactive console
bundle exec bin/console
```

## Environment Setup

```bash
# .ruby-version
echo "3.2.2" > .ruby-version

# .env
DATABASE_URL=postgres://localhost/myapp_dev
REDIS_URL=redis://localhost:6379
```

## RSpec Setup

```ruby
# spec/spec_helper.rb
require 'simplecov'
SimpleCov.start

require 'factory_bot'
require 'webmock/rspec'

RSpec.configure do |config|
  config.include FactoryBot::Syntax::Methods

  config.before(:suite) do
    FactoryBot.find_definitions
  end
end
```

## Customization

### Add Rails

Uncomment Rails gems in Gemfile:

```ruby
gem 'rails', '~> 7.1'
gem 'puma', '~> 6.4'
```

### Disable Cops

```yaml
# .rubocop.yml
Style/SomeCop:
  Enabled: false
```

### Per-file Exceptions

```yaml
# .rubocop.yml
Metrics/MethodLength:
  Exclude:
    - 'db/migrate/*.rb'
```
