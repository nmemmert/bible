const http = require('http');
const url = require('url');
const BibleLoader = require('./bible-loader');

let bibleLoader = null;
function getBibleLoader() {
  if (!bibleLoader) {
    console.log('Creating BibleLoader...');
    bibleLoader = new BibleLoader();
  }
  return bibleLoader;
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  console.log(`${method} ${path}`);

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  try {
    if (path === '/api/bible/versions' && method === 'GET') {
      const versions = getBibleLoader().getAvailableVersions();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(versions));
    } else if (path === '/api/test' && method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Server working' }));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  } catch (error) {
    console.error('Error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`HTTP server running on port ${PORT}`);
});