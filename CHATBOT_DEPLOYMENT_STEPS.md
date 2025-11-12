# Chatbot Iframe Deployment - Quick Start Guide

## 🎯 What You Need to Do

### 1️⃣ Test Locally (5 minutes)

```bash
cd cms
npm run dev

```

Then visit:
- **Chatbot page:** http://localhost:3000/chatbot
- **Test page:** http://localhost:3000/test-chatbot.html

✅ Verify the chatbot loads and works correctly

---

### 2️⃣ Deploy to Production (10 minutes)

#### If using Vercel:
```bash
cd cms
vercel --prod
```

#### If using Netlify:
```bash
cd cms
npm run build
netlify deploy --prod
```

#### If using your own server:
```bash
cd cms
npm run build
npm start
```

✅ Note your production URL (e.g., `https://nablscope.envirocarelabs.com`)

---

### 3️⃣ Add to WordPress (5 minutes)

#### Option A: Using WPCode Plugin (Easiest)

1. **Install WPCode Plugin**
   - Go to WordPress Admin → Plugins → Add New
   - Search for "WPCode"
   - Install and activate

2. **Add the Snippet**
   - Go to Code Snippets → Add Snippet
   - Choose "Add Your Custom Code (New Snippet)"
   - Title: "Envirocare Chatbot Widget"
   - Code Type: "HTML Snippet"

3. **Copy the Code**
   - Open `cms/public/wordpress-chatbot-snippet.txt`
   - Copy all the code
   - Paste into WPCode editor

4. **Update the URL**
   - Find this line in the code:
     ```html
     src="https://YOUR-DOMAIN.com/chatbot"
     ```
   - Replace with your actual URL:
     ```html
     src="https://nablscope.envirocarelabs.com/chatbot"
     ```

5. **Configure Settings**
   - Location: "Site Wide Footer"
   - Device: "All Devices"
   - Status: Active

6. **Save and Test**
   - Click "Save Snippet"
   - Visit your WordPress site
   - Look for the blue chat button in bottom-right corner

#### Option B: Manual Theme Integration

1. Go to Appearance → Theme File Editor
2. Select `footer.php`
3. Paste the code from `wordpress-chatbot-snippet.txt` before `</body>`
4. Update the iframe URL
5. Click "Update File"

---

### 4️⃣ Verify Everything Works

Visit your WordPress site and test:

- [ ] Chat button appears in bottom-right corner
- [ ] Clicking button opens the chatbot
- [ ] Can register as a new visitor
- [ ] Can send and receive messages
- [ ] Chat history persists after page reload
- [ ] Works on mobile devices
- [ ] Click outside closes the chatbot
- [ ] No console errors in browser

---

## 📁 Files Created

| File | Purpose |
|------|---------|
| `cms/app/chatbot/page.tsx` | Standalone chatbot page for iframe |
| `cms/next.config.js` | Updated with iframe security headers |
| `cms/public/chatbot-embed.html` | Complete standalone HTML version |
| `cms/public/wordpress-chatbot-snippet.txt` | WordPress integration code |
| `cms/public/test-chatbot.html` | Local testing page |
| `cms/CHATBOT_IFRAME_SETUP.md` | Detailed documentation |
| `cms/CHATBOT_DEPLOYMENT_STEPS.md` | This quick start guide |

---

## 🔧 Customization Options

### Change Button Position

In the WordPress snippet CSS, modify:
```css
#envirocare-chatbot-button {
  bottom: 24px;  /* Distance from bottom */
  right: 24px;   /* Distance from right */
}
```

For left side:
```css
#envirocare-chatbot-button {
  bottom: 24px;
  left: 24px;    /* Change right to left */
}
```

### Change Chatbot Size

```css
#envirocare-chatbot-container {
  width: 400px;   /* Make wider/narrower */
  height: 600px;  /* Make taller/shorter */
}
```

### Change Button Color

```css
#envirocare-chatbot-button {
  background: linear-gradient(135deg, #2d4891 0%, #1e3a8a 100%);
  /* Change to your brand colors */
}
```

---

## 🐛 Troubleshooting

### Problem: Chatbot doesn't load in iframe

**Check:**
1. Is the chatbot page accessible? Visit `https://your-domain.com/chatbot` directly
2. Is the iframe URL correct in WordPress snippet?
3. Check browser console for errors (F12)
4. Verify `next.config.js` has the iframe headers

**Solution:**
```javascript
// In next.config.js, ensure this exists:
async headers() {
  return [
    {
      source: '/chatbot',
      headers: [
        { key: 'X-Frame-Options', value: 'ALLOWALL' },
        { key: 'Content-Security-Policy', value: "frame-ancestors 'self' *" },
      ],
    },
  ];
}
```

### Problem: Button doesn't appear

**Check:**
1. Is the WPCode snippet activated?
2. Check browser console for JavaScript errors
3. Inspect element to see if button exists but is hidden

**Solution:**
- Add `!important` to CSS rules if theme is overriding
- Check z-index isn't being overridden
- Try different insertion location (header vs footer)

### Problem: CORS errors

**Check:**
1. Browser console shows CORS error
2. API calls failing from iframe

**Solution:**
- Ensure your Next.js API routes allow cross-origin requests
- Add CORS headers to API routes if needed
- Check that cookies/localStorage work in iframe context

---

## 📞 Support Checklist

Before asking for help, please check:

1. [ ] Chatbot page loads at `/chatbot` URL
2. [ ] No errors in browser console (F12)
3. [ ] Iframe URL is correct in WordPress snippet
4. [ ] WPCode snippet is activated (if using WPCode)
5. [ ] Tested in incognito/private browsing mode
6. [ ] Tested on different browsers
7. [ ] Checked WordPress error logs
8. [ ] Verified API endpoints are accessible

---

## 🚀 Production Checklist

Before going live:

- [ ] Test chatbot on staging environment
- [ ] Verify all API endpoints work
- [ ] Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test on mobile devices (iOS and Android)
- [ ] Check page load performance
- [ ] Verify analytics tracking (if implemented)
- [ ] Test with real user data
- [ ] Backup WordPress site before adding snippet
- [ ] Monitor error logs after deployment
- [ ] Test chat history persistence
- [ ] Verify email notifications work (if applicable)

---

## 📊 Monitoring

After deployment, monitor:

1. **Browser Console Errors**
   - Check for JavaScript errors
   - Look for failed API calls
   - Monitor CORS issues

2. **Server Logs**
   - API endpoint response times
   - Error rates
   - Visitor registration success rate

3. **User Feedback**
   - Chat completion rate
   - Average conversation length
   - Common user questions

---

## 🎉 Success!

Once everything is working:

1. The chatbot button appears on your WordPress site
2. Users can click to open the chatbot
3. Conversations are saved and persist
4. Mobile users have a great experience
5. No errors in console or logs

**You're done! The chatbot is now live on your WordPress site! 🎊**

---

## 📚 Additional Resources

- Full documentation: `CHATBOT_IFRAME_SETUP.md`
- WordPress snippet: `public/wordpress-chatbot-snippet.txt`
- Test page: `public/test-chatbot.html`
- Standalone HTML: `public/chatbot-embed.html`

For questions or issues, check the troubleshooting section in `CHATBOT_IFRAME_SETUP.md`.
