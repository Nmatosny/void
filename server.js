const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

http.createServer((req, res) => {
  // Tratamento básico para evitar navegação fora da pasta do projeto
  let safeUrl = req.url.split('?')[0];
  let filePath = path.join(__dirname, safeUrl === '/' ? 'index.html' : safeUrl);
  
  let extname = path.extname(filePath);
  let contentType = MIME_TYPES[extname] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`Erro no Servidor: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      });
      res.end(content, 'utf-8');
    }
  });
}).listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`VOID CREW — Servidor Local Ativo!`);
  console.log(`Acesse no seu navegador: http://localhost:${PORT}/`);
  console.log(`==================================================\n`);
});
