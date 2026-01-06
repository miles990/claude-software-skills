# Security Practices Templates

Ready-to-use security configuration templates for web applications.

## Files

| Template | Purpose |
|----------|---------|
| `helmet-config.js` | Express.js security headers (Helmet.js) |
| `csp-policy.json` | Content Security Policy configurations |
| `.env.example` | Environment variables template |

## Usage

### Helmet.js (Express Security Headers)

```bash
cp templates/helmet-config.js ./src/config/helmet-config.js

# Install
npm install helmet

# Use in Express
import { helmetConfig } from './config/helmet-config.js';
app.use(helmetConfig);
```

### Content Security Policy

Reference `csp-policy.json` for CSP directive examples:

- **strict**: High-security applications
- **moderate**: Typical web apps
- **spa**: Single Page Applications

### Environment Variables

```bash
cp templates/.env.example ./.env

# Add .env to .gitignore
echo ".env" >> .gitignore

# Generate secrets
openssl rand -base64 32  # For JWT_SECRET
openssl rand -hex 32     # For SESSION_SECRET
```

## Security Checklist

### HTTP Headers (via Helmet)

- [x] Content-Security-Policy
- [x] Strict-Transport-Security (HSTS)
- [x] X-Content-Type-Options
- [x] X-Frame-Options
- [x] X-XSS-Protection
- [x] Referrer-Policy

### Secrets Management

- [ ] Never commit `.env` files
- [ ] Use different secrets per environment
- [ ] Rotate secrets regularly
- [ ] Use secret managers in production (AWS Secrets Manager, Vault)

### Additional Measures

- [ ] Rate limiting
- [ ] CORS configuration
- [ ] Input validation
- [ ] SQL injection prevention
- [ ] XSS prevention
