# How to Get PDF of Diagrams

## 🚀 Fastest Method (30 seconds)

1. **Start server:**
   ```bash
   npm run dev
   ```

2. **Open browser:**
   ```
   http://localhost:3000/project-diagrams.html
   ```

3. **Print to PDF:**
   - Press `Ctrl+P` (Windows) or `Cmd+P` (Mac)
   - Select "Save as PDF"
   - Choose "Landscape"
   - Enable "Background graphics"
   - Click "Save"

**Done!** ✅

---

## 📁 What You'll Get

Your PDF will include all 6 diagram sections:

1. ✅ System Architecture
2. ✅ Class Diagram
3. ✅ Sequence Diagrams
4. ✅ Database ER Diagram
5. ✅ Use Case Diagram
6. ✅ User Flow Diagrams

---

## 💡 Alternative: Helper Page

Open this page for guided PDF generation:
```
http://localhost:3000/generate-pdf.html
```

It will show you all available methods with instructions.

---

## 🤖 Automated Method (Optional)

If you want automated PDF generation:

```bash
# Install Puppeteer (one-time, ~300MB)
npm install puppeteer

# Generate PDF
npm run generate:diagrams-pdf
```

PDF will be saved to: `public/Envirocare-EMS-Diagrams.pdf`

---

## 📖 Need More Help?

Read the complete guide: [PDF_GENERATION_GUIDE.md](PDF_GENERATION_GUIDE.md)

---

**That's it! The browser print method is the easiest and works perfectly.** 🎉
