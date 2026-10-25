import React, { useState, useEffect, useRef } from 'react';
import { Debate, Argument, DebateSummary, ChatMessage } from '../types';
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
  const [activeTab, setActiveTab] = useState<'summary' | 'chat'>('summary');
  const [summary, setSummary] = useState<DebateSummary | null>(debate.aiSummary || null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

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
    if (summary && !force) return;
    setIsGeneratingSummary(true);
    setSummaryError(null);

    try {
      const res = await fetch('/api/summarize-debate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: debate.title,
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
      if (onUpdateDebateSummary) {
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
    if (isOpen && !summary) {
      fetchSummary();
    }
  }, [isOpen]);

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
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-[#070913] border-l border-[#1a233a] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
      {/* Drawer Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#141b2d] bg-[#090d1a]">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-cyan-500/20 to-rose-500/20 border border-white/10">
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">AI Debate Intelligence</h3>
            <p className="text-[11px] text-slate-400 truncate max-w-[260px]">{debate.title}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#141b2d] bg-[#070913]">
        <button
          onClick={() => setActiveTab('summary')}
          className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'summary'
              ? 'border-cyan-400 text-white bg-white/[0.02]'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Executive Summary</span>
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'chat'
              ? 'border-cyan-400 text-white bg-white/[0.02]'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Debate Assistant</span>
        </button>
      </div>

      {/* Tab 1: Executive Summary */}
      {activeTab === 'summary' && (
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Objective Debate Synthesis
            </span>
            <button
              onClick={() => fetchSummary(true)}
              disabled={isGeneratingSummary}
              className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 disabled:opacity-50 cursor-pointer"
            >
              <RotateCcw className={`w-3 h-3 ${isGeneratingSummary ? 'animate-spin' : ''}`} />
              <span>Regenerate</span>
            </button>
          </div>

          {isGeneratingSummary ? (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              <p className="text-sm font-medium text-slate-200">
                Synthesizing argument pillars and friction points...
              </p>
              <p className="text-xs text-slate-500">Gemini 3.8 is analyzing the debate arguments</p>
            </div>
          ) : summaryError ? (
            <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/20 text-rose-300 text-xs">
              <p>{summaryError}</p>
              <button
                onClick={() => fetchSummary(true)}
                className="mt-2 text-cyan-400 underline font-mono text-[11px]"
              >
                Retry analysis
              </button>
            </div>
          ) : summary ? (
            <div className="space-y-4">
              {/* Overview */}
              <div className="p-4 rounded-xl bg-[#0c101c] border border-[#161f33] space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Conflict Core</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{summary.overview}</p>
              </div>

              {/* Side-by-Side Argument Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* For Pillars */}
                <div className="p-3.5 rounded-xl bg-sky-950/20 border border-sky-500/20 space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Key Arguments FOR
                  </span>
                  <ul className="text-xs text-slate-300 space-y-2">
                    {summary.forPoints.map((point, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-sky-400 font-bold">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Against Pillars */}
                <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/20 space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Key Arguments AGAINST
                  </span>
                  <ul className="text-xs text-slate-300 space-y-2">
                    {summary.againstPoints.map((point, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-rose-400 font-bold">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Areas of Consensus */}
              {summary.consensusPoints && summary.consensusPoints.length > 0 && (
                <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-1.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Ground of Agreement / Shared Assumptions
                  </span>
                  <ul className="text-xs text-slate-300 space-y-1">
                    {summary.consensusPoints.map((pt, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-400">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Primary Friction Points */}
              {summary.frictionPoints && summary.frictionPoints.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-1.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                    <HelpCircle className="w-3 h-3" />
                    Fundamental Disagreements
                  </span>
                  <ul className="text-xs text-slate-300 space-y-1">
                    {summary.frictionPoints.map((fp, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-amber-400">•</span>
                        <span>{fp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Key Takeaway */}
              {summary.keyTakeaway && (
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-slate-300 italic">
                  <strong>Takeaway:</strong> "{summary.keyTakeaway}"
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
          <div className="p-3 border-b border-[#141b2d] bg-[#090d1a] overflow-x-auto flex gap-2 shrink-0">
            {[
              'Strongest point on both sides?',
              'Are there logical fallacies?',
              'Suggest a neutral compromise',
              'What real-world studies exist?',
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/5 transition-colors cursor-pointer"
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
                      ? 'bg-gradient-to-r from-sky-600 to-cyan-600 text-white rounded-br-none'
                      : 'bg-[#101524] border border-[#1b253d] text-slate-200 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
                <span className="text-[9px] text-slate-500 font-mono mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}
            {isChatSending && (
              <div className="flex items-center gap-2 p-3 text-xs text-slate-400 bg-[#101524] rounded-2xl border border-[#1b253d] w-fit">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
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
            className="p-3 border-t border-[#141b2d] bg-[#090d1a] flex gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask anything about this debate..."
              className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isChatSending}
              className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
