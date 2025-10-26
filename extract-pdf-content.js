const fs = require('fs');
const path = require('path');
const extract = require('pdf-text-extract');

async function extractPdfContent(pdfPath) {
  console.log(`Starting extraction of ${path.basename(pdfPath)}...`);
  try {
    const pages = await new Promise((resolve, reject) => {
      extract(pdfPath, (err, pages) => {
        if (err) reject(err);
        else resolve(pages);
      });
    });

    const text = pages.join('\n');
    const wordCount = text.split(/\s+/).length;
    const pageCount = pages.length;

    console.log(`Extracted ${wordCount} words from ${pageCount} pages`);

    return {
      text: text,
      pages: pageCount,
      info: {},
      totalWords: wordCount
    };
  } catch (error) {
    console.error(`Error extracting content from ${pdfPath}:`, error.message);
    return null;
  }
}

async function updatePdfResources() {
  const resourcesPath = path.join(__dirname, 'pdf_resources.json');

  if (!fs.existsSync(resourcesPath)) {
    console.error('pdf_resources.json not found at:', resourcesPath);
    return;
  }

  console.log('Loading pdf_resources.json...');
  const resources = JSON.parse(fs.readFileSync(resourcesPath, 'utf8'));
  console.log(`Found ${resources.length} resources`);

  for (let i = 0; i < resources.length; i++) {
    const resource = resources[i];
    const pdfPath = path.join(__dirname, resource.filename);

    console.log(`\nProcessing ${i + 1}/${resources.length}: ${resource.filename}`);

    if (fs.existsSync(pdfPath)) {
      const content = await extractPdfContent(pdfPath);

      if (content) {
        resource.analysis.extractedText = content.text;
        resource.pages = content.pages;
        resource.analysis.totalWords = content.totalWords;
        resource.analysis.pages = content.pages;
        resource.analysis.info = content.info;
        console.log(`✓ Successfully updated ${resource.filename}`);
      } else {
        console.log(`✗ Failed to extract content from ${resource.filename}`);
      }
    } else {
      console.log(`⚠ PDF file not found: ${pdfPath}`);
    }
  }

  console.log('\nSaving updated pdf_resources.json...');
  fs.writeFileSync(resourcesPath, JSON.stringify(resources, null, 2));
  console.log('✓ Updated pdf_resources.json with extracted content');
}

// Run the extraction
console.log('Starting PDF content extraction...');
updatePdfResources()
  .then(() => console.log('Extraction completed successfully'))
  .catch(error => {
    console.error('Extraction failed:', error);
    process.exit(1);
  });