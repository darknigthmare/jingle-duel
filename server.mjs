import http from 'node:http';
import { access, readFile, realpath, stat } from 'node:fs/promises';
import { constants } from 'node:fs';
import { dirname, extname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = dirname(fileURLToPath(import.meta.url));
export const distributionRoot = resolve(projectRoot, 'dist');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.webm': 'audio/webm',
  '.m4a': 'audio/mp4'
};

const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "media-src 'self' blob:",
  "worker-src 'self'",
  "manifest-src 'self'",
  "connect-src 'self'",
  "font-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'"
].join('; ');

export const securityHeaders = Object.freeze({
  'Content-Security-Policy': contentSecurityPolicy,
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'credentialless',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Permissions-Policy': 'microphone=(self), camera=(), geolocation=(), payment=(), usb=()',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-Permitted-Cross-Domain-Policies': 'none'
});

function isInsideRoot(root, candidate) {
  const pathFromRoot = relative(root, candidate);
  return pathFromRoot === '' || (
    pathFromRoot !== '..' &&
    !pathFromRoot.startsWith(`..${sep}`) &&
    !isAbsolute(pathFromRoot)
  );
}

function resolveRequestPath(root, requestTarget) {
  const rawPathname = String(requestTarget || '/').split(/[?#]/, 1)[0] || '/';
  const decodedPathname = decodeURIComponent(rawPathname).replaceAll('\\', '/');
  if (decodedPathname.includes('\0')) throw new Error('Invalid path');

  const segments = decodedPathname.split('/').filter(Boolean);
  if (segments.some((segment) => segment === '..' || segment.startsWith('.'))) {
    throw new Error('Forbidden path');
  }

  const filePath = resolve(root, ...(segments.length ? segments : ['index.html']));
  if (!isInsideRoot(root, filePath)) throw new Error('Forbidden path');
  return filePath;
}

async function findStaticFile(root, canonicalRoot, requestTarget) {
  let filePath = resolveRequestPath(root, requestTarget);
  let fileInfo = await stat(filePath);
  if (fileInfo.isDirectory()) {
    filePath = join(filePath, 'index.html');
    fileInfo = await stat(filePath);
  }
  if (!fileInfo.isFile()) throw new Error('Not a file');

  const canonicalFile = await realpath(filePath);
  if (!isInsideRoot(canonicalRoot, canonicalFile)) throw new Error('Forbidden path');
  return canonicalFile;
}

function sendText(response, statusCode, message, extraHeaders = {}) {
  const body = Buffer.from(message, 'utf8');
  response.writeHead(statusCode, {
    ...securityHeaders,
    'Cache-Control': 'no-store',
    'Content-Type': 'text/plain; charset=utf-8',
    'Content-Length': body.byteLength,
    ...extraHeaders
  });
  response.end(body);
}

export function createStaticServer({ publicRoot = distributionRoot } = {}) {
  const root = resolve(publicRoot);
  const canonicalRootPromise = realpath(root);

  return http.createServer(async (request, response) => {
    const method = request.method || 'GET';
    if (method !== 'GET' && method !== 'HEAD') {
      sendText(response, 405, 'Méthode non autorisée', { Allow: 'GET, HEAD' });
      return;
    }

    try {
      const canonicalRoot = await canonicalRootPromise;
      const filePath = await findStaticFile(root, canonicalRoot, request.url || '/');
      const data = await readFile(filePath);
      response.writeHead(200, {
        ...securityHeaders,
        'Cache-Control': 'no-cache',
        'Content-Type': mimeTypes[extname(filePath).toLowerCase()] || 'application/octet-stream',
        'Content-Length': data.byteLength
      });
      response.end(method === 'HEAD' ? undefined : data);
    } catch {
      const body = Buffer.from('Fichier introuvable', 'utf8');
      response.writeHead(404, {
        ...securityHeaders,
        'Cache-Control': 'no-store',
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Length': body.byteLength
      });
      response.end(method === 'HEAD' ? undefined : body);
    }
  });
}

function parsePort(rawPort) {
  const port = Number(rawPort ?? 4173);
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error(`PORT invalide : ${rawPort}`);
  }
  return port;
}

async function startServer() {
  try {
    await access(join(distributionRoot, 'index.html'), constants.R_OK);
  } catch {
    throw new Error('Build statique absent. Exécute « npm run build » avant « npm start ».');
  }

  const host = process.env.HOST?.trim() || '127.0.0.1';
  const port = parsePort(process.env.PORT);
  const server = createStaticServer();
  server.listen(port, host, () => {
    const address = server.address();
    const activePort = typeof address === 'object' && address ? address.port : port;
    const displayHost = host.includes(':') ? `[${host}]` : host;
    console.log(`Jingle Duel est disponible sur http://${displayHost}:${activePort}`);
  });
  server.on('error', (error) => {
    console.error(`Impossible de démarrer Jingle Duel : ${error.message}`);
    process.exitCode = 1;
  });
}

const isMainModule = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMainModule) {
  startServer().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
