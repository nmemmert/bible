const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

app.get('/api/bible/versions', (req, res) => {
  res.json([{ id: 'test', name: 'Test Version' }]);
});

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});