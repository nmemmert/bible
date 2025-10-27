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

// Lexicon API - serve Strong's data
app.get('/api/lexicon', (req, res) => {
  console.log('Lexicon API called');
  const fs = require('fs');
  const path = require('path');
  
  fs.readFile(path.join(__dirname, 'strongs-complete.json'), 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading lexicon file:', err);
      return res.status(500).json({ error: 'Failed to read lexicon file' });
    }
    
    try {
      const lexiconData = JSON.parse(data);
      // Combine greek and hebrew entries into a single entries array
      const entries = [];
      if (lexiconData.greek) entries.push(...lexiconData.greek);
      if (lexiconData.hebrew) entries.push(...lexiconData.hebrew);
      
      console.log(`Lexicon data parsed, ${entries.length} entries, sending response`);
      res.json({ entries });
    } catch (parseError) {
      console.error('Error parsing lexicon JSON:', parseError);
      res.status(500).json({ error: 'Failed to parse lexicon data' });
    }
  });
});

// Individual lexicon entry API
app.get('/api/lexicon/:id', (req, res) => {
  const entryId = req.params.id;
  console.log(`Lexicon entry API called for: ${entryId}`);
  
  if (!entryId || entryId === 'undefined') {
    return res.status(400).json({ error: 'Invalid entry ID' });
  }
  
  const fs = require('fs');
  const path = require('path');
  
  fs.readFile(path.join(__dirname, 'strongs-complete.json'), 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading lexicon file:', err);
      return res.status(500).json({ error: 'Failed to read lexicon file' });
    }
    
    try {
      const lexiconData = JSON.parse(data);
      const strongsNumber = entryId.toUpperCase();
      
      // Search in Greek and Hebrew
      let entry = null;
      if (lexiconData.greek) {
        entry = lexiconData.greek.find(e => e.strongs_number === strongsNumber);
      }
      if (!entry && lexiconData.hebrew) {
        entry = lexiconData.hebrew.find(e => e.strongs_number === strongsNumber);
      }
      
      if (entry) {
        res.json(entry);
      } else {
        res.status(404).json({ error: 'Lexicon entry not found' });
      }
    } catch (parseError) {
      console.error('Error parsing lexicon JSON:', parseError);
      res.status(500).json({ error: 'Failed to parse lexicon data' });
    }
  });
});

// Word Study API - search lexicon by Strong's number
app.get('/api/word-study/:strongs', (req, res) => {
  try {
    const lexiconData = require('./strongs-complete.json');
    const strongsNumber = req.params.strongs.toUpperCase();
    
    // Search in Greek and Hebrew
    let result = null;
    if (lexiconData.greek) {
      result = lexiconData.greek.find(entry => entry.strongs_number === strongsNumber);
    }
    if (!result && lexiconData.hebrew) {
      result = lexiconData.hebrew.find(entry => entry.strongs_number === strongsNumber);
    }
    
    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ error: 'Word not found' });
    }
  } catch (error) {
    console.error('Error in word study:', error);
    res.status(500).json({ error: 'Failed to search lexicon' });
  }
});

// Word Studies API - return all word studies or search
app.get('/api/word-studies', (req, res) => {
  console.log('Word Studies API called');
  const fs = require('fs');
  const path = require('path');
  
  fs.readFile(path.join(__dirname, 'strongs-complete.json'), 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading lexicon file:', err);
      return res.status(500).json({ error: 'Failed to read lexicon file' });
    }
    
    try {
      const lexiconData = JSON.parse(data);
      console.log('Word studies data parsed, sending response');
      res.json(lexiconData);
    } catch (parseError) {
      console.error('Error parsing lexicon JSON:', parseError);
      res.status(500).json({ error: 'Failed to parse lexicon data' });
    }
  });
});

// Notes API
app.get('/api/notes', (req, res) => {
  // Return empty array for now - can be expanded later
  res.json([]);
});

// Bookmarks API
app.get('/api/bookmarks', (req, res) => {
  // Return empty array for now - can be expanded later
  res.json([]);
});

// Highlights API
app.get('/api/highlights', (req, res) => {
  // Return empty array for now - can be expanded later
  res.json([]);
});

// Study Guides API
app.get('/api/study-guides', (req, res) => {
  // Return empty array for now - can be expanded later
  res.json([]);
});

// POST endpoints for creating data
app.post('/api/notes', (req, res) => {
  // For now, just acknowledge the request
  res.json({ success: true, message: 'Note created' });
});

app.post('/api/bookmarks', (req, res) => {
  // For now, just acknowledge the request
  res.json({ success: true, message: 'Bookmark created' });
});

app.post('/api/highlights', (req, res) => {
  // For now, just acknowledge the request
  res.json({ success: true, message: 'Highlight created' });
});

app.post('/api/word-studies', (req, res) => {
  // For now, just acknowledge the request
  res.json({ success: true, message: 'Word study created' });
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