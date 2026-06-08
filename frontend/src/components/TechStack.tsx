import { 
  Database, Server, Wind, Lock, Mail, Cloud, Cpu, Radio 
} from 'lucide-react';

export default function TechStack() {
  return (
    <div className="bg-white dark:bg-[#0c0d12] text-black dark:text-white font-sans py-20 px-6 border-t-4 border-black dark:border-white transition-colors">
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 border-4 border-black dark:border-white bg-pink-100 dark:bg-[#2b1724] text-black dark:text-white font-black uppercase text-xs shadow-[3px_3px_0px_#000] dark:shadow-[3px_3px_0px_#E56DB1] mb-6">
            <Cpu size={14} />
            <span>Architecture Overview</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-black dark:text-white mb-6">
            Built for <span className="text-pink-500">Scale & Speed</span>
          </h1>
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
             A deep dive into the modern stack powering Anime Club NITH's real-time capabilities, security protocols, and cloud infrastructure.
          </p>
        </div>

        {/* 1. HERO: Real-time Architecture */}
        <div className="mb-8">
           <div className="p-8 md:p-12 border-4 border-black dark:border-white bg-white dark:bg-[#161822] shadow-[8px_8px_0px_#000] dark:shadow-[8px_8px_0px_#E56DB1] relative overflow-hidden group">
              <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
                 <div className="w-16 h-16 border-4 border-black dark:border-white bg-pink-500 text-black flex items-center justify-center flex-shrink-0 shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#E56DB1]">
                    <Radio className="text-black w-8 h-8" />
                 </div>
                 
                 <div className="flex-1">
                    <h3 className="text-2xl font-black uppercase text-black dark:text-white mb-3">Event-Driven Real-time Engine</h3>
                    <p className="text-gray-700 dark:text-gray-300 font-semibold leading-relaxed mb-6">
                       The core communication layer is built on <span className="text-pink-600 font-black">Node.js</span> and <span className="text-pink-600 font-black">Socket.io</span>. 
                       This enables bidirectional, low-latency communication where the server pushes events (new messages, typing indicators) instantly to the client.
                       On the frontend, the <span className="text-pink-600 font-black">React.js</span> client uses <code>socket.io-client</code> to maintain persistent connections, ensuring the UI updates in milliseconds without page reloads.
                    </p>
                    
                    {/* Tech Badges */}
                    <div className="flex flex-wrap gap-3">
                       <span className="px-3 py-1 border-2 border-black dark:border-white bg-pink-100 dark:bg-[#2b1724] text-xs font-mono font-black uppercase text-black dark:text-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#E56DB1]">Node.js</span>
                       <span className="px-3 py-1 border-2 border-black dark:border-white bg-pink-100 dark:bg-[#2b1724] text-xs font-mono font-black uppercase text-black dark:text-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#E56DB1]">Socket.io</span>
                       <span className="px-3 py-1 border-2 border-black dark:border-white bg-pink-100 dark:bg-[#2b1724] text-xs font-mono font-black uppercase text-black dark:text-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#E56DB1]">React.js</span>
                       <span className="px-3 py-1 border-2 border-black dark:border-white bg-pink-100 dark:bg-[#2b1724] text-xs font-mono font-black uppercase text-black dark:text-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#E56DB1]">WebSockets</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* 2. GRID: Security & Utilities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
           
           {/* JWT Auth */}
           <div className="p-8 border-4 border-black dark:border-white bg-white dark:bg-[#161822] shadow-[8px_8px_0px_#000] dark:shadow-[8px_8px_0px_#E56DB1]">
              <div className="w-12 h-12 border-4 border-black dark:border-white bg-pink-500 text-black flex items-center justify-center mb-6 shadow-[3px_3px_0px_#000] dark:shadow-[3px_3px_0px_#E56DB1]">
                 <Lock className="text-black" size={24} />
              </div>
              <h3 className="text-xl font-black uppercase text-black dark:text-white mb-3">JWT Authentication</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm font-semibold leading-relaxed mb-4">
                 Stateless authentication using JSON Web Tokens. We utilize secure signing algorithms to verify identity on every request, ensuring protected routes remain inaccessible to unauthorized users while maintaining session scalability.
              </p>
              <div className="flex gap-2">
                 <span className="px-2 py-1 border-2 border-black dark:border-white bg-pink-100 dark:bg-[#2b1724] text-black dark:text-white text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#E56DB1]">Security</span>
                 <span className="px-2 py-1 border-2 border-black dark:border-white bg-pink-100 dark:bg-[#2b1724] text-black dark:text-white text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#E56DB1]">Middleware</span>
              </div>
           </div>

           {/* Nodemailer */}
           <div className="p-8 border-4 border-black dark:border-white bg-white dark:bg-[#161822] shadow-[8px_8px_0px_#000] dark:shadow-[8px_8px_0px_#E56DB1]">
              <div className="w-12 h-12 border-4 border-black dark:border-white bg-pink-500 text-black flex items-center justify-center mb-6 shadow-[3px_3px_0px_#000] dark:shadow-[3px_3px_0px_#E56DB1]">
                 <Mail className="text-black" size={24} />
              </div>
              <h3 className="text-xl font-black uppercase text-black dark:text-white mb-3">Transactional Email</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm font-semibold leading-relaxed mb-4">
                 Powered by <span className="text-black dark:text-white font-black">Nodemailer</span>. We handle critical user flows like Account Verification and Secure Password Resets through a reliable SMTP transport service, delivering HTML-formatted emails directly to the inbox.
              </p>
              <div className="flex gap-2">
                 <span className="px-2 py-1 border-2 border-black dark:border-white bg-pink-100 dark:bg-[#2b1724] text-black dark:text-white text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#E56DB1]">SMTP</span>
                 <span className="px-2 py-1 border-2 border-black dark:border-white bg-pink-100 dark:bg-[#2b1724] text-black dark:text-white text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#E56DB1]">Backend</span>
              </div>
           </div>

        </div>

        {/* 3. GRID: Other Tech */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
           
           <div className="p-6 border-4 border-black dark:border-white bg-white dark:bg-[#161822] flex flex-col items-center justify-center text-center gap-3 shadow-[5px_5px_0px_#000] dark:shadow-[5px_5px_0px_#E56DB1] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_#000] dark:hover:shadow-[3px_3px_0px_#E56DB1] transition-all">
              <Database className="text-pink-500" size={24} />
              <div>
                 <div className="font-black uppercase text-black dark:text-white text-sm">MongoDB</div>
                 <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">NoSQL Database</div>
              </div>
           </div>

           <div className="p-6 border-4 border-black dark:border-white bg-white dark:bg-[#161822] flex flex-col items-center justify-center text-center gap-3 shadow-[5px_5px_0px_#000] dark:shadow-[5px_5px_0px_#E56DB1] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_#000] dark:hover:shadow-[3px_3px_0px_#E56DB1] transition-all">
              <Server className="text-pink-500" size={24} />
              <div>
                 <div className="font-black uppercase text-black dark:text-white text-sm">Express.js</div>
                 <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">REST API Framework</div>
              </div>
           </div>

           <div className="p-6 border-4 border-black dark:border-white bg-white dark:bg-[#161822] flex flex-col items-center justify-center text-center gap-3 shadow-[5px_5px_0px_#000] dark:shadow-[5px_5px_0px_#E56DB1] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_#000] dark:hover:shadow-[3px_3px_0px_#E56DB1] transition-all">
              <Wind className="text-pink-500" size={24} />
              <div>
                 <div className="font-black uppercase text-black dark:text-white text-sm">Tailwind CSS</div>
                 <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">Utility-first Styling</div>
              </div>
           </div>

           <div className="p-6 border-4 border-black dark:border-white bg-white dark:bg-[#161822] flex flex-col items-center justify-center text-center gap-3 shadow-[5px_5px_0px_#000] dark:shadow-[5px_5px_0px_#E56DB1] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_#000] dark:hover:shadow-[3px_3px_0px_#E56DB1] transition-all">
              <Cloud className="text-pink-500" size={24} />
              <div>
                 <div className="font-black uppercase text-black dark:text-white text-sm">AWS S3</div>
                 <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">File Storage</div>
              </div>
           </div>

        </div>

      </div>
    </div>
  );
}