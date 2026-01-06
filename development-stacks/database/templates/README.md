# Database Templates

Ready-to-use database configuration and schema templates.

## Files

| Template | Purpose |
|----------|---------|
| `schema.prisma` | Prisma ORM schema with common patterns |
| `migration.sql` | SQL migration template (PostgreSQL) |
| `docker-compose.db.yml` | Local database services |

## Usage

### Prisma Schema

```bash
mkdir -p prisma
cp templates/schema.prisma prisma/schema.prisma

# Install Prisma
npm install prisma @prisma/client

# Initialize
npx prisma generate
npx prisma migrate dev --name init
```

### Docker Databases

```bash
cp templates/docker-compose.db.yml ./docker-compose.db.yml

# Start PostgreSQL only
docker-compose -f docker-compose.db.yml up -d postgres

# Start all databases
docker-compose -f docker-compose.db.yml up -d

# View Adminer GUI
open http://localhost:8080
```

### Raw SQL Migration

```bash
cp templates/migration.sql migrations/001_initial.sql

# Edit and run with your preferred tool
psql -d mydb -f migrations/001_initial.sql
```

## Connection Strings

| Database | Connection String |
|----------|-------------------|
| PostgreSQL | `postgresql://postgres:postgres@localhost:5432/mydb` |
| MySQL | `mysql://user:password@localhost:3306/mydb` |
| MongoDB | `mongodb://root:password@localhost:27017/mydb` |
| Redis | `redis://localhost:6379` |

## Environment Setup

Create `.env` file:

```env
# PostgreSQL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mydb"

# Or MySQL
DATABASE_URL="mysql://user:password@localhost:3306/mydb"

# Or MongoDB
DATABASE_URL="mongodb://root:password@localhost:27017/mydb"
```

## Common Prisma Commands

```bash
# Generate client after schema changes
npx prisma generate

# Create migration
npx prisma migrate dev --name add_users

# Apply migrations in production
npx prisma migrate deploy

# Open Prisma Studio
npx prisma studio

# Reset database
npx prisma migrate reset
```
