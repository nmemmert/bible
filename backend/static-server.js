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

app.listen(PORT, () => {
  console.log('Server with static files running on', PORT);
});
