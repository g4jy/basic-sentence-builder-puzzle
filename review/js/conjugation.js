/* ============================================
   Conjugation Practice — Verb form drills
   Builder and Conversation tiers only
   ============================================ */

(function() {
  'use strict';

  var SESSION_SIZE = 10;
  var TENSES = [
    { key: 'present', label: 'Present Polite', labelKr: '현재 존댓말', field: 'polite' },
    { key: 'past', label: 'Past', labelKr: '과거', field: 'past' },
    { key: 'future', label: 'Future', labelKr: '미래', field: 'future' },
    { key: 'negative', label: 'Negative', labelKr: '부정', field: 'negative' }
  ];

  var verbs = [];
  var questions = [];
  var currentIndex = 0;
  var sessionCorrect = 0;
  var sessionIncorrect = 0;
  var currentStreak = 0;
  var answered = false;
  var inputMode = 'type'; // 'type' or 'select'

  async function init() {
    var ok = await StudentManager.init();
    if (!ok || !StudentManager.current) {
      window.location.href = 'index.html';
      return;
    }

    // Check tier — only builder and conversation
    var tier = StudentManager.current.tier;
    if (tier !== 'builder' && tier !== 'conversation') {
      document.getElementById('game-area').innerHTML =
        '<div class="text-center text-muted mt-lg">' +
        '<p>Conjugation practice is available for Builder and Conversation tiers.</p>' +
        '<button class="btn btn-outline mt-md" onclick="Nav.goHome()">Back to Home</button>' +
        '</div>';
      return;
    }

    Nav.renderHeader('Conjugation');
    loadSession();
  }

  function loadSession() {
    var tierData = StudentManager.getCurrentTierData();
    if (!tierData) {
      document.getElementById('game-area').innerHTML =
        '<div class="text-center text-muted mt-lg">No verb data loaded yet.</div>';
      return;
    }

    var items = DataHelper.extractItems(tierData);
    verbs = items.verbs;

    if (verbs.length === 0) {
      document.getElementById('game-area').innerHTML =
        '<div class="text-center text-muted mt-lg">No verbs available for conjugation practice.</div>';
      return;
    }

    // Build questions: each verb gets a random tense
    var selectedVerbs = SRS.getItemsByPriority(StudentManager.current.id, verbs, SESSION_SIZE);
    questions = selectedVerbs.map(function(verb) {
      // Pick a random tense that exists in the verb data
      var availableTenses = TENSES.filter(function(t) {
        return verb[t.field] || (verb.conjugations && verb.conjugations[t.field]);
      });

      // If no conjugation data exists, still show the question (user needs to know the form)
      var tense;
      if (availableTenses.length > 0) {
        tense = availableTenses[Math.floor(Math.random() * availableTenses.length)];
      } else {
        tense = TENSES[Math.floor(Math.random() * TENSES.length)];
      }

      var correctAnswer = '';
      var romanization = '';
      if (verb.conjugations && verb.conjugations[tense.field]) {
        var conj = verb.conjugations[tense.field];
        if (typeof conj === 'string') {
          correctAnswer = conj;
        } else if (conj.korean || conj.ko) {
          correctAnswer = conj.korean || conj.ko;
          romanization = conj.romanization || conj.roman || '';
        }
      } else if (verb[tense.field]) {
        correctAnswer = verb[tense.field];
        romanization = verb[tense.field + 'Rom'] || '';
      }

      return {
        verb: verb,
        tense: tense,
        correctAnswer: correctAnswer,
        romanization: romanization,
        srsId: verb._srsId + '_' + tense.key
      };
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

  function showQuestion() {
    if (currentIndex >= questions.length) {
      showSessionComplete();
      return;
    }

    answered = false;
    var q = questions[currentIndex];
    var verb = q.verb;
    var base = DataHelper.getKorean(verb);
    var english = DataHelper.getEnglish(verb);
    var emoji = DataHelper.getEmoji(verb);

    updateStats();

    var html =
      '<div class="game-prompt fade-in">' +
      (emoji ? '<div style="font-size: 1.8rem; margin-bottom: 8px;">' + emoji + '</div>' : '') +
      '<div class="korean-text-lg">' + Utils.escapeHtml(base) + '</div>' +
      '<div class="english-text mt-sm">' + Utils.escapeHtml(english) + '</div>' +
      '<button class="tts-btn mt-sm" onclick="TTS.speak(\'' + Utils.escapeHtml(base).replace(/'/g, "\\'") + '\')" aria-label="Listen">&#128266;</button>' +
      '<div class="mt-md">' +
      '<span class="tense-badge">' + q.tense.labelKr + ' (' + q.tense.label + ')</span>' +
      '</div>' +
      '</div>';

    if (q.correctAnswer) {
      // Generate options for select mode
      var options = generateOptions(q);

      // Mode toggle
      html += '<div class="direction-toggle mb-md" id="mode-toggle">';
      html += '<button class="' + (inputMode === 'type' ? 'active' : '') + '" onclick="window._setMode(\'type\')">Type Answer</button>';
      html += '<button class="' + (inputMode === 'select' ? 'active' : '') + '" onclick="window._setMode(\'select\')">Choose Answer</button>';
      html += '</div>';

      if (inputMode === 'type') {
        html += '<div class="text-center">';
        html += '<input type="text" class="conjugation-input" id="conj-input" placeholder="Type the conjugated form..." autocomplete="off" autocapitalize="off" />';
        html += '</div>';
        html += '<div class="game-actions mt-md">';
        html += '<button class="btn btn-primary btn-lg" id="submit-btn" onclick="window._submitTyped()">Check</button>';
        html += '</div>';
      } else {
        html += '<div class="quiz-options" id="conj-options">';
        var letters = ['A', 'B', 'C', 'D'];
        options.forEach(function(opt, i) {
          html += '<button class="quiz-option" data-index="' + i + '" onclick="window._selectOption(' + i + ')">' +
            '<span class="quiz-option-letter">' + letters[i] + '</span>' +
            '<span class="korean-text-sm">' + Utils.escapeHtml(opt.text) + '</span>' +
            '</button>';
        });
        html += '</div>';
      }
    } else {
      html += '<div class="text-center text-muted mt-md">' +
        '<p>Conjugation data not available for this verb/tense combination.</p>' +
        '</div>';
      html += '<div class="game-actions mt-md">';
      html += '<button class="btn btn-primary btn-lg" onclick="window._skipQuestion()">Skip</button>';
      html += '</div>';
    }

    html += '<div id="feedback-area" class="mt-md"></div>';

    document.getElementById('game-area').innerHTML = html;

    // Focus input if type mode
    if (inputMode === 'type' && q.correctAnswer) {
      var input = document.getElementById('conj-input');
      if (input) {
        input.addEventListener('keydown', function(e) {
          if (e.key === 'Enter') window._submitTyped();
        });
        setTimeout(function() { input.focus(); }, 100);
      }
    }
  }

  function generateOptions(q) {
    var correct = q.correctAnswer;
    var options = [{ text: correct, correct: true }];

    // Generate 3 distractors from other verbs/tenses
    var otherVerbs = verbs.filter(function(v) {
      return DataHelper.getKorean(v) !== DataHelper.getKorean(q.verb);
    });

    var distractorTexts = [];
    var attempts = 0;

    while (distractorTexts.length < 3 && attempts < 20) {
      attempts++;
      var randomVerb = otherVerbs[Math.floor(Math.random() * otherVerbs.length)];
      if (!randomVerb) break;

      var randomTense = TENSES[Math.floor(Math.random() * TENSES.length)];
      var form = '';
      if (randomVerb.conjugations && randomVerb.conjugations[randomTense.field]) {
        var conj = randomVerb.conjugations[randomTense.field];
        form = typeof conj === 'string' ? conj : (conj.korean || conj.ko || '');
      } else if (randomVerb[randomTense.field]) {
        form = randomVerb[randomTense.field];
      }

      if (form && form !== correct && distractorTexts.indexOf(form) === -1) {
        distractorTexts.push(form);
      }
    }

    // If we couldn't get enough distractors from conjugations, use base forms
    while (distractorTexts.length < 3) {
      var fallback = otherVerbs[Math.floor(Math.random() * otherVerbs.length)];
      if (fallback) {
        var baseForm = DataHelper.getKorean(fallback);
        if (baseForm !== correct && distractorTexts.indexOf(baseForm) === -1) {
          distractorTexts.push(baseForm);
        }
      }
      attempts++;
      if (attempts > 40) break;
    }

    distractorTexts.forEach(function(text) {
      options.push({ text: text, correct: false });
    });

    return Utils.shuffle(options);
  }

  var currentOptions = [];

  function selectOption(index) {
    if (answered) return;
    answered = true;

    var q = questions[currentIndex];
    // Rebuild options to check correctness
    var optionEls = document.querySelectorAll('#conj-options .quiz-option');
    var selectedText = '';

    optionEls.forEach(function(el, i) {
      var spanEl = el.querySelector('.korean-text-sm');
      if (spanEl && i === index) selectedText = spanEl.textContent;
    });

    var isCorrect = selectedText === q.correctAnswer;
    processAnswer(isCorrect, q);

    // Highlight
    optionEls.forEach(function(el, i) {
      el.classList.add('disabled');
      var spanEl = el.querySelector('.korean-text-sm');
      var text = spanEl ? spanEl.textContent : '';
      if (text === q.correctAnswer) {
        el.classList.add('correct');
      } else if (i === index && !isCorrect) {
        el.classList.add('incorrect');
      }
    });

    showFeedback(isCorrect, q);
  }

  function submitTyped() {
    if (answered) return;

    var input = document.getElementById('conj-input');
    if (!input) return;

    var userAnswer = input.value.trim();
    if (!userAnswer) return;

    answered = true;
    var q = questions[currentIndex];
    var isCorrect = userAnswer === q.correctAnswer;

    processAnswer(isCorrect, q);

    if (isCorrect) {
      input.classList.add('correct');
    } else {
      input.classList.add('incorrect');
    }
    input.disabled = true;

    showFeedback(isCorrect, q);
  }

  function processAnswer(isCorrect, q) {
    SRS.recordAnswer(StudentManager.current.id, q.srsId, isCorrect);

    if (isCorrect) {
      sessionCorrect++;
      currentStreak++;
    } else {
      sessionIncorrect++;
      currentStreak = 0;
    }

    updateStats();
  }

  function showFeedback(isCorrect, q) {
    var feedbackArea = document.getElementById('feedback-area');
    var correctAnswer = q.correctAnswer;
    var roman = q.romanization;

    if (isCorrect) {
      feedbackArea.innerHTML =
        '<div class="correct-feedback fade-in">' +
        'Correct! <span class="korean-text-sm">' + Utils.escapeHtml(correctAnswer) + '</span>' +
        (roman ? ' <span class="romanization">(' + Utils.escapeHtml(roman) + ')</span>' : '') +
        '</div>';
      TTS.speak(correctAnswer);
    } else {
      feedbackArea.innerHTML =
        '<div class="incorrect-feedback fade-in">' +
        'Correct answer: <span class="korean-text-sm">' + Utils.escapeHtml(correctAnswer) + '</span>' +
        (roman ? ' <span class="romanization">(' + Utils.escapeHtml(roman) + ')</span>' : '') +
        '</div>';
    }

    // Replace submit/check button with next
    var submitBtn = document.getElementById('submit-btn');
    if (submitBtn) {
      submitBtn.textContent = 'Next';
      submitBtn.onclick = function() {
        currentIndex++;
        showQuestion();
      };
    } else {
      // Add a next button for select mode
      feedbackArea.innerHTML += '<div class="game-actions mt-md">' +
        '<button class="btn btn-primary btn-lg" onclick="window._nextQuestion()">Next</button>' +
        '</div>';
    }
  }

  function skipQuestion() {
    currentIndex++;
    showQuestion();
  }

  function nextQuestion() {
    currentIndex++;
    showQuestion();
  }

  function updateStats() {
    var total = questions.length;
    var pct = total > 0 ? Math.round((currentIndex / total) * 100) : 0;
    var fill = document.getElementById('progress-fill');
    if (fill) fill.style.width = pct + '%';

    var qEl = document.getElementById('conj-question');
    if (qEl) qEl.textContent = Math.min(currentIndex + 1, total) + '/' + total;

    var streakEl = document.getElementById('conj-streak');
    if (streakEl) {
      streakEl.textContent = currentStreak;
      if (currentStreak > 0) {
        streakEl.classList.remove('streak-bump');
        void streakEl.offsetWidth;
        streakEl.classList.add('streak-bump');
      }
    }

    var totalAnswered = sessionCorrect + sessionIncorrect;
    var accEl = document.getElementById('conj-accuracy');
    if (accEl) accEl.textContent = totalAnswered > 0 ? Utils.formatPercent(sessionCorrect, totalAnswered) : '0%';
  }

  function showSessionComplete() {
    document.getElementById('game-area').classList.add('hidden');
    document.getElementById('game-controls').classList.add('hidden');

    var total = sessionCorrect + sessionIncorrect;
    var accuracy = total > 0 ? Utils.formatPercent(sessionCorrect, total) : '0%';
    var emoji = sessionCorrect >= total * 0.8 ? '🔄' : sessionCorrect >= total * 0.5 ? '👏' : '💪';

    var progressData = Progress.load(StudentManager.current.id, 'conjugation');
    Progress.save(StudentManager.current.id, 'conjugation', {
      sessionsCompleted: (progressData.sessionsCompleted || 0) + 1,
      bestStreak: Math.max(progressData.bestStreak || 0, currentStreak)
    });

    var container = document.getElementById('session-complete');
    container.classList.remove('hidden');
    container.innerHTML =
      '<div class="session-complete fade-in">' +
      '<div class="session-complete-emoji">' + emoji + '</div>' +
      '<div class="session-complete-title">Conjugation Complete!</div>' +
      '<div class="session-complete-stats">' +
      '<div class="session-stat"><span class="session-stat-label">Verbs Practiced</span><span class="session-stat-value">' + total + '</span></div>' +
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
  window._submitTyped = submitTyped;
  window._skipQuestion = skipQuestion;
  window._nextQuestion = nextQuestion;
  window._restart = loadSession;

  window._setMode = function(mode) {
    inputMode = mode;
    showQuestion();
  };

  init();
})();
