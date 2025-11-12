/**
 * Sample test to verify Jest setup
 */

describe('Sample Test Suite', () => {
  test('basic arithmetic', () => {
    expect(1 + 1).toBe(2)
  })

  test('string operations', () => {
    expect('hello world').toContain('world')
  })

  test('array operations', () => {
    const arr = [1, 2, 3]
    expect(arr).toHaveLength(3)
    expect(arr[0]).toBe(1)
  })

  test('object operations', () => {
    const obj = { name: 'Test', value: 42 }
    expect(obj).toHaveProperty('name')
    expect(obj.value).toBe(42)
  })
})

