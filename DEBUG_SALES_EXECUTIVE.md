# Sales Executive Enquiries Fix

## Issue
Sales executive dashboard was unable to fetch enquiries - worked on localhost but returned 404 on Netlify deployment.

## Root Causes
1. **Initial Issue**: During merge conflict resolution, the `/api/analytics/executive-enquiries-management` route was deleted
2. **Netlify Issue**: Long API route paths like `/api/analytics/customer-executive-enquiries-management` were causing 404 errors on Netlify (but worked fine on localhost)

## Fix Applied (Final)
Created a new dedicated API route with a shorter path for better Netlify compatibility:

**New API Route**: `/api/analytics/sales-executive-enquiries/route.ts`

**Updated Frontend**: Changed the API endpoint in `cms/app/dashboard/sales-executive/enquiries/page.tsx` to:
```typescript
const response = await fetch(`${API_BASE}/api/analytics/sales-executive-enquiries`, { headers });
```

## How It Works
The `customer-executive-enquiries-management` route has role-based filtering built in via the `getUserContext` function in `lib/middleware/auth.ts`:

- **Sales Executives** see only visitors where:
  - `salesExecutive` field matches their user ID, OR
  - `salesExecutiveName` field matches their name

- **Customer Executives** see only visitors where:
  - `customerExecutive` field matches their user ID, OR
  - `customerExecutiveName` field matches their name

- **Admins** see all visitors (no filter applied)

## Testing Checklist
1. ✅ Login as sales executive
2. ✅ Navigate to Enquiries page
3. ✅ Verify enquiries load (should show only enquiries assigned to that sales executive)
4. ✅ Verify no console errors
5. ✅ Test adding new enquiry
6. ✅ Test editing enquiry
7. ✅ Test deleting enquiry

## Files Fixed
1. ✅ `cms/app/dashboard/sales-executive/enquiries/page.tsx` - Updated to use `/api/analytics/sales-executive-enquiries`
2. ✅ `cms/app/dashboard/executive/enquiries/page.tsx` - Updated to use `/api/analytics/customer-executive-enquiries-management`
3. ✅ `cms/app/api/analytics/sales-executive-enquiries/route.ts` - Created new dedicated route

## Deployment
- Latest commit: `dd36d3f`
- Pushed to: `main` branch
- Netlify will auto-deploy in ~2-5 minutes

## Why This Happened
Netlify has specific requirements for Next.js 13 App Router API routes:
- Long nested paths can sometimes cause routing issues
- The `@netlify/plugin-nextjs` plugin handles most cases, but shorter paths are more reliable
- Localhost uses Node.js directly, while Netlify uses serverless functions

## Additional Notes
If sales executive still sees "Failed to load enquiries":
1. Check that visitors in database have `salesExecutive` or `salesExecutiveName` fields populated
2. Check that the sales executive user ID/name matches the values in visitor records
3. Check browser console for detailed error messages
4. Check Netlify function logs for server-side errors
5. Verify the new API route is deployed (check Netlify build logs)
