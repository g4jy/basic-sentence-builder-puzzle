/* ============================================
   Sentence Practice — Tap-to-cycle sentence builder
   Tap each block to cycle through word options
   ============================================ */

(function() {
  'use strict';

  // ============================================
  // Default Data
  // ============================================

  var defaultSubjects = [
    { kr: '\uC800\uB294', rom: 'jeo-neun', en: 'I', type: 'person' },
    { kr: '\uC2A4\uD2F0\uBE0C\uB294', rom: 'seu-ti-beu-neun', en: 'Steve', type: 'person' },
    { kr: '\uC54C\uB808\uC0B0\uB4DC\uB77C\uB294', rom: 'al-re-san-deu-ra-neun', en: 'Alessandra', type: 'person' },
    { kr: '\uCE5C\uAD6C\uB294', rom: 'chin-gu-neun', en: 'My friend', type: 'person' },
    { kr: '\uC120\uC0DD\uB2D8\uC740', rom: 'seon-saeng-nim-eun', en: 'The teacher', type: 'person' },
    { kr: '\uC774\uAC70\uB294', rom: 'i-geo-neun', en: 'This', type: 'demonstrative' },
    { kr: '\uC800\uAC70\uB294', rom: 'jeo-geo-neun', en: 'That', type: 'demonstrative' },
    { kr: '\uC5EC\uAE30\uB294', rom: 'yeo-gi-neun', en: 'Here', type: 'location' },
    { kr: '\uC800\uAE30\uB294', rom: 'jeo-gi-neun', en: 'There', type: 'location' }
  ];

  var defaultVerbTypes = [
    {
      id: 'eat', label: 'eat', labelKr: '\uBA39\uB2E4', objectType: 'food', usesEseo: true,
      tenses: {
        past: { kr: '\uBA39\uC5C8\uC5B4\uC694', rom: 'meo-geo-sseo-yo', en: 'ate' },
        present: { kr: '\uBA39\uC5B4\uC694', rom: 'meo-geo-yo', en: 'eat' },
        future: { kr: '\uBA39\uC744 \uAC70\uC608\uC694', rom: 'meo-geul geo-ye-yo', en: 'will eat' }
      }
    },
    {
      id: 'drink', label: 'drink', labelKr: '\uB9C8\uC2DC\uB2E4', objectType: 'drink', usesEseo: true,
      tenses: {
        past: { kr: '\uB9C8\uC168\uC5B4\uC694', rom: 'ma-syeo-sseo-yo', en: 'drank' },
        present: { kr: '\uB9C8\uC154\uC694', rom: 'ma-syeo-yo', en: 'drink' },
        future: { kr: '\uB9C8\uC2E4 \uAC70\uC608\uC694', rom: 'ma-sil geo-ye-yo', en: 'will drink' }
      }
    },
    {
      id: 'buy', label: 'buy', labelKr: '\uC0AC\uB2E4', objectType: 'thing', usesEseo: true,
      tenses: {
        past: { kr: '\uC0C0\uC5B4\uC694', rom: 'sa-sseo-yo', en: 'bought' },
        present: { kr: '\uC0AC\uC694', rom: 'sa-yo', en: 'buy' },
        future: { kr: '\uC0B4 \uAC70\uC608\uC694', rom: 'sal geo-ye-yo', en: 'will buy' }
      }
    },
    {
      id: 'go', label: 'go', labelKr: '\uAC00\uB2E4', objectType: 'none', usesEseo: false,
      tenses: {
        past: { kr: '\uAC14\uC5B4\uC694', rom: 'ga-sseo-yo', en: 'went' },
        present: { kr: '\uAC00\uC694', rom: 'ga-yo', en: 'go' },
        future: { kr: '\uAC08 \uAC70\uC608\uC694', rom: 'gal geo-ye-yo', en: 'will go' }
      }
    }
  ];

  var defaultTenses = [
    { id: 'past', label: 'Past', labelKr: '\uD588\uC5B4\uC694', times: ['yesterday', 'today'] },
    { id: 'present', label: 'Present', labelKr: '\uD574\uC694', times: ['today', 'now'] },
    { id: 'future', label: 'Future', labelKr: '\uD560 \uAC70\uC608\uC694', times: ['today', 'tomorrow'] }
  ];

  var defaultTimes = {
    yesterday: { kr: '\uC5B4\uC81C', rom: 'eo-je', en: 'yesterday' },
    today: { kr: '\uC624\uB298', rom: 'o-neul', en: 'today' },
    tomorrow: { kr: '\uB0B4\uC77C', rom: 'nae-il', en: 'tomorrow' },
    now: { kr: '\uC9C0\uAE08', rom: 'ji-geum', en: 'now' }
  };

  var defaultPlaces = [
    { kr: '\uCE74\uD398', rom: 'ka-pe', en: 'cafe' },
    { kr: '\uC2DD\uB2F9', rom: 'sik-dang', en: 'restaurant' },
    { kr: '\uACF5\uC6D0', rom: 'gong-won', en: 'park' },
    { kr: '\uD559\uAD50', rom: 'hak-gyo', en: 'school' },
    { kr: '\uBCD1\uC6D0', rom: 'byeong-won', en: 'hospital' }
  ];

  var defaultObjects = {
    food: [
      { kr: '\uD53C\uC790', rom: 'pi-ja', en: 'pizza' },
      { kr: '\uBC25', rom: 'bap', en: 'rice' },
      { kr: '\uAE40\uCE58', rom: 'gim-chi', en: 'kimchi' },
      { kr: '\uACE0\uAE30', rom: 'go-gi', en: 'meat' },
      { kr: '\uBE75', rom: 'ppang', en: 'bread' }
    ],
    drink: [
      { kr: '\uCEE4\uD53C', rom: 'keo-pi', en: 'coffee' },
      { kr: '\uCC28', rom: 'cha', en: 'tea' },
      { kr: '\uBB3C', rom: 'mul', en: 'water' },
      { kr: '\uC8FC\uC2A4', rom: 'ju-seu', en: 'juice' },
      { kr: '\uC6B0\uC720', rom: 'u-yu', en: 'milk' }
    ],
    thing: [
      { kr: '\uCEE4\uD53C', rom: 'keo-pi', en: 'coffee' },
      { kr: '\uBE75', rom: 'ppang', en: 'bread' },
      { kr: '\uACFC\uC77C', rom: 'gwa-il', en: 'fruit' }
    ]
  };

  // ============================================
  // State
  // ============================================

  var subjects = defaultSubjects;
  var verbTypes = defaultVerbTypes;
  var tenseList = defaultTenses;
  var timeMap = defaultTimes;
  var placeList = defaultPlaces;
  var objectMap = defaultObjects;

  var currentSubjectIndex = 0;
  var currentVerbTypeIndex = 0;
  var currentTenseIndex = 0;
  var currentTimeIndex = 0;
  var currentPlaceIndex = 0;
  var currentObjectIndex = 0;
  var currentCopulaItemIndex = 0;

  var showRom = true;
  var showEng = true;

  // ============================================
  // Initialization
  // ============================================

  async function init() {
    var ok = await StudentManager.init();
    if (!ok || !StudentManager.current) {
      window.location.href = 'index.html';
      return;
    }

    Nav.renderHeader('Sentence Practice');
    loadTierData();
    renderBlocks();
    update();
  }

  function loadTierData() {
    var tierData = StudentManager.getCurrentTierData();
    if (!tierData) return;

    // Extract places from vocabulary
    if (tierData.vocabulary) {
      var tierPlaces = tierData.vocabulary
        .filter(function(v) { return v.cat === 'place'; })
        .map(function(v) { return { kr: v.kr, rom: v.rom, en: v.en }; });
      if (tierPlaces.length >= 3) placeList = tierPlaces;

      // Extract food
      var drinkWords = ['\uBB3C', '\uCEE4\uD53C', '\uCC28', '\uC8FC\uC2A4', '\uC6B0\uC720'];
      var tierFood = tierData.vocabulary
        .filter(function(v) { return v.cat === 'food' && drinkWords.indexOf(v.kr) === -1; })
        .map(function(v) { return { kr: v.kr, rom: v.rom, en: v.en }; });
      if (tierFood.length >= 2) objectMap.food = tierFood;

      // Extract drinks
      var tierDrinks = tierData.vocabulary
        .filter(function(v) { return v.cat === 'food' && drinkWords.indexOf(v.kr) !== -1; })
        .map(function(v) { return { kr: v.kr, rom: v.rom, en: v.en }; });
      if (tierDrinks.length >= 2) objectMap.drink = tierDrinks;
    }

    // Extract verbs
    if (tierData.verbs) {
      var verbConfig = {
        '\uBA39\uB2E4': { id: 'eat', label: 'eat', labelKr: '\uBA39\uB2E4', objectType: 'food', usesEseo: true, enPast: 'ate', enPresent: 'eat', enFuture: 'will eat' },
        '\uB9C8\uC2DC\uB2E4': { id: 'drink', label: 'drink', labelKr: '\uB9C8\uC2DC\uB2E4', objectType: 'drink', usesEseo: true, enPast: 'drank', enPresent: 'drink', enFuture: 'will drink' },
        '\uC0AC\uB2E4': { id: 'buy', label: 'buy', labelKr: '\uC0AC\uB2E4', objectType: 'thing', usesEseo: true, enPast: 'bought', enPresent: 'buy', enFuture: 'will buy' },
        '\uAC00\uB2E4': { id: 'go', label: 'go', labelKr: '\uAC00\uB2E4', objectType: 'none', usesEseo: false, enPast: 'went', enPresent: 'go', enFuture: 'will go' },
        '\uC88B\uC544\uD558\uB2E4': { id: 'like', label: 'like', labelKr: '\uC88B\uC544\uD558\uB2E4', objectType: 'food', usesEseo: true, enPast: 'liked', enPresent: 'like', enFuture: 'will like' }
      };

      var extracted = [];
      tierData.verbs.forEach(function(v) {
        var cfg = verbConfig[v.base];
        if (!cfg) return;
        extracted.push({
          id: cfg.id, label: cfg.label, labelKr: cfg.labelKr,
          objectType: cfg.objectType, usesEseo: cfg.usesEseo,
          tenses: {
            past: { kr: v.past, rom: v.pastRom, en: cfg.enPast },
            present: { kr: v.polite, rom: v.politeRom, en: cfg.enPresent },
            future: { kr: v.future, rom: v.futureRom, en: cfg.enFuture }
          }
        });
      });
      if (extracted.length >= 2) verbTypes = extracted;
    }
  }

  // ============================================
  // Rendering
  // ============================================

  function renderBlocks() {
    var blocksEl = document.getElementById('sp-blocks');
    var html = '';

    // Subject block (always visible)
    html += makeBlock('subject', '\uC800\uB294', 'jeo-neun', 'I');

    // Time block
    html += makeBlock('time', '\uC5B4\uC81C', 'eo-je', 'yesterday');

    // Place block
    html += makeBlock('place', '\uCE74\uD398\uC5D0\uC11C', 'ka-pe-e-seo', 'at the cafe');

    // Object block
    html += makeBlock('object', '\uD53C\uC790', 'pi-ja', 'pizza');

    // Verb block
    html += makeBlock('verb', '\uBA39\uC5C8\uC5B4\uC694', 'meo-geo-sseo-yo', 'ate');

    blocksEl.innerHTML = html;
  }

  function makeBlock(id, kr, rom, en) {
    var onclick = id === 'verb' ? '' : ' onclick="window._cycle(\'' + id + '\')"';
    return '<div class="sp-block" id="' + id + '-block"' + onclick + '>' +
      '<div class="sp-block-inner" id="' + id + '-inner">' +
      '<div class="sp-block-kr" id="' + id + '-kr">' + Utils.escapeHtml(kr) + '</div>' +
      '<div class="sp-block-rom sp-rom" id="' + id + '-rom">' + Utils.escapeHtml(rom) + '</div>' +
      '<div class="sp-block-en sp-eng" id="' + id + '-en">' + Utils.escapeHtml(en) + '</div>' +
      '</div>' +
      '<div class="sp-block-tap-hint">tap</div>' +
      '</div>';
  }

  // ============================================
  // Cycle Functions
  // ============================================

  function cycle(blockId) {
    switch (blockId) {
      case 'subject': currentSubjectIndex = (currentSubjectIndex + 1) % subjects.length; currentCopulaItemIndex = 0; break;
      case 'time': cycleTimeIndex(); break;
      case 'place': currentPlaceIndex = (currentPlaceIndex + 1) % placeList.length; break;
      case 'object': cycleObjectIndex(); break;
    }
    animateBlock(blockId);
    update();
  }

  function cycleTimeIndex() {
    var availTimes = getAvailableTimes();
    currentTimeIndex = (currentTimeIndex + 1) % availTimes.length;
  }

  function cycleObjectIndex() {
    var subject = subjects[currentSubjectIndex];
    if (subject.type === 'demonstrative') {
      var allNouns = getAllNouns();
      if (allNouns.length > 0) {
        currentCopulaItemIndex = (currentCopulaItemIndex + 1) % allNouns.length;
      }
    } else {
      var objs = getAvailableObjects();
      if (objs.length > 0) {
        currentObjectIndex = (currentObjectIndex + 1) % objs.length;
      }
    }
  }

  function cycleVerbType() {
    currentVerbTypeIndex = (currentVerbTypeIndex + 1) % verbTypes.length;
    currentObjectIndex = 0;
    animateBlock('verb');
    animateBlock('object');
    update();
  }

  function cycleTense() {
    currentTenseIndex = (currentTenseIndex + 1) % tenseList.length;
    currentTimeIndex = 0;
    animateBlock('verb');
    animateBlock('time');
    update();
  }

  // ============================================
  // Helpers
  // ============================================

  function getAvailableTimes() {
    var tense = tenseList[currentTenseIndex];
    return tense.times.map(function(t) { return timeMap[t]; });
  }

  function getAvailableObjects() {
    var vt = verbTypes[currentVerbTypeIndex];
    if (vt.objectType === 'none') return [];
    return objectMap[vt.objectType] || [];
  }

  function getAllNouns() {
    var all = [];
    (objectMap.food || []).forEach(function(i) { all.push(i); });
    (objectMap.drink || []).forEach(function(i) { all.push(i); });
    (objectMap.thing || []).forEach(function(i) { all.push(i); });
    return all;
  }

  function getCopula(kr) {
    var lastChar = kr.charCodeAt(kr.length - 1);
    if (lastChar >= 0xAC00 && lastChar <= 0xD7A3) {
      return (lastChar - 0xAC00) % 28 !== 0
        ? { kr: '\uC774\uC5D0\uC694', rom: 'i-e-yo', en: 'is' }
        : { kr: '\uC608\uC694', rom: 'ye-yo', en: 'is' };
    }
    return { kr: '\uC608\uC694', rom: 'ye-yo', en: 'is' };
  }

  // ============================================
  // Update Display
  // ============================================

  function update() {
    var subject = subjects[currentSubjectIndex];
    var mode = subject.type;

    // Subject block
    setText('subject-kr', subject.kr);
    setText('subject-rom', subject.rom);
    setText('subject-en', subject.en);

    var timeBlock = document.getElementById('time-block');
    var placeBlock = document.getElementById('place-block');
    var objectBlock = document.getElementById('object-block');
    var verbBlock = document.getElementById('verb-block');
    var controls = document.getElementById('sp-controls');
    var note = document.getElementById('sp-note');

    if (mode === 'demonstrative') {
      // X is Y mode
      hide(timeBlock); hide(verbBlock); hide(controls);
      show(objectBlock); hide(placeBlock);

      var allNouns = getAllNouns();
      if (allNouns.length > 0) {
        var noun = allNouns[currentCopulaItemIndex % allNouns.length];
        setText('object-kr', noun.kr);
        setText('object-rom', noun.rom);
        setText('object-en', noun.en);
      }
      note.textContent = '\uC774\uAC70 = this thing / \uC800\uAC70 = that thing + \uB294 (topic)';

    } else if (mode === 'location') {
      // Here/There is X mode
      hide(timeBlock); hide(verbBlock); hide(objectBlock); hide(controls);
      show(placeBlock);

      var place = placeList[currentPlaceIndex % placeList.length];
      setText('place-kr', place.kr);
      setText('place-rom', place.rom);
      setText('place-en', place.en);
      note.textContent = '\uC5EC\uAE30 = here / \uC800\uAE30 = there + \uB294 (topic)';

    } else {
      // Normal action mode
      show(timeBlock); show(placeBlock); show(verbBlock); show(controls);

      var vt = verbTypes[currentVerbTypeIndex];
      var tense = tenseList[currentTenseIndex];
      var availTimes = getAvailableTimes();
      var availObjs = getAvailableObjects();
      var place = placeList[currentPlaceIndex];
      var time = availTimes[currentTimeIndex % availTimes.length];
      var verb = vt.tenses[tense.id];

      // Control buttons
      document.getElementById('verb-type-btn').textContent = vt.label + ' (' + vt.labelKr + ')';
      document.getElementById('tense-btn').textContent = tense.label + ' (' + tense.labelKr + ')';

      // Time
      setText('time-kr', time.kr);
      setText('time-rom', time.rom);
      setText('time-en', time.en);

      // Place with particle
      var particle = vt.usesEseo ? '\uC5D0\uC11C' : '\uC5D0';
      var particleRom = vt.usesEseo ? '-e-seo' : '-e';
      var particleEn = vt.usesEseo ? 'at the ' : 'to the ';
      setText('place-kr', place.kr + particle);
      setText('place-rom', place.rom + particleRom);
      setText('place-en', particleEn + place.en);

      // Object
      if (vt.objectType === 'none') {
        hide(objectBlock);
      } else {
        show(objectBlock);
        var obj = availObjs[currentObjectIndex % availObjs.length];
        if (obj) {
          setText('object-kr', obj.kr);
          setText('object-rom', obj.rom);
          setText('object-en', obj.en);
        }
      }

      // Verb
      setText('verb-kr', verb.kr);
      setText('verb-rom', verb.rom);
      setText('verb-en', verb.en);

      // Particle note
      note.textContent = vt.usesEseo
        ? '\uC5D0\uC11C = "at" (doing action at a place)'
        : '\uC5D0 = "to" (going to a place)';
    }

    buildFullSentence();
    applyToggles();
  }

  function buildFullSentence() {
    var subject = subjects[currentSubjectIndex];
    var mode = subject.type;
    var krParts, romParts, enParts;

    if (mode === 'demonstrative') {
      var allNouns = getAllNouns();
      if (allNouns.length === 0) return;
      var noun = allNouns[currentCopulaItemIndex % allNouns.length];
      var copula = getCopula(noun.kr);

      krParts = subject.kr + ' ' + noun.kr + copula.kr;
      romParts = subject.rom + ' ' + noun.rom + ' ' + copula.rom;
      enParts = '"' + subject.en + ' is ' + noun.en + '"';

    } else if (mode === 'location') {
      var place = placeList[currentPlaceIndex % placeList.length];
      var copula = getCopula(place.kr);

      krParts = subject.kr + ' ' + place.kr + copula.kr;
      romParts = subject.rom + ' ' + place.rom + ' ' + copula.rom;
      enParts = '"' + subject.en + ' is ' + (subject.en === 'Here' ? '' : 'the ') + place.en + '"';

    } else {
      var vt = verbTypes[currentVerbTypeIndex];
      var tense = tenseList[currentTenseIndex];
      var availTimes = getAvailableTimes();
      var availObjs = getAvailableObjects();
      var place = placeList[currentPlaceIndex];
      var time = availTimes[currentTimeIndex % availTimes.length];
      var verb = vt.tenses[tense.id];
      var particle = vt.usesEseo ? '\uC5D0\uC11C' : '\uC5D0';
      var particleRom = vt.usesEseo ? '-e-seo' : '-e';

      var kr = [subject.kr, time.kr, place.kr + particle];
      var rom = [subject.rom, time.rom, place.rom + particleRom];

      if (vt.objectType !== 'none' && availObjs.length > 0) {
        var obj = availObjs[currentObjectIndex % availObjs.length];
        if (obj) { kr.push(obj.kr); rom.push(obj.rom); }
      }
      kr.push(verb.kr); rom.push(verb.rom);

      krParts = kr.join(' ');
      romParts = rom.join(' ');

      var timeEn = time.en === 'now' ? '' : (time.en.charAt(0).toUpperCase() + time.en.slice(1) + ',');
      var placeEn = vt.usesEseo ? 'at the ' + place.en : 'to the ' + place.en;
      var en = [timeEn, subject.en, verb.en];
      if (vt.objectType !== 'none' && availObjs.length > 0) {
        var obj = availObjs[currentObjectIndex % availObjs.length];
        if (obj) en.push(obj.en);
      }
      en.push(placeEn);
      enParts = '"' + en.filter(function(x) { return x; }).join(' ') + '"';
    }

    // Animate result
    var resultEl = document.getElementById('sp-result');
    resultEl.classList.remove('sp-result-pulse');
    void resultEl.offsetWidth;
    resultEl.classList.add('sp-result-pulse');

    setText('full-korean', krParts);
    setText('full-rom', romParts);
    setText('full-english', enParts);
  }

  // ============================================
  // Animations
  // ============================================

  function animateBlock(blockId) {
    var inner = document.getElementById(blockId + '-inner');
    if (!inner) return;
    inner.classList.remove('sp-cycling');
    void inner.offsetWidth; // force reflow
    inner.classList.add('sp-cycling');
  }

  // ============================================
  // TTS
  // ============================================

  function speakSentence() {
    var kr = document.getElementById('full-korean').textContent;
    if (kr) TTS.speak(kr);
  }

  // ============================================
  // Toggles
  // ============================================

  function toggleRom() {
    showRom = !showRom;
    document.getElementById('toggle-rom').classList.toggle('active', showRom);
    applyToggles();
  }

  function toggleEng() {
    showEng = !showEng;
    document.getElementById('toggle-eng').classList.toggle('active', showEng);
    applyToggles();
  }

  function applyToggles() {
    var romEls = document.querySelectorAll('.sp-rom');
    var engEls = document.querySelectorAll('.sp-eng');
    romEls.forEach(function(el) { el.style.display = showRom ? '' : 'none'; });
    engEls.forEach(function(el) { el.style.display = showEng ? '' : 'none'; });
  }

  // ============================================
  // Utility
  // ============================================

  function setText(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function hide(el) { if (el) el.classList.add('hidden'); }
  function show(el) { if (el) el.classList.remove('hidden'); }

  // ============================================
  // Expose
  // ============================================

  window._cycle = cycle;
  window._cycleVerbType = cycleVerbType;
  window._cycleTense = cycleTense;
  window._toggleRom = toggleRom;
  window._toggleEng = toggleEng;
  window._speakSentence = speakSentence;

  init();
})();
