/**
 * Workshop Climate & Epoxy Cure Compensator Service
 * Calculates real-time adjustments to resin pot life, demold time, and chemical cure based on workshop room temperature & humidity.
 */

export interface ClimateData {
  temperatureC: number;
  humidityPercent: number;
  city?: string;
  source: 'live_sensor' | 'weather_api' | 'manual_studio';
  lastUpdated: string;
}

export interface CureGuidance {
  potLifeMinutes: number;
  demoldHours: number;
  fullCureHours: number;
  status: 'optimal' | 'cold_risk' | 'heat_risk' | 'humidity_risk';
  statusLabel: { en: string; hi: string; mr: string };
  advice: { en: string; hi: string; mr: string };
  temperatureC: number;
  humidityPercent: number;
}

/**
 * Calculates chemical kinetics cure adjustment for 2-part epoxy resin systems
 */
export const calculateCureCompensation = (
  tempC: number,
  humidity: number
): CureGuidance => {
  // Base standards at 24°C & 45% relative humidity
  const BASE_POT_LIFE = 40; // minutes
  const BASE_DEMOLD = 24; // hours
  const BASE_FULL_CURE = 72; // hours

  // Temperature factor
  let potLife = BASE_POT_LIFE;
  let demold = BASE_DEMOLD;
  let fullCure = BASE_FULL_CURE;

  if (tempC < 16) {
    potLife = 60;
    demold = 48;
    fullCure = 120;
  } else if (tempC < 20) {
    potLife = 50;
    demold = 36;
    fullCure = 96;
  } else if (tempC <= 26) {
    // Optimal window
    potLife = 40;
    demold = 24;
    fullCure = 72;
  } else if (tempC <= 30) {
    potLife = 28;
    demold = 18;
    fullCure = 48;
  } else {
    // Hot >30°C
    potLife = 18;
    demold = 14;
    fullCure = 36;
  }

  // Determine status & multi-lingual advice
  let status: CureGuidance['status'] = 'optimal';
  let statusLabel = {
    en: 'Optimal Curing Conditions ✨',
    hi: 'उत्तम क्योरिंग वातावरण ✨',
    mr: 'उत्कृष्ट क्युरिंग वातावरण ✨',
  };
  let advice = {
    en: 'Room temperature & humidity are ideal (22-26°C). Expect crystal clear, bubble-free curing in 24 hours.',
    hi: 'कमरे का तापमान व आर्द्रता आदर्श है (22-26°C)। 24 घंटे में साफ और बुलबुला-मुक्त क्योरिंग मिलेगी।',
    mr: 'खोलीतील तापमान व आर्द्रता योग्य आहे (22-26°C). 24 तासांत पारदर्शक आणि फुगे-मुक्त क्युरिंग मिळेल.',
  };

  if (tempC < 20) {
    status = 'cold_risk';
    statusLabel = {
      en: 'Cold Studio Warning ❄️',
      hi: 'ठंडे वातावरण की चेतावनी ❄️',
      mr: 'थंड वातावरणाची सूचना ❄️',
    };
    advice = {
      en: `Temperature is ${tempC}°C. Curing is slowed down. Extended demold time from 24h to ${demold}h. Use a heating mat or warm room to avoid tacky resin.`,
      hi: `तापमान ${tempC}°C है। क्योरिंग धीमी होगी। डिमोल्ड समय बढ़ाकर ${demold} घंटे किया गया है। रेजिन को नरम होने से बचाने के लिए हीटिंग मैट का उपयोग करें।`,
      mr: `तापमान ${tempC}°C आहे. क्युरिंग संथ होईल. डिमोल्ड वेळ वाढवून ${demold} तास केली आहे. रेझिन मऊ राहू नये म्हणून हीटिंग मॅट वापरा.`,
    };
  } else if (tempC > 30) {
    status = 'heat_risk';
    statusLabel = {
      en: 'High Temperature / Flash Cure Warning 🔥',
      hi: 'अत्यधिक तापमान चेतावनी 🔥',
      mr: 'जास्त तापमान सूचना 🔥',
    };
    advice = {
      en: `Temperature is ${tempC}°C. Working pot life reduced to ${potLife} minutes! Pour in shallow layers to avoid exothermic heat bubbling.`,
      hi: `तापमान ${tempC}°C है। काम करने का समय घटकर केवल ${potLife} मिनट रह गया है! उबलने और बुलबुलों से बचने के लिए पतली परत में ढलाई करें।`,
      mr: `तापमान ${tempC}°C आहे. काम करण्याचा वेळ कमी होऊन फक्त ${potLife} मिनिटे उरला आहे! उष्णतेमुळे फुगे येऊ नयेत म्हणून पातळ थरांमध्ये ओता.`,
    };
  } else if (humidity > 65) {
    status = 'humidity_risk';
    statusLabel = {
      en: 'High Humidity Moisture Alert 💧',
      hi: 'उच्च आर्द्रता चेतावनी 💧',
      mr: 'जास्त आर्द्रता सूचना 💧',
    };
    advice = {
      en: `Humidity is ${humidity}%. Risk of surface moisture (amine blush). Keep molds covered under dust-free box or dome.`,
      hi: `आर्द्रता ${humidity}% है। सतह पर धुंधलेपन का खतरा है। मोल्ड्स को डस्ट-फ्री बॉक्स से ढक कर रखें।`,
      mr: `आर्द्रता ${humidity}% आहे. पृष्ठभागावर पांढरा थर येण्याचा धोका आहे. मोल्ड्स डस्ट-फ्री बॉक्सने झाकून ठेवा.`,
    };
  }

  return {
    potLifeMinutes: potLife,
    demoldHours: demold,
    fullCureHours: fullCure,
    status,
    statusLabel,
    advice,
    temperatureC: tempC,
    humidityPercent: humidity,
  };
};

let cachedClimate: ClimateData = {
  temperatureC: 24,
  humidityPercent: 48,
  city: 'Studio Workshop',
  source: 'manual_studio',
  lastUpdated: new Date().toISOString(),
};

export const getStudioClimate = (): ClimateData => cachedClimate;

export const setStudioClimate = (data: Partial<ClimateData>): ClimateData => {
  cachedClimate = { ...cachedClimate, ...data, lastUpdated: new Date().toISOString() };
  return cachedClimate;
};

export const fetchLiveStudioClimate = async (): Promise<ClimateData> => {
  try {
    // Attempt free Open-Meteo weather coordinates for default Indian Art Studio hubs (e.g. Pune/Mumbai or browser geoloc)
    const res = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=18.5204&longitude=73.8567&current=temperature_2m,relative_humidity_2m&timezone=auto'
    );
    const json = await res.json();
    if (json && json.current) {
      cachedClimate = {
        temperatureC: Math.round(json.current.temperature_2m),
        humidityPercent: Math.round(json.current.relative_humidity_2m),
        city: 'Pune/Mumbai Studio',
        source: 'weather_api',
        lastUpdated: new Date().toISOString(),
      };
      return cachedClimate;
    }
  } catch (err) {
    console.debug('Weather API offline, using standard studio climate:', err);
  }
  return cachedClimate;
};
