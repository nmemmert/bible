const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8086;

// Middleware
app.use(cors());
app.use(express.json());

app.get('/test', (req, res) => res.json({ok: true}));

app.listen(PORT, () => {
  console.log('Server with just middleware running on', PORT);
});
