/**
 * Korean Learning Tools - Flashcard Component
 * Vocabulary practice with spaced repetition tracking
 */

// ============================================
// State Variables
// ============================================

let flashcards = [];
let currentCardIndex = 0;
let reviewedCards = [];
let currentStreak = 0;
let autoFlipTimer = null;

// ============================================
// Default Vocabulary (if no student vocab)
// ============================================

const defaultFlashcards = [
    { kr: '커피', rom: 'KO-PI', en: 'coffee', example: '커피를 마셔요.' },
    { kr: '피자', rom: 'PI-JA', en: 'pizza', example: '피자를 먹어요.' },
    { kr: '친구', rom: 'CHIN-GU', en: 'friend', example: '친구를 만나요.' },
    { kr: '학교', rom: 'HAK-GYO', en: 'school', example: '학교에 가요.' },
    { kr: '식당', rom: 'SHIK-DANG', en: 'restaurant', example: '식당에서 먹었어요.' },
    { kr: '물', rom: 'MUL', en: 'water', example: '물을 마셔요.' },
    { kr: '밥', rom: 'BAP', en: 'rice/meal', example: '밥을 먹어요.' },
    { kr: '김치', rom: 'KIM-CHI', en: 'kimchi', example: '김치가 맛있어요.' },
    { kr: '카페', rom: 'KA-PE', en: 'cafe', example: '카페에서 커피를 마셔요.' },
    { kr: '공원', rom: 'GONG-WON', en: 'park', example: '공원에서 산책해요.' }
];

// ============================================
// Initialization
// ============================================

function initializeFlashcards() {
    loadFlashcardData();
    shuffleFlashcards();
    updateFlashcardStats();

    if (flashcards.length > 0) {
        showCard(0);
    } else {
        showEmptyState();
    }
}

function loadFlashcardData() {
    flashcards = [];

    // Load from student's assigned vocabulary
    if (studentData && studentData.assignedVocab) {
        const vocab = studentData.assignedVocab;

        // Collect all vocabulary from different categories
        Object.keys(vocab).forEach(category => {
            if (Array.isArray(vocab[category])) {
                vocab[category].forEach(item => {
                    if (typeof item === 'object' && item.kr) {
                        flashcards.push({
                            kr: item.kr,
                            rom: item.rom || '',
                            en: item.en || '',
                            example: item.example || `${item.kr}를 좋아해요.`
                        });
                    } else if (typeof item === 'string') {
                        flashcards.push({
                            kr: item,
                            rom: '',
                            en: '',
                            example: `${item}를 좋아해요.`
                        });
                    }
                });
            }
        });
    }

    // Add custom vocabulary
    if (studentData && studentData.customVocab) {
        studentData.customVocab.forEach(item => {
            flashcards.push({
                kr: item.kr,
                rom: item.rom || '',
                en: item.en || '',
                example: item.example || `${item.kr}를 좋아해요.`
            });
        });
    }

    // Add vocabulary watchlist items (error-prone words)
    if (studentData && studentData.vocabularyWatchlist) {
        studentData.vocabularyWatchlist.forEach(item => {
            flashcards.push({
                kr: item.kr,
                rom: item.correct || '',
                en: item.note || '',
                example: `Correction: ${item.error} → ${item.correct}`,
                isWatchlist: true  // Mark as watchlist item for special styling
            });
        });
    }

    // Use defaults if no student vocab
    if (flashcards.length === 0) {
        flashcards = [...defaultFlashcards];
    }

    // Load progress and filter out mastered cards (optional)
    loadCardProgress();
}

function loadCardProgress() {
    const progress = getProgress();

    flashcards = flashcards.map(card => {
        const cardKey = card.kr;
        const cardProgress = progress[cardKey] || {
            status: 'learning',
            streak: 0,
            lastSeen: null,
            timesCorrect: 0,
            timesIncorrect: 0
        };

        return { ...card, progress: cardProgress };
    });

    // Sort: learning cards first, then by last seen
    flashcards.sort((a, b) => {
        if (a.progress.status === 'learning' && b.progress.status !== 'learning') return -1;
        if (a.progress.status !== 'learning' && b.progress.status === 'learning') return 1;
        return 0;
    });
}

function shuffleFlashcards() {
    // Fisher-Yates shuffle
    for (let i = flashcards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [flashcards[i], flashcards[j]] = [flashcards[j], flashcards[i]];
    }
}

// ============================================
// Card Display
// ============================================

function showCard(index) {
    if (index >= flashcards.length) {
        showCompletedState();
        return;
    }

    currentCardIndex = index;
    const card = flashcards[index];

    // Reset card state
    document.getElementById('flashcard').classList.remove('flipped');

    // Update front
    document.getElementById('card-front-word').textContent = card.en || 'Translate this word';

    // Update back
    document.getElementById('card-back-korean').textContent = card.kr;
    document.getElementById('card-back-rom').textContent = card.rom;
    document.getElementById('card-back-example').textContent = card.example;

    // Apply romanization setting
    const cardRom = document.getElementById('card-back-rom');
    if (cardRom) {
        cardRom.style.display = settings.showRomanization ? 'block' : 'none';
    }

    // Update progress
    updateProgressBar();

    // Auto-flip if enabled
    if (settings.autoFlip) {
        clearTimeout(autoFlipTimer);
        autoFlipTimer = setTimeout(() => {
            flipCard();
        }, 3000);
    }

    // Show card UI
    document.getElementById('flashcard-wrapper').classList.remove('hidden');
    document.getElementById('flashcard-buttons').classList.remove('hidden');
    document.getElementById('flashcard-empty').classList.add('hidden');
}

function flipCard() {
    const flashcard = document.getElementById('flashcard');
    flashcard.classList.toggle('flipped');

    // Clear auto-flip timer
    if (autoFlipTimer) {
        clearTimeout(autoFlipTimer);
        autoFlipTimer = null;
    }
}

function resetFlashcardView() {
    // Reset the current card view when switching to flashcards tab
    document.getElementById('flashcard').classList.remove('flipped');
}

// ============================================
// Card Actions
// ============================================

function markKnow() {
    const card = flashcards[currentCardIndex];

    // Update progress
    card.progress.streak++;
    card.progress.timesCorrect++;
    card.progress.lastSeen = new Date().toISOString();

    // Mark as known if streak is high enough
    if (card.progress.streak >= 3) {
        card.progress.status = 'known';
    }

    // Update current streak
    currentStreak++;

    // Save progress
    saveCardProgress(card);

    // Track reviewed
    reviewedCards.push(card.kr);

    // Update stats and move to next
    updateFlashcardStats();
    nextCard();
}

function markDontKnow() {
    const card = flashcards[currentCardIndex];

    // Reset streak
    card.progress.streak = 0;
    card.progress.timesIncorrect++;
    card.progress.lastSeen = new Date().toISOString();
    card.progress.status = 'learning';

    // Reset current streak
    currentStreak = 0;

    // Save progress
    saveCardProgress(card);

    // Track reviewed
    reviewedCards.push(card.kr);

    // Add to end of queue for review again
    const reviewCard = flashcards.splice(currentCardIndex, 1)[0];
    flashcards.push(reviewCard);

    // Update stats
    updateFlashcardStats();

    // Show next (don't increment index since we removed current)
    showCard(currentCardIndex);
}

function nextCard() {
    currentCardIndex++;

    if (currentCardIndex >= flashcards.length) {
        showCompletedState();
    } else {
        showCard(currentCardIndex);
    }
}

function saveCardProgress(card) {
    const progress = getProgress();
    progress[card.kr] = {
        status: card.progress.status,
        streak: card.progress.streak,
        lastSeen: card.progress.lastSeen,
        timesCorrect: card.progress.timesCorrect,
        timesIncorrect: card.progress.timesIncorrect
    };
    saveProgress(progress);
}

// ============================================
// Stats & Progress
// ============================================

function updateFlashcardStats() {
    const progress = getProgress();

    let known = 0;
    let learning = 0;

    flashcards.forEach(card => {
        const cardProgress = progress[card.kr];
        if (cardProgress && cardProgress.status === 'known') {
            known++;
        } else {
            learning++;
        }
    });

    document.getElementById('known-count').textContent = known;
    document.getElementById('learning-count').textContent = learning;
    document.getElementById('streak-count').textContent = currentStreak;
}

function updateProgressBar() {
    const reviewed = reviewedCards.length;
    const total = flashcards.length + reviewed;
    const percentage = total > 0 ? (reviewed / total) * 100 : 0;

    document.getElementById('progress-fill').style.width = `${percentage}%`;
    document.getElementById('progress-text').textContent =
        `${currentCardIndex} of ${flashcards.length} remaining`;
}

// ============================================
// State Displays
// ============================================

function showEmptyState() {
    document.getElementById('flashcard-wrapper').classList.add('hidden');
    document.getElementById('flashcard-buttons').classList.add('hidden');
    document.getElementById('flashcard-empty').classList.remove('hidden');
    document.getElementById('flashcard-empty').innerHTML = `
        <div class="empty-state-icon">📚</div>
        <p>No vocabulary cards assigned yet.</p>
        <p style="color: #888; margin-top: 10px;">Ask your teacher to add some words!</p>
    `;
}

function showCompletedState() {
    document.getElementById('flashcard-wrapper').classList.add('hidden');
    document.getElementById('flashcard-buttons').classList.add('hidden');
    document.getElementById('flashcard-empty').classList.remove('hidden');
    document.getElementById('flashcard-empty').innerHTML = `
        <div class="empty-state-icon">🎉</div>
        <p>Great job! You've reviewed all cards!</p>
        <button class="action-btn primary" onclick="resetFlashcards()" style="margin-top: 15px;">
            Practice Again
        </button>
    `;
}

function resetFlashcards() {
    currentCardIndex = 0;
    reviewedCards = [];
    currentStreak = 0;

    shuffleFlashcards();
    updateFlashcardStats();

    if (flashcards.length > 0) {
        showCard(0);
    } else {
        showEmptyState();
    }
}
