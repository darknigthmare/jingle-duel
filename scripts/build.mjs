import { createHash } from 'node:crypto';
import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputDirectory = resolve(projectRoot, 'dist');
const serviceWorkerPlaceholder = '__BUILD_REVISION__';

if (dirname(outputDirectory) !== projectRoot) {
  throw new Error('Refusing to clean an unexpected output directory.');
}

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });

const staticFiles = [
  'index.html',
  'app.js',
  'game-core.js',
  'analysis-worker.js',
  'styles.css',
  'manifest.webmanifest',
  'service-worker.js'
];

await Promise.all(staticFiles.map((file) => cp(resolve(projectRoot, file), resolve(outputDirectory, file))));
await cp(resolve(projectRoot, 'assets'), resolve(outputDirectory, 'assets'), { recursive: true });

async function listPublishedFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listPublishedFiles(absolutePath));
    else if (entry.isFile()) files.push(absolutePath);
  }

  return files;
}

function addLength(hash, length) {
  const size = Buffer.allocUnsafe(8);
  size.writeBigUInt64BE(BigInt(length));
  hash.update(size);
}

const publishedFiles = (await listPublishedFiles(outputDirectory))
  .sort((left, right) => {
    const leftPath = relative(outputDirectory, left).replaceAll('\\', '/');
    const rightPath = relative(outputDirectory, right).replaceAll('\\', '/');
    return leftPath < rightPath ? -1 : leftPath > rightPath ? 1 : 0;
  });

const revisionHash = createHash('sha256');
for (const file of publishedFiles) {
  const publishedPath = relative(outputDirectory, file).replaceAll('\\', '/');
  const pathBytes = Buffer.from(publishedPath, 'utf8');
  const contents = await readFile(file);
  addLength(revisionHash, pathBytes.length);
  revisionHash.update(pathBytes);
  addLength(revisionHash, contents.length);
  revisionHash.update(contents);
}

const buildRevision = revisionHash.digest('hex');
const serviceWorkerPath = resolve(outputDirectory, 'service-worker.js');
const serviceWorkerTemplate = await readFile(serviceWorkerPath, 'utf8');
const placeholderCount = serviceWorkerTemplate.split(serviceWorkerPlaceholder).length - 1;

if (placeholderCount !== 1) {
  throw new Error(`Expected exactly one ${serviceWorkerPlaceholder} placeholder in service-worker.js.`);
}

await writeFile(
  serviceWorkerPath,
  serviceWorkerTemplate.replace(serviceWorkerPlaceholder, buildRevision),
  'utf8'
);

console.log(`Built Jingle Duel revision ${buildRevision}.`);
