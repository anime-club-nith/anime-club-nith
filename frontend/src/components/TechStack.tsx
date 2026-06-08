import { 
  MessageSquare, Film, Palette, Sparkles, Star
} from 'lucide-react';

export default function TechStack() {
  return (
    <div className="bg-white dark:bg-[#0c0d12] text-black dark:text-white font-sans py-20 px-6 border-t-4 border-black dark:border-white transition-colors">
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 border-4 border-black dark:border-white bg-pink-100 dark:bg-[#2b1724] text-black dark:text-white font-black uppercase text-xs shadow-[3px_3px_0px_#000] dark:shadow-[3px_3px_0px_#E56DB1] mb-6">
            <Star size={14} className="text-pink-500 fill-pink-500" />
            <span>Club Activities</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-black dark:text-white mb-6">
            Dive into the <span className="text-pink-500">Otaku Circle</span>
          </h1>
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Anime Club NITH is the premier space at NIT Hamirpur for fans to connect, discuss seasonal anime, share fanart/cosplays, and organize club events.
          </p>
        </div>

        {/* 1. HERO: Real-time Community Discussions */}
        <div className="mb-8">
           <div className="p-8 md:p-12 border-4 border-black dark:border-white bg-white dark:bg-[#161822] shadow-[8px_8px_0px_#000] dark:shadow-[8px_8px_0px_#E56DB1] relative overflow-hidden group">
              <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
                 <div className="w-16 h-16 border-4 border-black dark:border-white bg-pink-500 text-black flex items-center justify-center flex-shrink-0 shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#E56DB1]">
                    <MessageSquare className="text-black w-8 h-8" />
                 </div>
                 
                 <div className="flex-1">
                    <h3 className="text-2xl font-black uppercase text-black dark:text-white mb-3">Real-time Chat & Discussions</h3>
                    <p className="text-gray-700 dark:text-gray-300 font-semibold leading-relaxed mb-6">
                       Connect instantly with other otaku on campus. Share your immediate reactions to weekly episode drops, discuss manga plot twists, ask for recommendations, and organize local meetups. Our clean chat channels bring the NITH anime community right to your fingertips.
                    </p>
                    
                    {/* Club Channel Badges */}
                    <div className="flex flex-wrap gap-3">
                       <span className="px-3 py-1 border-2 border-black dark:border-white bg-pink-100 dark:bg-[#2b1724] text-xs font-mono font-black uppercase text-black dark:text-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#E56DB1]">#general</span>
                       <span className="px-3 py-1 border-2 border-black dark:border-white bg-pink-100 dark:bg-[#2b1724] text-xs font-mono font-black uppercase text-black dark:text-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#E56DB1]">#seasonal-discussion</span>
                       <span className="px-3 py-1 border-2 border-black dark:border-white bg-pink-100 dark:bg-[#2b1724] text-xs font-mono font-black uppercase text-black dark:text-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#E56DB1]">#manga-recs</span>
                       <span className="px-3 py-1 border-2 border-black dark:border-white bg-pink-100 dark:bg-[#2b1724] text-xs font-mono font-black uppercase text-black dark:text-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#E56DB1]">#memes</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* 2. GRID: Watch Parties & Showcases */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
           
           {/* Watch Parties */}
           <div className="p-8 border-4 border-black dark:border-white bg-white dark:bg-[#161822] shadow-[8px_8px_0px_#000] dark:shadow-[8px_8px_0px_#E56DB1]">
              <div className="w-12 h-12 border-4 border-black dark:border-white bg-pink-500 text-black flex items-center justify-center mb-6 shadow-[3px_3px_0px_#000] dark:shadow-[3px_3px_0px_#E56DB1]">
                 <Film className="text-black" size={24} />
              </div>
              <h3 className="text-xl font-black uppercase text-black dark:text-white mb-3">Weekly Watch Parties</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm font-semibold leading-relaxed mb-4">
                 Join fellow club members for weekend anime screenings, movie nights, and legendary watch parties right at the NIT Hamirpur Open Air Theatre (OAT) or within our online watchrooms. Grab snacks and share the experience live!
              </p>
              <div className="flex gap-2">
                 <span className="px-2 py-1 border-2 border-black dark:border-white bg-pink-100 dark:bg-[#2b1724] text-black dark:text-white text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#E56DB1]">Campus OAT</span>
                 <span className="px-2 py-1 border-2 border-black dark:border-white bg-pink-100 dark:bg-[#2b1724] text-black dark:text-white text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#E56DB1]">Online Stream</span>
              </div>
           </div>

           {/* Creative Showcase */}
           <div className="p-8 border-4 border-black dark:border-white bg-white dark:bg-[#161822] shadow-[8px_8px_0px_#000] dark:shadow-[8px_8px_0px_#E56DB1]">
              <div className="w-12 h-12 border-4 border-black dark:border-white bg-pink-500 text-black flex items-center justify-center mb-6 shadow-[3px_3px_0px_#000] dark:shadow-[3px_3px_0px_#E56DB1]">
                 <Palette className="text-black" size={24} />
              </div>
              <h3 className="text-xl font-black uppercase text-black dark:text-white mb-3">Creative Showcase</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm font-semibold leading-relaxed mb-4">
                 Showcase your talent to the entire campus! Publish your custom anime drawings, digital art, cosplay journals, reviews, or character deep-dives on our community showcase wall and get helpful feedback from other artists.
              </p>
              <div className="flex gap-2">
                 <span className="px-2 py-1 border-2 border-black dark:border-white bg-pink-100 dark:bg-[#2b1724] text-black dark:text-white text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#E56DB1]">Fan Art</span>
                 <span className="px-2 py-1 border-2 border-black dark:border-white bg-pink-100 dark:bg-[#2b1724] text-black dark:text-white text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#E56DB1]">Cosplay Logs</span>
              </div>
           </div>

        </div>

        {/* 3. GRID: Member Prosposals & Events */}
        <div className="p-8 border-4 border-black dark:border-white bg-white dark:bg-[#161822] shadow-[8px_8px_0px_#000] dark:shadow-[8px_8px_0px_#E56DB1] flex flex-col md:flex-row items-start md:items-center gap-8">
           <div className="w-12 h-12 border-4 border-black dark:border-white bg-pink-500 text-black flex items-center justify-center shadow-[3px_3px_0px_#000] dark:shadow-[3px_3px_0px_#E56DB1] flex-shrink-0">
              <Sparkles className="text-black" size={24} />
           </div>
           <div className="flex-1">
              <h3 className="text-xl font-black uppercase text-black dark:text-white mb-3">Member-Driven Club Events</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm font-semibold leading-relaxed">
                 We believe in a democratic community. Every member can propose and vote on future watch party line-ups, campus cosplay themes, local club merchandise designs, or site features. Submit a feature request or event suggestion right from your portal!
              </p>
           </div>
        </div>

      </div>
    </div>
  );
}