import React, { useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Sparkles, Trash2, Loader2 } from 'lucide-react';
import { useChatbot } from '../contexts/ChatbotContext.jsx';
import { useLang } from '../useLang';
import { Diya } from '../themeComponents';

export default function Chatbot() {
  const { isOpen, toggleChatbot, messages, loading, sendMessage, clearMessages, inputValue, setInputValue } = useChatbot();
  const { t } = useLang();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => { if (isOpen) setTimeout(() => inputRef.current?.focus(), 80); }, [isOpen]);

  const onKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };
  const handleSend = () => { if (!loading && inputValue.trim()) sendMessage(inputValue); };

  if (!isOpen) {
    return (
      <div aria-label="Open AI Assistant" onClick={toggleChatbot} className="fixed bottom-5 right-5 z-40 group cursor-pointer">
        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-amber-400 to-rose-400 shadow-xl flex items-center justify-center group-hover:hidden transition-all">
          <Diya className="w-8 h-8" />
        </div>
        <div className="hidden group-hover:flex items-center px-4 py-3 rounded-full bg-gradient-to-r from-amber-400 to-rose-400 shadow-xl transition-all">
          <div className="flex items-center justify-center rounded-full bg-indigo-700 w-7 h-7 mr-3">
            <Diya className="w-5 h-5" />
          </div>
          <span className="text-base font-semibold text-indigo-950">{t('aiAsk') || 'Ask Anubhav AI'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={toggleChatbot} />
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-indigo-950/95 text-indigo-50 shadow-2xl flex flex-col">
        <div className="p-4 border-b border-indigo-400/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-amber-300" />
            <span className="font-semibold">{t('aiTitle') || 'Anubhav AI'}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={clearMessages} className="p-1 hover:bg-indigo-800/50 rounded-full" aria-label="Clear chat" title={t('clearChat') || 'Clear chat'}>
              <Trash2 className="w-4 h-4 text-indigo-300" />
            </button>
            <button onClick={toggleChatbot} className="p-1 hover:bg-indigo-800/50 rounded-full" aria-label="Close chat">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4 overflow-auto flex-1">
          {messages.map((m) => (
            <div key={m.id} className={`${m.isUser ? 'bg-indigo-700/60 border-indigo-500/25 ml-8' : 'bg-indigo-900/60 border-indigo-300/25 mr-8'} ${m.isError ? 'border-red-500/40 bg-red-900/20' : ''} rounded-2xl p-3 text-sm border relative`}>
              {!m.isUser && (
                <div className="absolute -left-2 -top-2 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-900" />
                </div>
              )}
              {m.content}
            </div>
          ))}
          {loading && (
            <div className="bg-indigo-900/60 border-indigo-300/25 mr-8 rounded-2xl p-3 text-sm border flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
              <span>{t('aiThinking') || 'Thinking…'}</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-3 border-t border-indigo-400/20 flex gap-2">
          <textarea ref={inputRef} className="flex-1 px-3 py-2.5 rounded-xl bg-indigo-900/60 border border-indigo-300/25 placeholder-indigo-200/70 resize-none max-h-32" placeholder={t('aiPlaceholder') || 'Ask about ghats, temples, routes…'} value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={onKeyDown} rows="2" />
          <button className="px-4 py-2.5 rounded-xl bg-amber-400 text-indigo-950 flex items-center justify-center disabled:opacity-50" onClick={handleSend} disabled={loading || !inputValue.trim()}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
