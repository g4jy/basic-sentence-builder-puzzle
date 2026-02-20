/* ============================================
   Korean Review Hub — Common Utilities
   Shared across all game pages
   ============================================ */

// === Student Manager ===
const StudentManager = {
  manifest: null,
  current: null, // { id, name, tier, emoji, tierData }
  _tierDataCache: {},

  async init() {
    try {
      const resp = await fetch('data/manifest.json');
      if (!resp.ok) throw new Error('Failed to load manifest');
      this.manifest = await resp.json();
    } catch (e) {
      console.error('StudentManager init error:', e);
      return false;
    }

    const lastId = localStorage.getItem('review_lastStudent');
    if (lastId) {
      const student = this.manifest.students.find(s => s.id === lastId);
      if (student) {
        await this.selectStudent(lastId);
      }
    }
    return true;
  },

  async selectStudent(id) {
    const student = this.manifest.students.find(s => s.id === id);
    if (!student) return false;

    const tierData = this.manifest.tiers[student.tier];
    if (!tierData) return false;

    let loadedTierData = this._tierDataCache[student.tier];
    if (!loadedTierData) {
      try {
        const resp = await fetch('data/' + tierData.file);
        if (!resp.ok) throw new Error('Failed to load tier data: ' + tierData.file);
        loadedTierData = await resp.json();
        this._tierDataCache[student.tier] = loadedTierData;
      } catch (e) {
        console.warn('Could not load tier data:', e);
        loadedTierData = null;
      }
    }

    this.current = {
      id: student.id,
      name: student.name,
      tier: student.tier,
      emoji: student.emoji,
      tierData: loadedTierData,
      tierConfig: tierData
    };

    Theme.apply(tierData.color);
    localStorage.setItem('review_lastStudent', id);
    return true;
  },

  getStudents() {
    return this.manifest ? this.manifest.students : [];
  },

  getTierInfo(tier) {
    return this.manifest ? this.manifest.tiers[tier] : null;
  },

  getCurrentTierData() {
    return this.current ? this.current.tierData : null;
  },

  clearSelection() {
    this.current = null;
    localStorage.removeItem('review_lastStudent');
  }
};

// === SRS Engine ===
const SRS = {
  getKey(studentId) {
    return 'review_' + studentId + '_srs';
  },

  getData(studentId) {
    try {
      const raw = localStorage.getItem(this.getKey(studentId));
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  },

  saveData(studentId, data) {
    try {
      localStorage.setItem(this.getKey(studentId), JSON.stringify(data));
    } catch (e) {
      console.error('SRS save error:', e);
    }
  },

  recordAnswer(studentId, itemId, correct) {
    const data = this.getData(studentId);
    if (!data[itemId]) {
      data[itemId] = { streak: 0, correct: 0, incorrect: 0, lastSeen: null };
    }
    const item = data[itemId];
    item.lastSeen = Date.now();
    if (correct) {
      item.streak = (item.streak || 0) + 1;
      item.correct = (item.correct || 0) + 1;
    } else {
      item.streak = 0;
      item.incorrect = (item.incorrect || 0) + 1;
    }
    this.saveData(studentId, data);
    return item;
  },

  getPriority(item) {
    if (!item || !item.lastSeen) return 100;       // New item first
    if (item.streak === 0) return 90;               // Failed item
    const daysSince = (Date.now() - item.lastSeen) / 86400000;
    const interval = Math.pow(2, item.streak);
    if (daysSince >= interval) return 70;            // Due for review
    return 10 + Math.random() * 20;                  // Known (occasional)
  },

  getItemsByPriority(studentId, items, count) {
    const data = this.getData(studentId);
    const scored = items.map(item => {
      const srsItem = data[item._srsId] || null;
      return {
        item: item,
        priority: this.getPriority(srsItem)
      };
    });
    scored.sort((a, b) => b.priority - a.priority);
    return scored.slice(0, count).map(s => s.item);
  },

  getStats(studentId) {
    const data = this.getData(studentId);
    const entries = Object.values(data);
    if (entries.length === 0) {
      return { totalSeen: 0, mastered: 0, learning: 0, accuracy: 0 };
    }
    let totalCorrect = 0;
    let totalIncorrect = 0;
    let mastered = 0;
    let learning = 0;

    entries.forEach(item => {
      totalCorrect += item.correct || 0;
      totalIncorrect += item.incorrect || 0;
      if ((item.streak || 0) >= 4) {
        mastered++;
      } else {
        learning++;
      }
    });

    const totalAttempts = totalCorrect + totalIncorrect;
    const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

    return {
      totalSeen: entries.length,
      mastered: mastered,
      learning: learning,
      accuracy: accuracy
    };
  }
};

// === TTS (pre-recorded MP3 with Web Speech fallback) ===
const TTS = {
  _manifest: null,
  _audioBase: 'audio/tts/',
  _currentAudio: null,

  speak(text, lang) {
    // Stop any currently playing audio
    if (this._currentAudio) {
      this._currentAudio.pause();
      this._currentAudio = null;
    }

    // Try pre-recorded MP3 first
    if (this._manifest && this._manifest[text]) {
      var audio = new Audio(this._audioBase + this._manifest[text]);
      this._currentAudio = audio;
      audio.play().catch(function() {});
      return;
    }

    // Fallback to Web Speech API
    if (!lang) lang = 'ko-KR';
    if (typeof speechSynthesis === 'undefined') return;
    speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = 0.85;
    speechSynthesis.speak(u);
  }
};

// Eagerly load TTS manifest in background
fetch('data/tts-manifest.json')
  .then(function(r) { return r.ok ? r.json() : null; })
  .then(function(data) { if (data) TTS._manifest = data; })
  .catch(function() {});

// === Theme Manager ===
const Theme = {
  apply(tierColor) {
    const root = document.documentElement;
    root.style.setProperty('--tier-color', tierColor);

    // Generate lighter variants
    const r = parseInt(tierColor.slice(1, 3), 16);
    const g = parseInt(tierColor.slice(3, 5), 16);
    const b = parseInt(tierColor.slice(5, 7), 16);

    root.style.setProperty('--tier-bg', 'rgba(' + r + ',' + g + ',' + b + ',0.08)');
    root.style.setProperty('--tier-bg-subtle', 'rgba(' + r + ',' + g + ',' + b + ',0.04)');
  }
};

// === Progress Tracker ===
const Progress = {
  getKey(studentId, game) {
    return 'review_' + studentId + '_' + game + '_progress';
  },

  save(studentId, game, data) {
    try {
      const existing = this.load(studentId, game);
      const merged = Object.assign({}, existing, data, { lastPlayed: Date.now() });
      localStorage.setItem(this.getKey(studentId, game), JSON.stringify(merged));
    } catch (e) {
      console.error('Progress save error:', e);
    }
  },

  load(studentId, game) {
    try {
      const raw = localStorage.getItem(this.getKey(studentId, game));
      return raw ? JSON.parse(raw) : { lastPlayed: null, sessionsCompleted: 0, bestStreak: 0 };
    } catch (e) {
      return { lastPlayed: null, sessionsCompleted: 0, bestStreak: 0 };
    }
  }
};

// === Utilities ===
const Utils = {
  shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = a[i];
      a[i] = a[j];
      a[j] = temp;
    }
    return a;
  },

  pick(arr, n) {
    const shuffled = this.shuffle(arr);
    return shuffled.slice(0, Math.min(n, shuffled.length));
  },

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  formatPercent(n, total) {
    if (total === 0) return '0%';
    return Math.round((n / total) * 100) + '%';
  }
};

// === Navigation ===
const Nav = {
  renderHeader(title) {
    const header = document.getElementById('app-header');
    if (!header) return;

    const student = StudentManager.current;
    let studentHtml = '';
    if (student) {
      studentHtml = '<div class="header-student">' +
        '<span>' + Utils.escapeHtml(student.emoji) + '</span>' +
        '<span>' + Utils.escapeHtml(student.name) + '</span>' +
        '</div>';
    }

    header.innerHTML =
      '<button class="header-back" onclick="Nav.goHome()" aria-label="Back">&larr;</button>' +
      '<div class="header-title">' + Utils.escapeHtml(title) + '</div>' +
      studentHtml;

    header.className = 'header';
  },

  goHome() {
    window.location.href = 'index.html';
  },

  goToGame(game) {
    window.location.href = game + '.html';
  }
};

// === Data Helpers ===
const DataHelper = {
  /**
   * Extract all reviewable items from tier data, each with a unique _srsId.
   * Returns { vocabulary, verbs, adjectives, phrases, sentences, all }
   */
  extractItems(tierData) {
    if (!tierData) return { vocabulary: [], verbs: [], adjectives: [], phrases: [], sentences: [], all: [] };

    const result = {
      vocabulary: [],
      verbs: [],
      adjectives: [],
      phrases: [],
      sentences: [],
      all: []
    };

    if (tierData.vocabulary) {
      tierData.vocabulary.forEach(function(item, i) {
        const entry = Object.assign({}, item, {
          _srsId: 'vocab_' + i,
          _type: 'vocabulary'
        });
        result.vocabulary.push(entry);
        result.all.push(entry);
      });
    }

    if (tierData.verbs) {
      tierData.verbs.forEach(function(item, i) {
        const entry = Object.assign({}, item, {
          _srsId: 'verb_' + i,
          _type: 'verb'
        });
        result.verbs.push(entry);
        result.all.push(entry);
      });
    }

    if (tierData.adjectives) {
      tierData.adjectives.forEach(function(item, i) {
        const entry = Object.assign({}, item, {
          _srsId: 'adj_' + i,
          _type: 'adjective'
        });
        result.adjectives.push(entry);
        result.all.push(entry);
      });
    }

    if (tierData.phrases) {
      tierData.phrases.forEach(function(item, i) {
        const entry = Object.assign({}, item, {
          _srsId: 'phrase_' + i,
          _type: 'phrase'
        });
        result.phrases.push(entry);
        result.all.push(entry);
      });
    }

    if (tierData.sentences) {
      tierData.sentences.forEach(function(item, i) {
        const entry = Object.assign({}, item, {
          _srsId: 'sent_' + i,
          _type: 'sentence'
        });
        result.sentences.push(entry);
      });
    }

    return result;
  },

  /**
   * Get the Korean text from an item (handles different field names)
   */
  getKorean(item) {
    return item.kr || item.korean || item.ko || item.word || item.base || '';
  },

  /**
   * Get the English text from an item
   */
  getEnglish(item) {
    return item.english || item.en || item.meaning || '';
  },

  /**
   * Get romanization from an item
   */
  getRomanization(item) {
    return item.rom || item.romanization || item.roman || item.baseRom || item.politeRom || '';
  },

  /**
   * Get emoji from an item
   */
  getEmoji(item) {
    return item.emoji || '';
  }
};
