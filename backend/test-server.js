const http = require('http');

const server = http.createServer((req, res) => {
  console.log('Request received:', req.url);

  try {
    if (req.url === '/api/test') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Server is working' }));
    } else if (req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Server is running');
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  } catch (error) {
    console.error('Error handling request:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
});

const PORT = 5002;
server.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});

server.on('error', (error) => {
  console.error('Server error:', error);
});

server.on('request', (req, res) => {
  console.log('Request event fired');
});