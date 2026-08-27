import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Sparkles, Minimize2 } from 'lucide-react';
import { api } from '../lib/api';
import { cn } from '../lib/utils';
import { useLocation } from 'react-router-dom';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIChatbox() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Show a welcome message when opened for the first time
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        { role: 'assistant', content: 'Hello! I am your AI learning assistant for the India Official Statistical System. I can answer questions about survey design, national accounts, iGOT courses, or explain quiz results. How can I help you today?' }
      ]);
    }
  }, [isOpen]);

  // Contextual hint based on route
  const getContextHint = () => {
    if (location.pathname.includes('/quiz')) return "Ask me to explain a quiz concept.";
    if (location.pathname.includes('/competency')) return "Ask me how to improve a specific skill gap.";
    if (location.pathname.includes('/courses')) return "Ask me for a course recommendation.";
    return "Ask me anything about official statistics...";
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user' as const, content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Filter out error messages so we don't send them back as context
      const filtered = [...messages, userMessage]
        .filter(m => !m.content.includes("I'm currently unable to connect to the AI model"));
        
      // Collapse consecutive messages of the same role (prevents LM Studio prompt template crashes)
      const chatHistory: { role: string; content: string }[] = [];
      for (const m of filtered) {
        if (chatHistory.length > 0 && chatHistory[chatHistory.length - 1].role === m.role) {
          chatHistory[chatHistory.length - 1].content += "\n\n" + m.content;
        } else {
          chatHistory.push({ role: m.role, content: m.content });
        }
      }
        
      let currentResponse = '';
      let isFirstChunk = true;
      
      for await (const chunk of api.chatStream(chatHistory)) {
        currentResponse += chunk;
        
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMsg = newMessages[newMessages.length - 1];
          if (lastMsg && lastMsg.role === 'user') {
            // First chunk: add the assistant message
            newMessages.push({ role: 'assistant', content: currentResponse });
          } else {
            // Subsequent chunks: update the assistant message
            newMessages[newMessages.length - 1] = { role: 'assistant', content: currentResponse };
          }
          return newMessages;
        });
        
        if (isFirstChunk) {
          setLoading(false);
          isFirstChunk = false;
        }
      }
    } catch (err: any) {
      setMessages(prev => {
        const newMessages = [...prev];
        // If we haven't started streaming, push a new error message.
        if (newMessages[newMessages.length - 1].role === 'user') {
          newMessages.push({ role: 'assistant', content: `Error: ${err.message || 'Failed to connect to local AI model. Ensure LM Studio/Ollama is running.'}` });
        } else {
          // Otherwise append to the streaming message
          newMessages[newMessages.length - 1].content += `\n\nError: ${err.message}`;
        }
        return newMessages;
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-orange-500/30 hover:scale-105 transition-transform z-50 group"
      >
        <MessageCircle className="h-6 w-6 group-hover:scale-110 transition-transform" />
      </button>
    );
  }

  return (
    <div className={cn(
      "fixed right-4 sm:right-6 bottom-4 sm:bottom-6 w-[calc(100vw-2rem)] sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 flex flex-col overflow-hidden transition-all duration-300",
      isMinimized ? "h-14" : "h-[600px] max-h-[85vh]"
    )}>
      {/* Header */}
      <div 
        className="bg-gradient-to-r from-[#0F204C] to-[#1a3366] p-4 flex justify-between items-center cursor-pointer select-none"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-white/10 rounded-full flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-orange-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">SkillOS Assistant</h3>
            <p className="text-blue-200 text-[10px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Local AI Ready
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button 
            className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded"
          >
            <Minimize2 className="h-4 w-4" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
            className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 scrollbar-thin">
            {messages.map((msg, i) => (
              <div key={i} className={cn("flex gap-3 max-w-[85%]", msg.role === 'user' ? "ml-auto flex-row-reverse" : "")}>
                <div className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                  msg.role === 'user' ? "bg-slate-200 text-slate-600" : "bg-orange-100 text-orange-600"
                )}>
                  {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div className={cn(
                  "p-3 rounded-2xl text-sm whitespace-pre-wrap",
                  msg.role === 'user' 
                    ? "bg-[#0F204C] text-white rounded-tr-sm" 
                    : "bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm"
                )}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 max-w-[85%]">
                <div className="h-8 w-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-2xl rounded-tl-sm shadow-sm">
                  <span className="text-sm font-medium text-slate-500 animate-pulse">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-slate-200">
            <form onSubmit={handleSubmit} className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={getContextHint()}
                className="w-full bg-slate-100 border-transparent focus:bg-white focus:border-orange-300 focus:ring-2 focus:ring-orange-100 rounded-xl pl-4 pr-12 py-3 text-sm transition-all"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="absolute right-1.5 top-1.5 bottom-1.5 bg-[#0F204C] text-white p-2 rounded-lg hover:bg-[#1a3366] disabled:opacity-50 transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
