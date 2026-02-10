/* === Kids Korean Playground - Common Utilities === */

const KidsApp = (() => {
  const STORAGE_PREFIX = 'kidsKorean_';

  /* --- Student Management --- */
  function getStudent() {
    return localStorage.getItem(STORAGE_PREFIX + 'student') || null;
  }

  function setStudent(id) {
    localStorage.setItem(STORAGE_PREFIX + 'student', id);
    applyTheme(id);
  }

  function applyTheme(id) {
    document.body.classList.remove('theme-asa', 'theme-leah');
    if (id === 'asa') document.body.classList.add('theme-asa');
    else if (id === 'leah') document.body.classList.add('theme-leah');
  }

  function requireStudent() {
    const id = getStudent();
    if (!id) {
      window.location.href = 'index.html';
      return null;
    }
    applyTheme(id);
    return id;
  }

  /* --- Data Loading --- */
  async function loadStudentData(studentId) {
    const id = studentId || getStudent();
    if (!id) return null;
    try {
      const resp = await fetch(`data/${id}.json`);
      if (!resp.ok) throw new Error('Failed to load');
      return await resp.json();
    } catch (e) {
      console.error('Failed to load student data:', e);
      return null;
    }
  }

  /* --- Progress Tracking --- */
  function getProgress(game) {
    const id = getStudent();
    if (!id) return {};
    const key = `${STORAGE_PREFIX}progress_${id}_${game}`;
    try {
      return JSON.parse(localStorage.getItem(key)) || {};
    } catch { return {}; }
  }

  function saveProgress(game, data) {
    const id = getStudent();
    if (!id) return;
    const key = `${STORAGE_PREFIX}progress_${id}_${game}`;
    localStorage.setItem(key, JSON.stringify(data));
  }

  function getBestScore(game) {
    const p = getProgress(game);
    return p.bestScore || 0;
  }

  function saveBestScore(game, score) {
    const p = getProgress(game);
    if (score > (p.bestScore || 0)) {
      p.bestScore = score;
      p.bestDate = new Date().toISOString();
      saveProgress(game, p);
    }
  }

  /* --- Settings --- */
  function getSettings() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_PREFIX + 'settings')) || {
        showRomanization: true,
        autoSpeak: true
      };
    } catch {
      return { showRomanization: true, autoSpeak: true };
    }
  }

  function saveSettings(s) {
    localStorage.setItem(STORAGE_PREFIX + 'settings', JSON.stringify(s));
  }

  function applyRomanization() {
    const show = getSettings().showRomanization;
    document.querySelectorAll('.romanization').forEach(el => {
      el.classList.toggle('hidden', !show);
    });
  }

  /* --- TTS (Text-to-Speech) with Pre-generated Audio --- */
  const ttsAvailable = 'speechSynthesis' in window;
  let ttsReady = false;
  let audioManifest = null;
  let audioBasePath = '';

  function initTTS() {
    // Load pre-generated audio manifest
    const id = getStudent();
    if (id) {
      fetch(`audio/tts/${id}/manifest.json`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data) {
            audioManifest = data;
            audioBasePath = `audio/tts/${id}/`;
            console.log(`Loaded ${Object.keys(data).length} pre-generated audio files`);
          }
        })
        .catch(() => {});
    }

    if (!ttsAvailable) {
      document.querySelectorAll('.tts-btn').forEach(b => b.classList.add('tts-unavailable'));
      return;
    }
    // Preload voices for fallback
    speechSynthesis.getVoices();
    speechSynthesis.onvoiceschanged = () => { ttsReady = true; };
    setTimeout(() => { ttsReady = true; }, 500);
  }

  function speak(text, rate = 0.8) {
    // Try pre-generated audio first
    if (audioManifest && audioManifest[text]) {
      const audio = new Audio(audioBasePath + audioManifest[text]);
      const activeBtn = document.querySelector('.tts-btn.active-tts');
      if (activeBtn) activeBtn.classList.add('speaking');
      audio.onended = () => {
        if (activeBtn) activeBtn.classList.remove('speaking');
      };
      audio.play().catch(() => speakWebAPI(text, rate));
      return;
    }
    speakWebAPI(text, rate);
  }

  function speakWebAPI(text, rate = 0.8) {
    if (!ttsAvailable) return;
    speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'ko-KR';
    utter.rate = rate;

    const voices = speechSynthesis.getVoices();
    const koVoice = voices.find(v => v.lang.startsWith('ko'));
    if (koVoice) utter.voice = koVoice;

    const activeBtn = document.querySelector('.tts-btn.active-tts');
    if (activeBtn) activeBtn.classList.add('speaking');
    utter.onend = () => {
      if (activeBtn) activeBtn.classList.remove('speaking');
    };

    speechSynthesis.speak(utter);
  }

  function makeTTSButton(text) {
    const btn = document.createElement('button');
    btn.className = 'tts-btn';
    btn.textContent = '🔊';
    btn.setAttribute('aria-label', 'Listen');
    if (!ttsAvailable) btn.classList.add('tts-unavailable');
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('.tts-btn').forEach(b => b.classList.remove('active-tts'));
      btn.classList.add('active-tts');
      speak(text);
    });
    return btn;
  }

  /* --- Celebration Effects --- */
  function showCelebration(emoji, title, subtitle, onClose) {
    let overlay = document.getElementById('celebration-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'celebration-overlay';
      overlay.className = 'celebration-overlay';
      overlay.innerHTML = `
        <div class="celebration-content">
          <span class="celebration-emoji"></span>
          <h2 class="celebration-title"></h2>
          <p class="celebration-subtitle"></p>
          <button class="btn btn-primary btn-big celebration-close"></button>
        </div>
      `;
      document.body.appendChild(overlay);
    }

    overlay.querySelector('.celebration-emoji').textContent = emoji;
    overlay.querySelector('.celebration-title').textContent = title;
    overlay.querySelector('.celebration-subtitle').textContent = subtitle;
    const closeBtn = overlay.querySelector('.celebration-close');
    closeBtn.textContent = 'Continue!';

    // Remove old listeners
    const newBtn = closeBtn.cloneNode(true);
    closeBtn.parentNode.replaceChild(newBtn, closeBtn);
    newBtn.addEventListener('click', () => {
      overlay.classList.remove('active');
      if (onClose) onClose();
    });

    overlay.classList.add('active');
    spawnStars();
    speak('잘했어요!');
  }

  function spawnStars(count = 12) {
    const emojis = ['⭐', '✨', '🌟', '💫', '🎉', '🎊'];
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const star = document.createElement('div');
        star.className = 'star-particle';
        star.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        star.style.left = Math.random() * 100 + 'vw';
        star.style.top = Math.random() * 40 + 'vh';
        star.style.fontSize = (1 + Math.random() * 1.5) + 'rem';
        document.body.appendChild(star);
        setTimeout(() => star.remove(), 1200);
      }, i * 80);
    }
  }

  function flashCorrect(el) {
    el.classList.add('correct');
    setTimeout(() => el.classList.remove('correct'), 800);
  }

  function flashWrong(el) {
    el.classList.add('wrong');
    setTimeout(() => el.classList.remove('wrong'), 600);
  }

  /* --- Utility --- */
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function renderHeader(title) {
    const id = getStudent();
    const header = document.querySelector('.page-header');
    if (!header) return;
    header.innerHTML = `
      <a href="index.html" class="back-btn">← Back</a>
      <span class="page-title">${title}</span>
      <span class="student-badge">${id === 'asa' ? '🧒 Asa' : '👧 Leah'}</span>
    `;
  }

  /* --- Init --- */
  function init() {
    initTTS();
    const id = getStudent();
    if (id) applyTheme(id);
  }

  // Auto-init on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    getStudent, setStudent, requireStudent, applyTheme,
    loadStudentData,
    getProgress, saveProgress, getBestScore, saveBestScore,
    getSettings, saveSettings, applyRomanization,
    speak, makeTTSButton, initTTS, ttsAvailable,
    showCelebration, spawnStars, flashCorrect, flashWrong,
    shuffle, renderHeader
  };
})();
