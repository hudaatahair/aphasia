# 🩵 AI Aphasia Assistant

> **Empowering Independent Speech & Communication for Stroke Survivors**  
> *Project ID: `10439315232679877472`*

---

## 📌 Project Overview

**AI Aphasia Assistant** is an accessible, AI-powered healthcare web application specifically designed to assist stroke survivors, individuals living with aphasia, traumatic brain injury (TBI), and severe speech impairments. 

The application transforms incomplete words, fragmented phrases, visual category tokens, or voice dictation into clear, natural, grammatically correct sentences—paired with instant, high-clarity **Text-to-Speech (TTS)** output in both **English** and **Urdu**.

---

## ❓ Why AI Aphasia Assistant? (The Need)

Aphasia is a neurological language disorder caused by stroke or brain injury that impairs a person's ability to express spoken and written language, leading to extreme communication frustration and isolation.

### The Challenges:
* **Expressive Difficulty**: Patients know what they want to say but cannot recall full word structures or form complete grammatical sentences.
* **Loss of Independence**: Heavy reliance on caregivers for basic needs like asking for water, expressing pain, or calling family.
* **Complexity of Existing Tools**: Traditional assistive communication software can be overwhelming, visually cluttered, or prohibitively complex.

### The Solution:
**AI Aphasia Assistant** bridges this gap by offering:
1. **Intelligent Predictive Assistance**: Completes simple partial inputs (e.g., *"water need"*) into polite full sentences (e.g., *"I need a glass of water, please."*).
2. **Visual Icon Category Board**: 1-tap phrase building across 6 core everyday categories.
3. **Accessibility First**: Built with extra-large 60px+ tap targets, high contrast modes, text scaling, audio feedback, and emergency SOS alerts.

---

## ✨ Key Features & Capabilities

### 1. 🤖 AI Sentence Completion Engine
* Converts partial keywords into 2–3 grammatically correct full sentence variations (*Best Match*, *Formal*, *Short*).
* Bilingual support for **English 🇬🇧** and **Urdu 🇵🇰**.
* **AI Text Simplifier**: Option to compress sentences down to ultra-simple 1–3 word phrases for individuals with severe cognitive fatigue.

### 2. 🧩 Visual Phrase Builder
* Categorized visual icon board with 6 essential categories:
  * 🥤 **Needs**: Water, Food, Bathroom, Rest, Cold, Hot
  * 🏥 **Health**: Pain, Medicine, Doctor, Dizzy, Nauseous, Nurse
  * 😊 **Feelings**: Happy, Tired, Anxious, Sad, Better, Quiet
  * 👨‍👩‍👧 **Family**: Call Family, Daughter, Son, Spouse, Home
  * ☀️ **Daily Activities**: Walk, TV, Window, Sleep, Read, Fresh Air
  * 🚨 **Emergencies**: Fell Down, Breathless, Severe Pain, Help Now
* **Sentence Ribbon**: Tap visual cards to construct multi-word sentence ribbons with 1-tap "Speak All" playback.
* **Custom Phrase Creator**: Add personalized custom phrases to any category or saved list.

### 3. 🎙️ Voice Dictation & Text-to-Speech (TTS)
* **Voice Dictation**: Dictate partial keywords via microphone using Web Speech Recognition (`SpeechRecognition`).
* **Instant Speech Synthesis**: High-clarity audio output powered by the browser's Web Speech API (`SpeechSynthesis`).
* **Voice Tuning**: Custom system voice selection dropdown, pitch adjustment, and speech rate/speed controls.

### 4. 🚨 Emergency SOS Priority Broadcast
* High-visibility top-bar **EMERGENCY SOS** button.
* 1-tap priority announcements for medical emergency, severe pain, fall alert, or caregiver contact with maximum volume speech playback.

### 5. 🎨 Accessibility Suite
* **High Contrast Mode**: Maximum visibility black and neon contrast.
* **Text Scaling**: Normal (100%), Large (125%), and Extra Large (150%) text scale modes.
* **Audio Tap Feedback**: Tactile Web Audio API click synthesizer on button press.

### 6. 💖 Favorites & Conversation History Log
* Bookmark high-frequency phrases for instant 1-tap playback.
* Chronological activity log of generated and spoken sentences with timestamp, input log, and replay buttons.

---

## 🛠️ Technology Stack

* **Frontend Structure**: Semantic HTML5, CSS3 Custom Design System
* **Styling & Theme**: Vanilla CSS + Tailwind CSS CDN + Google Fonts (*Outfit* & *Plus Jakarta Sans*)
* **Iconography**: Lucide Icons
* **Speech Synthesis & Recognition**: Web Speech API (`SpeechSynthesis` & `webkitSpeechRecognition`)
* **Audio Feedback**: Web Audio API (`AudioContext`)
* **Persistence**: Browser `localStorage`

---

## 🚀 Getting Started / Quick Start

No complex node installations or backend servers are required! The web application runs natively in any standard web browser.

### Instructions:
1. Open the project folder:
   ```bash
   c:\Users\HP\Downloads\aphasia
   ```
2. Double-click **`index.html`** or open it in your browser (Google Chrome, Microsoft Edge, Brave, or Firefox recommended).

---

## 📂 Project Directory Structure

```
aphasia/
├── index.html                                  # Main HTML shell & accessible view templates
├── styles.css                                  # Healthcare design system & high contrast styles
├── app.js                                      # Application engine, AI dictionary & speech logic
├── README.md                                   # Comprehensive project documentation
├── AI_Aphasia_Assistant_Project_Proposal.pdf  # Project proposal reference
└── AI_Aphasia_Assistant_Implementation_Guide.pdf # Implementation guide reference
```

---

## 📄 License & Attribution

Developed as an accessible healthcare communication application for speech therapy, rehabilitation clinics, caregivers, and stroke survivors worldwide.
