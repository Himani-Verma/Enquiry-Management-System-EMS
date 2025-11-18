import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatbotWidget from '../../components/ChatbotWidget';

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

describe('ChatbotWidget FAQ Search', () => {
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

  it('renders FAQ search interface correctly', async () => {
    render(<ChatbotWidget isOpen={true} onToggle={() => {}} />);
    
    // Click FAQ tab
    const faqTab = screen.getByTitle('FAQ');
    fireEvent.click(faqTab);

    await waitFor(() => {
      expect(screen.getByText('Search FAQ')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search FAQs...')).toBeInTheDocument();
    });
  });

  it('displays FAQ items correctly', async () => {
    render(<ChatbotWidget isOpen={true} onToggle={() => {}} />);
    
    // Click FAQ tab
    const faqTab = screen.getByTitle('FAQ');
    fireEvent.click(faqTab);

    await waitFor(() => {
      expect(screen.getByText('What is EGA?')).toBeInTheDocument();
      expect(screen.getByText('How do I submit a sample?')).toBeInTheDocument();
      expect(screen.getByText('General')).toBeInTheDocument();
      expect(screen.getByText('Testing')).toBeInTheDocument();
    });
  });

  it('filters FAQs based on search query', async () => {
    render(<ChatbotWidget isOpen={true} onToggle={() => {}} />);
    
    // Click FAQ tab
    const faqTab = screen.getByTitle('FAQ');
    fireEvent.click(faqTab);

    await waitFor(() => {
      expect(screen.getByText('What is EGA?')).toBeInTheDocument();
    });

    // Search for "EGA"
    const searchInput = screen.getByPlaceholderText('Search FAQs...');
    fireEvent.change(searchInput, { target: { value: 'EGA' } });

    // Wait for debounced search
    await waitFor(() => {
      expect(screen.getByText('Found 1 FAQ for "EGA"')).toBeInTheDocument();
      expect(screen.getByText('What is EGA?')).toBeInTheDocument();
      expect(screen.queryByText('How do I submit a sample?')).not.toBeInTheDocument();
    }, { timeout: 500 });
  });

  it('expands and collapses FAQ items', async () => {
    render(<ChatbotWidget isOpen={true} onToggle={() => {}} />);
    
    // Click FAQ tab
    const faqTab = screen.getByTitle('FAQ');
    fireEvent.click(faqTab);

    await waitFor(() => {
      expect(screen.getByText('What is EGA?')).toBeInTheDocument();
    });

    // Click on FAQ item to expand
    const faqItem = screen.getByText('What is EGA?');
    fireEvent.click(faqItem.closest('div[style*="cursor: pointer"]')!);

    await waitFor(() => {
      expect(screen.getByText(/The Envirocare Green Awards/)).toBeInTheDocument();
    });
  });

  it('shows loading state while fetching FAQs', () => {
    (fetch as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<ChatbotWidget isOpen={true} onToggle={() => {}} />);
    
    // Click FAQ tab
    const faqTab = screen.getByTitle('FAQ');
    fireEvent.click(faqTab);

    expect(screen.getByText('Loading FAQs...')).toBeInTheDocument();
  });

  it('shows error state when FAQ loading fails', async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
    
    render(<ChatbotWidget isOpen={true} onToggle={() => {}} />);
    
    // Click FAQ tab
    const faqTab = screen.getByTitle('FAQ');
    fireEvent.click(faqTab);

    await waitFor(() => {
      expect(screen.getByText('Failed to load FAQs. Please try again later.')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  it('shows no results message for empty search', async () => {
    render(<ChatbotWidget isOpen={true} onToggle={() => {}} />);
    
    // Click FAQ tab
    const faqTab = screen.getByTitle('FAQ');
    fireEvent.click(faqTab);

    await waitFor(() => {
      expect(screen.getByText('What is EGA?')).toBeInTheDocument();
    });

    // Search for something that doesn't exist
    const searchInput = screen.getByPlaceholderText('Search FAQs...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    // Wait for debounced search
    await waitFor(() => {
      expect(screen.getByText('No FAQs found for "nonexistent"')).toBeInTheDocument();
      expect(screen.getByText('Try different keywords or browse all FAQs')).toBeInTheDocument();
    }, { timeout: 500 });
  });

  it('shows search loading indicator during debounced search', async () => {
    render(<ChatbotWidget isOpen={true} onToggle={() => {}} />);
    
    // Click FAQ tab
    const faqTab = screen.getByTitle('FAQ');
    fireEvent.click(faqTab);

    await waitFor(() => {
      expect(screen.getByText('What is EGA?')).toBeInTheDocument();
    });

    // Start typing to trigger search loading
    const searchInput = screen.getByPlaceholderText('Search FAQs...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // Should show loading spinner briefly
    const loadingSpinner = document.querySelector('.animate-spin');
    expect(loadingSpinner).toBeInTheDocument();
  });

  it('maintains proper typography and spacing', async () => {
    render(<ChatbotWidget isOpen={true} onToggle={() => {}} />);
    
    // Click FAQ tab
    const faqTab = screen.getByTitle('FAQ');
    fireEvent.click(faqTab);

    await waitFor(() => {
      const title = screen.getByText('Search FAQ');
      expect(title).toHaveStyle('font-size: clamp(18px, 4vw, 20px)');
      expect(title).toHaveStyle('font-weight: 600');
      expect(title).toHaveStyle('line-height: 1.3');
    });

    const searchInput = screen.getByPlaceholderText('Search FAQs...');
    expect(searchInput).toHaveStyle('min-height: 44px');
    expect(searchInput).toHaveStyle('height: 44px');
  });

  it('handles touch interactions properly', async () => {
    render(<ChatbotWidget isOpen={true} onToggle={() => {}} />);
    
    // Click FAQ tab
    const faqTab = screen.getByTitle('FAQ');
    fireEvent.click(faqTab);

    await waitFor(() => {
      expect(screen.getByText('What is EGA?')).toBeInTheDocument();
    });

    // Check that FAQ items have proper touch target size
    const faqItems = document.querySelectorAll('[style*="min-height: 44px"]');
    expect(faqItems.length).toBeGreaterThan(0);
  });
});