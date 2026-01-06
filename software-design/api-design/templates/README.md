# API Design Templates

REST (OpenAPI) and GraphQL schema templates.

## Files

| Template | Purpose |
|----------|---------|
| `openapi.yaml` | OpenAPI 3.1 REST API specification |
| `schema.graphql` | GraphQL SDL schema |

## Usage

### OpenAPI (REST)

```bash
cp templates/openapi.yaml ./api-spec.yaml

# Validate
npx @redocly/cli lint api-spec.yaml

# Generate docs
npx @redocly/cli build-docs api-spec.yaml

# Generate client
npx openapi-typescript api-spec.yaml -o src/types/api.ts
```

### GraphQL

```bash
cp templates/schema.graphql ./src/schema.graphql

# With Apollo Server
npm install @apollo/server graphql

# Generate types (graphql-codegen)
npx graphql-codegen
```

## OpenAPI Features

### Included Patterns

- JWT Bearer authentication
- Pagination (page/limit)
- Reusable schemas and responses
- Error handling structure
- Multiple server environments

### Customization

Add new endpoints:

```yaml
paths:
  /products:
    get:
      summary: List products
      tags: [Products]
      responses:
        '200':
          description: Success
```

## GraphQL Features

### Included Patterns

- Connection-based pagination
- Input types for mutations
- Custom directives (@auth, @rateLimit)
- Subscriptions support
- Enum types

### Customization

Add new types:

```graphql
type Product {
  id: UUID!
  name: String!
  price: Float!
}

extend type Query {
  products(pagination: PaginationInput): ProductConnection!
}
```

## Tools Comparison

| Aspect | REST (OpenAPI) | GraphQL |
|--------|----------------|---------|
| Best for | CRUD, public APIs | Complex queries, real-time |
| Caching | HTTP caching | Custom/Apollo |
| Versioning | URL or header | Schema evolution |
| Documentation | Swagger UI, Redoc | GraphiQL, Apollo Studio |

## Code Generation

### TypeScript (REST)

```bash
npm install openapi-typescript
npx openapi-typescript api-spec.yaml -o types/api.ts
```

### TypeScript (GraphQL)

```bash
npm install @graphql-codegen/cli
npx graphql-codegen init
```
