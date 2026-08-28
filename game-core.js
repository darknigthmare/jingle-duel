export const difficultySettings = Object.freeze({
  relaxed: Object.freeze({ pitchTolerance: 3.2, onsetTolerance: 0.145, durationStrength: 1.55, label: 'Détente' }),
  normal: Object.freeze({ pitchTolerance: 2.05, onsetTolerance: 0.095, durationStrength: 2.25, label: 'Normal' }),
  expert: Object.freeze({ pitchTolerance: 1.25, onsetTolerance: 0.06, durationStrength: 3.1, label: 'Expert' })
});

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function frequencyToMidi(frequency) {
  return 69 + 12 * Math.log2(frequency / 440);
}

export function percentile(values, ratio) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const position = clamp(Math.floor((sorted.length - 1) * ratio), 0, sorted.length - 1);
  return sorted[position];
}

export function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

export function mean(values) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

export function buildPresetProfile(challenge) {
  const bins = 96;
  const envelope = Array(bins).fill(0);
  const pitch = Array(bins).fill(null);
  const first = challenge.notes[0];
  const last = challenge.notes.at(-1);
  const activeDuration = last.start + last.duration - first.start;
  const onsets = challenge.notes.map((note) => (note.start - first.start) / activeDuration);

  // Recorded performances are trimmed to their active region. Build the
  // reference on the same normalized timeline so a short intro silence does
  // not count as a rhythm error.
  for (let index = 0; index < bins; index += 1) {
    const time = first.start + (index / (bins - 1)) * activeDuration;
    challenge.notes.forEach((note) => {
      if (time < note.start || time > note.start + note.duration) return;
      const local = (time - note.start) / note.duration;
      const attack = clamp(local / 0.12, 0, 1);
      const release = clamp((1 - local) / 0.20, 0, 1);
      envelope[index] = Math.max(envelope[index], Math.min(attack, release));
      pitch[index] = frequencyToMidi(note.frequency);
    });
  }

  return {
    envelope,
    pitch,
    onsets,
    activeDuration,
    fullDuration: challenge.duration,
    peak: 1,
    noiseFloor: 0,
    clippingRatio: 0,
    voicedRatio: 1,
    signalPresent: true
  };
}

export function resampleLinear(input, sourceRate, targetRate) {
  if (sourceRate === targetRate) return input.slice();
  const ratio = sourceRate / targetRate;
  const length = Math.max(1, Math.floor(input.length / ratio));
  const output = new Float32Array(length);
  for (let index = 0; index < length; index += 1) {
    const sourcePosition = index * ratio;
    const low = Math.floor(sourcePosition);
    const high = Math.min(input.length - 1, low + 1);
    const mix = sourcePosition - low;
    output[index] = input[low] * (1 - mix) + input[high] * mix;
  }
  return output;
}

export function detectPitch(frame, sampleRate, knownRms = null) {
  const size = frame.length;
  let average = 0;
  let energy = 0;
  for (let index = 0; index < size; index += 1) average += frame[index];
  average /= size;

  const centered = new Float32Array(size);
  for (let index = 0; index < size; index += 1) {
    centered[index] = frame[index] - average;
    energy += centered[index] * centered[index];
  }
  const rms = knownRms ?? Math.sqrt(energy / size);
  if (rms < 0.008) return null;

  const minLag = Math.max(2, Math.floor(sampleRate / 1000));
  const maxLag = Math.min(size - 3, Math.floor(sampleRate / 70));
  let bestLag = -1;
  let bestCorrelation = -1;
  const correlations = new Float32Array(maxLag + 1);

  for (let lag = minLag; lag <= maxLag; lag += 1) {
    let correlation = 0;
    let energyA = 0;
    let energyB = 0;
    const limit = size - lag;
    for (let index = 0; index < limit; index += 2) {
      const a = centered[index];
      const b = centered[index + lag];
      correlation += a * b;
      energyA += a * a;
      energyB += b * b;
    }
    const normalized = correlation / Math.sqrt(energyA * energyB + 1e-12);
    correlations[lag] = normalized;
    if (normalized > bestCorrelation) {
      bestCorrelation = normalized;
      bestLag = lag;
    }
  }

  if (bestLag < 0 || bestCorrelation < 0.43) return null;

  // A periodic signal produces strong peaks at the fundamental period and at
  // each multiple of it. Selecting the absolute maximum can therefore jump
  // one or several octaves downward. Prefer the earliest local peak that is
  // almost as strong as the global maximum.
  const strongPeakThreshold = Math.max(0.52, bestCorrelation * 0.88);
  let selectedLag = bestLag;
  for (let lag = minLag + 1; lag < maxLag; lag += 1) {
    if (
      correlations[lag] >= strongPeakThreshold &&
      correlations[lag] >= correlations[lag - 1] &&
      correlations[lag] >= correlations[lag + 1]
    ) {
      selectedLag = lag;
      break;
    }
  }

  const left = correlations[Math.max(minLag, selectedLag - 1)];
  const center = correlations[selectedLag];
  const right = correlations[Math.min(maxLag, selectedLag + 1)];
  const denominator = 2 * (2 * center - left - right);
  const correction = Math.abs(denominator) > 1e-8 ? (right - left) / denominator : 0;
  const refinedLag = selectedLag + clamp(correction, -0.5, 0.5);
  const frequency = sampleRate / refinedLag;
  return frequency >= 70 && frequency <= 1000 ? frequency : null;
}

export function analyzeSamples(input, sampleRate, fullDuration = input?.length / sampleRate) {
  if (!input || typeof input.length !== 'number') throw new TypeError('Audio samples must be an array-like value.');
  if (!Number.isFinite(sampleRate) || sampleRate <= 0) throw new RangeError('sampleRate must be a positive number.');

  const source = input instanceof Float32Array ? input : Float32Array.from(input);
  const targetRate = 11025;
  const samples = resampleLinear(source, sampleRate, targetRate);
  const frameSize = 1024;
  const hop = 256;
  const frames = [];

  for (let offset = 0; offset + frameSize <= samples.length; offset += hop) {
    const frame = samples.subarray(offset, offset + frameSize);
    let sum = 0;
    let clipped = 0;
    for (let index = 0; index < frame.length; index += 1) {
      const value = frame[index];
      sum += value * value;
      if (Math.abs(value) > 0.985) clipped += 1;
    }
    const rms = Math.sqrt(sum / frame.length);
    const pitch = detectPitch(frame, targetRate, rms);
    frames.push({
      time: offset / targetRate,
      rms,
      pitch,
      clipping: clipped / frame.length
    });
  }

  const duration = Number.isFinite(fullDuration) ? fullDuration : source.length / sampleRate;
  return buildProfileFromFrames(frames, duration);
}

export function buildProfileFromFrames(frames, fullDuration) {
  if (!frames.length) {
    return {
      envelope: Array(96).fill(0), pitch: Array(96).fill(null), onsets: [],
      activeDuration: 0, fullDuration, peak: 0, noiseFloor: 0, clippingRatio: 0,
      voicedRatio: 0, signalPresent: false
    };
  }

  const rmsValues = frames.map((frame) => frame.rms);
  const peak = Math.max(...rmsValues);
  const noiseFloor = percentile(rmsValues, 0.10);
  const adaptiveNoiseThreshold = Math.min(noiseFloor * 2.4, peak * 0.42);
  const threshold = Math.max(0.0075, adaptiveNoiseThreshold, peak * 0.115);
  const activeMask = frames.map((frame) => frame.rms >= threshold);
  const firstIndex = findSustainedIndex(activeMask, 3, false);
  const lastIndex = findSustainedIndex(activeMask, 3, true);
  const signalPresent = peak >= 0.012 && firstIndex !== -1 && lastIndex !== -1 && lastIndex > firstIndex;

  if (!signalPresent) {
    return {
      envelope: Array(96).fill(0), pitch: Array(96).fill(null), onsets: [],
      activeDuration: 0, fullDuration, peak, noiseFloor,
      clippingRatio: mean(frames.map((frame) => frame.clipping || 0)),
      voicedRatio: 0, signalPresent: false
    };
  }

  const activeStart = frames[firstIndex].time;
  const activeEnd = frames[lastIndex].time;
  const activeDuration = Math.max(0.03, activeEnd - activeStart);
  const bins = 96;
  const envelope = Array(bins).fill(0);
  const pitch = Array(bins).fill(null);
  const normalizedFrames = frames.slice(firstIndex, lastIndex + 1).map((frame) => ({
    ...frame,
    position: clamp((frame.time - activeStart) / activeDuration, 0, 1),
    normalizedRms: clamp((frame.rms - noiseFloor) / Math.max(1e-6, peak - noiseFloor), 0, 1)
  }));

  for (let bin = 0; bin < bins; bin += 1) {
    const center = bin / (bins - 1);
    const radius = 0.017;
    let local = normalizedFrames.filter((frame) => Math.abs(frame.position - center) <= radius);
    if (!local.length) {
      local = [normalizedFrames.reduce((closest, frame) => (
        Math.abs(frame.position - center) < Math.abs(closest.position - center) ? frame : closest
      ), normalizedFrames[0])];
    }
    envelope[bin] = mean(local.map((frame) => frame.normalizedRms));
    const midiValues = local
      .map((frame) => frame.pitch ? frequencyToMidi(frame.pitch) : null)
      .filter((value) => Number.isFinite(value));
    pitch[bin] = median(midiValues);
  }

  smoothArrayInPlace(envelope, 2);
  fillShortPitchGaps(pitch, 3);
  const onsets = detectOnsets(envelope);
  const activeFrames = frames.slice(firstIndex, lastIndex + 1);
  const voicedRatio = activeFrames.filter((frame) => frame.pitch).length / activeFrames.length;

  return {
    envelope,
    pitch,
    onsets,
    activeDuration,
    fullDuration,
    peak,
    noiseFloor,
    clippingRatio: mean(activeFrames.map((frame) => frame.clipping || 0)),
    voicedRatio,
    signalPresent: true
  };
}

export function findSustainedIndex(mask, required, reverse) {
  if (!reverse) {
    for (let index = 0; index <= mask.length - required; index += 1) {
      if (mask.slice(index, index + required).every(Boolean)) return index;
    }
    return -1;
  }
  for (let index = mask.length - 1; index >= required - 1; index -= 1) {
    if (mask.slice(index - required + 1, index + 1).every(Boolean)) return index;
  }
  return -1;
}

export function smoothArrayInPlace(values, radius = 1) {
  const source = [...values];
  for (let index = 0; index < values.length; index += 1) {
    const from = Math.max(0, index - radius);
    const to = Math.min(values.length, index + radius + 1);
    values[index] = mean(source.slice(from, to));
  }
}

export function fillShortPitchGaps(values, maxGap) {
  let index = 0;
  while (index < values.length) {
    if (values[index] !== null) { index += 1; continue; }
    const start = index;
    while (index < values.length && values[index] === null) index += 1;
    const end = index - 1;
    const length = end - start + 1;
    const left = start > 0 ? values[start - 1] : null;
    const right = index < values.length ? values[index] : null;
    if (length <= maxGap && left !== null && right !== null) {
      for (let offset = 0; offset < length; offset += 1) {
        values[start + offset] = left + (right - left) * ((offset + 1) / (length + 1));
      }
    }
  }
}

export function detectOnsets(envelope) {
  if (!envelope.length) return [];
  const derivative = envelope.map((value, index) => index === 0 ? value : value - envelope[index - 1]);
  const positive = derivative.filter((value) => value > 0);
  const threshold = Math.max(0.055, percentile(positive, 0.72));
  const candidates = envelope[0] > 0.04 ? [0] : [];
  for (let index = 1; index < derivative.length - 1; index += 1) {
    if (derivative[index] >= threshold && derivative[index] >= derivative[index - 1] && derivative[index] >= derivative[index + 1]) {
      const position = index / (envelope.length - 1);
      if (!candidates.length || position - candidates.at(-1) > 0.075) candidates.push(position);
      else if (derivative[index] > derivative[Math.round(candidates.at(-1) * (envelope.length - 1))]) candidates[candidates.length - 1] = position;
    }
  }
  if (!candidates.length && Math.max(...envelope) > 0.12) candidates.push(0);
  return candidates.slice(0, 12);
}

export function compareProfiles(reference, recording, difficultyName) {
  const settings = difficultySettings[difficultyName] || difficultySettings.normal;
  if (!recording.signalPresent) {
    return { total: 0, melody: 0, rhythm: 0, timing: 0, clarity: 0, grade: 'E', noSignal: true };
  }

  const alignment = findBestEnvelopeAlignment(reference.envelope, recording.envelope);
  const alignedEnvelope = shiftArray(recording.envelope, alignment.shift, 0);
  const alignedPitch = shiftArray(recording.pitch, alignment.shift, null);

  const pearsonValue = pearson(reference.envelope, alignedEnvelope);
  const shapeScore = clamp((pearsonValue + 1) / 2, 0, 1);
  const envelopeError = mean(reference.envelope.map((value, index) => Math.abs(value - alignedEnvelope[index])));
  const envelopeScore = clamp(1 - envelopeError, 0, 1);
  const onsetScore = compareOnsets(reference.onsets, recording.onsets, settings.onsetTolerance);
  const rhythm = Math.round(100 * (shapeScore * 0.36 + envelopeScore * 0.29 + onsetScore * 0.35));

  const melody = scorePitchContours(reference.pitch, alignedPitch, settings.pitchTolerance, recording.voicedRatio);
  const durationRatio = recording.activeDuration / Math.max(reference.activeDuration, 0.05);
  const timing = Math.round(100 * Math.exp(-Math.abs(Math.log(Math.max(0.01, durationRatio))) * settings.durationStrength));

  const snr = recording.peak / Math.max(recording.noiseFloor, 0.001);
  const snrScore = clamp((snr - 1.4) / 8, 0, 1);
  const levelScore = clamp((recording.peak - 0.012) / 0.11, 0, 1);
  const voicedScore = clamp(recording.voicedRatio / 0.62, 0, 1);
  const clippingPenalty = clamp(recording.clippingRatio * 22, 0, 0.72);
  const clarity = Math.round(100 * clamp(snrScore * 0.36 + levelScore * 0.25 + voicedScore * 0.39 - clippingPenalty, 0, 1));

  let total = Math.round(melody * 0.45 + rhythm * 0.29 + timing * 0.16 + clarity * 0.10);
  if (recording.voicedRatio < 0.12) total = Math.min(total, 49);
  const grade = gradeForScore(total);
  return { total, melody, rhythm, timing, clarity, grade, noSignal: false, alignment: alignment.shift };
}

export function findBestEnvelopeAlignment(reference, recording) {
  let best = { shift: 0, score: -Infinity };
  for (let shift = -6; shift <= 6; shift += 1) {
    const shifted = shiftArray(recording, shift, 0);
    const score = pearson(reference, shifted) - Math.abs(shift) * 0.008;
    if (score > best.score) best = { shift, score };
  }
  return best;
}

export function shiftArray(values, shift, fill) {
  return values.map((_, index) => {
    const sourceIndex = index - shift;
    return sourceIndex >= 0 && sourceIndex < values.length ? values[sourceIndex] : fill;
  });
}

export function pearson(a, b) {
  const length = Math.min(a.length, b.length);
  if (!length) return 0;
  const aMean = mean(a.slice(0, length));
  const bMean = mean(b.slice(0, length));
  let numerator = 0;
  let denominatorA = 0;
  let denominatorB = 0;
  for (let index = 0; index < length; index += 1) {
    const da = a[index] - aMean;
    const db = b[index] - bMean;
    numerator += da * db;
    denominatorA += da * da;
    denominatorB += db * db;
  }
  const denominator = Math.sqrt(denominatorA * denominatorB);
  return denominator > 1e-8 ? numerator / denominator : 0;
}

export function compareOnsets(referenceOnsets, recordingOnsets, tolerance) {
  if (!referenceOnsets.length && !recordingOnsets.length) return 1;
  if (!referenceOnsets.length || !recordingOnsets.length) return 0.28;
  const referenceErrors = referenceOnsets.map((onset) => Math.min(...recordingOnsets.map((other) => Math.abs(onset - other))));
  const recordingErrors = recordingOnsets.map((onset) => Math.min(...referenceOnsets.map((other) => Math.abs(onset - other))));
  const symmetricError = mean([...referenceErrors, ...recordingErrors]);
  const countPenalty = Math.abs(referenceOnsets.length - recordingOnsets.length) / Math.max(referenceOnsets.length, recordingOnsets.length);
  return clamp(Math.exp(-symmetricError / tolerance) * (1 - countPenalty * 0.28), 0, 1);
}

export function scorePitchContours(referencePitch, recordingPitch, tolerance, voicedRatio) {
  const pairs = [];
  for (let index = 0; index < Math.min(referencePitch.length, recordingPitch.length); index += 1) {
    if (Number.isFinite(referencePitch[index]) && Number.isFinite(recordingPitch[index])) {
      pairs.push({ reference: referencePitch[index], recording: recordingPitch[index], index });
    }
  }
  if (pairs.length < 6) return Math.round(18 * clamp(voicedRatio / 0.25, 0, 1));

  const offsets = pairs.map((pair) => pair.recording - pair.reference);
  const transposition = median(offsets) || 0;
  const residuals = pairs.map((pair) => Math.abs((pair.recording - transposition) - pair.reference));
  const residualError = percentile(residuals, 0.72);

  const intervalErrors = [];
  for (let index = 1; index < pairs.length; index += 1) {
    if (pairs[index].index - pairs[index - 1].index > 5) continue;
    const referenceInterval = pairs[index].reference - pairs[index - 1].reference;
    const recordingInterval = pairs[index].recording - pairs[index - 1].recording;
    intervalErrors.push(Math.abs(referenceInterval - recordingInterval));
  }
  const intervalError = intervalErrors.length ? percentile(intervalErrors, 0.65) : residualError;
  const combinedError = residualError * 0.72 + intervalError * 0.28;
  const coverage = pairs.length / referencePitch.filter(Number.isFinite).length;
  const base = Math.exp(-combinedError / tolerance);
  return Math.round(100 * clamp(base * (0.66 + clamp(coverage, 0, 1) * 0.34), 0, 1));
}

export function gradeForScore(score) {
  if (score >= 95) return 'S';
  if (score >= 86) return 'A';
  if (score >= 74) return 'B';
  if (score >= 60) return 'C';
  if (score >= 42) return 'D';
  return 'E';
}
