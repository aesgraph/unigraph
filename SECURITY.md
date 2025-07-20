# Security Guidelines

## 🚨 Critical Security Rules

### 1. **Never Hardcode Secrets**

- ❌ Never put API keys, passwords, or secrets directly in source code
- ✅ Always use environment variables with `VITE_` prefix
- ✅ Use `.env` files for local development (already in .gitignore)

### 2. **Environment Variables**

```bash
# ✅ Correct way
VITE_OPENAI_API_KEY=sk-...  # pragma: allowlist secret

# ❌ Wrong way - never do this
const apiKey = "sk-...";  # pragma: allowlist secret
```

### 3. **Build Security**

- The `dist/` directory is automatically ignored by git
- Run `npm run security-scan` before deploying
- The `prebuild` script automatically checks for secrets

### 4. **API Key Management**

- Use environment variables for all API keys
- Rotate keys regularly
- Use different keys for development and production
- Consider using a secrets management service for production

### 5. **Development Workflow**

```bash
# Before building
npm run security-scan

# Before committing
npm run lint
npm run security-scan:secrets

# When you suspect cache issues
npm run clean

# For a completely fresh start
npm run fresh-start

# For security-focused reset
npm run reset
```

### 6. **Emergency Response**

If you accidentally commit a secret:

1. Immediately revoke the exposed key
2. Generate a new key
3. Update all environment variables
4. Clear git history if necessary
5. Notify team members

## Security Scanning

The project includes automatic security scanning:

- **Pre-build scan**: `npm run prebuild`
- **Manual scan**: `npm run security-scan`
- **Secrets only**: `npm run security-scan:secrets`

## Clean Commands

When you encounter issues with cached builds or suspect security problems:

- **`npm run clean`** - Clear caches and build artifacts
- **`npm run clean:cache`** - Clear Vite cache only
- **`npm run clean:build`** - Clear build artifacts only
- **`npm run clean:modules`** - Reinstall node modules
- **`npm run clean:all`** - Complete cleanup
- **`npm run fresh-start`** - Clean everything and start dev server
- **`npm run reset`** - Clean, security scan, then start dev server

## Environment Variables

Required environment variables:

- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_OPENAI_API_KEY` - OpenAI API key (optional)

Optional:

- `VITE_LIVE_CHAT_URL` - Custom chat endpoint URL
