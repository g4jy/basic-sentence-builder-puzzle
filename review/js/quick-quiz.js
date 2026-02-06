/* ============================================
   Quick Quiz — Multiple Choice Game
   ============================================ */

(function() {
  'use strict';

  var QUIZ_SIZE = 10;
  var direction = 'ko-en';
  var questions = [];
  var allItems = [];
  var currentIndex = 0;
  var sessionCorrect = 0;
  var sessionIncorrect = 0;
  var currentStreak = 0;
  var answered = false;

  async function init() {
    var ok = await StudentManager.init();
    if (!ok || !StudentManager.current) {
      window.location.href = 'index.html';
      return;
    }

    Nav.renderHeader('Quick Quiz');
    loadQuiz();
  }

  function loadQuiz() {
    var tierData = StudentManager.getCurrentTierData();
    if (!tierData) {
      document.getElementById('game-area').innerHTML =
        '<div class="text-center text-muted mt-lg">No vocabulary data loaded yet.</div>';
      return;
    }

    var items = DataHelper.extractItems(tierData);
    allItems = items.all;

    if (allItems.length < 4) {
      document.getElementById('game-area').innerHTML =
        '<div class="text-center text-muted mt-lg">Need at least 4 items for a quiz.</div>';
      return;
    }

    var selected = SRS.getItemsByPriority(StudentManager.current.id, allItems, QUIZ_SIZE);
    questions = selected.map(function(item) {
      return buildQuestion(item);
    });

    currentIndex = 0;
    sessionCorrect = 0;
    sessionIncorrect = 0;
    currentStreak = 0;
    answered = false;

    document.getElementById('session-complete').classList.add('hidden');
    document.getElementById('game-controls').classList.remove('hidden');
    document.getElementById('game-area').classList.remove('hidden');

    showQuestion();
  }

  function buildQuestion(correctItem) {
    var correctKo = DataHelper.getKorean(correctItem);
    var correctEn = DataHelper.getEnglish(correctItem);

    // Get distractors from same category if possible, then fill from all
    var sameCategory = allItems.filter(function(item) {
      return item._type === correctItem._type && DataHelper.getKorean(item) !== correctKo;
    });

    var otherItems = allItems.filter(function(item) {
      return DataHelper.getKorean(item) !== correctKo;
    });

    var pool = sameCategory.length >= 3 ? sameCategory : otherItems;
    var distractorItems = Utils.pick(pool, 3);

    // Ensure we have exactly 3 distractors that are different from correct
    while (distractorItems.length < 3) {
      var fallback = Utils.pick(otherItems, 1);
      if (fallback.length > 0) distractorItems.push(fallback[0]);
      else break;
    }

    var options;
    if (direction === 'ko-en') {
      options = distractorItems.map(function(d) {
        return { text: DataHelper.getEnglish(d), correct: false };
      });
      options.push({ text: correctEn, correct: true });
    } else {
      options = distractorItems.map(function(d) {
        return { text: DataHelper.getKorean(d), correct: false };
      });
      options.push({ text: correctKo, correct: true });
    }

    options = Utils.shuffle(options);

    return {
      item: correctItem,
      prompt: direction === 'ko-en' ? correctKo : correctEn,
      promptEmoji: DataHelper.getEmoji(correctItem),
      correctAnswer: direction === 'ko-en' ? correctEn : correctKo,
      options: options
    };
  }

  function showQuestion() {
    if (currentIndex >= questions.length) {
      showSessionComplete();
      return;
    }

    answered = false;
    var q = questions[currentIndex];
    updateStats();

    var html =
      '<div class="game-prompt fade-in">' +
      (q.promptEmoji ? '<div style="font-size: 2rem; margin-bottom: 8px;">' + q.promptEmoji + '</div>' : '') +
      '<div class="' + (direction === 'ko-en' ? 'korean-text-lg' : 'english-text') + '" style="' +
      (direction === 'en-ko' ? 'font-size: 1.5rem; font-weight: 500; color: var(--text-primary);' : '') + '">' +
      Utils.escapeHtml(q.prompt) + '</div>';

    if (direction === 'ko-en') {
      html += '<button class="tts-btn mt-sm" onclick="TTS.speak(\'' +
        Utils.escapeHtml(q.prompt).replace(/'/g, "\\'") + '\')" aria-label="Listen">&#128266;</button>';
    }

    html += '</div>';

    html += '<div class="quiz-options">';
    var letters = ['A', 'B', 'C', 'D'];
    q.options.forEach(function(opt, i) {
      html += '<button class="quiz-option" data-index="' + i + '" onclick="window._selectOption(' + i + ')">' +
        '<span class="quiz-option-letter">' + letters[i] + '</span>' +
        '<span>' + Utils.escapeHtml(opt.text) + '</span>' +
        '</button>';
    });
    html += '</div>';

    html += '<div id="feedback-area" class="mt-md"></div>';

    document.getElementById('game-area').innerHTML = html;
  }

  function selectOption(index) {
    if (answered) return;
    answered = true;

    var q = questions[currentIndex];
    var selected = q.options[index];
    var isCorrect = selected.correct;

    // Record SRS
    SRS.recordAnswer(StudentManager.current.id, q.item._srsId, isCorrect);

    if (isCorrect) {
      sessionCorrect++;
      currentStreak++;
    } else {
      sessionIncorrect++;
      currentStreak = 0;
    }

    // Highlight options
    var optionEls = document.querySelectorAll('.quiz-option');
    optionEls.forEach(function(el, i) {
      el.classList.add('disabled');
      if (q.options[i].correct) {
        el.classList.add('correct');
      } else if (i === index && !isCorrect) {
        el.classList.add('incorrect');
      }
    });

    // Show feedback
    var feedbackArea = document.getElementById('feedback-area');
    if (isCorrect) {
      feedbackArea.innerHTML = '<div class="correct-feedback fade-in">Correct!</div>';
      if (direction === 'en-ko') {
        TTS.speak(q.correctAnswer);
      }
    } else {
      feedbackArea.innerHTML = '<div class="incorrect-feedback fade-in">The answer is: <strong>' +
        Utils.escapeHtml(q.correctAnswer) + '</strong></div>';
    }

    updateStats();

    // Auto advance after delay
    setTimeout(function() {
      currentIndex++;
      showQuestion();
    }, isCorrect ? 1200 : 2500);
  }

  function updateStats() {
    var total = questions.length;
    var pct = total > 0 ? Math.round((currentIndex / total) * 100) : 0;
    var fill = document.getElementById('progress-fill');
    if (fill) fill.style.width = pct + '%';

    var qEl = document.getElementById('quiz-question');
    if (qEl) qEl.textContent = Math.min(currentIndex + 1, total) + '/' + total;

    var streakEl = document.getElementById('quiz-streak');
    if (streakEl) {
      streakEl.textContent = currentStreak;
      if (currentStreak > 0) {
        streakEl.classList.remove('streak-bump');
        void streakEl.offsetWidth; // force reflow
        streakEl.classList.add('streak-bump');
      }
    }

    var totalAnswered = sessionCorrect + sessionIncorrect;
    var accEl = document.getElementById('quiz-accuracy');
    if (accEl) accEl.textContent = totalAnswered > 0 ? Utils.formatPercent(sessionCorrect, totalAnswered) : '0%';
  }

  function showSessionComplete() {
    document.getElementById('game-area').classList.add('hidden');
    document.getElementById('game-controls').classList.add('hidden');

    var total = sessionCorrect + sessionIncorrect;
    var accuracy = total > 0 ? Utils.formatPercent(sessionCorrect, total) : '0%';
    var emoji = sessionCorrect >= total * 0.8 ? '🏆' : sessionCorrect >= total * 0.5 ? '👏' : '💪';

    var progressData = Progress.load(StudentManager.current.id, 'quick-quiz');
    Progress.save(StudentManager.current.id, 'quick-quiz', {
      sessionsCompleted: (progressData.sessionsCompleted || 0) + 1,
      bestStreak: Math.max(progressData.bestStreak || 0, currentStreak)
    });

    var container = document.getElementById('session-complete');
    container.classList.remove('hidden');
    container.innerHTML =
      '<div class="session-complete fade-in">' +
      '<div class="session-complete-emoji">' + emoji + '</div>' +
      '<div class="session-complete-title">Quiz Complete!</div>' +
      '<div class="session-complete-stats">' +
      '<div class="session-stat"><span class="session-stat-label">Questions</span><span class="session-stat-value">' + total + '</span></div>' +
      '<div class="session-stat"><span class="session-stat-label">Correct</span><span class="session-stat-value" style="color: var(--correct)">' + sessionCorrect + '</span></div>' +
      '<div class="session-stat"><span class="session-stat-label">Incorrect</span><span class="session-stat-value" style="color: var(--incorrect)">' + sessionIncorrect + '</span></div>' +
      '<div class="session-stat"><span class="session-stat-label">Accuracy</span><span class="session-stat-value">' + accuracy + '</span></div>' +
      '<div class="session-stat"><span class="session-stat-label">Best Streak</span><span class="session-stat-value" style="color: var(--tier-color)">' + currentStreak + '</span></div>' +
      '</div>' +
      '<div class="flex gap-sm mt-lg" style="width: 100%;">' +
      '<button class="btn btn-outline btn-lg flex-1" onclick="Nav.goHome()">Home</button>' +
      '<button class="btn btn-primary btn-lg flex-1" onclick="window._restart()">Again</button>' +
      '</div>' +
      '</div>';
  }

  // Expose
  window._selectOption = selectOption;
  window._restart = function() {
    // Rebuild questions because direction might have changed
    loadQuiz();
  };

  window.setDirection = function(dir) {
    direction = dir;
    var buttons = document.querySelectorAll('#direction-toggle button');
    buttons.forEach(function(btn) {
      btn.classList.toggle('active', btn.getAttribute('data-dir') === dir);
    });
    loadQuiz();
  };

  init();
})();
