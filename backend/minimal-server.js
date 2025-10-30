// Temporarily disable all routes to test
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8086;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

app.get('/test', (req, res) => res.json({ok: true}));

// Catch-all handler
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'), (err) => {
    if (err) {
      console.error('Error sending index.html:', err);
      res.status(500).send('Error loading page');
    }
  });
});

app.listen(PORT, () => {
  console.log('Minimal server running on', PORT);
});
