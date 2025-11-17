# Sales Executive Enquiries Fix

## Issue
Sales executive dashboard was unable to fetch enquiries because it was calling a deleted API endpoint.

## Root Cause
During merge conflict resolution, the `/api/analytics/executive-enquiries-management` route was deleted. The sales executive enquiries page was still trying to call this endpoint.

## Fix Applied
Changed the API endpoint in `cms/app/dashboard/sales-executive/enquiries/page.tsx` from:
```typescript
const response = await fetch(`${API_BASE}/api/analytics/executive-enquiries-management`, { headers });
```

To:
```typescript
const response = await fetch(`${API_BASE}/api/analytics/customer-executive-enquiries-management`, { headers });
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

## Deployment
- Committed: `a061d04`
- Pushed to: `main` branch
- Netlify will auto-deploy

## Additional Notes
If sales executive still sees "Failed to load enquiries":
1. Check that visitors in database have `salesExecutive` or `salesExecutiveName` fields populated
2. Check that the sales executive user ID/name matches the values in visitor records
3. Check browser console for detailed error messages
4. Check Netlify function logs for server-side errors
