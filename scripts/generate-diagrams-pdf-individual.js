/**
 * Generate Individual PDFs for Each Diagram
 * This script creates separate PDF files for each diagram section
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function generateIndividualPDFs() {
  console.log('🚀 Starting individual PDF generation...');
  
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
    
    // Create output directory
    const outputDir = path.join(__dirname, '../public/diagrams-pdf');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Array of diagram sections
    const diagramSections = [
      { id: 'system', name: 'System-Architecture', landscape: true },
      { id: 'class', name: 'Class-Diagram', landscape: true },
      { id: 'sequence', name: 'Sequence-Diagrams', landscape: true },
      { id: 'er', name: 'Database-ER-Diagram', landscape: true },
      { id: 'usecase', name: 'Use-Case-Diagram', landscape: true },
      { id: 'flow', name: 'User-Flow-Diagrams', landscape: true }
    ];
    
    console.log('📊 Generating individual PDFs...');
    
    // Generate PDF for each section
    for (const section of diagramSections) {
      console.log(`  ✓ Processing: ${section.name}`);
      
      // Show only this diagram section
      await page.evaluate((sectionId) => {
        const sections = document.querySelectorAll('.diagram-section');
        sections.forEach(s => s.classList.remove('active'));
        document.getElementById(sectionId).classList.add('active');
      }, section.id);
      
      // Wait for diagram to be visible
      await page.waitForTimeout(1500);
      
      // Generate PDF for this section
      const pdfPath = path.join(outputDir, `${section.name}.pdf`);
      await page.pdf({
        path: pdfPath,
        format: 'A4',
        landscape: section.landscape,
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        }
      });
      
      console.log(`    ✅ Saved: ${section.name}.pdf`);
    }
    
    console.log('✅ All individual PDFs generated successfully!');
    console.log(`📁 Location: ${outputDir}`);
    
  } catch (error) {
    console.error('❌ Error generating PDFs:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the script
generateIndividualPDFs()
  .then(() => {
    console.log('🎉 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to generate PDFs:', error);
    process.exit(1);
  });
