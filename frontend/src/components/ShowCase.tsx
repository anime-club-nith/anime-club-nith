import React, { useState, useRef, useEffect } from 'react';
import { Bot, User, Sparkles, Send } from 'lucide-react';

interface MockMessage {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

export default function ShowCase() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<MockMessage[]>([
    {
      id: 1,
      text: "Hi there! I'm Senpai, the official assistant of Anime Club NITH. Whether you have questions about our club, upcoming screening events at the OAT, or want to talk anime — I'm here to help.",
      sender: 'bot',
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const messageText = input.trim();
    const userMsg: MockMessage = { id: Date.now(), text: messageText, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    fetch('/api/chat/ask-senpai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: messageText }),
    })
      .then(res => {
        if (!res.ok) throw new Error('API error');
        return res.json();
      })
      .then(data => {
        setIsTyping(false);
        const botMsg: MockMessage = { id: Date.now() + 1, text: data.reply, sender: 'bot' };
        setMessages(prev => [...prev, botMsg]);
      })
      .catch(err => {
        console.error('Failed to fetch Senpai response:', err);
        setIsTyping(false);
        const botMsg: MockMessage = {
          id: Date.now() + 1,
          text: "I'm having a bit of trouble connecting right now. Please try again in a moment, or explore our community chat rooms for discussions!",
          sender: 'bot',
        };
        setMessages(prev => [...prev, botMsg]);
      });
  };

  return (
    <section className="py-24 px-6 bg-[#f8f9fa] dark:bg-[#0c0d12] transition-colors relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/5 dark:bg-pink-500/8 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">

        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-100 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 text-xs font-semibold border border-pink-200 dark:border-pink-500/20 mb-4">
            <Sparkles size={13} />
            <span>AI Assistant</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-black dark:text-white mb-3">
            Chat with <span className="text-pink-500">Senpai</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-base max-w-lg mx-auto leading-relaxed">
            Have a question about the club, upcoming events, or anime? Our AI assistant is ready to help.
          </p>
        </div>

        {/* Chat Interface */}
        <div className="w-full max-w-lg mx-auto bg-white dark:bg-[#1e1f22] rounded-2xl border border-slate-200/60 dark:border-slate-700/40 shadow-2xl shadow-slate-900/10 dark:shadow-black/40 overflow-hidden flex flex-col h-[480px]">

          {/* Chat Header */}
          <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800/60 bg-white dark:bg-[#2b2d31] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-pink-500 flex items-center justify-center shadow-md shadow-pink-500/30">
                  <Bot size={18} className="text-white" />
                </div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white dark:border-[#2b2d31]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-black dark:text-white">Senpai</h3>
                <p className="text-xs text-emerald-500 font-medium">Online · Anime Club NITH</p>
              </div>
            </div>
            {/* macOS-style traffic lights */}
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-5 py-5 space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] bg-[#f8f9fa] dark:bg-[#313338]"
          >
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-slate-700 dark:bg-slate-600'
                    : 'bg-pink-500'
                }`}>
                  {msg.sender === 'user'
                    ? <User size={14} className="text-white" />
                    : <Bot size={14} className="text-white" />
                  }
                </div>

                {/* Bubble */}
                <div className={`max-w-[78%] px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-pink-500 text-white rounded-t-2xl rounded-bl-2xl rounded-br-md'
                    : 'bg-white dark:bg-[#2b2d31] text-black dark:text-[#dbdee1] rounded-t-2xl rounded-br-2xl rounded-bl-md border border-slate-100 dark:border-slate-700/40'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-3 animate-in fade-in duration-200">
                <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                  <Bot size={14} className="text-white" />
                </div>
                <div className="bg-white dark:bg-[#2b2d31] border border-slate-100 dark:border-slate-700/40 px-4 py-3 rounded-t-2xl rounded-br-2xl rounded-bl-md shadow-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="px-4 pb-4 pt-3 bg-white dark:bg-[#2b2d31] border-t border-slate-100 dark:border-slate-800/60">
            <form onSubmit={handleSend} className="flex items-center gap-2 bg-[#f2f3f5] dark:bg-[#383a40] rounded-xl px-3 py-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask Senpai anything..."
                className="flex-1 bg-transparent border-none focus:outline-none text-black dark:text-[#dbdee1] placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 flex-shrink-0 cursor-pointer ${
                  input.trim()
                    ? 'bg-pink-500 hover:bg-pink-400 text-white shadow-sm shadow-pink-500/30'
                    : 'bg-slate-200 dark:bg-slate-600/50 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}