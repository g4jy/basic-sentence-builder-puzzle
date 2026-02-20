/**
 * Korean Learning Tools - Main App Controller
 * Handles authentication, navigation, and settings
 */

// Global state
let studentData = null;
let settings = {
    showRomanization: true,
    showEnglish: true,
    autoFlip: false
};

// ============================================
// Initialization
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    const savedStudent = localStorage.getItem('koreanLearning_student');
    if (!savedStudent) {
        window.location.href = 'index.html';
        return;
    }

    try {
        studentData = JSON.parse(savedStudent);
        initializeApp();
    } catch (error) {
        console.error('Failed to parse student data:', error);
        logout();
    }
});

function initializeApp() {
    // Display student info
    document.getElementById('student-display-name').textContent = studentData.name || 'Student';
    document.getElementById('settings-student-id').textContent = studentData.id || '-';
    document.getElementById('settings-level').textContent = `Level ${studentData.settings?.level || 1}`;

    // Load settings
    loadSettings();

    // Initialize tabs
    initializeTabs();

    // Initialize components
    initializeSentenceBuilder();
    initializeFlashcards();
    if (typeof initializeCafeGame === 'function') initializeCafeGame();

    // Apply settings
    applySettings();
}

// ============================================
// Navigation
// ============================================

function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.dataset.tab;
            switchTab(tabId);
        });
    });
}

function switchTab(tabId) {
    // Update buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
    });

    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === tabId);
    });

    // Special actions for tabs
    if (tabId === 'flashcards') {
        resetFlashcardView();
    }
}

// ============================================
// Settings
// ============================================

function loadSettings() {
    const saved = localStorage.getItem('koreanLearning_settings');
    if (saved) {
        try {
            settings = { ...settings, ...JSON.parse(saved) };
        } catch (e) {
            console.error('Failed to load settings:', e);
        }
    }

    // Apply to UI
    document.getElementById('romanization-toggle').checked = settings.showRomanization;
    const engToggle = document.getElementById('english-toggle');
    if (engToggle) engToggle.checked = settings.showEnglish;
    document.getElementById('autoflip-toggle').checked = settings.autoFlip;
}

function saveSettings() {
    localStorage.setItem('koreanLearning_settings', JSON.stringify(settings));
}

function applySettings() {
    // Apply romanization setting
    const blocksContainer = document.getElementById('sentence-blocks');
    if (blocksContainer) {
        blocksContainer.classList.toggle('romanization-hidden', !settings.showRomanization);
        blocksContainer.classList.toggle('english-hidden', !settings.showEnglish);
    }

    // Apply to result section
    const resultRom = document.getElementById('full-rom');
    if (resultRom) {
        resultRom.style.display = settings.showRomanization ? 'block' : 'none';
    }

    const resultEnglish = document.getElementById('full-english');
    if (resultEnglish) {
        resultEnglish.style.display = settings.showEnglish ? 'block' : 'none';
    }

    // Apply to flashcard
    const cardRom = document.getElementById('card-back-rom');
    if (cardRom) {
        cardRom.style.display = settings.showRomanization ? 'block' : 'none';
    }

    // Apply to cafe game
    const cafeContainer = document.getElementById('cafe-game-area');
    if (cafeContainer) {
        cafeContainer.classList.toggle('romanization-hidden', !settings.showRomanization);
        cafeContainer.classList.toggle('english-hidden', !settings.showEnglish);
    }
}

function toggleRomanization() {
    settings.showRomanization = document.getElementById('romanization-toggle').checked;
    saveSettings();
    applySettings();
}

function toggleEnglish() {
    settings.showEnglish = document.getElementById('english-toggle').checked;
    saveSettings();
    applySettings();
}

function toggleAutoFlip() {
    settings.autoFlip = document.getElementById('autoflip-toggle').checked;
    saveSettings();
}

// ============================================
// Progress Management
// ============================================

function getProgress() {
    const saved = localStorage.getItem(`koreanLearning_progress_${studentData.id}`);
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) {
            return {};
        }
    }
    return {};
}

function saveProgress(progress) {
    localStorage.setItem(`koreanLearning_progress_${studentData.id}`, JSON.stringify(progress));
}

function exportProgress() {
    const progress = getProgress();
    const exportData = {
        studentId: studentData.id,
        studentName: studentData.name,
        exportDate: new Date().toISOString(),
        progress: progress
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `korean_progress_${studentData.id}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function confirmResetProgress() {
    if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
        localStorage.removeItem(`koreanLearning_progress_${studentData.id}`);
        alert('Progress has been reset.');
        location.reload();
    }
}

// ============================================
// Authentication
// ============================================

function logout() {
    localStorage.removeItem('koreanLearning_student');
    localStorage.removeItem('koreanLearning_studentId');
    window.location.href = 'index.html';
}

// ============================================
// Utility Functions
// ============================================

function getRomanization(korean) {
    // Basic romanization map (can be extended)
    const map = {
        '가': 'GA', '나': 'NA', '다': 'DA', '라': 'RA', '마': 'MA',
        '바': 'BA', '사': 'SA', '아': 'A', '자': 'JA', '차': 'CHA',
        '카': 'KA', '타': 'TA', '파': 'PA', '하': 'HA',
        '커피': 'KO-PI', '카페': 'KA-PE', '피자': 'PI-JA'
    };
    return map[korean] || korean;
}
