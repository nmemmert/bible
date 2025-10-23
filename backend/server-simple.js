const http = require('http');
const url = require('url');

const PORT = process.env.PORT || 3001;

console.log('Creating HTTP server...');

const server = http.createServer();

server.on('request', (req, res) => {
  try {
    console.log(`Request: ${req.method} ${req.url}`);

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    const parsedUrl = url.parse(req.url, true);

    if (req.method === 'GET' && parsedUrl.pathname === '/api/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }));
    } else if (req.method === 'GET' && parsedUrl.pathname === '/api/bible/versions') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify([
        { id: 'kjv', name: 'King James Version', abbreviation: 'KJV' },
        { id: 'esv', name: 'English Standard Version', abbreviation: 'ESV' },
        { id: 'niv', name: 'New International Version', abbreviation: 'NIV' }
      ]));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  } catch (error) {
    console.error('Request handling error:', error);
    try {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error' }));
    } catch (e) {
      console.error('Error sending error response:', e);
    }
  }
});

server.on('listening', () => {
  console.log(`Bible Study Hub API server running on port ${PORT}`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});