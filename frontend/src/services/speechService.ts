/**
 * Admin Voice Studio Engine
 * Web Speech API (ASR), Web Audio Chimes, and Multilingual Text-to-Speech (TTS)
 * Full Support for English (en-IN), Hindi (hi-IN), and Marathi (mr-IN)
 */

export interface VoiceIntent {
  type:
    | 'TIMER_START'
    | 'TIMER_PAUSE'
    | 'TIMER_RESUME'
    | 'TIMER_RESET'
    | 'TIMER_ADD'
    | 'CALC_WEIGHT'
    | 'CALC_RECT'
    | 'CALC_CIRCLE'
    | 'EXPORT_PRICING'
    | 'NOTE_CREATE'
    | 'NOTE_TODO'
    | 'NOTE_READ_LAST'
    | 'NOTE_OPEN'
    | 'STOCK_DEDUCT'
    | 'RECIPE_CONSUME'
    | 'BATCH_START'
    | 'BATCH_STATUS'
    | 'CLIMATE_CHECK'
    | 'INVOICE_OPEN'
    | 'CALC_QUOTE'
    | 'NAVIGATE'
    | 'GUIDE_OPEN'
    | 'LANGUAGE_SWITCH'
    | 'UNKNOWN';
  payload?: any;
  rawTranscript: string;
  responseMessage: string;
}

// Check browser SpeechRecognition support
export const isSpeechRecognitionSupported = (): boolean => {
  return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
};

/**
 * Synthesizes crystal-clear audio tones using Web Audio API (Zero external MP3 dependencies)
 */
export const playAudioChime = (tone: 'start' | 'success' | 'alert' | 'finish' | 'tick' | 'wake') => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    if (tone === 'wake') {
      // Pleasant Siri/Assistant dual harmonic ascending chime
      [587.33, 880, 1174.66].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.2, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.3);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.3);
      });
    } else if (tone === 'start') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.18);
    } else if (tone === 'success') {
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.15, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.25);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.25);
      });
    } else if (tone === 'alert') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(440, now + 0.1);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (tone === 'finish') {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.2, now + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.4);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.4);
      });
    } else if (tone === 'tick') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = 1000;
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);
    }
  } catch (err) {
    console.debug('Web Audio Chime notice:', err);
  }
};

export const WAKE_WORDS = [
  // English
  'hey partner',
  'hi partner',
  'hello partner',
  'ok partner',
  'partner',
  // Hindi & Marathi in Devanagari & Transliteration
  'हे पार्टनर',
  'नमस्ते पार्टनर',
  'नमस्कार पार्टनर',
  'सुनो पार्टनर',
  'ऐका पार्टनर',
  'पार्टनर',
  'hey sathi',
  'hey sobati',
];

export const STUDIO_CUSTOM_GRAMMAR = [
  'hey partner', 'hi partner', 'hello partner', 'partner',
  'हे पार्टनर', 'नमस्ते पार्टनर', 'नमस्कार पार्टनर', 'सुनो पार्टनर', 'ऐका पार्टनर',
  'add', 'added', 'using', 'used', 'poured', 'deduct', 'deducted', 'consumed', 'log', 'save', 'note down',
  'resin', 'hardener', 'epoxy', 'uv resin', 'pigment', 'mica', 'glitter',
  'grams', 'gram', 'g', 'gm', 'kilos', 'kg',
  'coaster', 'tray', 'keychain', 'clock', 'nameplate', 'frame', 'thali', 'bookmark', 'jewellery',
  '10', '15', '20', '25', '30', '40', '50', '60', '70', '80', '90', '100', '150', '200', '250', '300', '350', '400', '500', '1000',
  'timer', 'start', 'stop', 'pause', 'resume', 'reset', 'minutes', 'seconds', 'hours',
  'inventory', 'stock', 'warehouse', 'calculator', 'pricing', 'order', 'orders',
  '[unk]'
];

export interface WakeWordResult {
  hasWakeWord: boolean;
  wakeWord: string;
  commandText: string;
  isWakeOnly: boolean;
}

/**
 * Normalizes Devanagari numerals (०-९) and Hindi/Marathi spoken digit words into Arabic numbers.
 */
export const normalizeNumerals = (text: string): string => {
  const devanagariDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  let res = text;
  devanagariDigits.forEach((d, idx) => {
    res = res.split(d).join(String(idx));
  });

  // Word number mappings in Hindi & Marathi
  const wordToNum: Record<string, string> = {
    'एक': '1',
    'दो': '2',
    'दोन': '2',
    'तीन': '3',
    'चार': '4',
    'पाँच': '5',
    'पाच': '5',
    'छह': '6',
    'सहा': '6',
    'सात': '7',
    'आठ': '8',
    'नौ': '9',
    'नऊ': '9',
    'दस': '10',
    'दहा': '10',
    'पंद्रह': '15',
    'पंधरा': '15',
    'बीस': '20',
    'वीस': '20',
    'तीस': '30',
    'चालीस': '40',
    'चाळीस': '40',
    'पचास': '50',
    'पन्नास': '50',
    'साठ': '60',
    'सत्तर': '70',
    'अस्सी': '80',
    'ऐंशी': '80',
    'नब्बे': '90',
    'नव्वद': '90',
    'सौ': '100',
    'शंभर': '100',
  };

  for (const [word, digit] of Object.entries(wordToNum)) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    res = res.replace(regex, digit);
  }

  return res;
};

/**
 * Extracts and separates wake word and command text from spoken transcript.
 * Strictly requires the wake phrase "Hey Partner" (or regional equivalent) before triggering.
 */
export const extractWakeWordCommand = (transcript: string): WakeWordResult => {
  const normalized = transcript.toLowerCase().trim();

  // Look for "hey partner" or regional wake variations
  for (const wake of WAKE_WORDS) {
    const idx = normalized.indexOf(wake.toLowerCase());
    if (idx !== -1) {
      const remainder = normalized.substring(idx + wake.length).replace(/^[,\s.!?:;-]+/, '').trim();
      return {
        hasWakeWord: true,
        wakeWord: wake,
        commandText: remainder,
        isWakeOnly: remainder.length === 0,
      };
    }
  }

  return {
    hasWakeWord: false,
    wakeWord: '',
    commandText: normalized,
    isWakeOnly: false,
  };
};

/**
 * Multilingual Text-to-Speech (TTS) voice synthesizer
 * Supports English ('en'), Hindi ('hi'), and Marathi ('mr')
 */
export const speakFeedback = (
  text: string,
  lang: 'en' | 'hi' | 'mr' = 'en',
  onEnd?: () => void
) => {
  try {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel(); // Stop any pending speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = lang === 'en' ? 1.05 : 0.95;
    utterance.pitch = 1.0;
    utterance.lang = lang === 'hi' ? 'hi-IN' : lang === 'mr' ? 'mr-IN' : 'en-IN';

    if (onEnd) {
      utterance.onend = onEnd;
    }

    const voices = window.speechSynthesis.getVoices();

    if (lang === 'hi') {
      const hiVoice = voices.find(
        (v) => v.lang.startsWith('hi') || v.name.toLowerCase().includes('hindi') || v.name.includes('हिन्दी')
      );
      if (hiVoice) utterance.voice = hiVoice;
    } else if (lang === 'mr') {
      const mrVoice = voices.find(
        (v) =>
          v.lang.startsWith('mr') ||
          v.name.toLowerCase().includes('marathi') ||
          v.name.includes('मराठी') ||
          v.lang.startsWith('hi') // Fallback to Indian phonetic Hindi voice if Marathi pack not installed
      );
      if (mrVoice) utterance.voice = mrVoice;
    } else {
      const enVoice = voices.find(
        (v) =>
          (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('India')) &&
          v.lang.startsWith('en')
      );
      if (enVoice) utterance.voice = enVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.debug('TTS speech notice:', err);
  }
};

/**
 * Multilingual NLP Intent Parser for Workshop Timer, Calculations, Notepad, Stock & Guidance
 * Supports English, Hindi, and Marathi inputs
 */
export const parseVoiceIntent = (
  transcript: string,
  lang: 'en' | 'hi' | 'mr' = 'en'
): VoiceIntent => {
  const rawText = transcript.trim();
  const text = normalizeNumerals(rawText.toLowerCase());

  // ── 0. VOICE LANGUAGE SWITCHING COMMANDS ──
  // Switch to Hindi: "switch to hindi", "speak in hindi", "hindi me bolo", "हिंदी में बात करो", "हिंदी चालू करो"
  if (
    text.includes('switch to hindi') ||
    text.includes('speak in hindi') ||
    text.includes('change to hindi') ||
    text.includes('set language to hindi') ||
    text.includes('hindi me') ||
    text.includes('hindi mein') ||
    text.includes('हिंदी में') ||
    text.includes('हिंदी भाषा') ||
    text.includes('हिंदी चालू') ||
    text.includes('हिंदी बोलो') ||
    text.includes('हिंदी करा') ||
    (text.includes('language') && text.includes('hindi')) ||
    (text.includes('भाषा') && text.includes('हिंदी'))
  ) {
    return {
      type: 'LANGUAGE_SWITCH',
      payload: { language: 'hi' },
      rawTranscript: transcript,
      responseMessage: 'भाषा बदलकर हिंदी कर दी गई है। अब आप हिंदी में निर्देश दे सकते हैं।',
    };
  }

  // Switch to Marathi: "switch to marathi", "speak in marathi", "marathi madhe", "मराठीत बोला", "मराठी भाषा चालू करा"
  if (
    text.includes('switch to marathi') ||
    text.includes('speak in marathi') ||
    text.includes('change to marathi') ||
    text.includes('set language to marathi') ||
    text.includes('marathi madhe') ||
    text.includes('marathit bola') ||
    text.includes('मराठीत बोला') ||
    text.includes('मराठी मध्ये') ||
    text.includes('मराठी भाषा') ||
    text.includes('मराठी चालू') ||
    text.includes('मराठी बोला') ||
    text.includes('मराठी करा') ||
    (text.includes('language') && text.includes('marathi')) ||
    (text.includes('भाषा') && text.includes('मराठी'))
  ) {
    return {
      type: 'LANGUAGE_SWITCH',
      payload: { language: 'mr' },
      rawTranscript: transcript,
      responseMessage: 'भाषा बदलून मराठी करण्यात आली आहे. आता तुम्ही मराठीत सूचना देऊ शकता.',
    };
  }

  // Switch to English: "switch to english", "speak in english", "english me bolo", "इंग्रजीत बोला", "अंग्रेजी में बोलो"
  if (
    text.includes('switch to english') ||
    text.includes('speak in english') ||
    text.includes('change to english') ||
    text.includes('set language to english') ||
    text.includes('english me') ||
    text.includes('english mein') ||
    text.includes('अंग्रेजी में') ||
    text.includes('इंग्रजीत') ||
    text.includes('इंग्रजी भाषा') ||
    text.includes('इंग्लिश चालू') ||
    text.includes('इंग्लिश करा') ||
    (text.includes('language') && text.includes('english')) ||
    (text.includes('भाषा') && (text.includes('अंग्रेजी') || text.includes('इंग्रजी') || text.includes('इंग्लिश')))
  ) {
    return {
      type: 'LANGUAGE_SWITCH',
      payload: { language: 'en' },
      rawTranscript: transcript,
      responseMessage: 'Language switched to English. You can now speak in English.',
    };
  }

  // ── 1. TIMER COMMANDS ──
  // English: "start timer 3 minutes", "set timer 5 mins"
  // Hindi: "3 मिनट का टाइमर शुरू करो", "टाइमर लगाओ 5 मिनट", "टाइमर शुरू करो"
  // Marathi: "3 मिनिटांचा टायमर सुरू करा", "टायमर लावा 5 मिनिटे", "टायमर सुरू करा"
  if (
    text.includes('timer') ||
    text.includes('टाइमर') ||
    text.includes('टायमर') ||
    text.includes('stir') ||
    text.includes('घोल') ||
    text.includes('ढवळ') ||
    text.includes('countdown') ||
    text.includes('minute') ||
    text.includes('मिनट') ||
    text.includes('मिनिट') ||
    text.includes('second') ||
    text.includes('सेकंड')
  ) {
    // Pause / Hold
    if (
      text.includes('pause') ||
      text.includes('hold') ||
      text.includes('wait') ||
      text.includes('रोको') ||
      text.includes('रुक') ||
      text.includes('थांब') ||
      text.includes('थांबवा')
    ) {
      const resp =
        lang === 'hi'
          ? 'घोलने का टाइमर रोक दिया गया है।'
          : lang === 'mr'
          ? 'रेझिन ढवळण्याचा टायमर थांबवला आहे.'
          : 'Resin stirring timer paused.';
      return {
        type: 'TIMER_PAUSE',
        rawTranscript: transcript,
        responseMessage: resp,
      };
    }

    // Resume / Continue
    if (
      text.includes('resume') ||
      text.includes('continue') ||
      text.includes('चालू करो') ||
      text.includes('फिर से शुरू') ||
      text.includes('सुरू करा') ||
      text.includes('पुढे चालू')
    ) {
      const resp =
        lang === 'hi'
          ? 'घोलने का टाइमर फिर से शुरू हो गया है।'
          : lang === 'mr'
          ? 'रेझिन ढवळण्याचा टायमर पुन्हा सुरू झाला आहे.'
          : 'Resin stirring timer resumed.';
      return {
        type: 'TIMER_RESUME',
        rawTranscript: transcript,
        responseMessage: resp,
      };
    }

    // Reset / Restart
    if (
      text.includes('reset') ||
      text.includes('restart') ||
      text.includes('रीसेट') ||
      text.includes('रिसेट') ||
      text.includes('बंद करो') ||
      text.includes('सुरुवातीपासून')
    ) {
      const resp =
        lang === 'hi'
          ? 'टाइमर रीसेट कर दिया गया है।'
          : lang === 'mr'
          ? 'टायमर रीसेट केला आहे.'
          : 'Timer reset to 0.';
      return {
        type: 'TIMER_RESET',
        rawTranscript: transcript,
        responseMessage: resp,
      };
    }

    // Add time
    if (
      text.includes('add') ||
      text.includes('more') ||
      text.includes('जोड़ो') ||
      text.includes('बढ़ाओ') ||
      text.includes('जोडा') ||
      text.includes('वाढवा')
    ) {
      let addSeconds = 60;
      const minMatch = text.match(/(\d+)\s*(?:min|minute|m|मिनट|मिनिट)/);
      const secMatch = text.match(/(\d+)\s*(?:sec|second|s|सेकंड)/);
      if (minMatch) addSeconds = parseInt(minMatch[1], 10) * 60;
      else if (secMatch) addSeconds = parseInt(secMatch[1], 10);

      const mins = Math.round(addSeconds >= 60 ? addSeconds / 60 : addSeconds);
      const resp =
        lang === 'hi'
          ? `टाइमर में ${mins} ${addSeconds >= 60 ? 'मिनट' : 'सेकंड'} जोड़ दिए गए हैं।`
          : lang === 'mr'
          ? `टायमरमध्ये ${mins} ${addSeconds >= 60 ? 'मिनिटे' : 'सेकंद'} जोडली आहेत.`
          : `Added ${mins} ${addSeconds >= 60 ? 'minute(s)' : 'seconds'} to timer.`;

      return {
        type: 'TIMER_ADD',
        payload: { seconds: addSeconds },
        rawTranscript: transcript,
        responseMessage: resp,
      };
    }

    // Starting new timer with specified duration
    let totalSeconds = 180; // default 3 minutes stirring
    const minMatch = text.match(/(\d+)\s*(?:min|minute|m|मिनट|मिनिट)/);
    const secMatch = text.match(/(\d+)\s*(?:sec|second|s|सेकंड)/);

    if (minMatch && secMatch) {
      totalSeconds = parseInt(minMatch[1], 10) * 60 + parseInt(secMatch[1], 10);
    } else if (minMatch) {
      totalSeconds = parseInt(minMatch[1], 10) * 60;
    } else if (secMatch) {
      totalSeconds = parseInt(secMatch[1], 10);
    } else {
      // Look for standalone number e.g. "start timer 5" or "5 मिनट"
      const numMatch = text.match(/(\d+)/);
      if (numMatch) {
        totalSeconds = parseInt(numMatch[1], 10) * 60;
      }
    }

    const durationLabelEn =
      totalSeconds >= 60
        ? `${Math.floor(totalSeconds / 60)} minute${totalSeconds >= 120 ? 's' : ''}`
        : `${totalSeconds} seconds`;

    const minsVal = Math.floor(totalSeconds / 60);
    const resp =
      lang === 'hi'
        ? `${minsVal > 0 ? `${minsVal} मिनट` : `${totalSeconds} सेकंड`} का रेजिन घोलने का टाइमर शुरू हो रहा है।`
        : lang === 'mr'
        ? `${minsVal > 0 ? `${minsVal} मिनिटांचा` : `${totalSeconds} सेकंदांचा`} रेझिन ढवळण्याचा टायमर सुरू होत आहे.`
        : `Starting ${durationLabelEn} resin stirring timer now.`;

    return {
      type: 'TIMER_START',
      payload: { seconds: totalSeconds },
      rawTranscript: transcript,
      responseMessage: resp,
    };
  }

  // ── 2. RESIN RATIO CALCULATIONS ──
  // e.g. "calculate 300g resin", "300 ग्राम रेजिन का हिसाब", "300 ग्रॅम रेझिनचे प्रमाण"
  const weightMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:g|gm|gram|grams|ग्राम|ग्रॅम)/i);
  if (
    weightMatch ||
    ((text.includes('calculate') || text.includes('हिसाब') || text.includes('प्रमाण') || text.includes('रेजिन') || text.includes('रेझिन')) &&
      text.match(/\b\d+\b/))
  ) {
    const weightVal = parseFloat(weightMatch ? weightMatch[1] : text.match(/\b\d+\b/)![0]);
    if (weightVal > 0) {
      const partA = Number(((weightVal * 2) / 3).toFixed(1));
      const partB = Number(((weightVal * 1) / 3).toFixed(1));
      const cost = Math.round(weightVal * 0.8);

      const resp =
        lang === 'hi'
          ? `${weightVal} ग्राम के लिए: ${partA} ग्राम पार्ट A रेजिन और ${partB} ग्राम पार्ट B हार्डनर मिलाएं। अनुमानित लागत ₹${cost} है।`
          : lang === 'mr'
          ? `${weightVal} ग्रॅमसाठी: ${partA} ग्रॅम पार्ट A रेझिन आणि ${partB} ग्रॅम पार्ट B हार्डनर मिसळा. अंदाजे खर्च ₹${cost} आहे.`
          : `For ${weightVal} grams: mix ${partA} grams Part A Resin and ${partB} grams Part B Hardener. Material cost: ₹${cost}.`;

      return {
        type: 'CALC_WEIGHT',
        payload: { weight: weightVal, partA, partB, cost },
        rawTranscript: transcript,
        responseMessage: resp,
      };
    }
  }

  // Rectangle Mold: "calculate rectangle mold 20 by 15 by 2" / "आयत मोल्ड 20 बाय 15" / "चौकोनी मोल्ड 20 बाय 15"
  if (
    text.includes('rectangle') ||
    text.includes('box') ||
    text.includes('square') ||
    text.includes('आयत') ||
    text.includes('चौकोनी') ||
    text.includes('मोल्ड')
  ) {
    const dims = text.match(/(\d+(?:\.\d+)?)\s*(?:by|x|\*|,|बाय)\s*(\d+(?:\.\d+)?)(?:\s*(?:by|x|\*|,|बाय)\s*(\d+(?:\.\d+)?))?/i);
    if (dims) {
      const l = parseFloat(dims[1]);
      const w = parseFloat(dims[2]);
      const d = dims[3] ? parseFloat(dims[3]) : 1.0;
      const weight = Number((l * w * d * 1.1).toFixed(1));
      const partA = Number(((weight * 2) / 3).toFixed(1));
      const partB = Number(((weight * 1) / 3).toFixed(1));

      const resp =
        lang === 'hi'
          ? `आयत मोल्ड (${l}×${w}×${d} सेमी) के लिए कुल ${weight} ग्राम रेजिन चाहिए (${partA}g पार्ट A + ${partB}g पार्ट B)।`
          : lang === 'mr'
          ? `चौकोनी मोल्डसाठी (${l}×${w}×${d} सेमी) एकूण ${weight} ग्रॅम रेझिन लागेल (${partA}g पार्ट A + ${partB}g पार्ट B).`
          : `Rectangle mold (${l}×${w}×${d} cm) requires ${weight} grams total resin (${partA}g Resin + ${partB}g Hardener).`;

      return {
        type: 'CALC_RECT',
        payload: { length: l, width: w, depth: d, weight, partA, partB },
        rawTranscript: transcript,
        responseMessage: resp,
      };
    }
  }

  // Circle Mold: "calculate circle mold diameter 20 depth 2" / "गोल मोल्ड" / "वर्तुळाकार मोल्ड"
  if (
    text.includes('circle') ||
    text.includes('round') ||
    text.includes('diameter') ||
    text.includes('गोल') ||
    text.includes('वर्तुळ')
  ) {
    const nums = text.match(/\d+(?:\.\d+)?/g);
    if (nums && nums.length >= 1) {
      const diameter = parseFloat(nums[0]);
      const depth = nums[1] ? parseFloat(nums[1]) : 0.8;
      const radius = diameter / 2;
      const weight = Number((Math.PI * Math.pow(radius, 2) * depth * 1.1).toFixed(1));
      const partA = Number(((weight * 2) / 3).toFixed(1));
      const partB = Number(((weight * 1) / 3).toFixed(1));

      const resp =
        lang === 'hi'
          ? `गोल मोल्ड (${diameter} सेमी व्यास) के लिए ${weight} ग्राम रेजिन चाहिए (${partA}g पार्ट A + ${partB}g पार्ट B)।`
          : lang === 'mr'
          ? `गोल मोल्डसाठी (${diameter} सेमी व्यास) ${weight} ग्रॅम रेझिन लागेल (${partA}g पार्ट A + ${partB}g पार्ट B).`
          : `Circle mold (${diameter}cm diameter) requires ${weight} grams resin (${partA}g Resin + ${partB}g Hardener).`;

      return {
        type: 'CALC_CIRCLE',
        payload: { diameter, depth, weight, partA, partB },
        rawTranscript: transcript,
        responseMessage: resp,
      };
    }
  }

  // ── 3. WORKSHOP NOTEPAD & INSTRUCTION LOGGING ──
  // Read Last Note: "read last note" / "पिछला नोट सुनाओ" / "शेवटची नोंद वाचून दाखवा"
  if (
    text.includes('read last note') ||
    text.includes('read my last note') ||
    text.includes('what was my last note') ||
    text.includes('पिछला नोट') ||
    text.includes('आखिरी नोट') ||
    text.includes('शेवटची नोंद') ||
    text.includes('माझी नोंद')
  ) {
    const resp =
      lang === 'hi'
        ? 'मैं आपकी पिछली दर्ज की गई नोट पढ़कर सुना रहा हूँ।'
        : lang === 'mr'
        ? 'मी तुमची शेवटची नोंद वाचून दाखवत आहे.'
        : 'Reading your latest studio note.';
    return {
      type: 'NOTE_READ_LAST',
      rawTranscript: transcript,
      responseMessage: resp,
    };
  }

  // Open Notepad: "open notepad" / "नोटपैड खोलो" / "नोटपॅड उघडा"
  if (
    text.includes('open notepad') ||
    text.includes('show notes') ||
    text.includes('open notes') ||
    text.includes('नोटपैड') ||
    text.includes('नोटपॅड')
  ) {
    const resp =
      lang === 'hi'
        ? 'स्टूडियो नोटपैड खोला जा रहा है।'
        : lang === 'mr'
        ? 'स्टुडिओ नोटपॅड उघडत आहे.'
        : 'Opening Workshop Studio Notepad.';
    return {
      type: 'NOTE_OPEN',
      rawTranscript: transcript,
      responseMessage: resp,
    };
  }

  // 12-Step Guide: "open guide" / "गाइड खोलो" / "मार्गदर्शक उघडा" / "12 स्टेप्स"
  if (
    text.includes('guide') ||
    text.includes('गाइड') ||
    text.includes('मार्गदर्शक') ||
    text.includes('स्टेप्स') ||
    text.includes('पायऱ्या') ||
    text.includes('process')
  ) {
    const resp =
      lang === 'hi'
        ? '12-चरणीय रेजिन आर्ट स्टूडियो गाइड खोला जा रहा है।'
        : lang === 'mr'
        ? '12-टप्प्यांचे रेझिन आर्ट स्टुडिओ मार्गदर्शक उघडत आहे.'
        : 'Opening 12-Step Resin Art Studio Process Guide.';
    return {
      type: 'GUIDE_OPEN',
      rawTranscript: transcript,
      responseMessage: resp,
    };
  }

  // To-Do / Task: "add todo..." / "काम जोड़ो..." / "टास्क जोडा..." / "टू-डू लिखो..."
  if (
    text.startsWith('add to-do') ||
    text.startsWith('add todo') ||
    text.startsWith('remind me to') ||
    text.includes('add task') ||
    text.includes('काम जोड़ो') ||
    text.includes('टास्क जोड़ो') ||
    text.includes('टू-डू') ||
    text.includes('काम जोडा') ||
    text.includes('टास्क जोडा')
  ) {
    const cleanTask = text
      .replace(/^(?:add to-do:?|add todo:?|remind me to:?|add task:?|काम जोड़ो:?|टास्क जोड़ो:?|टू-डू:?|काम जोडा:?|टास्क जोडा:?)/i, '')
      .trim();
    const resp =
      lang === 'hi'
        ? `चेकलिस्ट में काम दर्ज किया गया: ${cleanTask || rawText}`
        : lang === 'mr'
        ? `चेकलिस्टमध्ये काम नोंदवले: ${cleanTask || rawText}`
        : `To-Do task recorded: ${cleanTask || rawText}`;

    return {
      type: 'NOTE_TODO',
      payload: {
        content: cleanTask || rawText,
        title: cleanTask ? `Task: ${cleanTask.slice(0, 30)}` : 'Workshop Task',
      },
      rawTranscript: transcript,
      responseMessage: resp,
    };
  }

  // Note Down / Instruction: "note down..." / "नोट लिखो..." / "नोंद करा..." / "यह लिख लो..."
  if (
    text.startsWith('note down') ||
    text.startsWith('take a note') ||
    text.startsWith('write note') ||
    text.startsWith('write down') ||
    text.startsWith('remember') ||
    text.startsWith('log batch') ||
    text.startsWith('save note') ||
    text.includes('note down') ||
    text.includes('take a note') ||
    text.includes('नोट लिखो') ||
    text.includes('नोंद करा') ||
    text.includes('लिख लो') ||
    text.includes('लक्षात ठेवा') ||
    text.includes('नोंद ठेवा')
  ) {
    const cleanNote = text
      .replace(
        /^(?:note down:?|take a note:?|write note:?|write down:?|remember:?|log batch:?|save note:?|नोट लिखो:?|नोंद करा:?|लिख लो:?|नोंद ठेवा:?)/i,
        ''
      )
      .trim();

    // Check if note mentions poured grams for auto stock deduction
    const pouredMatch = cleanNote.match(/(?:poured|used|consumed|deduct|इस्तेमाल|वापरले|डाला|ओतले)\s*(\d+(?:\.\d+)?)\s*(?:g|gm|gram|grams|ग्राम|ग्रॅम)?/i);
    const stockGrams = pouredMatch ? parseFloat(pouredMatch[1]) : 0;

    let resp = '';
    if (lang === 'hi') {
      resp = stockGrams > 0
        ? `नोट सहेजा गया और गोदाम से ${stockGrams}g रेजिन घटा दिया गया।`
        : `नोट स्टूडियो नोटपैड में सहेज लिया गया है।`;
    } else if (lang === 'mr') {
      resp = stockGrams > 0
        ? `नोंद सेव्ह केली आणि गोदामातून ${stockGrams}g रेझिन वजा केले.`
        : `नोंद स्टुडिओ नोटपॅडमध्ये सेव्ह केली आहे.`;
    } else {
      resp = stockGrams > 0
        ? `Note saved and ${stockGrams}g resin deducted from warehouse stock.`
        : `Note recorded and saved to workshop notepad.`;
    }

    return {
      type: 'NOTE_CREATE',
      payload: {
        content: cleanNote || rawText,
        rawResinGramsDeducted: stockGrams,
      },
      rawTranscript: transcript,
      responseMessage: resp,
    };
  }

  // ── 4. AUTO STOCK DEDUCTION KEYWORDS ──
  // e.g. "adding 80g resin for coaster" / "used 80g resin" / "80 grams coaster" / "कोस्टर के लिए 80 ग्राम रेजिन"
  const hasGramsMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:g|gm|gram|grams|ग्राम|ग्रॅम)/i);
  const hasResinProductKeyword =
    text.includes('resin') ||
    text.includes('रेजिन') ||
    text.includes('रेझिन') ||
    text.includes('hardener') ||
    text.includes('हार्डनर') ||
    text.includes('gram') ||
    text.includes('ग्राम') ||
    text.includes('ग्रॅम') ||
    text.includes('stock') ||
    text.includes('गोदाम') ||
    text.includes('coaster') ||
    text.includes('कोस्टर') ||
    text.includes('tray') ||
    text.includes('ट्रे') ||
    text.includes('keychain') ||
    text.includes('कीचेन') ||
    text.includes('clock') ||
    text.includes('घड़ी') ||
    text.includes('घड्याळ') ||
    text.includes('nameplate') ||
    text.includes('नेमप्लेट');

  if (
    hasGramsMatch && hasResinProductKeyword ||
    (hasGramsMatch && (
      text.includes('adding') ||
      text.includes('added') ||
      text.includes('poured') ||
      text.includes('deduct') ||
      text.includes('using') ||
      text.includes('used') ||
      text.includes('consumed') ||
      text.includes('इस्तेमाल') ||
      text.includes('वापरले') ||
      text.includes('वापरत') ||
      text.includes('रेजिन डाला') ||
      text.includes('डाल रहे') ||
      text.includes('जोड़ रहे') ||
      text.includes('घालत आहे') ||
      text.includes('टाकले') ||
      text.includes('रेझिन ओतले') ||
      text.includes('ओतले') ||
      text.includes('ॲड केले') ||
      text.includes('ॲड करा')
    ))
  ) {
    const numMatch = hasGramsMatch || text.match(/(\d+(?:\.\d+)?)\s*(?:g|gm|gram|grams|ग्राम|ग्रॅम)?/i);
    if (numMatch) {
      const grams = parseFloat(numMatch[1]);
      if (grams > 0) {
        const productTypes = [
          'coaster', 'कोस्टर',
          'tray', 'ट्रे',
          'keychain', 'कीचेन',
          'bookmark', 'बुकमार्क',
          'jewelry', 'ज्वेलरी',
          'clock', 'घड़ी', 'घड्याळ',
          'name plate', 'नेमप्लेट',
          'frame', 'फ्रेम',
          'cube', 'क्यूब',
        ];
        const matchedProduct = productTypes.find((p) => text.includes(p)) || 'Workshop Batch';
        const materialCost = Math.round(grams * 0.8 * 100) / 100;
        const partA = Number(((grams * 2) / 3).toFixed(1));
        const partB = Number(((grams * 1) / 3).toFixed(1));

        const resp =
          lang === 'hi'
            ? `${matchedProduct} के लिए गोदाम से ${grams}g रेजिन घटाया गया (लागत: ₹${materialCost}) और नोट सहेज लिया गया।`
            : lang === 'mr'
            ? `${matchedProduct} साठी गोदामातून ${grams}g रेझिन वजा केले (गुंतवणूक: ₹${materialCost}) आणि नोंद सेव्ह केली.`
            : `Deducted ${grams}g resin for ${matchedProduct} from warehouse (Material investment: ₹${materialCost}) and auto-saved note.`;

        return {
          type: 'STOCK_DEDUCT',
          payload: { totalGrams: grams, productName: matchedProduct, materialCost, partA, partB },
          rawTranscript: transcript,
          responseMessage: resp,
        };
      }
    }
  }

  // ── 5. MULTI-MATERIAL BOM RECIPE PRESET DEDUCTION ──
  // e.g. "used 1 clock recipe" / "executed 2 coaster recipes" / "1 घड़ी रेसिपी इस्तेमाल की" / "1 घड्याळ रेसिपी वापरली"
  if (
    text.includes('recipe') ||
    text.includes('रेसिपी') ||
    text.includes('कृती') ||
    text.includes('घड़ी का सामान') ||
    text.includes('घड्याळाचे साहित्य')
  ) {
    const numMatch = text.match(/(\d+)/);
    const count = numMatch ? parseInt(numMatch[1], 10) : 1;

    let targetRecipeSlug = 'resin-wall-clock-12-inch';
    let targetProductName = 'Resin Wall Clock (12-inch)';
    let productType = 'clock';

    if (text.includes('coaster') || text.includes('कोस्टर')) {
      targetRecipeSlug = 'ocean-geode-coaster-set-4-pcs';
      targetProductName = 'Ocean Geode Coaster Set (4 pcs)';
      productType = 'coaster';
    } else if (text.includes('keychain') || text.includes('कीचेन')) {
      targetRecipeSlug = 'custom-alphabet-keychain';
      targetProductName = 'Custom Alphabet Keychain';
      productType = 'keychain';
    } else if (text.includes('tray') || text.includes('ट्रे')) {
      targetRecipeSlug = 'large-geode-serving-tray';
      targetProductName = 'Large Geode Serving Tray';
      productType = 'tray';
    }

    const resp =
      lang === 'hi'
        ? `${count}x ${targetProductName} रेसिपी के सभी घटक (रेजिन + पिगमेंट + पार्ट्स) गोदाम से घटाए जा रहे हैं।`
        : lang === 'mr'
        ? `${count}x ${targetProductName} रेसिपीचे सर्व साहित्य (रेझिन + रंग + पार्ट्स) गोदामातून वजा केले जात आहे.`
        : `Deducting all composite BOM materials for ${count}x ${targetProductName} from warehouse inventory.`;

    return {
      type: 'RECIPE_CONSUME',
      payload: { recipeSlug: targetRecipeSlug, productType, units: count, targetProductName },
      rawTranscript: transcript,
      responseMessage: resp,
    };
  }

  // ── 5.5 MULTI-BATCH CURE STAGE & DEMOLD ALARM TRACKER ──
  // e.g. "started batch 105 for clock", "started 300g batch for tray", "घड़ी के लिए नया बैच 105 शुरू किया", "घड्याळासाठी नवीन बॅच 105 सुरू केली"
  if (
    (text.includes('batch') || text.includes('बैच') || text.includes('बॅच') || text.includes('cure') || text.includes('क्युरिंग')) &&
    (text.includes('start') || text.includes('started') || text.includes('new') || text.includes('शुरू') || text.includes('सुरू') || text.includes('नवीन') || text.includes('नया'))
  ) {
    const batchNumMatch = text.match(/(?:batch|बैच|बॅच)\s*(?:#|no\.?|number)?\s*([a-zA-Z0-9-]+)/i);
    const gramsMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:g|gm|gram|grams|ग्राम|ग्रॅम)/i);

    const productTypes = [
      { key: 'clock', label: 'Resin Wall Clock', hi: 'घड़ी', mr: 'घड्याळ' },
      { key: 'tray', label: 'Geode Serving Tray', hi: 'ट्रे', mr: 'ट्रे' },
      { key: 'nameplate', label: 'Luxury Nameplate', hi: 'नेमप्लेट', mr: 'नेमप्लेट' },
      { key: 'coaster', label: 'Coaster Set', hi: 'कोस्टर', mr: 'कोस्टर' },
      { key: 'keychain', label: 'Custom Keychain', hi: 'कीचेन', mr: 'कीचेन' },
    ];

    let matchedProduct = 'Workshop Resin Batch';
    let matchedType = 'general';
    for (const p of productTypes) {
      if (text.includes(p.key) || text.includes(p.hi) || text.includes(p.mr)) {
        matchedProduct = p.label;
        matchedType = p.key;
        break;
      }
    }

    const batchNumber = batchNumMatch ? `B-${batchNumMatch[1].toUpperCase()}` : undefined;
    const resinGrams = gramsMatch ? parseFloat(gramsMatch[1]) : 350;

    const resp =
      lang === 'hi'
        ? `${matchedProduct} के लिए क्योरिंग बैच शुरू किया गया है। जेल विंडो 45 मिनट में और डिमोल्ड 24 घंटे में होगा।`
        : lang === 'mr'
        ? `${matchedProduct} साठी क्युरिंग बॅच सुरू केली आहे. जेल विंडो 45 मिनिटांत आणि डिमोल्ड 24 तासांत होईल.`
        : `Started cure tracking for ${matchedProduct}. Stage 1 Gel window in 45m, demold ready in 24h.`;

    return {
      type: 'BATCH_START',
      payload: {
        batchNumber,
        productName: matchedProduct,
        productType: matchedType,
        resinGrams,
        notes: rawText,
      },
      rawTranscript: transcript,
      responseMessage: resp,
    };
  }

  // Check cure batch status: "check batch status" / "cure status" / "क्युरिंग का स्टेटस बताओ" / "बॅच स्थिती काय आहे"
  if (
    (text.includes('batch') || text.includes('cure') || text.includes('क्युरिंग') || text.includes('बैच') || text.includes('बॅच')) &&
    (text.includes('status') || text.includes('check') || text.includes('स्टेटस') || text.includes('स्थिति') || text.includes('स्थिती') || text.includes('सांगा') || text.includes('बताओ'))
  ) {
    const resp =
      lang === 'hi'
        ? 'वर्तमान रेजिन बैच क्योरिंग और डिमोल्ड स्थिति जांची जा रही है।'
        : lang === 'mr'
        ? 'सध्याची रेझिन बॅच क्युरिंग आणि डिमोल्ड स्थिती तपासली जात आहे.'
        : 'Checking live workshop batch cure stages and demold timelines.';

    return {
      type: 'BATCH_STATUS',
      rawTranscript: transcript,
      responseMessage: resp,
    };
  }

  // ── 6. WORKSHOP CLIMATE & CURE COMPENSATOR CHECK ──
  // e.g. "check temperature" / "what is the room temperature" / "तापमान कितना है" / "तापमान किती आहे"
  if (
    text.includes('temperature') ||
    text.includes('climate') ||
    text.includes('weather') ||
    text.includes('humidity') ||
    text.includes('room temp') ||
    text.includes('तापमान') ||
    text.includes('मौसम') ||
    text.includes('हवामान') ||
    text.includes('आर्द्रता')
  ) {
    const resp =
      lang === 'hi'
        ? 'स्टूडियो का वर्तमान तापमान और रेजिन क्योरिंग स्थिति जांची जा रही है।'
        : lang === 'mr'
        ? 'स्टुडिओचे सध्याचे तापमान आणि रेझिन क्युरिंग स्थिती तपासली जात आहे.'
        : 'Checking workshop ambient temperature, humidity, and adjusted curing guidance.';

    return {
      type: 'CLIMATE_CHECK',
      rawTranscript: transcript,
      responseMessage: resp,
    };
  }

  // ── 7. BRANDED PDF INVOICE & QUOTATION ──
  // e.g. "generate invoice" / "open pdf invoice" / "बिल बनाओ" / "इनवॉइस तैयार करा"
  if (
    text.includes('invoice') ||
    text.includes('pdf') ||
    text.includes('bill') ||
    text.includes('इनवॉइस') ||
    text.includes('बिल') ||
    text.includes('पावती')
  ) {
    const resp =
      lang === 'hi'
        ? 'स्टूडियो ब्रांडेड पीडीएफ इनवॉइस व कोटेशन शीट खोली जा रही है।'
        : lang === 'mr'
        ? 'स्टुडिओ ब्रँडेड पीडीएफ इनव्हॉइस व कोटेशन शीट उघडत आहे.'
        : 'Opening Studio Branded PDF Quotation & Invoice Generator.';

    return {
      type: 'INVOICE_OPEN',
      rawTranscript: transcript,
      responseMessage: resp,
    };
  }

  // ── 5. PRODUCT COSTING & QUOTE CALCULATOR (@Quote) ──
  // "quote coaster" / "कोस्टर का कोटेशन" / "कोस्टरचे कोटेशन"
  if (
    text.includes('quote') ||
    text.includes('costing') ||
    text.includes('कोटेशन') ||
    text.includes('किंमत') ||
    text.includes('लागत')
  ) {
    const productTypes = ['coaster', 'tray', 'keychain', 'bookmark', 'jewelry', 'clock', 'name plate', 'frame'];
    const matchedProduct = productTypes.find((p) => text.includes(p)) || 'Custom Art Piece';

    const resp =
      lang === 'hi'
        ? `${matchedProduct} के लिए उत्पाद कोटेशन और मूल्य विभाजन तैयार किया जा रहा है।`
        : lang === 'mr'
        ? `${matchedProduct} साठी उत्पादन कोटेशन आणि किंमत तपशील तयार केला जात आहे.`
        : `Generating product quotation and price breakdown for ${matchedProduct}.`;

    return {
      type: 'CALC_QUOTE',
      payload: { productName: matchedProduct },
      rawTranscript: transcript,
      responseMessage: resp,
    };
  }

  // Export to Pricing
  if (text.includes('export') || text.includes('pricing')) {
    return {
      type: 'EXPORT_PRICING',
      rawTranscript: transcript,
      responseMessage:
        lang === 'hi'
          ? 'मूल्य निर्धारण कैलकुलेटर में भेजा जा रहा है।'
          : lang === 'mr'
          ? 'किंमत कॅल्क्युलेटरमध्ये पाठवले जात आहे.'
          : 'Exporting calculation to Product Pricing Calculator.',
    };
  }

  // ── 6. ADMIN STUDIO NAVIGATION ──
  // Warehouse / Inventory: "go to warehouse" / "गोदाम खोलो" / "इन्व्हेंटरी उघडा"
  if (
    text.includes('inventory') ||
    text.includes('warehouse') ||
    text.includes('stock') ||
    text.includes('गोदाम') ||
    text.includes('इन्वेंटरी') ||
    text.includes('इन्व्हेंटरी')
  ) {
    return {
      type: 'NAVIGATE',
      payload: { path: '/admin/inventory' },
      rawTranscript: transcript,
      responseMessage:
        lang === 'hi'
          ? 'गोदाम कच्चा माल इन्वेंटरी खोला जा रहा है।'
          : lang === 'mr'
          ? 'गोदाम कच्चा माल इन्व्हेंटरी उघडत आहे.'
          : 'Navigating to Warehouse Raw Materials Inventory.',
    };
  }

  if (text.includes('calculator') || text.includes('कैलकुलेटर') || text.includes('कॅल्क्युलेटर')) {
    return {
      type: 'NAVIGATE',
      payload: { path: '/admin/resin-calculator' },
      rawTranscript: transcript,
      responseMessage:
        lang === 'hi'
          ? 'रेजिन मिश्रण कैलकुलेटर खोला जा रहा है।'
          : lang === 'mr'
          ? 'रेझिन मिश्रण कॅल्क्युलेटर उघडत आहे.'
          : 'Opening Resin Mixing & Cost Calculator.',
    };
  }

  if (text.includes('pricing') || text.includes('profit') || text.includes('मूल्य') || text.includes('नफा')) {
    return {
      type: 'NAVIGATE',
      payload: { path: '/admin/pricing-calculator' },
      rawTranscript: transcript,
      responseMessage:
        lang === 'hi'
          ? 'उत्पाद मूल्य निर्धारण कैलकुलेटर खोला जा रहा है।'
          : lang === 'mr'
          ? 'उत्पादन किंमत कॅल्क्युलेटर उघडत आहे.'
          : 'Opening Product Pricing & Cost Breakdown Calculator.',
    };
  }

  if (text.includes('order') || text.includes('ऑर्डर')) {
    return {
      type: 'NAVIGATE',
      payload: { path: '/admin/orders' },
      rawTranscript: transcript,
      responseMessage:
        lang === 'hi'
          ? 'ग्राहक ऑर्डर प्रबंधन खोला जा रहा है।'
          : lang === 'mr'
          ? 'ग्राहक ऑर्डर व्यवस्थापन उघडत आहे.'
          : 'Opening Customer Orders Management.',
    };
  }

  if (text.includes('product') || text.includes('catalog') || text.includes('प्रोडक्ट')) {
    return {
      type: 'NAVIGATE',
      payload: { path: '/admin/products' },
      rawTranscript: transcript,
      responseMessage:
        lang === 'hi'
          ? 'उत्पाद सूची और 3D मॉडल कैटलॉग खोला जा रहा है।'
          : lang === 'mr'
          ? 'उत्पादन सूची आणि 3D मॉडेल कॅटलॉग उघडत आहे.'
          : 'Opening Product & 3D Model Catalog.',
    };
  }

  if (text.includes('dashboard') || text.includes('home') || text.includes('डैशबोर्ड') || text.includes('डॅशबोर्ड')) {
    return {
      type: 'NAVIGATE',
      payload: { path: '/admin' },
      rawTranscript: transcript,
      responseMessage:
        lang === 'hi'
          ? 'एडमिन डैशबोर्ड खोला जा रहा है।'
          : lang === 'mr'
          ? 'ॲडमिन डॅशबोर्ड उघडत आहे.'
          : 'Opening Admin Control Center Dashboard.',
    };
  }

  const unknownFallback =
    lang === 'hi'
      ? `सुना गया: "${rawText}"। आप "3 मिनट का टाइमर शुरू करो", "300 ग्राम रेजिन", या "नोट लिखो" कह सकते हैं।`
      : lang === 'mr'
      ? `ऐकले: "${rawText}". तुम्ही "3 मिनिटांचा टायमर सुरू करा", "300 ग्रॅम रेझिन", किंवा "नोंद करा" म्हणू शकता.`
      : `Heard "${rawText}". Try saying "Start timer 3 minutes", "Calculate 300g resin", or "Note down instructions".`;

  return {
    type: 'UNKNOWN',
    rawTranscript: transcript,
    responseMessage: unknownFallback,
  };
};
