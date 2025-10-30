// Test with auth middleware
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

// Simple auth middleware
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

app.get('/test', (req, res) => res.json({ok: true}));
app.get('/api/test-auth', requireAuth, (req, res) => res.json({message: 'Auth works'}));

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
  console.log('Server with auth running on', PORT);
});
