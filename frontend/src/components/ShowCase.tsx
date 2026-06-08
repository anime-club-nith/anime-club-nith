import React, { useState, useRef, useEffect } from 'react';
import { Bot, User, Sparkles, ArrowUp } from 'lucide-react';

interface MockMessage {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

export default function ShowCase() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<MockMessage[]>([
    { id: 1, text: "Konnichiwa! I'm Senpai. Welcome to the Anime Club NITH portal! Ask me anything about our club, upcoming events, or let's just talk about anime! 🌸", sender: 'bot' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // 1. Add User Message
    const userMsg: MockMessage = { id: Date.now(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // 2. Simulate Senpai response delay
    setTimeout(() => {
      setIsTyping(false);
      
      const userText = input.toLowerCase();
      let replyText = "";
      
      if (userText.includes("hello") || userText.includes("hi") || userText.includes("hey") || userText.includes("konnichiwa")) {
        replyText = "Konnichiwa! Hope you are having a subarashii day! What anime are you currently watching? 🇯🇵";
      } else if (userText.includes("watch") || userText.includes("party") || userText.includes("event") || userText.includes("oat")) {
        replyText = "We host watch parties almost every week at the campus OAT or in our online streaming rooms! Keep an eye on the #announcements channel in the chat! 🎬";
      } else if (userText.includes("recommend") || userText.includes("suggest") || userText.includes("best")) {
        const recs = [
          "Steins;Gate (a masterpiece of sci-fi and time travel!)",
          "Frieren: Beyond Journey's End (beautiful storytelling and pacing)",
          "Attack on Titan (epic scale and mystery)",
          "Jujutsu Kaisen (insane animation and fight choreography)"
        ];
        const randomRec = recs[Math.floor(Math.random() * recs.length)];
        replyText = `You should definitely check out ${randomRec}! Tell me what genres you like for more suggestions! 🌸`;
      } else if (userText.includes("cosplay") || userText.includes("dress")) {
        replyText = "Oh! Cosplay planning is in full swing! Several members are preparing outfits for Hillffair. Check out the #cosplay room once you sign in! 🎭";
      } else if (userText.includes("join") || userText.includes("member") || userText.includes("register")) {
        replyText = "Just click on 'Sign Up' at the top of this page! You can create an account using your email or sign in instantly with Google! 🚀";
      } else {
        const defaultReplies = [
          "Sugoi! That sounds awesome! You should definitely share that in our general chatroom! 💬",
          "Aha! A fellow person of culture! What is your top 3 favorite anime of all time? 🇯🇵",
          "Don't forget, the first rule of Anime Club is: You DO talk about Anime! See you at the next watch party! 🎬",
          "Nani?! That's interesting! Let's discuss it in the seasonal chat channel once you sign in! 🌸",
          "El Psy Congroo! That conversation is destined by Steins;Gate. See you in the chat room!"
        ];
        replyText = defaultReplies[Math.floor(Math.random() * defaultReplies.length)];
      }

      const botMsg: MockMessage = { 
        id: Date.now() + 1, 
        text: replyText, 
        sender: 'bot' 
      };
      setMessages(prev => [...prev, botMsg]);
    }, 800);
  };

  return (
    <section className="py-24 px-6 bg-white dark:bg-[#0c0d12] border-t-4 border-black dark:border-white relative overflow-hidden transition-colors">
      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 border-4 border-black dark:border-white bg-pink-100 dark:bg-[#2b1724] text-black dark:text-white font-black uppercase text-xs shadow-[3px_3px_0px_#000] dark:shadow-[3px_3px_0px_#E56DB1] mb-4">
            <Sparkles size={14} />
            <span>Interactive Chat</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black uppercase text-black dark:text-white mb-4">
            Ask <span className="text-pink-500">Senpai!</span>
          </h2>
          <p className="text-gray-700 dark:text-gray-300 font-semibold max-w-lg mx-auto">
            Go ahead, type something below. Senpai is here to answer your questions about the club or discuss your favorite anime!
          </p>
        </div>

        {/* The Mock Chat Interface */}
        <div className="w-full max-w-md mx-auto bg-white dark:bg-[#161822] border-4 border-black dark:border-white shadow-[10px_10px_0px_#000] dark:shadow-[10px_10px_0px_#E56DB1] overflow-hidden flex flex-col h-[500px] transition-all">
          
          {/* Mock Header */}
          <div className="px-6 py-4 border-b-4 border-black dark:border-white bg-white dark:bg-[#161822] flex items-center justify-between transition-colors">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 border-2 border-black dark:border-white bg-pink-500 text-black dark:text-white flex items-center justify-center font-black">
                  <Bot size={20} />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-black dark:border-white rounded-full"></div>
              </div>
              <div>
                <h3 className="text-black dark:text-white font-black uppercase text-sm">Senpai</h3>
                <p className="text-pink-600 text-xs font-black uppercase">Online</p>
              </div>
            </div>
            <div className="flex gap-1.5">
              <div className="w-3.5 h-3.5 border-2 border-black dark:border-white bg-red-500" />
              <div className="w-3.5 h-3.5 border-2 border-black dark:border-white bg-yellow-500" />
              <div className="w-3.5 h-3.5 border-2 border-black dark:border-white bg-green-500" />
            </div>
          </div>

          {/* Messages Area */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] bg-pink-100/5 dark:bg-[#2b1724]/10"
          >
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className={`
                  w-8 h-8 border-2 border-black dark:border-white flex items-center justify-center flex-shrink-0 mt-1
                  ${msg.sender === 'user' ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-pink-500 text-black dark:text-white'}
                `}>
                  {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>

                {/* Bubble */}
                <div className={`
                  max-w-[80%] px-4 py-2.5 border-2 border-black dark:border-white text-sm font-semibold leading-relaxed shadow-[3px_3px_0px_#000] dark:shadow-[3px_3px_0px_#E56DB1]
                  ${msg.sender === 'user' 
                    ? 'bg-pink-100 dark:bg-[#2b1724] text-black dark:text-white' 
                    : 'bg-white dark:bg-[#161822] text-black dark:text-white'}
                `}>
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-3 animate-in fade-in duration-200">
                <div className="w-8 h-8 border-2 border-black dark:border-white bg-pink-500 text-black dark:text-white flex items-center justify-center flex-shrink-0 mt-1">
                   <Bot size={14} />
                </div>
                <div className="bg-white dark:bg-[#161822] border-2 border-black dark:border-white px-4 py-3 shadow-[3px_3px_0px_#000] dark:shadow-[3px_3px_0px_#E56DB1] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-black dark:bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-black dark:bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-black dark:bg-white rounded-full animate-bounce"></span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white dark:bg-[#161822] border-t-4 border-black dark:border-white relative transition-colors">
            <form 
              onSubmit={handleSend}
              className="relative flex items-center"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="w-full bg-white dark:bg-[#161822] border-4 border-black dark:border-white py-3 pl-4 pr-14 text-sm text-black dark:text-white placeholder:text-gray-500 font-semibold focus:outline-none focus:bg-pink-100 dark:focus:bg-[#2b1724] shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#E56DB1] focus:shadow-[2px_2px_0px_#000] dark:focus:shadow-[2px_2px_0px_#E56DB1] transition"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className={`
                  absolute right-2 p-2 border-4 border-black dark:border-white flex items-center justify-center transition-all duration-200 cursor-pointer
                  ${input.trim() 
                    ? 'bg-pink-500 text-black dark:text-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#E56DB1] active:translate-x-[1px] active:translate-y-[1px]' 
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 shadow-none cursor-not-allowed'}
                `}
              >
                <ArrowUp size={16} strokeWidth={3} />
              </button>
            </form>
          </div>

        </div>

      </div>
    </section>
  );
}