import React, { createContext, useContext, useEffect, useState } from 'react';
// Calls go through the server wrapper
import { useLang } from '../useLang';

const ChatbotContext = createContext();

export const useChatbot = () => useContext(ChatbotContext);

export function ChatbotProvider({ children, mapRef, filters, setFilters, centerMapOn }) {
  const { lang, t } = useLang();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const abortRef = React.useRef(null);

  useEffect(() => {
    const welcome = { id: 'welcome', content: t('aiWelcomeMessage') || "Hi, I'm Anubhav AI. How can I help you at Simhastha?", isUser: false, timestamp: new Date() };
    setMessages(prev => {
      if (prev.length === 0) return [welcome];
      if (prev[0]?.id !== 'welcome') return [welcome, ...prev];
      if (prev[0]?.content !== welcome.content) return [welcome, ...prev.slice(1)];
      return prev;
    });
  }, [lang]);

  const toggleChatbot = () => setIsOpen(o => !o);

  const executeCommands = async (cmds = []) => {
    for (const cmd of cmds) {
      if (cmd.type === 'toggleLayer' && setFilters) {
        const key = cmd.layer;
        if (key in (filters || {})) setFilters(prev => ({ ...prev, [key]: true }));
      }
      if (cmd.type === 'focus' && centerMapOn) {
        await centerMapOn(cmd.location);
      }
      if (cmd.type === 'route') {
        // Future: integrate routing service
        console.log('Route requested:', cmd.origin, '->', cmd.destination);
      }
    }
  };

  const sendMessage = async (text) => {
    if (!text?.trim()) return;
    const userMsg = { id: `${Date.now()}`, content: text, isUser: true, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);
    // cancel previous request if any
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const systemContext = {
        language: lang,
        layers: filters,
        currentView: mapRef?.current ? { center: mapRef.current.getCenter?.(), zoom: mapRef.current.getZoom?.() } : null,
      };
      const history = messages.filter(m => !m.isError);
      const correlationId = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history, systemContext, correlationId }),
        signal: controller.signal,
      });
      const data = await res.json().catch(() => ({}));
      const content = data?.text || data?.error || 'Sorry, I hit an error—please retry.';
      const aiMsg = { id: `ai-${Date.now()}`, content, isUser: false, timestamp: new Date(), correlationId };
      setMessages(prev => [...prev, aiMsg]);
      if (data?.text) {
        // Defer map actions after replying so UI is not blocked
        setTimeout(() => {
          // Extract commands client-side if present in text
          const cmds = [];
          const text = data.text;
          (text.match(/\[SHOW_LAYER:[^\]]+\]|\[FOCUS:[^\]]+\]|\[ROUTE:[^\]]+\]/g) || []).forEach(token => {
            if (token.startsWith('[SHOW_LAYER:')) {
              const layer = token.replace('[SHOW_LAYER:','').replace(']','');
              cmds.push({ type: 'toggleLayer', layer });
            } else if (token.startsWith('[FOCUS:')) {
              const location = token.replace('[FOCUS:','').replace(']','');
              cmds.push({ type: 'focus', location });
            }
          });
          if (cmds.length) executeCommands(cmds);
        }, 0);
      }
    } catch (e) {
      const aborted = e?.name === 'AbortError';
      if (!aborted) {
        setMessages(prev => [...prev, { id: `err-${Date.now()}`, content: 'Sorry, I hit an error—please retry.', isUser: false, isError: true }]);
      }
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([{ id: 'welcome', content: t('aiWelcomeMessage') || "Hi, I'm Anubhav AI. How can I help you at Simhastha?", isUser: false, timestamp: new Date() }]);
  };

  const value = { isOpen, toggleChatbot, messages, loading, inputValue, setInputValue, sendMessage, clearMessages };
  return <ChatbotContext.Provider value={value}>{children}</ChatbotContext.Provider>;
}

export default ChatbotContext;
