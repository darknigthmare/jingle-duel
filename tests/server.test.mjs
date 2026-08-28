import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import http from 'node:http';
import { setTimeout as delay } from 'node:timers/promises';
import { after, before, test } from 'node:test';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
let serverProcess;
let serverPort;
let serverErrors = '';

function waitForListeningPort(child) {
  return new Promise((resolvePort, reject) => {
    let output = '';
    const timeout = setTimeout(() => {
      reject(new Error(`Le serveur n'a pas démarré à temps. ${serverErrors}`));
    }, 8_000);

    const finish = (callback, value) => {
      clearTimeout(timeout);
      child.stdout.off('data', onData);
      child.off('error', onError);
      child.off('exit', onExit);
      callback(value);
    };
    const onData = (chunk) => {
      output += chunk;
      const match = output.match(/http:\/\/127\.0\.0\.1:(\d+)/);
      if (match) finish(resolvePort, Number(match[1]));
    };
    const onError = (error) => finish(reject, error);
    const onExit = (code) => {
      finish(reject, new Error(`Le serveur s'est arrêté avant écoute (code ${code}). ${serverErrors}`));
    };

    child.stdout.setEncoding('utf8');
    child.stdout.on('data', onData);
    child.once('error', onError);
    child.once('exit', onExit);
  });
}

function request(pathname, { method = 'GET', collectBody = true } = {}) {
  return new Promise((resolveResponse, reject) => {
    const requestHandle = http.request({
      host: '127.0.0.1',
      port: serverPort,
      path: pathname,
      method
    }, (response) => {
      const chunks = [];
      response.on('data', (chunk) => {
        if (collectBody) chunks.push(chunk);
      });
      response.on('end', () => {
        resolveResponse({
          status: response.statusCode,
          headers: response.headers,
          body: collectBody ? Buffer.concat(chunks) : Buffer.alloc(0)
        });
      });
    });
    requestHandle.once('error', reject);
    requestHandle.end();
  });
}

before(async () => {
  serverProcess = spawn(process.execPath, ['server.mjs'], {
    cwd: repositoryRoot,
    env: { ...process.env, HOST: '', PORT: '0' },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true
  });
  serverProcess.stderr.setEncoding('utf8');
  serverProcess.stderr.on('data', (chunk) => {
    serverErrors += chunk;
  });
  serverPort = await waitForListeningPort(serverProcess);
});

after(async () => {
  if (!serverProcess || serverProcess.exitCode !== null) return;
  const exitPromise = once(serverProcess, 'exit');
  serverProcess.kill();
  await Promise.race([exitPromise, delay(2_000)]);
  if (serverProcess.exitCode === null) serverProcess.kill('SIGKILL');
});

test('sert le build statique avec les en-têtes de sécurité requis', async () => {
  const response = await request('/');
  assert.equal(response.status, 200);
  assert.match(response.headers['content-type'], /^text\/html/);
  assert.match(response.body.toString('utf8'), /Jingle Duel/i);

  const csp = response.headers['content-security-policy'];
  assert.match(csp, /script-src 'self'/);
  assert.doesNotMatch(csp, /script-src[^;]*'unsafe-inline'/);
  assert.match(csp, /style-src 'self' 'unsafe-inline'/);
  assert.match(csp, /img-src 'self' blob: data:/);
  assert.match(csp, /media-src 'self' blob:/);
  assert.match(csp, /worker-src 'self'/);
  assert.match(csp, /frame-ancestors 'none'/);
  assert.equal(response.headers['permissions-policy'], 'microphone=(self), camera=(), geolocation=(), payment=(), usb=()');
  assert.equal(response.headers['x-content-type-options'], 'nosniff');
  assert.equal(response.headers['x-frame-options'], 'DENY');
});

test('implémente HEAD sans renvoyer le corps', async () => {
  const getResponse = await request('/app.js');
  const headResponse = await request('/app.js', { method: 'HEAD' });
  assert.equal(getResponse.status, 200);
  assert.equal(headResponse.status, 200);
  assert.equal(headResponse.body.byteLength, 0);
  assert.equal(Number(headResponse.headers['content-length']), getResponse.body.byteLength);
  assert.match(headResponse.headers['content-type'], /^text\/javascript/);
});

test('refuse les méthodes autres que GET et HEAD', async () => {
  const response = await request('/', { method: 'POST' });
  assert.equal(response.status, 405);
  assert.equal(response.headers.allow, 'GET, HEAD');
  assert.equal(response.headers['cache-control'], 'no-store');
});

test('ne sert jamais le dépôt, les dotfiles ou les traversées de chemin', async () => {
  const forbiddenPaths = [
    '/server.mjs',
    '/package.json',
    '/.env.local',
    '/.git/config',
    '/.vercel/project.json',
    '/../package.json',
    '/%2e%2e/package.json',
    '/assets/%2e%2e/%2e%2e/server.mjs',
    '/%2e%2e%5cserver.mjs'
  ];

  for (const pathname of forbiddenPaths) {
    const response = await request(pathname, { collectBody: false });
    assert.equal(response.status, 404, pathname);
    assert.equal(response.headers['x-content-type-options'], 'nosniff', pathname);
  }
});
