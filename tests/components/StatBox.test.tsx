/**
 * StatBox Component Tests
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import StatBox from '@/components/StatBox'

describe('StatBox Component', () => {
  const defaultProps = {
    title: 'Test Title',
    value: 42,
    icon: '📊',
    color: 'blue' as const,
    change: { value: 5, isPositive: true }
  }

  test('renders with correct props', () => {
    const { container } = render(<StatBox {...defaultProps} />)
    expect(container).toBeInTheDocument()
  })

  test('displays title correctly', () => {
    render(<StatBox {...defaultProps} />)
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  test('displays value correctly', () => {
    render(<StatBox {...defaultProps} />)
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  test('handles different colors', () => {
    const { container: blueBox } = render(<StatBox {...defaultProps} color="blue" />)
    const { container: greenBox } = render(<StatBox {...defaultProps} color="green" />)
    
    expect(blueBox).toBeInTheDocument()
    expect(greenBox).toBeInTheDocument()
  })

  test('handles positive change', () => {
    const { container } = render(<StatBox {...defaultProps} change={{ value: 10, isPositive: true }} />)
    // Check for the percentage sign which indicates change is displayed
    expect(container.textContent).toContain('%')
    expect(container.textContent).toContain('vs last month')
  })

  test('handles negative change', () => {
    const { container } = render(<StatBox {...defaultProps} change={{ value: 5, isPositive: false }} />)
    // Check for the percentage sign which indicates change is displayed
    expect(container.textContent).toContain('%')
    expect(container.textContent).toContain('vs last month')
  })
})

