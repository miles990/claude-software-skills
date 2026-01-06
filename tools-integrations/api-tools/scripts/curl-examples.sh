#!/bin/bash
# ===========================================
# cURL API Examples Template
# Usage: Adapt these examples for your API testing
# ===========================================

# Configuration
BASE_URL="${API_BASE_URL:-http://localhost:3000/api}"
AUTH_TOKEN="${API_TOKEN:-your-token-here}"

# Common headers
HEADERS=(
  -H "Content-Type: application/json"
  -H "Authorization: Bearer $AUTH_TOKEN"
  -H "Accept: application/json"
)

# ===========================================
# GET Requests
# ===========================================

# Simple GET
curl -s "$BASE_URL/users" "${HEADERS[@]}" | jq

# GET with query parameters
curl -s "$BASE_URL/users?page=1&limit=10&sort=name" "${HEADERS[@]}" | jq

# GET single resource
curl -s "$BASE_URL/users/123" "${HEADERS[@]}" | jq

# GET with custom headers
curl -s "$BASE_URL/users" \
  "${HEADERS[@]}" \
  -H "X-Request-ID: $(uuidgen)" \
  | jq

# ===========================================
# POST Requests
# ===========================================

# Create resource (inline JSON)
curl -s -X POST "$BASE_URL/users" \
  "${HEADERS[@]}" \
  -d '{"name": "John Doe", "email": "john@example.com"}' \
  | jq

# Create resource (from file)
curl -s -X POST "$BASE_URL/users" \
  "${HEADERS[@]}" \
  -d @user.json \
  | jq

# Create with heredoc
curl -s -X POST "$BASE_URL/users" \
  "${HEADERS[@]}" \
  -d @- <<'EOF' | jq
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "role": "admin"
}
EOF

# ===========================================
# PUT/PATCH Requests
# ===========================================

# Full update (PUT)
curl -s -X PUT "$BASE_URL/users/123" \
  "${HEADERS[@]}" \
  -d '{"name": "John Updated", "email": "john.new@example.com"}' \
  | jq

# Partial update (PATCH)
curl -s -X PATCH "$BASE_URL/users/123" \
  "${HEADERS[@]}" \
  -d '{"name": "John Patched"}' \
  | jq

# ===========================================
# DELETE Requests
# ===========================================

# Delete resource
curl -s -X DELETE "$BASE_URL/users/123" \
  "${HEADERS[@]}" \
  | jq

# Delete with confirmation body
curl -s -X DELETE "$BASE_URL/users/123" \
  "${HEADERS[@]}" \
  -d '{"confirm": true}' \
  | jq

# ===========================================
# File Upload
# ===========================================

# Single file upload
curl -s -X POST "$BASE_URL/upload" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -F "file=@./document.pdf" \
  -F "description=My document" \
  | jq

# Multiple files
curl -s -X POST "$BASE_URL/upload" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -F "files[]=@./file1.jpg" \
  -F "files[]=@./file2.jpg" \
  | jq

# ===========================================
# Authentication
# ===========================================

# Login (get token)
curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "secret"}' \
  | jq

# Refresh token
curl -s -X POST "$BASE_URL/auth/refresh" \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "your-refresh-token"}' \
  | jq

# OAuth2 token exchange
curl -s -X POST "$BASE_URL/oauth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  -d "client_id=$CLIENT_ID" \
  -d "client_secret=$CLIENT_SECRET" \
  | jq

# ===========================================
# Advanced Options
# ===========================================

# Verbose mode (see headers)
curl -v "$BASE_URL/users" "${HEADERS[@]}"

# Include response headers
curl -i "$BASE_URL/users" "${HEADERS[@]}"

# Only headers (HEAD request)
curl -I "$BASE_URL/users" "${HEADERS[@]}"

# Follow redirects
curl -L "$BASE_URL/redirect" "${HEADERS[@]}"

# Set timeout
curl -s --connect-timeout 5 --max-time 30 "$BASE_URL/slow-endpoint" "${HEADERS[@]}"

# Retry on failure
curl -s --retry 3 --retry-delay 1 "$BASE_URL/flaky-endpoint" "${HEADERS[@]}"

# ===========================================
# Testing & Debugging
# ===========================================

# Time the request
curl -s -w "\n\nTime: %{time_total}s\nStatus: %{http_code}\n" \
  -o /dev/null \
  "$BASE_URL/users" "${HEADERS[@]}"

# Save response to file
curl -s "$BASE_URL/users" "${HEADERS[@]}" -o response.json

# Test with different HTTP versions
curl -s --http2 "$BASE_URL/users" "${HEADERS[@]}" | jq

# Ignore SSL certificate (dev only!)
# curl -k "$BASE_URL/users" "${HEADERS[@]}"

# ===========================================
# Batch Operations
# ===========================================

# Loop through IDs
for id in 1 2 3 4 5; do
  echo "Fetching user $id..."
  curl -s "$BASE_URL/users/$id" "${HEADERS[@]}" | jq '.name'
done

# Parallel requests (requires GNU parallel)
# seq 1 10 | parallel -j 5 "curl -s '$BASE_URL/users/{}' ${HEADERS[*]} | jq '.name'"
