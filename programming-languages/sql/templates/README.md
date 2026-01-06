# SQL Templates

Migration and schema templates for SQL databases.

## Files

| Template | Purpose |
|----------|---------|
| `migration-template.sql` | PostgreSQL migration example |

## Usage

### Migration Naming

```
{number}_{description}.sql

Examples:
001_create_users_table.sql
002_add_user_settings.sql
003_create_sessions_table.sql
```

### Apply Migration

```bash
# Using psql
psql -d mydb -f migrations/001_create_users_table.sql

# Using migrate tool
migrate -path ./migrations -database "postgres://..." up

# Using Prisma
npx prisma migrate deploy
```

## Common Patterns

### Primary Keys

```sql
-- UUID (recommended for distributed)
id UUID PRIMARY KEY DEFAULT uuid_generate_v4()

-- Serial (auto-increment)
id SERIAL PRIMARY KEY

-- ULID/CUID (sortable)
id VARCHAR(26) PRIMARY KEY
```

### Timestamps

```sql
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
deleted_at TIMESTAMPTZ  -- For soft delete
```

### Auto-update Trigger

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER {table}_updated_at
    BEFORE UPDATE ON {table}
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### Soft Delete

```sql
-- Add column
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMPTZ;

-- Soft delete
UPDATE users SET deleted_at = NOW() WHERE id = 'uuid';

-- Query active only
SELECT * FROM users WHERE deleted_at IS NULL;
```

### JSONB Columns

```sql
-- Create with JSONB
settings JSONB DEFAULT '{}',

-- Create GIN index
CREATE INDEX idx_settings ON users USING GIN (settings);

-- Query JSONB
SELECT * FROM users WHERE settings->>'theme' = 'dark';
SELECT * FROM users WHERE settings @> '{"notifications": true}';
```

### Enum Types

```sql
-- Create enum
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');

-- Use enum
status user_status NOT NULL DEFAULT 'active'

-- Add value (PostgreSQL 9.1+)
ALTER TYPE user_status ADD VALUE 'pending';
```

### Foreign Keys

```sql
-- Basic FK
user_id UUID REFERENCES users(id)

-- With cascade
user_id UUID REFERENCES users(id) ON DELETE CASCADE

-- With set null
user_id UUID REFERENCES users(id) ON DELETE SET NULL
```

## Index Guidelines

```sql
-- Single column
CREATE INDEX idx_users_email ON users (email);

-- Composite (order matters)
CREATE INDEX idx_orders_user_date ON orders (user_id, created_at DESC);

-- Partial index
CREATE INDEX idx_users_active ON users (email) WHERE status = 'active';

-- Expression index
CREATE INDEX idx_users_email_lower ON users (LOWER(email));

-- JSONB index
CREATE INDEX idx_settings ON users USING GIN (settings);
```

## Migration Best Practices

### DO
- Use transactions for safety
- Add indexes concurrently in production
- Include rollback statements
- Test on staging first

### DON'T
- Drop columns without backup
- Run long migrations during peak hours
- Forget to update ORM schema

### Safe Column Add

```sql
-- Safe: adds nullable column
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

-- Then update data
UPDATE users SET phone = 'default' WHERE phone IS NULL;

-- Then add constraint
ALTER TABLE users ALTER COLUMN phone SET NOT NULL;
```

### Safe Index Creation

```sql
-- Concurrent (no table lock)
CREATE INDEX CONCURRENTLY idx_name ON table (column);
```
