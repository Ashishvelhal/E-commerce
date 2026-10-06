/**
 * Vosk Offline Speech Recognition Engine Service
 * Loads open-source WebAssembly ASR model with custom Studio Resin Grammar
 * Enables 100% free, offline, high-precision voice recognition for "Hey Partner",
 * grams, resin stock deductions, and studio commands.
 */

import { STUDIO_CUSTOM_GRAMMAR } from './speechService';

let voskModelInstance: any = null;
let isLoadingModel = false;

/**
 * Checks if Vosk WebAssembly Speech Recognition is supported and available in the browser.
 */
export const isVoskSupported = (): boolean => {
  return typeof window !== 'undefined' && typeof WebAssembly !== 'undefined';
};

/**
 * Initializes the Vosk WebAssembly Speech Recognition Model with Custom Studio Grammar.
 */
export const initVoskModel = async (modelUrl: string = '/models/vosk-model-small-en-in.tar.gz'): Promise<any> => {
  if (voskModelInstance) return voskModelInstance;
  if (isLoadingModel) return null;

  try {
    isLoadingModel = true;
    const Vosk = (await import('vosk-browser')).default || (window as any).Vosk;
    if (!Vosk || typeof Vosk.createModel !== 'function') {
      console.warn('Vosk-browser module not loaded, falling back to Web Speech ASR');
      isLoadingModel = false;
      return null;
    }

    console.log('⚡ Loading Vosk offline speech recognition model with studio grammar...');
    voskModelInstance = await Vosk.createModel(modelUrl);
    isLoadingModel = false;
    console.log('✅ Vosk offline speech model ready!');
    return voskModelInstance;
  } catch (err) {
    console.warn('Vosk model initialization notice (using Web Speech ASR fallback):', err);
    isLoadingModel = false;
    return null;
  }
};

/**
 * Creates a Vosk Recognizer configured with custom studio resin grammar.
 */
export const createVoskRecognizer = (model: any, sampleRate: number = 16000) => {
  if (!model) return null;
  try {
    const grammarJson = JSON.stringify(STUDIO_CUSTOM_GRAMMAR);
    const recognizer = new model.KaldiRecognizer(sampleRate, grammarJson);
    return recognizer;
  } catch (err) {
    console.warn('Could not create Vosk KaldiRecognizer with custom grammar:', err);
    return null;
  }
};
