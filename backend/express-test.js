const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Simple test route
app.get('/api/test', (req, res) => {
  console.log('Test endpoint called');
  res.json({ message: 'Server is working', timestamp: new Date().toISOString() });
});

// Bible versions route (mock)
app.get('/api/bible/versions', (req, res) => {
  console.log('Versions endpoint called');
  // Make it synchronous
  const versions = [
    { id: 'kjv', name: 'King James Version', abbreviation: 'KJV' },
    { id: 'esv', name: 'English Standard Version', abbreviation: 'ESV' }
  ];
  res.json(versions);
});

app.listen(PORT, () => {
  console.log(`Test Express server running on port ${PORT}`);
}).on('error', (err) => {
  console.error('Server error:', err);
});