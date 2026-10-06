import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  Timer,
  Calculator,
  Compass,
  CheckCircle2,
  ArrowRight,
  Radio,
  Layers,
} from 'lucide-react';
import {
  isSpeechRecognitionSupported,
  playAudioChime,
  speakFeedback,
  parseVoiceIntent,
  VoiceIntent,
} from '../../services/speechService';
import { useToastStore } from '../../store/useToastStore';

interface AdminVoiceAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminVoiceAssistant: React.FC<AdminVoiceAssistantProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { addToast } = useToastStore();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastIntent, setLastIntent] = useState<VoiceIntent | null>(null);
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [activeTab, setActiveTab] = useState<'assistant' | 'commands'>('assistant');

  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && isSpeechRecognitionSupported()) {
      const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognizer = new SpeechRecognitionClass();
      recognizer.continuous = true;
      recognizer.interimResults = true;
      recognizer.lang = 'en-IN';

      recognizer.onstart = () => {
        setIsListening(true);
        playAudioChime('start');
      };

      recognizer.onend = () => {
        setIsListening(false);
      };

      recognizer.onresult = (event: any) => {
        let currentText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript;
        }
        setTranscript(currentText);

        // Process finalized result
        const isFinal = event.results[event.results.length - 1].isFinal;
        if (isFinal && currentText.trim()) {
          handleVoiceCommand(currentText);
        }
      };

      recognizer.onerror = (err: any) => {
        console.warn('SpeechRecognition error in assistant:', err);
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
  }, []);

  // Automatically start listening when modal opens
  useEffect(() => {
    if (isOpen && recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (e) {}
    } else if (!isOpen && recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
  }, [isOpen]);

  const handleVoiceCommand = (text: string) => {
    const intent = parseVoiceIntent(text);
    setLastIntent(intent);

    playAudioChime(intent.type !== 'UNKNOWN' ? 'success' : 'alert');

    if (!voiceMuted) {
      speakFeedback(intent.responseMessage);
    }

    addToast(`🎙️ ${intent.responseMessage}`, intent.type !== 'UNKNOWN' ? 'success' : 'info');

    // Handle Navigation Intent
    if (intent.type === 'NAVIGATE' && intent.payload?.path) {
      setTimeout(() => {
        navigate(intent.payload.path);
        onClose();
      }, 800);
    }

    // Handle Resin Calculation Route Jump
    if (intent.type === 'CALC_WEIGHT' || intent.type === 'CALC_RECT' || intent.type === 'CALC_CIRCLE') {
      setTimeout(() => {
        navigate('/admin/resin-calculator');
      }, 1000);
    }

    if (intent.type === 'EXPORT_PRICING') {
      setTimeout(() => {
        navigate('/admin/pricing-calculator');
        onClose();
      }, 800);
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

  const executeSampleCommand = (command: string) => {
    setTranscript(command);
    handleVoiceCommand(command);
  };

  const sampleCommands = [
    { label: 'Start 3 Min Timer', query: 'Hey Partner, start timer for 3 minutes', icon: '⏱️' },
    { label: 'Calculate 300g Resin', query: 'Hey Partner, calculate 300 grams resin', icon: '🧪' },
    { label: 'Rectangle Mold 20×15×2', query: 'Hey Partner, calculate rectangle mold 20 by 15 by 2', icon: '📐' },
    { label: 'Circle Mold Ø 15cm', query: 'Hey Partner, calculate circle mold diameter 15 depth 1', icon: '⭕' },
    { label: 'Go to Warehouse', query: 'Hey Partner, go to warehouse inventory', icon: '📦' },
    { label: 'Go to Pricing', query: 'Hey Partner, open product pricing', icon: '💰' },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-art-300/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-lg bg-white rounded-3xl border border-art-800 shadow-2xl overflow-hidden flex flex-col font-poppins"
        >
          {/* Top Decorative Gradient Bar */}
          <div className="h-1 bg-gradient-to-r from-brand-500 via-rose-500 to-plum-600" />

          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-art-800 bg-art-950/50">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-brand-50 text-brand-700 border border-brand-200">
                <Radio className="w-4 h-4 text-brand-600 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-art-300">
                  Admin "Hey Partner" Voice Assistant
                </h3>
                <p className="text-[11px] text-art-500">
                  Say "Hey Partner" anytime to trigger timers, resin mixing ratios & warehouse navigation
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setVoiceMuted(!voiceMuted)}
                className={`p-2 rounded-xl border transition-all ${
                  voiceMuted
                    ? 'bg-art-900 border-art-800 text-art-500'
                    : 'bg-brand-50 border-brand-200 text-brand-700'
                }`}
                title={voiceMuted ? 'Muted voice output' : 'Voice output active'}
              >
                {voiceMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-art-500 hover:text-art-300 hover:bg-art-900 border border-art-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Voice Waveform & Microphone Status */}
          <div className="p-6 flex flex-col items-center justify-center text-center space-y-5 bg-gradient-to-b from-white to-art-950/40">
            {/* Animated Mic Button */}
            <div className="relative">
              {isListening && (
                <>
                  <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-full bg-rose-500/20"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.8, 0.2, 0.8] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute -inset-2 rounded-full bg-brand-500/20"
                  />
                </>
              )}

              <button
                onClick={toggleListening}
                className={`relative w-20 h-20 rounded-full flex items-center justify-center text-white shadow-xl transition-all ${
                  isListening
                    ? 'bg-gradient-to-tr from-rose-500 to-brand-500 animate-pulse glow-brand'
                    : 'bg-art-900 text-art-500 hover:text-art-300 border border-art-800'
                }`}
              >
                {isListening ? <Mic className="w-8 h-8 text-white" /> : <MicOff className="w-8 h-8 text-art-500" />}
              </button>
            </div>

            {/* Live Audio Visualizer Bars */}
            {isListening ? (
              <div className="flex items-center gap-1.5 h-6">
                {[40, 70, 90, 60, 100, 75, 45, 80, 50].map((h, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: ['20%', `${h}%`, '20%'] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.08,
                      ease: 'easeInOut',
                    }}
                    className="w-1 rounded-full bg-brand-500"
                  />
                ))}
              </div>
            ) : (
              <div className="text-xs text-art-500 font-medium">Click microphone to start listening</div>
            )}

            {/* Live Transcript Display */}
            <div className="w-full p-4 rounded-2xl bg-white border border-art-800 shadow-sm min-h-[70px] flex items-center justify-center text-center">
              {transcript ? (
                <p className="text-sm font-semibold text-art-300 italic">"{transcript}"</p>
              ) : (
                <p className="text-xs text-art-500">
                  Say clearly: <span className="font-semibold text-brand-700 font-mono">"Hey Partner, start timer 3 minutes"</span>, <span className="font-semibold text-brand-700 font-mono">"Hey Partner, calculate 300g resin"</span>, or <span className="font-semibold text-brand-700 font-mono">"Hey Partner, open warehouse"</span>...
                </p>
              )}
            </div>

            {/* Last Recognized Intent Action Result */}
            {lastIntent && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full p-3.5 rounded-2xl bg-brand-50 border border-brand-200 text-left text-xs space-y-1"
              >
                <div className="flex items-center gap-1.5 font-bold text-brand-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
                  <span>Voice Intent: {lastIntent.type.replace('_', ' ')}</span>
                </div>
                <p className="text-art-400">{lastIntent.responseMessage}</p>
              </motion.div>
            )}
          </div>

          {/* Quick-Click Command Badges */}
          <div className="p-6 border-t border-art-800 bg-art-950/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-art-500 uppercase tracking-wider">
                Hands-Free Studio Voice Prompts
              </span>
              <span className="text-[10px] text-brand-700 font-semibold font-mono">1-Click Test</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {sampleCommands.map((cmd) => (
                <button
                  key={cmd.label}
                  onClick={() => executeSampleCommand(cmd.query)}
                  className="p-2.5 rounded-xl bg-white hover:bg-brand-50 hover:border-brand-500/30 border border-art-800 text-left transition-all text-xs flex items-center gap-2 group shadow-sm"
                >
                  <span className="text-sm">{cmd.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-art-300 group-hover:text-brand-700 truncate">
                      {cmd.label}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
