const http = require('http');
const https = require('https');
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
  
  // Endpoint de configuração (informa apenas se o Shopify está devidamente configurado, sem expor chaves sensíveis)
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
    const domain = cleanValue(process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN);
    const token = cleanValue(process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN);
    res.end(JSON.stringify({
      configured: !!(domain && token)
    }));
    return;
  }

  // Proxy seguro para o Shopify Storefront API (evita bloqueios de ad-blockers, CORS e expiração no front-end)
  if (safeUrl === '/api/shopify' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body);
        
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

        const domain = cleanValue(process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN);
        const token = cleanValue(process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN);

        if (!domain || !token) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ errors: [{ message: 'Credenciais do Shopify não configuradas no servidor.' }] }));
          return;
        }

        const shopifyUrl = `https://${domain}/api/2024-04/graphql.json`;
        const postData = JSON.stringify({
          query: parsed.query,
          variables: parsed.variables || {}
        });

        const shopifyReq = https.request(shopifyUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': token,
            'Content-Length': Buffer.byteLength(postData)
          }
        }, (shopifyRes) => {
          res.writeHead(shopifyRes.statusCode, {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          });
          shopifyRes.pipe(res);
        });

        shopifyReq.on('error', (err) => {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ errors: [{ message: `Erro ao conectar com Shopify: ${err.message}` }] }));
        });

        shopifyReq.write(postData);
        shopifyReq.end();

      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ errors: [{ message: `Corpo de requisição inválido: ${err.message}` }] }));
      }
    });
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
