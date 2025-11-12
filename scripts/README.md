# Knowledge Base Seed Script

This script populates your database with default FAQs and articles for the chatbot.

## What it adds:

### FAQs (10 items):
- Testing services overview
- Turnaround times
- Sample collection scheduling
- Certifications and accreditations
- Compliance reporting
- Pricing information
- Sample tracking
- On-site testing services
- Service coverage areas
- Sample preparation guidelines

### Articles (5 items):
- Understanding Water Quality Parameters
- Food Safety Testing Guide
- Environmental Testing Services
- NABL Accreditation Explained
- Swimming Pool Water Testing

## How to run:

### Option 1: Using npm script (Recommended)
```bash
npm run seed:knowledge-base
```

### Option 2: Direct execution
```bash
node scripts/seed-knowledge-base.js
```

### Option 3: With custom MongoDB URI
```bash
MONGODB_URI="your-mongodb-connection-string" npm run seed:knowledge-base
```

## Features:

✅ **Safe to run multiple times** - Won't create duplicates
✅ **Checks existing data** - Skips items that already exist
✅ **Detailed logging** - Shows what was added/skipped
✅ **Summary report** - Final count of all items

## Requirements:

- MongoDB must be running
- MONGODB_URI environment variable must be set (or use default)
- Node.js installed

## After seeding:

1. Visit `/dashboard/admin/knowledge-base` to view and manage content
2. Open your chatbot and check the FAQ and Articles tabs
3. Content will auto-refresh in the chatbot every 30 seconds

## Troubleshooting:

**Error: Cannot connect to MongoDB**
- Check if MongoDB is running
- Verify MONGODB_URI in your .env.local file
- Ensure network connectivity

**Error: Duplicate key error**
- This means the data already exists
- The script should handle this automatically
- If it persists, check your database manually

**No data showing in chatbot**
- Wait 30 seconds for auto-refresh
- Or reload the chatbot page
- Check browser console for API errors

## Customization:

To add your own default content, edit:
- `scripts/seed-knowledge-base.js`
- Modify the `defaultFaqs` and `defaultArticles` arrays
- Run the script again

## Support:

For issues or questions, check:
- MongoDB connection logs
- Browser console for API errors
- Network tab for failed requests
