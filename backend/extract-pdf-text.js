const fs = require('fs');
const path = require('path');
const { default: pdfParse } = require('pdf-parse');

async function extractTextFromPDF(pdfPath, txtPath) {
  try {
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdfParse(dataBuffer);
    fs.writeFileSync(txtPath, data.text);
    console.log(`Extracted text from ${pdfPath} to ${txtPath}`);
  } catch (error) {
    console.error(`Error extracting text from ${pdfPath}:`, error);
  }
}

async function main() {
  const pdfDir = path.join(__dirname, '..');
  const txtDir = __dirname;

  const pdfFiles = [
    'bsb_concordance.pdf',
    'bib.pdf',
    'bgb.pdf',
    'greek_nt.pdf',
    'interlinear.pdf'
  ];

  for (const pdfFile of pdfFiles) {
    const pdfPath = path.join(pdfDir, pdfFile);
    const txtPath = path.join(txtDir, pdfFile.replace('.pdf', '.txt'));

    if (fs.existsSync(pdfPath)) {
      await extractTextFromPDF(pdfPath, txtPath);
    } else {
      console.log(`PDF file not found: ${pdfPath}`);
    }
  }
}

main();