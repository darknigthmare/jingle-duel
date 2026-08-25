(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const presets = [
    {
      id: 'arcade-spark',
      kind: 'synth',
      title: 'Arcade Spark',
      subtitle: 'Une montée lumineuse en cinq notes.',
      label: 'ARCADE / ÉLECTRONIQUE',
      monogram: 'AS',
      lineOne: 'ARCADE',
      lineTwo: 'SPARK',
      kicker: 'AUDIO SYSTEM',
      accent: '#60f4ff',
      duration: 2.45,
      notes: [
        { start: 0.18, duration: 0.30, frequency: 293.66, syllable: 'AR' },
        { start: 0.52, duration: 0.30, frequency: 369.99, syllable: 'CADE' },
        { start: 0.86, duration: 0.30, frequency: 440.00, syllable: 'SP' },
        { start: 1.20, duration: 0.38, frequency: 554.37, syllable: 'A' },
        { start: 1.66, duration: 0.62, frequency: 739.99, syllable: 'RK' }
      ]
    },
    {
      id: 'cosmic-bloom',
      kind: 'synth',
      title: 'Cosmic Bloom',
      subtitle: 'Une signature ample, douce et spatiale.',
      label: 'COSMIQUE / CHORAL',
      monogram: 'CB',
      lineOne: 'COSMIC',
      lineTwo: 'BLOOM',
      kicker: 'DEEP SPACE AUDIO',
      accent: '#a67cff',
      duration: 3.05,
      notes: [
        { start: 0.20, duration: 0.48, frequency: 220.00, syllable: 'COS' },
        { start: 0.70, duration: 0.48, frequency: 277.18, syllable: 'MIC' },
        { start: 1.23, duration: 0.55, frequency: 329.63, syllable: 'BLO' },
        { start: 1.82, duration: 0.96, frequency: 493.88, syllable: 'OM' }
      ]
    },
    {
      id: 'retro-pulse',
      kind: 'synth',
      title: 'Retro Pulse',
      subtitle: 'Un motif court, nerveux et syncopé.',
      label: 'RÉTRO / RYTHMIQUE',
      monogram: 'RP',
      lineOne: 'RETRO',
      lineTwo: 'PULSE',
      kicker: 'BOOT SEQUENCE',
      accent: '#ff7fbc',
      duration: 2.15,
      notes: [
        { start: 0.15, duration: 0.22, frequency: 392.00, syllable: 'RE' },
        { start: 0.43, duration: 0.22, frequency: 523.25, syllable: 'TRO' },
        { start: 0.73, duration: 0.42, frequency: 466.16, syllable: 'PU' },
        { start: 1.26, duration: 0.22, frequency: 587.33, syllable: 'L' },
        { start: 1.54, duration: 0.42, frequency: 783.99, syllable: 'SE' }
      ]
    }
  ];

  const difficultySettings = {
    relaxed: { pitchTolerance: 3.2, onsetTolerance: 0.145, durationStrength: 1.55, label: 'Détente' },
    normal: { pitchTolerance: 2.05, onsetTolerance: 0.095, durationStrength: 2.25, label: 'Normal' },
    expert: { pitchTolerance: 1.25, onsetTolerance: 0.06, durationStrength: 3.1, label: 'Expert' }
  };

  const refs = {
    homeScreen: $('#homeScreen'),
    challengeScreen: $('#challengeScreen'),
    challengeGrid: $('#challengeGrid'),
    historySection: $('#historySection'),
    historyList: $('#historyList'),
    headerBest: $('#headerBest'),
    homeButton: $('#homeButton'),
    backHomeButton: $('#backHomeButton'),
    quickStartButton: $('#quickStartButton'),
    openStudioButton: $('#openStudioButton'),
    clearHistoryButton: $('#clearHistoryButton'),
    soundToggle: $('#soundToggle'),
    challengeTitle: $('#challengeTitle'),
    challengeSubtitle: $('#challengeSubtitle'),
    challengeDuration: $('#challengeDuration'),
    performanceStage: $('#performanceStage'),
    animatedWordmark: $('#animatedWordmark'),
    wordmarkKicker: $('#wordmarkKicker'),
    wordmarkLineOne: $('#wordmarkLineOne'),
    wordmarkLineTwo: $('#wordmarkLineTwo'),
    customLogoFrame: $('#customLogoFrame'),
    customLogoImage: $('#customLogoImage'),
    waveformCanvas: $('#waveformCanvas'),
    noteTrack: $('#noteTrack'),
    stageStatus: $('#stageStatus'),
    countdown: $('#countdown'),
    micOrb: $('#micOrb'),
    listenPanel: $('#listenPanel'),
    recordPanel: $('#recordPanel'),
    analysisPanel: $('#analysisPanel'),
    resultPanel: $('#resultPanel'),
    playReferenceButton: $('#playReferenceButton'),
    startAttemptButton: $('#startAttemptButton'),
    stopRecordingButton: $('#stopRecordingButton'),
    recordState: $('#recordState'),
    recordTimer: $('#recordTimer'),
    levelBar: $('#levelBar'),
    totalScore: $('#totalScore'),
    scoreRing: $('#scoreRing'),
    gradeChip: $('#gradeChip'),
    resultTitle: $('#resultTitle'),
    resultMessage: $('#resultMessage'),
    bestResult: $('#bestResult'),
    melodyScore: $('#melodyScore'),
    rhythmScore: $('#rhythmScore'),
    timingScore: $('#timingScore'),
    clarityScore: $('#clarityScore'),
    melodyBar: $('#melodyBar'),
    rhythmBar: $('#rhythmBar'),
    timingBar: $('#timingBar'),
    clarityBar: $('#clarityBar'),
    playAttemptButton: $('#playAttemptButton'),
    compareButton: $('#compareButton'),
    retryButton: $('#retryButton'),
    shareScoreButton: $('#shareScoreButton'),
    studioDialog: $('#studioDialog'),
    studioForm: $('#studioForm'),
    customNameInput: $('#customNameInput'),
    customAudioInput: $('#customAudioInput'),
    customLogoInput: $('#customLogoInput'),
    audioUploadTitle: $('#audioUploadTitle'),
    audioUploadHint: $('#audioUploadHint'),
    logoUploadTitle: $('#logoUploadTitle'),
    createCustomButton: $('#createCustomButton'),
    studioError: $('#studioError'),
    toast: $('#toast')
  };

  const state = {
    audioContext: null,
    currentChallenge: presets[0],
    referenceProfile: null,
    difficulty: 'normal',
    hasListened: false,
    uiMuted: false,
    activeReferenceNodes: [],
    activeTimers: [],
    mediaStream: null,
    mediaRecorder: null,
    analyser: null,
    analyserSource: null,
    animationFrame: 0,
    recordingStartedAt: 0,
    recordingStopTimer: 0,
    recordingCancelled: false,
    liveFrames: [],
    lastLivePitch: null,
    lastPitchSampleAt: 0,
    attemptBlob: null,
    attemptUrl: null,
    attemptAudio: null,
    lastResult: null,
    pendingCustom: null,
    pendingLogoUrl: null,
    customLogoUrl: null,
    toastTimer: 0,
    history: loadHistory()
  };

  function loadHistory() {
    try {
      const parsed = JSON.parse(localStorage.getItem('jingle-duel-history') || '[]');
      return Array.isArray(parsed) ? parsed.slice(0, 12) : [];
    } catch {
      return [];
    }
  }

  function saveHistory() {
    try {
      localStorage.setItem('jingle-duel-history', JSON.stringify(state.history.slice(0, 12)));
    } catch {
      // Storage can be disabled in private contexts; the app remains fully usable.
    }
  }

  function formatDuration(seconds) {
    return `${seconds.toFixed(1).replace('.', ',')} s`;
  }

  function frequencyToMidi(frequency) {
    return 69 + 12 * Math.log2(frequency / 440);
  }

  function percentile(values, ratio) {
    if (!values.length) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const position = clamp(Math.floor((sorted.length - 1) * ratio), 0, sorted.length - 1);
    return sorted[position];
  }

  function median(values) {
    if (!values.length) return null;
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
  }

  function mean(values) {
    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
  }

  function renderChallengeCards() {
    refs.challengeGrid.innerHTML = presets.map((preset) => `
      <button class="challenge-card" type="button" data-challenge="${preset.id}" style="--card-accent:${preset.accent}">
        <div class="card-art">
          <span class="card-play" aria-hidden="true">▶</span>
          <span class="card-monogram">${preset.monogram}</span>
        </div>
        <div class="card-copy">
          <div><small>${preset.label}</small><strong>${preset.title}</strong></div>
          <span class="card-meta">${preset.notes.length} notes · ${formatDuration(preset.duration)}</span>
        </div>
      </button>
    `).join('');

    $$('[data-challenge]', refs.challengeGrid).forEach((button) => {
      button.addEventListener('click', () => {
        const preset = presets.find((item) => item.id === button.dataset.challenge) || presets[0];
        startChallenge(preset);
      });
    });
  }

  function renderHistory() {
    const best = state.history.length ? Math.max(...state.history.map((item) => item.score)) : null;
    refs.headerBest.textContent = best === null ? '—' : best;
    refs.historySection.hidden = state.history.length === 0;
    refs.historyList.innerHTML = state.history.slice(0, 8).map((item) => {
      const date = new Date(item.timestamp);
      const label = Number.isNaN(date.getTime())
        ? ''
        : new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(date);
      return `
        <div class="history-item">
          <div><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.difficulty)} · ${label}</small></div>
          <span class="history-grade">${escapeHtml(item.grade)}</span>
          <span class="history-score">${item.score}</span>
        </div>
      `;
    }).join('');
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function showScreen(screen) {
    [refs.homeScreen, refs.challengeScreen].forEach((item) => item.classList.toggle('active', item === screen));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goHome() {
    stopReference();
    stopAttemptPlayback();
    stopMicrophoneSession();
    showScreen(refs.homeScreen);
    renderHistory();
  }

  function applyAccent(color) {
    document.documentElement.style.setProperty('--accent', color);
  }

  function startChallenge(challenge) {
    stopReference();
    stopAttemptPlayback();
    stopMicrophoneSession();
    state.currentChallenge = challenge;
    state.referenceProfile = challenge.kind === 'synth'
      ? buildPresetProfile(challenge)
      : challenge.profile;
    applyAccent(challenge.accent || '#60f4ff');

    refs.challengeTitle.textContent = challenge.title;
    refs.challengeSubtitle.textContent = challenge.subtitle || 'Ton jingle personnalisé.';
    refs.challengeDuration.textContent = formatDuration(challenge.duration);
    refs.wordmarkKicker.textContent = challenge.kicker || 'CUSTOM AUDIO';
    refs.wordmarkLineOne.textContent = challenge.lineOne || challenge.title.toUpperCase().split(' ')[0] || 'MON';
    refs.wordmarkLineTwo.textContent = challenge.lineTwo || challenge.title.toUpperCase().split(' ').slice(1).join(' ') || 'JINGLE';

    if (challenge.logoUrl) {
      refs.customLogoImage.src = challenge.logoUrl;
      refs.customLogoFrame.hidden = false;
      refs.animatedWordmark.hidden = true;
    } else {
      refs.customLogoFrame.hidden = true;
      refs.animatedWordmark.hidden = false;
    }

    setupNoteTrack(challenge);
    resetChallengeFlow();
    showScreen(refs.challengeScreen);
    requestAnimationFrame(drawReferenceWaveform);
  }

  function resetChallengeFlow() {
    state.hasListened = false;
    state.lastResult = null;
    refs.startAttemptButton.disabled = true;
    refs.playReferenceButton.disabled = false;
    refs.listenPanel.hidden = false;
    refs.recordPanel.hidden = true;
    refs.analysisPanel.hidden = true;
    refs.resultPanel.hidden = true;
    refs.micOrb.hidden = true;
    refs.countdown.hidden = true;
    refs.performanceStage.classList.remove('playing', 'recording');
    refs.stageStatus.textContent = 'Appuie sur « Écouter le jingle »';
    refs.recordTimer.textContent = '0,0 s';
    refs.levelBar.style.width = '0%';
    updateStepper('listen');
  }

  function setupNoteTrack(challenge) {
    const count = challenge.kind === 'synth'
      ? challenge.notes.length
      : clamp(challenge.profile?.onsets?.length || 4, 3, 10);
    refs.noteTrack.innerHTML = Array.from({ length: count }, (_, index) => `<i class="note-dot" data-note="${index}"></i>`).join('');
  }

  function updateStepper(activeStep) {
    const order = ['listen', 'record', 'result'];
    const activeIndex = order.indexOf(activeStep);
    $$('.step').forEach((step) => {
      const index = order.indexOf(step.dataset.step);
      step.classList.toggle('active', index === activeIndex);
      step.classList.toggle('complete', index < activeIndex);
      step.disabled = index > activeIndex;
    });
  }

  async function getAudioContext() {
    if (!state.audioContext) {
      const Context = window.AudioContext || window.webkitAudioContext;
      if (!Context) throw new Error('AudioContext indisponible sur ce navigateur.');
      state.audioContext = new Context();
    }
    if (state.audioContext.state === 'suspended') await state.audioContext.resume();
    return state.audioContext;
  }

  function stopReference() {
    state.activeTimers.forEach((timer) => clearTimeout(timer));
    state.activeTimers = [];
    state.activeReferenceNodes.forEach((node) => {
      try { node.stop?.(); } catch { /* already stopped */ }
      try { node.disconnect?.(); } catch { /* already disconnected */ }
    });
    state.activeReferenceNodes = [];
    refs.performanceStage.classList.remove('playing');
    $$('.note-dot', refs.noteTrack).forEach((dot) => dot.classList.remove('active'));
  }

  function stopAttemptPlayback() {
    if (!state.attemptAudio) return;
    try {
      state.attemptAudio.pause();
      state.attemptAudio.currentTime = 0;
    } catch {
      // Playback may not have loaded metadata yet.
    }
  }

  async function playReference({ markListened = true } = {}) {
    try {
      const context = await getAudioContext();
      stopReference();
      stopAttemptPlayback();
      refs.playReferenceButton.disabled = true;
      refs.startAttemptButton.disabled = true;
      refs.performanceStage.classList.remove('playing');
      void refs.performanceStage.offsetWidth;
      refs.performanceStage.classList.add('playing');
      refs.stageStatus.textContent = 'Écoute de la référence…';

      if (state.currentChallenge.kind === 'synth') {
        playSynthChallenge(context, state.currentChallenge);
      } else {
        playAudioBuffer(context, state.currentChallenge.audioBuffer);
      }
      animateNoteTrack(state.currentChallenge);

      const completionTimer = window.setTimeout(() => {
        refs.performanceStage.classList.remove('playing');
        refs.playReferenceButton.disabled = false;
        if (markListened) {
          state.hasListened = true;
          refs.startAttemptButton.disabled = false;
          refs.stageStatus.textContent = 'À ton tour : reproduis le jingle';
          playUiTone('ready');
        } else {
          refs.stageStatus.textContent = 'Référence terminée';
        }
      }, state.currentChallenge.duration * 1000 + 180);
      state.activeTimers.push(completionTimer);
    } catch (error) {
      refs.playReferenceButton.disabled = false;
      showToast(error.message || 'Impossible de lire le jingle.');
    }
  }

  function playSynthChallenge(context, challenge) {
    const now = context.currentTime + 0.04;
    const master = context.createGain();
    const compressor = context.createDynamicsCompressor();
    master.gain.value = 0.78;
    compressor.threshold.value = -16;
    compressor.knee.value = 16;
    compressor.ratio.value = 4;
    master.connect(compressor).connect(context.destination);
    state.activeReferenceNodes.push(master, compressor);

    scheduleWhoosh(context, master, now, challenge.accent);

    challenge.notes.forEach((note, index) => {
      const start = now + note.start;
      const end = start + note.duration;
      const noteGain = context.createGain();
      noteGain.gain.setValueAtTime(0.0001, start);
      noteGain.gain.exponentialRampToValueAtTime(0.22, start + 0.025);
      noteGain.gain.exponentialRampToValueAtTime(0.12, Math.max(start + 0.04, end - 0.08));
      noteGain.gain.exponentialRampToValueAtTime(0.0001, end);
      noteGain.connect(master);

      const fundamental = context.createOscillator();
      fundamental.type = challenge.id === 'retro-pulse' ? 'square' : 'sine';
      fundamental.frequency.setValueAtTime(note.frequency, start);
      fundamental.detune.setValueAtTime(index % 2 ? 2 : -2, start);
      fundamental.connect(noteGain);
      fundamental.start(start);
      fundamental.stop(end + 0.02);

      const harmonicGain = context.createGain();
      harmonicGain.gain.value = challenge.id === 'cosmic-bloom' ? 0.24 : 0.16;
      const harmonic = context.createOscillator();
      harmonic.type = 'triangle';
      harmonic.frequency.setValueAtTime(note.frequency * 2, start);
      harmonic.connect(harmonicGain).connect(noteGain);
      harmonic.start(start);
      harmonic.stop(end + 0.02);

      const subGain = context.createGain();
      subGain.gain.value = challenge.id === 'cosmic-bloom' ? 0.28 : 0.11;
      const sub = context.createOscillator();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(note.frequency / 2, start);
      sub.connect(subGain).connect(noteGain);
      sub.start(start);
      sub.stop(end + 0.02);

      state.activeReferenceNodes.push(noteGain, fundamental, harmonicGain, harmonic, subGain, sub);
    });

    const finalNote = challenge.notes.at(-1);
    if (finalNote) scheduleSparkle(context, master, now + finalNote.start + finalNote.duration - 0.04, finalNote.frequency);
  }

  function scheduleWhoosh(context, destination, startTime) {
    const length = Math.floor(context.sampleRate * 0.36);
    const buffer = context.createBuffer(1, length, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) {
      const progress = i / length;
      data[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * progress) * 0.23;
    }
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    filter.type = 'bandpass';
    filter.Q.value = 1.8;
    filter.frequency.setValueAtTime(250, startTime);
    filter.frequency.exponentialRampToValueAtTime(4200, startTime + 0.34);
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(0.3, startTime + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.36);
    source.buffer = buffer;
    source.connect(filter).connect(gain).connect(destination);
    source.start(startTime);
    source.stop(startTime + 0.38);
    state.activeReferenceNodes.push(source, filter, gain);
  }

  function scheduleSparkle(context, destination, startTime, baseFrequency) {
    [1, 1.5, 2].forEach((ratio, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = startTime + index * 0.035;
      oscillator.type = 'sine';
      oscillator.frequency.value = baseFrequency * ratio;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.11 / (index + 1), start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.34);
      oscillator.connect(gain).connect(destination);
      oscillator.start(start);
      oscillator.stop(start + 0.36);
      state.activeReferenceNodes.push(oscillator, gain);
    });
  }

  function playAudioBuffer(context, buffer) {
    const source = context.createBufferSource();
    const gain = context.createGain();
    gain.gain.value = 0.88;
    source.buffer = buffer;
    source.connect(gain).connect(context.destination);
    source.start(context.currentTime + 0.03);
    state.activeReferenceNodes.push(source, gain);
  }

  function animateNoteTrack(challenge) {
    const dots = $$('.note-dot', refs.noteTrack);
    if (challenge.kind === 'synth') {
      challenge.notes.forEach((note, index) => {
        const on = window.setTimeout(() => dots[index]?.classList.add('active'), note.start * 1000);
        const off = window.setTimeout(() => dots[index]?.classList.remove('active'), (note.start + note.duration) * 1000);
        state.activeTimers.push(on, off);
      });
      return;
    }

    const onsets = challenge.profile?.onsets?.length
      ? challenge.profile.onsets.slice(0, dots.length)
      : dots.map((_, index) => index / dots.length);
    onsets.forEach((onset, index) => {
      const on = window.setTimeout(() => dots[index]?.classList.add('active'), onset * challenge.duration * 1000);
      const off = window.setTimeout(() => dots[index]?.classList.remove('active'), (onset * challenge.duration + 0.24) * 1000);
      state.activeTimers.push(on, off);
    });
  }

  async function playUiTone(type = 'tap') {
    if (state.uiMuted) return;
    try {
      const context = await getAudioContext();
      const now = context.currentTime;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = type === 'ready' ? 660 : type === 'success' ? 523.25 : 440;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(type === 'success' ? 0.08 : 0.045, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + (type === 'success' ? 0.22 : 0.08));
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.24);
    } catch {
      // Interface sounds are optional.
    }
  }

  function buildPresetProfile(challenge) {
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

  async function startAttempt() {
    if (!state.hasListened) return;
    stopReference();
    refs.startAttemptButton.disabled = true;
    refs.playReferenceButton.disabled = true;
    refs.listenPanel.hidden = true;
    refs.recordPanel.hidden = false;
    refs.analysisPanel.hidden = true;
    refs.resultPanel.hidden = true;
    refs.recordState.textContent = 'Autorisation micro';
    updateStepper('record');

    try {
      await prepareMicrophone();
      await runCountdown();
      await beginRecording();
    } catch (error) {
      stopMicrophoneSession();
      refs.listenPanel.hidden = false;
      refs.recordPanel.hidden = true;
      refs.startAttemptButton.disabled = false;
      refs.playReferenceButton.disabled = false;
      updateStepper('listen');
      const message = error?.name === 'NotAllowedError'
        ? 'Accès au micro refusé. Autorise-le dans les réglages du navigateur puis réessaie.'
        : (error.message || 'Le microphone ne peut pas être utilisé.');
      showToast(message, 5200);
      refs.stageStatus.textContent = 'Microphone indisponible';
    }
  }

  async function prepareMicrophone() {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('Ce navigateur ne prend pas en charge l’accès au microphone.');
    }
    if (!window.MediaRecorder) {
      throw new Error('L’enregistrement audio n’est pas pris en charge par ce navigateur.');
    }

    state.mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        channelCount: 1
      },
      video: false
    });
    const context = await getAudioContext();
    state.analyser = context.createAnalyser();
    state.analyser.fftSize = 2048;
    state.analyser.smoothingTimeConstant = 0.25;
    state.analyserSource = context.createMediaStreamSource(state.mediaStream);
    state.analyserSource.connect(state.analyser);
  }

  async function runCountdown() {
    refs.countdown.hidden = false;
    refs.micOrb.hidden = true;
    refs.stageStatus.textContent = 'Prépare-toi…';
    const values = ['3', '2', '1', 'GO'];
    for (const value of values) {
      refs.countdown.textContent = value;
      refs.countdown.classList.remove('pop');
      void refs.countdown.offsetWidth;
      refs.countdown.classList.add('pop');
      playUiTone(value === 'GO' ? 'ready' : 'tap');
      await sleep(value === 'GO' ? 620 : 760);
    }
    refs.countdown.hidden = true;
  }

  function preferredMimeType() {
    const options = [
      'audio/webm;codecs=opus',
      'audio/mp4',
      'audio/webm',
      'audio/ogg;codecs=opus'
    ];
    return options.find((type) => MediaRecorder.isTypeSupported?.(type)) || '';
  }

  async function beginRecording() {
    const mimeType = preferredMimeType();
    const recorderOptions = mimeType ? { mimeType, audioBitsPerSecond: 128000 } : undefined;
    const chunks = [];
    state.liveFrames = [];
    state.recordingCancelled = false;
    state.lastLivePitch = null;
    state.lastPitchSampleAt = 0;
    state.mediaRecorder = new MediaRecorder(state.mediaStream, recorderOptions);
    state.mediaRecorder.addEventListener('dataavailable', (event) => {
      if (event.data?.size) chunks.push(event.data);
    });
    state.mediaRecorder.addEventListener('stop', async () => {
      if (state.recordingCancelled) {
        state.recordingCancelled = false;
        return;
      }
      const type = state.mediaRecorder?.mimeType || mimeType || 'audio/webm';
      state.attemptBlob = new Blob(chunks, { type });
      await handleRecordingComplete();
    }, { once: true });

    state.recordingStartedAt = performance.now();
    state.mediaRecorder.start(120);
    refs.recordState.textContent = 'Enregistrement';
    refs.stopRecordingButton.disabled = false;
    refs.micOrb.hidden = false;
    refs.performanceStage.classList.add('recording');
    refs.stageStatus.textContent = 'Reproduis le jingle maintenant';
    monitorMicrophone();

    const maxDuration = clamp(state.currentChallenge.duration + 1.25, 2.0, 9.2);
    state.recordingStopTimer = window.setTimeout(() => stopRecording(), maxDuration * 1000);
  }

  function monitorMicrophone() {
    if (!state.analyser || !state.recordingStartedAt) return;
    const buffer = new Float32Array(state.analyser.fftSize);

    const frame = () => {
      if (!state.mediaRecorder || state.mediaRecorder.state !== 'recording') return;
      state.analyser.getFloatTimeDomainData(buffer);
      const now = performance.now();
      const elapsed = (now - state.recordingStartedAt) / 1000;
      let sum = 0;
      let clipped = 0;
      for (let index = 0; index < buffer.length; index += 1) {
        const value = buffer[index];
        sum += value * value;
        if (Math.abs(value) > 0.985) clipped += 1;
      }
      const rms = Math.sqrt(sum / buffer.length);
      let pitch = state.lastLivePitch;
      if (now - state.lastPitchSampleAt > 75) {
        const downsampled = new Float32Array(Math.floor(buffer.length / 4));
        for (let index = 0; index < downsampled.length; index += 1) {
          downsampled[index] = (buffer[index * 4] + buffer[index * 4 + 1] + buffer[index * 4 + 2] + buffer[index * 4 + 3]) / 4;
        }
        pitch = detectPitch(downsampled, state.audioContext.sampleRate / 4, rms);
        state.lastLivePitch = pitch;
        state.lastPitchSampleAt = now;
      }

      state.liveFrames.push({ time: elapsed, rms, pitch, clipping: clipped / buffer.length });
      const level = clamp(Math.pow(rms * 5.5, 0.72) * 100, 0, 100);
      refs.levelBar.style.width = `${level}%`;
      refs.recordTimer.textContent = formatDuration(elapsed);
      refs.micOrb.style.setProperty('--mic-scale', String(1 + clamp(rms * 2.8, 0, 0.32)));
      state.animationFrame = requestAnimationFrame(frame);
    };

    state.animationFrame = requestAnimationFrame(frame);
  }

  function stopRecording() {
    if (!state.mediaRecorder || state.mediaRecorder.state !== 'recording') return;
    clearTimeout(state.recordingStopTimer);
    cancelAnimationFrame(state.animationFrame);
    refs.stopRecordingButton.disabled = true;
    refs.recordState.textContent = 'Terminé';
    refs.micOrb.hidden = true;
    refs.performanceStage.classList.remove('recording');
    state.mediaRecorder.stop();
  }

  async function handleRecordingComplete() {
    const liveDuration = Math.max(0.01, (performance.now() - state.recordingStartedAt) / 1000);
    refs.recordPanel.hidden = true;
    refs.analysisPanel.hidden = false;
    refs.stageStatus.textContent = 'Analyse de la performance…';
    stopMicrophoneTracksOnly();

    if (state.attemptUrl) URL.revokeObjectURL(state.attemptUrl);
    state.attemptUrl = URL.createObjectURL(state.attemptBlob);
    state.attemptAudio = new Audio(state.attemptUrl);

    let recordingProfile;
    try {
      const context = await getAudioContext();
      const arrayBuffer = await state.attemptBlob.arrayBuffer();
      const decoded = await context.decodeAudioData(arrayBuffer.slice(0));
      recordingProfile = await extractProfileFromAudioBuffer(decoded);
    } catch {
      recordingProfile = buildProfileFromFrames(state.liveFrames, liveDuration);
    }

    await sleep(420);
    const result = compareProfiles(state.referenceProfile, recordingProfile, state.difficulty);
    showResult(result);
  }

  function stopMicrophoneTracksOnly() {
    try { state.analyserSource?.disconnect(); } catch { /* no-op */ }
    state.mediaStream?.getTracks().forEach((track) => track.stop());
    state.mediaStream = null;
    state.analyser = null;
    state.analyserSource = null;
    state.recordingStartedAt = 0;
  }

  function stopMicrophoneSession() {
    clearTimeout(state.recordingStopTimer);
    cancelAnimationFrame(state.animationFrame);
    if (state.mediaRecorder?.state === 'recording') {
      state.recordingCancelled = true;
      try { state.mediaRecorder.stop(); } catch { /* no-op */ }
    }
    stopMicrophoneTracksOnly();
    state.mediaRecorder = null;
  }

  async function extractProfileFromAudioBuffer(buffer) {
    await sleep(0);
    const targetRate = 11025;
    const mono = mixToMono(buffer);
    const samples = resampleLinear(mono, buffer.sampleRate, targetRate);
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
      if (frames.length % 60 === 0) await sleep(0);
    }

    return buildProfileFromFrames(frames, buffer.duration);
  }

  function mixToMono(buffer) {
    const length = buffer.length;
    const output = new Float32Array(length);
    for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
      const data = buffer.getChannelData(channel);
      for (let index = 0; index < length; index += 1) output[index] += data[index] / buffer.numberOfChannels;
    }
    return output;
  }

  function resampleLinear(input, sourceRate, targetRate) {
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

  function detectPitch(frame, sampleRate, knownRms = null) {
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

  function buildProfileFromFrames(frames, fullDuration) {
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

  function findSustainedIndex(mask, required, reverse) {
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

  function smoothArrayInPlace(values, radius = 1) {
    const source = [...values];
    for (let index = 0; index < values.length; index += 1) {
      const from = Math.max(0, index - radius);
      const to = Math.min(values.length, index + radius + 1);
      values[index] = mean(source.slice(from, to));
    }
  }

  function fillShortPitchGaps(values, maxGap) {
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

  function detectOnsets(envelope) {
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

  function compareProfiles(reference, recording, difficultyName) {
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

  function findBestEnvelopeAlignment(reference, recording) {
    let best = { shift: 0, score: -Infinity };
    for (let shift = -6; shift <= 6; shift += 1) {
      const shifted = shiftArray(recording, shift, 0);
      const score = pearson(reference, shifted) - Math.abs(shift) * 0.008;
      if (score > best.score) best = { shift, score };
    }
    return best;
  }

  function shiftArray(values, shift, fill) {
    return values.map((_, index) => {
      const sourceIndex = index - shift;
      return sourceIndex >= 0 && sourceIndex < values.length ? values[sourceIndex] : fill;
    });
  }

  function pearson(a, b) {
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

  function compareOnsets(referenceOnsets, recordingOnsets, tolerance) {
    if (!referenceOnsets.length && !recordingOnsets.length) return 1;
    if (!referenceOnsets.length || !recordingOnsets.length) return 0.28;
    const referenceErrors = referenceOnsets.map((onset) => Math.min(...recordingOnsets.map((other) => Math.abs(onset - other))));
    const recordingErrors = recordingOnsets.map((onset) => Math.min(...referenceOnsets.map((other) => Math.abs(onset - other))));
    const symmetricError = mean([...referenceErrors, ...recordingErrors]);
    const countPenalty = Math.abs(referenceOnsets.length - recordingOnsets.length) / Math.max(referenceOnsets.length, recordingOnsets.length);
    return clamp(Math.exp(-symmetricError / tolerance) * (1 - countPenalty * 0.28), 0, 1);
  }

  function scorePitchContours(referencePitch, recordingPitch, tolerance, voicedRatio) {
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

  function gradeForScore(score) {
    if (score >= 95) return 'S';
    if (score >= 86) return 'A';
    if (score >= 74) return 'B';
    if (score >= 60) return 'C';
    if (score >= 42) return 'D';
    return 'E';
  }

  function resultCopy(result) {
    if (result.noSignal) {
      return {
        title: 'On ne t’a presque pas entendu',
        message: 'Rapproche-toi du micro, vérifie son niveau et recommence après le signal GO.'
      };
    }
    if (result.total >= 95) return { title: 'Signature parfaite !', message: 'La mélodie, le rythme et la durée sont presque identiques. Performance de studio.' };
    if (result.total >= 86) return { title: 'Excellente imitation !', message: 'Tu as capté l’identité du jingle avec une très grande précision.' };
    if (result.total >= 74) return { title: 'Très belle imitation !', message: feedbackForLowestMetric(result) };
    if (result.total >= 60) return { title: 'Le jingle est reconnaissable', message: feedbackForLowestMetric(result) };
    if (result.total >= 42) return { title: 'Bonne première prise', message: feedbackForLowestMetric(result) };
    return { title: 'Encore un essai !', message: feedbackForLowestMetric(result) };
  }

  function feedbackForLowestMetric(result) {
    const metrics = [
      ['melody', result.melody], ['rhythm', result.rhythm], ['timing', result.timing], ['clarity', result.clarity]
    ].sort((a, b) => a[1] - b[1]);
    switch (metrics[0][0]) {
      case 'melody': return 'Le rythme tient bien. Concentre-toi maintenant sur la montée et la descente exactes des notes.';
      case 'rhythm': return 'Les hauteurs sont proches. Essaie de mieux respecter les silences et l’espacement entre les sons.';
      case 'timing': return 'Ta version est convaincante, mais sa durée globale peut encore se rapprocher de la référence.';
      default: return 'Le motif est là. Chante un peu plus nettement et à volume régulier, sans saturer le micro.';
    }
  }

  function showResult(result) {
    state.lastResult = result;
    refs.analysisPanel.hidden = true;
    refs.resultPanel.hidden = false;
    refs.listenPanel.hidden = true;
    refs.recordPanel.hidden = true;
    refs.stageStatus.textContent = `Résultat : ${result.total} sur 100`;
    updateStepper('result');

    const priorBest = state.history.length ? Math.max(...state.history.map((item) => item.score)) : -1;
    const isBest = result.total > priorBest;
    const copy = resultCopy(result);
    refs.resultTitle.textContent = copy.title;
    refs.resultMessage.textContent = copy.message;
    refs.gradeChip.textContent = `RANG ${result.grade}`;
    refs.bestResult.hidden = !isBest;

    animateNumber(refs.totalScore, result.total, 850);
    refs.scoreRing.style.setProperty('--score', result.total);
    setMetric('melody', result.melody);
    setMetric('rhythm', result.rhythm);
    setMetric('timing', result.timing);
    setMetric('clarity', result.clarity);

    state.history.unshift({
      title: state.currentChallenge.title,
      score: result.total,
      grade: result.grade,
      difficulty: difficultySettings[state.difficulty].label,
      timestamp: new Date().toISOString()
    });
    state.history = state.history.slice(0, 12);
    saveHistory();
    renderHistory();
    playUiTone(result.total >= 60 ? 'success' : 'tap');
  }

  function setMetric(name, value) {
    const scoreElement = refs[`${name}Score`];
    const barElement = refs[`${name}Bar`];
    scoreElement.textContent = value;
    requestAnimationFrame(() => { barElement.style.width = `${value}%`; });
  }

  function animateNumber(element, target, duration) {
    const start = performance.now();
    const tick = (now) => {
      const progress = clamp((now - start) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = Math.round(target * eased);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  function retryChallenge() {
    stopReference();
    stopAttemptPlayback();
    stopMicrophoneSession();
    refs.resultPanel.hidden = true;
    refs.listenPanel.hidden = false;
    refs.startAttemptButton.disabled = false;
    refs.playReferenceButton.disabled = false;
    refs.stageStatus.textContent = 'Réécoute la référence ou relance ton essai';
    updateStepper('listen');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function playAttempt() {
    if (!state.attemptUrl) return;
    stopReference();
    state.attemptAudio?.pause();
    state.attemptAudio = new Audio(state.attemptUrl);
    state.attemptAudio.play().catch(() => showToast('Impossible de relire cet essai.'));
    refs.stageStatus.textContent = 'Lecture de ton essai…';
    state.attemptAudio.addEventListener('ended', () => {
      refs.stageStatus.textContent = `Résultat : ${state.lastResult?.total ?? 0} sur 100`;
    }, { once: true });
  }

  async function compareAB() {
    if (!state.attemptUrl) return;
    refs.compareButton.disabled = true;
    refs.stageStatus.textContent = 'A : référence';
    await playReference({ markListened: false });
    await sleep(state.currentChallenge.duration * 1000 + 470);
    refs.stageStatus.textContent = 'B : ton essai';
    playAttempt();
    const attemptDuration = state.attemptAudio?.duration;
    await sleep(Number.isFinite(attemptDuration) ? attemptDuration * 1000 + 200 : state.currentChallenge.duration * 1000 + 1000);
    refs.compareButton.disabled = false;
  }

  async function shareScore() {
    if (!state.lastResult) return;
    const text = `J’ai obtenu ${state.lastResult.total}/100 (rang ${state.lastResult.grade}) sur « ${state.currentChallenge.title} » dans Jingle Duel !`;
    try {
      if (navigator.share) await navigator.share({ title: 'Jingle Duel', text });
      else {
        await navigator.clipboard.writeText(text);
        showToast('Score copié dans le presse-papiers.');
      }
    } catch (error) {
      if (error?.name !== 'AbortError') showToast('Le partage n’a pas pu être ouvert.');
    }
  }

  function drawReferenceWaveform() {
    const canvas = refs.waveformCanvas;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    const context = canvas.getContext('2d');
    context.scale(dpr, dpr);
    const width = rect.width;
    const height = rect.height;
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#60f4ff';
    context.clearRect(0, 0, width, height);
    context.strokeStyle = 'rgba(255,255,255,.08)';
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(0, height / 2);
    context.lineTo(width, height / 2);
    context.stroke();

    context.strokeStyle = accent;
    context.lineWidth = 1.4;
    context.shadowColor = accent;
    context.shadowBlur = 10;
    context.beginPath();

    if (state.currentChallenge.kind === 'custom' && state.currentChallenge.audioBuffer) {
      const data = state.currentChallenge.audioBuffer.getChannelData(0);
      const step = Math.max(1, Math.floor(data.length / width));
      for (let x = 0; x < width; x += 1) {
        let min = 1;
        let max = -1;
        const start = Math.floor(x * step);
        const end = Math.min(data.length, start + step);
        for (let index = start; index < end; index += 1) {
          min = Math.min(min, data[index]);
          max = Math.max(max, data[index]);
        }
        const yMin = height / 2 + min * height * 0.32;
        const yMax = height / 2 + max * height * 0.32;
        context.moveTo(x, yMin);
        context.lineTo(x, yMax);
      }
    } else {
      const challenge = state.currentChallenge;
      for (let x = 0; x < width; x += 1) {
        const time = (x / width) * challenge.duration;
        let sample = 0;
        challenge.notes.forEach((note) => {
          if (time < note.start || time > note.start + note.duration) return;
          const local = (time - note.start) / note.duration;
          const envelope = Math.min(clamp(local / 0.08, 0, 1), clamp((1 - local) / 0.15, 0, 1));
          sample += Math.sin(time * note.frequency * 0.085) * envelope * 0.75;
        });
        const y = height / 2 + sample * height * 0.25;
        if (x === 0) context.moveTo(x, y); else context.lineTo(x, y);
      }
    }
    context.stroke();
  }

  function openStudio() {
    state.pendingCustom = null;
    if (state.pendingLogoUrl) URL.revokeObjectURL(state.pendingLogoUrl);
    state.pendingLogoUrl = null;
    refs.customAudioInput.value = '';
    refs.customLogoInput.value = '';
    refs.customNameInput.value = 'Mon Jingle';
    refs.audioUploadTitle.textContent = 'Importer le jingle audio';
    refs.audioUploadHint.textContent = 'WAV, MP3, M4A ou OGG • 0,7 à 8 secondes';
    refs.logoUploadTitle.textContent = 'Ajouter un logo (facultatif)';
    refs.createCustomButton.disabled = true;
    refs.studioError.hidden = true;
    refs.studioDialog.showModal();
  }

  async function handleCustomAudio(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    refs.studioError.hidden = true;
    refs.createCustomButton.disabled = true;
    refs.audioUploadTitle.textContent = 'Analyse du jingle…';
    refs.audioUploadHint.textContent = file.name;

    try {
      if (file.size > 12 * 1024 * 1024) throw new Error('Le fichier audio dépasse 12 Mo.');
      const context = await getAudioContext();
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await context.decodeAudioData(arrayBuffer.slice(0));
      if (audioBuffer.duration < 0.7 || audioBuffer.duration > 8.05) {
        throw new Error('Le jingle doit durer entre 0,7 et 8 secondes.');
      }
      const profile = await extractProfileFromAudioBuffer(audioBuffer);
      if (!profile.signalPresent) throw new Error('Le fichier ne contient pas de signal sonore suffisamment audible.');
      state.pendingCustom = { audioBuffer, profile, fileName: file.name };
      refs.audioUploadTitle.textContent = 'Jingle prêt';
      refs.audioUploadHint.textContent = `${file.name} · ${formatDuration(audioBuffer.duration)}`;
      refs.createCustomButton.disabled = false;
      playUiTone('ready');
    } catch (error) {
      state.pendingCustom = null;
      refs.audioUploadTitle.textContent = 'Importer un autre fichier';
      refs.audioUploadHint.textContent = 'WAV, MP3, M4A ou OGG • 0,7 à 8 secondes';
      refs.studioError.textContent = error.message || 'Ce fichier audio ne peut pas être lu.';
      refs.studioError.hidden = false;
    }
  }

  function handleCustomLogo(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      refs.studioError.textContent = 'Le logo dépasse 4 Mo.';
      refs.studioError.hidden = false;
      event.target.value = '';
      return;
    }
    if (state.pendingLogoUrl) URL.revokeObjectURL(state.pendingLogoUrl);
    state.pendingLogoUrl = URL.createObjectURL(file);
    refs.logoUploadTitle.textContent = `Logo : ${file.name}`;
  }

  function createCustomChallenge() {
    if (!state.pendingCustom) return;
    const title = refs.customNameInput.value.trim() || 'Mon Jingle';
    const words = title.toUpperCase().split(/\s+/).filter(Boolean);
    if (state.customLogoUrl && state.customLogoUrl !== state.pendingLogoUrl) URL.revokeObjectURL(state.customLogoUrl);
    state.customLogoUrl = state.pendingLogoUrl;
    state.pendingLogoUrl = null;

    const challenge = {
      id: `custom-${Date.now()}`,
      kind: 'custom',
      title,
      subtitle: 'Défi personnalisé analysé directement dans ton navigateur.',
      lineOne: words[0] || 'MON',
      lineTwo: words.slice(1).join(' ') || 'JINGLE',
      kicker: 'CUSTOM AUDIO',
      accent: '#68f7ad',
      duration: state.pendingCustom.audioBuffer.duration,
      audioBuffer: state.pendingCustom.audioBuffer,
      profile: state.pendingCustom.profile,
      logoUrl: state.customLogoUrl
    };
    refs.studioDialog.close();
    startChallenge(challenge);
  }

  function showToast(message, duration = 3000) {
    clearTimeout(state.toastTimer);
    refs.toast.textContent = message;
    refs.toast.classList.add('show');
    state.toastTimer = window.setTimeout(() => refs.toast.classList.remove('show'), duration);
  }

  function bindEvents() {
    refs.quickStartButton.addEventListener('click', () => startChallenge(presets[0]));
    refs.openStudioButton.addEventListener('click', openStudio);
    refs.homeButton.addEventListener('click', goHome);
    refs.backHomeButton.addEventListener('click', goHome);
    refs.playReferenceButton.addEventListener('click', () => playReference());
    refs.startAttemptButton.addEventListener('click', startAttempt);
    refs.stopRecordingButton.addEventListener('click', stopRecording);
    refs.retryButton.addEventListener('click', retryChallenge);
    refs.playAttemptButton.addEventListener('click', playAttempt);
    refs.compareButton.addEventListener('click', compareAB);
    refs.shareScoreButton.addEventListener('click', shareScore);
    refs.clearHistoryButton.addEventListener('click', () => {
      state.history = [];
      saveHistory();
      renderHistory();
      showToast('Historique effacé.');
    });
    refs.soundToggle.addEventListener('click', () => {
      state.uiMuted = !state.uiMuted;
      refs.soundToggle.setAttribute('aria-pressed', String(state.uiMuted));
      refs.soundToggle.setAttribute('aria-label', state.uiMuted ? 'Activer les sons de l’interface' : 'Désactiver les sons de l’interface');
      showToast(state.uiMuted ? 'Sons d’interface désactivés' : 'Sons d’interface activés');
    });

    $$('.difficulty-control button').forEach((button) => {
      button.addEventListener('click', () => {
        state.difficulty = button.dataset.difficulty;
        $$('.difficulty-control button').forEach((item) => item.classList.toggle('active', item === button));
        playUiTone('tap');
      });
    });

    refs.customAudioInput.addEventListener('change', handleCustomAudio);
    refs.customLogoInput.addEventListener('change', handleCustomLogo);
    refs.studioForm.addEventListener('submit', (event) => {
      event.preventDefault();
      if (event.submitter?.id === 'createCustomButton') createCustomChallenge();
      else refs.studioDialog.close();
    });

    window.addEventListener('resize', debounce(drawReferenceWaveform, 120));
    window.addEventListener('beforeunload', () => {
      stopMicrophoneSession();
      if (state.attemptUrl) URL.revokeObjectURL(state.attemptUrl);
      if (state.customLogoUrl) URL.revokeObjectURL(state.customLogoUrl);
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && state.mediaRecorder?.state === 'recording') stopRecording();
    });
  }

  function debounce(callback, delay) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = window.setTimeout(() => callback(...args), delay);
    };
  }

  function registerServiceWorker() {
    if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
      navigator.serviceWorker.register('./service-worker.js').catch(() => {});
    }
  }

  function initialize() {
    renderChallengeCards();
    renderHistory();
    bindEvents();
    applyAccent(presets[0].accent);
    state.referenceProfile = buildPresetProfile(presets[0]);
    registerServiceWorker();
  }

  initialize();
})();
