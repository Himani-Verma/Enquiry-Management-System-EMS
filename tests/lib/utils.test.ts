/**
 * Utility Functions Tests
 */

import { cn } from '@/lib/utils'

describe('Utility Functions', () => {
  describe('cn() - className utility', () => {
    test('merges class names correctly', () => {
      expect(cn('foo', 'bar')).toBe('foo bar')
    })

    test('handles conditional classes', () => {
      expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
    })

    test('handles undefined and null', () => {
      expect(cn('foo', undefined, null, 'bar')).toBe('foo bar')
    })

    test('merges Tailwind classes with conflicts', () => {
      expect(cn('p-2', 'p-4')).toBe('p-4')
    })

    test('handles empty input', () => {
      expect(cn()).toBe('')
    })

    test('handles arrays of classes', () => {
      expect(cn(['foo', 'bar'], 'baz')).toContain('foo')
      expect(cn(['foo', 'bar'], 'baz')).toContain('bar')
      expect(cn(['foo', 'bar'], 'baz')).toContain('baz')
    })
  })

  describe('Date formatting utilities', () => {
    test('formats date correctly', () => {
      const date = new Date('2025-10-28')
      const formatted = date.toISOString().split('T')[0]
      expect(formatted).toBe('2025-10-28')
    })

    test('handles invalid dates gracefully', () => {
      const invalidDate = new Date('invalid')
      expect(isNaN(invalidDate.getTime())).toBe(true)
    })
  })

  describe('String utilities', () => {
    test('capitalizes first letter', () => {
      const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)
      expect(capitalize('hello')).toBe('Hello')
      expect(capitalize('WORLD')).toBe('WORLD')
    })

    test('trims whitespace', () => {
      expect('  hello world  '.trim()).toBe('hello world')
    })
  })
})

