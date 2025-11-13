# Troubleshooting Guide

Common issues and their solutions.

## Build & Development Issues

### Error: "Cannot find module './XXXX.js'"

**Symptom:** Server error showing "Cannot find module" with a webpack chunk file

**Cause:** Stale Next.js build cache or webpack chunks

**Solution:**
```bash
# Delete .next folder and rebuild
Remove-Item -Recurse -Force .next
npm run build

# Or for development
Remove-Item -Recurse -Force .next
npm run dev
```

### Error: "Module not found" during build

**Symptom:** Build fails with module not found errors

**Solution:**
```bash
# Reinstall dependencies
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
npm run build
```

### Port 3000 already in use

**Symptom:** "Port 3000 is already in use"

**Solution:**
```bash
# Windows - Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use a different port
$env:PORT=3001; npm run dev
```

## Database Issues

### Cannot connect to MongoDB

**Symptom:** "MongooseError: Could not connect to any servers"

**Solutions:**
1. Check MONGODB_URI in .env.local
2. Verify MongoDB Atlas IP whitelist (add 0.0.0.0/0 for testing)
3. Check MongoDB Atlas cluster is running
4. Verify credentials are correct

```bash
# Test connection
node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('Connected!')).catch(err => console.error(err));"
```

### Database queries are slow

**Solutions:**
1. Check MongoDB Atlas cluster tier (free tier is limited)
2. Add indexes to frequently queried fields
3. Review query patterns in slow routes

## Authentication Issues

### JWT token invalid or expired

**Symptom:** "Invalid token" or "Token expired" errors

**Solutions:**
1. Clear browser localStorage
2. Login again
3. Check JWT_SECRET matches between sessions
4. Verify token expiration time in auth code

```javascript
// Clear localStorage in browser console
localStorage.clear();
location.reload();
```

### Cannot login with correct credentials

**Solutions:**
1. Check user exists in database
2. Verify password hashing is working
3. Check JWT_SECRET is set in environment
4. Review browser console for errors

## Deployment Issues (Netlify)

### Build fails on Netlify

**Solutions:**
1. Check build logs in Netlify dashboard
2. Verify all environment variables are set
3. Ensure Node version matches (18+)
4. Check package.json scripts are correct

### Environment variables not working

**Solutions:**
1. Verify variables are set in Netlify dashboard
2. Variable names must match exactly (case-sensitive)
3. Redeploy after adding variables
4. Check variables don't have extra spaces

### API routes return 404 on Netlify

**Solutions:**
1. Ensure @netlify/plugin-nextjs is in dependencies
2. Check netlify.toml configuration
3. Verify Next.js version compatibility
4. Redeploy

## Chatbot Issues

### Chatbot doesn't load in iframe

**Symptom:** "Refused to display in a frame" error

**Solutions:**
1. Check netlify.toml has correct headers for /chatbot
2. Verify next.config.js has iframe headers
3. Clear browser cache
4. Check CORS settings

```toml
# netlify.toml
[[headers]]
  for = "/chatbot"
  [headers.values]
    X-Frame-Options = "ALLOWALL"
    Content-Security-Policy = "frame-ancestors 'self' *"
```

### Chatbot responses not working

**Solutions:**
1. Check knowledge base has content (FAQs, Articles)
2. Verify API routes are working
3. Check browser console for errors
4. Test chatbot API endpoints directly

## Performance Issues

### Slow page loads

**Solutions:**
1. Check database query performance
2. Add loading states to components
3. Implement pagination for large datasets
4. Optimize images and assets
5. Use Next.js Image component

### High memory usage

**Solutions:**
1. Check for memory leaks in useEffect hooks
2. Properly cleanup event listeners
3. Limit data fetched in API routes
4. Use pagination instead of loading all data

## Common Development Errors

### "Hydration failed" error

**Symptom:** React hydration mismatch errors

**Solutions:**
1. Ensure server and client render the same content
2. Don't use browser-only APIs during SSR
3. Use useEffect for client-only code
4. Check for date/time formatting differences

### TypeScript errors

**Solutions:**
```bash
# Check for errors
npm run build

# Fix auto-fixable issues
npm run lint:fix

# Check types
npx tsc --noEmit
```

### ESLint configuration errors

**Symptom:** "Invalid Options" or "Unknown options" errors

**Solution:**
The project uses Next.js 13 with newer ESLint config. If you see ESLint errors, they're non-critical for build.

```bash
# Build still works
npm run build

# Skip linting if needed
npm run build -- --no-lint
```

## Testing Issues

### Tests fail to run

**Solutions:**
```bash
# Clear Jest cache
npm test -- --clearCache

# Reinstall dependencies
Remove-Item -Recurse -Force node_modules
npm install
npm test
```

## Quick Fixes

### Reset everything

When in doubt, reset everything:

```bash
# Stop all processes
# Close all terminals

# Clean everything
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json

# Reinstall
npm install

# Rebuild
npm run build

# Run
npm run dev
```

### Clear browser cache

1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"
4. Or use Ctrl+Shift+Delete

### Check logs

**Development:**
- Browser console (F12)
- Terminal where npm run dev is running

**Production (Netlify):**
- Netlify Dashboard → Functions → View logs
- Netlify Dashboard → Deploys → Deploy log

## Getting Help

### Before asking for help:

1. Check this troubleshooting guide
2. Check browser console for errors
3. Check terminal/server logs
4. Try the "Reset everything" steps above
5. Search error message online

### Information to provide:

- Exact error message
- Steps to reproduce
- Environment (dev/production)
- Browser and version
- Node version: `node --version`
- npm version: `npm --version`

### Useful commands:

```bash
# Check versions
node --version
npm --version

# Check environment variables (without values)
Get-ChildItem Env: | Where-Object { $_.Name -like "*MONGO*" -or $_.Name -like "*JWT*" }

# Test build
npm run build

# Check for TypeScript errors
npx tsc --noEmit

# Check dependencies
npm list --depth=0
```

## Known Issues

See KNOWN_ISSUES.md for documented limitations and technical debt.

---

**Last Updated:** November 13, 2025  
**Maintainer:** Update this as new issues are discovered and resolved
