const express = require('express');
const cors = require('cors');

console.log('Starting ultra-minimal test server...');

const app = express();
const PORT = 8088;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  console.log('Health endpoint called');
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

const server = app.listen(PORT, '127.0.0.1', () => {
  console.log(`Ultra-minimal server running on port ${PORT}`);
  console.log('Server address:', server.address());
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

server.on('listening', () => {
  console.log('Server is listening');
});

server.on('connection', (socket) => {
  console.log('New connection');
});

server.on('close', () => {
  console.log('Server closed');
});