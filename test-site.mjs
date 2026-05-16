import http from 'http';

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'text/html');
  
  if (req.url === '/') {
    res.end(`
      <html>
        <body>
          <h1>Home</h1>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
        </body>
      </html>
    `);
  } else if (req.url === '/about') {
    res.end(`
      <html>
        <body>
          <h1>About</h1>
          <a href="/">Back</a>
        </body>
      </html>
    `);
  } else if (req.url === '/contact') {
    res.end(`
      <html>
        <body>
          <h1>Contact</h1>
          <a href="/">Back</a>
        </body>
      </html>
    `);
  } else if (req.url === '/robots.txt') {
    res.setHeader('Content-Type', 'text/plain');
    res.end('User-agent: *\nDisallow: /admin');
  } else {
    res.statusCode = 404;
    res.end('Not Found');
  }
});

server.listen(4000, () => {
  console.log('Mock Test Site listening at http://localhost:4000');
});
