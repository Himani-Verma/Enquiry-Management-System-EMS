# Implementation Plan

- [x] 1. Update QuotationTable component to remove view details functionality


  - Remove Eye icon button and tooltip for view details
  - Remove onView prop from component interface
  - Remove onView callback usage in button click handler
  - Clean up Eye import if no longer used elsewhere in component
  - _Requirements: 1.1, 1.4, 2.2_

- [ ] 2. Update RateListTable component to remove view versions functionality  
  - Remove Eye icon button for view versions
  - Remove onViewVersions prop from component interface
  - Remove onViewVersions callback usage in button click handler
  - Clean up Eye import if no longer used elsewhere in component
  - _Requirements: 1.2, 1.4, 2.2_



- [ ] 3. Update admin quotations dashboard page
  - Remove handleView function implementation
  - Remove onView prop when rendering QuotationTable
  - Remove view mode from modal state management if applicable


  - Clean up any view-related imports or state variables
  - _Requirements: 2.1, 2.3, 2.5_

- [ ] 4. Update executive quotations dashboard page
  - Remove handleView function implementation  


  - Remove onView prop when rendering QuotationTable
  - Remove view mode from modal state management if applicable
  - Clean up any view-related imports or state variables
  - _Requirements: 2.1, 2.3, 2.5_



- [ ] 5. Update sales-executive quotations dashboard page
  - Remove handleView function implementation
  - Remove onView prop when rendering QuotationTable  
  - Remove view mode from modal state management if applicable
  - Clean up any view-related imports or state variables
  - _Requirements: 2.1, 2.3, 2.5_

- [ ] 6. Update customer-executive quotations dashboard page
  - Remove handleView function implementation
  - Remove onView prop when rendering QuotationTable
  - Remove view mode from modal state management if applicable  



  - Clean up any view-related imports or state variables
  - _Requirements: 2.1, 2.3, 2.5_

- [ ] 7. Clean up QuotationFormModal view-related functionality
  - Remove eye icons from modal headers if they're only for view mode display
  - Remove view mode handling from modal component if no longer needed
  - Update modal mode types to exclude 'view' if applicable
  - _Requirements: 1.1, 2.3_

- [ ] 8. Verify and test all dashboard functionality
  - Test quotation tables render correctly without view details buttons
  - Verify edit, delete, and preview buttons still function properly
  - Test rate list tables work without view versions buttons
  - Confirm no console errors or broken references
  - _Requirements: 1.3, 2.4, 2.5_