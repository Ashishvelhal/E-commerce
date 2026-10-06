import React, { useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useVoiceStore } from '../../store/useVoiceStore';
import { useStudioNoteStore } from '../../store/useStudioNoteStore';
import { useAdminUIStore } from '../../store/useAdminUIStore';
import { ShieldCheck, Mic, MicOff, BookOpen, StickyNote, Menu } from 'lucide-react';

export const AdminNavbar: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => {
  const { user } = useAuthStore();
  const { language, setLanguage, isWakeWordListening, toggleWakeWordListening, openAssistant } = useVoiceStore();
  const { notes, uncompletedTodoCount, openNotepad, openGuideModal, fetchNotes } = useStudioNoteStore();
  const { openMobileSidebar } = useAdminUIStore();

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  return (
    <header className="h-16 sm:h-20 bg-white border-b border-art-800 px-3 xs:px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm font-poppins">
      {/* Left Title & Mobile Hamburger */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 pr-2">
        <button
          onClick={openMobileSidebar}
          aria-label="Open mobile navigation menu"
          className="lg:hidden p-2 -ml-1 rounded-xl text-art-400 hover:text-art-300 hover:bg-art-900 transition-colors shrink-0"
        >
          <Menu className="w-5 h-5 text-art-300" />
        </button>
        <div className="min-w-0">
          <h1 className="text-sm xs:text-base sm:text-lg font-bold text-art-300 truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[10px] sm:text-xs text-art-500 truncate hidden xs:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-3 shrink-0">
        {/* Multilingual Switcher: EN / HI / MR */}
        <div className="flex items-center p-0.5 sm:p-1 rounded-full bg-art-950 border border-art-800 text-[10px] sm:text-xs font-bold shadow-xs">
          <button
            onClick={() => setLanguage('en')}
            className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full transition-all ${
              language === 'en'
                ? 'bg-brand-500 text-white shadow-xs'
                : 'text-art-400 hover:text-art-200 hover:bg-art-850'
            }`}
            title="English Studio Voice & Guide"
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('hi')}
            className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full transition-all ${
              language === 'hi'
                ? 'bg-brand-500 text-white shadow-xs'
                : 'text-art-400 hover:text-art-200 hover:bg-art-850'
            }`}
            title="हिंदी (Hindi) वॉयस और गाइड"
          >
            हिंदी
          </button>
          <button
            onClick={() => setLanguage('mr')}
            className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full transition-all ${
              language === 'mr'
                ? 'bg-brand-500 text-white shadow-xs'
                : 'text-art-400 hover:text-art-200 hover:bg-art-850'
            }`}
            title="मराठी (Marathi) व्हॉईस आणि मार्गदर्शक"
          >
            मराठी
          </button>
        </div>

        {/* 12-Step Process Guide Trigger */}
        <button
          onClick={openGuideModal}
          className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-all active:scale-95 shadow-xs"
          title={
            language === 'hi'
              ? '12-चरणीय रेजिन आर्ट गाइड खोलें'
              : language === 'mr'
              ? '12-टप्प्यांचे रेझिन आर्ट मार्गदर्शक उघडा'
              : 'Open Complete 12-Step Resin Art Studio Process Guide'
          }
        >
          <BookOpen className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span className="hidden lg:inline">
            {language === 'hi' ? '12-चरण गाइड' : language === 'mr' ? '12-टप्पे मार्गदर्शक' : '12-Step Guide'}
          </span>
        </button>

        {/* Studio Voice Notepad Drawer Trigger */}
        <button
          onClick={openNotepad}
          className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition-all active:scale-95 relative shadow-xs"
          title={
            language === 'hi'
              ? 'स्टूडियो वॉयस नोटपैड खोलें'
              : language === 'mr'
              ? 'स्टुडिओ व्हॉईस नोटपॅड उघडा'
              : 'Open Studio Voice Notepad & Instruction Logger'
          }
        >
          <StickyNote className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span className="hidden md:inline">
            {language === 'hi' ? 'नोटपैड' : language === 'mr' ? 'नोटपॅड' : 'Notepad'}
          </span>
          {notes.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[9px] sm:text-[10px] font-black bg-amber-500 text-white leading-tight">
              {uncompletedTodoCount > 0 ? uncompletedTodoCount : notes.length}
            </span>
          )}
        </button>

        {/* Ambient Wake Word Status & Assistant Trigger */}
        <div className="flex items-center gap-1 sm:gap-1.5 p-0.5 sm:p-1 rounded-full bg-art-950 border border-art-800">
          <button
            onClick={toggleWakeWordListening}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold transition-all ${
              isWakeWordListening
                ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/30'
                : 'bg-art-900 text-art-500 border border-art-800 hover:text-art-400'
            }`}
            title={
              isWakeWordListening
                ? 'Continuous wake-word active. Say "Hey Partner" anytime to trigger voice commands!'
                : 'Wake-word listening paused. Click to enable hands-free voice.'
            }
          >
            {isWakeWordListening ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="hidden sm:inline">"Hey Partner" 👂</span>
              </>
            ) : (
              <>
                <MicOff className="w-3.5 h-3.5 text-art-500" />
                <span className="hidden sm:inline">Voice Paused</span>
              </>
            )}
          </button>

          {/* Quick Voice Studio Drawer Trigger */}
          <button
            onClick={openAssistant}
            className="p-1 sm:p-1.5 rounded-full bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 transition-all active:scale-95 shrink-0"
            title="Open Voice Studio Assistant & Quick Commands"
          >
            <Mic className="w-3.5 h-3.5 text-brand-600" />
          </button>
        </div>

        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-200">
          <ShieldCheck className="w-4 h-4 text-brand-700 shrink-0" />
          <span className="text-xs font-bold text-brand-700">Admin Studio</span>
        </div>

        <div className="flex items-center gap-2 pl-1.5 sm:pl-3 border-l border-art-800">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-brand-500 to-rose-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-brand-300 shrink-0">
            {user?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-bold text-art-300 truncate max-w-[120px]">{user?.name}</div>
            <div className="text-[10px] text-brand-700 font-semibold">System Administrator</div>
          </div>
        </div>
      </div>
    </header>
  );
};


