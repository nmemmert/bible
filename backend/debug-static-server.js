const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8086;

console.log('__dirname:', __dirname);
console.log('public path:', path.join(__dirname, 'public'));

// Serve static files
try {
  app.use(express.static(path.join(__dirname, 'public')));
  console.log('Static middleware added successfully');
} catch (error) {
  console.error('Error adding static middleware:', error);
  process.exit(1);
}

app.get('/test', (req, res) => res.json({ok: true}));

app.listen(PORT, () => {
  console.log('Server with static files running on', PORT);
});
