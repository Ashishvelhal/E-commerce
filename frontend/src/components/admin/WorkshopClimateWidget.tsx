import React, { useState, useEffect } from 'react';
import { Thermometer, Droplets, Clock, AlertTriangle, Sparkles, RefreshCw, Sliders } from 'lucide-react';
import {
  calculateCureCompensation,
  getStudioClimate,
  setStudioClimate,
  fetchLiveStudioClimate,
  CureGuidance,
} from '../../services/climateService';
import { useVoiceStore } from '../../store/useVoiceStore';

export const WorkshopClimateWidget: React.FC = () => {
  const { language } = useVoiceStore();
  const [climate, setClimateState] = useState(getStudioClimate());
  const [guidance, setGuidance] = useState<CureGuidance>(
    calculateCureCompensation(climate.temperatureC, climate.humidityPercent)
  );
  const [showAdjuster, setShowAdjuster] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchLiveStudioClimate().then((data) => {
      setClimateState(data);
      setGuidance(calculateCureCompensation(data.temperatureC, data.humidityPercent));
    });
  }, []);

  const handleTempChange = (newTemp: number) => {
    const updated = setStudioClimate({ temperatureC: newTemp, source: 'manual_studio' });
    setClimateState(updated);
    setGuidance(calculateCureCompensation(updated.temperatureC, updated.humidityPercent));
  };

  const handleHumidityChange = (newHum: number) => {
    const updated = setStudioClimate({ humidityPercent: newHum, source: 'manual_studio' });
    setClimateState(updated);
    setGuidance(calculateCureCompensation(updated.temperatureC, updated.humidityPercent));
  };

  const refreshWeather = async () => {
    setIsRefreshing(true);
    const live = await fetchLiveStudioClimate();
    setClimateState(live);
    setGuidance(calculateCureCompensation(live.temperatureC, live.humidityPercent));
    setIsRefreshing(false);
  };

  const getStatusColor = () => {
    switch (guidance.status) {
      case 'cold_risk':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'heat_risk':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'humidity_risk':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="p-4 rounded-3xl bg-white border border-art-800 shadow-sm space-y-3 font-poppins">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white shadow-sm">
            <Thermometer className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-art-300">
              {language === 'hi'
                ? 'स्टूडियो तापमान व क्योर कंपेंसेटर'
                : language === 'mr'
                ? 'स्टुडिओ तापमान व क्युरिंग कंपेन्सेटर'
                : 'Studio Climate & Cure Compensator'}
            </h3>
            <p className="text-[10px] text-art-500">
              {climate.city || 'Workshop Ambient'} •{' '}
              {climate.source === 'weather_api' ? 'Live Sensor/API' : 'Studio Manual'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowAdjuster(!showAdjuster)}
            className="p-1.5 rounded-lg border border-art-800 text-art-500 hover:text-art-300 hover:bg-art-900 transition-colors"
            title="Adjust room temperature / AC setting"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={refreshWeather}
            className={`p-1.5 rounded-lg border border-art-800 text-art-500 hover:text-art-300 hover:bg-art-900 transition-colors ${
              isRefreshing ? 'animate-spin' : ''
            }`}
            title="Refresh local weather"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="p-2.5 rounded-2xl bg-art-950 border border-art-800 text-center">
          <span className="text-[10px] text-art-500 font-semibold block">
            {language === 'hi' ? 'कमरे का तापमान' : language === 'mr' ? 'खोलीचे तापमान' : 'Room Temp'}
          </span>
          <span className="text-lg font-black text-art-300 font-mono flex items-center justify-center gap-1">
            <Thermometer className="w-4 h-4 text-rose-500" />
            {climate.temperatureC}°C
          </span>
        </div>

        <div className="p-2.5 rounded-2xl bg-art-950 border border-art-800 text-center">
          <span className="text-[10px] text-art-500 font-semibold block">
            {language === 'hi' ? 'आर्द्रता (Humidity)' : language === 'mr' ? 'आर्द्रता (Humidity)' : 'Humidity'}
          </span>
          <span className="text-lg font-black text-art-300 font-mono flex items-center justify-center gap-1">
            <Droplets className="w-4 h-4 text-cyan-500" />
            {climate.humidityPercent}%
          </span>
        </div>

        <div className="p-2.5 rounded-2xl bg-art-950 border border-art-800 text-center">
          <span className="text-[10px] text-art-500 font-semibold block">
            {language === 'hi' ? 'घोलने का समय (Pot Life)' : language === 'mr' ? 'काम करण्याचा वेळ' : 'Pot Life / Work Time'}
          </span>
          <span className="text-lg font-black text-brand-700 font-mono flex items-center justify-center gap-1">
            <Clock className="w-4 h-4 text-brand-600" />
            {guidance.potLifeMinutes}m
          </span>
        </div>

        <div className="p-2.5 rounded-2xl bg-art-950 border border-art-800 text-center">
          <span className="text-[10px] text-art-500 font-semibold block">
            {language === 'hi' ? 'डिमोल्ड समय' : language === 'mr' ? 'डिमोल्ड वेळ' : 'Demold Time'}
          </span>
          <span className="text-lg font-black text-purple-700 font-mono flex items-center justify-center gap-1">
            <Sparkles className="w-4 h-4 text-purple-600" />
            {guidance.demoldHours}h
          </span>
        </div>
      </div>

      {/* Manual Sliders for Studio Customization (collapsible) */}
      {showAdjuster && (
        <div className="p-3 rounded-2xl bg-brand-50/50 border border-brand-200/70 space-y-2 text-xs">
          <div className="flex items-center justify-between text-[11px] font-bold text-brand-900">
            <span>Studio Room Controls (AC / Heater):</span>
            <span className="font-mono text-brand-700">{climate.temperatureC}°C | {climate.humidityPercent}%</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-art-600">
              <span>Temperature: {climate.temperatureC}°C</span>
              <span>Range: 14°C - 38°C</span>
            </div>
            <input
              type="range"
              min="14"
              max="38"
              value={climate.temperatureC}
              onChange={(e) => handleTempChange(Number(e.target.value))}
              className="w-full accent-brand-600 cursor-pointer h-1.5 bg-art-200 rounded-lg"
            />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-art-600">
              <span>Humidity: {climate.humidityPercent}%</span>
              <span>Range: 20% - 90%</span>
            </div>
            <input
              type="range"
              min="20"
              max="90"
              value={climate.humidityPercent}
              onChange={(e) => handleHumidityChange(Number(e.target.value))}
              className="w-full accent-cyan-600 cursor-pointer h-1.5 bg-art-200 rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Guidance Alert Banner */}
      <div className={`p-3 rounded-2xl border flex items-start gap-2.5 text-xs ${getStatusColor()}`}>
        {guidance.status === 'optimal' ? (
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        ) : (
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        )}
        <div className="space-y-0.5">
          <div className="font-bold text-[11px]">
            {guidance.statusLabel[language] || guidance.statusLabel.en}
          </div>
          <p className="text-[10px] opacity-90 leading-relaxed">
            {guidance.advice[language] || guidance.advice.en}
          </p>
        </div>
      </div>
    </div>
  );
};
