/* ============================================
   Flashcards Game — SRS-driven card review
   ============================================ */

(function() {
  'use strict';

  var SESSION_SIZE = 20;
  var direction = 'ko-en'; // 'ko-en' or 'en-ko'
  var cards = [];
  var currentIndex = 0;
  var sessionCorrect = 0;
  var sessionIncorrect = 0;
  var isFlipped = false;

  async function init() {
    var ok = await StudentManager.init();
    if (!ok || !StudentManager.current) {
      window.location.href = 'index.html';
      return;
    }

    Nav.renderHeader('Flashcards');
    loadCards();
  }

  function loadCards() {
    var tierData = StudentManager.getCurrentTierData();
    if (!tierData) {
      document.getElementById('game-area').innerHTML =
        '<div class="text-center text-muted mt-lg">No vocabulary data loaded yet. Tier data file needed.</div>';
      return;
    }

    var items = DataHelper.extractItems(tierData);
    if (items.all.length === 0) {
      document.getElementById('game-area').innerHTML =
        '<div class="text-center text-muted mt-lg">No items available for review.</div>';
      return;
    }

    cards = SRS.getItemsByPriority(StudentManager.current.id, items.all, SESSION_SIZE);
    currentIndex = 0;
    sessionCorrect = 0;
    sessionIncorrect = 0;
    isFlipped = false;

    document.getElementById('session-complete').classList.add('hidden');
    document.getElementById('game-controls').classList.remove('hidden');
    document.getElementById('game-area').classList.remove('hidden');

    showCard();
  }

  function showCard() {
    if (currentIndex >= cards.length) {
      showSessionComplete();
      return;
    }

    isFlipped = false;
    var card = cards[currentIndex];
    var korean = DataHelper.getKorean(card);
    var english = DataHelper.getEnglish(card);
    var roman = DataHelper.getRomanization(card);
    var emoji = DataHelper.getEmoji(card);
    var example = card.example || card.exampleKo || '';
    var exampleEn = card.exampleEn || '';

    updateProgress();

    var frontContent, backContent;

    if (direction === 'ko-en') {
      frontContent =
        (emoji ? '<div style="font-size: 2rem; margin-bottom: 8px;">' + emoji + '</div>' : '') +
        '<div class="korean-text-lg">' + Utils.escapeHtml(korean) + '</div>' +
        '<button class="tts-btn mt-sm" onclick="event.stopPropagation(); TTS.speak(\'' + Utils.escapeHtml(korean).replace(/'/g, "\\'") + '\')" aria-label="Listen">&#128266;</button>' +
        '<div class="flashcard-hint">Tap to reveal</div>';

      backContent =
        '<div class="english-text" style="font-size: 1.3rem; font-weight: 500; color: var(--text-primary);">' + Utils.escapeHtml(english) + '</div>' +
        (roman ? '<div class="romanization mt-sm">' + Utils.escapeHtml(roman) + '</div>' : '') +
        (example ? '<div class="mt-md" style="border-top: 1px solid var(--border-light); padding-top: 12px;">' +
          '<div class="korean-text-sm">' + Utils.escapeHtml(example) + '</div>' +
          (exampleEn ? '<div class="english-text mt-sm" style="font-size: 0.85rem;">' + Utils.escapeHtml(exampleEn) + '</div>' : '') +
          '</div>' : '');
    } else {
      frontContent =
        (emoji ? '<div style="font-size: 2rem; margin-bottom: 8px;">' + emoji + '</div>' : '') +
        '<div class="english-text" style="font-size: 1.5rem; font-weight: 500; color: var(--text-primary);">' + Utils.escapeHtml(english) + '</div>' +
        '<div class="flashcard-hint">Tap to reveal</div>';

      backContent =
        '<div class="korean-text-lg">' + Utils.escapeHtml(korean) + '</div>' +
        (roman ? '<div class="romanization mt-sm">' + Utils.escapeHtml(roman) + '</div>' : '') +
        '<button class="tts-btn mt-sm" onclick="event.stopPropagation(); TTS.speak(\'' + Utils.escapeHtml(korean).replace(/'/g, "\\'") + '\')" aria-label="Listen">&#128266;</button>' +
        (example ? '<div class="mt-md" style="border-top: 1px solid var(--border-light); padding-top: 12px;">' +
          '<div class="korean-text-sm">' + Utils.escapeHtml(example) + '</div>' +
          (exampleEn ? '<div class="english-text mt-sm" style="font-size: 0.85rem;">' + Utils.escapeHtml(exampleEn) + '</div>' : '') +
          '</div>' : '');
    }

    var html =
      '<div class="flashcard-container fade-in" onclick="window._flipCard()">' +
      '<div class="flashcard" id="flashcard">' +
      '<div class="flashcard-front">' + frontContent + '</div>' +
      '<div class="flashcard-back">' + backContent + '</div>' +
      '</div>' +
      '</div>' +
      '<div class="game-actions" id="card-actions" style="visibility: hidden;">' +
      '<button class="btn btn-danger btn-lg" onclick="window._answer(false)">Still Learning</button>' +
      '<button class="btn btn-success btn-lg" onclick="window._answer(true)">I Know</button>' +
      '</div>';

    document.getElementById('game-area').innerHTML = html;
  }

  function flipCard() {
    if (isFlipped) return;
    isFlipped = true;
    var el = document.getElementById('flashcard');
    if (el) el.classList.add('flipped');
    var actions = document.getElementById('card-actions');
    if (actions) actions.style.visibility = 'visible';
  }

  function answer(correct) {
    var card = cards[currentIndex];
    SRS.recordAnswer(StudentManager.current.id, card._srsId, correct);

    if (correct) {
      sessionCorrect++;
    } else {
      sessionIncorrect++;
    }

    currentIndex++;
    showCard();
  }

  function updateProgress() {
    var total = cards.length;
    var pct = total > 0 ? Math.round((currentIndex / total) * 100) : 0;
    var fill = document.getElementById('progress-fill');
    if (fill) fill.style.width = pct + '%';

    var text = document.getElementById('progress-text');
    if (text) text.textContent = currentIndex + ' / ' + total;

    var acc = document.getElementById('session-accuracy');
    var answered = sessionCorrect + sessionIncorrect;
    if (acc) acc.textContent = (answered > 0 ? Utils.formatPercent(sessionCorrect, answered) : '0%') + ' correct';
  }

  function showSessionComplete() {
    document.getElementById('game-area').classList.add('hidden');
    document.getElementById('game-controls').classList.add('hidden');

    var total = sessionCorrect + sessionIncorrect;
    var accuracy = total > 0 ? Utils.formatPercent(sessionCorrect, total) : '0%';
    var emoji = sessionCorrect >= total * 0.8 ? '🎉' : sessionCorrect >= total * 0.5 ? '👍' : '💪';

    var progressData = Progress.load(StudentManager.current.id, 'flashcards');
    Progress.save(StudentManager.current.id, 'flashcards', {
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
      '<div class="session-stat"><span class="session-stat-label">Cards Reviewed</span><span class="session-stat-value">' + total + '</span></div>' +
      '<div class="session-stat"><span class="session-stat-label">Correct</span><span class="session-stat-value" style="color: var(--correct)">' + sessionCorrect + '</span></div>' +
      '<div class="session-stat"><span class="session-stat-label">Still Learning</span><span class="session-stat-value" style="color: var(--incorrect)">' + sessionIncorrect + '</span></div>' +
      '<div class="session-stat"><span class="session-stat-label">Accuracy</span><span class="session-stat-value">' + accuracy + '</span></div>' +
      '</div>' +
      '<div class="flex gap-sm mt-lg" style="width: 100%;">' +
      '<button class="btn btn-outline btn-lg flex-1" onclick="Nav.goHome()">Home</button>' +
      '<button class="btn btn-primary btn-lg flex-1" onclick="window._restart()">Again</button>' +
      '</div>' +
      '</div>';
  }

  // Expose to global scope for onclick handlers
  window._flipCard = flipCard;
  window._answer = answer;
  window._restart = loadCards;

  window.setDirection = function(dir) {
    direction = dir;
    var buttons = document.querySelectorAll('#direction-toggle button');
    buttons.forEach(function(btn) {
      btn.classList.toggle('active', btn.getAttribute('data-dir') === dir);
    });
    loadCards();
  };

  init();
})();
