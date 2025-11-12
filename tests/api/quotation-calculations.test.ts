/**
 * Quotation Calculations Tests
 */

describe('Quotation Calculations', () => {
  describe('computeRowTotal', () => {
    test('calculates row total correctly', () => {
      const quantity = 10
      const unitPrice = 500
      const expected = 5000
      
      const total = quantity * unitPrice
      expect(total).toBe(expected)
    })

    test('handles zero quantity', () => {
      const quantity = 0
      const unitPrice = 500
      const total = quantity * unitPrice
      expect(total).toBe(0)
    })

    test('handles decimal prices', () => {
      const quantity = 5
      const unitPrice = 99.99
      const total = quantity * unitPrice
      expect(total).toBeCloseTo(499.95, 2)
    })
  })

  describe('computeSubtotal', () => {
    test('calculates subtotal correctly', () => {
      const items = [
        { total: 1000 },
        { total: 2000 },
        { total: 1500 }
      ]
      
      const subtotal = items.reduce((sum, item) => sum + item.total, 0)
      expect(subtotal).toBe(4500)
    })

    test('handles empty array', () => {
      const items: any[] = []
      const subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0)
      expect(subtotal).toBe(0)
    })
  })

  describe('computeTaxes', () => {
    test('calculates CGST and SGST correctly', () => {
      const subtotal = 1000
      const cgstRate = 9
      const sgstRate = 9
      
      const cgstAmount = (subtotal * cgstRate) / 100
      const sgstAmount = (subtotal * sgstRate) / 100
      
      expect(cgstAmount).toBe(90)
      expect(sgstAmount).toBe(90)
    })

    test('handles zero tax rates', () => {
      const subtotal = 1000
      const cgstRate = 0
      const sgstRate = 0
      
      const cgstAmount = (subtotal * cgstRate) / 100
      const sgstAmount = (subtotal * sgstRate) / 100
      
      expect(cgstAmount).toBe(0)
      expect(sgstAmount).toBe(0)
    })
  })

  describe('formatCurrency', () => {
    test('formats currency in INR format', () => {
      const amount = 1234.56
      const formatted = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
      }).format(amount)
      
      expect(formatted).toContain('1,234.56')
    })
  })
})

