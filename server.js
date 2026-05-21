const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

// Carregar variáveis do arquivo .env se ele existir
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split(/\r?\n/).forEach(line => {
      // Ignorar comentários e linhas vazias
      if (line.trim().startsWith('#') || !line.includes('=')) return;
      const delimiterIndex = line.indexOf('=');
      const key = line.substring(0, delimiterIndex).trim();
      let value = line.substring(delimiterIndex + 1).trim();
      // Remover aspas simples ou duplas
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      
      if (key && !process.env[key]) {
        process.env[key] = value;
      }
    });
  } catch (err) {
    console.error('Erro ao ler o arquivo .env:', err);
  }
}

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
  let safeUrl = req.url.split('?')[0];
  
  // Endpoint de configuração para expor variáveis de ambiente de forma segura para o front-end
  if (safeUrl === '/api/config') {
    res.writeHead(200, { 
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });
    const cleanValue = (val) => {
      if (!val) return '';
      let cleaned = val.trim();
      if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
        cleaned = cleaned.slice(1, -1);
      }
      if (cleaned.startsWith("'") && cleaned.endsWith("'")) {
        cleaned = cleaned.slice(1, -1);
      }
      return cleaned.trim();
    };
    res.end(JSON.stringify({
      domain: cleanValue(process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN),
      accessToken: cleanValue(process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN)
    }));
    return;
  }

  // Tratamento básico para evitar navegação fora da pasta do projeto
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
