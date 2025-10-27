const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

// Enable CORS
app.use(cors());

// Serve static files from public directory (includes built frontend)
app.use(express.static(path.join(process.cwd(), 'backend', 'public')));

// Load PDF resources at startup
function loadPdfResources() {
  pdfResources = [
    {
      filename: "bsb_concordance.pdf",
      title: "BSB Concordance",
      description: "Concordance resource"
    },
    {
      filename: "bib.pdf", 
      title: "Greek NT",
      description: "Greek New Testament"
    },
    {
      filename: "bgb.pdf",
      title: "Interlinear Bible",
      description: "Interlinear Bible"
    }
  ];
  console.log(`Loaded ${pdfResources.length} PDF resources (static)`);
}

// Search PDF content
// app.use(cors());

// PDF Resources API
app.get('/api/resources', (req, res) => {
  console.log('API endpoint called');
  res.json([
    {
      filename: "bsb_concordance.pdf",
      title: "BSB Concordance",
      description: "Concordance resource"
    },
    {
      filename: "bib.pdf", 
      title: "Greek NT",
      description: "Greek New Testament"
    },
    {
      filename: "bgb.pdf",
      title: "Interlinear Bible",
      description: "Interlinear Bible"
    }
  ]);
});

// Serve PDF files individually
app.get('/resources/:filename', (req, res) => {
  const filename = req.params.filename;
  const allowedFiles = ['bsb_concordance.pdf', 'bib.pdf', 'bgb.pdf'];
  
  if (!allowedFiles.includes(filename)) {
    return res.status(404).json({ error: 'File not found' });
  }
  
    const filePath = path.join(__dirname, '..', filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
  
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
});

// Health check
app.get('/health', (req, res) => {
  res.send('ok');
});

// Catch-all for unknown API routes - return JSON error instead of HTML
app.get('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// SPA fallback - serve index.html for any unmatched routes (for frontend routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'backend', 'public', 'index.html'));
});

console.log('About to start server');
// loadPdfResources();

app.listen(PORT, () => {
  console.log(`Bible Study Hub API server running on port ${PORT}`);
  console.log('Server is listening...');
}).on('error', (err) => {
  console.error('Server startup error:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});