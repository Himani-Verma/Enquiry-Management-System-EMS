# 🚀 Netlify Deployment Guide for Envirocare EMS

## ⚠️ Important Changes Needed Before Deployment

### 1. Fix netlify.toml Configuration

Your current `netlify.toml` has incorrect settings for Next.js. Update it with the correct configuration.

### 2. Environment Variables Setup

You need to add these environment variables in Netlify dashboard.

---

## 📋 Step-by-Step Deployment

### Step 1: Update netlify.toml

Replace your current `netlify.toml` with this corrected version:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[plugins]]
  package = "@netlify/plugin-nextjs"

# Allow chatbot iframe embedding
[[headers]]
  for = "/chatbot"
  [headers.values]
    X-Frame-Options = "ALLOWALL"
    Content-Security-Policy = "frame-ancestors 'self' *"

# Security headers for other pages
[[headers]]
  for = "/*"
  [headers.values]
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"

# Cache static assets
[[headers]]
  for = "/_next/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

# API routes should not be cached
[[headers]]
  for = "/api/*"
  [headers.values]
    Cache-Control = "no-cache, no-store, must-revalidate"
```

### Step 2: Set Environment Variables in Netlify

Go to your Netlify dashboard:
**Site settings → Environment variables → Add a variable**

Add these variables:

#### Required Variables:

| Variable Name | Value | Notes |
|--------------|-------|-------|
| `MONGODB_URI` | `mongodb+srv://himani:ems@ems.z3zxn2h.mongodb.net/?retryWrites=true&w=majority&appName=EMS` | Your MongoDB connection string |
| `JWT_SECRET` | `your-super-secret-jwt-key-change-this-in-production` | ⚠️ Change this to a strong random string! |
| `NODE_ENV` | `production` | Set to production |
| `NEXT_PUBLIC_API_BASE` | `https://YOUR-SITE-NAME.netlify.app` | Your Netlify URL |

#### How to Generate a Strong JWT_SECRET:

Run this in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Or use this online: https://generate-secret.vercel.app/64

### Step 3: Update Your Deployment URL

After deployment, you'll get a URL like:
```
https://enquiry-management-system-ems.netlify.app
```

Update `NEXT_PUBLIC_API_BASE` environment variable with this URL.

### Step 4: Build Settings in Netlify

In the Netlify dashboard, verify these settings:

**Build settings:**
- **Base directory:** (leave empty)
- **Build command:** `npm run build`
- **Publish directory:** `.next`
- **Functions directory:** (leave empty - handled by plugin)

### Step 5: Deploy

1. **Connect your GitHub repository:**
   - Netlify Dashboard → Add new site → Import an existing project
   - Choose GitHub
   - Select: `Himani-Verma/Enquiry-Management-System-`
   - Configure settings as above
   - Click "Deploy site"

2. **Or deploy via Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify init
   netlify deploy --prod
   ```

---

## 🔒 Security Recommendations

### 1. Change JWT_SECRET Immediately

Your current JWT secret is the default. Generate a new one:

```bash
# Generate a secure random string
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Add this to Netlify environment variables.

### 2. Secure MongoDB Connection

Consider these security improvements:

1. **Create a dedicated database user** for production
2. **Restrict IP addresses** in MongoDB Atlas (add Netlify IPs)
3. **Use environment-specific databases:**
   - Development: `ems-dev`
   - Production: `ems-prod`

Update your MongoDB URI:
```
mongodb+srv://production-user:STRONG_PASSWORD@ems.z3zxn2h.mongodb.net/ems-prod?retryWrites=true&w=majority
```

### 3. Environment Variables Best Practices

Never commit these to Git:
- ✅ `.env.local` is in `.gitignore`
- ✅ Use Netlify environment variables for production
- ❌ Don't hardcode secrets in code

---

## 🧪 Testing Your Deployment

### 1. Test the Main App
Visit: `https://your-site.netlify.app`

Check:
- [ ] Login page loads
- [ ] Can log in with credentials
- [ ] Dashboard loads correctly
- [ ] API calls work

### 2. Test the Chatbot Page
Visit: `https://your-site.netlify.app/chatbot`

Check:
- [ ] Chatbot interface loads
- [ ] Can register as visitor
- [ ] Can send messages
- [ ] Messages are saved

### 3. Test the Chatbot Embed
Visit: `https://your-site.netlify.app/test-chatbot.html`

Check:
- [ ] Chat button appears
- [ ] Clicking opens chatbot
- [ ] Chatbot works in iframe

---

## 🐛 Common Deployment Issues

### Issue 1: Build Fails

**Error:** `Module not found` or `Cannot find module`

**Fix:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Issue 2: Environment Variables Not Working

**Error:** `Cannot connect to database` or `JWT_SECRET is not defined`

**Fix:**
1. Check environment variables are set in Netlify
2. Variable names must match exactly (case-sensitive)
3. Redeploy after adding variables

### Issue 3: API Routes Return 404

**Error:** API calls fail with 404

**Fix:**
1. Ensure `@netlify/plugin-nextjs` is in dependencies
2. Check `netlify.toml` has the plugin configured
3. Redeploy

### Issue 4: Chatbot Iframe Doesn't Load

**Error:** `Refused to display in a frame`

**Fix:**
1. Check `netlify.toml` has the chatbot headers
2. Verify `next.config.js` has iframe headers
3. Clear browser cache and test

---

## 📊 Monitoring Your Deployment

### Netlify Dashboard

Monitor:
- **Deploy logs:** Check for build errors
- **Function logs:** Monitor API calls
- **Analytics:** Track visitor usage
- **Bandwidth:** Monitor data usage

### MongoDB Atlas

Monitor:
- **Connections:** Check active connections
- **Performance:** Query performance
- **Alerts:** Set up alerts for issues

---

## 🔄 Continuous Deployment

Once set up, Netlify will automatically:

1. **Watch your GitHub repository**
2. **Build on every push to main branch**
3. **Deploy if build succeeds**
4. **Rollback if deployment fails**

### Branch Previews

Netlify creates preview URLs for pull requests:
```
https://deploy-preview-123--your-site.netlify.app
```

---

## 📝 Post-Deployment Checklist

After successful deployment:

- [ ] Update `NEXT_PUBLIC_API_BASE` with production URL
- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Test all major features
- [ ] Test chatbot embed on WordPress
- [ ] Set up custom domain (optional)
- [ ] Configure MongoDB IP whitelist
- [ ] Set up monitoring/alerts
- [ ] Update WordPress chatbot snippet with production URL

---

## 🌐 Custom Domain Setup (Optional)

### Add Custom Domain in Netlify:

1. **Netlify Dashboard → Domain settings**
2. **Add custom domain:** `cms.envirocarelabs.com`
3. **Update DNS records** (provided by Netlify)
4. **Enable HTTPS** (automatic with Let's Encrypt)

### Update Environment Variables:

After adding custom domain, update:
```
NEXT_PUBLIC_API_BASE=https://cms.envirocarelabs.com
```

---

## 🎯 WordPress Integration After Deployment

Once deployed, update your WordPress chatbot snippet:

```html
<iframe 
  id="envirocare-chatbot-iframe" 
  src="https://YOUR-NETLIFY-SITE.netlify.app/chatbot"
  title="Envirocare Labs Chatbot"
  allow="clipboard-write"
></iframe>
```

Replace with your actual Netlify URL.

---

## 📞 Support Resources

- **Netlify Docs:** https://docs.netlify.com/
- **Next.js on Netlify:** https://docs.netlify.com/frameworks/next-js/
- **MongoDB Atlas:** https://docs.atlas.mongodb.com/

---

## ✅ Quick Deployment Checklist

Before clicking "Deploy":

- [ ] Updated `netlify.toml` with correct configuration
- [ ] Added all environment variables in Netlify
- [ ] Changed `JWT_SECRET` to a strong random string
- [ ] Verified MongoDB connection string
- [ ] Pushed latest code to GitHub
- [ ] Reviewed build settings in Netlify

After deployment:

- [ ] Tested main app functionality
- [ ] Tested chatbot page
- [ ] Tested API endpoints
- [ ] Updated WordPress snippet with production URL
- [ ] Verified chatbot works on WordPress

---

**Ready to deploy!** 🚀

Follow the steps above and your app will be live on Netlify.
