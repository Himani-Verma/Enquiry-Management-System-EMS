# Implementation Plan

- [ ] 1. Enhance dashboard-compact.css with comprehensive compact styles
  - Update `app/dashboard-compact.css` with all missing compact rules for headers, tables, forms, and content areas
  - Add CSS rules for dashboard headers with reduced font sizes and margins
  - Add CSS rules for tables with reduced cell padding
  - Add CSS rules for form elements with compact padding
  - Add CSS rules for modals with reduced padding
  - Add CSS rules for main content areas and sections
  - Ensure all rules use `!important` to override Tailwind defaults
  - Add responsive breakpoint adjustments for mobile, tablet, and desktop
  - _Requirements: 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.4, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 7.5_

- [ ] 2. Update Admin Dashboard with compact classes
  - [ ] 2.1 Apply compact classes to stat cards in AdminDashboard.tsx
    - Add `dashboard-stat-card` class to all stat card containers
    - Add `dashboard-stats-grid` class to the grid container
    - Update icon sizes from `w-8 h-8` to `w-6 h-6`
    - Update metric value font sizes from `text-4xl` to `text-3xl`
    - Update padding from `p-6` to `p-4`
    - _Requirements: 1.2, 1.3, 1.4, 1.5_
  
  - [ ] 2.2 Apply compact classes to charts in AdminDashboard.tsx
    - Add `dashboard-chart-container` class to chart wrapper divs
    - Update chart height from 480px to 360px
    - Reduce padding from `p-6` to `p-4`
    - Update Chart.js options for reduced font sizes and padding
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 7.4_
  
  - [ ] 2.3 Apply compact classes to page structure in AdminDashboard.tsx
    - Add `dashboard-header` class to header section
    - Update heading from `text-3xl` to `text-2xl`
    - Update subtitle from `text-sm` to `text-xs`
    - Add `dashboard-content` class to main content wrapper
    - Add `dashboard-section` class to major sections
    - Reduce gaps from `gap-6` to `gap-4`
    - Reduce margins from `mb-6` to `mb-4`
    - _Requirements: 3.1, 3.2, 3.3, 5.2, 5.3, 5.4_
  
  - [ ] 2.4 Apply compact classes to lists in AdminDashboard.tsx
    - Add `dashboard-list-item` class to recent activity list items
    - Update padding from `p-6` to `p-3`
    - Update margins from `mb-3` to `mb-2`
    - _Requirements: 4.2, 4.3_

- [ ] 3. Update Executive Analytics Dashboard with compact classes
  - [ ] 3.1 Apply compact classes to stat cards in analytics page
    - Add `dashboard-stat-card` class to performance stat cards
    - Update icon sizes from `w-6 h-6` to `w-5 h-5` for consistency
    - Update metric value font sizes from `text-2xl` to `text-xl`
    - Update padding from `p-6` to `p-4`
    - _Requirements: 1.2, 1.3, 1.4, 1.5_
  
  - [ ] 3.2 Apply compact classes to charts in analytics page
    - Add `dashboard-chart-container` class to all chart containers
    - Update Chart.js options in chartOptions, pieChartOptions, and radarChartOptions
    - Reduce font sizes in legend, tooltip, and axis labels
    - Reduce padding in layout configuration
    - Update point radius and hover radius for line charts
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 7.4_
  
  - [ ] 3.3 Apply compact classes to page structure in analytics page
    - Add `dashboard-header` class to page header
    - Update heading from `text-2xl` to `text-xl`
    - Add `dashboard-content` class to main content area
    - Reduce grid gaps from `gap-6` to `gap-4`
    - Reduce section margins from `mb-6` to `mb-4`
    - _Requirements: 3.1, 3.2, 5.2, 5.3, 5.4_

- [ ] 4. Update shared StatBox component
  - Update padding from `p-4` to `p-3`
  - Update title font size from `text-xs` to maintain at `text-xs` (already compact)
  - Update value font size from `text-2xl` to `text-xl`
  - Update icon size from `text-3xl` to `text-2xl`
  - Add `dashboard-stat-card` class to container
  - _Requirements: 1.2, 1.3, 1.4_

- [ ] 5. Update shared DashboardHeader component
  - Add `dashboard-header` class to main container
  - Update greeting heading from `text-xl` to `text-lg`
  - Update date/time text from `text-sm` to `text-xs`
  - Reduce padding from `py-4` to `py-3`
  - Update "Last updated" indicator padding from `px-4 py-3` to `px-3 py-2`
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 6. Update EnhancedDailyVisitorsChart component
  - Add `dashboard-chart-container` class to main container
  - Update chart height prop default from 480 to 360
  - Reduce internal padding from `p-6` to `p-4`
  - Update Chart.js options for compact display
  - Reduce font sizes in legend and axes
  - Adjust point sizes and hover effects
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 7.4_

- [ ] 7. Update remaining dashboard pages with compact classes
  - [ ] 7.1 Update Executive Dashboard (ExecutiveDashboard.tsx)
    - Apply all compact classes to stat cards, charts, headers, and content areas
    - Update grid gaps and section margins
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.4, 3.1, 3.2, 5.1, 5.2, 5.3, 5.4_
  
  - [ ] 7.2 Update Sales Executive Dashboard pages
    - Apply compact classes to overview page
    - Apply compact classes to quotations page
    - Update stat cards, tables, and forms
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 5.4, 6.1, 6.2_
  
  - [ ] 7.3 Update Customer Executive Dashboard pages
    - Apply compact classes to visitors page
    - Apply compact classes to profile page
    - Update tables and forms
    - _Requirements: 1.1, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 5.4, 6.1, 6.2_
  
  - [ ] 7.4 Update Admin sub-pages (chats, visitors, quotations, settings)
    - Apply compact classes to all admin sub-pages
    - Update tables with `dashboard-table` class
    - Update forms with `dashboard-form` class
    - Update modals with `dashboard-modal` class
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 6.3_

- [ ] 8. Update table components with compact styles
  - [ ] 8.1 Update VisitorsTable component
    - Add `dashboard-table` class to table element
    - Verify cell padding reduced to `py-2.5`
    - Update header font sizes
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  
  - [ ] 8.2 Update DailyAnalysisTable component
    - Add `dashboard-table` class to table element
    - Reduce cell padding
    - Update font sizes for headers and cells
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 9. Update form and modal components
  - [ ] 9.1 Update quotation forms
    - Add `dashboard-form` class to form containers
    - Add `dashboard-button` class to submit buttons
    - Verify input padding reduced to `py-2`
    - _Requirements: 6.1, 6.2, 6.4_
  
  - [ ] 9.2 Update modal dialogs
    - Add `dashboard-modal` class to modal content containers
    - Reduce padding from `p-6` to `p-4`
    - Update button styles
    - _Requirements: 6.2, 6.3_

- [ ] 10. Verify responsive behavior and accessibility
  - [ ] 10.1 Test responsive breakpoints
    - Test mobile view (< 640px) for single column layout
    - Test tablet view (640px - 1024px) for 2-column grid
    - Test desktop view (> 1024px) for 4-column grid
    - Verify no content overflow at any breakpoint
    - _Requirements: 7.5_
  
  - [ ] 10.2 Verify accessibility standards
    - Check minimum touch target sizes (44x44px)
    - Verify text contrast ratios (4.5:1 minimum)
    - Test keyboard navigation
    - Verify focus indicators visible
    - Test with screen reader
    - _Requirements: 6.4, 7.1, 7.2, 7.3_
  
  - [ ] 10.3 Test chart readability
    - Verify axis labels legible at reduced height
    - Check data point visibility
    - Test with various data volumes
    - Verify minimum font size of 11px maintained
    - _Requirements: 2.2, 7.4_
  
  - [ ] 10.4 Cross-browser testing
    - Test on Chrome (latest)
    - Test on Firefox (latest)
    - Test on Safari (latest)
    - Test on Edge (latest)
    - Test on mobile browsers (iOS Safari, Chrome Mobile)
    - _Requirements: 5.1, 7.5_
