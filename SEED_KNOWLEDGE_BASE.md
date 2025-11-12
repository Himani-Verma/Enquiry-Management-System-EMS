# 🌱 Seed Knowledge Base with Default Content

This will add 10 FAQs and 5 articles to your database for the chatbot.

## Quick Start

Run this command in your terminal:

```bash
npm run seed:knowledge-base
```

That's it! ✨

## What gets added:

### 📝 10 FAQs about:
- Testing services
- Turnaround times  
- Scheduling
- Certifications
- Compliance
- Pricing
- Tracking
- On-site services
- Coverage areas
- Sample preparation

### 📚 5 Articles about:
- Water Quality Parameters
- Food Safety Testing
- Environmental Testing
- NABL Accreditation
- Swimming Pool Testing

## After running:

1. ✅ Visit `/dashboard/admin/knowledge-base` to see the content
2. ✅ Open your chatbot - click FAQ or Articles tabs
3. ✅ Content updates automatically every 30 seconds

## Safe to run multiple times!

The script won't create duplicates - it checks if content already exists.

## Need help?

Make sure:
- ✅ MongoDB is running
- ✅ `.env.local` has `MONGODB_URI` set
- ✅ You're in the project root directory

---

**Pro tip:** You can edit the content in `/dashboard/admin/knowledge-base` after seeding!
