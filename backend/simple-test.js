console.log('Starting simple server...');

const http = require('http');

const server = http.createServer((req, res) => {
  console.log('Received request for:', req.url);
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello World\n');
  console.log('Response sent');
});

server.listen(5003, () => {
  console.log('Server listening on port 5003');
});