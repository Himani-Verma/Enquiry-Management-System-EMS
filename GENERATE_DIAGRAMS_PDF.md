# Generate Diagrams PDF - Instructions

## Overview

This guide explains how to generate PDF versions of all project diagrams from the interactive HTML page.

## Prerequisites

Make sure you have all dependencies installed:

```bash
npm install
```

This will install Puppeteer (headless Chrome) which is required for PDF generation.

## Method 1: Generate Single PDF with All Diagrams

Generate one PDF file containing all diagram sections:

```bash
npm run generate:diagrams-pdf
```

**Output:**
- File: `public/Envirocare-EMS-Diagrams.pdf`
- Format: A4 Landscape
- Contains: All 6 diagram sections in one file

## Method 2: Generate Individual PDFs

Generate separate PDF files for each diagram section:

```bash
npm run generate:diagrams-pdf-individual
```

**Output:**
- Directory: `public/diagrams-pdf/`
- Files:
  - `System-Architecture.pdf`
  - `Class-Diagram.pdf`
  - `Sequence-Diagrams.pdf`
  - `Database-ER-Diagram.pdf`
  - `Use-Case-Diagram.pdf`
  - `User-Flow-Diagrams.pdf`

## What's Included

### 1. System Architecture
- High-level system components
- API structure
- Database connections
- Hosting infrastructure

### 2. Class Diagram
- Core data models
- Model relationships
- Methods and properties

### 3. Sequence Diagrams
- User authentication flow
- Visitor to lead conversion flow

### 4. Database ER Diagram
- All database collections
- Relationships between entities
- Field types and constraints

### 5. Use Case Diagram
- User roles (Admin, Executive, Sales, Customer)
- Use cases for each role
- System interactions

### 6. User Flow Diagrams
- Visitor journey flowchart
- Admin workflow flowchart

## Troubleshooting

### Issue: Puppeteer Installation Fails

**Solution 1 - Skip Chromium Download:**
```bash
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true npm install puppeteer
```

**Solution 2 - Use System Chrome:**
Update the script to use your system Chrome:
```javascript
browser = await puppeteer.launch({
  headless: 'new',
  executablePath: '/path/to/chrome', // Add your Chrome path
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
```

### Issue: PDF Generation Timeout

**Solution:**
Increase timeout in the script:
```javascript
await page.goto(fileUrl, {
  waitUntil: 'networkidle0',
  timeout: 60000 // Increase to 60 seconds
});
```

### Issue: Diagrams Not Rendering

**Solution:**
Increase wait time for Mermaid:
```javascript
await page.waitForTimeout(5000); // Increase to 5 seconds
```

### Issue: Missing Diagrams in PDF

**Solution:**
Make sure the development server is NOT running when generating PDFs. The script uses the static HTML file directly.

## Manual Alternative

If automated PDF generation doesn't work, you can generate PDFs manually:

### Option 1: Browser Print
1. Start dev server: `npm run dev`
2. Open: `http://localhost:3000/project-diagrams.html`
3. Click each diagram tab
4. Use browser's Print to PDF (Ctrl+P / Cmd+P)
5. Select "Save as PDF"
6. Repeat for each diagram section

### Option 2: Screenshot Tools
1. Use browser extensions like "Full Page Screen Capture"
2. Capture each diagram section
3. Convert images to PDF using online tools

## PDF Settings

The generated PDFs use these settings:

- **Format:** A4
- **Orientation:** Landscape
- **Margins:** 20px all sides
- **Background:** Included (colors and gradients)
- **Scale:** 2x (high resolution)
- **Header:** Project title
- **Footer:** Page numbers

## Customization

### Change PDF Format

Edit the script and modify:
```javascript
await page.pdf({
  format: 'Letter', // Change from 'A4'
  landscape: false,  // Change to portrait
  // ... other options
});
```

### Change Resolution

Modify viewport settings:
```javascript
await page.setViewport({
  width: 1920,           // Increase width
  height: 1080,          // Increase height
  deviceScaleFactor: 3   // Increase scale (higher quality)
});
```

### Add Watermark

Add to PDF options:
```javascript
headerTemplate: `
  <div style="font-size: 10px; width: 100%; text-align: center;">
    <span>CONFIDENTIAL - Envirocare EMS</span>
  </div>
`
```

## File Locations

```
project-root/
├── public/
│   ├── project-diagrams.html          # Source HTML
│   ├── Envirocare-EMS-Diagrams.pdf    # Combined PDF output
│   └── diagrams-pdf/                   # Individual PDFs
│       ├── System-Architecture.pdf
│       ├── Class-Diagram.pdf
│       ├── Sequence-Diagrams.pdf
│       ├── Database-ER-Diagram.pdf
│       ├── Use-Case-Diagram.pdf
│       └── User-Flow-Diagrams.pdf
└── scripts/
    ├── generate-diagrams-pdf.js        # Combined PDF script
    └── generate-diagrams-pdf-individual.js  # Individual PDFs script
```

## Tips

1. **Best Quality:** Use the individual PDF generation for best quality per diagram
2. **Presentation:** Use the combined PDF for presentations and documentation
3. **Sharing:** Individual PDFs are better for sharing specific diagrams
4. **Printing:** Landscape orientation works best for most diagrams

## Next Steps

After generating PDFs:

1. ✅ Review each PDF for quality
2. ✅ Check that all diagrams are visible
3. ✅ Verify text is readable
4. ✅ Add to project documentation
5. ✅ Share with team/stakeholders

## Support

If you encounter issues:

1. Check that all dependencies are installed
2. Ensure the HTML file exists at `public/project-diagrams.html`
3. Try increasing timeout values
4. Check console output for specific errors
5. Use manual browser print as fallback

---

**Last Updated:** November 17, 2025  
**Version:** 1.0  
**Status:** Ready to Use
