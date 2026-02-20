/* ============================================
   Sentence Builder — Arrange blocks to form Korean sentences
   ============================================ */

(function() {
  'use strict';

  var SESSION_SIZE = 10;
  var sentences = [];
  var currentIndex = 0;
  var sessionCorrect = 0;
  var sessionIncorrect = 0;
  var selectedBlocks = []; // indices into shuffledBlocks
  var shuffledBlocks = []; // { text, isDistractor, originalIndex }
  var correctBlocks = [];  // correct answer block array
  var checked = false;
  var showRom = true;
  var showEng = true;

  async function init() {
    var ok = await StudentManager.init();
    if (!ok || !StudentManager.current) {
      window.location.href = 'index.html';
      return;
    }

    Nav.renderHeader('Sentence Builder');
    loadSession();
  }

  function loadSession() {
    var tierData = StudentManager.getCurrentTierData();
    if (!tierData) {
      document.getElementById('game-area').innerHTML =
        '<div class="text-center text-muted mt-lg">No sentence data loaded yet.</div>';
      return;
    }

    var items = DataHelper.extractItems(tierData);
    if (items.sentences.length === 0) {
      document.getElementById('game-area').innerHTML =
        '<div class="text-center text-muted mt-lg">No sentences available for this tier.</div>';
      return;
    }

    sentences = SRS.getItemsByPriority(StudentManager.current.id, items.sentences, SESSION_SIZE);
    currentIndex = 0;
    sessionCorrect = 0;
    sessionIncorrect = 0;

    document.getElementById('session-complete').classList.add('hidden');
    document.getElementById('game-controls').classList.remove('hidden');
    document.getElementById('game-area').classList.remove('hidden');

    showSentence();
  }

  function showSentence() {
    if (currentIndex >= sentences.length) {
      showSessionComplete();
      return;
    }

    checked = false;
    selectedBlocks = [];
    var sent = sentences[currentIndex];

    // Get blocks from sentence data
    correctBlocks = sent.blocks || [];
    if (correctBlocks.length === 0) {
      // Fallback: split Korean text by spaces
      var ko = DataHelper.getKorean(sent);
      correctBlocks = ko.split(/\s+/).filter(function(b) { return b.length > 0; });
    }

    var english = DataHelper.getEnglish(sent);
    var emoji = DataHelper.getEmoji(sent);
    var rom = DataHelper.getRomanization(sent);

    // Create distractors (1-2 random blocks from other sentences)
    var distractors = [];
    if (sent.distractors && sent.distractors.length > 0) {
      distractors = sent.distractors.slice();
    } else {
      distractors = generateDistractors(sent, 2);
    }

    // Build shuffled blocks array
    var allBlocks = correctBlocks.map(function(text, i) {
      return { text: text, isDistractor: false, originalIndex: i };
    });
    distractors.forEach(function(text) {
      allBlocks.push({ text: text, isDistractor: true, originalIndex: -1 });
    });

    shuffledBlocks = Utils.shuffle(allBlocks);

    updateStats();
    renderSentence(english, emoji, rom);
  }

  function generateDistractors(currentSent, count) {
    var tierData = StudentManager.getCurrentTierData();
    if (!tierData || !tierData.sentences) return [];

    var distractors = [];
    var allSentences = tierData.sentences.filter(function(s) {
      return DataHelper.getKorean(s) !== DataHelper.getKorean(currentSent);
    });

    if (allSentences.length === 0) return [];

    var picked = Utils.pick(allSentences, count);
    picked.forEach(function(s) {
      var blocks = s.blocks || DataHelper.getKorean(s).split(/\s+/);
      if (blocks.length > 0) {
        var randomBlock = blocks[Math.floor(Math.random() * blocks.length)];
        // Ensure it's not already in correctBlocks
        if (correctBlocks.indexOf(randomBlock) === -1 && distractors.indexOf(randomBlock) === -1) {
          distractors.push(randomBlock);
        }
      }
    });

    return distractors;
  }

  function renderSentence(english, emoji, rom) {
    var html =
      '<div class="game-prompt fade-in">' +
      (emoji ? '<div style="font-size: 1.8rem; margin-bottom: 8px;">' + emoji + '</div>' : '') +
      '<div class="sb-eng english-text" style="font-size: 1.2rem; font-weight: 500; color: var(--text-primary);">' + Utils.escapeHtml(english) + '</div>' +
      (rom ? '<div class="sb-rom romanization mt-sm">' + Utils.escapeHtml(rom) + '</div>' : '') +
      '<div class="text-muted mt-sm" style="font-size: 0.8rem;">Arrange the blocks to form the Korean sentence</div>' +
      '</div>';

    // Answer area
    html += '<div class="answer-area" id="answer-area">';
    if (selectedBlocks.length === 0) {
      html += '<span class="answer-area-placeholder">Tap blocks below to build the sentence</span>';
    }
    html += '</div>';

    // Available blocks
    html += '<div class="blocks-area" id="blocks-area">';
    shuffledBlocks.forEach(function(block, i) {
      var usedClass = selectedBlocks.indexOf(i) !== -1 ? ' used' : '';
      var distractorClass = block.isDistractor ? ' distractor' : '';
      html += '<div class="block' + distractorClass + usedClass + '" data-index="' + i + '" onclick="window._tapBlock(' + i + ')">' +
        Utils.escapeHtml(block.text) + '</div>';
    });
    html += '</div>';

    // Action buttons
    html += '<div class="game-actions mt-md">';
    html += '<button class="btn btn-ghost" onclick="window._clearBlocks()">Clear</button>';
    html += '<button class="btn btn-primary btn-lg" id="check-btn" onclick="window._checkAnswer()" ' +
      (selectedBlocks.length === 0 ? 'disabled' : '') + '>Check</button>';
    html += '</div>';

    html += '<div id="feedback-area" class="mt-md"></div>';

    document.getElementById('game-area').innerHTML = html;
    applyToggles();
  }

  function tapBlock(index) {
    if (checked) return;
    if (selectedBlocks.indexOf(index) !== -1) return; // already used

    selectedBlocks.push(index);
    updateDisplay();
  }

  function removeFromAnswer(position) {
    if (checked) return;
    selectedBlocks.splice(position, 1);
    updateDisplay();
  }

  function clearBlocks() {
    if (checked) return;
    selectedBlocks = [];
    updateDisplay();
  }

  function updateDisplay() {
    // Update answer area
    var answerArea = document.getElementById('answer-area');
    if (selectedBlocks.length === 0) {
      answerArea.innerHTML = '<span class="answer-area-placeholder">Tap blocks below to build the sentence</span>';
    } else {
      var html = '';
      selectedBlocks.forEach(function(blockIdx, pos) {
        var block = shuffledBlocks[blockIdx];
        html += '<div class="block placed" onclick="window._removeFromAnswer(' + pos + ')">' +
          Utils.escapeHtml(block.text) + '</div>';
      });
      answerArea.innerHTML = html;
    }

    // Update available blocks
    var blockEls = document.querySelectorAll('#blocks-area .block');
    blockEls.forEach(function(el) {
      var idx = parseInt(el.getAttribute('data-index'));
      if (selectedBlocks.indexOf(idx) !== -1) {
        el.classList.add('used');
      } else {
        el.classList.remove('used');
      }
    });

    // Update check button
    var checkBtn = document.getElementById('check-btn');
    if (checkBtn) {
      checkBtn.disabled = selectedBlocks.length === 0;
    }
  }

  function checkAnswer() {
    if (checked) return;
    checked = true;

    var userAnswer = selectedBlocks.map(function(idx) {
      return shuffledBlocks[idx].text;
    });

    var isCorrect = userAnswer.length === correctBlocks.length &&
      userAnswer.every(function(text, i) { return text === correctBlocks[i]; });

    var sent = sentences[currentIndex];
    SRS.recordAnswer(StudentManager.current.id, sent._srsId, isCorrect);

    if (isCorrect) {
      sessionCorrect++;
    } else {
      sessionIncorrect++;
    }

    // Visual feedback on answer area blocks
    var answerBlockEls = document.querySelectorAll('#answer-area .block');
    answerBlockEls.forEach(function(el, i) {
      if (isCorrect) {
        el.classList.add('correct-block');
      } else {
        if (i < correctBlocks.length && userAnswer[i] === correctBlocks[i]) {
          el.classList.add('correct-block');
        } else {
          el.classList.add('incorrect-block');
        }
      }
    });

    // Feedback
    var feedbackArea = document.getElementById('feedback-area');
    var koreanText = correctBlocks.join(' ');
    var rom = DataHelper.getRomanization(sent);

    if (isCorrect) {
      feedbackArea.innerHTML = '<div class="correct-feedback fade-in">Correct! ' +
        '<span class="korean-text-sm">' + Utils.escapeHtml(koreanText) + '</span>' +
        (rom ? '<div class="sb-rom romanization mt-sm">' + Utils.escapeHtml(rom) + '</div>' : '') +
        '</div>';
      TTS.speak(koreanText);
    } else {
      feedbackArea.innerHTML = '<div class="incorrect-feedback fade-in">Correct answer: ' +
        '<span class="korean-text-sm">' + Utils.escapeHtml(koreanText) + '</span>' +
        (rom ? '<div class="sb-rom romanization mt-sm">' + Utils.escapeHtml(rom) + '</div>' : '') +
        '</div>';
    }

    // Replace check button with next button
    var checkBtn = document.getElementById('check-btn');
    if (checkBtn) {
      checkBtn.textContent = 'Next';
      checkBtn.onclick = function() {
        currentIndex++;
        showSentence();
      };
      checkBtn.disabled = false;
      checkBtn.className = 'btn btn-primary btn-lg';
    }

    updateStats();
    applyToggles();
  }

  function updateStats() {
    var total = sentences.length;
    var pct = total > 0 ? Math.round((currentIndex / total) * 100) : 0;
    var fill = document.getElementById('progress-fill');
    if (fill) fill.style.width = pct + '%';

    var qEl = document.getElementById('sb-question');
    if (qEl) qEl.textContent = Math.min(currentIndex + 1, total) + '/' + total;

    var correctEl = document.getElementById('sb-correct');
    if (correctEl) correctEl.textContent = sessionCorrect;

    var totalAnswered = sessionCorrect + sessionIncorrect;
    var accEl = document.getElementById('sb-accuracy');
    if (accEl) accEl.textContent = totalAnswered > 0 ? Utils.formatPercent(sessionCorrect, totalAnswered) : '0%';
  }

  function showSessionComplete() {
    document.getElementById('game-area').classList.add('hidden');
    document.getElementById('game-controls').classList.add('hidden');

    var total = sessionCorrect + sessionIncorrect;
    var accuracy = total > 0 ? Utils.formatPercent(sessionCorrect, total) : '0%';
    var emoji = sessionCorrect >= total * 0.8 ? '🧩' : sessionCorrect >= total * 0.5 ? '👍' : '💪';

    var progressData = Progress.load(StudentManager.current.id, 'sentence-builder');
    Progress.save(StudentManager.current.id, 'sentence-builder', {
      sessionsCompleted: (progressData.sessionsCompleted || 0) + 1,
      bestStreak: Math.max(progressData.bestStreak || 0, sessionCorrect)
    });

    var container = document.getElementById('session-complete');
    container.classList.remove('hidden');
    container.innerHTML =
      '<div class="session-complete fade-in">' +
      '<div class="session-complete-emoji">' + emoji + '</div>' +
      '<div class="session-complete-title">Session Complete!</div>' +
      '<div class="session-complete-stats">' +
      '<div class="session-stat"><span class="session-stat-label">Sentences</span><span class="session-stat-value">' + total + '</span></div>' +
      '<div class="session-stat"><span class="session-stat-label">Correct</span><span class="session-stat-value" style="color: var(--correct)">' + sessionCorrect + '</span></div>' +
      '<div class="session-stat"><span class="session-stat-label">Incorrect</span><span class="session-stat-value" style="color: var(--incorrect)">' + sessionIncorrect + '</span></div>' +
      '<div class="session-stat"><span class="session-stat-label">Accuracy</span><span class="session-stat-value">' + accuracy + '</span></div>' +
      '</div>' +
      '<div class="flex gap-sm mt-lg" style="width: 100%;">' +
      '<button class="btn btn-outline btn-lg flex-1" onclick="Nav.goHome()">Home</button>' +
      '<button class="btn btn-primary btn-lg flex-1" onclick="window._restart()">Again</button>' +
      '</div>' +
      '</div>';
  }

  // ============================================
  // Toggle Settings
  // ============================================

  function toggleRom() {
    showRom = !showRom;
    var btn = document.getElementById('toggle-rom');
    btn.classList.toggle('active', showRom);
    applyToggles();
  }

  function toggleEng() {
    showEng = !showEng;
    var btn = document.getElementById('toggle-eng');
    btn.classList.toggle('active', showEng);
    applyToggles();
  }

  function applyToggles() {
    var romEls = document.querySelectorAll('.sb-rom');
    var engEls = document.querySelectorAll('.sb-eng');
    romEls.forEach(function(el) { el.style.display = showRom ? '' : 'none'; });
    engEls.forEach(function(el) { el.style.display = showEng ? '' : 'none'; });
  }

  // Expose
  window._tapBlock = tapBlock;
  window._removeFromAnswer = removeFromAnswer;
  window._clearBlocks = clearBlocks;
  window._checkAnswer = checkAnswer;
  window._restart = loadSession;
  window._toggleRom = toggleRom;
  window._toggleEng = toggleEng;

  init();
})();
