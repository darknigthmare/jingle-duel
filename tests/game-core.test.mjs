import test from 'node:test';
import assert from 'node:assert/strict';

import {
  analyzeSamples,
  buildPresetProfile,
  compareProfiles,
  detectPitch
} from '../game-core.js';

const SAMPLE_RATE = 11025;

const challenge = {
  duration: 2.35,
  notes: [
    { start: 0.15, duration: 0.32, frequency: 220 },
    { start: 0.55, duration: 0.32, frequency: 277.18 },
    { start: 0.95, duration: 0.38, frequency: 329.63 },
    { start: 1.43, duration: 0.62, frequency: 440 }
  ]
};

function sineWave(frequency, duration, amplitude = 0.35) {
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  for (let index = 0; index < samples.length; index += 1) {
    samples[index] = amplitude * Math.sin(2 * Math.PI * frequency * index / SAMPLE_RATE);
  }
  return samples;
}

function playableProfile(reference, overrides = {}) {
  return {
    ...reference,
    envelope: [...reference.envelope],
    pitch: [...reference.pitch],
    onsets: [...reference.onsets],
    peak: 0.35,
    noiseFloor: 0.001,
    clippingRatio: 0,
    voicedRatio: 1,
    signalPresent: true,
    ...overrides
  };
}

test('detectPitch identifies a deterministic 440 Hz sine wave', () => {
  const frame = sineWave(440, 1024 / SAMPLE_RATE);
  const detected = detectPitch(frame, SAMPLE_RATE);

  assert.notEqual(detected, null);
  assert.ok(Math.abs(detected - 440) < 2, `expected about 440 Hz, got ${detected}`);
});

test('silence has no pitch and analyzeSamples reports no signal', () => {
  const silence = new Float32Array(SAMPLE_RATE);
  const profile = analyzeSamples(silence, SAMPLE_RATE);

  assert.equal(detectPitch(silence.subarray(0, 1024), SAMPLE_RATE), null);
  assert.equal(profile.signalPresent, false);
  assert.equal(profile.activeDuration, 0);
  assert.equal(profile.voicedRatio, 0);
});

test('a missing recording profile produces a zero score', () => {
  const reference = buildPresetProfile(challenge);
  const absent = analyzeSamples(new Float32Array(SAMPLE_RATE), SAMPLE_RATE);
  const result = compareProfiles(reference, absent, 'normal');

  assert.deepEqual(result, {
    total: 0,
    melody: 0,
    rhythm: 0,
    timing: 0,
    clarity: 0,
    grade: 'E',
    noSignal: true
  });
});

test('analyzeSamples builds a voiced profile from deterministic PCM', () => {
  const profile = analyzeSamples(sineWave(440, 1.2), SAMPLE_RATE);
  const voicedPitches = profile.pitch.filter(Number.isFinite);
  const averageMidi = voicedPitches.reduce((sum, value) => sum + value, 0) / voicedPitches.length;

  assert.equal(profile.signalPresent, true);
  assert.ok(profile.voicedRatio > 0.95);
  assert.ok(Math.abs(averageMidi - 69) < 0.12, `expected MIDI 69, got ${averageMidi}`);
});

test('a perfect contour remains perfect after vocal transposition', () => {
  const reference = buildPresetProfile(challenge);
  const transposed = playableProfile(reference, {
    pitch: reference.pitch.map((value) => Number.isFinite(value) ? value + 7 : null)
  });
  const result = compareProfiles(reference, transposed, 'normal');

  assert.equal(result.melody, 100);
  assert.equal(result.rhythm, 100);
  assert.equal(result.timing, 100);
  assert.equal(result.total, 100);
  assert.equal(result.grade, 'S');
});

test('a monotone imitation is penalized despite matching rhythm and duration', () => {
  const reference = buildPresetProfile(challenge);
  const perfect = compareProfiles(reference, playableProfile(reference), 'normal');
  const monotone = playableProfile(reference, {
    pitch: reference.pitch.map((value) => Number.isFinite(value) ? 64 : null)
  });
  const result = compareProfiles(reference, monotone, 'normal');

  assert.ok(result.melody < 35, `expected a strong melody penalty, got ${result.melody}`);
  assert.equal(result.rhythm, 100);
  assert.equal(result.timing, 100);
  assert.ok(result.total < perfect.total - 20);
});

test('duration mismatch is stricter in Expert than in Détente', () => {
  const reference = buildPresetProfile(challenge);
  const longAttempt = playableProfile(reference, {
    activeDuration: reference.activeDuration * 1.35
  });
  const relaxed = compareProfiles(reference, longAttempt, 'relaxed');
  const expert = compareProfiles(reference, longAttempt, 'expert');

  assert.ok(relaxed.timing > expert.timing, `${relaxed.timing} should exceed ${expert.timing}`);
  assert.ok(relaxed.total > expert.total);
});
