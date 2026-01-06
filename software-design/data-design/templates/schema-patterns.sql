-- ===========================================
-- Data Design Schema Patterns
-- Usage: Reference patterns for common scenarios
-- ===========================================

-- ===========================================
-- Pattern 1: Hierarchical Data (Self-referencing)
-- ===========================================

-- Tree structure (e.g., categories, org chart)
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    depth INTEGER NOT NULL DEFAULT 0,
    path TEXT,  -- Materialized path: '/root/parent/child'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for tree queries
CREATE INDEX idx_categories_parent ON categories (parent_id);
CREATE INDEX idx_categories_path ON categories (path);

-- Recursive query example
-- WITH RECURSIVE category_tree AS (
--     SELECT id, name, parent_id, 0 as level
--     FROM categories WHERE parent_id IS NULL
--     UNION ALL
--     SELECT c.id, c.name, c.parent_id, ct.level + 1
--     FROM categories c
--     JOIN category_tree ct ON c.parent_id = ct.id
-- )
-- SELECT * FROM category_tree;

-- ===========================================
-- Pattern 2: Many-to-Many with Metadata
-- ===========================================

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL
);

-- Roles
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL
);

-- User-Role junction with metadata
CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    granted_by UUID REFERENCES users(id),
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    PRIMARY KEY (user_id, role_id)
);

CREATE INDEX idx_user_roles_role ON user_roles (role_id);

-- ===========================================
-- Pattern 3: Polymorphic Associations
-- ===========================================

-- Comments that can belong to multiple entity types
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    body TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES users(id),

    -- Polymorphic reference
    commentable_type VARCHAR(50) NOT NULL,  -- 'post', 'article', 'product'
    commentable_id UUID NOT NULL,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_target ON comments (commentable_type, commentable_id);

-- Alternative: Separate FKs (more type-safe)
-- CREATE TABLE comments (
--     id UUID PRIMARY KEY,
--     body TEXT NOT NULL,
--     post_id UUID REFERENCES posts(id),
--     article_id UUID REFERENCES articles(id),
--     CONSTRAINT one_parent CHECK (
--         (post_id IS NOT NULL)::int + (article_id IS NOT NULL)::int = 1
--     )
-- );

-- ===========================================
-- Pattern 4: Event Sourcing / Audit Trail
-- ===========================================

-- Events table (append-only)
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stream_id UUID NOT NULL,        -- Aggregate ID
    stream_type VARCHAR(100) NOT NULL,  -- 'Order', 'User'
    event_type VARCHAR(100) NOT NULL,   -- 'OrderCreated', 'ItemAdded'
    version INTEGER NOT NULL,
    payload JSONB NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE (stream_id, version)
);

CREATE INDEX idx_events_stream ON events (stream_id, version);
CREATE INDEX idx_events_type ON events (event_type);
CREATE INDEX idx_events_created ON events (created_at);

-- ===========================================
-- Pattern 5: Temporal Data (Time-based)
-- ===========================================

-- Price history with validity periods
CREATE TABLE product_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    valid_from TIMESTAMPTZ NOT NULL,
    valid_to TIMESTAMPTZ,  -- NULL = current

    -- Prevent overlapping periods
    EXCLUDE USING gist (
        product_id WITH =,
        tstzrange(valid_from, valid_to) WITH &&
    )
);

-- Get current price
-- SELECT * FROM product_prices
-- WHERE product_id = 'xxx'
-- AND valid_from <= NOW()
-- AND (valid_to IS NULL OR valid_to > NOW());

-- ===========================================
-- Pattern 6: EAV (Entity-Attribute-Value)
-- ===========================================

-- Dynamic attributes (use sparingly)
CREATE TABLE entity_attributes (
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    attribute_name VARCHAR(100) NOT NULL,
    attribute_value TEXT,
    value_type VARCHAR(20) DEFAULT 'string',  -- string, number, boolean, json
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (entity_type, entity_id, attribute_name)
);

CREATE INDEX idx_attrs_entity ON entity_attributes (entity_type, entity_id);

-- Better alternative: JSONB column
-- CREATE TABLE products (
--     id UUID PRIMARY KEY,
--     name VARCHAR(255) NOT NULL,
--     attributes JSONB DEFAULT '{}'  -- Flexible attributes
-- );
-- CREATE INDEX idx_products_attrs ON products USING GIN (attributes);

-- ===========================================
-- Pattern 7: Tagging System
-- ===========================================

-- Tags
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50),
    usage_count INTEGER DEFAULT 0
);

-- Taggings (junction)
CREATE TABLE taggings (
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    taggable_type VARCHAR(50) NOT NULL,
    taggable_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (tag_id, taggable_type, taggable_id)
);

CREATE INDEX idx_taggings_target ON taggings (taggable_type, taggable_id);

-- Find items by tag
-- SELECT DISTINCT taggable_id FROM taggings
-- WHERE taggable_type = 'post' AND tag_id IN (
--     SELECT id FROM tags WHERE slug IN ('javascript', 'react')
-- );

-- ===========================================
-- Pattern 8: Soft Delete with Archive
-- ===========================================

-- Main table
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT,
    status VARCHAR(20) DEFAULT 'draft',
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Archive table (same structure + archive metadata)
CREATE TABLE posts_archive (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    status VARCHAR(20),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    -- Archive metadata
    archived_at TIMESTAMPTZ DEFAULT NOW(),
    archived_by UUID
);

-- Archive function
-- CREATE OR REPLACE FUNCTION archive_post(post_id UUID, user_id UUID)
-- RETURNS VOID AS $$
-- BEGIN
--     INSERT INTO posts_archive
--     SELECT *, NOW(), user_id FROM posts WHERE id = post_id;
--     DELETE FROM posts WHERE id = post_id;
-- END;
-- $$ LANGUAGE plpgsql;
