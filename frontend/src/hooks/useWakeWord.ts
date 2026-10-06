import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  isSpeechRecognitionSupported,
  playAudioChime,
  speakFeedback,
  parseVoiceIntent,
  extractWakeWordCommand,
} from '../services/speechService';
import { useVoiceStore } from '../store/useVoiceStore';
import { useToastStore } from '../store/useToastStore';
import { useStudioNoteStore } from '../store/useStudioNoteStore';
import { useRecipeStore } from '../store/useRecipeStore';
import { useBatchCureStore } from '../store/useBatchCureStore';
import { getStudioClimate, calculateCureCompensation } from '../services/climateService';

export const useWakeWord = () => {
  const navigate = useNavigate();
  const { addToast } = useToastStore();
  const {
    language,
    setLanguage,
    isWakeWordListening,
    isAssistantOpen,
    openAssistant,
    showHUD,
    clearHUD,
    setLastWakeTranscript,
    emitTimerEvent,
  } = useVoiceStore();
  const {
    addNote,
    deductBatchStock,
    getLatestNote,
    openNotepad,
    openGuideModal,
  } = useStudioNoteStore();

  const recognitionRef = useRef<any>(null);
  const isStoppingIntentionally = useRef(false);
  const restartTimerRef = useRef<any>(null);
  const lastProcessedTimeRef = useRef<number>(0);

  const handleWakeCommand = useCallback(
    (transcript: string) => {
      // Avoid processing duplicate events within 800ms
      const now = Date.now();
      if (now - lastProcessedTimeRef.current < 800) return;

      // Do not process speech recognition while TTS is actively talking back
      if (typeof window !== 'undefined' && window.speechSynthesis?.speaking) {
        return;
      }

      const wakeResult = extractWakeWordCommand(transcript);
      if (!wakeResult.hasWakeWord) return;

      lastProcessedTimeRef.current = now;
      setLastWakeTranscript(transcript);

      // 1. If user just said the wake word alone (e.g. "Hey Partner" / "हे पार्टनर")
      if (wakeResult.isWakeOnly) {
        playAudioChime('wake');
        showHUD({
          text: `🎙️ "${wakeResult.wakeWord}" Detected`,
          subtext:
            language === 'hi'
              ? 'स्टूडियो सहायक सुन रहा है...'
              : language === 'mr'
              ? 'स्टुडिओ सहाय्यक ऐकत आहे...'
              : 'Studio assistant listening for your command...',
          intent: 'WAKE_ACTIVE',
        });
        openAssistant();
        const wakeGreeting =
          language === 'hi'
            ? 'हाँ पार्टनर, मैं सुन रहा हूँ। मैं आपकी क्या मदद कर सकता हूँ?'
            : language === 'mr'
            ? 'होय पार्टनर, मी ऐकत आहे. मी तुम्हाला कशी मदत करू?'
            : "Yes partner, I'm listening. How can I help you?";
        speakFeedback(wakeGreeting, language);
        return;
      }

      // 2. User spoke wake word + command together
      playAudioChime('wake');
      const intent = parseVoiceIntent(wakeResult.commandText, language);

      // Handle Timer intents
      if (intent.type === 'TIMER_START') {
        const seconds = intent.payload?.seconds || 180;
        emitTimerEvent('start', seconds);
        showHUD({
          text: `⏱️ Timer: ${Math.floor(seconds / 60)}m ${seconds % 60 ? `${seconds % 60}s` : ''}`,
          subtext: intent.responseMessage,
          intent: intent.type,
        });
        speakFeedback(intent.responseMessage, language);
      } else if (intent.type === 'TIMER_PAUSE') {
        emitTimerEvent('pause');
        showHUD({
          text: '⏱️ Timer Paused',
          subtext: intent.responseMessage,
          intent: intent.type,
        });
        speakFeedback(intent.responseMessage, language);
      } else if (intent.type === 'TIMER_RESUME') {
        emitTimerEvent('resume');
        showHUD({
          text: '⏱️ Timer Resumed',
          subtext: intent.responseMessage,
          intent: intent.type,
        });
        speakFeedback(intent.responseMessage, language);
      } else if (intent.type === 'TIMER_RESET') {
        emitTimerEvent('reset');
        showHUD({
          text: '⏱️ Timer Reset',
          subtext: intent.responseMessage,
          intent: intent.type,
        });
        speakFeedback(intent.responseMessage, language);
      } else if (intent.type === 'TIMER_ADD') {
        const sec = intent.payload?.seconds || 60;
        emitTimerEvent('add', sec);
        showHUD({
          text: `⏱️ +${sec}s Added`,
          subtext: intent.responseMessage,
          intent: intent.type,
        });
        speakFeedback(intent.responseMessage, language);
      }
      // Handle Workshop Note & To-Do Intents
      else if (intent.type === 'NOTE_CREATE') {
        const stockGrams = intent.payload?.rawResinGramsDeducted || 0;
        addNote({
          content: intent.payload?.content || wakeResult.commandText,
          rawResinGramsDeducted: stockGrams,
        });

        if (stockGrams > 0) {
          deductBatchStock({
            totalGrams: stockGrams,
            productName: 'Workshop Batch',
            batchNotes: intent.payload?.content,
          });
        }

        showHUD({
          text: stockGrams > 0 ? `📝 Note & -${stockGrams}g Stock` : `📝 Note Saved`,
          subtext: intent.payload?.content || intent.responseMessage,
          intent: intent.type,
        });
        speakFeedback(intent.responseMessage, language);
      } else if (intent.type === 'NOTE_TODO') {
        addNote({
          content: intent.payload?.content || wakeResult.commandText,
          title: intent.payload?.title || 'Workshop Task',
          category: 'todo',
        });
        showHUD({
          text: `📋 Task Added`,
          subtext: intent.payload?.content,
          intent: intent.type,
        });
        speakFeedback(intent.responseMessage, language);
      } else if (intent.type === 'NOTE_READ_LAST') {
        const latest = getLatestNote();
        if (latest) {
          showHUD({
            text: `📝 Latest: "${latest.title}"`,
            subtext: latest.content,
            intent: intent.type,
          });
          const prefix =
            language === 'hi'
              ? 'आपकी पिछली दर्ज की गई नोट है: '
              : language === 'mr'
              ? 'तुमची शेवटची नोंद आहे: '
              : 'Your latest studio note is: ';
          speakFeedback(`${prefix} ${latest.content}`, language);
        } else {
          const emptyMsg =
            language === 'hi'
              ? 'पार्टनर, अभी तक कोई नोट दर्ज नहीं किया गया है।'
              : language === 'mr'
              ? 'पार्टनर, अद्याप कोणतीही नोंद केलेली नाही.'
              : "You don't have any saved studio notes yet, partner.";
          speakFeedback(emptyMsg, language);
        }
      } else if (intent.type === 'NOTE_OPEN') {
        openNotepad();
        showHUD({
          text: `📝 Studio Notepad`,
          subtext: intent.responseMessage,
          intent: intent.type,
        });
        speakFeedback(intent.responseMessage, language);
      } else if (intent.type === 'GUIDE_OPEN') {
        openGuideModal();
        showHUD({
          text: `📖 12-Step Process Guide`,
          subtext: intent.responseMessage,
          intent: intent.type,
        });
        speakFeedback(intent.responseMessage, language);
      } else if (intent.type === 'STOCK_DEDUCT') {
        const grams = intent.payload?.totalGrams || 0;
        const product = intent.payload?.productName || 'Workshop Batch';
        const materialCost = intent.payload?.materialCost || Math.round(grams * 0.8 * 100) / 100;
        const partA = intent.payload?.partA || Number(((grams * 2) / 3).toFixed(1));
        const partB = intent.payload?.partB || Number(((grams * 1) / 3).toFixed(1));

        // 1. Deduct stock from warehouse
        deductBatchStock({
          totalGrams: grams,
          productName: product,
          batchNotes: wakeResult.commandText,
        });

        // 2. Automatically log to Studio Notepad with investment cost & formula breakdown
        addNote({
          title: `Batch Pour: ${grams}g Resin (${product})`,
          content: `${wakeResult.commandText}\n• Ratio Breakdown: ${partA}g Part A + ${partB}g Part B\n• Material Investment: ₹${materialCost.toFixed(2)} (@ ₹0.80/g)\n• Auto-deducted from warehouse inventory.`,
          category: 'formula',
          productType: product,
          rawResinGramsDeducted: grams,
          materialCost: materialCost,
        });

        showHUD({
          text: `📦 -${grams}g Stock (₹${materialCost.toFixed(0)})`,
          subtext: `Deducted from warehouse & saved to notepad for ${product}.`,
          intent: intent.type,
        });
        speakFeedback(intent.responseMessage, language);
      } else if (intent.type === 'RECIPE_CONSUME') {
        const { recipeSlug, productType, units, targetProductName } = intent.payload || {};
        const { consumeRecipe } = useRecipeStore.getState();
        consumeRecipe({ recipeSlug, productType, units, batchNotes: wakeResult.commandText }).then((res) => {
          if (res && res.success) {
            const cost = res.data?.totalMaterialCost || 0;
            const itemsCount = res.data?.deductedItems?.length || 0;
            showHUD({
              text: `📋 ${units}x ${targetProductName} Deducted`,
              subtext: `${itemsCount} materials deducted (₹${cost} investment).`,
              intent: intent.type,
            });
            const spokenMsg =
              language === 'hi'
                ? `${units}x ${targetProductName} के सभी ${itemsCount} घटक गोदाम से घटा दिए गए हैं। कुल लागत ₹${cost} है।`
                : language === 'mr'
                ? `${units}x ${targetProductName} चे सर्व ${itemsCount} साहित्य गोदामातून वजा झाले आहे. एकूण गुंतवणूक ₹${cost} आहे.`
                : `Deducted all ${itemsCount} materials for ${units}x ${targetProductName} from warehouse. Total material investment: ₹${cost}.`;
            speakFeedback(spokenMsg, language);
          }
        });
      } else if (intent.type === 'BATCH_START') {
        const { startBatch, openTrackerModal } = useBatchCureStore.getState();
        const newBatch = startBatch({
          batchNumber: intent.payload?.batchNumber,
          productName: intent.payload?.productName || 'Workshop Resin Batch',
          productType: intent.payload?.productType || 'general',
          resinGrams: intent.payload?.resinGrams || 350,
          notes: intent.payload?.notes || wakeResult.commandText,
        });

        showHUD({
          text: `⏱️ Batch ${newBatch.batchNumber} Started`,
          subtext: `${newBatch.productName} · Gel in 45m · Demold in ${newBatch.targetDemoldHours}h`,
          intent: intent.type,
        });

        openTrackerModal();
        speakFeedback(intent.responseMessage, language);
      } else if (intent.type === 'BATCH_STATUS') {
        const { getActiveBatches, openTrackerModal } = useBatchCureStore.getState();
        const active = getActiveBatches();
        openTrackerModal();

        if (active.length > 0) {
          const first = active[0];
          showHUD({
            text: `⏱️ ${active.length} Active Curing Batches`,
            subtext: `${first.batchNumber}: ${first.productName} (Demold in ${first.targetDemoldHours}h)`,
            intent: intent.type,
          });

          const statusMsg =
            language === 'hi'
              ? `वर्कशॉप में कुल ${active.length} क्योरिंग बैच सक्रिय हैं। बैच ${first.batchNumber} का डिमोल्ड समय ${first.targetDemoldHours} घंटे निर्धारित है।`
              : language === 'mr'
              ? `स्टुडिओमध्ये एकूण ${active.length} क्युरिंग बॅचेस सक्रिय आहेत. बॅच ${first.batchNumber} चा डिमोल्ड वेळ ${first.targetDemoldHours} तास आहे.`
              : `You have ${active.length} active curing batches in the workshop. Batch ${first.batchNumber} for ${first.productName} is currently tracking.`;

          speakFeedback(statusMsg, language);
        } else {
          showHUD({
            text: `⏱️ No Active Batches`,
            subtext: `Say "Started batch for clock" to begin tracking.`,
            intent: intent.type,
          });

          const emptyMsg =
            language === 'hi'
              ? 'वर्तमान में कोई सक्रिय क्योरिंग बैच नहीं है। नया बैच शुरू करने के लिए कहें: नया बैच शुरू किया।'
              : language === 'mr'
              ? 'सध्या कोणतीही सक्रिय क्युरिंग बॅच नाही. नवीन बॅच सुरू करण्यासाठी सांगा: नवीन बॅच सुरू केली.'
              : 'There are currently no active resin curing batches tracking in the workshop.';

          speakFeedback(emptyMsg, language);
        }
      } else if (intent.type === 'CLIMATE_CHECK') {
        const climate = getStudioClimate();
        const guidance = calculateCureCompensation(climate.temperatureC, climate.humidityPercent);
        showHUD({
          text: `🌡️ ${climate.temperatureC}°C | ${climate.humidityPercent}% RH`,
          subtext: `Demold in ${guidance.demoldHours}h (Pot Life: ${guidance.potLifeMinutes}m)`,
          intent: intent.type,
        });
        const spokenMsg =
          language === 'hi'
            ? `स्टूडियो का तापमान ${climate.temperatureC}°C और आर्द्रता ${climate.humidityPercent}% है। डिमोल्ड का अनुमानित समय ${guidance.demoldHours} घंटे है।`
            : language === 'mr'
            ? `स्टुडिओचे तापमान ${climate.temperatureC}°C आणि आर्द्रता ${climate.humidityPercent}% आहे. डिमोल्डचा अंदाजे वेळ ${guidance.demoldHours} तास आहे.`
            : `Studio temperature is ${climate.temperatureC}°C with ${climate.humidityPercent}% humidity. Recommended demold time is ${guidance.demoldHours} hours.`;
        speakFeedback(spokenMsg, language);
      } else if (intent.type === 'INVOICE_OPEN') {
        showHUD({
          text: `📄 Opening PDF Invoice Generator`,
          subtext: intent.responseMessage,
          intent: intent.type,
        });
        speakFeedback(intent.responseMessage, language);
        navigate('/admin/pricing-calculator?openInvoice=true');
      } else if (intent.type === 'CALC_QUOTE') {
        const product = intent.payload?.productName || 'Custom Art Piece';
        showHUD({
          text: `💰 Quote for ${product}`,
          subtext: intent.responseMessage,
          intent: intent.type,
        });
        speakFeedback(intent.responseMessage, language);
        navigate(`/admin/pricing-calculator?product=${encodeURIComponent(product)}`);
      }
      // Handle Calculation intents
      else if (intent.type === 'CALC_WEIGHT' || intent.type === 'CALC_RECT' || intent.type === 'CALC_CIRCLE') {
        showHUD({
          text: `🧪 Resin Formula Calculated`,
          subtext: intent.responseMessage,
          intent: intent.type,
        });
        speakFeedback(intent.responseMessage, language);
        navigate('/admin/resin-calculator');
      }
      // Handle Export to Pricing
      else if (intent.type === 'EXPORT_PRICING') {
        showHUD({
          text: `💰 Exporting to Pricing`,
          subtext: intent.responseMessage,
          intent: intent.type,
        });
        speakFeedback(intent.responseMessage, language);
        navigate('/admin/pricing-calculator');
      }
      // Handle Navigation intents
      else if (intent.type === 'NAVIGATE' && intent.payload?.path) {
        showHUD({
          text: `🧭 Opening Studio Route`,
          subtext: intent.responseMessage,
          intent: intent.type,
        });
        speakFeedback(intent.responseMessage, language);
        navigate(intent.payload.path);
      }
      // Handle Voice Language Switching
      else if (intent.type === 'LANGUAGE_SWITCH') {
        const targetLang = intent.payload?.language || 'en';
        setLanguage(targetLang);
        playAudioChime('success');
        const langName =
          targetLang === 'hi'
            ? 'हिंदी (Hindi)'
            : targetLang === 'mr'
            ? 'मराठी (Marathi)'
            : 'English';
        showHUD({
          text: `🌐 Language: ${langName}`,
          subtext: intent.responseMessage,
          intent: intent.type,
        });
        speakFeedback(intent.responseMessage, targetLang);
        addToast(`🌐 Language switched to ${langName}`, 'success');
      }
      // Other / Unknown intent
      else {
        showHUD({
          text: `🎙️ "${wakeResult.commandText}"`,
          subtext: intent.responseMessage,
          intent: 'UNKNOWN',
        });
        speakFeedback(intent.responseMessage, language);
      }
    },
    [
      language,
      setLanguage,
      addToast,
      emitTimerEvent,
      navigate,
      openAssistant,
      setLastWakeTranscript,
      showHUD,
      addNote,
      openNotepad,
      openGuideModal,
      getLatestNote,
      deductBatchStock,
    ]
  );

  const handleWakeCommandRef = useRef(handleWakeCommand);
  handleWakeCommandRef.current = handleWakeCommand;

  // Initialize and maintain ambient wake word listener
  useEffect(() => {
    if (!isSpeechRecognitionSupported()) return;

    // Do not run background wake-word listener if assistant modal is open (to avoid double recognition)
    if (isAssistantOpen || !isWakeWordListening) {
      if (recognitionRef.current) {
        isStoppingIntentionally.current = true;
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      return;
    }

    isStoppingIntentionally.current = false;
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognizer = new SpeechRecognitionClass();

    recognizer.continuous = true;
    recognizer.interimResults = true;
    recognizer.lang = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-IN';

    recognizer.onresult = (event: any) => {
      let fullTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        fullTranscript += event.results[i][0].transcript;
      }
      fullTranscript = fullTranscript.trim();
      if (fullTranscript) {
        handleWakeCommandRef.current(fullTranscript);
      }
    };

    recognizer.onerror = (err: any) => {
      if (err.error === 'not-allowed' || err.error === 'service-not-allowed') {
        isStoppingIntentionally.current = true;
        clearTimeout(restartTimerRef.current);
        console.warn('Microphone permission not granted. Allow mic access in browser settings to use "Hey Partner" voice commands.');
      }
    };

    recognizer.onend = () => {
      // Automatically restart continuous listening if ambient mode is active and not stopped by permission error
      if (!isStoppingIntentionally.current && isWakeWordListening && !isAssistantOpen) {
        clearTimeout(restartTimerRef.current);
        restartTimerRef.current = setTimeout(() => {
          if (!isStoppingIntentionally.current) {
            try {
              recognizer.start();
            } catch (e) {}
          }
        }, 300);
      }
    };

    try {
      recognizer.start();
    } catch (e) {}

    recognitionRef.current = recognizer;

    return () => {
      isStoppingIntentionally.current = true;
      clearTimeout(restartTimerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, [language, isAssistantOpen, isWakeWordListening]);
};
