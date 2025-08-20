import React, { createContext, useContext, useEffect, useState } from 'react';
import { sendMessageToGemini } from '../services/geminiService';
import { useLang } from '../useLang';

const ChatbotContext = createContext();

export const useChatbot = () => useContext(ChatbotContext);

export function ChatbotProvider({ children, mapRef, filters, setFilters, centerMapOn }) {
  const { lang, t } = useLang();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');

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
    try {
      const systemContext = {
        language: lang,
        layers: filters,
        currentView: mapRef?.current ? { center: mapRef.current.getCenter?.(), zoom: mapRef.current.getZoom?.() } : null,
      };
  // Build fresh history without the just-added user message; service will include it separately
  const history = messages.filter(m => m.id !== userMsg.id);
  const resp = await sendMessageToGemini(text, history, systemContext);
      const aiMsg = { id: `ai-${Date.now()}`, content: resp.text, isUser: false, timestamp: new Date() };
      setMessages(prev => [...prev, aiMsg]);
      if (resp.commands?.length) executeCommands(resp.commands);
    } catch (e) {
      setMessages(prev => [...prev, { id: `err-${Date.now()}`, content: t('aiError') || 'Sorry, something went wrong.', isUser: false, isError: true }]);
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
