# ✅ Netlify Deployment Checklist

## Before Deployment

### 1. Code Changes
- [x] Updated `netlify.toml` with correct configuration
- [ ] Committed and pushed all changes to GitHub

### 2. Environment Variables to Add in Netlify

Go to: **Netlify Dashboard → Site settings → Environment variables**

Add these 4 variables:

| Variable | Value | Status |
|----------|-------|--------|
| `MONGODB_URI` | `mongodb+srv://himani:ems@ems.z3zxn2h.mongodb.net/?retryWrites=true&w=majority&appName=EMS` | ⬜ |
| `JWT_SECRET` | Generate new strong secret (see below) | ⬜ |
| `NODE_ENV` | `production` | ⬜ |
| `NEXT_PUBLIC_API_BASE` | Your Netlify URL (update after first deploy) | ⬜ |

#### Generate JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Build Settings in Netlify

Verify these settings in Netlify:

- [ ] **Base directory:** (empty)
- [ ] **Build command:** `npm run build`
- [ ] **Publish directory:** `.next`
- [ ] **Node version:** 18

---

## Deployment Steps

### Option 1: Deploy via Netlify Dashboard (Recommended)

1. [ ] Go to https://app.netlify.com/
2. [ ] Click "Add new site" → "Import an existing project"
3. [ ] Choose "GitHub"
4. [ ] Select repository: `Himani-Verma/Enquiry-Management-System-`
5. [ ] Configure build settings (see above)
6. [ ] Add environment variables
7. [ ] Click "Deploy site"
8. [ ] Wait for build to complete (5-10 minutes)

### Option 2: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize site
netlify init

# Deploy to production
netlify deploy --prod
```

---

## After First Deployment

### 1. Get Your Site URL
Your site will be at: `https://[random-name].netlify.app`

Example: `https://enquiry-management-system-ems.netlify.app`

### 2. Update Environment Variable
- [ ] Go to Netlify → Site settings → Environment variables
- [ ] Update `NEXT_PUBLIC_API_BASE` with your actual URL
- [ ] Trigger a new deploy (Deploys → Trigger deploy → Deploy site)

### 3. Test Your Deployment

#### Test Main App:
- [ ] Visit: `https://your-site.netlify.app`
- [ ] Login page loads
- [ ] Can log in successfully
- [ ] Dashboard displays correctly
- [ ] API calls work

#### Test Chatbot:
- [ ] Visit: `https://your-site.netlify.app/chatbot`
- [ ] Chatbot interface loads
- [ ] Can register as visitor
- [ ] Can send messages
- [ ] Messages persist

#### Test Chatbot Embed:
- [ ] Visit: `https://your-site.netlify.app/test-chatbot.html`
- [ ] Chat button appears
- [ ] Clicking opens chatbot
- [ ] Chatbot works in iframe

---

## WordPress Integration

### Update WordPress Snippet

In your WordPress chatbot snippet, update the iframe URL:

```html
<iframe 
  id="envirocare-chatbot-iframe" 
  src="https://YOUR-ACTUAL-NETLIFY-URL.netlify.app/chatbot"
  title="Envirocare Labs Chatbot"
  allow="clipboard-write"
></iframe>
```

Replace `YOUR-ACTUAL-NETLIFY-URL` with your real Netlify URL.

---

## Security Checklist

- [ ] Changed `JWT_SECRET` from default value
- [ ] Using HTTPS (automatic with Netlify)
- [ ] MongoDB connection string is secure
- [ ] Environment variables are not in code
- [ ] `.env.local` is in `.gitignore`

---

## Optional: Custom Domain

If you want to use a custom domain like `cms.envirocarelabs.com`:

1. [ ] Netlify Dashboard → Domain settings
2. [ ] Add custom domain
3. [ ] Update DNS records (Netlify provides instructions)
4. [ ] Wait for DNS propagation (up to 24 hours)
5. [ ] Update `NEXT_PUBLIC_API_BASE` environment variable
6. [ ] Redeploy

---

## Troubleshooting

### Build Fails?
- Check build logs in Netlify dashboard
- Verify all dependencies are in `package.json`
- Try building locally: `npm run build`

### Environment Variables Not Working?
- Check variable names match exactly (case-sensitive)
- Redeploy after adding variables
- Check Netlify function logs

### API Routes Return 404?
- Verify `@netlify/plugin-nextjs` is in dependencies
- Check `netlify.toml` configuration
- Redeploy

### Chatbot Iframe Blocked?
- Check browser console for errors
- Verify headers in `netlify.toml`
- Clear browser cache

---

## Quick Commands

```bash
# Push changes to GitHub
git add .
git commit -m "Prepare for Netlify deployment"
git push origin main

# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Test build locally
npm run build
npm start

# Deploy via CLI
netlify deploy --prod
```

---

## Support

- **Netlify Docs:** https://docs.netlify.com/
- **Deployment Guide:** See `NETLIFY_DEPLOYMENT_GUIDE.md`
- **Environment Variables:** See `.env.production.example`

---

## Status

- [ ] Pre-deployment setup complete
- [ ] Deployed to Netlify
- [ ] Environment variables configured
- [ ] Testing complete
- [ ] WordPress integration updated
- [ ] Production ready ✅

---

**Current Step:** _______________

**Notes:** _______________
