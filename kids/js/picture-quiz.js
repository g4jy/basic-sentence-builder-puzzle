/* === Picture Quiz Game === */
(async () => {
  const studentId = KidsApp.requireStudent();
  if (!studentId) return;

  const data = await KidsApp.loadStudentData(studentId);
  if (!data) return;

  KidsApp.renderHeader('Picture Quiz');
  KidsApp.applyRomanization();

  let questions = [];
  let currentIndex = 0;
  let score = 0;
  let currentLevel = null;

  // DOM
  const levelSelect = document.getElementById('level-select');
  const quizArea = document.getElementById('quiz-area');
  const completeArea = document.getElementById('complete-area');
  const quizEmoji = document.getElementById('quiz-emoji');
  const quizKorean = document.getElementById('quiz-korean');
  const quizRom = document.getElementById('quiz-rom');
  const quizEn = document.getElementById('quiz-en');
  const quizTts = document.getElementById('quiz-tts');
  const quizOptions = document.getElementById('quiz-options');
  const progressFill = document.getElementById('progress-fill');
  const scoreDisplay = document.getElementById('score-display');
  const questionCounter = document.getElementById('question-counter');
  const nextArea = document.getElementById('next-area');

  // Build level buttons
  buildLevelSelect();

  function buildLevelSelect() {
    const levels = {};
    data.pictureQuiz.forEach(q => {
      const lv = q.level || 1;
      if (!levels[lv]) levels[lv] = 0;
      levels[lv]++;
    });

    const container = levelSelect.querySelector('.difficulty-selector');
    const levelNames = { 1: 'Easy', 2: 'Medium', 3: 'Challenge' };
    const levelEmojis = { 1: '🌱', 2: '🌿', 3: '🌳' };

    // "All" option
    const allBtn = document.createElement('button');
    allBtn.className = 'btn btn-outline btn-big';
    allBtn.style.width = '100%';
    allBtn.innerHTML = `🎯 All Questions (${data.pictureQuiz.length})`;
    allBtn.addEventListener('click', () => startGame(null));
    container.appendChild(allBtn);

    Object.keys(levels).sort().forEach(lv => {
      const btn = document.createElement('button');
      btn.className = 'btn btn-outline btn-big';
      btn.style.width = '100%';
      btn.innerHTML = `${levelEmojis[lv] || '📘'} ${levelNames[lv] || 'Level ' + lv} (${levels[lv]} questions)`;
      btn.addEventListener('click', () => startGame(parseInt(lv)));
      container.appendChild(btn);
    });
  }

  function startGame(level) {
    currentLevel = level;
    if (level === null) {
      questions = KidsApp.shuffle(data.pictureQuiz);
    } else {
      questions = KidsApp.shuffle(data.pictureQuiz.filter(q => q.level === level));
    }
    currentIndex = 0;
    score = 0;

    levelSelect.classList.add('hidden');
    quizArea.classList.remove('hidden');
    completeArea.classList.add('hidden');

    showQuestion();
  }

  function showQuestion() {
    if (currentIndex >= questions.length) {
      showComplete();
      return;
    }

    const q = questions[currentIndex];
    nextArea.classList.add('hidden');

    // Scene
    quizEmoji.textContent = q.correctEmoji;
    quizKorean.textContent = q.sentence.kr;
    quizRom.textContent = q.sentence.rom;
    quizEn.textContent = q.sentence.en;
    KidsApp.applyRomanization();

    // TTS
    quizTts.onclick = (e) => {
      e.stopPropagation();
      KidsApp.speak(q.sentence.kr);
    };

    // Auto-speak
    const settings = KidsApp.getSettings();
    if (settings.autoSpeak !== false) {
      setTimeout(() => KidsApp.speak(q.sentence.kr), 300);
    }

    // Shuffle options
    const shuffled = KidsApp.shuffle(q.options);
    quizOptions.innerHTML = '';
    shuffled.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option';
      btn.textContent = opt;
      btn.addEventListener('click', () => handleAnswer(btn, opt, q.correctEmoji));
      quizOptions.appendChild(btn);
    });

    // Progress
    progressFill.style.width = ((currentIndex / questions.length) * 100) + '%';
    questionCounter.textContent = `${currentIndex + 1} / ${questions.length}`;
    scoreDisplay.textContent = `⭐ ${score}`;
  }

  function handleAnswer(btn, selected, correct) {
    const allBtns = quizOptions.querySelectorAll('.quiz-option');

    if (selected === correct) {
      // Correct!
      score++;
      scoreDisplay.textContent = `⭐ ${score}`;
      btn.classList.add('correct');
      KidsApp.speak('잘했어요!', 1.0);
      KidsApp.spawnStars(6);

      allBtns.forEach(b => b.classList.add('disabled'));

      setTimeout(() => {
        currentIndex++;
        showQuestion();
      }, 1200);
    } else {
      // Wrong
      btn.classList.add('wrong');
      btn.classList.add('disabled');
      setTimeout(() => {
        btn.classList.remove('wrong');
      }, 600);
    }
  }

  function showComplete() {
    quizArea.classList.add('hidden');
    completeArea.classList.remove('hidden');

    const pct = Math.round((score / questions.length) * 100);
    const title = pct === 100 ? 'Perfect! 🎉' : pct >= 70 ? 'Great Job! 🌟' : 'Good Try! 💪';

    document.getElementById('complete-title').textContent = title;
    document.getElementById('complete-score').textContent = `You got ${score} out of ${questions.length} correct! (${pct}%)`;

    progressFill.style.width = '100%';
    KidsApp.saveBestScore('picture-quiz', score);

    if (pct >= 70) {
      KidsApp.showCelebration(
        pct === 100 ? '🏆' : '⭐',
        title,
        `${score} / ${questions.length} correct!`,
        null
      );
    }
  }

  window.restart = () => {
    completeArea.classList.add('hidden');
    levelSelect.classList.remove('hidden');
  };

  window.nextQuestion = () => {
    currentIndex++;
    showQuestion();
  };
})();
