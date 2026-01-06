-- ===========================================
-- SQL Migration Template
-- Usage: Copy and modify for your migrations
-- ===========================================

-- Migration: 001_create_users_table
-- Description: Create initial users table
-- Author: Your Name
-- Date: 2024-01-01

-- ===========================================
-- UP Migration
-- ===========================================

-- Create extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enum types
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'deleted');
CREATE TYPE user_role AS ENUM ('admin', 'user', 'guest');

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Basic info
    email VARCHAR(255) NOT NULL,
    username VARCHAR(50),
    password_hash VARCHAR(255),

    -- Profile
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    display_name VARCHAR(100),
    avatar_url TEXT,

    -- Status & Role
    status user_status NOT NULL DEFAULT 'active',
    role user_role NOT NULL DEFAULT 'user',

    -- Auth
    email_verified_at TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    login_count INTEGER DEFAULT 0,

    -- Settings (JSONB for flexibility)
    settings JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,

    -- Constraints
    CONSTRAINT users_email_unique UNIQUE (email),
    CONSTRAINT users_username_unique UNIQUE (username),
    CONSTRAINT users_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create indexes
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_status ON users (status) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_created_at ON users (created_at DESC);
CREATE INDEX idx_users_settings ON users USING GIN (settings);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE users IS 'User accounts table';
COMMENT ON COLUMN users.settings IS 'User preferences as JSON';
COMMENT ON COLUMN users.metadata IS 'Additional metadata as JSON';

-- ===========================================
-- Related Tables
-- ===========================================

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    user_agent TEXT,
    ip_address INET,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT sessions_token_unique UNIQUE (token_hash)
);

CREATE INDEX idx_sessions_user_id ON sessions (user_id);
CREATE INDEX idx_sessions_expires_at ON sessions (expires_at);

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs (user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs (resource_type, resource_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs (created_at DESC);

-- ===========================================
-- Sample Data (for development)
-- ===========================================

-- INSERT INTO users (email, username, first_name, last_name, role)
-- VALUES
--     ('admin@example.com', 'admin', 'Admin', 'User', 'admin'),
--     ('user@example.com', 'user', 'Regular', 'User', 'user');

-- ===========================================
-- DOWN Migration (Rollback)
-- ===========================================

-- To rollback, run these in reverse order:
--
-- DROP TABLE IF EXISTS audit_logs;
-- DROP TABLE IF EXISTS sessions;
-- DROP TRIGGER IF EXISTS users_updated_at ON users;
-- DROP FUNCTION IF EXISTS update_updated_at_column();
-- DROP TABLE IF EXISTS users;
-- DROP TYPE IF EXISTS user_role;
-- DROP TYPE IF EXISTS user_status;

-- ===========================================
-- Useful Queries
-- ===========================================

-- Soft delete user
-- UPDATE users SET deleted_at = NOW() WHERE id = 'uuid';

-- Find active users
-- SELECT * FROM users WHERE status = 'active' AND deleted_at IS NULL;

-- Search users by name (case-insensitive)
-- SELECT * FROM users WHERE
--   LOWER(first_name) LIKE LOWER('%search%') OR
--   LOWER(last_name) LIKE LOWER('%search%');

-- Get user with sessions
-- SELECT u.*, array_agg(s.*) as sessions
-- FROM users u
-- LEFT JOIN sessions s ON s.user_id = u.id
-- WHERE u.id = 'uuid'
-- GROUP BY u.id;
