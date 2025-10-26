const http = require('http');

const server = http.createServer((req, res) => {
  console.log(`Request: ${req.method} ${req.url}`);

  if (req.url === '/test') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Server is running!');
  } else if (req.url === '/api/resources') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify([
      {
        filename: "bsb_concordance.pdf",
        title: "BSB Concordance",
        description: "Concordance resource"
      },
      {
        filename: "bib.pdf",
        title: "Greek NT",
        description: "Greek New Testament"
      },
      {
        filename: "bgb.pdf",
        title: "Interlinear Bible",
        description: "Interlinear Bible"
      }
    ]));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
});

const PORT = 8080;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
  console.error('Server error:', err);
});