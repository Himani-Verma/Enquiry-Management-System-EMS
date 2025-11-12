/**
 * Envirocare Labs Bank Details
 * 
 * IMPORTANT: These bank details are FIXED and should NOT be changed in quotations.
 * All quotations must use these exact details.
 */

export const ENVIROCARE_BANK_DETAILS = {
  accountType: 'ODD',
  accountName: 'Envirocare Labs Private Limited',
  accountNumber: '481505000107',
  bankNameBranch: 'ICICI Bank Ltd. Centrum Park, Wagle Estate Branch, Thane (West) - 400604',
  ifsc: 'ICIC0004815',
  // QR Code or Scan to Pay information can be added here if needed
  scanToPay: 'Available on printed quotation'
} as const;

/**
 * Get formatted bank details for display in quotations
 * Returns a read-only object with all bank details
 */
export function getBankDetails() {
  return {
    ...ENVIROCARE_BANK_DETAILS
  };
}

/**
 * Format bank details as a string for display
 */
export function formatBankDetails(): string {
  return `
Account Type: ${ENVIROCARE_BANK_DETAILS.accountType}
Account Name: ${ENVIROCARE_BANK_DETAILS.accountName}
Account Number: ${ENVIROCARE_BANK_DETAILS.accountNumber}
Bank Name/Branch: ${ENVIROCARE_BANK_DETAILS.bankNameBranch}
IFSC Code: ${ENVIROCARE_BANK_DETAILS.ifsc}
  `.trim();
}
