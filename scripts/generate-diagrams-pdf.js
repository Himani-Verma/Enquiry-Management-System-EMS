/**
 * Generate PDF from Project Diagrams
 * This script captures the diagrams from the HTML page and generates a PDF
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function generateDiagramsPDF() {
  console.log('🚀 Starting PDF generation...');
  
  let browser;
  try {
    // Launch browser
    console.log('📱 Launching browser...');
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set viewport for better rendering
    await page.setViewport({
      width: 1400,
      height: 900,
      deviceScaleFactor: 2
    });
    
    // Get the file path
    const htmlPath = path.join(__dirname, '../public/project-diagrams.html');
    const fileUrl = `file://${htmlPath}`;
    
    console.log('📄 Loading diagrams page...');
    await page.goto(fileUrl, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    
    // Wait for Mermaid to initialize
    console.log('⏳ Waiting for Mermaid diagrams to render...');
    await page.waitForTimeout(3000);
    
    // Array to store all diagram sections
    const diagramSections = [
      { id: 'system', name: 'System Architecture' },
      { id: 'class', name: 'Class Diagram' },
      { id: 'sequence', name: 'Sequence Diagrams' },
      { id: 'er', name: 'Database ER Diagram' },
      { id: 'usecase', name: 'Use Case Diagram' },
      { id: 'flow', name: 'User Flow Diagrams' }
    ];
    
    console.log('📊 Generating PDF with all diagrams...');
    
    // Create PDF with all sections
    const pdfPath = path.join(__dirname, '../public/Envirocare-EMS-Diagrams.pdf');
    
    // Generate PDF by showing each section
    for (let i = 0; i < diagramSections.length; i++) {
      const section = diagramSections[i];
      console.log(`  ✓ Processing: ${section.name}`);
      
      // Click the button to show this diagram
      await page.evaluate((sectionId) => {
        const sections = document.querySelectorAll('.diagram-section');
        sections.forEach(s => s.classList.remove('active'));
        document.getElementById(sectionId).classList.add('active');
      }, section.id);
      
      // Wait for diagram to be visible
      await page.waitForTimeout(1000);
    }
    
    // Reset to first diagram
    await page.evaluate(() => {
      const sections = document.querySelectorAll('.diagram-section');
      sections.forEach(s => s.classList.remove('active'));
      document.getElementById('system').classList.add('active');
    });
    
    await page.waitForTimeout(1000);
    
    // Generate the PDF
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      },
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size: 10px; width: 100%; text-align: center; color: #666;">
          <span>Envirocare EMS - Project Architecture & UML Diagrams</span>
        </div>
      `,
      footerTemplate: `
        <div style="font-size: 10px; width: 100%; text-align: center; color: #666;">
          <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>
      `
    });
    
    console.log('✅ PDF generated successfully!');
    console.log(`📁 Location: ${pdfPath}`);
    
  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the script
generateDiagramsPDF()
  .then(() => {
    console.log('🎉 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to generate PDF:', error);
    process.exit(1);
  });
