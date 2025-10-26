const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

// Enable CORS
app.use(cors());

// Serve static files from public directory (includes built frontend)
app.use(express.static(path.join(__dirname, 'public')));

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

// Root route - serve API info
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Bible Study Hub API</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        h1 { color: #333; }
        ul { list-style-type: none; }
        li { margin: 10px 0; }
        a { color: #0066cc; text-decoration: none; }
        a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <h1>Bible Study Hub API</h1>
      <p>Welcome to the Bible Study Hub API server.</p>
      <h2>Available Endpoints:</h2>
      <ul>
        <li><a href="/api/resources">GET /api/resources</a> - List available PDF resources</li>
        <li><a href="/resources/bsb_concordance.pdf">GET /resources/:filename</a> - Download PDF files</li>
        <li><a href="/health">GET /health</a> - Health check</li>
      </ul>
      <p>Available PDFs: BSB Concordance, Greek NT (bib.pdf), Interlinear Bible (bgb.pdf)</p>
    </body>
    </html>
  `);
});

console.log('About to start server');
// loadPdfResources();

// SPA fallback - serve index.html for any unmatched routes (for frontend routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

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