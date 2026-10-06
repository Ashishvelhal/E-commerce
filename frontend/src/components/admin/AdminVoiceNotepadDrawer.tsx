import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  StickyNote,
  X,
  Plus,
  Search,
  Pin,
  CheckCircle2,
  Circle,
  Trash2,
  Copy,
  Check,
  Mic,
  MicOff,
  Droplets,
  Sparkles,
  ClipboardList,
  Palette,
  Package,
  Lightbulb,
  FileText,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useStudioNoteStore, StudioNoteItem } from '../../store/useStudioNoteStore';
import { useToastStore } from '../../store/useToastStore';
import { useVoiceStore } from '../../store/useVoiceStore';
import { isSpeechRecognitionSupported, playAudioChime, speakFeedback } from '../../services/speechService';

const CATEGORY_TABS = [
  { id: 'all', label: { en: 'All Notes', hi: 'सभी नोट्स', mr: 'सर्व नोंदी' }, icon: FileText, color: 'text-art-400' },
  { id: 'formula', label: { en: 'Formulas & Pigments', hi: 'सूत्र व रंग', mr: 'सूत्र व रंग' }, icon: Palette, color: 'text-brand-600' },
  { id: 'order_customization', label: { en: 'Custom Orders', hi: 'कस्टम ऑर्डर', mr: 'कस्टम ऑर्डर' }, icon: Package, color: 'text-rose-600' },
  { id: 'todo', label: { en: 'Tasks & Checklist', hi: 'कार्य सूची', mr: 'कामे व यादी' }, icon: ClipboardList, color: 'text-emerald-600' },
  { id: 'idea', label: { en: 'Design Ideas', hi: 'डिज़ाइन विचार', mr: 'डिझाइन कल्पना' }, icon: Lightbulb, color: 'text-amber-500' },
];

export const AdminVoiceNotepadDrawer: React.FC = () => {
  const { addToast } = useToastStore();
  const { language } = useVoiceStore();
  const {
    notes,
    isNotepadOpen,
    closeNotepad,
    filterCategory,
    setFilterCategory,
    searchQuery,
    setSearchQuery,
    fetchNotes,
    addNote,
    toggleComplete,
    togglePin,
    deleteNote,
    uncompletedTodoCount,
  } = useStudioNoteStore();

  const [newNoteText, setNewNoteText] = useState('');
  const [interimText, setInterimText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isDictating, setIsDictating] = useState(false);
  const dictationRef = useRef<any>(null);
  const baseNoteTextRef = useRef<string>('');

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  useEffect(() => {
    return () => {
      if (dictationRef.current) {
        try { dictationRef.current.stop(); } catch (_) {}
        dictationRef.current = null;
      }
    };
  }, []);

  const toggleDictation = () => {
    if (!isSpeechRecognitionSupported()) {
      addToast('Speech Recognition not supported in this browser.', 'warning');
      return;
    }

    if (isDictating && dictationRef.current) {
      try { dictationRef.current.stop(); } catch (_) {}
      dictationRef.current = null;
      setIsDictating(false);
      setInterimText('');
      return;
    }

    baseNoteTextRef.current = newNoteText;

    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognizer = new SpeechRecognitionClass();
    recognizer.lang = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-IN';
    recognizer.continuous = true;
    recognizer.interimResults = true;

    recognizer.onresult = (e: any) => {
      let finalChunks: string[] = [];
      let interimChunks: string[] = [];

      for (let i = 0; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) {
          finalChunks.push(res[0].transcript.trim());
        } else {
          interimChunks.push(res[0].transcript.trim());
        }
      }

      const base = baseNoteTextRef.current ? baseNoteTextRef.current.trim() : '';
      const finalCombined = finalChunks.join(' ');
      const interimCombined = interimChunks.join(' ');

      const updatedText = [base, finalCombined].filter(Boolean).join(' ');
      setNewNoteText(updatedText);
      setInterimText(interimCombined);

      if (finalChunks.length > 0) {
        playAudioChime('success');
      }
    };

    recognizer.onerror = (err: any) => {
      if (err.error !== 'no-speech') {
        setIsDictating(false);
        setInterimText('');
        dictationRef.current = null;
      }
    };

    recognizer.onend = () => {
      if (dictationRef.current === recognizer) {
        setIsDictating(false);
        setInterimText('');
        dictationRef.current = null;
      }
    };

    dictationRef.current = recognizer;
    setIsDictating(true);
    setInterimText('');
    playAudioChime('start');

    try {
      recognizer.start();
    } catch (_) {
      setIsDictating(false);
      dictationRef.current = null;
    }
  };

  const handleCreateNote = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newNoteText.trim()) return;

    await addNote({
      content: newNoteText.trim(),
    });
    setNewNoteText('');
    playAudioChime('success');
    addToast('Note saved to workshop records ✨', 'success');
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    addToast('Copied to clipboard', 'info');
  };

  const filteredNotes = notes.filter((note) => {
    const matchesCategory = filterCategory === 'all' || note.category === filterCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'formula':
        return { label: '🎨 Formula & Recipe', bg: 'bg-brand-50 text-brand-700 border-brand-200' };
      case 'order_customization':
        return { label: '📦 Custom Order', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'todo':
        return { label: '📋 Workshop Task', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'idea':
        return { label: '💡 Design Concept', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      default:
        return { label: '📌 Note', bg: 'bg-art-900 text-art-400 border-art-800' };
    }
  };

  if (!isNotepadOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end font-poppins">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeNotepad}
          className="fixed inset-0 bg-art-300/40 backdrop-blur-sm"
        />

        {/* Drawer Panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col z-10 border-l border-art-800"
        >
          {/* Top Gradient Stripe */}
          <div className="h-1 bg-gradient-to-r from-brand-600 via-rose-500 to-plum-600" />

          {/* Drawer Header */}
          <div className="p-6 border-b border-art-800 flex items-center justify-between bg-art-950/40">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-brand-500 to-rose-500 text-white shadow-md">
                <StickyNote className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-art-300">
                    {language === 'hi'
                      ? 'स्टूडियो वॉयस नोटपैड'
                      : language === 'mr'
                      ? 'स्टुडिओ व्हॉईस नोटपॅड'
                      : 'Workshop Studio Notepad'}
                  </h2>
                  {uncompletedTodoCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold">
                      {uncompletedTodoCount} {language === 'hi' ? 'बाकी' : language === 'mr' ? 'प्रलंबित' : 'pending'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-art-500">
                  {language === 'hi'
                    ? 'वॉयस-सिंक्ड बैच रिकॉर्ड और निर्देश'
                    : language === 'mr'
                    ? 'व्हॉईस-सिंक केलेल्या बॅच नोंदी व सूचना'
                    : 'Voice-synced batch records & instructions'}
                </p>
              </div>
            </div>

            <button
              onClick={closeNotepad}
              className="p-2 rounded-xl text-art-500 hover:text-art-300 hover:bg-art-900 border border-art-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Voice Prompt Helper Banner */}
          <div className="px-6 py-2.5 bg-brand-50/70 border-b border-brand-200/70 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-brand-800 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-brand-600 shrink-0" />
              <span>
                {language === 'hi' ? (
                  <>कहें <span className="font-bold">"हे पार्टनर, नोट लिखो..."</span> या <span className="font-bold">"काम जोड़ो..."</span></>
                ) : language === 'mr' ? (
                  <>म्हणा <span className="font-bold">"हे पार्टनर, नोंद करा..."</span> किंवा <span className="font-bold">"काम जोडा..."</span></>
                ) : (
                  <>Say <span className="font-bold">"Hey Partner, note down..."</span> or <span className="font-bold">"add to-do..."</span></>
                )}
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold text-brand-700 bg-white px-2 py-0.5 rounded-md border border-brand-200">
              Live Sync
            </span>
          </div>

          {/* New Note Input Bar */}
          <div className="p-4 border-b border-art-800 bg-white">
            <form onSubmit={handleCreateNote} className="space-y-2">
              <div className="relative">
                <textarea
                  rows={2}
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder={
                    language === 'hi'
                      ? 'नोट टाइप करें या बोलकर दर्ज करने के लिए माइक दबाएं (उदा. "कोस्टर के लिए 80g रेजिन डाला")...'
                      : language === 'mr'
                      ? 'नोंद टाईप करा किंवा बोलण्यासाठी माइक दाबा (उदा. "कोस्टरसाठी 80g रेझिन वापरले")...'
                      : "Type note or click mic to dictate (e.g. 'Used 80g ocean blue pigment for coaster #104')..."
                  }
                  className={`w-full bg-art-950 border rounded-2xl p-3 pr-20 text-xs text-art-300 placeholder-art-500 focus:outline-none focus:border-brand-500 resize-none font-medium ${
                    isDictating ? 'border-rose-400 ring-1 ring-rose-400/50' : 'border-art-800'
                  }`}
                />
                <div className="absolute right-2.5 bottom-3 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={toggleDictation}
                    className={`p-1.5 rounded-xl border transition-all ${
                      isDictating
                        ? 'bg-rose-500 text-white animate-pulse border-rose-600'
                        : 'bg-brand-50 text-brand-700 border-brand-200 hover:bg-brand-100'
                    }`}
                    title={isDictating ? 'Stop dictation' : 'Start voice dictation'}
                  >
                    {isDictating ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="submit"
                    disabled={!newNoteText.trim()}
                    className="p-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white shadow-sm transition-all"
                    title="Add note"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {/* Rich Live Note & Speech Preview Card */}
              {(isDictating || newNoteText.trim() || interimText.trim()) && (() => {
                const combinedText = [newNoteText, interimText].filter(Boolean).join(' ');
                const gramsMatch = combinedText.match(/(\d+(?:\.\d+)?)\s*(?:g|gm|gram|grams|ग्राम|ग्रॅम)/i);
                const grams = gramsMatch ? parseFloat(gramsMatch[1]) : 0;
                const cost = grams > 0 ? (grams * 0.8).toFixed(2) : '0';
                const partA = grams > 0 ? ((grams * 2) / 3).toFixed(1) : '0';
                const partB = grams > 0 ? ((grams * 1) / 3).toFixed(1) : '0';

                return (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 rounded-2xl bg-gradient-to-br from-brand-50/90 to-rose-50/70 border border-brand-200/80 space-y-2.5 shadow-sm"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-bold text-brand-800">
                        {isDictating ? (
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                            <span className="text-rose-600 font-extrabold uppercase text-[10px] tracking-wider">
                              {language === 'hi' ? 'वॉयस लाइव' : language === 'mr' ? 'व्हॉईस लाईव्ह' : 'Voice Live'}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-brand-700">
                            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                            <span className="text-[10px] uppercase font-extrabold tracking-wider">
                              {language === 'hi' ? 'लाइव नोट पूर्वावलोकन' : language === 'mr' ? 'लाईव्ह नोंद पूर्वदृश्य' : 'Live Note Preview'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Live Audio Visualizer Bars when dictating */}
                      {isDictating && (
                        <div className="flex items-center gap-1 h-4">
                          {[30, 60, 90, 50, 80, 40].map((h, i) => (
                            <motion.div
                              key={i}
                              animate={{ height: ['20%', `${h}%`, '20%'] }}
                              transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.08, ease: 'easeInOut' }}
                              className="w-0.5 rounded-full bg-rose-500"
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Transcribed Text Real-Time Output */}
                    <div className="text-xs text-art-200 font-medium leading-relaxed bg-white/80 p-2.5 rounded-xl border border-brand-100 shadow-inner">
                      {newNoteText ? (
                        <span>{newNoteText}</span>
                      ) : (
                        <span className="text-art-400 italic">
                          {language === 'hi' ? 'बोलना शुरू करें...' : language === 'mr' ? 'बोलणे सुरू करा...' : 'Start speaking your note...'}
                        </span>
                      )}
                      {interimText && (
                        <span className="text-rose-600 font-semibold italic ml-1 bg-rose-100/60 px-1 py-0.5 rounded">
                          {interimText}
                        </span>
                      )}
                    </div>

                    {/* Auto-detected Resin Grams & Mix Breakdown Pill */}
                    {grams > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-[11px]">
                        <span className="px-2 py-0.5 rounded-md font-bold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
                          <Droplets className="w-3 h-3 text-purple-600" />
                          <span>-{grams}g Resin</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-md font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          ₹{cost} Investment
                        </span>
                        <span className="px-2 py-0.5 rounded-md font-mono text-[10px] bg-white text-art-400 border border-brand-200">
                          Ratio: {partA}g A + {partB}g B
                        </span>
                      </div>
                    )}
                  </motion.div>
                );
              })()}
            </form>
          </div>

          {/* Search & Category Filter Tabs */}
          <div className="p-4 border-b border-art-800 space-y-3 bg-art-950/20">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-art-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  language === 'hi'
                    ? 'निर्देश, रंग, ऑर्डर खोजें...'
                    : language === 'mr'
                    ? 'सूचना, रंग, ऑर्डर शोधा...'
                    : 'Search instructions, pigments, order IDs...'
                }
                className="w-full bg-white border border-art-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-art-300 placeholder-art-500 focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {CATEGORY_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = filterCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setFilterCategory(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-brand-500 text-white shadow-sm font-bold'
                        : 'bg-white hover:bg-art-900 border border-art-800 text-art-400'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{tab.label[language]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes Scrollable List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredNotes.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <StickyNote className="w-8 h-8 text-art-600 mx-auto opacity-50" />
                <p className="text-xs font-semibold text-art-400">No notes found</p>
                <p className="text-[11px] text-art-500 max-w-xs mx-auto">
                  Say <span className="text-brand-700 font-bold">"Hey Partner, note down..."</span> to record hands-free instructions anytime.
                </p>
              </div>
            ) : (
              filteredNotes.map((note) => {
                const badge = getCategoryBadge(note.category);
                return (
                  <motion.div
                    key={note._id}
                    layout
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`p-4 rounded-2xl border transition-all ${
                      note.isPinned
                        ? 'bg-gradient-to-br from-white to-brand-50/40 border-brand-300 shadow-md ring-1 ring-brand-300/50'
                        : 'bg-white border-art-800 shadow-sm hover:border-brand-300/70'
                    }`}
                  >
                    {/* Note Top Bar */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${badge.bg}`}>
                          {badge.label}
                        </span>

                        {note.rawResinGramsDeducted && note.rawResinGramsDeducted > 0 && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                            <Droplets className="w-3 h-3 text-purple-600" />
                            <span>-{note.rawResinGramsDeducted}g Stock</span>
                          </span>
                        )}

                        {note.materialCost && note.materialCost > 0 && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <span>₹{note.materialCost.toFixed(2)} Investment</span>
                          </span>
                        )}

                        {note.isPinned && (
                          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                            <Pin className="w-2.5 h-2.5 fill-amber-600" />
                            <span>Pinned</span>
                          </span>
                        )}
                      </div>

                      {/* Action Icons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => togglePin(note._id)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            note.isPinned
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'text-art-500 hover:text-art-300 hover:bg-art-900 border-art-800'
                          }`}
                          title={note.isPinned ? 'Unpin note' : 'Pin note to top'}
                        >
                          <Pin className="w-3 h-3" />
                        </button>

                        <button
                          onClick={() => handleCopy(note._id, note.content)}
                          className="p-1.5 rounded-lg text-art-500 hover:text-art-300 hover:bg-art-900 border border-art-800 transition-colors"
                          title="Copy content"
                        >
                          {copiedId === note._id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>

                        <button
                          onClick={() => deleteNote(note._id)}
                          className="p-1.5 rounded-lg text-art-500 hover:text-rose-600 hover:bg-rose-50 border border-art-800 transition-colors"
                          title="Delete note"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Content Section (with To-Do Checkbox support) */}
                    <div className="flex items-start gap-2.5">
                      {note.category === 'todo' && (
                        <button
                          onClick={() => toggleComplete(note._id)}
                          className="mt-0.5 text-emerald-600 shrink-0 transition-transform active:scale-90"
                        >
                          {note.isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 fill-emerald-600 text-white" />
                          ) : (
                            <Circle className="w-4 h-4 text-art-500 hover:text-emerald-600" />
                          )}
                        </button>
                      )}

                      <div className="flex-1 min-w-0">
                        {note.title && note.title !== note.content && (
                          <h4 className={`text-xs font-bold text-art-300 mb-0.5 ${note.isCompleted ? 'line-through text-art-500' : ''}`}>
                            {note.title}
                          </h4>
                        )}
                        <p className={`text-xs text-art-400 whitespace-pre-wrap leading-relaxed ${note.isCompleted ? 'line-through text-art-500' : ''}`}>
                          {note.content}
                        </p>
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div className="mt-3 pt-2 border-t border-art-800/60 flex items-center justify-between text-[10px] text-art-500 font-mono">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-art-500" />
                        {new Date(note.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span>By {note.author || 'Admin'}</span>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
