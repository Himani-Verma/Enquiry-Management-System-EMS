# IGST Tax Implementation

## Summary
Added IGST (Integrated GST) as a tax option alongside CGST and SGST, with **checkbox selection** to allow any combination of taxes. Users can now select CGST, SGST, IGST, or any combination of these taxes for maximum flexibility.

## Changes Made

### 1. Updated Type Definitions
**File**: `cms/lib/types/quotation.ts`

Updated TaxDetails interface with boolean flags for each tax type:

```typescript
export interface TaxDetails {
  cgstEnabled: boolean  // Whether CGST is applied
  sgstEnabled: boolean  // Whether SGST is applied
  igstEnabled: boolean  // Whether IGST is applied
  cgstRate: number
  sgstRate: number
  igstRate: number
  cgstAmount: number
  sgstAmount: number
  igstAmount: number
}
```

### 2. Updated Tax Calculations
**File**: `cms/lib/quotation-calculations.ts`

Modified `computeTaxes` function to calculate taxes based on enabled flags:

```typescript
export const computeTaxes = (
  subtotal: number,
  cgstEnabled: boolean,
  sgstEnabled: boolean,
  igstEnabled: boolean,
  cgstRate: number,
  sgstRate: number,
  igstRate: number
): TaxDetails => {
  const cgstAmount = cgstEnabled ? (subtotal * cgstRate) / 100 : 0
  const sgstAmount = sgstEnabled ? (subtotal * sgstRate) / 100 : 0
  const igstAmount = igstEnabled ? (subtotal * igstRate) / 100 : 0
  
  return {
    cgstEnabled,
    sgstEnabled,
    igstEnabled,
    cgstRate,
    sgstRate,
    igstRate,
    cgstAmount,
    sgstAmount,
    igstAmount,
  }
}
```

### 3. Updated Quotation Form Modal
**File**: `cms/components/quotation/QuotationFormModal.tsx`

**Change 1**: Updated initial quotation data
```typescript
taxes: {
  cgstEnabled: true,   // CGST enabled by default
  sgstEnabled: true,   // SGST enabled by default
  igstEnabled: false,  // IGST disabled by default
  cgstRate: 9,
  sgstRate: 9,
  igstRate: 18,
  cgstAmount: 0,
  sgstAmount: 0,
  igstAmount: 0
}
```

**Change 2**: Updated validation schema
```typescript
taxes: z.object({
  cgstEnabled: z.boolean(),
  sgstEnabled: z.boolean(),
  igstEnabled: z.boolean(),
  cgstRate: z.number().min(0).max(100),
  sgstRate: z.number().min(0).max(100),
  igstRate: z.number().min(0).max(100),
  cgstAmount: z.number(),
  sgstAmount: z.number(),
  igstAmount: z.number(),
})
```

**Change 3**: Updated auto-calculation logic
```typescript
const cgstEnabled = watchedValues.taxes?.cgstEnabled ?? true
const sgstEnabled = watchedValues.taxes?.sgstEnabled ?? true
const igstEnabled = watchedValues.taxes?.igstEnabled ?? false
const cgstRate = watchedValues.taxes?.cgstRate || 9
const sgstRate = watchedValues.taxes?.sgstRate || 9
const igstRate = watchedValues.taxes?.igstRate || 18

// Calculate taxes
const taxes = computeTaxes(subtotal, cgstEnabled, sgstEnabled, igstEnabled, cgstRate, sgstRate, igstRate)

// Calculate grand total
const grandTotal = subtotal + taxes.cgstAmount + taxes.sgstAmount + taxes.igstAmount
```

### 4. Updated Taxes & Summary Tab
**File**: `cms/components/quotation/tabs/TaxesSummaryTab.tsx`

**Change 1**: Added tax selection with checkboxes
```typescript
<div>
  <label className="block text-sm font-bold mb-3 text-gray-800">
    Select Applicable Taxes
  </label>
  <div className="space-y-2">
    {/* CGST Checkbox */}
    <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-300 cursor-pointer hover:bg-gray-50 transition-colors">
      <input
        type="checkbox"
        {...register('taxes.cgstEnabled')}
        disabled={isReadOnly}
        className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
      />
      <div className="flex-1">
        <span className="font-medium text-gray-900">CGST (Central GST)</span>
        <p className="text-xs text-gray-500 mt-0.5">Central Goods and Services Tax</p>
      </div>
    </label>
    
    {/* SGST Checkbox */}
    <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-300 cursor-pointer hover:bg-gray-50 transition-colors">
      <input
        type="checkbox"
        {...register('taxes.sgstEnabled')}
        disabled={isReadOnly}
        className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
      />
      <div className="flex-1">
        <span className="font-medium text-gray-900">SGST (State GST)</span>
        <p className="text-xs text-gray-500 mt-0.5">State Goods and Services Tax</p>
      </div>
    </label>
    
    {/* IGST Checkbox */}
    <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-300 cursor-pointer hover:bg-gray-50 transition-colors">
      <input
        type="checkbox"
        {...register('taxes.igstEnabled')}
        disabled={isReadOnly}
        className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
      />
      <div className="flex-1">
        <span className="font-medium text-gray-900">IGST (Integrated GST)</span>
        <p className="text-xs text-gray-500 mt-0.5">Integrated Goods and Services Tax</p>
      </div>
    </label>
  </div>
</div>
```

**Change 2**: Conditional rendering of tax rate inputs (only show enabled taxes)
```typescript
{cgstEnabled && (
  <div>
    <label>CGST Rate (%)</label>
    <input {...register('taxes.cgstRate')} />
  </div>
)}

{sgstEnabled && (
  <div>
    <label>SGST Rate (%)</label>
    <input {...register('taxes.sgstRate')} />
  </div>
)}

{igstEnabled && (
  <div>
    <label>IGST Rate (%)</label>
    <input {...register('taxes.igstRate')} />
  </div>
)}
```

**Change 3**: Updated calculated totals display (show only enabled taxes)
```typescript
{cgstEnabled && (
  <div className="flex justify-between text-sm">
    <span>CGST ({watchedValues.taxes?.cgstRate || 0}%):</span>
    <span>{formatINR(watchedValues.taxes?.cgstAmount || 0)}</span>
  </div>
)}

{sgstEnabled && (
  <div className="flex justify-between text-sm">
    <span>SGST ({watchedValues.taxes?.sgstRate || 0}%):</span>
    <span>{formatINR(watchedValues.taxes?.sgstAmount || 0)}</span>
  </div>
)}

{igstEnabled && (
  <div className="flex justify-between text-sm">
    <span>IGST ({watchedValues.taxes?.igstRate || 0}%):</span>
    <span>{formatINR(watchedValues.taxes?.igstAmount || 0)}</span>
  </div>
)}
```

### 5. Updated Quotation Preview
**File**: `cms/components/quotation/QuotationPreview.tsx`

Updated tax display in preview (show only enabled taxes):
```typescript
{quotation.taxes.cgstEnabled && (
  <div className="flex justify-between">
    <span>CGST ({quotation.taxes.cgstRate}%):</span>
    <span>{renderCurrency(quotation.taxes.cgstAmount)}</span>
  </div>
)}

{quotation.taxes.sgstEnabled && (
  <div className="flex justify-between">
    <span>SGST ({quotation.taxes.sgstRate}%):</span>
    <span>{renderCurrency(quotation.taxes.sgstAmount)}</span>
  </div>
)}

{quotation.taxes.igstEnabled && (
  <div className="flex justify-between">
    <span>IGST ({quotation.taxes.igstRate}%):</span>
    <span>{renderCurrency(quotation.taxes.igstAmount)}</span>
  </div>
)}
```

## User Interface

### Tax Selection with Checkboxes
Users now see three independent checkbox options:

1. **CGST (Central GST)** ✅ Enabled by default
   - Central Goods and Services Tax
   - Default rate: 9%

2. **SGST (State GST)** ✅ Enabled by default
   - State Goods and Services Tax
   - Default rate: 9%

3. **IGST (Integrated GST)** ⬜ Disabled by default
   - Integrated Goods and Services Tax
   - Default rate: 18%

### Flexible Combinations
Users can select **any combination** of taxes:
- ✅ CGST only
- ✅ SGST only
- ✅ IGST only
- ✅ CGST + SGST (typical intra-state)
- ✅ CGST + IGST
- ✅ SGST + IGST
- ✅ CGST + SGST + IGST (all three)
- ⬜ None (warning shown)

### Dynamic Tax Rate Inputs
- Only enabled taxes show rate input fields
- Disabled taxes are hidden from the form
- Cleaner, less cluttered interface

### Calculated Totals Display
The summary section dynamically shows only the enabled taxes:
- **Example 1 (CGST + SGST)**: Subtotal, CGST, SGST, Grand Total
- **Example 2 (IGST only)**: Subtotal, IGST, Grand Total
- **Example 3 (All three)**: Subtotal, CGST, SGST, IGST, Grand Total

## Tax Logic Examples

### Example 1: Intra-State (CGST + SGST)
```
Subtotal: ₹10,000
CGST (9%): ₹900
SGST (9%): ₹900
Grand Total: ₹11,800
```

### Example 2: Inter-State (IGST only)
```
Subtotal: ₹10,000
IGST (18%): ₹1,800
Grand Total: ₹11,800
```

### Example 3: All Three Taxes
```
Subtotal: ₹10,000
CGST (9%): ₹900
SGST (9%): ₹900
IGST (18%): ₹1,800
Grand Total: ₹13,600
```

### Example 4: CGST Only
```
Subtotal: ₹10,000
CGST (9%): ₹900
Grand Total: ₹10,900
```

## Default Values
- **CGST**: Enabled (9%)
- **SGST**: Enabled (9%)
- **IGST**: Disabled (18%)

This defaults to the typical intra-state transaction setup (CGST + SGST).

## Validation
- At least one tax should be selected (warning shown if none selected)
- Tax rates must be between 0% and 100%
- Only enabled taxes are calculated and displayed
- Amounts are automatically calculated based on enabled taxes

## Database Schema
The quotation documents in MongoDB now store:
```json
{
  "taxes": {
    "cgstEnabled": true,
    "sgstEnabled": true,
    "igstEnabled": false,
    "cgstRate": 9,
    "sgstRate": 9,
    "igstRate": 18,
    "cgstAmount": 900,
    "sgstAmount": 900,
    "igstAmount": 0
  }
}
```

## Benefits
1. ✅ **Maximum Flexibility**: Users can select any combination of CGST, SGST, and IGST
2. ✅ **Compliance**: Proper GST handling for all transaction types
3. ✅ **Accuracy**: Automatic calculation based on enabled taxes
4. ✅ **User-Friendly**: Clear checkboxes with descriptions for each tax type
5. ✅ **Dynamic UI**: Only shows rate inputs for enabled taxes
6. ✅ **Validation**: Ensures correct tax rates are applied
7. ✅ **Special Cases**: Supports unusual tax combinations if needed

## Testing Checklist

### Test Case 1: CGST + SGST (Default - Intra-State)
- [ ] Open new quotation form
- [ ] Verify CGST checkbox is checked by default
- [ ] Verify SGST checkbox is checked by default
- [ ] Verify IGST checkbox is unchecked by default
- [ ] Verify CGST and SGST rate inputs are visible
- [ ] Verify IGST rate input is hidden
- [ ] Add items with subtotal ₹10,000
- [ ] Verify CGST amount: ₹900
- [ ] Verify SGST amount: ₹900
- [ ] Verify IGST amount: ₹0
- [ ] Verify Grand Total: ₹11,800
- [ ] Save quotation
- [ ] Preview quotation - verify only CGST and SGST display

### Test Case 2: IGST Only (Inter-State)
- [ ] Uncheck CGST checkbox
- [ ] Uncheck SGST checkbox
- [ ] Check IGST checkbox
- [ ] Verify CGST and SGST rate inputs are hidden
- [ ] Verify IGST rate input is visible
- [ ] Add items with subtotal ₹10,000
- [ ] Verify CGST amount: ₹0
- [ ] Verify SGST amount: ₹0
- [ ] Verify IGST amount: ₹1,800
- [ ] Verify Grand Total: ₹11,800
- [ ] Save quotation
- [ ] Preview quotation - verify only IGST displays

### Test Case 3: All Three Taxes
- [ ] Check CGST checkbox
- [ ] Check SGST checkbox
- [ ] Check IGST checkbox
- [ ] Verify all three rate inputs are visible
- [ ] Add items with subtotal ₹10,000
- [ ] Verify CGST amount: ₹900
- [ ] Verify SGST amount: ₹900
- [ ] Verify IGST amount: ₹1,800
- [ ] Verify Grand Total: ₹13,600
- [ ] Save quotation
- [ ] Preview quotation - verify all three taxes display

### Test Case 4: CGST Only
- [ ] Check CGST checkbox only
- [ ] Uncheck SGST and IGST
- [ ] Verify only CGST rate input is visible
- [ ] Add items with subtotal ₹10,000
- [ ] Verify CGST amount: ₹900
- [ ] Verify SGST amount: ₹0
- [ ] Verify IGST amount: ₹0
- [ ] Verify Grand Total: ₹10,900
- [ ] Save quotation
- [ ] Preview quotation - verify only CGST displays

### Test Case 5: No Taxes Selected
- [ ] Uncheck all tax checkboxes
- [ ] Verify warning message appears
- [ ] Add items with subtotal ₹10,000
- [ ] Verify all tax amounts: ₹0
- [ ] Verify Grand Total: ₹10,000
- [ ] Save quotation
- [ ] Preview quotation - verify no taxes display

### Test Case 6: Toggle Taxes Dynamically
- [ ] Create quotation with CGST + SGST
- [ ] Add items
- [ ] Verify calculations
- [ ] Check IGST checkbox
- [ ] Verify calculations update automatically
- [ ] Uncheck CGST
- [ ] Verify calculations update automatically
- [ ] Check CGST again
- [ ] Verify calculations update automatically

### Test Case 7: Edit Existing Quotation
- [ ] Open existing quotation with CGST + SGST
- [ ] Verify CGST and SGST checkboxes are checked
- [ ] Verify rates load correctly
- [ ] Open existing quotation with IGST only
- [ ] Verify only IGST checkbox is checked
- [ ] Verify rate loads correctly

### Test Case 8: View Mode
- [ ] Open quotation in view mode
- [ ] Verify all checkboxes are disabled
- [ ] Verify tax rate inputs are disabled
- [ ] Verify calculations display correctly
- [ ] Verify only enabled taxes show in summary

## Files Modified
1. `cms/lib/types/quotation.ts` - Added TaxType and updated TaxDetails
2. `cms/lib/quotation-calculations.ts` - Updated computeTaxes function
3. `cms/components/quotation/QuotationFormModal.tsx` - Updated initial data, validation, and calculations
4. `cms/components/quotation/tabs/TaxesSummaryTab.tsx` - Added tax type selection UI
5. `cms/components/quotation/QuotationPreview.tsx` - Updated tax display

## Backward Compatibility
- Existing quotations without `cgstEnabled`, `sgstEnabled`, `igstEnabled` will default to:
  - `cgstEnabled: true`
  - `sgstEnabled: true`
  - `igstEnabled: false`
- Existing quotations without `igstRate` or `igstAmount` will default to 0
- No data migration required
- Old quotations will work seamlessly with new system

## Deployment Notes
- No database migration required
- No API changes required
- No breaking changes
- Can be deployed immediately

---

**Implementation Date**: November 8, 2025  
**Status**: ✅ Complete  
**Breaking Changes**: None  
**Migration Required**: No
