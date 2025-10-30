const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8086;

// Serve static files
app.use(express.static('public'));

app.get('/test', (req, res) => res.json({ok: true}));

app.listen(PORT, () => {
  console.log('Server with static (no path) running on', PORT);
});
