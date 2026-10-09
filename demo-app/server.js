
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

function start(port) {
  const server = http.createServer((req, res) => {
    const file = req.url.split('?')[0] === '/' ? 'payment.html' : null;
    if (!file) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('Not Found');
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    fs.createReadStream(path.join(__dirname, file)).pipe(res);
  });
  return new Promise((resolve) => server.listen(port, () => resolve(server)));
}

module.exports = { start };

if (require.main === module) {
  const port = Number(process.env.DEMO_APP_PORT || 4173);
  start(port).then(() => console.log(`demo-app em http://localhost:${port}`));
}
