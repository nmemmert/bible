const express = require('express');
const path = require('path');
const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.get('/test', (req, res) => res.json({ok: true}));
const server = app.listen(8086, () => {
  console.log('Test server with static files (no catch-all) running on 8086');
});
