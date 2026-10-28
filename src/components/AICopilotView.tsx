import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Copy, 
  Check, 
  TrendingUp, 
  AlertTriangle, 
  Database, 
  Users, 
  Package, 
  RefreshCw,
  Zap,
  ArrowRight
} from 'lucide-react';

interface AICopilotViewProps {
  onRunAnalysis: (prompt: string, actionType?: string) => Promise<{ source: string; analysis: string }>;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  source?: string;
}

export const AICopilotView: React.FC<AICopilotViewProps> = ({ onRunAnalysis }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `### 🤖 Welcome to OmniManage AI Executive Copilot\n\nI am your intelligent operations analyst, connected live to your **Employees**, **Projects**, **Tasks**, **Inventory**, and **Database Schemas**.\n\nChoose one of the strategic actions below or type your custom operational query.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'gemini-3.7-flash'
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const quickPrompts = [
    {
      label: 'Executive Portfolio Briefing',
      icon: TrendingUp,
      prompt: 'Generate an executive management health summary with milestone progression, budget burn, and risk assessment.',
      type: 'Executive Briefing'
    },
    {
      label: 'Critical Bottleneck Triage',
      icon: AlertTriangle,
      prompt: 'Identify top operational bottlenecks across urgent tasks, blocked tickets, and low inventory stock levels.',
      type: 'Bottleneck Triage'
    },
    {
      label: 'DB Schema & Index Optimization',
      icon: Database,
      prompt: 'Audit current database schema tables (employees, projects, tasks, inventory) and suggest high-performance composite indexes and partitioning strategies.',
      type: 'Schema Optimization'
    },
    {
      label: 'Workforce & Workload Balancing',
      icon: Users,
      prompt: 'Analyze engineering and product team bandwidth. Which employees are overloaded and how can tasks be re-assigned?',
      type: 'Staff Balancing'
    },
    {
      label: 'Inventory Restock Forecasting',
      icon: Package,
      prompt: 'Forecast hardware and equipment restocking timeline based on current inventory minimum thresholds and active project headcounts.',
      type: 'Inventory Forecast'
    }
  ];

  const handleSend = async (customPrompt?: string, actionType?: string) => {
    const textToSend = customPrompt || inputPrompt;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputPrompt('');
    setLoading(true);

    try {
      const res = await onRunAnalysis(textToSend, actionType);
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: res.analysis,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: res.source
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        sender: 'ai',
        text: '❌ Error generating AI analysis. Please check your backend connection.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
            <span>AI Executive Management Copilot</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Server-side AI intelligence analyzing live operational telemetry, project velocity, and schema efficiency.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5 font-medium">
            <Zap className="w-3.5 h-3.5 text-purple-400" />
            Powered by Gemini API
          </span>
        </div>
      </div>

      {/* Quick Strategic Prompts Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {quickPrompts.map((qp, idx) => {
          const Icon = qp.icon;
          return (
            <button
              key={idx}
              disabled={loading}
              onClick={() => handleSend(qp.prompt, qp.type)}
              className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-purple-500/40 text-left transition-all space-y-2 group cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                  <Icon className="w-4 h-4" />
                </div>
                <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
              </div>
              <div className="text-xs font-semibold text-slate-200 group-hover:text-purple-200">
                {qp.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Messages Conversation Container */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 sm:p-6 space-y-5 min-h-[450px] max-h-[600px] overflow-y-auto flex flex-col">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'ai' && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-purple-500/20">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-2xl rounded-2xl p-4 text-xs space-y-2 relative group ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : 'bg-slate-800/80 border border-slate-700/60 text-slate-200 rounded-tl-none leading-relaxed'
              }`}
            >
              {/* Message Header */}
              <div className="flex items-center justify-between gap-4 text-[10px] opacity-70 pb-1 border-b border-white/10">
                <span>{msg.sender === 'user' ? 'Operations Executive' : 'OmniManage Intelligence'}</span>
                <div className="flex items-center gap-2">
                  {msg.source && (
                    <span className="font-mono text-purple-300 font-semibold">{msg.source}</span>
                  )}
                  <span>{msg.timestamp}</span>
                </div>
              </div>

              {/* Message Content */}
              <div className="prose prose-invert prose-xs max-w-none space-y-2 whitespace-pre-wrap">
                {msg.text}
              </div>

              {/* Copy Button for AI Messages */}
              {msg.sender === 'ai' && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => handleCopyText(msg.id, msg.text)}
                    className="p-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 font-bold text-xs">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white shrink-0 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-xs text-purple-300 flex items-center gap-2.5">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing full-stack operational telemetry and synthesizing briefing...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Prompt Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-2 focus-within:border-purple-500 transition-all"
      >
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          placeholder="Ask AI Copilot (e.g. 'Draft milestone sprint schedule for Core API v3' or 'Which assets need restock?')..."
          className="flex-1 bg-transparent px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!inputPrompt.trim() || loading}
          className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition-all cursor-pointer"
        >
          <span>Analyze</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
