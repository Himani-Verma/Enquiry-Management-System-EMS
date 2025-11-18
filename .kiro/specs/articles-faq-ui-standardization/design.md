# Design Document

## Overview

This design document outlines the standardization of the Articles section UI to match the FAQ section within the ChatbotWidget component. The design focuses on creating visual consistency, maintaining the same interaction patterns, and ensuring a seamless user experience when switching between content types.

## Architecture

### Component Structure
The design maintains the existing React component architecture while standardizing the styling and behavior patterns:

```
ChatbotWidget
├── showFAQ (existing, reference implementation)
├── showArticles (to be updated)
├── FAQ Section (reference design)
└── Articles Section (target for standardization)
```

### Design Principles
1. **Visual Consistency**: Use identical color schemes, typography, and spacing
2. **Interaction Parity**: Maintain the same hover effects, animations, and user feedback
3. **Component Reusability**: Extract common styling patterns into reusable classes
4. **Accessibility Alignment**: Ensure both sections meet the same accessibility standards

## Components and Interfaces

### Header Component Standardization
**Current FAQ Header Design (Reference):**
- Icon: Question mark in gradient circle (from-[#4F46E5] to-[#1e3a8a])
- Title: "Search FAQ" with system-ui font, 18px, weight 600
- Spacing: flex items-center space-x-2 mb-4

**Articles Header Design (Target):**
- Icon: Document icon in same gradient circle (from-[#4F46E5] to-[#1e3a8a])
- Title: "Search Articles" with identical typography
- Spacing: Exact same spacing pattern as FAQ

### Search Interface Standardization
**Current FAQ Search Design (Reference):**
- Container: relative mb-3
- Icon: Search icon with loading spinner animation
- Input: Full width, specific padding (pl-10 pr-4 py-2.5), border-2 border-[#E5E7EB]
- Focus states: focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5]
- Colors: bg-[#FFFFFF] text-[#1F2937] placeholder:text-[#9CA3AF]

**Articles Search Design (Target):**
- Apply identical styling classes and structure
- Maintain same search icon and loading states
- Use same color scheme and interaction patterns

### Content Cards Standardization
**Current FAQ Card Design (Reference):**
- Container: bg-white rounded-lg border border-[#E5E7EB]
- Hover: hover:shadow-md hover:border-[#4F46E5]
- Padding: p-3
- Typography: text-[#1F2937] font-medium text-sm
- Category tags: bg-[#EEF2FF] text-[#4F46E5] border border-[#EEF2FF]

**Articles Card Design (Target):**
- Replace current gradient styling with FAQ card styling
- Standardize category tag appearance
- Apply same hover effects and transitions
- Use identical spacing and typography

### Interaction Patterns
**Expand/Collapse Behavior:**
- Use same chevron icon rotation animation (rotate-180)
- Apply identical transition timing (duration-200)
- Maintain same content reveal animation

**Loading States:**
- Use same spinner design and positioning
- Apply identical loading text styling
- Maintain same error state presentation

## Data Models

### Styling Configuration
```typescript
interface StandardizedStyling {
  header: {
    container: "flex items-center space-x-2 mb-4";
    icon: "w-8 h-8 bg-gradient-to-r from-[#4F46E5] to-[#1e3a8a] rounded-full flex items-center justify-center shadow-sm";
    title: "text-lg font-semibold text-[#1F2937]";
    titleStyle: "system-ui, -apple-system, sans-serif";
  };
  search: {
    container: "relative mb-3";
    input: "w-full pl-10 pr-4 py-2.5 border-2 border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5] hover:border-[#9CA3AF] transition-all duration-200 bg-[#FFFFFF] text-[#1F2937] placeholder:text-[#9CA3AF] shadow-sm hover:shadow-md focus:shadow-lg text-sm";
    icon: "h-4 w-4 text-[#9CA3AF]";
  };
  cards: {
    container: "bg-white rounded-lg border border-[#E5E7EB] hover:shadow-md hover:border-[#4F46E5] transition-all duration-200";
    content: "p-3";
    title: "text-[#1F2937] font-medium text-sm leading-tight";
    category: "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#EEF2FF] text-[#4F46E5] border border-[#EEF2FF]";
    text: "text-[#6B7280] text-sm leading-relaxed";
  };
}
```

### Color Scheme Standardization
```typescript
interface ColorPalette {
  primary: "#4F46E5";
  primaryDark: "#1e3a8a";
  text: {
    primary: "#1F2937";
    secondary: "#6B7280";
    placeholder: "#9CA3AF";
  };
  background: {
    white: "#FFFFFF";
    light: "#EEF2FF";
    gray: "#E5E7EB";
  };
  border: {
    default: "#E5E7EB";
    hover: "#4F46E5";
    focus: "#9CA3AF";
  };
}
```

## Error Handling

### Consistent Error States
- Apply same error message styling across both sections
- Use identical error icons and color schemes
- Maintain same retry button appearance and behavior
- Ensure error states have same accessibility attributes

### Loading State Consistency
- Use same loading spinner design and animation
- Apply identical loading text styling and positioning
- Maintain same skeleton loading patterns if applicable

## Testing Strategy

### Visual Regression Testing
1. **Component Comparison Tests**
   - Screenshot comparison between FAQ and Articles sections
   - Verify identical styling for corresponding elements
   - Test hover states and animations consistency

2. **Responsive Design Tests**
   - Ensure both sections behave identically across breakpoints
   - Verify consistent spacing and layout adjustments
   - Test mobile interaction patterns

3. **Accessibility Testing**
   - Verify both sections have identical ARIA attributes
   - Test keyboard navigation consistency
   - Ensure screen reader compatibility is maintained

### Interaction Testing
1. **Search Functionality**
   - Test search input behavior consistency
   - Verify result display formatting matches
   - Test loading and error states

2. **Content Expansion**
   - Test expand/collapse animations are identical
   - Verify content formatting consistency
   - Test interaction timing and feedback

### Cross-Browser Testing
- Ensure styling consistency across different browsers
- Test CSS gradient and animation support
- Verify font rendering consistency

## Implementation Notes

### CSS Class Extraction
Extract common styling patterns into reusable utility classes:
- `.standardized-header`
- `.standardized-search-input`
- `.standardized-content-card`
- `.standardized-category-tag`

### Animation Consistency
Ensure all transition durations and easing functions match:
- `transition-all duration-200`
- `hover:shadow-md`
- `focus:shadow-lg`

### Typography Standardization
Apply consistent font families and sizing:
- Header: `system-ui, -apple-system, sans-serif`
- Body text: Same font stack with appropriate sizing
- Consistent line heights and letter spacing

This design ensures that users will have a seamless experience when switching between FAQ and Articles sections, with identical visual patterns and interaction behaviors throughout the ChatbotWidget component.