# Rate Management System

This system allows you to export rate data from the database to Excel, edit it, and import it back.

## Features

- **Export to Excel**: Download current rate list as an Excel file
- **Edit in Excel**: Modify rates, groups, and test parameters in Excel
- **Import from Excel**: Upload the edited Excel file to update the database
- **Validation**: Comprehensive validation during import with detailed error reporting
- **Batch Operations**: Update existing records and create new ones in a single import

## How to Use

### 1. Access Rate Management
- Log in as an admin user
- Navigate to **Dashboard > Rate Management** from the sidebar

### 2. Export Current Data
- Click **"Export to Excel"** button
- The system will download a file named `rate_list_YYYY-MM-DD.xlsx`
- Open this file in Excel or any spreadsheet application

### 3. Edit the Data
The Excel file contains the following columns:
- **ID**: Unique identifier (keep intact for existing records, leave blank for new records)
- **Serial No**: Auto-generated sequence number
- **Group**: Category or group name (required)
- **Test Parameter (Methods)**: Test name and methods (required)
- **Rate (₹)**: Price in rupees (required, must be numeric)
- **Created At**: Creation date (read-only)
- **Updated At**: Last update date (read-only)

#### Editing Guidelines:
- **To update existing records**: Keep the ID column intact
- **To add new records**: Leave the ID column blank
- **Required fields**: Group, Test Parameter, and Rate must be filled
- **Rate values**: Must be numeric and non-negative

### 4. Import Updated Data
- Save your Excel file after making changes
- Click **"Choose File"** and select your edited Excel file
- Click **"Import from Excel"** button
- Review the import results and any validation errors

## API Endpoints

### Export Rate Data
```
GET /api/rate/export
```
Downloads the current rate list as an Excel file.

### Import Rate Data
```
POST /api/rate/import
```
Uploads and processes an Excel file to update the rate list.

**Request**: Multipart form data with a file field containing the Excel file.

**Response**: JSON with import summary including:
- Total processed records
- Number of updated records
- Number of inserted records
- Validation errors (if any)

## File Structure

```
cms/
├── app/api/rate/
│   ├── export/route.ts          # Export API endpoint
│   └── import/route.ts          # Import API endpoint
├── components/
│   ├── RateListManager.tsx      # Main rate management component
│   └── ui/
│       ├── card.tsx            # Card UI component
│       └── alert.tsx           # Alert UI component
└── app/dashboard/admin/rates/
    └── page.tsx                # Rate management page
```

## Error Handling

The system provides comprehensive error handling:

- **File validation**: Checks for valid Excel file format
- **Data validation**: Validates required fields and data types
- **Database errors**: Handles connection and operation errors
- **User feedback**: Clear error messages and success notifications

## Security

- Only admin users can access rate management
- File uploads are validated for type and content
- Database operations use proper error handling and transactions

## Technical Details

- **Frontend**: React with TypeScript
- **Backend**: Next.js API routes
- **Database**: MongoDB with Mongoose
- **Excel Processing**: XLSX library
- **UI Components**: Custom components with Tailwind CSS

## Troubleshooting

### Common Issues:

1. **"Module not found" errors**: Ensure all dependencies are installed
2. **Database connection errors**: Check MongoDB connection string
3. **File upload errors**: Verify file format is .xlsx or .xls
4. **Import validation errors**: Check Excel file structure and data types

### Support:
For technical issues, check the browser console for detailed error messages.