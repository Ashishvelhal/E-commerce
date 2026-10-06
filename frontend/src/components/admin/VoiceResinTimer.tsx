import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Sparkles,
  AlertCircle,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import {
  isSpeechRecognitionSupported,
  playAudioChime,
  speakFeedback,
  parseVoiceIntent,
} from '../../services/speechService';
import { useToastStore } from '../../store/useToastStore';
import { useVoiceStore } from '../../store/useVoiceStore';
import { useStudioNoteStore } from '../../store/useStudioNoteStore';

interface VoiceResinTimerProps {
  onTimerComplete?: (durationSeconds: number) => void;
  className?: string;
}

const PRESETS = [
  { label: '3m Stirring', seconds: 180, desc: 'Standard 2:1 gentle mix', icon: '🥣' },
  { label: '5m Deep Mix', seconds: 300, desc: 'High-viscosity resin mix', icon: '🌀' },
  { label: '10m Bubble Rest', seconds: 600, desc: 'Micro-bubble release stage', icon: '✨' },
  { label: '45m Pot-Life', seconds: 2700, desc: 'Maximum liquid work time', icon: '⏳' },
];

export const VoiceResinTimer: React.FC<VoiceResinTimerProps> = ({ onTimerComplete, className = '' }) => {
  const { addToast } = useToastStore();
  const { timerEvent, language } = useVoiceStore();
  const { addNote, deductBatchStock } = useStudioNoteStore();
  const [totalSeconds, setTotalSeconds] = useState(180);
  const [remainingSeconds, setRemainingSeconds] = useState(180);
  const [isRunning, setIsRunning] = useState(false);
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [lastSpokenText, setLastSpokenText] = useState('');
  const [isPromptingNotes, setIsPromptingNotes] = useState(false);

  // Synchronize with ambient "Hey Partner" voice timer events
  useEffect(() => {
    if (!timerEvent) return;
    if (timerEvent.action === 'start') {
      const sec = timerEvent.seconds || 180;
      setTotalSeconds(sec);
      setRemainingSeconds(sec);
      setIsRunning(true);
    } else if (timerEvent.action === 'pause') {
      setIsRunning(false);
    } else if (timerEvent.action === 'resume') {
      setIsRunning(true);
    } else if (timerEvent.action === 'reset') {
      setIsRunning(false);
      setRemainingSeconds(totalSeconds);
    } else if (timerEvent.action === 'add') {
      const addSec = timerEvent.seconds || 60;
      setRemainingSeconds((prev) => prev + addSec);
      setTotalSeconds((prev) => prev + addSec);
    }
  }, [timerEvent, totalSeconds]);

  const recognitionRef = useRef<any>(null);
  const timerIntervalRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && isSpeechRecognitionSupported()) {
      const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognizer = new SpeechRecognitionClass();
      recognizer.continuous = true;
      recognizer.interimResults = false;
      recognizer.lang = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-IN';

      recognizer.onstart = () => {
        setIsListening(true);
        playAudioChime('start');
      };

      recognizer.onend = () => {
        setIsListening(false);
      };

      recognizer.onresult = (event: any) => {
        const lastResultIndex = event.results.length - 1;
        const transcript = event.results[lastResultIndex][0].transcript;
        setLastSpokenText(transcript);
        handleVoiceCommand(transcript);
      };

      recognizer.onerror = (err: any) => {
        console.warn('SpeechRecognition error:', err);
        setIsListening(false);
      };

      recognitionRef.current = recognizer;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, [language]);

  // Timer Tick Engine
  useEffect(() => {
    if (isRunning) {
      timerIntervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            setIsRunning(false);
            handleFinish();
            return 0;
          }
          // Warning alert at 60s remaining
          if (prev === 60) {
            playAudioChime('alert');
            if (!voiceMuted) {
              const warningMsg =
                language === 'hi'
                  ? 'घोलने के चक्र में एक मिनट बचा है।'
                  : language === 'mr'
                  ? 'ढवळण्याच्या चक्रात एक मिनिट शिल्लक आहे.'
                  : 'One minute remaining in stirring cycle.';
              speakFeedback(warningMsg, language);
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerIntervalRef.current);
    }

    return () => clearInterval(timerIntervalRef.current);
  }, [isRunning, voiceMuted, language]);

  const handleFinish = () => {
    playAudioChime('finish');
    if (!voiceMuted) {
      const finishMsg =
        language === 'hi'
          ? 'घोलने का चक्र पूरा हो गया है। पॉट लाइफ खत्म होने से पहले रेजिन को मोल्ड में डालें।'
          : language === 'mr'
          ? 'ढवळण्याचे चक्र पूर्ण झाले आहे. पॉट लाइफ संपण्यापूर्वी रेझिन मोल्डमध्ये ओता.'
          : 'Stirring cycle complete. Pour resin into mold before pot life expires.';
      speakFeedback(finishMsg, language);
    }
    addToast('⏱️ Resin stirring cycle completed!', 'success');
    if (onTimerComplete) {
      onTimerComplete(totalSeconds);
    }
  };

  const triggerStartWithVoiceoverPrompt = (seconds: number) => {
    setTotalSeconds(seconds);
    setRemainingSeconds(seconds);
    setIsRunning(true);
    playAudioChime('start');

    if (!voiceMuted) {
      const mins = Math.floor(seconds / 60);
      let promptText = '';
      if (language === 'hi') {
        promptText = `${mins > 0 ? `${mins} मिनट` : `${seconds} सेकंड`} का घोलने का टाइमर शुरू हो रहा है। क्या आप कोई निर्देश या बैच नोट दर्ज करना चाहते हैं?`;
      } else if (language === 'mr') {
        promptText = `${mins > 0 ? `${mins} मिनिटांचा` : `${seconds} सेकंदांचा`} ढवळण्याचा टायमर सुरू होत आहे. तुम्हाला काही खास सूचना किंवा बॅच नोंद करायची आहे का?`;
      } else {
        promptText = `Starting ${mins > 0 ? `${mins} minute` : `${seconds} second`} stirring timer. Do you have any custom instructions or batch notes you want to note down?`;
      }

      speakFeedback(
        promptText,
        language,
        () => {
          // Auto-activate microphone to listen for note response
          if (recognitionRef.current && !isListening) {
            try {
              setIsPromptingNotes(true);
              recognitionRef.current.start();
            } catch (e) {}
          }
        }
      );
    }
  };

  const handleVoiceCommand = (transcript: string) => {
    const text = transcript.toLowerCase();

    // If currently prompting for batch notes or user is giving instructions
    if (
      isPromptingNotes ||
      text.startsWith('yes') ||
      text.startsWith('हाँ') ||
      text.startsWith('होय') ||
      text.includes('pigment') ||
      text.includes('poured') ||
      text.includes('used') ||
      text.includes('इस्तेमाल') ||
      text.includes('वापरले') ||
      text.includes('डाला') ||
      text.includes('ओतले') ||
      text.includes('order') ||
      text.includes('ऑर्डर')
    ) {
      const pouredMatch = text.match(/(?:poured|used|consumed|deduct|इस्तेमाल|वापरले|डाला|ओतले)\s*(\d+(?:\.\d+)?)\s*(?:g|gm|gram|grams|ग्राम|ग्रॅम)?/i);
      const stockGrams = pouredMatch ? parseFloat(pouredMatch[1]) : 0;

      addNote({
        content: transcript,
        rawResinGramsDeducted: stockGrams,
      });

      if (stockGrams > 0) {
        deductBatchStock({
          totalGrams: stockGrams,
          productName: text.includes('coaster') || text.includes('कोस्टर') ? 'Coaster' : text.includes('tray') || text.includes('ट्रे') ? 'Tray' : 'Workshop Pour',
          batchNotes: transcript,
        });
      }

      setIsPromptingNotes(false);
      playAudioChime('success');
      if (!voiceMuted) {
        let noteConfirm = '';
        if (language === 'hi') {
          noteConfirm = stockGrams > 0
            ? `नोट सहेजा गया और गोदाम से ${stockGrams} ग्राम रेजिन घटा दिया गया।`
            : 'नोट दर्ज करके कार्यशाला नोटपैड में सहेज लिया गया।';
        } else if (language === 'mr') {
          noteConfirm = stockGrams > 0
            ? `नोंद सेव्ह केली आणि गोदामातून ${stockGrams} ग्रॅम रेझिन वजा केले.`
            : 'नोंद स्टुडिओ नोटपॅडमध्ये सेव्ह केली आहे.';
        } else {
          noteConfirm = stockGrams > 0
            ? `Noted down and deducted ${stockGrams} grams resin from warehouse inventory.`
            : 'Note recorded and saved to workshop notepad.';
        }
        speakFeedback(noteConfirm, language);
      }
      addToast(
        stockGrams > 0
          ? `📝 Note saved & ${stockGrams}g resin deducted from warehouse inventory`
          : '📝 Batch note recorded to Workshop Notepad',
        'success'
      );
      return;
    }

    const intent = parseVoiceIntent(transcript, language);

    if (intent.type === 'TIMER_START') {
      const sec = intent.payload?.seconds || 180;
      triggerStartWithVoiceoverPrompt(sec);
      addToast(`🎙️ Voice Command: ${intent.responseMessage}`, 'info');
    } else if (intent.type === 'TIMER_PAUSE') {
      setIsRunning(false);
      playAudioChime('alert');
      if (!voiceMuted) speakFeedback(intent.responseMessage, language);
      addToast('🎙️ Timer paused by voice', 'info');
    } else if (intent.type === 'TIMER_RESUME') {
      setIsRunning(true);
      playAudioChime('start');
      if (!voiceMuted) speakFeedback(intent.responseMessage, language);
      addToast('🎙️ Timer resumed by voice', 'info');
    } else if (intent.type === 'TIMER_RESET') {
      setIsRunning(false);
      setRemainingSeconds(totalSeconds);
      playAudioChime('alert');
      if (!voiceMuted) speakFeedback(intent.responseMessage, language);
      addToast('🎙️ Timer reset by voice', 'info');
    } else if (intent.type === 'TIMER_ADD') {
      const addSec = intent.payload?.seconds || 60;
      setRemainingSeconds((prev) => prev + addSec);
      setTotalSeconds((prev) => prev + addSec);
      playAudioChime('success');
      if (!voiceMuted) speakFeedback(intent.responseMessage);
      addToast(`🎙️ ${intent.responseMessage}`, 'info');
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      addToast('Speech Recognition not supported in this browser. Please use Chrome or Edge.', 'warning');
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
      } catch (e) {
        setIsListening(false);
      }
    }
  };

  const startTimerWithPreset = (seconds: number) => {
    triggerStartWithVoiceoverPrompt(seconds);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = totalSeconds > 0 ? ((totalSeconds - remainingSeconds) / totalSeconds) * 100 : 0;

  return (
    <div className={`p-6 sm:p-7 rounded-3xl bg-white border border-art-800 shadow-sm space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b border-art-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-brand-50 text-brand-700 border border-brand-200">
            <Timer className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-art-300">
              Hands-Free Resin Stirring Timer
            </h3>
            <p className="text-xs text-art-500">
              Voice-controlled timer for glove-friendly epoxy mixing & pot-life tracking
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Voice Mute Toggle */}
          <button
            onClick={() => setVoiceMuted(!voiceMuted)}
            className={`p-2 rounded-xl border transition-all ${
              voiceMuted
                ? 'bg-art-900 border-art-800 text-art-500'
                : 'bg-brand-50 border-brand-200 text-brand-700'
            }`}
            title={voiceMuted ? 'Voice feedback muted' : 'Voice feedback active'}
          >
            {voiceMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Hands-Free Voice Mic Toggle */}
          <button
            onClick={toggleListening}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isListening
                ? 'bg-rose-500 text-white shadow-md animate-pulse ring-4 ring-rose-500/20'
                : 'bg-brand-500 hover:bg-brand-600 text-white shadow-sm glow-gold'
            }`}
          >
            {isListening ? <Mic className="w-3.5 h-3.5 animate-bounce" /> : <Mic className="w-3.5 h-3.5" />}
            <span>{isListening ? 'Listening...' : 'Voice Mic'}</span>
          </button>
        </div>
      </div>

      {/* Real-time Voice Transcript Pill */}
      {isListening && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-2xl bg-gradient-to-r from-brand-50 via-rose-50 to-plum-50 border border-brand-200 text-xs flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span className="font-semibold text-art-400">
              {lastSpokenText ? `Heard: "${lastSpokenText}"` : 'Say "Hey Partner, start timer 3 minutes" or "Hey Partner, pause"...'}
            </span>
          </div>
          <span className="text-[10px] font-bold text-brand-700 uppercase tracking-widest font-mono">
            ASR Active
          </span>
        </motion.div>
      )}

      {/* Main Countdown Display with Progress Ring */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-2">
        <div className="relative w-44 h-44 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Background Circle */}
            <circle
              cx="50"
              cy="50"
              r="42"
              className="stroke-art-900"
              strokeWidth="7"
              fill="transparent"
            />
            {/* Progress Circle */}
            <circle
              cx="50"
              cy="50"
              r="42"
              className="transition-all duration-300 ease-linear"
              stroke={
                remainingSeconds <= 30
                  ? '#E11D48'
                  : isRunning
                  ? '#F59010'
                  : '#B45309'
              }
              strokeWidth="7"
              strokeDasharray={264}
              strokeDashoffset={264 - (264 * progressPercent) / 100}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Time in center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <div
              className={`text-3xl font-black font-mono tracking-tight ${
                remainingSeconds <= 30 ? 'text-rose-600 animate-pulse' : 'text-art-300'
              }`}
            >
              {formatTime(remainingSeconds)}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-art-500 mt-0.5">
              {isRunning ? 'Stirring...' : remainingSeconds === 0 ? 'Completed' : 'Paused'}
            </span>
          </div>
        </div>

        {/* Manual Timer Controls */}
        <div className="space-y-3 w-full sm:w-56">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`flex-1 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all ${
                isRunning
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-brand-500 hover:bg-brand-600 text-white glow-brand'
              }`}
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              <span>{isRunning ? 'Pause' : 'Start Timer'}</span>
            </button>

            <button
              onClick={() => {
                setIsRunning(false);
                setRemainingSeconds(totalSeconds);
                playAudioChime('alert');
              }}
              className="p-3 rounded-2xl bg-art-900 hover:bg-art-850 text-art-500 hover:text-art-300 border border-art-800 transition-colors"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setRemainingSeconds((prev) => prev + 60);
                setTotalSeconds((prev) => prev + 60);
                playAudioChime('tick');
              }}
              className="p-3 rounded-2xl bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 text-xs font-bold transition-colors"
              title="Add 1 minute"
            >
              +1m
            </button>
          </div>

          <div className="p-3 rounded-2xl bg-art-950 border border-art-800 text-[11px] space-y-1 text-art-500">
            <div className="flex items-center gap-1.5 font-bold text-art-300">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>Voice Stirring Tips:</span>
            </div>
            <p>Stir slowly in one direction to minimize micro-bubbles and ensure 100% molecular bonding.</p>
          </div>
        </div>
      </div>

      {/* Preset Quick Start Buttons */}
      <div className="space-y-2 pt-2 border-t border-art-800">
        <span className="text-[10px] font-bold text-art-500 uppercase tracking-wider">
          Quick Studio Presets
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {PRESETS.map((preset) => (
            <button
              key={preset.seconds}
              onClick={() => startTimerWithPreset(preset.seconds)}
              className="p-3 rounded-2xl bg-art-950 hover:bg-brand-50/50 hover:border-brand-500/40 border border-art-800 text-left transition-all group"
            >
              <div className="text-sm mb-1">{preset.icon}</div>
              <div className="text-xs font-bold text-art-300 group-hover:text-brand-700">
                {preset.label}
              </div>
              <div className="text-[10px] text-art-500 truncate">{preset.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
