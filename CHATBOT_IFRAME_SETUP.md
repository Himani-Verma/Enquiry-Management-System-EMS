# Chatbot Iframe Integration Guide

## Overview
The Envirocare Labs chatbot has been extracted and can now be embedded as an iframe on your WordPress site or any other website.

## What Was Created

### 1. Standalone Chatbot Page
**File:** `cms/app/chatbot/page.tsx`
- A dedicated page that renders only the chatbot widget
- Accessible at: `https://your-domain.com/chatbot`
- Optimized for iframe embedding

### 2. Embeddable HTML File
**File:** `cms/public/chatbot-embed.html`
- A complete standalone HTML file with the chatbot button and iframe
- Can be hosted anywhere or used as a reference
- Includes all necessary CSS and JavaScript

### 3. WordPress Integration Snippet
**File:** `cms/public/wordpress-chatbot-snippet.txt`
- Ready-to-use code snippet for WordPress
- Multiple integration options (WPCode plugin, theme editor, widget)
- Detailed instructions included

### 4. Security Configuration
**File:** `cms/next.config.js` (updated)
- Added headers to allow iframe embedding
- Configured X-Frame-Options and Content-Security-Policy
- Ensures the chatbot works across domains

## Quick Start

### Step 1: Deploy Your Next.js App
```bash
cd cms
npm run build
npm start
# Or deploy to your hosting provider (Vercel, Netlify, etc.)
```

### Step 2: Test the Chatbot Page
Visit: `https://your-domain.com/chatbot`
- The chatbot should load in full-screen mode
- Test all functionality (registration, messaging, etc.)

### Step 3: Add to WordPress

#### Option A: Using WPCode Plugin (Recommended)
1. Install "WPCode" plugin from WordPress admin
2. Go to Code Snippets > Add Snippet
3. Choose "Add Your Custom Code (New Snippet)"
4. Copy the code from `cms/public/wordpress-chatbot-snippet.txt`
5. Replace `YOUR-DOMAIN.com` with your actual domain
6. Set location to "Site Wide Footer"
7. Save and activate

#### Option B: Manual Theme Integration
1. Go to Appearance > Theme File Editor
2. Edit `footer.php`
3. Paste the code before `</body>`
4. Update the iframe src URL
5. Save changes

#### Option C: Custom HTML Widget
1. Go to Appearance > Widgets
2. Add "Custom HTML" widget to footer
3. Paste the code
4. Update the iframe src URL
5. Save widget

## Configuration

### Update the Iframe URL
In the WordPress snippet, find this line:
```html
<iframe 
  id="envirocare-chatbot-iframe" 
  src="https://YOUR-DOMAIN.com/chatbot"
  ...
></iframe>
```

Replace `YOUR-DOMAIN.com` with your actual Next.js deployment URL:
- Production: `https://nablscope.envirocarelabs.com/chatbot`
- Staging: `https://staging.envirocarelabs.com/chatbot`
- Local testing: `http://localhost:3000/chatbot`

### Customize Button Position
In the CSS section, adjust these values:
```css
#envirocare-chatbot-button {
  bottom: 24px;  /* Distance from bottom */
  right: 24px;   /* Distance from right */
  /* Change to left: 24px; for left side */
}
```

### Customize Chatbot Size
```css
#envirocare-chatbot-container {
  width: 400px;   /* Chatbot width */
  height: 600px;  /* Chatbot height */
}
```

## Features

### Chatbot Button
- Fixed position (bottom-right by default)
- Smooth hover animations
- Toggle open/close functionality
- Mobile responsive

### Chatbot Container
- Slide-up animation when opening
- Click outside to close
- Responsive design for mobile devices
- Maintains chat history via localStorage

### Security
- CORS configured for cross-domain embedding
- Iframe security headers properly set
- No data leakage between parent and iframe

## Testing Checklist

- [ ] Chatbot page loads at `/chatbot`
- [ ] Button appears on WordPress site
- [ ] Clicking button opens chatbot
- [ ] Chatbot loads inside iframe
- [ ] Can register as new visitor
- [ ] Can send and receive messages
- [ ] Chat history persists
- [ ] Mobile responsive design works
- [ ] Click outside closes chatbot
- [ ] No console errors

## Troubleshooting

### Chatbot doesn't load in iframe
**Problem:** Blank iframe or "Refused to display" error
**Solution:** 
- Check that Next.js app is deployed and accessible
- Verify the iframe src URL is correct
- Check browser console for CORS errors
- Ensure `next.config.js` headers are properly configured

### Button doesn't appear
**Problem:** Chat button not visible on WordPress site
**Solution:**
- Check that the snippet is activated (if using WPCode)
- Verify z-index isn't being overridden by theme CSS
- Check browser console for JavaScript errors
- Try adding `!important` to CSS rules if needed

### Chat history not persisting
**Problem:** Messages disappear on page reload
**Solution:**
- Check that localStorage is enabled in browser
- Verify visitor ID is being stored correctly
- Check API endpoints are responding correctly

### Mobile display issues
**Problem:** Chatbot too large or positioned incorrectly on mobile
**Solution:**
- The CSS includes mobile responsive rules
- Test on actual mobile devices, not just browser resize
- Adjust media query breakpoints if needed

## API Endpoints Used

The chatbot uses these API endpoints:
- `POST /api/visitors` - Create/update visitor
- `GET /api/chat/[visitorId]/messages/public` - Fetch messages
- `POST /api/chat/[visitorId]/messages` - Send message
- `POST /api/analytics/chatbot-enquiry` - Create enquiry

Ensure all these endpoints are accessible from your WordPress domain.

## Next Steps

1. **Branding:** Customize colors in the CSS to match your brand
2. **Analytics:** Add tracking to monitor chatbot usage
3. **Notifications:** Add sound/visual notifications for new messages
4. **Multi-language:** Add language selection if needed
5. **Custom Triggers:** Add page-specific chatbot triggers

## Support

For issues or questions:
- Check the browser console for errors
- Review the WordPress error logs
- Test the `/chatbot` page directly first
- Verify all API endpoints are working
