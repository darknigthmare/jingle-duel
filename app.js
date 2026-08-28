import {
  analyzeSamples,
  buildPresetProfile,
  buildProfileFromFrames,
  compareProfiles,
  detectPitch,
  gradeForScore
} from './game-core.js';

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
      rival: { name: 'NOVA', base: 70 },
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
      rival: { name: 'ORION', base: 73 },
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
      rival: { name: 'VEX', base: 75 },
      duration: 2.15,
      notes: [
        { start: 0.15, duration: 0.22, frequency: 392.00, syllable: 'RE' },
        { start: 0.43, duration: 0.22, frequency: 523.25, syllable: 'TRO' },
        { start: 0.73, duration: 0.42, frequency: 466.16, syllable: 'PU' },
        { start: 1.26, duration: 0.22, frequency: 587.33, syllable: 'L' },
        { start: 1.54, duration: 0.42, frequency: 783.99, syllable: 'SE' }
      ]
    },
    {
      id: 'neon-strike',
      kind: 'synth',
      title: 'Neon Strike',
      subtitle: 'Deux impacts, une réponse brillante et précise.',
      label: 'NEON / IMPACT',
      monogram: 'NS',
      lineOne: 'NEON',
      lineTwo: 'STRIKE',
      kicker: 'NIGHT FREQUENCY',
      accent: '#79ff9f',
      rival: { name: 'LYRA', base: 78 },
      duration: 2.65,
      notes: [
        { start: 0.16, duration: 0.34, frequency: 261.63, syllable: 'NE' },
        { start: 0.58, duration: 0.24, frequency: 392.00, syllable: 'ON' },
        { start: 1.04, duration: 0.46, frequency: 329.63, syllable: 'STRI' },
        { start: 1.62, duration: 0.72, frequency: 659.25, syllable: 'KE' }
      ]
    },
    {
      id: 'velvet-orbit',
      kind: 'synth',
      title: 'Velvet Orbit',
      subtitle: 'Une boucle chaude qui retombe avec élégance.',
      label: 'SOUL / ORBITAL',
      monogram: 'VO',
      lineOne: 'VELVET',
      lineTwo: 'ORBIT',
      kicker: 'GRAVITY SESSION',
      accent: '#ffb56b',
      rival: { name: 'SOL', base: 80 },
      duration: 3.35,
      notes: [
        { start: 0.18, duration: 0.50, frequency: 349.23, syllable: 'VEL' },
        { start: 0.76, duration: 0.44, frequency: 440.00, syllable: 'VET' },
        { start: 1.30, duration: 0.50, frequency: 523.25, syllable: 'OR' },
        { start: 1.88, duration: 0.42, frequency: 440.00, syllable: 'BI' },
        { start: 2.40, duration: 0.66, frequency: 293.66, syllable: 'T' }
      ]
    },
    {
      id: 'prism-run',
      kind: 'synth',
      title: 'Prism Run',
      subtitle: 'Une course chromatique réservée aux duellistes précis.',
      label: 'PRISM / TECHNIQUE',
      monogram: 'PR',
      lineOne: 'PRISM',
      lineTwo: 'RUN',
      kicker: 'SPECTRUM RACING',
      accent: '#ffe66d',
      rival: { name: 'ECHO', base: 83 },
      duration: 2.95,
      notes: [
        { start: 0.14, duration: 0.24, frequency: 329.63, syllable: 'PRI' },
        { start: 0.43, duration: 0.24, frequency: 392.00, syllable: 'SM' },
        { start: 0.72, duration: 0.24, frequency: 466.16, syllable: 'R' },
        { start: 1.01, duration: 0.24, frequency: 554.37, syllable: 'U' },
        { start: 1.35, duration: 0.36, frequency: 659.25, syllable: 'N' },
        { start: 1.86, duration: 0.78, frequency: 493.88, syllable: '!' }
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
    networkStatus: $('#networkStatus'),
    installButton: $('#installButton'),
    profileLevel: $('#profileLevel'),
    profileLevelLabel: $('#profileLevelLabel'),
    xpTrack: $('#xpTrack'),
    xpBar: $('#xpBar'),
    xpLabel: $('#xpLabel'),
    profileWins: $('#profileWins'),
    profileStreak: $('#profileStreak'),
    profileDuels: $('#profileDuels'),
    profileMasteries: $('#profileMasteries'),
    challengeTitle: $('#challengeTitle'),
    challengeSubtitle: $('#challengeSubtitle'),
    challengeDuration: $('#challengeDuration'),
    rivalName: $('#rivalName'),
    rivalTarget: $('#rivalTarget'),
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
    attemptAudioInput: $('#attemptAudioInput'),
    fileAttemptLabel: $('#fileAttemptLabel'),
    micError: $('#micError'),
    micErrorTitle: $('#micErrorTitle'),
    micErrorMessage: $('#micErrorMessage'),
    stopRecordingButton: $('#stopRecordingButton'),
    recordState: $('#recordState'),
    recordTimer: $('#recordTimer'),
    levelBar: $('#levelBar'),
    totalScore: $('#totalScore'),
    scoreRing: $('#scoreRing'),
    gradeChip: $('#gradeChip'),
    resultTitle: $('#resultTitle'),
    resultMessage: $('#resultMessage'),
    duelOutcome: $('#duelOutcome'),
    xpReward: $('#xpReward'),
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

  const SAVE_KEY = 'jingle-duel-save-v2';
  const persistedSave = loadGameSave();

  const state = {
    audioContext: null,
    currentChallenge: presets[0],
    referenceProfile: null,
    difficulty: persistedSave.preferences.difficulty,
    hasListened: false,
    uiMuted: persistedSave.preferences.uiMuted,
    flowId: 0,
    playbackId: 0,
    importId: 0,
    activeAttempt: null,
    deferredInstallPrompt: null,
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
    history: persistedSave.history,
    profile: persistedSave.profile
  };

  function defaultProfile() {
    return { xp: 0, wins: 0, duels: 0, streak: 0, bests: {} };
  }

  function safeInteger(value, min = 0, max = 10_000_000) {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? clamp(Math.round(numeric), min, max) : min;
  }

  function sanitizeHistoryItem(item) {
    if (!item || typeof item !== 'object') return null;
    const score = Number(item.score);
    if (!Number.isFinite(score)) return null;
    const timestamp = new Date(item.timestamp);
    if (Number.isNaN(timestamp.getTime())) return null;
    const normalizedScore = safeInteger(score, 0, 100);
    const title = String(item.title || 'Jingle').slice(0, 50);
    const migratedPreset = presets.find((preset) => preset.title.toLocaleLowerCase('fr-FR') === title.trim().toLocaleLowerCase('fr-FR'));
    const challengeId = String(item.challengeId || migratedPreset?.id || 'legacy').slice(0, 80);
    const grade = /^[SABCDE]$/.test(String(item.grade || '')) ? String(item.grade) : gradeForScore(normalizedScore);
    const difficultyKey = Object.hasOwn(difficultySettings, item.difficultyKey)
      ? item.difficultyKey
      : Object.entries(difficultySettings).find(([, settings]) => settings.label === item.difficulty)?.[0] || 'normal';
    const metric = (name) => safeInteger(item.metrics?.[name] ?? item[name], 0, 100);
    return {
      title,
      challengeId,
      score: normalizedScore,
      grade,
      difficultyKey,
      difficulty: difficultySettings[difficultyKey].label,
      timestamp: timestamp.toISOString(),
      mode: item.mode === 'upload' ? 'upload' : 'microphone',
      target: safeInteger(item.target, 0, 100),
      won: Boolean(item.won),
      metrics: {
        melody: metric('melody'),
        rhythm: metric('rhythm'),
        timing: metric('timing'),
        clarity: metric('clarity')
      }
    };
  }

  function sanitizeProfile(value, history) {
    const source = value && typeof value === 'object' ? value : {};
    const bests = {};
    if (source.bests && typeof source.bests === 'object') {
      Object.entries(source.bests).forEach(([key, score]) => {
        const cleanKey = String(key).slice(0, 120);
        const [challengeId, difficulty] = cleanKey.split('::');
        if (
          isOfficialChallengeId(challengeId) &&
          Object.hasOwn(difficultySettings, difficulty) &&
          cleanKey === bestKey(challengeId, difficulty)
        ) {
          bests[cleanKey] = safeInteger(score, 0, 100);
        }
      });
    }
    history.forEach((item) => {
      if (!isOfficialChallengeId(item.challengeId)) return;
      const key = bestKey(item.challengeId, item.difficultyKey);
      bests[key] = Math.max(bests[key] ?? 0, item.score);
    });
    return {
      xp: safeInteger(source.xp),
      wins: safeInteger(source.wins, 0, 100_000),
      duels: safeInteger(source.duels, history.length, 100_000),
      streak: safeInteger(source.streak, 0, 100_000),
      bests
    };
  }

  function readStoredJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function loadGameSave() {
    const modern = readStoredJson(SAVE_KEY, null);
    const legacy = Array.isArray(modern?.history)
      ? []
      : readStoredJson('jingle-duel-history', []);
    const rawHistory = Array.isArray(modern?.history)
      ? modern.history
      : (Array.isArray(legacy) ? legacy : []);
    const history = rawHistory.map(sanitizeHistoryItem).filter(Boolean).slice(0, 50);
    const difficulty = Object.hasOwn(difficultySettings, modern?.preferences?.difficulty)
      ? modern.preferences.difficulty
      : 'normal';
    return {
      history,
      profile: sanitizeProfile(modern?.profile, history),
      preferences: { difficulty, uiMuted: Boolean(modern?.preferences?.uiMuted) }
    };
  }

  function saveGame() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        version: 2,
        history: state.history.slice(0, 50),
        profile: state.profile,
        preferences: { difficulty: state.difficulty, uiMuted: state.uiMuted }
      }));
    } catch {
      // Storage can be disabled in private contexts; the app remains fully usable.
    }
  }

  const saveHistory = saveGame;

  function formatDuration(seconds) {
    return `${seconds.toFixed(1).replace('.', ',')} s`;
  }

  function rivalTargetFor(challenge, difficulty = state.difficulty) {
    const base = safeInteger(challenge.rival?.base ?? 68, 35, 92);
    const modifier = difficulty === 'relaxed' ? -10 : difficulty === 'expert' ? 10 : 0;
    return clamp(base + modifier, 35, 96);
  }

  function bestKey(challengeId, difficulty) {
    return `${String(challengeId)}::${String(difficulty)}`;
  }

  function isOfficialChallengeId(challengeId) {
    return presets.some((preset) => preset.id === challengeId);
  }

  function levelForXp(xp) {
    return Math.floor(Math.sqrt(Math.max(0, xp) / 120)) + 1;
  }

  function xpFloorForLevel(level) {
    return Math.pow(Math.max(0, level - 1), 2) * 120;
  }

  function renderProgress() {
    const level = levelForXp(state.profile.xp);
    const floor = xpFloorForLevel(level);
    const ceiling = xpFloorForLevel(level + 1);
    const withinLevel = state.profile.xp - floor;
    const levelSpan = Math.max(1, ceiling - floor);
    const percentage = clamp(Math.round((withinLevel / levelSpan) * 100), 0, 100);
    refs.profileLevel.textContent = level;
    refs.profileLevelLabel.textContent = level;
    refs.xpBar.style.width = `${percentage}%`;
    refs.xpTrack.setAttribute('aria-valuenow', String(percentage));
    refs.xpLabel.textContent = `${Math.max(0, ceiling - state.profile.xp)} XP avant le niveau suivant`;
    refs.profileWins.textContent = state.profile.wins;
    refs.profileStreak.textContent = state.profile.streak;
    refs.profileDuels.textContent = state.profile.duels;
    refs.profileMasteries.textContent = Object.values(state.profile.bests).filter((score) => score >= 85).length;
  }

  function renderChallengeCards() {
    refs.challengeGrid.innerHTML = presets.map((preset) => {
      const best = state.profile.bests[bestKey(preset.id, state.difficulty)];
      const target = rivalTargetFor(preset);
      return `
      <button class="challenge-card" type="button" data-challenge="${preset.id}" style="--card-accent:${preset.accent}" aria-label="${escapeHtml(preset.title)}, rival ${escapeHtml(preset.rival.name)}, objectif ${target}">
        <div class="card-art">
          <span class="card-play" aria-hidden="true">▶</span>
          <span class="card-monogram">${preset.monogram}</span>
          <span class="card-mastery">${best === undefined ? 'NOUVEAU' : `RECORD ${best}`}</span>
        </div>
        <div class="card-copy">
          <div><small>${preset.label}</small><strong>${preset.title}</strong></div>
          <span class="card-meta">${preset.notes.length} notes · ${formatDuration(preset.duration)}<b>${preset.rival.name} · ${target}</b></span>
        </div>
      </button>
    `;
    }).join('');

    $$('[data-challenge]', refs.challengeGrid).forEach((button) => {
      button.addEventListener('click', () => {
        const preset = presets.find((item) => item.id === button.dataset.challenge) || presets[0];
        startChallenge(preset);
      });
    });
  }

  function renderHistory() {
    const savedBests = Object.values(state.profile.bests).filter(Number.isFinite);
    const best = savedBests.length ? Math.max(...savedBests) : null;
    refs.headerBest.textContent = best === null ? '—' : best;
    refs.historySection.hidden = state.history.length === 0;
    refs.historyList.innerHTML = state.history.slice(0, 8).map((item) => {
      const date = new Date(item.timestamp);
      const label = Number.isNaN(date.getTime())
        ? ''
        : new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(date);
      return `
        <li class="history-item">
          <div><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.difficulty)} · ${item.mode === 'upload' ? 'fichier audio' : 'micro'} · ${label}</small></div>
          <span class="history-grade">${escapeHtml(item.grade)}</span>
          <span class="history-score" aria-label="${item.score} sur 100">${escapeHtml(item.score)}</span>
        </li>
      `;
    }).join('');
    renderProgress();
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function scrollToTop() {
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  }

  function showScreen(screen, focusTarget = null) {
    [refs.homeScreen, refs.challengeScreen].forEach((item) => {
      const active = item === screen;
      item.classList.toggle('active', active);
      item.hidden = !active;
    });
    scrollToTop();
    const target = focusTarget || (screen === refs.homeScreen ? $('#homeTitle') : refs.challengeTitle);
    if (target) {
      target.setAttribute('tabindex', '-1');
      requestAnimationFrame(() => target.focus({ preventScroll: true }));
    }
  }

  function setDifficultyLocked(locked) {
    $$('.difficulty-control button').forEach((button) => { button.disabled = locked; });
  }

  function invalidateFlow() {
    state.flowId += 1;
    state.playbackId += 1;
    state.activeAttempt = null;
    setDifficultyLocked(false);
  }

  function goHome() {
    invalidateFlow();
    stopReference();
    stopAttemptPlayback();
    stopMicrophoneSession();
    refs.micError.hidden = true;
    showScreen(refs.homeScreen);
    renderHistory();
  }

  function applyAccent(color) {
    document.documentElement.style.setProperty('--accent', color);
  }

  function startChallenge(challenge) {
    invalidateFlow();
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
    refs.rivalName.textContent = challenge.rival?.name || 'STUDIO';
    refs.rivalTarget.textContent = rivalTargetFor(challenge);
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
    refs.attemptAudioInput.disabled = true;
    refs.fileAttemptLabel.classList.add('disabled');
    refs.fileAttemptLabel.setAttribute('aria-disabled', 'true');
    refs.micError.hidden = true;
    refs.playReferenceButton.disabled = false;
    refs.listenPanel.hidden = false;
    refs.recordPanel.hidden = true;
    refs.analysisPanel.hidden = true;
    refs.resultPanel.hidden = true;
    refs.compareButton.disabled = false;
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
      if (index === activeIndex) step.setAttribute('aria-current', 'step');
      else step.removeAttribute('aria-current');
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

  async function playReference({ markListened = true, playbackId = null } = {}) {
    const requestId = playbackId ?? ++state.playbackId;
    const flowId = state.flowId;
    const challenge = state.currentChallenge;
    try {
      const context = await getAudioContext();
      if (requestId !== state.playbackId || flowId !== state.flowId || challenge !== state.currentChallenge) {
        return false;
      }
      stopReference();
      stopAttemptPlayback();
      refs.playReferenceButton.disabled = true;
      refs.startAttemptButton.disabled = true;
      refs.performanceStage.classList.remove('playing');
      void refs.performanceStage.offsetWidth;
      refs.performanceStage.classList.add('playing');
      refs.stageStatus.textContent = 'Écoute de la référence…';

      if (challenge.kind === 'synth') {
        playSynthChallenge(context, challenge);
      } else {
        playAudioBuffer(context, challenge.audioBuffer);
      }
      animateNoteTrack(challenge);

      const completionTimer = window.setTimeout(() => {
        if (requestId !== state.playbackId || flowId !== state.flowId || challenge !== state.currentChallenge) {
          return;
        }
        refs.performanceStage.classList.remove('playing');
        refs.playReferenceButton.disabled = false;
        if (markListened) {
          state.hasListened = true;
          refs.startAttemptButton.disabled = false;
          refs.attemptAudioInput.disabled = false;
          refs.fileAttemptLabel.classList.remove('disabled');
          refs.fileAttemptLabel.setAttribute('aria-disabled', 'false');
          refs.stageStatus.textContent = 'À ton tour : reproduis le jingle';
          playUiTone('ready');
        } else {
          refs.stageStatus.textContent = 'Référence terminée';
        }
      }, challenge.duration * 1000 + 180);
      state.activeTimers.push(completionTimer);
      return true;
    } catch (error) {
      if (requestId === state.playbackId && flowId === state.flowId && challenge === state.currentChallenge) {
        refs.playReferenceButton.disabled = false;
        showToast(error.message || 'Impossible de lire le jingle.');
      }
      return false;
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

  async function startAttempt() {
    if (!state.hasListened) return;
    const attempt = createAttemptContext('microphone');
    stopReference();
    refs.startAttemptButton.disabled = true;
    refs.playReferenceButton.disabled = true;
    refs.listenPanel.hidden = true;
    refs.recordPanel.hidden = false;
    refs.analysisPanel.hidden = true;
    refs.resultPanel.hidden = true;
    refs.micError.hidden = true;
    refs.recordState.textContent = 'Autorisation micro';
    updateStepper('record');

    try {
      await prepareMicrophone(attempt);
      if (!isAttemptActive(attempt)) throw createAbortError();
      await runCountdown(attempt);
      if (!isAttemptActive(attempt)) throw createAbortError();
      await beginRecording(attempt);
    } catch (error) {
      if (error?.name === 'AbortError') return;
      stopMicrophoneSession();
      if (!isAttemptActive(attempt)) return;
      state.activeAttempt = null;
      setDifficultyLocked(false);
      refs.listenPanel.hidden = false;
      refs.recordPanel.hidden = true;
      refs.startAttemptButton.disabled = false;
      refs.playReferenceButton.disabled = false;
      updateStepper('listen');
      const details = microphoneErrorCopy(error);
      const message = details.message;
      showToast(message, 5200);
      refs.micErrorTitle.textContent = details.title;
      refs.micErrorMessage.textContent = message;
      refs.micError.hidden = false;
      refs.micError.focus({ preventScroll: true });
      refs.stageStatus.textContent = 'Microphone indisponible';
    }
  }

  function createAttemptContext(mode) {
    const attempt = {
      id: ++state.flowId,
      challenge: state.currentChallenge,
      referenceProfile: state.referenceProfile,
      difficulty: state.difficulty,
      target: rivalTargetFor(state.currentChallenge, state.difficulty),
      mode
    };
    state.activeAttempt = attempt;
    setDifficultyLocked(true);
    return attempt;
  }

  function isAttemptActive(attempt) {
    return Boolean(attempt && state.activeAttempt?.id === attempt.id && state.flowId === attempt.id);
  }

  function createAbortError() {
    try { return new DOMException('Flux annulé', 'AbortError'); }
    catch {
      const error = new Error('Flux annulé');
      error.name = 'AbortError';
      return error;
    }
  }

  function microphoneErrorCopy(error) {
    if (error?.name === 'NotAllowedError' || error?.name === 'SecurityError') {
      return { title: 'Autorisation refusée', message: 'Autorise le microphone dans les réglages du navigateur, puis relance ton essai. Tu peux aussi importer un enregistrement.' };
    }
    if (error?.name === 'NotFoundError' || error?.name === 'DevicesNotFoundError') {
      return { title: 'Aucun microphone détecté', message: 'Connecte un microphone ou utilise le mode sans micro avec un fichier audio.' };
    }
    if (error?.name === 'NotReadableError' || error?.name === 'TrackStartError') {
      return { title: 'Microphone déjà utilisé', message: 'Ferme les autres applications audio, puis réessaie ou importe un enregistrement.' };
    }
    return { title: 'Microphone indisponible', message: error?.message || 'Le microphone ne peut pas être utilisé. Tu peux continuer avec un fichier audio.' };
  }

  async function prepareMicrophone(attempt) {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('Ce navigateur ne prend pas en charge l’accès au microphone.');
    }
    if (!window.MediaRecorder) {
      throw new Error('L’enregistrement audio n’est pas pris en charge par ce navigateur.');
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        channelCount: 1
      },
      video: false
    });
    if (!isAttemptActive(attempt)) {
      stream.getTracks().forEach((track) => track.stop());
      throw createAbortError();
    }
    state.mediaStream = stream;
    const context = await getAudioContext();
    if (!isAttemptActive(attempt)) {
      stream.getTracks().forEach((track) => track.stop());
      throw createAbortError();
    }
    state.analyser = context.createAnalyser();
    state.analyser.fftSize = 2048;
    state.analyser.smoothingTimeConstant = 0.25;
    state.analyserSource = context.createMediaStreamSource(state.mediaStream);
    state.analyserSource.connect(state.analyser);
    stream.getAudioTracks().forEach((track) => track.addEventListener('ended', () => {
      if (!isAttemptActive(attempt)) return;
      showToast('Le microphone a été déconnecté.');
      stopRecording();
    }, { once: true }));
  }

  async function runCountdown(attempt) {
    refs.countdown.hidden = false;
    refs.micOrb.hidden = true;
    refs.stageStatus.textContent = 'Prépare-toi…';
    const values = ['3', '2', '1', 'GO'];
    for (const value of values) {
      if (!isAttemptActive(attempt)) throw createAbortError();
      refs.countdown.textContent = value;
      refs.countdown.classList.remove('pop');
      void refs.countdown.offsetWidth;
      refs.countdown.classList.add('pop');
      playUiTone(value === 'GO' ? 'ready' : 'tap');
      await sleep(value === 'GO' ? 620 : 760);
    }
    if (!isAttemptActive(attempt)) throw createAbortError();
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

  async function beginRecording(attempt) {
    if (!isAttemptActive(attempt) || !state.mediaStream) throw createAbortError();
    const mimeType = preferredMimeType();
    const recorderOptions = mimeType ? { mimeType, audioBitsPerSecond: 128000 } : undefined;
    const chunks = [];
    state.liveFrames = [];
    state.recordingCancelled = false;
    state.lastLivePitch = null;
    state.lastPitchSampleAt = 0;
    const recorder = new MediaRecorder(state.mediaStream, recorderOptions);
    state.mediaRecorder = recorder;
    recorder.addEventListener('dataavailable', (event) => {
      if (event.data?.size) chunks.push(event.data);
    });
    recorder.addEventListener('error', (event) => {
      failActiveAttempt(event.error || new Error('L’enregistrement audio a échoué.'), attempt);
    }, { once: true });
    recorder.addEventListener('stop', () => {
      if (state.recordingCancelled || !isAttemptActive(attempt)) {
        state.recordingCancelled = false;
        return;
      }
      const type = recorder.mimeType || mimeType || 'audio/webm';
      const blob = new Blob(chunks, { type });
      const liveDuration = Math.max(0.01, (performance.now() - state.recordingStartedAt) / 1000);
      const frames = state.liveFrames.map((frame) => ({ ...frame }));
      handleRecordingComplete(attempt, blob, frames, liveDuration)
        .catch((error) => failActiveAttempt(error, attempt));
    }, { once: true });

    state.recordingStartedAt = performance.now();
    recorder.start(120);
    refs.recordState.textContent = 'Enregistrement';
    refs.stopRecordingButton.disabled = false;
    refs.micOrb.hidden = false;
    refs.performanceStage.classList.add('recording');
    refs.stageStatus.textContent = 'Reproduis le jingle maintenant';
    monitorMicrophone(attempt, recorder);

    const maxDuration = clamp(attempt.challenge.duration + 1.25, 2.0, 9.2);
    state.recordingStopTimer = window.setTimeout(() => stopRecording(), maxDuration * 1000);
  }

  function monitorMicrophone(attempt, recorder) {
    if (!state.analyser || !state.recordingStartedAt) return;
    const buffer = new Float32Array(state.analyser.fftSize);

    const frame = () => {
      if (!isAttemptActive(attempt) || recorder.state !== 'recording' || !state.analyser) return;
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
    const recorder = state.mediaRecorder;
    if (!recorder || recorder.state !== 'recording') return;
    clearTimeout(state.recordingStopTimer);
    cancelAnimationFrame(state.animationFrame);
    refs.stopRecordingButton.disabled = true;
    refs.recordState.textContent = 'Terminé';
    refs.micOrb.hidden = true;
    refs.performanceStage.classList.remove('recording');
    recorder.stop();
  }

  async function handleRecordingComplete(attempt, blob, frames, liveDuration) {
    if (!isAttemptActive(attempt)) return;
    refs.recordPanel.hidden = true;
    refs.analysisPanel.hidden = false;
    refs.stageStatus.textContent = 'Analyse de la performance…';
    stopMicrophoneTracksOnly();

    if (!isAttemptActive(attempt)) return;
    if (state.attemptUrl) URL.revokeObjectURL(state.attemptUrl);
    state.attemptBlob = blob;
    state.attemptUrl = URL.createObjectURL(blob);
    state.attemptAudio = new Audio(state.attemptUrl);

    let recordingProfile;
    try {
      const context = await getAudioContext();
      if (!isAttemptActive(attempt)) return;
      const arrayBuffer = await blob.arrayBuffer();
      if (!isAttemptActive(attempt)) return;
      const decoded = await context.decodeAudioData(arrayBuffer.slice(0));
      if (!isAttemptActive(attempt)) return;
      recordingProfile = await extractProfileFromAudioBuffer(decoded);
    } catch {
      recordingProfile = buildProfileFromFrames(frames, liveDuration);
    }

    if (!isAttemptActive(attempt)) return;
    await sleep(420);
    if (!isAttemptActive(attempt)) return;
    const result = compareProfiles(attempt.referenceProfile, recordingProfile, attempt.difficulty);
    showResult(result, attempt);
  }

  function failActiveAttempt(error, attempt) {
    if (!isAttemptActive(attempt)) return;
    stopMicrophoneSession();
    state.activeAttempt = null;
    setDifficultyLocked(false);
    refs.recordPanel.hidden = true;
    refs.analysisPanel.hidden = true;
    refs.listenPanel.hidden = false;
    refs.startAttemptButton.disabled = false;
    refs.playReferenceButton.disabled = false;
    updateStepper('listen');
    refs.stageStatus.textContent = 'Essai interrompu';
    showToast(error?.message || 'L’essai n’a pas pu être analysé.', 5000);
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
    const mono = mixToMono(buffer);
    if (window.Worker) {
      try {
        return await analyzeAudioInWorker(mono, buffer.sampleRate, buffer.duration);
      } catch {
        // A strict browser policy may disable workers; use the tested core locally.
      }
    }
    await sleep(0);
    return analyzeSamples(mono, buffer.sampleRate, buffer.duration);
  }

  function analyzeAudioInWorker(samples, sampleRate, duration) {
    return new Promise((resolve, reject) => {
      const worker = new Worker(new URL('./analysis-worker.js', import.meta.url), { type: 'module' });
      const timeout = window.setTimeout(() => {
        worker.terminate();
        reject(new Error('L’analyse audio a dépassé le délai prévu.'));
      }, 20_000);
      const finish = (callback, value) => {
        clearTimeout(timeout);
        worker.terminate();
        callback(value);
      };
      worker.addEventListener('message', (event) => {
        if (event.data?.error) finish(reject, new Error(event.data.error));
        else finish(resolve, event.data.profile);
      }, { once: true });
      worker.addEventListener('error', () => finish(reject, new Error('Le moteur d’analyse audio est indisponible.')), { once: true });
      const transferable = samples.slice();
      worker.postMessage({ samples: transferable.buffer, sampleRate, duration }, [transferable.buffer]);
    });
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

  function showResult(result, attempt) {
    if (!isAttemptActive(attempt)) return;
    const challenge = attempt.challenge;
    const target = attempt.target;
    const ranked = !result.noSignal;
    const recordEligible = ranked && isOfficialChallengeId(challenge.id);
    const won = ranked && result.total >= target;
    const recordKey = bestKey(challenge.id, attempt.difficulty);
    const priorBest = state.profile.bests[recordKey];
    const isBest = recordEligible && (priorBest === undefined || result.total > priorBest);
    const difficultyBonus = attempt.difficulty === 'expert' ? 12 : attempt.difficulty === 'normal' ? 6 : 0;
    const xpEarned = ranked
      ? Math.max(5, Math.round(result.total / 4)) + difficultyBonus + (won ? 20 : 5)
      : 0;

    state.lastResult = { ...result, challengeTitle: challenge.title, won, target, mode: attempt.mode };
    state.activeAttempt = null;
    setDifficultyLocked(false);
    refs.analysisPanel.hidden = true;
    refs.resultPanel.hidden = false;
    refs.listenPanel.hidden = true;
    refs.recordPanel.hidden = true;
    refs.stageStatus.textContent = ranked ? 'Résultat : ' + result.total + ' sur 100' : 'Essai non classé';
    updateStepper('result');

    const copy = resultCopy(result);
    refs.resultTitle.textContent = copy.title;
    refs.resultMessage.textContent = copy.message;
    refs.gradeChip.textContent = ranked ? 'RANG ' + result.grade : 'NON CLASSÉ';
    refs.bestResult.hidden = !isBest;
    refs.shareScoreButton.hidden = !ranked;
    refs.compareButton.disabled = false;
    refs.duelOutcome.textContent = !ranked
      ? 'Essai non classé · aucun signal exploitable'
      : won
        ? 'Victoire contre ' + (challenge.rival?.name || 'STUDIO') + ' · ' + result.total + ' à ' + target
        : (challenge.rival?.name || 'STUDIO') + ' conserve le duel · objectif ' + target;
    refs.duelOutcome.classList.toggle('defeat', !won);
    refs.xpReward.textContent = ranked ? '+' + xpEarned + ' XP' : 'AUCUN XP';

    animateNumber(refs.totalScore, result.total, 850);
    refs.scoreRing.style.setProperty('--score', result.total);
    setMetric('melody', result.melody);
    setMetric('rhythm', result.rhythm);
    setMetric('timing', result.timing);
    setMetric('clarity', result.clarity);

    if (ranked) {
      state.profile.xp += xpEarned;
      state.profile.duels += 1;
      state.profile.wins += won ? 1 : 0;
      state.profile.streak = won ? state.profile.streak + 1 : 0;
      if (isBest) state.profile.bests[recordKey] = result.total;

      state.history.unshift({
        title: challenge.title,
        challengeId: challenge.id,
        score: result.total,
        grade: result.grade,
        difficultyKey: attempt.difficulty,
        difficulty: difficultySettings[attempt.difficulty].label,
        mode: attempt.mode,
        target,
        won,
        metrics: {
          melody: result.melody,
          rhythm: result.rhythm,
          timing: result.timing,
          clarity: result.clarity
        },
        timestamp: new Date().toISOString()
      });
      state.history = state.history.slice(0, 50);
      saveGame();
      renderHistory();
      renderChallengeCards();
    }
    playUiTone(result.total >= 60 ? 'success' : 'tap');
    requestAnimationFrame(() => refs.resultPanel.focus({ preventScroll: true }));
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
    invalidateFlow();
    stopReference();
    stopAttemptPlayback();
    stopMicrophoneSession();
    refs.resultPanel.hidden = true;
    refs.listenPanel.hidden = false;
    refs.startAttemptButton.disabled = false;
    refs.playReferenceButton.disabled = false;
    refs.compareButton.disabled = false;
    refs.micError.hidden = true;
    refs.stageStatus.textContent = 'Réécoute la référence ou relance ton essai';
    updateStepper('listen');
    scrollToTop();
    requestAnimationFrame(() => refs.playReferenceButton.focus({ preventScroll: true }));
  }

  function playAttempt(url = state.attemptUrl, { playbackId = null } = {}) {
    if (!url) return false;
    const standalonePlayback = playbackId === null;
    const requestId = playbackId ?? ++state.playbackId;
    if (requestId !== state.playbackId) return false;
    if (standalonePlayback) refs.compareButton.disabled = false;
    stopReference();
    state.attemptAudio?.pause();
    const audio = new Audio(url);
    state.attemptAudio = audio;
    audio.play().catch(() => {
      if (requestId === state.playbackId && audio === state.attemptAudio) {
        showToast('Impossible de relire cet essai.');
      }
    });
    refs.stageStatus.textContent = 'Lecture de ton essai…';
    audio.addEventListener('ended', () => {
      if (requestId === state.playbackId && audio === state.attemptAudio) {
        refs.stageStatus.textContent = state.lastResult?.noSignal
          ? 'Essai non classé'
          : 'Résultat : ' + (state.lastResult?.total ?? 0) + ' sur 100';
      }
    }, { once: true });
    return true;
  }

  async function compareAB() {
    if (!state.attemptUrl) return;
    const playbackId = ++state.playbackId;
    const attemptUrl = state.attemptUrl;
    const challengeDuration = state.currentChallenge.duration;
    refs.compareButton.disabled = true;
    refs.stageStatus.textContent = 'A : référence';
    const started = await playReference({ markListened: false, playbackId });
    if (!started || playbackId !== state.playbackId) {
      refs.compareButton.disabled = false;
      return;
    }
    await sleep(challengeDuration * 1000 + 470);
    if (playbackId !== state.playbackId) return;
    refs.stageStatus.textContent = 'B : ton essai';
    playAttempt(attemptUrl, { playbackId });
    const attemptDuration = state.attemptAudio?.duration;
    await sleep(Number.isFinite(attemptDuration) ? attemptDuration * 1000 + 200 : challengeDuration * 1000 + 1000);
    if (playbackId === state.playbackId) refs.compareButton.disabled = false;
  }

  async function shareScore() {
    if (!state.lastResult || state.lastResult.noSignal) return;
    const title = state.lastResult.challengeTitle || state.currentChallenge.title;
    const text = 'J’ai obtenu ' + state.lastResult.total + '/100 (rang ' + state.lastResult.grade + ') sur « ' + title + ' » dans Jingle Duel !';
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
    state.importId += 1;
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

  async function handleAttemptAudio(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !state.hasListened) return;
    const looksLikeAudio = file.type.startsWith('audio/') || /\.(wav|mp3|m4a|aac|ogg|webm|flac)$/i.test(file.name);
    if (!looksLikeAudio) {
      showToast('Choisis un fichier audio compatible.');
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      showToast('Le fichier audio dépasse 12 Mo.');
      return;
    }

    const attempt = createAttemptContext('upload');
    stopReference();
    stopAttemptPlayback();
    refs.listenPanel.hidden = true;
    refs.recordPanel.hidden = true;
    refs.resultPanel.hidden = true;
    refs.analysisPanel.hidden = false;
    refs.stageStatus.textContent = 'Analyse de ton fichier audio…';
    updateStepper('record');

    try {
      const context = await getAudioContext();
      if (!isAttemptActive(attempt)) throw createAbortError();
      const arrayBuffer = await file.arrayBuffer();
      if (!isAttemptActive(attempt)) throw createAbortError();
      const decoded = await context.decodeAudioData(arrayBuffer.slice(0));
      if (decoded.duration < 0.35 || decoded.duration > 12) {
        throw new Error('Ton essai doit durer entre 0,4 et 12 secondes.');
      }
      const profile = await extractProfileFromAudioBuffer(decoded);
      if (!isAttemptActive(attempt)) throw createAbortError();
      if (state.attemptUrl) URL.revokeObjectURL(state.attemptUrl);
      state.attemptBlob = file;
      state.attemptUrl = URL.createObjectURL(file);
      state.attemptAudio = new Audio(state.attemptUrl);
      const result = compareProfiles(attempt.referenceProfile, profile, attempt.difficulty);
      showResult(result, attempt);
    } catch (error) {
      if (error?.name !== 'AbortError') failActiveAttempt(error, attempt);
    }
  }

  async function handleCustomAudio(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = '';
    const importId = ++state.importId;
    refs.studioError.hidden = true;
    refs.createCustomButton.disabled = true;
    refs.audioUploadTitle.textContent = 'Analyse du jingle…';
    refs.audioUploadHint.textContent = file.name;

    try {
      const looksLikeAudio = file.type.startsWith('audio/') || /\.(wav|mp3|m4a|aac|ogg|webm|flac)$/i.test(file.name);
      if (!looksLikeAudio) throw new Error('Choisis un fichier audio WAV, MP3, M4A, OGG, WEBM ou FLAC.');
      if (file.size > 12 * 1024 * 1024) throw new Error('Le fichier audio dépasse 12 Mo.');
      const context = await getAudioContext();
      if (importId !== state.importId || !refs.studioDialog.open) return;
      const arrayBuffer = await file.arrayBuffer();
      if (importId !== state.importId || !refs.studioDialog.open) return;
      const audioBuffer = await context.decodeAudioData(arrayBuffer.slice(0));
      if (importId !== state.importId || !refs.studioDialog.open) return;
      if (audioBuffer.duration < 0.7 || audioBuffer.duration > 8.05) {
        throw new Error('Le jingle doit durer entre 0,7 et 8 secondes.');
      }
      const profile = await extractProfileFromAudioBuffer(audioBuffer);
      if (importId !== state.importId || !refs.studioDialog.open) return;
      if (!profile.signalPresent) throw new Error('Le fichier ne contient pas de signal sonore suffisamment audible.');
      state.pendingCustom = { audioBuffer, profile, fileName: file.name };
      refs.audioUploadTitle.textContent = 'Jingle prêt';
      refs.audioUploadHint.textContent = `${file.name} · ${formatDuration(audioBuffer.duration)}`;
      refs.createCustomButton.disabled = false;
      playUiTone('ready');
    } catch (error) {
      if (importId !== state.importId || !refs.studioDialog.open) return;
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
    const allowedTypes = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']);
    if (!allowedTypes.has(file.type)) {
      refs.studioError.textContent = 'Choisis un logo PNG, JPG, WEBP ou SVG.';
      refs.studioError.hidden = false;
      event.target.value = '';
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      refs.studioError.textContent = 'Le logo dépasse 4 Mo.';
      refs.studioError.hidden = false;
      event.target.value = '';
      return;
    }
    if (state.pendingLogoUrl) URL.revokeObjectURL(state.pendingLogoUrl);
    state.pendingLogoUrl = URL.createObjectURL(file);
    refs.studioError.hidden = true;
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
      rival: { name: 'STUDIO', base: 68 },
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

  function cancelActiveAttempt(message) {
    if (!state.activeAttempt) return;
    invalidateFlow();
    stopMicrophoneSession();
    refs.countdown.hidden = true;
    refs.micOrb.hidden = true;
    refs.performanceStage.classList.remove('recording');
    refs.recordPanel.hidden = true;
    refs.analysisPanel.hidden = true;
    refs.resultPanel.hidden = true;
    refs.listenPanel.hidden = false;
    refs.startAttemptButton.disabled = !state.hasListened;
    refs.playReferenceButton.disabled = false;
    updateStepper('listen');
    refs.stageStatus.textContent = message;
  }

  function updateNetworkStatus() {
    const online = navigator.onLine;
    refs.networkStatus.textContent = online ? 'En ligne' : 'Hors ligne';
    refs.networkStatus.classList.toggle('offline', !online);
  }

  function bindEvents() {
    refs.quickStartButton.addEventListener('click', () => startChallenge(presets[0]));
    refs.openStudioButton.addEventListener('click', openStudio);
    refs.homeButton.addEventListener('click', goHome);
    refs.backHomeButton.addEventListener('click', goHome);
    refs.playReferenceButton.addEventListener('click', () => playReference());
    refs.startAttemptButton.addEventListener('click', startAttempt);
    refs.attemptAudioInput.addEventListener('change', handleAttemptAudio);
    refs.stopRecordingButton.addEventListener('click', stopRecording);
    refs.retryButton.addEventListener('click', retryChallenge);
    refs.playAttemptButton.addEventListener('click', () => playAttempt());
    refs.compareButton.addEventListener('click', compareAB);
    refs.shareScoreButton.addEventListener('click', shareScore);
    refs.clearHistoryButton.addEventListener('click', () => {
      if (!window.confirm('Effacer les résultats récents sur cet appareil ? La progression et les records seront conservés.')) return;
      state.history = [];
      saveGame();
      renderHistory();
      showToast('Historique effacé.');
      const progressTitle = $('#progressTitle');
      progressTitle?.setAttribute('tabindex', '-1');
      requestAnimationFrame(() => progressTitle?.focus({ preventScroll: true }));
    });
    refs.soundToggle.addEventListener('click', () => {
      state.uiMuted = !state.uiMuted;
      refs.soundToggle.setAttribute('aria-pressed', String(state.uiMuted));
      saveGame();
      showToast(state.uiMuted ? 'Sons d’interface désactivés' : 'Sons d’interface activés');
    });

    $$('.difficulty-control button').forEach((button) => {
      button.addEventListener('click', () => {
        state.difficulty = button.dataset.difficulty;
        $$('.difficulty-control button').forEach((item) => {
          const active = item === button;
          item.classList.toggle('active', active);
          item.setAttribute('aria-pressed', String(active));
        });
        refs.rivalTarget.textContent = rivalTargetFor(state.currentChallenge);
        saveGame();
        renderChallengeCards();
        playUiTone('tap');
      });
    });

    refs.customAudioInput.addEventListener('change', handleCustomAudio);
    refs.customLogoInput.addEventListener('change', handleCustomLogo);
    refs.studioForm.addEventListener('submit', (event) => {
      event.preventDefault();
      if (event.submitter?.id === 'createCustomButton') createCustomChallenge();
      else {
        state.importId += 1;
        state.pendingCustom = null;
        if (state.pendingLogoUrl) URL.revokeObjectURL(state.pendingLogoUrl);
        state.pendingLogoUrl = null;
        refs.studioDialog.close();
      }
    });

    refs.installButton.addEventListener('click', async () => {
      if (!state.deferredInstallPrompt) return;
      state.deferredInstallPrompt.prompt();
      await state.deferredInstallPrompt.userChoice;
      state.deferredInstallPrompt = null;
      refs.installButton.hidden = true;
    });
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      state.deferredInstallPrompt = event;
      refs.installButton.hidden = false;
    });
    window.addEventListener('appinstalled', () => {
      state.deferredInstallPrompt = null;
      refs.installButton.hidden = true;
      showToast('Jingle Duel est installé.');
    });
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    window.addEventListener('resize', debounce(drawReferenceWaveform, 120));
    window.addEventListener('beforeunload', () => {
      stopMicrophoneSession();
      if (state.attemptUrl) URL.revokeObjectURL(state.attemptUrl);
      if (state.customLogoUrl) URL.revokeObjectURL(state.customLogoUrl);
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelActiveAttempt('Essai annulé : la page a été masquée');
    });
  }

  function debounce(callback, delay) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = window.setTimeout(() => callback(...args), delay);
    };
  }

  async function registerServiceWorker() {
    if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
      try {
        const registration = await navigator.serviceWorker.register('./service-worker.js');
        registration.addEventListener('updatefound', () => {
          const worker = registration.installing;
          worker?.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) {
              showToast('Mise à jour installée. Elle sera active au prochain chargement.', 5000);
            }
          });
        });
      } catch {
        showToast('Le mode hors ligne n’a pas pu être activé.', 4500);
      }
    }
  }

  function initialize() {
    refs.challengeScreen.hidden = true;
    refs.homeScreen.hidden = false;
    refs.soundToggle.setAttribute('aria-pressed', String(state.uiMuted));
    $$('.difficulty-control button').forEach((button) => {
      const active = button.dataset.difficulty === state.difficulty;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    renderChallengeCards();
    renderHistory();
    bindEvents();
    updateNetworkStatus();
    applyAccent(presets[0].accent);
    state.referenceProfile = buildPresetProfile(presets[0]);
    refs.rivalName.textContent = presets[0].rival.name;
    refs.rivalTarget.textContent = rivalTargetFor(presets[0]);
    registerServiceWorker();
  }

  initialize();
})();
