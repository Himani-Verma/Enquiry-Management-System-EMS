# Quotation Text Color Update

## Change Summary

All red text in the quotation preview has been changed to black.

---

## What Was Changed

### Bill To Section
- **Company Name:** ~~Red~~ → **Black**
- **Address Line 1:** ~~Red~~ → **Black**
- **Address Line 2:** ~~Red~~ → **Black**
- **City & PIN:** ~~Red~~ → **Black**

### Ship To Section
- **Company Name:** ~~Red~~ → **Black**
- **Address Line 1:** ~~Red~~ → **Black**
- **Address Line 2:** ~~Red~~ → **Black**
- **City & PIN:** ~~Red~~ → **Black**

---

## Before & After

### Before
```tsx
<p className="font-bold text-red-600">{renderValue(quotation.billTo.name)}</p>
<p className="text-red-600">{renderValue(quotation.billTo.address1)}</p>
<p className="text-red-600">{renderValue(quotation.billTo.address2)}</p>
<p className="text-red-600">{[quotation.billTo.city, quotation.billTo.pin].filter(Boolean).join(' - ')}</p>
```

### After
```tsx
<p className="font-bold text-black">{renderValue(quotation.billTo.name)}</p>
<p className="text-black">{renderValue(quotation.billTo.address1)}</p>
<p className="text-black">{renderValue(quotation.billTo.address2)}</p>
<p className="text-black">{[quotation.billTo.city, quotation.billTo.pin].filter(Boolean).join(' - ')}</p>
```

---

## Files Modified

- **`cms/components/quotation/QuotationPreview.tsx`**
  - Changed all `text-red-600` to `text-black` in Bill To section
  - Changed all `text-red-600` to `text-black` in Ship To section

- **`cms/components/quotation/PreviewDrawer.tsx`**
  - Changed all `text-red-600` to `text-black` in Bill To section
  - Changed all `text-red-600` to `text-black` in Ship To section
  - Changed DOCX export color from `dc2626` (red) to `000000` (black)

---

## Colors Retained

The following colors remain unchanged:
- **Blue headers:** `bg-[#1976D2]` (Bill to / Ship to headers)
- **Email links:** `text-blue-600` (Contact email addresses)
- **Company name:** `text-[#2d4891]` (Envirocare Labs header)
- **Green border:** `border-[#00C853]` (Our Services box)

---

## Result

All customer/company names and addresses now appear in **black** instead of red, providing a more professional and standard appearance.

---

**Updated:** November 10, 2025  
**Status:** ✅ Complete
