/* === Memory Match Game === */
let studentData = null;
let contentSource = 'mixed';
let pairs = [];
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let totalPairs = 0;
let moves = 0;
let timerInterval = null;
let seconds = 0;
let lockBoard = false;

(async () => {
  const studentId = KidsApp.requireStudent();
  if (!studentId) return;

  studentData = await KidsApp.loadStudentData(studentId);
  if (!studentData) return;

  KidsApp.renderHeader('Memory Match');
})();

function setSource(source, btn) {
  contentSource = source;
  document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
}

function buildPairs(count) {
  let pool = [];

  if (contentSource === 'review' || contentSource === 'mixed') {
    studentData.review.forEach(item => {
      pool.push({ text: item.kr, emoji: item.emoji, rom: item.rom });
    });
  }
  if (contentSource === 'verbs' || contentSource === 'mixed') {
    studentData.verbs.forEach(item => {
      pool.push({ text: item.polite, emoji: item.emoji, rom: item.politeRom });
    });
  }
  if (contentSource === 'nouns' || contentSource === 'mixed') {
    studentData.nouns.forEach(item => {
      pool.push({ text: item.kr, emoji: item.emoji, rom: item.rom });
    });
  }
  if (contentSource === 'sentences' || contentSource === 'mixed') {
    studentData.sentences.forEach(item => {
      pool.push({ text: item.kr, emoji: item.emoji, rom: item.rom });
    });
  }

  // Deduplicate by text
  const seen = new Set();
  pool = pool.filter(p => {
    if (seen.has(p.text)) return false;
    seen.add(p.text);
    return true;
  });

  // Select random pairs
  const selected = KidsApp.shuffle(pool).slice(0, count);

  // Create card pairs: one text card + one emoji card per pair
  const cardData = [];
  selected.forEach((item, i) => {
    cardData.push({
      pairId: i,
      type: 'text',
      display: item.text,
      rom: item.rom,
      speakText: item.text
    });
    cardData.push({
      pairId: i,
      type: 'emoji',
      display: item.emoji,
      speakText: item.text
    });
  });

  return KidsApp.shuffle(cardData);
}

function startGame(difficulty) {
  const counts = { easy: 3, medium: 4, hard: 6 };
  totalPairs = counts[difficulty] || 3;

  cards = buildPairs(totalPairs);
  flippedCards = [];
  matchedPairs = 0;
  moves = 0;
  seconds = 0;
  lockBoard = false;

  document.getElementById('diff-select').classList.add('hidden');
  document.getElementById('game-area').classList.remove('hidden');
  document.getElementById('complete-area').classList.add('hidden');

  // Grid class
  const grid = document.getElementById('memory-grid');
  grid.className = 'memory-grid';
  if (totalPairs <= 3) grid.classList.add('grid-3x2');
  else if (totalPairs <= 4) grid.classList.add('grid-4x2');
  else grid.classList.add('grid-4x3');

  renderGrid();
  updateStats();
  startTimer();
}

function renderGrid() {
  const grid = document.getElementById('memory-grid');
  grid.innerHTML = '';

  cards.forEach((card, i) => {
    const el = document.createElement('div');
    el.className = 'memory-card';
    el.dataset.index = i;

    const isText = card.type === 'text';

    el.innerHTML = `
      <div class="memory-card-inner">
        <div class="memory-card-face memory-card-back">❓</div>
        <div class="memory-card-face memory-card-front ${isText ? 'card-text' : 'card-emoji'}">
          ${isText ? `<div>${card.display}${card.rom ? `<div class="romanization" style="font-size:0.7rem;margin-top:2px;">${card.rom}</div>` : ''}</div>` : card.display}
        </div>
      </div>
    `;

    el.addEventListener('click', () => flipCard(el, i));
    grid.appendChild(el);
  });

  KidsApp.applyRomanization();
}

function flipCard(el, index) {
  if (lockBoard) return;
  if (el.classList.contains('flipped') || el.classList.contains('matched')) return;
  if (flippedCards.length >= 2) return;

  el.classList.add('flipped');
  flippedCards.push({ el, index, card: cards[index] });

  // Speak Korean text
  KidsApp.speak(cards[index].speakText, 0.9);

  if (flippedCards.length === 2) {
    moves++;
    updateStats();
    checkMatch();
  }
}

function checkMatch() {
  const [a, b] = flippedCards;

  if (a.card.pairId === b.card.pairId) {
    // Match!
    lockBoard = true;
    setTimeout(() => {
      a.el.classList.add('matched');
      b.el.classList.add('matched');
      matchedPairs++;
      updateStats();
      KidsApp.spawnStars(4);
      flippedCards = [];
      lockBoard = false;

      if (matchedPairs === totalPairs) {
        setTimeout(showComplete, 600);
      }
    }, 500);
  } else {
    // No match
    lockBoard = true;
    setTimeout(() => {
      a.el.classList.add('wrong');
      b.el.classList.add('wrong');
      setTimeout(() => {
        a.el.classList.remove('flipped', 'wrong');
        b.el.classList.remove('flipped', 'wrong');
        flippedCards = [];
        lockBoard = false;
      }, 600);
    }, 800);
  }
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    seconds++;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    document.getElementById('timer-display').textContent = `${m}:${s.toString().padStart(2, '0')}`;
  }, 1000);
}

function updateStats() {
  document.getElementById('pairs-display').textContent = `🃏 ${matchedPairs} / ${totalPairs}`;
  document.getElementById('moves-display').textContent = `Moves: ${moves}`;
}

function showComplete() {
  if (timerInterval) clearInterval(timerInterval);

  document.getElementById('game-area').classList.add('hidden');
  document.getElementById('complete-area').classList.remove('hidden');

  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const timeStr = `${m}:${s.toString().padStart(2, '0')}`;

  // Star rating based on moves efficiency
  const efficiency = totalPairs / moves;
  const title = efficiency >= 0.8 ? 'Perfect Memory! 🧠' : efficiency >= 0.5 ? 'Great Job! 🌟' : 'Good Try! 💪';

  document.getElementById('complete-title').textContent = title;
  document.getElementById('complete-score').textContent = `All ${totalPairs} pairs found in ${moves} moves! (${timeStr})`;

  KidsApp.saveBestScore('memory-match', Math.round(efficiency * 100));

  KidsApp.showCelebration(
    '🏆',
    title,
    `${totalPairs} pairs in ${moves} moves!`,
    null
  );
}

window.restart = () => {
  if (timerInterval) clearInterval(timerInterval);
  document.getElementById('complete-area').classList.add('hidden');
  document.getElementById('game-area').classList.add('hidden');
  document.getElementById('diff-select').classList.remove('hidden');
};
