import React, { useState, useEffect, useRef } from 'react';
import { Debate, Argument, DebateSummary, ChatMessage } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { TranslatedTextBlock } from './TranslatedTextBlock';
import {
  Sparkles,
  X,
  MessageSquare,
  FileText,
  RotateCcw,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';

interface DebateAiDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  debate: Debate;
  argumentsList: Argument[];
  onUpdateDebateSummary?: (summary: DebateSummary) => void;
}

export const DebateAiDrawer: React.FC<DebateAiDrawerProps> = ({
  isOpen,
  onClose,
  debate,
  argumentsList,
  onUpdateDebateSummary,
}) => {
  const { isDark } = useTheme();
  const { language, t, getTranslatedEntry } = useLanguage();
  const [activeTab, setActiveTab] = useState<'summary' | 'chat'>('summary');
  const [summary, setSummary] = useState<DebateSummary | null>(debate.aiSummary || null);
  const [lastSummaryLang, setLastSummaryLang] = useState<string>('en');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const translatedTitle = getTranslatedEntry(debate.title)?.translatedText || debate.title;

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Hello! I'm your AI Debate Analyst for "${debate.title}". You can ask me to evaluate arguments, explore nuances, detect logical fallacies, or suggest balanced counterpoints.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isChatSending, setIsChatSending] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  const fetchSummary = async (force: boolean = false) => {
    if (summary && !force && lastSummaryLang === language) return;
    setIsGeneratingSummary(true);
    setSummaryError(null);

    try {
      const res = await fetch('/api/summarize-debate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: debate.title,
          targetLang: language,
          argumentsList: argumentsList.map((a) => ({
            side: a.side,
            content: a.content,
            likes: a.likes,
          })),
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate debate summary');
      }

      const data = await res.json();
      setSummary(data);
      setLastSummaryLang(language);
      if (onUpdateDebateSummary && language === 'en') {
        onUpdateDebateSummary(data);
      }
    } catch (err: any) {
      console.error('Summary error:', err);
      setSummaryError(err.message || 'Unable to load summary.');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  useEffect(() => {
    if (isOpen && (!summary || lastSummaryLang !== language)) {
      fetchSummary(true);
    }
  }, [isOpen, language]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isChatSending]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isChatSending) return;

    const userMsg: ChatMessage = {
      id: 'user_' + Date.now(),
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsChatSending(true);

    try {
      const res = await fetch('/api/debate-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetLang: language,
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.text,
          })),
          debateContext: {
            title: debate.title,
            forVotes: debate.forVotes,
            againstVotes: debate.againstVotes,
            argumentsCount: argumentsList.length,
          },
        }),
      });

      if (!res.ok) {
        throw new Error('Chat response failed');
      }

      const data = await res.json();
      const modelMsg: ChatMessage = {
        id: 'model_' + Date.now(),
        role: 'model',
        text: data.text || 'I analyzed the points above.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, modelMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errMsg: ChatMessage = {
        id: 'err_' + Date.now(),
        role: 'model',
        text: 'Sorry, I ran into an error analyzing that question. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsChatSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`w-full max-w-lg border-l shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300 ${
          isDark
            ? 'bg-[#070913] border-[#1a233a] text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Drawer Header */}
        <div
          className={`flex items-center justify-between px-5 py-4 border-b ${
            isDark ? 'border-[#141b2d] bg-[#090d1a]' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-lg bg-sky-500/15 border border-sky-500/25 shrink-0">
              <Sparkles className="w-4 h-4 text-sky-400" />
            </div>
            <div className="min-w-0">
              <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {t('aiDebateIntelligence')}
              </h3>
              <p className={`text-[11px] truncate max-w-[260px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {translatedTitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div
          className={`flex border-b ${
            isDark ? 'border-[#141b2d] bg-[#070913]' : 'border-slate-200 bg-white'
          }`}
        >
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'summary'
                ? isDark
                  ? 'border-sky-400 text-white bg-white/[0.02]'
                  : 'border-sky-600 text-sky-700 bg-sky-50/50'
                : isDark
                ? 'border-transparent text-slate-400 hover:text-slate-200'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{t('executiveSummary')}</span>
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'chat'
                ? isDark
                  ? 'border-sky-400 text-white bg-white/[0.02]'
                  : 'border-sky-600 text-sky-700 bg-sky-50/50'
                : isDark
                ? 'border-transparent text-slate-400 hover:text-slate-200'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{t('debateAssistant')}</span>
          </button>
        </div>

        {/* Tab 1: Executive Summary */}
        {activeTab === 'summary' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-mono uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {t('objectiveSynthesis')}
              </span>
              <button
                onClick={() => fetchSummary(true)}
                disabled={isGeneratingSummary}
                className="flex items-center gap-1 text-[11px] font-mono text-sky-500 hover:text-sky-400 disabled:opacity-50 cursor-pointer"
              >
                <RotateCcw className={`w-3 h-3 ${isGeneratingSummary ? 'animate-spin' : ''}`} />
                <span>{t('regenerate')}</span>
              </button>
            </div>

            {isGeneratingSummary ? (
              <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
                <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
                <p className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  Synthesizing argument pillars and friction points...
                </p>
              </div>
            ) : summaryError ? (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                <p>{summaryError}</p>
                <button
                  onClick={() => fetchSummary(true)}
                  className="mt-2 text-sky-400 underline font-mono text-[11px]"
                >
                  {t('regenerate')}
                </button>
              </div>
            ) : summary ? (
              <div className="space-y-4">
                {/* Overview */}
                <div
                  className={`p-4 rounded-xl border space-y-2 ${
                    isDark ? 'bg-[#0c101c] border-[#161f33]' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-500">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>{t('conflictCore')}</span>
                  </div>
                  <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {summary.overview}
                  </p>
                </div>

                {/* Side-by-Side Argument Pillars */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* For Pillars */}
                  <div
                    className={`p-3.5 rounded-xl border space-y-2 ${
                      isDark ? 'bg-sky-950/20 border-sky-500/20' : 'bg-sky-50/70 border-sky-200'
                    }`}
                  >
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-500 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {t('keyArgsFor')}
                    </span>
                    <ul className={`text-xs space-y-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {summary.forPoints.map((point, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-sky-500 font-bold">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Against Pillars */}
                  <div
                    className={`p-3.5 rounded-xl border space-y-2 ${
                      isDark ? 'bg-rose-950/20 border-rose-500/20' : 'bg-rose-50/70 border-rose-200'
                    }`}
                  >
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {t('keyArgsAgainst')}
                    </span>
                    <ul className={`text-xs space-y-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {summary.againstPoints.map((point, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-rose-500 font-bold">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Areas of Consensus */}
                {summary.consensusPoints && summary.consensusPoints.length > 0 && (
                  <div
                    className={`p-3.5 rounded-xl border space-y-1.5 ${
                      isDark ? 'bg-emerald-950/20 border-emerald-500/20' : 'bg-emerald-50/70 border-emerald-200'
                    }`}
                  >
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {t('groundOfAgreement')}
                    </span>
                    <ul className={`text-xs space-y-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {summary.consensusPoints.map((pt, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-500">•</span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Primary Friction Points */}
                {summary.frictionPoints && summary.frictionPoints.length > 0 && (
                  <div
                    className={`p-3.5 rounded-xl border space-y-1.5 ${
                      isDark ? 'bg-amber-950/20 border-amber-500/20' : 'bg-amber-50/70 border-amber-200'
                    }`}
                  >
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1">
                      <HelpCircle className="w-3 h-3" />
                      {t('fundamentalDisagreements')}
                    </span>
                    <ul className={`text-xs space-y-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {summary.frictionPoints.map((fp, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-amber-500">•</span>
                          <span>{fp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Key Takeaway */}
                {summary.keyTakeaway && (
                  <div
                    className={`p-3 rounded-xl border text-xs italic ${
                      isDark
                        ? 'bg-white/[0.03] border-white/10 text-slate-300'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <strong>{t('takeaway')}:</strong> "{summary.keyTakeaway}"
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}

        {/* Tab 2: Interactive AI Debate Assistant */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Quick Prompts Chips */}
            <div
              className={`p-3 border-b overflow-x-auto flex gap-2 shrink-0 ${
                isDark ? 'border-[#141b2d] bg-[#090d1a]' : 'border-slate-200 bg-slate-50'
              }`}
            >
              {[
                'Strongest point on both sides?',
                'Are there logical fallacies?',
                'Suggest a neutral compromise',
                'What real-world studies exist?',
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip)}
                  className={`whitespace-nowrap px-2.5 py-1 rounded-lg text-[11px] border transition-colors cursor-pointer ${
                    isDark
                      ? 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border-white/5'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-sky-600 text-white rounded-br-none'
                        : isDark
                        ? 'bg-[#101524] border border-[#1b253d] text-slate-200 rounded-bl-none'
                        : 'bg-slate-100 border border-slate-200 text-slate-800 rounded-bl-none'
                    }`}
                  >
                    <TranslatedTextBlock
                      itemId={`chat_${msg.id}`}
                      originalText={msg.text}
                      maxLines={12}
                    />
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              ))}
              {isChatSending && (
                <div
                  className={`flex items-center gap-2 p-3 text-xs rounded-2xl border w-fit ${
                    isDark
                      ? 'text-slate-400 bg-[#101524] border-[#1b253d]'
                      : 'text-slate-600 bg-slate-100 border-slate-200'
                  }`}
                >
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
                  <span>Analyzing debate context...</span>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Chat Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className={`p-3 border-t flex gap-2 ${
                isDark ? 'border-[#141b2d] bg-[#090d1a]' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={t('askAnythingPlaceholder')}
                className={`flex-1 border rounded-xl px-3.5 py-2 text-xs focus:outline-none ${
                  isDark
                    ? 'bg-white/[0.04] border-white/10 text-white placeholder-slate-500 focus:border-sky-500'
                    : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-sky-500'
                }`}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isChatSending}
                className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
