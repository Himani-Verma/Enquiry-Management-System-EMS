import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import '@testing-library/jest-dom';
import ChatbotWidget from '../../components/ChatbotWidget';

expect.extend(toHaveNoViolations);

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

// Mock crypto.randomUUID
global.crypto = {
  randomUUID: jest.fn(() => 'mock-uuid'),
} as any;

describe('ChatbotWidget FAQ Search Accessibility', () => {
  const mockFaqData = [
    {
      _id: '1',
      question: 'What is EGA?',
      answer: 'The Envirocare Green Awards (EGA) is an initiative launched by Envirocare Labs in 2018.',
      category: 'General',
    },
    {
      _id: '2',
      question: 'How do I submit a sample?',
      answer: 'You can submit samples by visiting our lab or using our pickup service.',
      category: 'Testing',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        faqs: mockFaqData,
      }),
    });
  });

  it('should not have accessibility violations', async () => {
    const { container } = render(<ChatbotWidget isOpen={true} onToggle={() => {}} />);
    
    // Click FAQ tab
    const faqTab = screen.getByTitle('FAQ');
    fireEvent.click(faqTab);

    await waitFor(() => {
      expect(screen.getByText('Search FAQ')).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has proper ARIA labels and roles', async () => {
    render(<ChatbotWidget isOpen={true} onToggle={() => {}} />);
    
    // Click FAQ tab
    const faqTab = screen.getByTitle('FAQ');
    fireEvent.click(faqTab);

    await waitFor(() => {
      // Check search input has proper ARIA attributes
      const searchInput = screen.getByRole('searchbox');
      expect(searchInput).toHaveAttribute('aria-label', 'Search frequently asked questions');
      expect(searchInput).toHaveAttribute('aria-describedby', 'faq-search-description');

      // Check FAQ list has proper role
      const faqList = screen.getByRole('list');
      expect(faqList).toHaveAttribute('aria-label', 'Frequently asked questions');

      // Check FAQ items have proper roles
      const faqItems = screen.getAllByRole('listitem');
      expect(faqItems.length).toBeGreaterThan(0);
    });
  });

  it('has proper keyboard navigation', async () => {
    render(<ChatbotWidget isOpen={true} onToggle={() => {}} />);
    
    // Click FAQ tab
    const faqTab = screen.getByTitle('FAQ');
    fireEvent.click(faqTab);

    await waitFor(() => {
      expect(screen.getByText('What is EGA?')).toBeInTheDocument();
    });

    // Test keyboard navigation
    const searchInput = screen.getByRole('searchbox');
    searchInput.focus();
    expect(searchInput).toHaveFocus();

    // Tab to first FAQ item
    fireEvent.keyDown(searchInput, { key: 'Tab' });
    const firstFaqButton = screen.getAllByRole('button')[0];
    expect(firstFaqButton).toHaveAttribute('aria-expanded', 'false');

    // Press Enter to expand
    fireEvent.keyDown(firstFaqButton, { key: 'Enter' });
    expect(firstFaqButton).toHaveAttribute('aria-expanded', 'true');
  });

  it('has sufficient color contrast', async () => {
    render(<ChatbotWidget isOpen={true} onToggle={() => {}} />);
    
    // Click FAQ tab
    const faqTab = screen.getByTitle('FAQ');
    fireEvent.click(faqTab);

    await waitFor(() => {
      // Check that text colors meet WCAG AA standards
      const title = screen.getByText('Search FAQ');
      const computedStyle = window.getComputedStyle(title);
      
      // Title should have dark text color (#1F2937)
      expect(title).toHaveStyle('color: #1F2937');
      
      // Search input should have proper contrast
      const searchInput = screen.getByRole('searchbox');
      expect(searchInput).toHaveStyle('color: #1F2937');
      expect(searchInput).toHaveStyle('background-color: #FFFFFF');
    });
  });

  it('has proper focus indicators', async () => {
    render(<ChatbotWidget isOpen={true} onToggle={() => {}} />);
    
    // Click FAQ tab
    const faqTab = screen.getByTitle('FAQ');
    fireEvent.click(faqTab);

    await waitFor(() => {
      expect(screen.getByText('What is EGA?')).toBeInTheDocument();
    });

    // Check search input focus ring
    const searchInput = screen.getByRole('searchbox');
    fireEvent.focus(searchInput);
    expect(searchInput).toHaveClass('focus:ring-2', 'focus:ring-[#4F46E5]');

    // Check FAQ button focus ring
    const faqButtons = screen.getAllByRole('button');
    const firstFaqButton = faqButtons.find(button => 
      button.getAttribute('aria-expanded') !== null
    );
    
    if (firstFaqButton) {
      fireEvent.focus(firstFaqButton);
      expect(firstFaqButton).toHaveClass('focus:ring-2', 'focus:ring-[#4F46E5]');
    }
  });

  it('has proper touch target sizes', async () => {
    render(<ChatbotWidget isOpen={true} onToggle={() => {}} />);
    
    // Click FAQ tab
    const faqTab = screen.getByTitle('FAQ');
    fireEvent.click(faqTab);

    await waitFor(() => {
      // Check search input has minimum 44px height
      const searchInput = screen.getByRole('searchbox');
      expect(searchInput).toHaveStyle('min-height: 44px');
      expect(searchInput).toHaveStyle('height: 44px');

      // Check FAQ buttons have minimum touch target size
      const faqButtons = screen.getAllByRole('button');
      const expandableButtons = faqButtons.filter(button => 
        button.getAttribute('aria-expanded') !== null
      );
      
      expandableButtons.forEach(button => {
        expect(button).toHaveStyle('min-height: 44px');
      });
    });
  });

  it('provides proper screen reader announcements', async () => {
    render(<ChatbotWidget isOpen={true} onToggle={() => {}} />);
    
    // Click FAQ tab
    const faqTab = screen.getByTitle('FAQ');
    fireEvent.click(faqTab);

    await waitFor(() => {
      expect(screen.getByText('What is EGA?')).toBeInTheDocument();
    });

    // Search for something
    const searchInput = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: 'EGA' } });

    // Wait for debounced search and check live region
    await waitFor(() => {
      const liveRegion = screen.getByText(/Found \d+ FAQ/);
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
      expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
    }, { timeout: 500 });
  });

  it('has proper heading structure', async () => {
    render(<ChatbotWidget isOpen={true} onToggle={() => {}} />);
    
    // Click FAQ tab
    const faqTab = screen.getByTitle('FAQ');
    fireEvent.click(faqTab);

    await waitFor(() => {
      // Main title should be h3
      const mainTitle = screen.getByText('Search FAQ');
      expect(mainTitle.tagName).toBe('H3');

      // FAQ questions should be h4
      const faqQuestions = screen.getAllByText(/What is EGA\?|How do I submit a sample\?/);
      faqQuestions.forEach(question => {
        expect(question.tagName).toBe('H4');
      });
    });
  });

  it('supports high contrast mode', async () => {
    // Mock high contrast media query
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-contrast: high)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    render(<ChatbotWidget isOpen={true} onToggle={() => {}} />);
    
    // Click FAQ tab
    const faqTab = screen.getByTitle('FAQ');
    fireEvent.click(faqTab);

    await waitFor(() => {
      // Elements should maintain visibility in high contrast mode
      const searchInput = screen.getByRole('searchbox');
      expect(searchInput).toHaveStyle('border: 2px solid #E5E7EB');
      
      const faqItems = screen.getAllByRole('listitem');
      faqItems.forEach(item => {
        expect(item.firstChild).toHaveStyle('border: 1px solid #E5E7EB');
      });
    });
  });
});