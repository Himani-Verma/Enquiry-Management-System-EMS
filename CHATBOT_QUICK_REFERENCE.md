# Chatbot Iframe - Quick Reference Card

## 🚀 Quick Start (3 Steps)

### 1. Test Locally
```bash
cd cms
npm run dev
# Visit: http://localhost:3000/test-chatbot.html
```

### 2. Deploy
```bash
npm run build
# Deploy to Vercel/Netlify/Your server
```

### 3. Add to WordPress
- Install WPCode plugin
- Copy code from `public/wordpress-chatbot-snippet.txt`
- Update iframe URL to your domain
- Activate snippet

---

## 📁 Key Files

| File | What It Does |
|------|--------------|
| `app/chatbot/page.tsx` | Chatbot page for iframe |
| `next.config.js` | Iframe security headers |
| `public/wordpress-chatbot-snippet.txt` | WordPress integration code |
| `public/test-chatbot.html` | Local testing page |

---

## 🔗 Important URLs

| URL | Purpose |
|-----|---------|
| `/chatbot` | Standalone chatbot page |
| `/test-chatbot.html` | Test the integration |
| `/dashboard` | Admin dashboard |

---

## 🎨 Customization Cheat Sheet

### Button Position
```css
/* Bottom-right (default) */
bottom: 24px; right: 24px;

/* Bottom-left */
bottom: 24px; left: 24px;

/* Top-right */
top: 24px; right: 24px;
```

### Chatbot Size
```css
/* Default */
width: 400px; height: 600px;

/* Larger */
width: 500px; height: 700px;

/* Smaller */
width: 350px; height: 500px;
```

### Button Color
```css
/* Default blue */
background: linear-gradient(135deg, #2d4891 0%, #1e3a8a 100%);

/* Green */
background: linear-gradient(135deg, #10b981 0%, #059669 100%);

/* Purple */
background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
```

---

## 🐛 Troubleshooting Quick Fixes

### Chatbot doesn't load
```javascript
// Check iframe URL is correct
src="https://YOUR-ACTUAL-DOMAIN.com/chatbot"

// Not:
src="https://YOUR-DOMAIN.com/chatbot"  ❌
```

### Button doesn't appear
```css
/* Add !important if theme overrides */
#envirocare-chatbot-button {
  display: flex !important;
  z-index: 9998 !important;
}
```

### CORS errors
```javascript
// In next.config.js, ensure headers exist:
async headers() {
  return [{
    source: '/chatbot',
    headers: [
      { key: 'X-Frame-Options', value: 'ALLOWALL' },
      { key: 'Content-Security-Policy', value: "frame-ancestors 'self' *" }
    ]
  }];
}
```

---

## 📊 Testing Checklist

Quick test before going live:

- [ ] Visit `/chatbot` directly - does it load?
- [ ] Visit `/test-chatbot.html` - does button appear?
- [ ] Click button - does chatbot open?
- [ ] Fill form - can you register?
- [ ] Send message - does it work?
- [ ] Reload page - does history persist?
- [ ] Test on mobile - is it responsive?
- [ ] Check console - any errors?

---

## 🔧 Common Commands

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm start

# Deploy to Vercel
vercel --prod

# Deploy to Netlify
netlify deploy --prod

# Check for errors
npm run lint
```

---

## 📞 Support Quick Links

| Issue | Check |
|-------|-------|
| Chatbot not loading | Browser console (F12) |
| Button not visible | Inspect element |
| API errors | Network tab in DevTools |
| WordPress issues | WordPress error logs |
| Database issues | MongoDB logs |

---

## 🎯 WordPress Integration Options

### Option 1: WPCode Plugin ⭐ (Recommended)
- Easiest to manage
- Can enable/disable easily
- Version control
- No theme editing

### Option 2: Theme Editor
- Direct integration
- Survives plugin updates
- Requires theme access

### Option 3: Custom HTML Widget
- No code editing
- Widget-based
- Limited control

---

## 🔐 Security Checklist

- [ ] HTTPS enabled on both sites
- [ ] Iframe headers configured
- [ ] Input validation enabled
- [ ] API endpoints secured
- [ ] MongoDB access restricted
- [ ] Environment variables set
- [ ] CORS properly configured

---

## 📈 Performance Tips

1. **Lazy load iframe** - Only load when button clicked ✅ (Already done)
2. **Cache chat history** - Use localStorage ✅ (Already done)
3. **Optimize images** - Use Next.js Image component
4. **Enable compression** - Gzip/Brotli on server
5. **CDN for static assets** - Use Vercel/Netlify CDN
6. **Database indexes** - Index frequently queried fields

---

## 🎨 Brand Customization

### Logo
Replace in chatbot header:
```jsx
<Image src="/envirocare-logo.png" alt="Your Brand" />
```

### Colors
Update in CSS:
```css
/* Primary color */
#2d4891 → Your brand color

/* Gradient */
linear-gradient(135deg, #2d4891 0%, #1e3a8a 100%)
```

### Text
Update in `ChatbotWidget.tsx`:
```javascript
// Welcome message
"Welcome to Envirocare Labs!"
→ "Welcome to Your Company!"

// Bot name
"I'm Eva"
→ "I'm Your Bot Name"
```

---

## 📱 Mobile Optimization

Already included:
- Responsive breakpoints
- Touch-friendly buttons
- Adaptive sizing
- Mobile-first CSS

Test on:
- iPhone (Safari)
- Android (Chrome)
- iPad (Safari)
- Android Tablet (Chrome)

---

## 🔄 Update Process

### To update chatbot:
1. Make changes in `cms/components/ChatbotWidget.tsx`
2. Test locally: `npm run dev`
3. Build: `npm run build`
4. Deploy to production
5. Clear browser cache
6. Test on WordPress site

### To update WordPress snippet:
1. Edit in WPCode
2. Save changes
3. Clear WordPress cache
4. Test on site

---

## 💡 Pro Tips

1. **Test in incognito** - Avoids cache issues
2. **Use browser DevTools** - Essential for debugging
3. **Monitor console** - Catch errors early
4. **Check mobile first** - Most users are mobile
5. **Keep it simple** - Don't over-customize
6. **Document changes** - Future you will thank you
7. **Backup before changes** - Always have a rollback plan
8. **Test with real data** - Use actual user scenarios

---

## 📚 Documentation Links

- **Full Setup Guide:** `CHATBOT_IFRAME_SETUP.md`
- **Deployment Steps:** `CHATBOT_DEPLOYMENT_STEPS.md`
- **Architecture:** `CHATBOT_ARCHITECTURE.md`
- **WordPress Snippet:** `public/wordpress-chatbot-snippet.txt`

---

## 🎉 Success Indicators

You know it's working when:
- ✅ Button appears on WordPress site
- ✅ Clicking opens chatbot smoothly
- ✅ Can register and chat
- ✅ Messages persist after reload
- ✅ Works on mobile devices
- ✅ No console errors
- ✅ Fast load times
- ✅ Users are engaging

---

## 🆘 Emergency Contacts

If something breaks:

1. **Disable in WordPress:**
   - WPCode → Deactivate snippet
   - Or remove from theme

2. **Check status:**
   - Visit `/chatbot` directly
   - Check API endpoints
   - Review error logs

3. **Rollback:**
   - Revert to previous version
   - Restore from backup
   - Contact support

---

## 📝 Quick Notes Space

Use this space for your specific configuration:

**Your Production URL:**
```
https://___________________________
```

**Your WordPress URL:**
```
https://___________________________
```

**Deployment Date:**
```
___________________________
```

**Custom Changes Made:**
```
1. ___________________________
2. ___________________________
3. ___________________________
```

**Known Issues:**
```
1. ___________________________
2. ___________________________
```

---

**Last Updated:** [Date]
**Version:** 1.0
**Status:** ✅ Ready for Production
