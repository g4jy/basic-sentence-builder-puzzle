/* === Sentence Puzzle Game === */
(async () => {
  const studentId = KidsApp.requireStudent();
  if (!studentId) return;

  const data = await KidsApp.loadStudentData(studentId);
  if (!data) return;

  KidsApp.renderHeader('Sentence Puzzle');
  KidsApp.applyRomanization();

  let sentences = KidsApp.shuffle([...data.sentences]);
  let currentIndex = 0;
  let score = 0;
  let placedBlocks = [];
  let currentSentence = null;

  // DOM
  const puzzleArea = document.getElementById('puzzle-area');
  const completeArea = document.getElementById('complete-area');
  const puzzleEmoji = document.getElementById('puzzle-emoji');
  const puzzleEn = document.getElementById('puzzle-en');
  const puzzleTarget = document.getElementById('puzzle-target');
  const puzzleBlocks = document.getElementById('puzzle-blocks');
  const puzzleResult = document.getElementById('puzzle-result');
  const resultKorean = document.getElementById('result-korean');
  const resultRom = document.getElementById('result-rom');
  const resultTts = document.getElementById('result-tts');
  const progressFill = document.getElementById('progress-fill');
  const scoreDisplay = document.getElementById('score-display');
  const questionCounter = document.getElementById('question-counter');

  showPuzzle();

  function showPuzzle() {
    if (currentIndex >= sentences.length) {
      showComplete();
      return;
    }

    currentSentence = sentences[currentIndex];
    placedBlocks = [];
    puzzleResult.classList.add('hidden');

    // Scene
    puzzleEmoji.textContent = currentSentence.emoji;
    puzzleEn.textContent = currentSentence.hint || currentSentence.en;

    // Target
    puzzleTarget.innerHTML = '<span style="color:var(--gray-400);font-size:1rem;">Tap blocks to build the sentence!</span>';
    puzzleTarget.classList.remove('has-blocks', 'complete');

    // Blocks (shuffled)
    const shuffled = KidsApp.shuffle([...currentSentence.blocks]);
    puzzleBlocks.innerHTML = '';
    shuffled.forEach((block, i) => {
      const el = document.createElement('button');
      el.className = 'puzzle-block';
      el.textContent = block;
      el.dataset.index = i;
      el.dataset.text = block;
      el.addEventListener('click', () => placeBlock(el));
      puzzleBlocks.appendChild(el);
    });

    // Progress
    progressFill.style.width = ((currentIndex / sentences.length) * 100) + '%';
    questionCounter.textContent = `${currentIndex + 1} / ${sentences.length}`;
    scoreDisplay.textContent = `⭐ ${score}`;
  }

  function placeBlock(el) {
    if (el.classList.contains('placed')) return;

    const text = el.dataset.text;
    placedBlocks.push({ text, sourceEl: el });
    el.classList.add('placed');

    renderTarget();

    // Check if complete
    if (placedBlocks.length === currentSentence.blocks.length) {
      checkAnswer();
    }
  }

  function removeBlock(index) {
    const removed = placedBlocks.splice(index, 1)[0];
    if (removed && removed.sourceEl) {
      removed.sourceEl.classList.remove('placed');
    }
    renderTarget();
  }

  function renderTarget() {
    if (placedBlocks.length === 0) {
      puzzleTarget.innerHTML = '<span style="color:var(--gray-400);font-size:1rem;">Tap blocks to build the sentence!</span>';
      puzzleTarget.classList.remove('has-blocks');
      return;
    }

    puzzleTarget.classList.add('has-blocks');
    puzzleTarget.innerHTML = '';

    placedBlocks.forEach((b, i) => {
      const el = document.createElement('span');
      el.className = 'placed-block';
      el.textContent = b.text;
      el.addEventListener('click', () => removeBlock(i));
      puzzleTarget.appendChild(el);
    });
  }

  function checkAnswer() {
    const answer = placedBlocks.map(b => b.text);
    const correct = currentSentence.blocks;

    if (answer.join(' ') === correct.join(' ')) {
      // Correct!
      score++;
      scoreDisplay.textContent = `⭐ ${score}`;
      puzzleTarget.classList.add('complete');
      KidsApp.spawnStars(6);

      // Show result
      resultKorean.textContent = currentSentence.kr;
      resultRom.textContent = currentSentence.rom;
      KidsApp.applyRomanization();

      resultTts.onclick = (e) => {
        e.stopPropagation();
        KidsApp.speak(currentSentence.kr);
      };

      // Auto-speak
      KidsApp.speak(currentSentence.kr);

      puzzleResult.classList.remove('hidden');
      puzzleBlocks.classList.add('hidden');
    } else {
      // Wrong - shake and reset
      puzzleTarget.style.animation = 'shake 0.5s ease';
      setTimeout(() => {
        puzzleTarget.style.animation = '';
        // Reset all
        placedBlocks.forEach(b => {
          if (b.sourceEl) b.sourceEl.classList.remove('placed');
        });
        placedBlocks = [];
        renderTarget();
      }, 600);
    }
  }

  function showComplete() {
    puzzleArea.classList.add('hidden');
    completeArea.classList.remove('hidden');

    const pct = Math.round((score / sentences.length) * 100);
    const title = pct === 100 ? 'Perfect! 🎉' : pct >= 70 ? 'Great Job! 🌟' : 'Good Try! 💪';

    document.getElementById('complete-title').textContent = title;
    document.getElementById('complete-score').textContent = `You completed ${score} out of ${sentences.length} puzzles! (${pct}%)`;

    progressFill.style.width = '100%';
    KidsApp.saveBestScore('sentence-puzzle', score);

    if (pct >= 70) {
      KidsApp.showCelebration(
        pct === 100 ? '🏆' : '⭐',
        title,
        `${score} / ${sentences.length} puzzles!`,
        null
      );
    }
  }

  window.nextPuzzle = () => {
    currentIndex++;
    puzzleBlocks.classList.remove('hidden');
    showPuzzle();
  };

  window.restart = () => {
    sentences = KidsApp.shuffle([...data.sentences]);
    currentIndex = 0;
    score = 0;
    completeArea.classList.add('hidden');
    puzzleArea.classList.remove('hidden');
    puzzleBlocks.classList.remove('hidden');
    showPuzzle();
  };
})();
