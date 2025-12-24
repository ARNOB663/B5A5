# Vercel Environment Variables

Use these environment variables in your Vercel project settings:

## Required Variables

```
MONGODB_URI=mongodb+srv://mongodb:a01881792704@cluster0.axaw2bo.mongodb.net/ride-booking?retryWrites=true&w=majority
```

**Note:** Add your database name after the hostname (e.g., `/ride-booking`)

---

```
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-change-this-in-production
```

**Note:** Generate a strong random string. You can use:
- Online generator: https://randomkeygen.com/
- Command: `openssl rand -base64 32`
- Or any secure random string generator

**⚠️ IMPORTANT:** Never use simple passwords like "1234" in production!

---

```
NODE_ENV=production
```

---

## CORS Configuration

### Option 1: Specific Frontend Domain (Recommended)
```
CORS_ORIGIN=https://your-actual-frontend-domain.com
```

### Option 2: Multiple Frontend Domains
```
CORS_ORIGIN=https://domain1.com,https://domain2.com,https://www.domain1.com
```

### Option 3: Allow All Origins (Development/Testing Only)
```
CORS_ORIGIN=*
```

**⚠️ WARNING:** Using `*` with `credentials: true` may cause CORS issues. For production, specify exact domains.

---

## Optional Variables (with defaults)

```
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## How to Set in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - **Key**: Variable name (e.g., `MONGODB_URI`)
   - **Value**: Variable value
   - **Environment**: Select `Production`, `Preview`, and/or `Development`
4. Click **Save**
5. Redeploy your application

---

## Security Notes

- ✅ Use strong, random JWT secrets
- ✅ Never commit `.env` files to git
- ✅ Use specific CORS origins in production
- ✅ Keep MongoDB credentials secure
- ✅ Rotate secrets periodically
