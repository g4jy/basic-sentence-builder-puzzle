/**
 * Korean Learning Tools - Cafe Ordering RPG Game
 * Pokemon-style dialogue game for practicing cafe ordering
 */

// ============================================
// Scenario Data
// ============================================

const cafeScenarios = [
    {
        id: 1,
        scene: 'You walk into a Korean cafe. The barista greets you warmly.',
        npc: {
            name: '직원',
            nameRom: 'JIK-WON',
            nameEn: 'Staff',
            kr: '안녕하세요! 어서 오세요!',
            rom: 'AN-NYEONG-HA-SE-YO! EO-SEO O-SE-YO!',
            en: 'Hello! Welcome!'
        },
        responses: [
            {
                kr: '안녕하세요!',
                rom: 'AN-NYEONG-HA-SE-YO!',
                en: 'Hello!',
                tier: 'best',
                feedback: 'A polite greeting back. Well done!',
                feedbackKr: '완벽해요!'
            },
            {
                kr: '네, 안녕하세요.',
                rom: 'NE, AN-NYEONG-HA-SE-YO.',
                en: 'Yes, hello.',
                tier: 'acceptable',
                feedback: 'Correct! A bit formal but perfectly fine.',
                feedbackKr: '괜찮아요!'
            },
            {
                kr: '감사합니다.',
                rom: 'GAM-SA-HAM-NI-DA.',
                en: 'Thank you.',
                tier: 'wrong',
                feedback: '"Thank you" doesn\'t fit here. You haven\'t been served yet! Try greeting back.',
                feedbackKr: '다시 해봐요!'
            }
        ]
    },
    {
        id: 2,
        scene: 'The barista is ready to take your order.',
        npc: {
            name: '직원',
            nameRom: 'JIK-WON',
            nameEn: 'Staff',
            kr: '뭐 드릴까요?',
            rom: 'MWO DEU-RIL-KKA-YO?',
            en: 'What can I get for you?'
        },
        responses: [
            {
                kr: '아메리카노 주세요.',
                rom: 'A-ME-RI-KA-NO JU-SE-YO.',
                en: 'An americano, please.',
                tier: 'best',
                feedback: 'Using 주세요 is the natural way to order. Great job!',
                feedbackKr: '완벽해요!'
            },
            {
                kr: '커피 있어요?',
                rom: 'KO-PI I-SSEO-YO?',
                en: 'Do you have coffee?',
                tier: 'acceptable',
                feedback: 'Asking first works, but you could directly order with 주세요.',
                feedbackKr: '괜찮아요!'
            },
            {
                kr: '커피 먹어요.',
                rom: 'KO-PI MEO-GEO-YO.',
                en: 'I eat coffee.',
                tier: 'wrong',
                feedback: 'We drink (마셔요) coffee, not eat (먹어요) it! And use 주세요 to order.',
                feedbackKr: '다시 해봐요!'
            }
        ]
    },
    {
        id: 3,
        scene: 'The barista asks about your preference.',
        npc: {
            name: '직원',
            nameRom: 'JIK-WON',
            nameEn: 'Staff',
            kr: '아이스요? 핫이요?',
            rom: 'A-I-SEU-YO? HA-SI-YO?',
            en: 'Iced? Hot?'
        },
        responses: [
            {
                kr: '아이스 주세요!',
                rom: 'A-I-SEU JU-SE-YO!',
                en: 'Iced, please!',
                tier: 'best',
                feedback: 'Clear and polite with 주세요!',
                feedbackKr: '완벽해요!'
            },
            {
                kr: '아이스요.',
                rom: 'A-I-SEU-YO.',
                en: 'Iced.',
                tier: 'acceptable',
                feedback: 'This works! Adding 주세요 would be more polite.',
                feedbackKr: '괜찮아요!'
            },
            {
                kr: '네, 있어요.',
                rom: 'NE, I-SSEO-YO.',
                en: 'Yes, there is.',
                tier: 'wrong',
                feedback: '"있어요" means "there is" — it doesn\'t answer "iced or hot?" Choose one!',
                feedbackKr: '다시 해봐요!'
            }
        ]
    },
    {
        id: 4,
        scene: 'The barista offers you something extra.',
        npc: {
            name: '직원',
            nameRom: 'JIK-WON',
            nameEn: 'Staff',
            kr: '케이크도 있어요! 드릴까요?',
            rom: 'KE-I-KEU-DO I-SSEO-YO! DEU-RIL-KKA-YO?',
            en: 'We also have cake! Would you like some?'
        },
        responses: [
            {
                kr: '네, 주세요!',
                rom: 'NE, JU-SE-YO!',
                en: 'Yes, please!',
                tier: 'best',
                feedback: '네 + 주세요 is the perfect way to accept an offer!',
                feedbackKr: '완벽해요!'
            },
            {
                kr: '아니요, 괜찮아요.',
                rom: 'A-NI-YO, GWAEN-CHA-NA-YO.',
                en: 'No, I\'m okay.',
                tier: 'acceptable',
                feedback: 'A polite way to decline. 괜찮아요 is very useful!',
                feedbackKr: '괜찮아요!'
            },
            {
                kr: '없어요.',
                rom: 'EOP-SEO-YO.',
                en: 'There isn\'t.',
                tier: 'wrong',
                feedback: '"없어요" means "there isn\'t" — but THEY just said there IS cake! Try 네 or 아니요.',
                feedbackKr: '다시 해봐요!'
            }
        ]
    },
    {
        id: 5,
        scene: 'Your order is ready! The barista hands it to you.',
        npc: {
            name: '직원',
            nameRom: 'JIK-WON',
            nameEn: 'Staff',
            kr: '여기 있어요! 맛있게 드세요!',
            rom: 'YEO-GI I-SSEO-YO! MA-SHIT-GE DEU-SE-YO!',
            en: 'Here you go! Enjoy your meal!'
        },
        responses: [
            {
                kr: '감사합니다!',
                rom: 'GAM-SA-HAM-NI-DA!',
                en: 'Thank you!',
                tier: 'best',
                feedback: 'The perfect response when receiving something!',
                feedbackKr: '완벽해요!'
            },
            {
                kr: '네, 감사합니다.',
                rom: 'NE, GAM-SA-HAM-NI-DA.',
                en: 'Yes, thank you.',
                tier: 'acceptable',
                feedback: 'Good! Adding 네 is fine but 감사합니다 alone is enough here.',
                feedbackKr: '괜찮아요!'
            },
            {
                kr: '주세요.',
                rom: 'JU-SE-YO.',
                en: 'Please give me.',
                tier: 'wrong',
                feedback: 'You already received your order! 주세요 is for requesting, not receiving. Say 감사합니다!',
                feedbackKr: '다시 해봐요!'
            }
        ]
    }
];

// ============================================
// Game State
// ============================================

let currentSceneIndex = 0;
let cafeScore = 0;
let cafeAnswers = [];
let gameActive = false;

// ============================================
// Initialization
// ============================================

function initializeCafeGame() {
    resetCafeGame();
}

function resetCafeGame() {
    currentSceneIndex = 0;
    cafeScore = 0;
    cafeAnswers = [];
    gameActive = true;

    const endScreen = document.getElementById('cafe-end-screen');
    if (endScreen) endScreen.classList.add('hidden');

    const gameArea = document.getElementById('cafe-game-area');
    if (gameArea) gameArea.classList.remove('hidden');

    showScene(0);
}

// ============================================
// Scene Display
// ============================================

function showScene(index) {
    if (index >= cafeScenarios.length) {
        showCafeEndScreen();
        return;
    }

    currentSceneIndex = index;
    const scene = cafeScenarios[index];

    // Update scene description
    const sceneDesc = document.getElementById('cafe-scene-desc');
    if (sceneDesc) sceneDesc.textContent = scene.scene;

    // Update NPC bubble
    document.getElementById('npc-name').textContent = scene.npc.name;
    document.getElementById('npc-name-rom').textContent = scene.npc.nameRom;
    document.getElementById('npc-korean').textContent = scene.npc.kr;
    document.getElementById('npc-rom').textContent = scene.npc.rom;
    document.getElementById('npc-english').textContent = scene.npc.en;

    // Shuffle response order (but keep data intact)
    const shuffled = [...scene.responses].sort(() => Math.random() - 0.5);

    // Update response buttons
    const container = document.getElementById('cafe-responses');
    container.innerHTML = '';

    shuffled.forEach((resp, i) => {
        const btn = document.createElement('button');
        btn.className = 'response-card';
        btn.dataset.tier = resp.tier;
        btn.dataset.index = i;
        btn.onclick = () => selectResponse(resp);

        btn.innerHTML = `
            <div class="response-korean">${resp.kr}</div>
            <div class="response-rom romanization">${resp.rom}</div>
            <div class="response-english english">${resp.en}</div>
        `;

        container.appendChild(btn);
    });

    // Hide feedback
    const feedback = document.getElementById('cafe-feedback');
    if (feedback) feedback.classList.add('hidden');

    // Update progress
    document.getElementById('cafe-round').textContent = `${index + 1} / ${cafeScenarios.length}`;
    document.getElementById('cafe-score').textContent = cafeScore;

    // Apply settings
    applySettings();
}

// ============================================
// Response Handling
// ============================================

function selectResponse(response) {
    if (!gameActive) return;

    // Prevent double-clicking
    const buttons = document.querySelectorAll('.response-card');
    buttons.forEach(btn => {
        btn.disabled = true;
        btn.style.pointerEvents = 'none';
    });

    // Score
    let points = 0;
    if (response.tier === 'best') points = 2;
    else if (response.tier === 'acceptable') points = 1;
    cafeScore += points;

    cafeAnswers.push({
        scene: currentSceneIndex + 1,
        tier: response.tier,
        points: points
    });

    // Highlight selected and show tiers
    buttons.forEach(btn => {
        const tier = btn.dataset.tier;
        if (tier === 'best') btn.classList.add('tier-best');
        else if (tier === 'acceptable') btn.classList.add('tier-ok');
        else btn.classList.add('tier-wrong');

        // Add tier badge
        const badge = document.createElement('span');
        badge.className = 'tier-badge';
        if (tier === 'best') badge.textContent = 'BEST';
        else if (tier === 'acceptable') badge.textContent = 'OK';
        else badge.textContent = 'X';
        btn.prepend(badge);
    });

    // Show feedback
    const feedback = document.getElementById('cafe-feedback');
    const feedbackIcon = document.getElementById('cafe-feedback-icon');
    const feedbackText = document.getElementById('cafe-feedback-text');
    const feedbackKr = document.getElementById('cafe-feedback-kr');

    if (response.tier === 'best') {
        feedbackIcon.textContent = '★';
        feedbackIcon.className = 'feedback-icon tier-best-color';
    } else if (response.tier === 'acceptable') {
        feedbackIcon.textContent = '○';
        feedbackIcon.className = 'feedback-icon tier-ok-color';
    } else {
        feedbackIcon.textContent = '✕';
        feedbackIcon.className = 'feedback-icon tier-wrong-color';
    }

    feedbackText.textContent = response.feedback;
    feedbackKr.textContent = response.feedbackKr;
    feedback.classList.remove('hidden');

    // Update score display
    document.getElementById('cafe-score').textContent = cafeScore;
}

function nextCafeScene() {
    showScene(currentSceneIndex + 1);
}

// ============================================
// End Screen
// ============================================

function showCafeEndScreen() {
    gameActive = false;

    const gameArea = document.getElementById('cafe-game-area');
    if (gameArea) gameArea.classList.add('hidden');

    const endScreen = document.getElementById('cafe-end-screen');
    endScreen.classList.remove('hidden');

    const maxScore = cafeScenarios.length * 2;
    const percentage = Math.round((cafeScore / maxScore) * 100);

    // Rating
    let rating, ratingKr;
    if (percentage >= 90) {
        rating = 'Perfect!';
        ratingKr = '완벽해요!';
    } else if (percentage >= 60) {
        rating = 'Great job!';
        ratingKr = '잘 했어요!';
    } else if (percentage >= 30) {
        rating = 'Not bad!';
        ratingKr = '괜찮아요!';
    } else {
        rating = 'Keep practicing!';
        ratingKr = '더 연습해요!';
    }

    document.getElementById('cafe-final-score').textContent = `${cafeScore} / ${maxScore}`;
    document.getElementById('cafe-rating').textContent = rating;
    document.getElementById('cafe-rating-kr').textContent = ratingKr;

    // Score bar fill
    const bar = document.getElementById('cafe-score-bar-fill');
    if (bar) {
        bar.style.width = '0%';
        setTimeout(() => { bar.style.width = percentage + '%'; }, 100);
    }

    // Review breakdown
    const reviewList = document.getElementById('cafe-review-list');
    reviewList.innerHTML = '';
    cafeAnswers.forEach((ans, i) => {
        const div = document.createElement('div');
        div.className = 'review-item';
        const tierClass = ans.tier === 'best' ? 'tier-best-color' : (ans.tier === 'acceptable' ? 'tier-ok-color' : 'tier-wrong-color');
        div.innerHTML = `
            <span class="review-round">Round ${ans.scene}</span>
            <span class="review-tier ${tierClass}">${ans.tier === 'best' ? '★ Best' : (ans.tier === 'acceptable' ? '○ OK' : '✕ Wrong')}</span>
            <span class="review-points">+${ans.points}</span>
        `;
        reviewList.appendChild(div);
    });
}

function replayCafeGame() {
    resetCafeGame();
}
