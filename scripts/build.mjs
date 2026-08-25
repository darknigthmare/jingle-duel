import { cp, mkdir, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputDirectory = resolve(projectRoot, 'dist');

if (dirname(outputDirectory) !== projectRoot) {
  throw new Error('Refusing to clean an unexpected output directory.');
}

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });

const staticFiles = [
  'index.html',
  'app.js',
  'styles.css',
  'manifest.webmanifest',
  'service-worker.js'
];

await Promise.all(staticFiles.map((file) => cp(resolve(projectRoot, file), resolve(outputDirectory, file))));
await cp(resolve(projectRoot, 'assets'), resolve(outputDirectory, 'assets'), { recursive: true });

