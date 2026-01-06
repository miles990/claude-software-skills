# API Tools Templates

Scripts and templates for API testing and development.

## Files

| File | Purpose |
|------|---------|
| `../scripts/curl-examples.sh` | cURL command examples |
| `postman-collection.json` | Postman collection template |

## Usage

### cURL Examples

```bash
# Set environment variables
export API_BASE_URL="http://localhost:3000/api"
export API_TOKEN="your-jwt-token"

# Make executable
chmod +x scripts/curl-examples.sh

# Run examples (copy and modify as needed)
source scripts/curl-examples.sh
```

**Common patterns:**
```bash
# GET with auth
curl -s "$BASE_URL/users" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  | jq

# POST JSON
curl -s -X POST "$BASE_URL/users" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{"name": "John"}' \
  | jq

# Upload file
curl -s -X POST "$BASE_URL/upload" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -F "file=@./doc.pdf" \
  | jq
```

### Postman Collection

1. Import `postman-collection.json` into Postman
2. Update collection variables:
   - `baseUrl`: Your API base URL
   - `authToken`: Will be set automatically after login
3. Run "Login" request first to set auth token
4. Run other requests

**Collection features:**
- Auto-saves auth token from login response
- Test scripts for response validation
- Path variables for resource IDs
- Query parameters for pagination

## Environment Setup

### Using Postman Environments

Create environment with variables:
```json
{
  "baseUrl": "http://localhost:3000/api",
  "authToken": "",
  "refreshToken": ""
}
```

### Using cURL with .env

```bash
# .env.api
API_BASE_URL=http://localhost:3000/api
API_TOKEN=your-token

# Load and use
source .env.api
curl "$API_BASE_URL/users" -H "Authorization: Bearer $API_TOKEN"
```

## Tips

### jq Filtering
```bash
# Get specific field
curl -s "$BASE_URL/users" | jq '.[].name'

# Filter results
curl -s "$BASE_URL/users" | jq '.[] | select(.role == "admin")'

# Format output
curl -s "$BASE_URL/users" | jq -r '.[] | "\(.id): \(.name)"'
```

### Timing Requests
```bash
curl -s -w "\nTime: %{time_total}s\n" "$BASE_URL/users" -o /dev/null
```

### Saving Responses
```bash
curl -s "$BASE_URL/users" | tee response.json | jq
```
