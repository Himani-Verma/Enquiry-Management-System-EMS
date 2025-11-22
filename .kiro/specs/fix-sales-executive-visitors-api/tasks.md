# Implementation Plan

- [x] 1. Update API endpoint URL in sales executive visitors page


  - Change the API endpoint from `/api/analytics/visitors-management` to `/api/analytics/customer-executive-enquiries-management`
  - Update the fetch URL construction in the `loadVisitors` function
  - _Requirements: 1.1, 1.4_




- [ ] 2. Fix response data handling and mapping
  - [x] 2.1 Update response parsing to use `enquiries` instead of `visitors`


    - Modify the response handling to access `responseData.enquiries` instead of `responseData.visitors`
    - _Requirements: 1.2, 1.5_
  
  - [ ] 2.2 Implement proper data transformation mapping
    - Map `visitorName` to `name` field
    - Map `phoneNumber` to `phone` field  


    - Map `enquiryType` to `source` field


    - Map `assignedAgent` to `agentName` field
    - Map `salesExecutive` to `salesExecutiveName` field
    - Ensure all other fields are properly mapped according to the design specification


    - _Requirements: 1.5_

- [ ] 3. Verify and test the visitor statistics calculation
  - [ ] 3.1 Test visitor count calculations for each source type
    - Verify chatbot, email, calls, and website counts are accurate
    - Test filtering functionality for each source type
    - _Requirements: 2.1, 2.2_
  
  - [ ] 3.2 Test empty state and error handling
    - Verify "No visitors found" message displays when no data is available
    - Test error handling for API failures and authentication issues
    - _Requirements: 2.3, 2.4, 2.5_