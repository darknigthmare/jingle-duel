import { analyzeSamples } from './game-core.js';

self.addEventListener('message', (event) => {
  try {
    const { samples, sampleRate, duration } = event.data || {};
    const profile = analyzeSamples(new Float32Array(samples), sampleRate, duration);
    self.postMessage({ profile });
  } catch (error) {
    self.postMessage({ error: error?.message || 'Analyse audio impossible.' });
  }
});
