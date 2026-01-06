-- SQL Migration Template
-- Usage: Adapt for your migration tool (Prisma, Knex, raw SQL)
-- Convention: YYYYMMDDHHMMSS_description.sql

-- ===========================================
-- UP Migration
-- ===========================================

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    password_hash VARCHAR(255),
    role VARCHAR(20) DEFAULT 'USER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE -- Soft delete
);

-- Create index on email
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT,
    published BOOLEAN DEFAULT FALSE,
    author_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on author
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to users
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to posts
CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- DOWN Migration (Rollback)
-- ===========================================

-- DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
-- DROP TRIGGER IF EXISTS update_users_updated_at ON users;
-- DROP FUNCTION IF EXISTS update_updated_at_column();
-- DROP TABLE IF EXISTS posts;
-- DROP TABLE IF EXISTS users;

-- ===========================================
-- Common Patterns
-- ===========================================

-- Add column:
-- ALTER TABLE users ADD COLUMN phone VARCHAR(20);

-- Rename column:
-- ALTER TABLE users RENAME COLUMN name TO full_name;

-- Add foreign key:
-- ALTER TABLE posts ADD CONSTRAINT fk_author
--     FOREIGN KEY (author_id) REFERENCES users(id);

-- Create enum type (PostgreSQL):
-- CREATE TYPE role_type AS ENUM ('USER', 'ADMIN', 'MODERATOR');

-- Add check constraint:
-- ALTER TABLE users ADD CONSTRAINT chk_email
--     CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
