/**
 * Korean Learning Tools - Sentence Builder Component
 * Interactive sentence building with customizable vocabulary
 */

// ============================================
// Default Data (used if student has no custom vocab)
// ============================================

const defaultVerbTypes = [
    {
        id: 'eat',
        label: 'eat (먹다)',
        objectType: 'food',
        usesEseo: true,
        tenses: {
            past: { kr: '먹었어요', rom: 'MOU-GOU-SSO-YO', en: 'ate' },
            present: { kr: '먹어요', rom: 'MOU-GOU-YO', en: 'eat' },
            future: { kr: '먹을 거예요', rom: 'MOU-GUL GOU-YE-YO', en: 'will eat' }
        }
    },
    {
        id: 'drink',
        label: 'drink (마시다)',
        objectType: 'drink',
        usesEseo: true,
        tenses: {
            past: { kr: '마셨어요', rom: 'MA-SYOU-SSO-YO', en: 'drank' },
            present: { kr: '마셔요', rom: 'MA-SYOU-YO', en: 'drink' },
            future: { kr: '마실 거예요', rom: 'MA-SHIL GOU-YE-YO', en: 'will drink' }
        }
    },
    {
        id: 'meet',
        label: 'meet (만나다)',
        objectType: 'person',
        usesEseo: true,
        tenses: {
            past: { kr: '만났어요', rom: 'MAN-NA-SSO-YO', en: 'met' },
            present: { kr: '만나요', rom: 'MAN-NA-YO', en: 'meet' },
            future: { kr: '만날 거예요', rom: 'MAN-NAL GOU-YE-YO', en: 'will meet' }
        }
    },
    {
        id: 'buy',
        label: 'buy (사다)',
        objectType: 'thing',
        usesEseo: true,
        tenses: {
            past: { kr: '샀어요', rom: 'SA-SSO-YO', en: 'bought' },
            present: { kr: '사요', rom: 'SA-YO', en: 'buy' },
            future: { kr: '살 거예요', rom: 'SAL GOU-YE-YO', en: 'will buy' }
        }
    },
    {
        id: 'go',
        label: 'go (가다)',
        objectType: 'none',
        usesEseo: false,
        tenses: {
            past: { kr: '갔어요', rom: 'GA-SSO-YO', en: 'went' },
            present: { kr: '가요', rom: 'GA-YO', en: 'go' },
            future: { kr: '갈 거예요', rom: 'GAL GOU-YE-YO', en: 'will go' }
        }
    }
];

const defaultTenses = [
    { id: 'past', label: 'Past (했어요)', times: ['yesterday', 'today'] },
    { id: 'present', label: 'Present (해요)', times: ['today', 'now'] },
    { id: 'future', label: 'Future (할 거예요)', times: ['today', 'tomorrow'] }
];

const defaultTimes = {
    yesterday: { kr: '어제', rom: 'OU-JE', en: 'yesterday' },
    today: { kr: '오늘', rom: 'O-NUL', en: 'today' },
    tomorrow: { kr: '내일', rom: 'NAE-IL', en: 'tomorrow' },
    now: { kr: '지금', rom: 'JI-GUM', en: 'now' }
};

const defaultPlaces = [
    { kr: '카페', rom: 'KA-PE', en: 'cafe' },
    { kr: '식당', rom: 'SHIK-DANG', en: 'restaurant' },
    { kr: '공원', rom: 'GONG-WON', en: 'park' },
    { kr: '백화점', rom: 'BAEK-HWA-JOUM', en: 'department store' },
    { kr: '학교', rom: 'HAK-GYO', en: 'school' }
];

const defaultObjects = {
    food: [
        { kr: '피자', rom: 'PI-JA', en: 'pizza' },
        { kr: '치킨', rom: 'CHI-KIN', en: 'chicken' },
        { kr: '케이크', rom: 'KE-I-KEU', en: 'cake' },
        { kr: '비빔밥', rom: 'BI-BIM-BAP', en: 'bibimbap' },
        { kr: '김치', rom: 'KIM-CHI', en: 'kimchi' }
    ],
    drink: [
        { kr: '커피', rom: 'KO-PI', en: 'coffee' },
        { kr: '차', rom: 'CHA', en: 'tea' },
        { kr: '물', rom: 'MUL', en: 'water' },
        { kr: '주스', rom: 'JU-SEU', en: 'juice' }
    ],
    person: [
        { kr: '친구', rom: 'CHIN-GU', en: 'friend' },
        { kr: '선생님', rom: 'SON-SENG-NIM', en: 'teacher' }
    ],
    thing: [
        { kr: '피자', rom: 'PI-JA', en: 'pizza' },
        { kr: '치킨', rom: 'CHI-KIN', en: 'chicken' },
        { kr: '케이크', rom: 'KE-I-KEU', en: 'cake' },
        { kr: '커피', rom: 'KO-PI', en: 'coffee' },
        { kr: '차', rom: 'CHA', en: 'tea' },
        { kr: '옷', rom: 'OT', en: 'clothes' },
        { kr: '신발', rom: 'SHIN-BAL', en: 'shoes' },
        { kr: '가방', rom: 'GA-BANG', en: 'bag' }
    ]
};

// ============================================
// Subjects (with semantic types for validation)
// ============================================

const defaultSubjects = [
    { kr: '저는', rom: 'JOU-NUN', en: 'I', type: 'person' },
    { kr: '스티브는', rom: 'SEU-TI-BEU-NUN', en: 'Steve', type: 'person' },
    { kr: '알레산드라는', rom: 'AL-LE-SAN-DEU-RA-NUN', en: 'Alessandra', type: 'person' },
    { kr: '친구는', rom: 'CHIN-GU-NUN', en: 'My friend', type: 'person' },
    { kr: '선생님은', rom: 'SEON-SAENG-NIM-EUN', en: 'The teacher', type: 'person' },
    { kr: '이거는', rom: 'I-GEO-NUN', en: 'This', type: 'demonstrative' },
    { kr: '저거는', rom: 'JEO-GEO-NUN', en: 'That', type: 'demonstrative' },
    { kr: '여기는', rom: 'YEO-GI-NUN', en: 'Here', type: 'location' },
    { kr: '저기는', rom: 'JEO-GI-NUN', en: 'There', type: 'location' },
];

// ============================================
// State Variables
// ============================================

let subjects = defaultSubjects;
let verbTypes = defaultVerbTypes;
let tenses = defaultTenses;
let times = defaultTimes;
let places = defaultPlaces;
let objects = defaultObjects;

let currentSubjectIndex = 0;
let currentVerbTypeIndex = 0;
let currentTenseIndex = 0;
let currentTimeIndex = 0;
let currentPlaceIndex = 0;
let currentObjectIndex = 0;
let currentCopulaItemIndex = 0;

// ============================================
// Initialization
// ============================================

function initializeSentenceBuilder() {
    // Load student's lesson-scoped verbs if available (new schema)
    if (studentData && studentData.lessonVerbs && studentData.lessonVerbs.length > 0) {
        loadLessonScopedData();
    }
    // Fallback to old schema
    else if (studentData && studentData.assignedVocab) {
        loadStudentVocabulary();
    }

    // Initial update
    updateSentenceBuilder();
}

function loadLessonScopedData() {
    // Load lesson-specific verbs (semantically validated)
    if (studentData.lessonVerbs) {
        verbTypes = studentData.lessonVerbs.map(verb => ({
            id: verb.id,
            label: verb.label,
            objectType: verb.objectType,
            usesEseo: verb.usesEseo,
            tenses: {
                past: verb.tenses.past,
                present: verb.tenses.present,
                future: verb.tenses.future
            }
        }));
    }

    // Load vocabulary by category (semantically filtered)
    const vocab = studentData.assignedVocab;

    if (vocab.food && vocab.food.length > 0) {
        objects.food = vocab.food.map(item => ({
            kr: item.kr || item,
            rom: item.rom || '',
            en: item.en || ''
        }));
    }

    if (vocab.drink && vocab.drink.length > 0) {
        objects.drink = vocab.drink.map(item => ({
            kr: item.kr || item,
            rom: item.rom || '',
            en: item.en || ''
        }));
    }

    if (vocab.places && vocab.places.length > 0) {
        places = vocab.places.map(item => ({
            kr: item.kr || item,
            rom: item.rom || '',
            en: item.en || ''
        }));
    }

    // Support for 'people' category (used with 만나다)
    if (vocab.people && vocab.people.length > 0) {
        objects.person = vocab.people.map(item => ({
            kr: item.kr || item,
            rom: item.rom || '',
            en: item.en || ''
        }));
    }

    // Custom vocab as general 'things' for 사다
    if (studentData.customVocab && studentData.customVocab.length > 0) {
        objects.thing = [
            ...objects.thing,
            ...studentData.customVocab.filter(item => item.kr && !item.kr.includes('하세요') && !item.kr.includes('할게요')).map(item => ({
                kr: item.kr,
                rom: item.rom || '',
                en: item.en || ''
            }))
        ];
    }

    console.log('Loaded lesson-scoped data:', {
        verbs: verbTypes.length,
        food: objects.food.length,
        drink: objects.drink.length,
        places: places.length,
        people: objects.person ? objects.person.length : 0
    });
}

function loadStudentVocabulary() {
    const vocab = studentData.assignedVocab;

    // Merge with defaults or replace
    if (vocab.food && vocab.food.length > 0) {
        objects.food = vocab.food.map(item => ({
            kr: item.kr || item,
            rom: item.rom || '',
            en: item.en || ''
        }));
    }

    if (vocab.drink && vocab.drink.length > 0) {
        objects.drink = vocab.drink.map(item => ({
            kr: item.kr || item,
            rom: item.rom || '',
            en: item.en || ''
        }));
    }

    if (vocab.places && vocab.places.length > 0) {
        places = vocab.places.map(item => ({
            kr: item.kr || item,
            rom: item.rom || '',
            en: item.en || ''
        }));
    }

    // Load custom vocab as "things"
    if (studentData.customVocab && studentData.customVocab.length > 0) {
        objects.thing = [
            ...objects.thing,
            ...studentData.customVocab.map(item => ({
                kr: item.kr,
                rom: item.rom || '',
                en: item.en || ''
            }))
        ];
    }
}

// ============================================
// Getters
// ============================================

function getCurrentVerbType() {
    return verbTypes[currentVerbTypeIndex];
}

function getCurrentTense() {
    return tenses[currentTenseIndex];
}

function getAvailableTimes() {
    const tense = getCurrentTense();
    return tense.times.map(t => times[t]);
}

function getAvailableObjects() {
    const verbType = getCurrentVerbType();
    if (verbType.objectType === 'none') return [];

    // Map objectType to objects category
    const objectTypeMap = {
        'food': objects.food || [],
        'drink': objects.drink || [],
        'person': objects.person || defaultObjects.person || [],
        'people': objects.person || defaultObjects.person || [],
        'thing': objects.thing || []
    };

    return objectTypeMap[verbType.objectType] || [];
}

// ============================================
// Cycle Functions
// ============================================

function cycleVerbType() {
    currentVerbTypeIndex = (currentVerbTypeIndex + 1) % verbTypes.length;
    currentObjectIndex = 0; // Reset object when verb changes
    updateSentenceBuilder();
}

function cycleTense() {
    currentTenseIndex = (currentTenseIndex + 1) % tenses.length;
    currentTimeIndex = 0; // Reset time when tense changes
    updateSentenceBuilder();
}

function cycleSubject() {
    currentSubjectIndex = (currentSubjectIndex + 1) % subjects.length;
    currentCopulaItemIndex = 0;
    updateSentenceBuilder();
}

function getCopula(kr) {
    const lastChar = kr.charCodeAt(kr.length - 1);
    if (lastChar >= 0xAC00 && lastChar <= 0xD7A3) {
        return (lastChar - 0xAC00) % 28 !== 0
            ? { kr: '이에요', rom: 'I-E-YO', en: 'is' }
            : { kr: '예요', rom: 'YE-YO', en: 'is' };
    }
    return { kr: '예요', rom: 'YE-YO', en: 'is' };
}

function getAllNouns() {
    const all = [];
    (objects.food || []).forEach(i => all.push({ ...i, category: 'food' }));
    (objects.drink || []).forEach(i => all.push({ ...i, category: 'drink' }));
    (objects.person || []).forEach(i => all.push({ ...i, category: 'person' }));
    (objects.thing || []).forEach(i => all.push({ ...i, category: 'thing' }));
    return all;
}

function getCurrentSubject() {
    return subjects[currentSubjectIndex];
}

function cycleTime() {
    const availableTimes = getAvailableTimes();
    currentTimeIndex = (currentTimeIndex + 1) % availableTimes.length;
    updateSentenceBuilder();
}

function cyclePlace() {
    currentPlaceIndex = (currentPlaceIndex + 1) % places.length;
    updateSentenceBuilder();
}

function cycleObject() {
    const subject = getCurrentSubject();
    if (subject.type === 'demonstrative') {
        const allNouns = getAllNouns();
        if (allNouns.length > 0) {
            currentCopulaItemIndex = (currentCopulaItemIndex + 1) % allNouns.length;
            updateSentenceBuilder();
        }
    } else {
        const availableObjects = getAvailableObjects();
        if (availableObjects.length > 0) {
            currentObjectIndex = (currentObjectIndex + 1) % availableObjects.length;
            updateSentenceBuilder();
        }
    }
}

// ============================================
// Update Functions
// ============================================

function updateSentenceBuilder() {
    const subject = getCurrentSubject();
    const mode = subject.type; // 'person', 'demonstrative', 'location'

    // Update subject block
    document.getElementById('subject-kr').textContent = subject.kr;
    document.getElementById('subject-rom').textContent = subject.rom;
    document.getElementById('subject-en').textContent = subject.en;

    // Get block references
    const timeBlock = document.getElementById('time-block');
    const placeBlock = document.getElementById('place-block');
    const objectBlock = document.getElementById('object-block');
    const verbBlock = document.getElementById('verb-block');
    const controlPanel = document.querySelector('.sentence-controls');
    const particleNote = document.getElementById('particle-note');

    if (mode === 'demonstrative') {
        // A is B mode: subject + noun + copula
        if (timeBlock) timeBlock.classList.add('hidden');
        if (placeBlock) placeBlock.classList.add('hidden');
        if (verbBlock) verbBlock.classList.add('hidden');
        if (controlPanel) controlPanel.classList.add('hidden');

        const allNouns = getAllNouns();
        if (allNouns.length > 0) {
            objectBlock.classList.remove('hidden');
            const noun = allNouns[currentCopulaItemIndex % allNouns.length];
            document.getElementById('object-kr').textContent = noun.kr;
            document.getElementById('object-rom').textContent = noun.rom;
            document.getElementById('object-en').textContent = noun.en;
        }
        if (particleNote) {
            particleNote.textContent = '이거 = this thing / 저거 = that thing + 는 (topic marker)';
        }
    } else if (mode === 'location') {
        // Location mode: subject + place + copula
        if (timeBlock) timeBlock.classList.add('hidden');
        if (verbBlock) verbBlock.classList.add('hidden');
        if (objectBlock) objectBlock.classList.add('hidden');
        if (controlPanel) controlPanel.classList.add('hidden');

        if (placeBlock) {
            placeBlock.classList.remove('hidden');
            const place = places[currentPlaceIndex % places.length];
            document.getElementById('place-kr').textContent = place.kr;
            document.getElementById('place-rom').textContent = place.rom;
            document.getElementById('place-en').textContent = place.en;
        }
        if (particleNote) {
            particleNote.textContent = '여기 = here / 저기 = there + 는 (topic marker)';
        }
    } else {
        // Normal action mode: subject + time + place + object + verb
        if (timeBlock) timeBlock.classList.remove('hidden');
        if (placeBlock) placeBlock.classList.remove('hidden');
        if (verbBlock) verbBlock.classList.remove('hidden');
        if (controlPanel) controlPanel.classList.remove('hidden');

        const verbType = getCurrentVerbType();
        const tense = getCurrentTense();
        const availableTimes = getAvailableTimes();
        const availableObjects = getAvailableObjects();
        const place = places[currentPlaceIndex];
        const time = availableTimes[currentTimeIndex % availableTimes.length];
        const verb = verbType.tenses[tense.id];

        // Update control buttons
        document.getElementById('verb-type-btn').textContent = verbType.label;
        document.getElementById('tense-btn').textContent = tense.label;

        // Update time block
        document.getElementById('time-kr').textContent = time.kr;
        document.getElementById('time-rom').textContent = time.rom;
        document.getElementById('time-en').textContent = time.en;

        // Update place block with correct particle
        const particle = verbType.usesEseo ? '에서' : '에';
        const particleRom = verbType.usesEseo ? 'E-SOU' : 'E';
        const particleEn = verbType.usesEseo ? 'at the' : 'to the';

        document.getElementById('place-kr').textContent = place.kr + particle;
        document.getElementById('place-rom').textContent = place.rom + '-' + particleRom;
        document.getElementById('place-en').textContent = particleEn + ' ' + place.en;

        // Update particle note
        if (verbType.usesEseo) {
            particleNote.textContent = '에서 = "at" (doing action at a place)';
        } else {
            particleNote.textContent = '에 = "to" (going to a place)';
        }

        // Update object block
        if (verbType.objectType === 'none') {
            objectBlock.classList.add('hidden');
        } else {
            objectBlock.classList.remove('hidden');
            const obj = availableObjects[currentObjectIndex % availableObjects.length];
            if (obj) {
                document.getElementById('object-kr').textContent = obj.kr;
                document.getElementById('object-rom').textContent = obj.rom;
                document.getElementById('object-en').textContent = obj.en;
            }
        }

        // Update verb block
        document.getElementById('verb-kr').textContent = verb.kr;
        document.getElementById('verb-rom').textContent = verb.rom;
        document.getElementById('verb-en').textContent = verb.en;
    }

    // Build full sentence
    buildFullSentence();

    // Apply romanization setting
    applySettings();
}

function buildFullSentence() {
    const subject = getCurrentSubject();
    const mode = subject.type;

    if (mode === 'demonstrative') {
        const allNouns = getAllNouns();
        if (allNouns.length === 0) return;
        const noun = allNouns[currentCopulaItemIndex % allNouns.length];
        const copula = getCopula(noun.kr);

        document.getElementById('full-korean').textContent =
            subject.kr + ' ' + noun.kr + copula.kr;
        document.getElementById('full-rom').textContent =
            subject.rom + ' ' + noun.rom + ' ' + copula.rom;
        document.getElementById('full-english').textContent =
            '"' + subject.en + ' is ' + noun.en + '"';

    } else if (mode === 'location') {
        const place = places[currentPlaceIndex % places.length];
        const copula = getCopula(place.kr);

        document.getElementById('full-korean').textContent =
            subject.kr + ' ' + place.kr + copula.kr;
        document.getElementById('full-rom').textContent =
            subject.rom + ' ' + place.rom + ' ' + copula.rom;
        document.getElementById('full-english').textContent =
            '"' + subject.en + ' is ' + (subject.en === 'Here' ? '' : 'the ') + place.en + '"';

    } else {
        // Normal action sentence
        const verbType = getCurrentVerbType();
        const tense = getCurrentTense();
        const availableTimes = getAvailableTimes();
        const availableObjects = getAvailableObjects();
        const place = places[currentPlaceIndex];
        const time = availableTimes[currentTimeIndex % availableTimes.length];
        const verb = verbType.tenses[tense.id];
        const particle = verbType.usesEseo ? '에서' : '에';
        const particleRom = verbType.usesEseo ? 'E-SOU' : 'E';

        let koreanParts = [subject.kr, time.kr, place.kr + particle];
        let romParts = [subject.rom, time.rom, place.rom + '-' + particleRom];
        let englishParts = [];

        if (verbType.objectType !== 'none' && availableObjects.length > 0) {
            const obj = availableObjects[currentObjectIndex % availableObjects.length];
            if (obj) {
                koreanParts.push(obj.kr);
                romParts.push(obj.rom);
            }
        }

        koreanParts.push(verb.kr);
        romParts.push(verb.rom);

        // Build English sentence
        let timeEn = time.en === 'now' ? '' : (time.en.charAt(0).toUpperCase() + time.en.slice(1) + ',');
        let placeEn = verbType.usesEseo ? 'at the ' + place.en : 'to the ' + place.en;
        let subjectEn = subject.en;

        if (verbType.objectType === 'none') {
            englishParts = [timeEn, subjectEn, verb.en, placeEn].filter(x => x);
        } else if (availableObjects.length > 0) {
            const obj = availableObjects[currentObjectIndex % availableObjects.length];
            if (obj) {
                englishParts = [timeEn, subjectEn, verb.en, obj.en, placeEn].filter(x => x);
            }
        }

        document.getElementById('full-korean').textContent = koreanParts.join(' ');
        document.getElementById('full-rom').textContent = romParts.join(' ');
        document.getElementById('full-english').textContent = '"' + englishParts.join(' ') + '"';
    }
}
