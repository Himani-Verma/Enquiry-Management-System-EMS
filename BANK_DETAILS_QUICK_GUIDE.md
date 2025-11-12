# Bank Details - Quick Guide 🚀

## ✅ What You Need to Know

The bank details in all quotations are now **FIXED** and **CANNOT BE CHANGED**.

---

## 📋 The Fixed Bank Details

```
Account Type:     ODD
Account Name:     Envirocare Labs Private Limited
Account Number:   481505000107
Bank Name/Branch: ICICI Bank Ltd. Centrum Park, 
                  Wagle Estate Branch, Thane (West) - 400604
IFSC Code:        ICIC0004815
```

These details will appear on **EVERY** quotation automatically.

---

## 🎯 What This Means for You

### When Creating a Quotation

1. **Fill in customer details** ✅
2. **Add items and prices** ✅
3. **Set taxes** ✅
4. **Fill "Prepared By" section** ✅
5. **Bank details?** → Already filled! (Read-only) ✅

### What You'll See

In the "Prepared By" tab:
- Bank details section has a **blue badge** saying "Fixed - Cannot be changed"
- All bank detail fields are **gray** (disabled)
- An **info box** explains they're fixed
- You **cannot edit** these fields

### In the Preview/PDF

- Bank details appear under "Envirocare Labs Bank Details:"
- Always shows the correct information
- Consistent on every quotation

---

## 🔒 Why Are They Fixed?

1. **Prevents errors** - No typos in account numbers
2. **Security** - No accidental changes to payment info
3. **Consistency** - Same details on every quotation
4. **Professional** - Uniform appearance

---

## 🛠️ Need to Change Bank Details?

**Only developers should do this!**

If the company's bank account changes:
1. Edit file: `cms/lib/constants/bankDetails.ts`
2. Update the values
3. Deploy to production
4. All new quotations will use new details

**Don't edit quotation forms or preview files!**

---

## 📸 Visual Guide

### In the Form

```
┌──────────────────────────────────────────────────────┐
│ 💳 Envirocare Labs Bank Details                     │
│                          [Fixed - Cannot be changed] │
├──────────────────────────────────────────────────────┤
│ ℹ️ These bank details are fixed for all quotations  │
│    and cannot be modified.                           │
│                                                       │
│ A/c Type:        [ODD]                    (gray box) │
│ Account Name:    [Envirocare Labs...]     (gray box) │
│ Account Number:  [481505000107]           (gray box) │
│ IFSC Code:       [ICIC0004815]            (gray box) │
│ Bank Name:       [ICICI Bank Ltd...]      (gray box) │
└──────────────────────────────────────────────────────┘
```

### In the PDF

```
┌──────────────────────────────────────────────────────┐
│ Prepared By:              Envirocare Labs Bank       │
│                           Details:                    │
│ Name: John Doe            A/c Type: ODD              │
│ Phone: +91 1234567890     Account Name: Envirocare   │
│ Email: john@example.com   Labs Private Limited       │
│                           Account Number:             │
│                           481505000107                │
│                           Bank Name/Branch: ICICI     │
│                           Bank Ltd. Centrum Park...   │
│                           IFSC Code: ICIC0004815      │
└──────────────────────────────────────────────────────┘
```

---

## ✅ Checklist for Users

When creating a quotation:

- [ ] Fill in customer details
- [ ] Add items and prices
- [ ] Set appropriate taxes
- [ ] Fill in "Prepared By" information
- [ ] **Skip bank details** (already filled!)
- [ ] Review preview
- [ ] Save quotation

**Note:** You don't need to do anything with bank details!

---

## 🆘 Troubleshooting

### Q: I can't edit the bank details!
**A:** That's correct! They're fixed and cannot be changed.

### Q: The bank details are wrong!
**A:** Contact your developer to update the constant file.

### Q: Can I change them for just one quotation?
**A:** No, they're the same for all quotations.

### Q: What if I need different bank details?
**A:** The company bank details should be the same for all quotations. If they need to change, a developer must update the system.

---

## 📚 More Information

- **Full Documentation:** `BANK_DETAILS_IMPLEMENTATION.md`
- **Summary:** `BANK_DETAILS_SUMMARY.md`
- **This Guide:** `BANK_DETAILS_QUICK_GUIDE.md`

---

## 🎉 Benefits

✅ No more typos in account numbers  
✅ Consistent information on all quotations  
✅ Professional appearance  
✅ Secure payment information  
✅ Less work for you (one less thing to fill!)  

---

**Remember:** Bank details are automatic. Just focus on your customer's information and the quotation items!

---

**Last Updated:** November 10, 2025  
**Status:** ✅ Active
