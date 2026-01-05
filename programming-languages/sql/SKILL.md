---
name: sql
description: SQL patterns for database querying and design
domain: programming-languages
version: 1.0.0
tags: [sql, postgresql, mysql, queries, database]
---

# SQL

## Overview

SQL patterns for querying, data manipulation, and database design.

---

## Query Fundamentals

### Basic Queries

```sql
-- SELECT with filtering
SELECT
    id,
    email,
    name,
    created_at
FROM users
WHERE active = true
  AND created_at >= '2024-01-01'
ORDER BY created_at DESC
LIMIT 10 OFFSET 0;

-- Multiple conditions
SELECT *
FROM orders
WHERE status IN ('pending', 'processing')
  AND total_amount > 100
  AND (priority = 'high' OR customer_type = 'premium');

-- LIKE and pattern matching
SELECT *
FROM products
WHERE name LIKE '%widget%'          -- Contains 'widget'
   OR name LIKE 'Premium%'          -- Starts with 'Premium'
   OR sku SIMILAR TO '[A-Z]{3}-[0-9]{4}';  -- Regex pattern (PostgreSQL)

-- NULL handling
SELECT
    id,
    COALESCE(nickname, name, 'Anonymous') AS display_name,
    NULLIF(discount, 0) AS discount_or_null
FROM users
WHERE deleted_at IS NULL;

-- CASE expressions
SELECT
    id,
    name,
    CASE
        WHEN total >= 1000 THEN 'Gold'
        WHEN total >= 500 THEN 'Silver'
        WHEN total >= 100 THEN 'Bronze'
        ELSE 'Standard'
    END AS tier,
    CASE status
        WHEN 'active' THEN 1
        WHEN 'pending' THEN 2
        ELSE 3
    END AS sort_order
FROM customers
ORDER BY sort_order;

-- Distinct and counting
SELECT DISTINCT category
FROM products;

SELECT
    category,
    COUNT(*) AS product_count,
    COUNT(DISTINCT brand) AS brand_count
FROM products
GROUP BY category;
```

### Joins

```sql
-- INNER JOIN (only matching rows)
SELECT
    o.id AS order_id,
    o.total_amount,
    u.name AS customer_name,
    u.email
FROM orders o
INNER JOIN users u ON o.user_id = u.id
WHERE o.status = 'completed';

-- LEFT JOIN (all from left, matching from right)
SELECT
    u.id,
    u.name,
    COUNT(o.id) AS order_count,
    COALESCE(SUM(o.total_amount), 0) AS total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name;

-- Multiple joins
SELECT
    o.id AS order_id,
    u.name AS customer_name,
    p.name AS product_name,
    oi.quantity,
    oi.unit_price
FROM orders o
JOIN users u ON o.user_id = u.id
JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON oi.product_id = p.id
WHERE o.created_at >= CURRENT_DATE - INTERVAL '30 days';

-- Self join
SELECT
    e.name AS employee,
    m.name AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id;

-- Cross join (cartesian product)
SELECT
    p.name AS product,
    c.name AS color
FROM products p
CROSS JOIN colors c;
```

### Aggregations

```sql
-- Basic aggregation
SELECT
    category,
    COUNT(*) AS product_count,
    SUM(price) AS total_value,
    AVG(price) AS avg_price,
    MIN(price) AS min_price,
    MAX(price) AS max_price
FROM products
GROUP BY category
HAVING COUNT(*) >= 5
ORDER BY product_count DESC;

-- Group by multiple columns
SELECT
    EXTRACT(YEAR FROM created_at) AS year,
    EXTRACT(MONTH FROM created_at) AS month,
    status,
    COUNT(*) AS order_count,
    SUM(total_amount) AS revenue
FROM orders
GROUP BY
    EXTRACT(YEAR FROM created_at),
    EXTRACT(MONTH FROM created_at),
    status
ORDER BY year, month;

-- ROLLUP (subtotals and grand total)
SELECT
    COALESCE(category, 'TOTAL') AS category,
    COALESCE(brand, 'All Brands') AS brand,
    COUNT(*) AS count,
    SUM(price) AS total
FROM products
GROUP BY ROLLUP (category, brand);

-- CUBE (all combinations)
SELECT
    category,
    brand,
    SUM(sales) AS total_sales
FROM product_sales
GROUP BY CUBE (category, brand);

-- GROUPING SETS
SELECT
    category,
    brand,
    SUM(sales) AS total_sales
FROM product_sales
GROUP BY GROUPING SETS (
    (category, brand),
    (category),
    (brand),
    ()
);
```

---

## Advanced Queries

### Window Functions

```sql
-- Row numbering
SELECT
    id,
    name,
    department,
    salary,
    ROW_NUMBER() OVER (ORDER BY salary DESC) AS rank,
    ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) AS dept_rank
FROM employees;

-- Running totals
SELECT
    date,
    amount,
    SUM(amount) OVER (ORDER BY date) AS running_total,
    SUM(amount) OVER (
        ORDER BY date
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) AS rolling_7_day
FROM daily_sales;

-- Rank functions
SELECT
    name,
    department,
    salary,
    RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS rank,
    DENSE_RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS dense_rank,
    NTILE(4) OVER (ORDER BY salary DESC) AS quartile
FROM employees;

-- LAG and LEAD
SELECT
    date,
    revenue,
    LAG(revenue, 1) OVER (ORDER BY date) AS prev_day,
    LEAD(revenue, 1) OVER (ORDER BY date) AS next_day,
    revenue - LAG(revenue, 1) OVER (ORDER BY date) AS daily_change,
    100.0 * (revenue - LAG(revenue, 1) OVER (ORDER BY date))
        / LAG(revenue, 1) OVER (ORDER BY date) AS pct_change
FROM daily_revenue;

-- First/Last values
SELECT
    department,
    employee_name,
    salary,
    FIRST_VALUE(employee_name) OVER (
        PARTITION BY department ORDER BY salary DESC
    ) AS highest_paid,
    LAST_VALUE(employee_name) OVER (
        PARTITION BY department ORDER BY salary DESC
        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    ) AS lowest_paid
FROM employees;
```

### Common Table Expressions (CTEs)

```sql
-- Basic CTE
WITH active_users AS (
    SELECT *
    FROM users
    WHERE active = true
)
SELECT
    au.name,
    COUNT(o.id) AS order_count
FROM active_users au
LEFT JOIN orders o ON au.id = o.user_id
GROUP BY au.id, au.name;

-- Multiple CTEs
WITH
monthly_sales AS (
    SELECT
        DATE_TRUNC('month', created_at) AS month,
        SUM(total_amount) AS revenue
    FROM orders
    WHERE status = 'completed'
    GROUP BY DATE_TRUNC('month', created_at)
),
growth AS (
    SELECT
        month,
        revenue,
        LAG(revenue) OVER (ORDER BY month) AS prev_revenue
    FROM monthly_sales
)
SELECT
    month,
    revenue,
    prev_revenue,
    100.0 * (revenue - prev_revenue) / prev_revenue AS growth_pct
FROM growth
WHERE prev_revenue IS NOT NULL;

-- Recursive CTE (hierarchical data)
WITH RECURSIVE org_hierarchy AS (
    -- Base case: top-level employees
    SELECT
        id,
        name,
        manager_id,
        1 AS level,
        ARRAY[name] AS path
    FROM employees
    WHERE manager_id IS NULL

    UNION ALL

    -- Recursive case: employees with managers
    SELECT
        e.id,
        e.name,
        e.manager_id,
        oh.level + 1,
        oh.path || e.name
    FROM employees e
    JOIN org_hierarchy oh ON e.manager_id = oh.id
)
SELECT
    id,
    name,
    level,
    array_to_string(path, ' -> ') AS hierarchy_path
FROM org_hierarchy
ORDER BY path;
```

### Subqueries

```sql
-- Scalar subquery
SELECT
    name,
    salary,
    salary - (SELECT AVG(salary) FROM employees) AS diff_from_avg
FROM employees;

-- IN subquery
SELECT *
FROM products
WHERE category_id IN (
    SELECT id
    FROM categories
    WHERE parent_id IS NULL
);

-- EXISTS subquery
SELECT *
FROM users u
WHERE EXISTS (
    SELECT 1
    FROM orders o
    WHERE o.user_id = u.id
      AND o.created_at >= CURRENT_DATE - INTERVAL '30 days'
);

-- Correlated subquery
SELECT
    e.name,
    e.salary,
    e.department,
    (
        SELECT AVG(salary)
        FROM employees e2
        WHERE e2.department = e.department
    ) AS dept_avg
FROM employees e;

-- Lateral join (row-by-row subquery)
SELECT
    u.name,
    recent_orders.order_count,
    recent_orders.total_spent
FROM users u
CROSS JOIN LATERAL (
    SELECT
        COUNT(*) AS order_count,
        COALESCE(SUM(total_amount), 0) AS total_spent
    FROM orders o
    WHERE o.user_id = u.id
      AND o.created_at >= CURRENT_DATE - INTERVAL '90 days'
) recent_orders;
```

---

## Data Modification

```sql
-- INSERT
INSERT INTO users (email, name, created_at)
VALUES ('user@example.com', 'New User', NOW());

-- INSERT multiple rows
INSERT INTO products (name, price, category)
VALUES
    ('Product A', 19.99, 'Electronics'),
    ('Product B', 29.99, 'Electronics'),
    ('Product C', 9.99, 'Accessories');

-- INSERT from SELECT
INSERT INTO order_archive (id, user_id, total_amount, created_at)
SELECT id, user_id, total_amount, created_at
FROM orders
WHERE created_at < '2023-01-01';

-- INSERT with conflict handling (PostgreSQL)
INSERT INTO users (email, name)
VALUES ('user@example.com', 'New User')
ON CONFLICT (email)
DO UPDATE SET name = EXCLUDED.name;

-- INSERT with conflict (MySQL)
INSERT INTO users (email, name)
VALUES ('user@example.com', 'New User')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- UPDATE
UPDATE products
SET price = price * 1.1,
    updated_at = NOW()
WHERE category = 'Electronics';

-- UPDATE with JOIN
UPDATE orders o
SET status = 'archived'
FROM users u
WHERE o.user_id = u.id
  AND u.deleted_at IS NOT NULL;

-- DELETE
DELETE FROM sessions
WHERE expires_at < NOW();

-- DELETE with subquery
DELETE FROM order_items
WHERE order_id IN (
    SELECT id FROM orders WHERE status = 'cancelled'
);

-- UPSERT (PostgreSQL)
INSERT INTO page_views (page_id, view_count)
VALUES (1, 1)
ON CONFLICT (page_id)
DO UPDATE SET view_count = page_views.view_count + 1;
```

---

## Schema Design

```sql
-- Create table with constraints
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'guest')),
    active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Foreign keys
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    total_amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'completed', 'cancelled'))
);

-- Junction table (many-to-many)
CREATE TABLE product_categories (
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, category_id)
);

-- Indexes
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_orders_user_id ON orders (user_id);
CREATE INDEX idx_orders_status ON orders (status) WHERE status != 'completed';
CREATE INDEX idx_products_search ON products USING gin (to_tsvector('english', name || ' ' || description));

-- Partial index
CREATE UNIQUE INDEX idx_active_users_email
ON users (email)
WHERE active = true;

-- Generated columns (PostgreSQL 12+)
ALTER TABLE products
ADD COLUMN search_vector tsvector
GENERATED ALWAYS AS (to_tsvector('english', name || ' ' || COALESCE(description, ''))) STORED;

-- Triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
```

---

## Performance

```sql
-- EXPLAIN ANALYZE
EXPLAIN ANALYZE
SELECT *
FROM orders o
JOIN users u ON o.user_id = u.id
WHERE o.status = 'pending';

-- Query hints (PostgreSQL)
SET enable_seqscan = off;  -- Force index usage for testing

-- Batch processing
WITH batch AS (
    SELECT id
    FROM large_table
    WHERE processed = false
    ORDER BY id
    LIMIT 1000
    FOR UPDATE SKIP LOCKED
)
UPDATE large_table
SET processed = true
WHERE id IN (SELECT id FROM batch);

-- Pagination with keyset
SELECT *
FROM products
WHERE (created_at, id) < ('2024-01-01', 'abc123')
ORDER BY created_at DESC, id DESC
LIMIT 20;

-- Materialized view
CREATE MATERIALIZED VIEW monthly_sales_summary AS
SELECT
    DATE_TRUNC('month', created_at) AS month,
    COUNT(*) AS order_count,
    SUM(total_amount) AS revenue
FROM orders
WHERE status = 'completed'
GROUP BY DATE_TRUNC('month', created_at);

-- Refresh materialized view
REFRESH MATERIALIZED VIEW CONCURRENTLY monthly_sales_summary;
```

---

## Related Skills

- [[database]] - Database design patterns
- [[backend]] - Database integration
- [[performance-optimization]] - Query optimization
