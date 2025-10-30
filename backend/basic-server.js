const express = require('express');
const app = express();
app.get('/test', (req, res) => res.json({ok: true}));
app.listen(8086, () => {
  console.log('Basic server running on 8086');
  // Don't exit
});
