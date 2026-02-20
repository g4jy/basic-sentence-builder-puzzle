/* ============================================
   Cafe Ordering — Pokemon RPG-style dialogue game
   Practice ordering at a Korean cafe
   ============================================ */

(function() {
  'use strict';

  // ============================================
  // Scenario Data
  // ============================================

  var scenarios = [
    {
      id: 1,
      scene: 'You walk into a Korean cafe. The barista greets you warmly.',
      npc: {
        name: '\uC9C1\uC6D0', nameRom: 'JIK-WON', nameEn: 'Staff',
        kr: '\uC548\uB155\uD558\uC138\uC694! \uC5B4\uC11C \uC624\uC138\uC694!',
        rom: 'AN-NYEONG-HA-SE-YO! EO-SEO O-SE-YO!',
        en: 'Hello! Welcome!'
      },
      responses: [
        {
          kr: '\uC548\uB155\uD558\uC138\uC694!', rom: 'AN-NYEONG-HA-SE-YO!', en: 'Hello!',
          tier: 'best', feedback: 'A polite greeting back. Well done!',
          feedbackKr: '\uC644\uBCBD\uD574\uC694!'
        },
        {
          kr: '\uB124, \uC548\uB155\uD558\uC138\uC694.', rom: 'NE, AN-NYEONG-HA-SE-YO.', en: 'Yes, hello.',
          tier: 'ok', feedback: 'Correct! A bit formal but perfectly fine.',
          feedbackKr: '\uAD1C\uCC2E\uC544\uC694!'
        },
        {
          kr: '\uAC10\uC0AC\uD569\uB2C8\uB2E4.', rom: 'GAM-SA-HAM-NI-DA.', en: 'Thank you.',
          tier: 'wrong', feedback: '"Thank you" doesn\'t fit here \u2014 you haven\'t been served yet! Try greeting back.',
          feedbackKr: '\uB2E4\uC2DC \uD574\uBD10\uC694!'
        }
      ]
    },
    {
      id: 2,
      scene: 'The barista is ready to take your order.',
      npc: {
        name: '\uC9C1\uC6D0', nameRom: 'JIK-WON', nameEn: 'Staff',
        kr: '\uBB50 \uB4DC\uB9B4\uAE4C\uC694?',
        rom: 'MWO DEU-RIL-KKA-YO?',
        en: 'What can I get for you?'
      },
      responses: [
        {
          kr: '\uC544\uBA54\uB9AC\uCE74\uB178 \uC8FC\uC138\uC694.', rom: 'A-ME-RI-KA-NO JU-SE-YO.', en: 'An americano, please.',
          tier: 'best', feedback: 'Using \uC8FC\uC138\uC694 is the natural way to order. Great job!',
          feedbackKr: '\uC644\uBCBD\uD574\uC694!'
        },
        {
          kr: '\uCEE4\uD53C \uC788\uC5B4\uC694?', rom: 'KO-PI I-SSEO-YO?', en: 'Do you have coffee?',
          tier: 'ok', feedback: 'Asking first works, but you could directly order with \uC8FC\uC138\uC694.',
          feedbackKr: '\uAD1C\uCC2E\uC544\uC694!'
        },
        {
          kr: '\uCEE4\uD53C \uBA39\uC5B4\uC694.', rom: 'KO-PI MEO-GEO-YO.', en: 'I eat coffee.',
          tier: 'wrong', feedback: 'We drink (\uB9C8\uC154\uC694) coffee, not eat (\uBA39\uC5B4\uC694) it! And use \uC8FC\uC138\uC694 to order.',
          feedbackKr: '\uB2E4\uC2DC \uD574\uBD10\uC694!'
        }
      ]
    },
    {
      id: 3,
      scene: 'The barista asks about your preference.',
      npc: {
        name: '\uC9C1\uC6D0', nameRom: 'JIK-WON', nameEn: 'Staff',
        kr: '\uC544\uC774\uC2A4\uC694? \uD56B\uC774\uC694?',
        rom: 'A-I-SEU-YO? HA-SI-YO?',
        en: 'Iced? Hot?'
      },
      responses: [
        {
          kr: '\uC544\uC774\uC2A4 \uC8FC\uC138\uC694!', rom: 'A-I-SEU JU-SE-YO!', en: 'Iced, please!',
          tier: 'best', feedback: 'Clear and polite with \uC8FC\uC138\uC694!',
          feedbackKr: '\uC644\uBCBD\uD574\uC694!'
        },
        {
          kr: '\uC544\uC774\uC2A4\uC694.', rom: 'A-I-SEU-YO.', en: 'Iced.',
          tier: 'ok', feedback: 'This works! Adding \uC8FC\uC138\uC694 would be more polite.',
          feedbackKr: '\uAD1C\uCC2E\uC544\uC694!'
        },
        {
          kr: '\uB124, \uC788\uC5B4\uC694.', rom: 'NE, I-SSEO-YO.', en: 'Yes, there is.',
          tier: 'wrong', feedback: '"\uC788\uC5B4\uC694" means "there is" \u2014 it doesn\'t answer "iced or hot?" Choose one!',
          feedbackKr: '\uB2E4\uC2DC \uD574\uBD10\uC694!'
        }
      ]
    },
    {
      id: 4,
      scene: 'The barista offers you something extra.',
      npc: {
        name: '\uC9C1\uC6D0', nameRom: 'JIK-WON', nameEn: 'Staff',
        kr: '\uCF00\uC774\uD06C\uB3C4 \uC788\uC5B4\uC694! \uB4DC\uB9B4\uAE4C\uC694?',
        rom: 'KE-I-KEU-DO I-SSEO-YO! DEU-RIL-KKA-YO?',
        en: 'We also have cake! Would you like some?'
      },
      responses: [
        {
          kr: '\uB124, \uC8FC\uC138\uC694!', rom: 'NE, JU-SE-YO!', en: 'Yes, please!',
          tier: 'best', feedback: '\uB124 + \uC8FC\uC138\uC694 is the perfect way to accept an offer!',
          feedbackKr: '\uC644\uBCBD\uD574\uC694!'
        },
        {
          kr: '\uC544\uB2C8\uC694, \uAD1C\uCC2E\uC544\uC694.', rom: 'A-NI-YO, GWAEN-CHA-NA-YO.', en: 'No, I\'m okay.',
          tier: 'ok', feedback: 'A polite way to decline. \uAD1C\uCC2E\uC544\uC694 is very useful!',
          feedbackKr: '\uAD1C\uCC2E\uC544\uC694!'
        },
        {
          kr: '\uC5C6\uC5B4\uC694.', rom: 'EOP-SEO-YO.', en: 'There isn\'t.',
          tier: 'wrong', feedback: '"\uC5C6\uC5B4\uC694" means "there isn\'t" \u2014 but THEY just said there IS cake! Try \uB124 or \uC544\uB2C8\uC694.',
          feedbackKr: '\uB2E4\uC2DC \uD574\uBD10\uC694!'
        }
      ]
    },
    {
      id: 5,
      scene: 'Your order is ready! The barista hands it to you.',
      npc: {
        name: '\uC9C1\uC6D0', nameRom: 'JIK-WON', nameEn: 'Staff',
        kr: '\uC5EC\uAE30 \uC788\uC5B4\uC694! \uB9DB\uC788\uAC8C \uB4DC\uC138\uC694!',
        rom: 'YEO-GI I-SSEO-YO! MA-SHIT-GE DEU-SE-YO!',
        en: 'Here you go! Enjoy!'
      },
      responses: [
        {
          kr: '\uAC10\uC0AC\uD569\uB2C8\uB2E4!', rom: 'GAM-SA-HAM-NI-DA!', en: 'Thank you!',
          tier: 'best', feedback: 'The perfect response when receiving something!',
          feedbackKr: '\uC644\uBCBD\uD574\uC694!'
        },
        {
          kr: '\uB124, \uAC10\uC0AC\uD569\uB2C8\uB2E4.', rom: 'NE, GAM-SA-HAM-NI-DA.', en: 'Yes, thank you.',
          tier: 'ok', feedback: 'Good! Adding \uB124 is fine but \uAC10\uC0AC\uD569\uB2C8\uB2E4 alone is enough here.',
          feedbackKr: '\uAD1C\uCC2E\uC544\uC694!'
        },
        {
          kr: '\uC8FC\uC138\uC694.', rom: 'JU-SE-YO.', en: 'Please give me.',
          tier: 'wrong', feedback: 'You already received your order! \uC8FC\uC138\uC694 is for requesting, not receiving. Say \uAC10\uC0AC\uD569\uB2C8\uB2E4!',
          feedbackKr: '\uB2E4\uC2DC \uD574\uBD10\uC694!'
        }
      ]
    }
  ];

  // ============================================
  // Game State
  // ============================================

  var currentScene = 0;
  var score = 0;
  var answers = [];
  var showRom = true;
  var showEng = true;
  var answered = false;
  var shuffledResponses = [];

  // ============================================
  // Initialization
  // ============================================

  async function init() {
    var ok = await StudentManager.init();
    if (!ok || !StudentManager.current) {
      window.location.href = 'index.html';
      return;
    }

    Nav.renderHeader('Cafe Ordering');
    startGame();
  }

  function startGame() {
    currentScene = 0;
    score = 0;
    answers = [];

    document.getElementById('session-complete').classList.add('hidden');
    document.getElementById('game-controls').classList.remove('hidden');
    document.getElementById('game-area').classList.remove('hidden');

    showScene();
  }

  // ============================================
  // Scene Display
  // ============================================

  function showScene() {
    if (currentScene >= scenarios.length) {
      showEndScreen();
      return;
    }

    answered = false;
    var scene = scenarios[currentScene];
    updateProgress();

    var html = '';

    // Scene narrative
    html += '<div class="cafe-narrative fade-in">' + Utils.escapeHtml(scene.scene) + '</div>';

    // NPC dialogue bubble
    html += '<div class="cafe-npc-bubble slide-up">';
    html += '<div class="cafe-npc-header">';
    html += '<div class="cafe-npc-avatar">\u2615</div>';
    html += '<div class="cafe-npc-name">';
    html += '<span class="korean-text-sm">' + Utils.escapeHtml(scene.npc.name) + '</span>';
    html += '<span class="romanization cafe-rom">' + Utils.escapeHtml(scene.npc.nameRom) + '</span>';
    html += '<span class="english-text cafe-eng" style="font-size:0.75rem">' + Utils.escapeHtml(scene.npc.nameEn) + '</span>';
    html += '</div>';
    html += '</div>';
    html += '<div class="cafe-npc-text">';
    html += '<div class="korean-text">' + Utils.escapeHtml(scene.npc.kr) + '</div>';
    html += '<div class="romanization cafe-rom mt-sm">' + Utils.escapeHtml(scene.npc.rom) + '</div>';
    html += '<div class="english-text cafe-eng mt-sm">' + Utils.escapeHtml(scene.npc.en) + '</div>';
    html += '</div>';
    html += '<button class="tts-btn" style="align-self:flex-end" onclick="TTS.speak(\'' + scene.npc.kr.replace(/'/g, "\\'") + '\')" aria-label="Listen">&#128266;</button>';
    html += '</div>';

    // Shuffle responses
    shuffledResponses = Utils.shuffle(scene.responses.slice());

    // Response cards
    html += '<div class="cafe-responses" id="cafe-responses">';
    shuffledResponses.forEach(function(resp, i) {
      html += '<button class="cafe-response-card" data-tier="' + resp.tier + '" onclick="window._selectResponse(' + i + ')">';
      html += '<div class="korean-text-sm">' + Utils.escapeHtml(resp.kr) + '</div>';
      html += '<div class="romanization cafe-rom" style="font-size:0.8rem">' + Utils.escapeHtml(resp.rom) + '</div>';
      html += '<div class="english-text cafe-eng">' + Utils.escapeHtml(resp.en) + '</div>';
      html += '</button>';
    });
    html += '</div>';

    // Feedback area
    html += '<div id="cafe-feedback" class="hidden mt-md"></div>';

    document.getElementById('game-area').innerHTML = html;
    applyToggles();
  }

  // ============================================
  // Response Handling
  // ============================================

  function selectResponse(index) {
    if (answered) return;
    answered = true;

    var resp = shuffledResponses[index];
    var points = resp.tier === 'best' ? 2 : (resp.tier === 'ok' ? 1 : 0);
    score += points;
    answers.push({ scene: currentScene + 1, tier: resp.tier, points: points });

    // Disable all buttons and show tier colors
    var cards = document.querySelectorAll('.cafe-response-card');
    cards.forEach(function(card) {
      card.disabled = true;
      card.style.pointerEvents = 'none';

      var tier = card.getAttribute('data-tier');
      if (tier === 'best') card.classList.add('cafe-tier-best');
      else if (tier === 'ok') card.classList.add('cafe-tier-ok');
      else card.classList.add('cafe-tier-wrong');

      // Add tier badge
      var badge = document.createElement('span');
      badge.className = 'cafe-tier-badge';
      if (tier === 'best') { badge.textContent = 'BEST'; badge.classList.add('badge-best'); }
      else if (tier === 'ok') { badge.textContent = 'OK'; badge.classList.add('badge-ok'); }
      else { badge.textContent = 'X'; badge.classList.add('badge-wrong'); }
      card.prepend(badge);
    });

    // Show feedback
    var feedbackEl = document.getElementById('cafe-feedback');
    var feedbackClass = resp.tier === 'best' ? 'cafe-feedback-best' :
      (resp.tier === 'ok' ? 'cafe-feedback-ok' : 'cafe-feedback-wrong');
    var icon = resp.tier === 'best' ? '\u2605' : (resp.tier === 'ok' ? '\u25CB' : '\u2715');

    feedbackEl.innerHTML =
      '<div class="' + feedbackClass + ' fade-in">' +
      '<div class="cafe-feedback-header">' +
      '<span class="cafe-feedback-icon">' + icon + '</span>' +
      '<span class="korean-text-sm">' + Utils.escapeHtml(resp.feedbackKr) + '</span>' +
      '</div>' +
      '<div class="cafe-feedback-text">' + Utils.escapeHtml(resp.feedback) + '</div>' +
      '<button class="btn btn-primary btn-lg btn-block mt-md" onclick="window._nextScene()">' +
      (currentScene < scenarios.length - 1 ? 'Next' : 'See Results') +
      '</button>' +
      '</div>';
    feedbackEl.classList.remove('hidden');

    // Update score display
    document.getElementById('cafe-score-display').textContent = score + ' pts';

    // TTS for the correct answer
    var bestResp = scenarios[currentScene].responses.find(function(r) { return r.tier === 'best'; });
    if (bestResp && resp.tier === 'best') {
      TTS.speak(resp.kr);
    }
  }

  function nextScene() {
    currentScene++;
    showScene();
  }

  // ============================================
  // Progress
  // ============================================

  function updateProgress() {
    var total = scenarios.length;
    var pct = total > 0 ? Math.round((currentScene / total) * 100) : 0;
    var fill = document.getElementById('progress-fill');
    if (fill) fill.style.width = pct + '%';

    var text = document.getElementById('progress-text');
    if (text) text.textContent = 'Scene ' + Math.min(currentScene + 1, total) + ' / ' + total;

    document.getElementById('cafe-score-display').textContent = score + ' pts';
  }

  // ============================================
  // End Screen
  // ============================================

  function showEndScreen() {
    document.getElementById('game-area').classList.add('hidden');
    document.getElementById('game-controls').classList.add('hidden');

    var maxScore = scenarios.length * 2;
    var percentage = Math.round((score / maxScore) * 100);

    var rating, ratingKr, emoji;
    if (percentage >= 90) { rating = 'Perfect!'; ratingKr = '\uC644\uBCBD\uD574\uC694!'; emoji = '\uD83C\uDFC6'; }
    else if (percentage >= 60) { rating = 'Great job!'; ratingKr = '\uC798 \uD588\uC5B4\uC694!'; emoji = '\u2615'; }
    else if (percentage >= 30) { rating = 'Not bad!'; ratingKr = '\uAD1C\uCC2E\uC544\uC694!'; emoji = '\uD83D\uDC4D'; }
    else { rating = 'Keep practicing!'; ratingKr = '\uB354 \uC5F0\uC2B5\uD574\uC694!'; emoji = '\uD83D\uDCAA'; }

    // Save progress
    var progressData = Progress.load(StudentManager.current.id, 'cafe-ordering');
    Progress.save(StudentManager.current.id, 'cafe-ordering', {
      sessionsCompleted: (progressData.sessionsCompleted || 0) + 1,
      bestStreak: Math.max(progressData.bestStreak || 0, score)
    });

    // Build review breakdown
    var reviewHtml = '';
    answers.forEach(function(ans) {
      var tierClass = ans.tier === 'best' ? 'cafe-review-best' :
        (ans.tier === 'ok' ? 'cafe-review-ok' : 'cafe-review-wrong');
      var tierLabel = ans.tier === 'best' ? '\u2605 Best' :
        (ans.tier === 'ok' ? '\u25CB OK' : '\u2715 Wrong');
      reviewHtml +=
        '<div class="session-stat">' +
        '<span class="session-stat-label">Scene ' + ans.scene + '</span>' +
        '<span class="session-stat-value ' + tierClass + '">' + tierLabel + ' (+' + ans.points + ')</span>' +
        '</div>';
    });

    var container = document.getElementById('session-complete');
    container.classList.remove('hidden');
    container.innerHTML =
      '<div class="session-complete fade-in">' +
      '<div class="session-complete-emoji">' + emoji + '</div>' +
      '<div class="session-complete-title">' + rating + '</div>' +
      '<div class="korean-text-sm text-muted">' + ratingKr + '</div>' +
      '<div class="session-complete-stats mt-lg">' +
      '<div class="session-stat"><span class="session-stat-label">Score</span><span class="session-stat-value">' + score + ' / ' + maxScore + '</span></div>' +
      reviewHtml +
      '</div>' +
      '<div class="mt-md">' +
      '<div class="progress-bar progress-bar-lg"><div class="progress-bar-fill" id="cafe-final-bar" style="width:0%"></div></div>' +
      '</div>' +
      '<div class="flex gap-sm mt-lg" style="width:100%">' +
      '<button class="btn btn-outline btn-lg flex-1" onclick="Nav.goHome()">Home</button>' +
      '<button class="btn btn-primary btn-lg flex-1" onclick="window._restart()">Play Again</button>' +
      '</div>' +
      '</div>';

    // Animate score bar
    setTimeout(function() {
      var bar = document.getElementById('cafe-final-bar');
      if (bar) bar.style.width = percentage + '%';
    }, 100);
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
    var romEls = document.querySelectorAll('.cafe-rom');
    var engEls = document.querySelectorAll('.cafe-eng');
    romEls.forEach(function(el) { el.style.display = showRom ? '' : 'none'; });
    engEls.forEach(function(el) { el.style.display = showEng ? '' : 'none'; });
  }

  // ============================================
  // Expose to global scope
  // ============================================

  window._selectResponse = selectResponse;
  window._nextScene = nextScene;
  window._toggleRom = toggleRom;
  window._toggleEng = toggleEng;
  window._restart = startGame;

  init();
})();
