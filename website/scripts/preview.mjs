import http from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
import { brotliCompressSync, gzipSync } from 'node:zlib';
const root = resolve('out');
const port = Number(process.env.PORT || 4174);
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.mp4': 'video/mp4', '.png': 'image/png', '.ico': 'image/x-icon', '.txt': 'text/plain' };
const cache = new Map();
http.createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); } catch { res.writeHead(400); res.end(); return; }
  let file = resolve(root, '.' + pathname);
  if (file !== root && !file.startsWith(root + sep)) { res.writeHead(403); res.end(); return; }
  if (existsSync(file) && statSync(file).isDirectory()) file = resolve(file, 'index.html');
  if (!existsSync(file)) { res.writeHead(404); res.end('Not found'); return; }
  const mime = types[extname(file)] || 'application/octet-stream';
  const encoding = /text|javascript|json|svg/.test(mime) ? (req.headers['accept-encoding']?.includes('br') ? 'br' : req.headers['accept-encoding']?.includes('gzip') ? 'gzip' : '') : '';
  const key = file + encoding + statSync(file).mtimeMs;
  if (!cache.has(key)) { const source = readFileSync(file); cache.set(key, encoding === 'br' ? brotliCompressSync(source) : encoding === 'gzip' ? gzipSync(source) : source); }
  res.setHeader('Content-Type', mime); res.setHeader('Vary', 'Accept-Encoding'); res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', pathname.startsWith('/_next/static/') ? 'public, max-age=31536000, immutable' : /webp|svg/.test(mime) ? 'public, max-age=86400' : 'no-cache');
  if (encoding) res.setHeader('Content-Encoding', encoding);
  res.end(req.method === 'HEAD' ? undefined : cache.get(key));
}).listen(port, '127.0.0.1', () => console.log(`Vision production preview: http://127.0.0.1:${port}`));
