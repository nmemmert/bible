const express = require('express');
const path = require('path');
const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.get('/test', (req, res) => res.json({ok: true}));
app.get('*', (req, res) => {
  console.log('Serving index.html for:', req.url);
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
const server = app.listen(8086, () => {
  console.log('Test server with catch-all running on 8086');
});
