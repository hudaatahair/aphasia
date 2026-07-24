/**
 * AI Aphasia Assistant - Main Application Engine
 * Project ID: 10439315232679877472
 * (Firebase Ready)
 */

// Global State
const state = {
  currentView: 'dashboard',
  language: 'en', // 'en' | 'ur'
  highContrast: false,
  fontSize: 'normal', // 'normal' | 'large' | 'xlarge'
  firebaseConfig: JSON.parse(localStorage.getItem('aphasia_firebase_config')) || null,
  user: null,
  isFirebaseReady: false,
  favorites: JSON.parse(localStorage.getItem('aphasia_favs')) || [
    { id: 'fav-1', text: "I need a glass of water, please.", category: "Needs", lang: "en" },
    { id: 'fav-2', text: "I am feeling tired and need to rest.", category: "Feelings", lang: "en" },
    { id: 'fav-3', text: "Mujhe pani chahiye.", category: "Needs", lang: "ur" },
    { id: 'fav-4', text: "Mujhe dard ho raha hai.", category: "Health", lang: "ur" }
  ],
  history: JSON.parse(localStorage.getItem('aphasia_history')) || [
    { id: 'h-1', input: "water need", sentence: "I need a glass of water, please.", lang: "en", timestamp: "10:15 AM" },
    { id: 'h-2', input: "head pain", sentence: "I have a severe headache.", lang: "en", timestamp: "11:30 AM" }
  ],
  customPhrases: JSON.parse(localStorage.getItem('aphasia_custom_phrases')) || [],
  ttsSpeed: 1.0,
  ttsPitch: 1.0,
  selectedVoiceURI: null,
  isSpeaking: false,
  isListening: false,
  soundEffects: true,
  builderStack: [],
  activeBuilderCategory: 'needs',
  apiKey: localStorage.getItem('aphasia_api_key') || ''
};

// System Speech Voices
let availableVoices = [];

// Base Phrase Categories Database (All 6 categories from Implementation Guide)
const BASE_CATEGORIES = {
  needs: {
    name: { en: "Needs", ur: "ضروریات" },
    icon: "cup-soda",
    items: [
      { en: "I need water.", ur: "mujhe pani chahiye.", labelEn: "Water", labelUr: "پانی" },
      { en: "I am hungry.", ur: "mujhe bhook lagi hai.", labelEn: "Hungry", labelUr: "بھوک" },
      { en: "I need to use the bathroom.", ur: "mujhe bathroom jana hai.", labelEn: "Bathroom", labelUr: "باتھ روم" },
      { en: "I am cold.", ur: "mujhe thand lag rahi hai.", labelEn: "Cold", labelUr: "ٹھنڈ" },
      { en: "I am hot.", ur: "mujhe garmi lag rahi hai.", labelEn: "Hot", labelUr: "گرمی" },
      { en: "I need rest.", ur: "mujhe aaram chahiye.", labelEn: "Rest", labelUr: "آرام" }
    ]
  },
  health: {
    name: { en: "Health", ur: "صحت" },
    icon: "activity",
    items: [
      { en: "I have pain.", ur: "mujhe dard hai.", labelEn: "Pain", labelUr: "درد" },
      { en: "I need medicine.", ur: "mujhe dawa chahiye.", labelEn: "Medicine", labelUr: "دوا" },
      { en: "Call doctor.", ur: "doctor ko bulao.", labelEn: "Doctor", labelUr: "ڈاکٹر" },
      { en: "I feel dizzy.", ur: "mujhe chakkar aa rahe hain.", labelEn: "Dizzy", labelUr: "چکر" },
      { en: "I feel nauseous.", ur: "mujhe ulti jaisa lag raha hai.", labelEn: "Nauseous", labelUr: "متلی" },
      { en: "Call my nurse.", ur: "meri nurse ko bulao.", labelEn: "Nurse", labelUr: "نرس" }
    ]
  },
  feelings: {
    name: { en: "Feelings", ur: "احساسات" },
    icon: "smile",
    items: [
      { en: "I am happy.", ur: "main khush hoon.", labelEn: "Happy", labelUr: "خوش" },
      { en: "I am tired.", ur: "main thak gaya hoon.", labelEn: "Tired", labelUr: "تھکن" },
      { en: "I am anxious.", ur: "main pareshan hoon.", labelEn: "Anxious", labelUr: "پریشان" },
      { en: "I am sad.", ur: "main udaas hoon.", labelEn: "Sad", labelUr: "اداس" },
      { en: "I feel better.", ur: "main behtar mehsoos kar raha hoon.", labelEn: "Better", labelUr: "بہتر" },
      { en: "I need quiet.", ur: "mujhe khamoshi chahiye.", labelEn: "Quiet", labelUr: "خاموشی" }
    ]
  },
  family: {
    name: { en: "Family", ur: "خاندان" },
    icon: "users",
    items: [
      { en: "Call my family.", ur: "mere ghar walo ko call karo.", labelEn: "Family", labelUr: "خاندان" },
      { en: "I want my daughter.", ur: "mujhe meri beti se baat karni hai.", labelEn: "Daughter", labelUr: "بیٹی" },
      { en: "I want my son.", ur: "mujhe mere beta se baat karni hai.", labelEn: "Son", labelUr: "بیٹا" },
      { en: "Where is my spouse?", ur: "mera jeevan sathi kahan hai?", labelEn: "Spouse", labelUr: "شریک حیات" },
      { en: "I miss home.", ur: "mujhe ghar ki yaad aa rahi hai.", labelEn: "Home", labelUr: "گھر" }
    ]
  },
  daily: {
    name: { en: "Daily Activities", ur: "روزمرہ سرگرمیاں" },
    icon: "sun",
    items: [
      { en: "I want to walk.", ur: "main chalna chahta hoon.", labelEn: "Walk", labelUr: "چہل قدمی" },
      { en: "Turn on the TV.", ur: "TV chala do.", labelEn: "TV", labelUr: "ٹی وی" },
      { en: "Open the window.", ur: "khidki kholo.", labelEn: "Window", labelUr: "کھڑکی" },
      { en: "I want to sleep.", ur: "main sona chahta hoon.", labelEn: "Sleep", labelUr: "سونا" },
      { en: "Read to me.", ur: "mujhe parh kar sunao.", labelEn: "Read", labelUr: "پڑھنا" },
      { en: "I want fresh air.", ur: "taza hawa chahiye.", labelEn: "Fresh Air", labelUr: "تازہ ہوا" }
    ]
  },
  emergencies: {
    name: { en: "Emergencies", ur: "ہنگامی" },
    icon: "alert-triangle",
    items: [
      { en: "I fell down!", ur: "main gir gaya hoon!", labelEn: "Fell Down", labelUr: "گر گیا" },
      { en: "I cannot breathe!", ur: "main saans nahi le sakta!", labelEn: "Breathless", labelUr: "سانس" },
      { en: "Severe pain!", ur: "bohot zyaada dard hai!", labelEn: "Severe Pain", labelUr: "شدید درد" },
      { en: "HELP NOW!", ur: "MADAD KARO!", labelEn: "Help Now", labelUr: "مدد" }
    ]
  }
};

// Helper: Safely encode text strings for inline JavaScript attribute calls
function enc(str) {
  return encodeURIComponent(str || '');
}

// Dynamically merge user custom phrases into categories
function getMergedCategories() {
  const merged = JSON.parse(JSON.stringify(BASE_CATEGORIES));
  state.customPhrases.forEach(cp => {
    if (merged[cp.categoryKey]) {
      merged[cp.categoryKey].items.unshift({
        en: cp.text,
        ur: cp.text,
        labelEn: cp.label,
        labelUr: cp.label
      });
    }
  });
  return merged;
}

// AI Sentence Completion Knowledge Dictionary
const AI_RULES_EN = [
  { keywords: ["water", "drink", "thirsty"], completions: ["I need a glass of water, please.", "May I have some water?", "I am feeling thirsty."] },
  { keywords: ["hungry", "food", "eat", "lunch", "dinner"], completions: ["I am hungry and would like something to eat.", "Can I have a meal, please?", "I need food."] },
  { keywords: ["pain", "hurt", "head", "leg", "arm", "ache"], completions: ["I am experiencing pain right now.", "I have a severe headache.", "Please give me pain relief medicine."] },
  { keywords: ["tired", "sleep", "rest", "bed"], completions: ["I am very tired and need to rest.", "I would like to lie down now.", "Please turn off the lights."] },
  { keywords: ["bathroom", "toilet", "washroom"], completions: ["I need assistance going to the bathroom.", "Where is the nearest restroom?", "I need to wash my hands."] },
  { keywords: ["doctor", "nurse", "help", "hospital"], completions: ["Please call the doctor for me.", "I need the nurse right away.", "Could someone please help me?"] },
  { keywords: ["family", "call", "phone", "son", "daughter"], completions: ["Please call my family members.", "I want to talk to my loved ones.", "Could you pass me my phone?"] }
];

const AI_RULES_UR = [
  { keywords: ["pani", "paani", "water"], completions: ["Mujhe pani ka glass chahiye, meharbani.", "Kya mujhe thoda pani mil sakta hai?", "Mujhe pyaas lagi hai."] },
  { keywords: ["khana", "bhook", "food"], completions: ["Mujhe bhook lagi hai, khana chahiye.", "Kya mujhe khana mil sakta hai?", "Main khana khana chahta hoon."] },
  { keywords: ["dard", "head", "sir"], completions: ["Mujhe bohot dard ho raha hai.", "Mera sir dard kar raha hai.", "Mujhe dard ki dawa chahiye."] },
  { keywords: ["doctor", "madad", "help"], completions: ["Meharbani karke doctor ko bulao.", "Mujhe madad chahiye.", "Nurse ko yahan bula dain."] }
];

// Speech Voices Initialization
function loadVoices() {
  if ('speechSynthesis' in window) {
    availableVoices = window.speechSynthesis.getVoices();
  }
}
if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = loadVoices;
  loadVoices();
}

// Sound Feedback Generator
function playTapSound() {
  if (!state.soundEffects) return;
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
  } catch (e) {}
}

// Web Speech API (TTS)
function speakText(text) {
  if (!('speechSynthesis' in window)) {
    showToast('Speech synthesis not supported in this browser.', 'error');
    return;
  }

  playTapSound();
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = state.ttsSpeed;
  utterance.pitch = state.ttsPitch;

  if (state.selectedVoiceURI && availableVoices.length > 0) {
    const matchedVoice = availableVoices.find(v => v.voiceURI === state.selectedVoiceURI);
    if (matchedVoice) utterance.voice = matchedVoice;
  } else {
    utterance.lang = state.language === 'ur' ? 'ur-PK' : 'en-US';
  }

  utterance.onstart = () => {
    state.isSpeaking = true;
    const btn = document.getElementById('tts-stop-btn');
    if (btn) { btn.classList.remove('hidden'); btn.classList.add('flex'); }
    updateSpeakingUI(true, text);
  };

  utterance.onend = utterance.onerror = () => {
    state.isSpeaking = false;
    const btn = document.getElementById('tts-stop-btn');
    if (btn) { btn.classList.add('hidden'); btn.classList.remove('flex'); }
    updateSpeakingUI(false);
  };

  window.speechSynthesis.speak(utterance);
}

function stopTTS() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    state.isSpeaking = false;
    document.getElementById('tts-stop-btn')?.classList.add('hidden');
    updateSpeakingUI(false);
  }
}

function speakEmergency(text) {
  closeEmergencyModal();
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 1.0;
    utterance.lang = state.language === 'ur' ? 'ur-PK' : 'en-US';
    window.speechSynthesis.speak(utterance);
    showToast(`Emergency Broadcast: "${text}"`, 'emergency');
  }
}

// Voice Input
function startVoiceRecognition(targetInputId) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    showToast('Voice recognition is not supported in this browser.', 'error');
    return;
  }

  playTapSound();
  const recognition = new SpeechRecognition();
  recognition.lang = state.language === 'ur' ? 'ur-PK' : 'en-US';
  recognition.interimResults = false;

  showToast('Listening... Speak now 🎙️', 'info');

  recognition.onstart = () => {
    state.isListening = true;
    const micBtn = document.getElementById('mic-btn-' + targetInputId);
    if (micBtn) micBtn.classList.add('animate-pulse', 'bg-red-500', 'text-white');
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    const inputEl = document.getElementById(targetInputId);
    if (inputEl) {
      inputEl.value = transcript;
      handleAIInput(transcript);
    }
    showToast(`Captured: "${transcript}"`, 'success');
  };

  recognition.onerror = () => {
    showToast('Voice not recognized. Please try again.', 'error');
  };

  recognition.onend = () => {
    state.isListening = false;
    const micBtn = document.getElementById('mic-btn-' + targetInputId);
    if (micBtn) micBtn.classList.remove('animate-pulse', 'bg-red-500', 'text-white');
  };

  recognition.start();
}

function updateSpeakingUI(isSpeaking, text = '') {
  const speakingPills = document.querySelectorAll('.speaking-indicator');
  speakingPills.forEach(el => {
    if (isSpeaking) {
      el.classList.remove('hidden');
      el.innerHTML = `
        <div class="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md animate-pulse">
          <i data-lucide="volume-2" class="w-5 h-5"></i>
          <span>Speaking: "${text.substring(0, 35)}..."</span>
        </div>
      `;
    } else {
      el.classList.add('hidden');
    }
  });
  lucide.createIcons();
}

// Navigation Handler
function navigateTo(viewName) {
  playTapSound();
  state.currentView = viewName;
  
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.remove('bg-brand-50', 'text-brand-700', 'border', 'border-brand-200', 'shadow-xs');
    btn.classList.add('text-slate-600');
  });

  const activeNav = document.getElementById(`nav-${viewName}`);
  if (activeNav) {
    activeNav.classList.add('bg-brand-50', 'text-brand-700', 'border', 'border-brand-200', 'shadow-xs');
    activeNav.classList.remove('text-slate-600');
  }

  const main = document.getElementById('main-content-area');
  switch (viewName) {
    case 'landing':
      main.innerHTML = renderLandingView();
      break;
    case 'dashboard':
      main.innerHTML = renderDashboardView();
      break;
    case 'assistant':
      main.innerHTML = renderAssistantView();
      break;
    case 'builder':
      main.innerHTML = renderBuilderView();
      break;
    case 'favorites':
      main.innerHTML = renderFavoritesView();
      break;
    case 'history':
      main.innerHTML = renderHistoryView();
      break;
    case 'settings':
      main.innerHTML = renderSettingsView();
      break;
    default:
      main.innerHTML = renderDashboardView();
  }

  lucide.createIcons();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Language & Theme Toggles
function toggleLanguage() {
  playTapSound();
  state.language = state.language === 'en' ? 'ur' : 'en';
  document.getElementById('current-lang-text').innerText = state.language === 'en' ? 'English (US)' : 'اردو (Urdu)';
  showToast(`Language switched to ${state.language === 'en' ? 'English' : 'Urdu'}`);
  navigateTo(state.currentView);
}

function toggleHighContrast() {
  playTapSound();
  state.highContrast = !state.highContrast;
  document.body.classList.toggle('high-contrast', state.highContrast);
  showToast(state.highContrast ? 'High Contrast Mode Enabled' : 'Standard Contrast Mode Enabled');
}

function setFontSize(size) {
  playTapSound();
  state.fontSize = size;
  document.body.classList.remove('text-size-large', 'text-size-xlarge');
  if (size === 'large') document.body.classList.add('text-size-large');
  if (size === 'xlarge') document.body.classList.add('text-size-xlarge');
  showToast(`Font scale updated to ${size.toUpperCase()}`);
}

// Emergency Modal Controls
function triggerEmergencyModal() {
  playTapSound();
  document.getElementById('emergency-modal').classList.remove('hidden');
}

function closeEmergencyModal() {
  document.getElementById('emergency-modal').classList.add('hidden');
}

// Toast Notifications
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  
  let bgClass = 'bg-slate-900 text-white';
  if (type === 'emergency') bgClass = 'bg-red-600 text-white shadow-xl';
  if (type === 'success') bgClass = 'bg-emerald-600 text-white';
  if (type === 'error') bgClass = 'bg-rose-700 text-white';

  toast.className = `${bgClass} pointer-events-auto px-5 py-3.5 rounded-2xl shadow-lg flex items-center gap-3 text-sm font-bold fade-in`;
  toast.innerHTML = `
    <i data-lucide="${type === 'emergency' ? 'alert-octagon' : type === 'error' ? 'alert-circle' : 'info'}" class="w-5 h-5"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  lucide.createIcons();

  setTimeout(() => {
    toast.remove();
  }, 3500);
}

// Favorites Storage Helper
function saveFavorite(text, category = 'General') {
  playTapSound();
  if (state.favorites.some(f => f.text === text)) {
    showToast('Phrase is already in your Favorites!');
    return;
  }

  const newFav = {
    id: 'fav-' + Date.now(),
    text,
    category,
    lang: state.language
  };

  state.favorites.unshift(newFav);
  localStorage.setItem('aphasia_favs', JSON.stringify(state.favorites));
  updateFavBadge();
  showToast('Added to Favorites!', 'success');
}

function removeFavorite(id) {
  playTapSound();
  state.favorites = state.favorites.filter(f => f.id !== id);
  localStorage.setItem('aphasia_favs', JSON.stringify(state.favorites));
  updateFavBadge();
  if (state.currentView === 'favorites') navigateTo('favorites');
  showToast('Removed from Favorites');
}

function updateFavBadge() {
  const badge = document.getElementById('fav-count-badge');
  if (badge) badge.innerText = state.favorites.length;
}

// History Storage Helper
function addToHistory(input, sentence) {
  const newHist = {
    id: 'h-' + Date.now(),
    input: input || 'Direct',
    sentence,
    lang: state.language,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  state.history.unshift(newHist);
  if (state.history.length > 20) state.history.pop();
  localStorage.setItem('aphasia_history', JSON.stringify(state.history));
}

// Custom Phrase Management
function openCustomPhraseModal() {
  playTapSound();
  let modal = document.getElementById('custom-phrase-modal');
  if (!modal) {
    // Inject modal dynamically if missing from HTML
    modal = document.createElement('div');
    modal.id = 'custom-phrase-modal';
    modal.className = 'fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4';
    modal.innerHTML = `
      <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 fade-in border border-slate-200">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 class="font-heading text-xl font-black text-slate-900 flex items-center gap-2">
            <i data-lucide="plus-circle" class="w-6 h-6 text-brand-600"></i>
            Create Custom Phrase
          </h3>
          <button onclick="closeCustomPhraseModal()" class="p-2 text-slate-400 hover:text-slate-700 rounded-full">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block font-bold text-sm text-slate-700 mb-1">Select Phrase Category:</label>
            <select id="custom-phrase-category" class="w-full p-3 rounded-xl border border-slate-300 font-bold text-sm bg-white outline-none focus:border-brand-600">
              <option value="needs">🥤 Needs</option>
              <option value="health">🏥 Health</option>
              <option value="feelings">😊 Feelings</option>
              <option value="family">👨‍👩‍👧 Family</option>
              <option value="daily">☀️ Daily Activities</option>
              <option value="emergencies">🚨 Emergencies</option>
            </select>
          </div>

          <div>
            <label class="block font-bold text-sm text-slate-700 mb-1">Phrase Sentence:</label>
            <input type="text" id="custom-phrase-text" placeholder="e.g. Please pass me my glasses" class="w-full p-3 rounded-xl border border-slate-300 font-bold text-base outline-none focus:border-brand-600" />
          </div>

          <div>
            <label class="block font-bold text-sm text-slate-700 mb-1">Short Tag Label:</label>
            <input type="text" id="custom-phrase-label" placeholder="e.g. Glasses" class="w-full p-3 rounded-xl border border-slate-300 font-bold text-base outline-none focus:border-brand-600" />
          </div>

          <button onclick="submitCustomPhrase()" class="btn-accessible btn-primary w-full py-3.5 rounded-xl font-extrabold shadow-md">
            <i data-lucide="check" class="w-5 h-5"></i> Save & Add Phrase
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    lucide.createIcons();
  } else {
    modal.classList.remove('hidden');
  }
}

function closeCustomPhraseModal() {
  const modal = document.getElementById('custom-phrase-modal');
  if (modal) modal.classList.add('hidden');
}

function submitCustomPhrase() {
  playTapSound();
  const catKey = document.getElementById('custom-phrase-category').value;
  const text = document.getElementById('custom-phrase-text').value.trim();
  const label = document.getElementById('custom-phrase-label').value.trim() || 'Custom';

  if (!text) {
    showToast('Please type a phrase sentence.', 'error');
    return;
  }

  state.customPhrases.unshift({ categoryKey: catKey, text, label });
  localStorage.setItem('aphasia_custom_phrases', JSON.stringify(state.customPhrases));
  closeCustomPhraseModal();
  showToast('Custom phrase saved successfully!', 'success');

  // Also bookmark in favorites for instant access
  saveFavorite(text, 'Custom');

  if (state.currentView === 'builder') navigateTo('builder');
}

// AI Sentence Generation Handler
function generateAISuggestions(inputText) {
  const cleanInput = inputText.trim().toLowerCase();
  if (!cleanInput) return [];

  const dictionary = state.language === 'ur' ? AI_RULES_UR : AI_RULES_EN;
  
  for (const entry of dictionary) {
    if (entry.keywords.some(k => cleanInput.includes(k))) {
      return entry.completions;
    }
  }

  if (state.language === 'ur') {
    return [
      `Main "${cleanInput}" ke baare mein baat karna chahta hoon.`,
      `Mujhe "${cleanInput}" chahiye, meharbani.`,
      `Kya aap "${cleanInput}" mein meri madad kar sakte hain?`
    ];
  }

  return [
    `I am trying to say: "${inputText}".`,
    `Please help me with "${inputText}".`,
    `I would like to have "${inputText}", please.`
  ];
}

function simplifyText(fullText) {
  playTapSound();
  const simpleMap = {
    "water": "Need Water",
    "hungry": "Need Food",
    "pain": "Have Pain",
    "doctor": "Call Doctor",
    "bathroom": "Need Bathroom",
    "family": "Call Family"
  };

  let simplified = fullText.split(' ').slice(0, 3).join(' ');
  const lower = fullText.toLowerCase();
  for (const key in simpleMap) {
    if (lower.includes(key)) {
      simplified = simpleMap[key];
      break;
    }
  }

  speakText(simplified);
  showToast(`Simplified: "${simplified}"`, 'success');
}

// View Renderer 1: Landing Page
function renderLandingView() {
  return `
    <div class="space-y-8 fade-in">
      <div class="glass-card p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-brand-600 via-sky-600 to-indigo-700 text-white relative overflow-hidden shadow-xl">
        <div class="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        
        <div class="max-w-2xl space-y-6 relative z-10">
          <span class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-extrabold uppercase tracking-wider">
            <i data-lucide="sparkles" class="w-4 h-4 text-amber-300"></i> AI-Powered Healthcare Assist
          </span>

          <h2 class="font-heading text-3xl sm:text-5xl font-black leading-tight">
            Empowering Speech & Independent Communication
          </h2>

          <p class="text-sky-100 text-lg font-medium leading-relaxed">
            Designed specifically for stroke survivors and individuals with aphasia. Type or speak incomplete words to construct natural sentences instantly.
          </p>

          <div class="flex flex-wrap items-center gap-4 pt-2">
            <button onclick="navigateTo('assistant')" class="btn-accessible bg-white text-brand-800 hover:bg-sky-50 font-extrabold shadow-lg rounded-2xl px-8 py-4 text-lg">
              <i data-lucide="message-square-plus" class="w-6 h-6 text-brand-600"></i>
              Open AI Assistant
            </button>
            <button onclick="navigateTo('builder')" class="btn-accessible bg-brand-700/50 hover:bg-brand-700 text-white font-bold rounded-2xl px-6 py-4 border border-white/20">
              <i data-lucide="grid" class="w-6 h-6"></i>
              Visual Phrase Builder
            </button>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="glass-card p-6 rounded-3xl space-y-3 border-t-4 border-brand-500">
          <div class="w-12 h-12 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center">
            <i data-lucide="wand-2" class="w-6 h-6"></i>
          </div>
          <h3 class="font-heading text-xl font-bold text-slate-900">AI Sentence Completion</h3>
          <p class="text-slate-600 text-sm leading-relaxed">Converts partial inputs like "water need" into polite, complete sentences with 2-3 variations.</p>
        </div>

        <div class="glass-card p-6 rounded-3xl space-y-3 border-t-4 border-emerald-500">
          <div class="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <i data-lucide="volume-2" class="w-6 h-6"></i>
          </div>
          <h3 class="font-heading text-xl font-bold text-slate-900">1-Tap Speech Synthesis</h3>
          <p class="text-slate-600 text-sm leading-relaxed">Instant high-clarity voice output in English and Urdu with adjustable pitch and speed.</p>
        </div>

        <div class="glass-card p-6 rounded-3xl space-y-3 border-t-4 border-red-500">
          <div class="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center">
            <i data-lucide="shield-alert" class="w-6 h-6"></i>
          </div>
          <h3 class="font-heading text-xl font-bold text-slate-900">Emergency Broadcast</h3>
          <p class="text-slate-600 text-sm leading-relaxed">High-volume 1-tap alerts for medical emergency, falls, pain, or caregiver contact.</p>
        </div>
      </div>
    </div>
  `;
}

// View Renderer 2: Dashboard View
function renderDashboardView() {
  const recentFavs = state.favorites.slice(0, 4);
  const recentHist = state.history.slice(0, 3);

  return `
    <div class="space-y-6 fade-in">
      <div class="speaking-indicator hidden"></div>

      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h2 class="font-heading text-2xl sm:text-3xl font-black text-slate-900">
            Welcome back 👋
          </h2>
          <p class="text-slate-500 text-sm font-semibold">Select a quick phrase or tap AI Assistant to begin.</p>
        </div>
        <div class="flex items-center gap-3">
          <span class="lang-badge ${state.language === 'en' ? 'lang-en' : 'lang-ur'}">
            Language: ${state.language === 'en' ? 'English' : 'Urdu'}
          </span>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button onclick="navigateTo('assistant')" class="glass-card p-5 text-left hover:border-brand-500 hover:bg-brand-50/50 transition-all rounded-3xl space-y-3 group">
          <div class="w-12 h-12 rounded-2xl bg-brand-100 text-brand-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <i data-lucide="sparkles" class="w-6 h-6"></i>
          </div>
          <div>
            <h4 class="font-heading font-extrabold text-lg text-slate-900">AI Assistant</h4>
            <p class="text-xs text-slate-500 font-medium">Predict & complete sentences</p>
          </div>
        </button>

        <button onclick="navigateTo('builder')" class="glass-card p-5 text-left hover:border-emerald-500 hover:bg-emerald-50/50 transition-all rounded-3xl space-y-3 group">
          <div class="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <i data-lucide="grid" class="w-6 h-6"></i>
          </div>
          <div>
            <h4 class="font-heading font-extrabold text-lg text-slate-900">Phrase Builder</h4>
            <p class="text-xs text-slate-500 font-medium">Build using category icons</p>
          </div>
        </button>

        <button onclick="navigateTo('favorites')" class="glass-card p-5 text-left hover:border-rose-500 hover:bg-rose-50/50 transition-all rounded-3xl space-y-3 group">
          <div class="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <i data-lucide="heart" class="w-6 h-6"></i>
          </div>
          <div>
            <h4 class="font-heading font-extrabold text-lg text-slate-900">Saved Favorites</h4>
            <p class="text-xs text-slate-500 font-medium">${state.favorites.length} saved phrases</p>
          </div>
        </button>

        <button onclick="triggerEmergencyModal()" class="glass-card p-5 text-left bg-red-50 hover:bg-red-100 border-red-200 transition-all rounded-3xl space-y-3 group">
          <div class="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
            <i data-lucide="alert-triangle" class="w-6 h-6"></i>
          </div>
          <div>
            <h4 class="font-heading font-extrabold text-lg text-red-900">Emergency SOS</h4>
            <p class="text-xs text-red-600 font-bold">1-tap priority broadcast</p>
          </div>
        </button>
      </div>

      <div class="glass-card p-6 rounded-3xl space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="font-heading text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <i data-lucide="zap" class="w-5 h-5 text-amber-500"></i>
            Quick Speak Phrases
          </h3>
          <button onclick="navigateTo('favorites')" class="text-xs font-bold text-brand-600 hover:text-brand-800">
            View All →
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          ${recentFavs.map(fav => `
            <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 hover:bg-slate-100 transition-colors">
              <span class="font-bold text-slate-800 text-sm leading-snug">${fav.text}</span>
              <button onclick="speakText(decodeURIComponent('${enc(fav.text)}'))" class="p-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white shrink-0 shadow-sm" title="Speak Phrase">
                <i data-lucide="volume-2" class="w-5 h-5"></i>
              </button>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="glass-card p-6 rounded-3xl space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="font-heading text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <i data-lucide="clock" class="w-5 h-5 text-slate-500"></i>
            Recent Activity Log
          </h3>
          <button onclick="navigateTo('history')" class="text-xs font-bold text-brand-600 hover:text-brand-800">
            View Full History →
          </button>
        </div>

        <div class="space-y-3">
          ${recentHist.map(h => `
            <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
              <div class="space-y-1">
                <div class="flex items-center gap-2 text-xs font-bold text-slate-400">
                  <span>Input: "${h.input}"</span>
                  <span>•</span>
                  <span>${h.timestamp}</span>
                </div>
                <p class="font-bold text-slate-900 text-base">${h.sentence}</p>
              </div>
              <button onclick="speakText(decodeURIComponent('${enc(h.sentence)}'))" class="p-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 shrink-0" title="Replay">
                <i data-lucide="volume-2" class="w-5 h-5"></i>
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// View Renderer 3: Communication Assistant
function renderAssistantView() {
  return `
    <div class="space-y-6 fade-in">
      <div class="speaking-indicator hidden"></div>

      <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="font-heading text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-3">
            <i data-lucide="sparkles" class="w-8 h-8 text-brand-600"></i>
            AI Communication Assistant
          </h2>
          <p class="text-slate-500 text-sm font-semibold">Type or dictate incomplete words. AI will construct natural sentences.</p>
        </div>

        <div class="flex items-center gap-2">
          <button onclick="setAssistantInput('water need')" class="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200">Ex: water need</button>
          <button onclick="setAssistantInput('head pain')" class="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200">Ex: head pain</button>
          <button onclick="setAssistantInput('doctor come')" class="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200">Ex: doctor come</button>
        </div>
      </div>

      <div class="glass-card p-6 sm:p-8 rounded-3xl space-y-6 bg-white">
        <div class="space-y-3">
          <label class="block font-heading font-extrabold text-lg text-slate-900">
            Type or Dictate Keywords:
          </label>
          <div class="relative flex items-center gap-2">
            <input type="text" id="ai-input-field" oninput="handleAIInput(this.value)" placeholder="${state.language === 'ur' ? 'Yahan likhein (maslan: pani chahiye)...' : 'Type keywords here (e.g. water need, doctor come)...'}" class="w-full text-xl font-bold p-5 pr-28 rounded-2xl border-2 border-slate-200 focus:border-brand-600 focus:ring-4 focus:ring-brand-100 transition-all outline-none" />
            
            <button id="mic-btn-ai-input-field" onclick="startVoiceRecognition('ai-input-field')" class="absolute right-14 top-1/2 -translate-y-1/2 p-3 text-slate-500 hover:text-brand-600 rounded-xl hover:bg-slate-100" title="Voice Dictation">
              <i data-lucide="mic" class="w-6 h-6"></i>
            </button>
            <button onclick="clearAIInput()" class="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-700" title="Clear">
              <i data-lucide="x-circle" class="w-6 h-6"></i>
            </button>
          </div>
        </div>

        <div id="ai-suggestions-container" class="space-y-4 pt-2">
          <div class="text-center py-8 text-slate-400 font-semibold space-y-2">
            <i data-lucide="sparkles" class="w-10 h-10 mx-auto text-slate-300"></i>
            <p>Start typing or tap mic to see AI predictions & completion suggestions...</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

function setAssistantInput(val) {
  const input = document.getElementById('ai-input-field');
  if (input) {
    input.value = val;
    handleAIInput(val);
  }
}

function clearAIInput() {
  const input = document.getElementById('ai-input-field');
  if (input) {
    input.value = '';
    handleAIInput('');
  }
}

function handleAIInput(val) {
  const container = document.getElementById('ai-suggestions-container');
  if (!container) return;

  const suggestions = generateAISuggestions(val);

  if (suggestions.length === 0) {
    container.innerHTML = `
      <div class="text-center py-8 text-slate-400 font-semibold space-y-2">
        <i data-lucide="sparkles" class="w-10 h-10 mx-auto text-slate-300"></i>
        <p>Start typing or tap mic to see AI predictions & completion suggestions...</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  container.innerHTML = `
    <h3 class="font-heading font-bold text-slate-700 text-sm uppercase tracking-wider flex items-center gap-2">
      <i data-lucide="sparkles" class="w-4 h-4 text-brand-600"></i>
      AI Recommended Full Sentences:
    </h3>

    <div class="grid grid-cols-1 gap-4">
      ${suggestions.map((sugg, idx) => `
        <div class="p-5 rounded-2xl border-2 ${idx === 0 ? 'border-brand-500 bg-brand-50/40 shadow-sm' : 'border-slate-200 bg-slate-50'} flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-brand-500 transition-all">
          <div class="space-y-1">
            <span class="text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full ${idx === 0 ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-700'}">
              ${idx === 0 ? 'Best Match' : `Option ${idx + 1}`}
            </span>
            <p class="font-extrabold text-slate-900 text-lg sm:text-xl leading-snug">${sugg}</p>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <button onclick="speakAndLog(decodeURIComponent('${enc(val)}'), decodeURIComponent('${enc(sugg)}'))" class="btn-accessible btn-primary px-5 py-3 rounded-xl shadow-md flex items-center gap-2">
              <i data-lucide="volume-2" class="w-5 h-5"></i>
              <span>Speak</span>
            </button>
            <button onclick="simplifyText(decodeURIComponent('${enc(sugg)}'))" class="btn-accessible btn-secondary px-3 py-3 rounded-xl text-xs font-bold" title="Simplify text">
              <i data-lucide="minimize-2" class="w-4 h-4"></i> Simplify
            </button>
            <button onclick="saveFavorite(decodeURIComponent('${enc(sugg)}'), 'AI Generated')" class="p-3.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700" title="Save Favorite">
              <i data-lucide="bookmark" class="w-5 h-5"></i>
            </button>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  lucide.createIcons();
}

function speakAndLog(input, sentence) {
  speakText(sentence);
  addToHistory(input, sentence);
}

// View Renderer 4: Phrase Builder
function renderBuilderView() {
  const categories = getMergedCategories();
  const activeCatKey = state.activeBuilderCategory || 'needs';

  return `
    <div class="space-y-6 fade-in">
      <div class="speaking-indicator hidden"></div>

      <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="font-heading text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-3">
            <i data-lucide="grid" class="w-8 h-8 text-emerald-600"></i>
            Visual Phrase Builder
          </h2>
          <p class="text-slate-500 text-sm font-semibold">Tap category cards to construct sentence ribbons or add custom phrases.</p>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="openCustomPhraseModal()" class="btn-accessible btn-primary text-sm px-4 py-2.5 rounded-xl shadow-sm">
            <i data-lucide="plus-circle" class="w-4 h-4"></i> + Add Phrase
          </button>
          <button onclick="clearBuilderStack()" class="btn-accessible btn-secondary text-sm px-4 py-2.5 rounded-xl">
            <i data-lucide="trash-2" class="w-4 h-4"></i> Clear Ribbon
          </button>
        </div>
      </div>

      <div class="glass-card p-6 rounded-3xl bg-emerald-950 text-white space-y-4 shadow-lg">
        <div class="flex items-center justify-between border-b border-emerald-800 pb-3">
          <span class="text-xs font-bold uppercase tracking-wider text-emerald-400">Constructed Sentence Ribbon:</span>
          <span id="ribbon-count" class="text-xs font-extrabold text-emerald-300">${state.builderStack.length} phrases added</span>
        </div>

        <div id="builder-ribbon-content" class="min-h-[60px] flex flex-wrap items-center gap-2 p-2">
          ${state.builderStack.length === 0 ? `
            <p class="text-emerald-400/60 font-semibold text-base italic">Tap category cards below to add words to your sentence ribbon...</p>
          ` : state.builderStack.map((item, idx) => `
            <span class="inline-flex items-center gap-2 bg-emerald-600 text-white font-extrabold px-4 py-2 rounded-xl text-base shadow-sm">
              ${item}
              <button onclick="removeRibbonItem(${idx})" class="text-emerald-200 hover:text-white"><i data-lucide="x" class="w-4 h-4"></i></button>
            </span>
          `).join('')}
        </div>

        <div class="pt-2 flex items-center justify-end gap-3">
          <button onclick="speakRibbon()" class="btn-accessible bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black px-6 py-3 rounded-xl text-lg shadow-md flex items-center gap-2">
            <i data-lucide="volume-2" class="w-6 h-6"></i>
            <span>Speak Complete Sentence</span>
          </button>
        </div>
      </div>

      <!-- Category Filter Tabs -->
      <div class="flex items-center gap-2 overflow-x-auto pb-2">
        ${Object.keys(categories).map(catKey => {
          const cat = categories[catKey];
          const isActive = catKey === activeCatKey;
          return `
            <button onclick="selectCategory('${catKey}')" class="px-5 py-3 rounded-2xl font-extrabold text-sm whitespace-nowrap border ${isActive ? 'bg-brand-600 text-white border-brand-700 shadow-md' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'} flex items-center gap-2 transition-all">
              <i data-lucide="${cat.icon}" class="w-5 h-5 ${isActive ? 'text-white' : 'text-brand-600'}"></i>
              <span>${cat.name[state.language]}</span>
            </button>
          `;
        }).join('')}
      </div>

      <!-- Icon Cards Display Area -->
      <div id="category-cards-grid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        ${renderCategoryItemsHtml(activeCatKey)}
      </div>
    </div>
  `;
}

function selectCategory(catKey) {
  playTapSound();
  state.activeBuilderCategory = catKey;
  navigateTo('builder');
}

function renderCategoryItemsHtml(catKey) {
  const categories = getMergedCategories();
  const cat = categories[catKey] || categories.needs;
  return cat.items.map(item => {
    const text = state.language === 'ur' ? item.ur : item.en;
    const label = state.language === 'ur' ? item.labelUr : item.labelEn;
    return `
      <div class="glass-card p-5 rounded-3xl flex flex-col justify-between gap-4 border-2 border-slate-200 hover:border-brand-500 transition-all bg-white">
        <div class="flex items-center justify-between">
          <div class="w-12 h-12 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center">
            <i data-lucide="${cat.icon}" class="w-6 h-6"></i>
          </div>
          <span class="text-xs font-extrabold uppercase px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">${label}</span>
        </div>

        <p class="font-extrabold text-slate-900 text-lg leading-snug">${text}</p>

        <div class="flex items-center gap-2 pt-2">
          <button onclick="addToRibbon(decodeURIComponent('${enc(text)}'))" class="btn-accessible btn-secondary text-sm flex-1 py-2.5 rounded-xl font-bold">
            + Add to Ribbon
          </button>
          <button onclick="speakText(decodeURIComponent('${enc(text)}'))" class="p-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white shrink-0 shadow-sm" title="Speak Now">
            <i data-lucide="volume-2" class="w-5 h-5"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function addToRibbon(text) {
  playTapSound();
  state.builderStack.push(text);
  navigateTo('builder');
  showToast('Added to ribbon!');
}

function removeRibbonItem(idx) {
  playTapSound();
  state.builderStack.splice(idx, 1);
  navigateTo('builder');
}

function clearBuilderStack() {
  playTapSound();
  state.builderStack = [];
  navigateTo('builder');
}

function speakRibbon() {
  if (state.builderStack.length === 0) {
    showToast('Ribbon is empty. Tap cards to add phrases first.');
    return;
  }
  const fullSentence = state.builderStack.join(' ');
  speakText(fullSentence);
  addToHistory('Phrase Builder', fullSentence);
}

// View Renderer 5: Favorites View
function renderFavoritesView() {
  return `
    <div class="space-y-6 fade-in">
      <div class="speaking-indicator hidden"></div>

      <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="font-heading text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-3">
            <i data-lucide="heart" class="w-8 h-8 text-rose-500"></i>
            Saved Favorites (${state.favorites.length})
          </h2>
          <p class="text-slate-500 text-sm font-semibold">Fast 1-tap playback for high-frequency phrases.</p>
        </div>

        <button onclick="openCustomPhraseModal()" class="btn-accessible btn-primary text-sm px-4 py-2.5 rounded-xl shadow-sm">
          <i data-lucide="plus-circle" class="w-4 h-4"></i> + Add Favorite
        </button>
      </div>

      ${state.favorites.length === 0 ? `
        <div class="glass-card p-12 text-center space-y-3">
          <i data-lucide="heart-off" class="w-12 h-12 mx-auto text-slate-300"></i>
          <h3 class="font-heading text-xl font-bold text-slate-800">No Favorites Saved Yet</h3>
          <p class="text-slate-500 text-sm">Save phrases from the AI Assistant or Phrase Builder for quick 1-tap speech.</p>
        </div>
      ` : `
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          ${state.favorites.map(fav => `
            <div class="glass-card p-5 rounded-3xl flex items-center justify-between gap-4 border border-slate-200 hover:border-rose-300 transition-all bg-white">
              <div class="space-y-1">
                <span class="text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700">${fav.category || 'General'}</span>
                <p class="font-extrabold text-slate-900 text-lg leading-snug">${fav.text}</p>
              </div>

              <div class="flex items-center gap-2 shrink-0">
                <button onclick="speakText(decodeURIComponent('${enc(fav.text)}'))" class="btn-accessible bg-brand-600 hover:bg-brand-700 text-white p-3.5 rounded-2xl shadow-md" title="Speak Phrase">
                  <i data-lucide="volume-2" class="w-6 h-6"></i>
                </button>
                <button onclick="removeFavorite('${fav.id}')" class="p-3.5 rounded-2xl border border-slate-200 hover:bg-red-50 text-slate-400 hover:text-red-600" title="Delete Favorite">
                  <i data-lucide="trash-2" class="w-5 h-5"></i>
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;
}

// View Renderer 6: History View
function renderHistoryView() {
  return `
    <div class="space-y-6 fade-in">
      <div class="speaking-indicator hidden"></div>

      <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="font-heading text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-3">
            <i data-lucide="history" class="w-8 h-8 text-slate-600"></i>
            Conversation History Log
          </h2>
          <p class="text-slate-500 text-sm font-semibold">Review and replay previously generated sentences.</p>
        </div>

        <button onclick="clearHistory()" class="btn-accessible btn-secondary text-sm px-4 py-2.5 rounded-xl">
          <i data-lucide="trash-2" class="w-4 h-4"></i> Clear Log
        </button>
      </div>

      ${state.history.length === 0 ? `
        <div class="glass-card p-12 text-center space-y-3">
          <i data-lucide="clock" class="w-12 h-12 mx-auto text-slate-300"></i>
          <h3 class="font-heading text-xl font-bold text-slate-800">No History Logged Yet</h3>
          <p class="text-slate-500 text-sm">Spoken sentences will automatically appear here.</p>
        </div>
      ` : `
        <div class="space-y-3">
          ${state.history.map(item => `
            <div class="glass-card p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-200 bg-white">
              <div class="space-y-1">
                <div class="flex items-center gap-2 text-xs font-extrabold text-slate-400">
                  <span class="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">Input: "${item.input}"</span>
                  <span>•</span>
                  <span>${item.timestamp}</span>
                </div>
                <p class="font-extrabold text-slate-900 text-lg leading-snug">${item.sentence}</p>
              </div>

              <div class="flex items-center gap-2 shrink-0">
                <button onclick="speakText(decodeURIComponent('${enc(item.sentence)}'))" class="btn-accessible btn-primary px-4 py-2.5 rounded-xl shadow-sm text-sm">
                  <i data-lucide="volume-2" class="w-5 h-5"></i> Replay
                </button>
                <button onclick="saveFavorite(decodeURIComponent('${enc(item.sentence)}'), 'History')" class="p-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700" title="Bookmark">
                  <i data-lucide="bookmark" class="w-5 h-5"></i>
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;
}

function clearHistory() {
  playTapSound();
  state.history = [];
  localStorage.removeItem('aphasia_history');
  navigateTo('history');
  showToast('History log cleared');
}

// View Renderer 7: Settings View
function renderSettingsView() {
  return `
    <div class="space-y-6 fade-in">
      <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <h2 class="font-heading text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-3">
          <i data-lucide="sliders" class="w-8 h-8 text-slate-700"></i>
          Accessibility & Speech Settings
        </h2>
        <p class="text-slate-500 text-sm font-semibold">Customize display contrast, font sizing, voice engine, and custom phrases.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Display & Visual Accessibility -->
        <div class="glass-card p-6 rounded-3xl space-y-6 bg-white">
          <h3 class="font-heading font-extrabold text-xl text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <i data-lucide="eye" class="w-5 h-5 text-brand-600"></i>
            Visual & Text Scale Accessibility
          </h3>

          <div class="space-y-4">
            <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <h4 class="font-bold text-slate-900 text-base">High Contrast Theme</h4>
                <p class="text-xs text-slate-500">Maximum visibility dark/neon contrast</p>
              </div>
              <button onclick="toggleHighContrast()" class="btn-accessible btn-secondary px-4 py-2 rounded-xl text-sm font-bold">
                ${state.highContrast ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            <div class="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <h4 class="font-bold text-slate-900 text-base">Text Scale Sizing</h4>
              <div class="flex items-center gap-2 pt-1">
                <button onclick="setFontSize('normal')" class="btn-accessible px-4 py-2 rounded-xl text-xs font-bold ${state.fontSize === 'normal' ? 'btn-primary' : 'btn-secondary'}">Normal (100%)</button>
                <button onclick="setFontSize('large')" class="btn-accessible px-4 py-2 rounded-xl text-xs font-bold ${state.fontSize === 'large' ? 'btn-primary' : 'btn-secondary'}">Large (125%)</button>
                <button onclick="setFontSize('xlarge')" class="btn-accessible px-4 py-2 rounded-xl text-xs font-bold ${state.fontSize === 'xlarge' ? 'btn-primary' : 'btn-secondary'}">XL (150%)</button>
              </div>
            </div>

            <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <h4 class="font-bold text-slate-900 text-base">Audio Tap Feedback</h4>
                <p class="text-xs text-slate-500">Play click sound on button press</p>
              </div>
              <button onclick="toggleSoundEffects()" class="btn-accessible btn-secondary px-4 py-2 rounded-xl text-sm font-bold">
                ${state.soundEffects ? 'Sound ON' : 'Sound OFF'}
              </button>
            </div>
          </div>
        </div>

        <!-- Speech Synthesis Controls -->
        <div class="glass-card p-6 rounded-3xl space-y-6 bg-white">
          <h3 class="font-heading font-extrabold text-xl text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <i data-lucide="volume-2" class="w-5 h-5 text-brand-600"></i>
            Voice & Speech Engine
          </h3>

          <div class="space-y-4">
            <div class="space-y-2">
              <label class="block font-bold text-sm text-slate-700">System Voice Selector:</label>
              <select onchange="selectVoice(this.value)" class="w-full p-3 rounded-xl border border-slate-300 font-semibold text-sm bg-white outline-none focus:border-brand-600">
                <option value="">Default Auto-Detected Voice</option>
                ${availableVoices.map(v => `<option value="${enc(v.voiceURI)}" ${state.selectedVoiceURI === v.voiceURI ? 'selected' : ''}>${v.name} (${v.lang})</option>`).join('')}
              </select>
            </div>

            <div class="space-y-2">
              <label class="block font-bold text-sm text-slate-700">Speech Rate (Speed): <span id="speed-val">${state.ttsSpeed}x</span></label>
              <input type="range" min="0.5" max="1.5" step="0.1" value="${state.ttsSpeed}" onchange="setSpeechSpeed(this.value)" class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600" />
            </div>

            <div class="space-y-2">
              <label class="block font-bold text-sm text-slate-700">Voice Pitch: <span id="pitch-val">${state.ttsPitch}</span></label>
              <input type="range" min="0.5" max="1.5" step="0.1" value="${state.ttsPitch}" onchange="setSpeechPitch(this.value)" class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600" />
            </div>

            <button onclick="speakText('This is a sample sentence for speech synthesis testing.')" class="btn-accessible btn-primary w-full py-3 rounded-xl shadow-sm text-sm">
              <i data-lucide="play" class="w-5 h-5"></i> Test Voice Output
            </button>
          </div>
        </div>
        
        <!-- Firebase Cloud Sync Configuration -->
        <div class="glass-card p-6 rounded-3xl space-y-6 bg-white md:col-span-2 border-t-4 border-brand-500">
          <h3 class="font-heading font-extrabold text-xl text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <i data-lucide="cloud" class="w-5 h-5 text-brand-600"></i>
            Cloud Sync Setup (Firebase)
          </h3>
          <p class="text-sm text-slate-600 font-semibold">Paste your Firebase configuration JSON here to enable cloud sync. The app will automatically connect!</p>
          <textarea id="firebase-config-input" rows="6" placeholder='{\n  "apiKey": "...",\n  "authDomain": "...",\n  "projectId": "..."\n}' class="w-full p-4 rounded-xl border border-slate-300 font-mono text-xs bg-slate-50 outline-none focus:border-brand-600">${state.firebaseConfig ? JSON.stringify(state.firebaseConfig, null, 2) : ''}</textarea>
          <div class="flex items-center gap-3">
            <button onclick="saveFirebaseConfig()" class="btn-accessible btn-primary px-6 py-3 rounded-xl shadow-sm text-sm font-bold flex items-center gap-2">
              <i data-lucide="save" class="w-5 h-5"></i> Save & Initialize
            </button>
            <span id="firebase-status" class="text-sm font-bold ${state.isFirebaseReady ? 'text-emerald-600' : 'text-slate-500'}">
              Status: ${state.isFirebaseReady ? 'Connected & Ready' : 'Not Configured'}
            </span>
          </div>
        </div>

      </div>
    </div>
  `;
}

function selectVoice(uri) {
  state.selectedVoiceURI = decodeURIComponent(uri);
  showToast('Voice engine updated!');
}

function toggleSoundEffects() {
  playTapSound();
  state.soundEffects = !state.soundEffects;
  navigateTo('settings');
  showToast(state.soundEffects ? 'Sound Effects Enabled' : 'Sound Effects Disabled');
}

function setSpeechSpeed(val) {
  state.ttsSpeed = parseFloat(val);
  const el = document.getElementById('speed-val');
  if (el) el.innerText = `${state.ttsSpeed}x`;
}

function setSpeechPitch(val) {
  state.ttsPitch = parseFloat(val);
  const el = document.getElementById('pitch-val');
  if (el) el.innerText = `${state.ttsPitch}`;
}

// Firebase Integration
function saveFirebaseConfig() {
  playTapSound();
  const input = document.getElementById('firebase-config-input').value;
  try {
    const config = JSON.parse(input);
    localStorage.setItem('aphasia_firebase_config', JSON.stringify(config));
    state.firebaseConfig = config;
    showToast('Firebase configuration saved! Reloading to apply...', 'success');
    setTimeout(() => window.location.reload(), 1500);
  } catch (e) {
    showToast('Invalid JSON configuration. Please check your format.', 'error');
  }
}

function initFirebase() {
  if (!state.firebaseConfig) return;
  
  // Dynamically load Firebase Compat scripts
  const scripts = [
    'https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js',
    'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js',
    'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js'
  ];

  let loaded = 0;
  scripts.forEach(src => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => {
      loaded++;
      if (loaded === scripts.length) {
        try {
          firebase.initializeApp(state.firebaseConfig);
          state.isFirebaseReady = true;
          console.log('Firebase initialized successfully.');
          
          firebase.auth().onAuthStateChanged(user => {
            state.user = user;
            if (user) {
              console.log('User signed in:', user.email);
            }
          });
        } catch (err) {
          console.error('Firebase initialization error:', err);
        }
      }
    };
    document.head.appendChild(script);
  });
}

// Initial Bootstrapping
document.addEventListener('DOMContentLoaded', () => {
  initFirebase();
  updateFavBadge();
  navigateTo('dashboard');
});
