import { 
  MessageSquare, Film, Palette, Sparkles, Star
} from 'lucide-react';

export default function TechStack() {
  return (
    <div className="bg-white dark:bg-[#0c0d12] text-black dark:text-white font-sans py-20 px-6 border-t border-slate-200/60 dark:border-slate-800/60 transition-colors">
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-100 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 text-xs font-semibold border border-pink-200 dark:border-pink-500/20 mb-6">
            <Star size={13} className="text-pink-500 fill-pink-500" />
            <span>Club Activities</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-black dark:text-white mb-5">
            Dive into the <span className="text-pink-500">Otaku Circle</span>
          </h1>
          <p className="text-lg font-medium text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Anime Club NITH is the premier space at NIT Hamirpur for fans to connect, discuss seasonal anime, share fanart/cosplays, and organize club events.
          </p>
        </div>

        {/* 1. HERO: Real-time Community Discussions */}
        <div className="mb-6">
          <div className="card-modern p-8 md:p-10 relative overflow-hidden group">
            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
              <div className="w-14 h-14 rounded-2xl bg-pink-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-pink-500/30">
                <MessageSquare className="text-white w-7 h-7" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-2xl font-black uppercase text-black dark:text-white mb-3">Real-time Chat &amp; Discussions</h3>
                <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed mb-6">
                  Connect instantly with other otaku on campus. Share your immediate reactions to weekly episode drops, discuss manga plot twists, ask for recommendations, and organize local meetups. Our clean chat channels bring the NITH anime community right to your fingertips.
                </p>
                
                {/* Club Channel Badges */}
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full bg-pink-100 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 text-xs font-semibold border border-pink-200 dark:border-pink-500/20">#general</span>
                  <span className="px-3 py-1 rounded-full bg-pink-100 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 text-xs font-semibold border border-pink-200 dark:border-pink-500/20">#seasonal-discussion</span>
                  <span className="px-3 py-1 rounded-full bg-pink-100 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 text-xs font-semibold border border-pink-200 dark:border-pink-500/20">#manga-recs</span>
                  <span className="px-3 py-1 rounded-full bg-pink-100 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 text-xs font-semibold border border-pink-200 dark:border-pink-500/20">#memes</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. GRID: Watch Parties & Showcases */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          
          {/* Watch Parties */}
          <div className="card-modern p-8">
            <div className="w-12 h-12 rounded-2xl bg-pink-500 flex items-center justify-center mb-6 shadow-md shadow-pink-500/30">
              <Film className="text-white" size={22} />
            </div>
            <h3 className="text-xl font-black uppercase text-black dark:text-white mb-3">Weekly Watch Parties</h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm font-medium leading-relaxed mb-5">
              Join fellow club members for weekend anime screenings, movie nights, and legendary watch parties right at the NIT Hamirpur Open Air Theatre (OAT) or within our online watchrooms. Grab snacks and share the experience live!
            </p>
            <div className="flex gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-pink-100 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 text-[10px] font-semibold border border-pink-200 dark:border-pink-500/20 uppercase tracking-wide">Campus OAT</span>
              <span className="px-2.5 py-1 rounded-lg bg-pink-100 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 text-[10px] font-semibold border border-pink-200 dark:border-pink-500/20 uppercase tracking-wide">Online Stream</span>
            </div>
          </div>

          {/* Creative Showcase */}
          <div className="card-modern p-8">
            <div className="w-12 h-12 rounded-2xl bg-pink-500 flex items-center justify-center mb-6 shadow-md shadow-pink-500/30">
              <Palette className="text-white" size={22} />
            </div>
            <h3 className="text-xl font-black uppercase text-black dark:text-white mb-3">Creative Showcase</h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm font-medium leading-relaxed mb-5">
              Showcase your talent to the entire campus! Publish your custom anime drawings, digital art, cosplay journals, reviews, or character deep-dives on our community showcase wall and get helpful feedback from other artists.
            </p>
            <div className="flex gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-pink-100 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 text-[10px] font-semibold border border-pink-200 dark:border-pink-500/20 uppercase tracking-wide">Fan Art</span>
              <span className="px-2.5 py-1 rounded-lg bg-pink-100 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 text-[10px] font-semibold border border-pink-200 dark:border-pink-500/20 uppercase tracking-wide">Cosplay Logs</span>
            </div>
          </div>

        </div>

        {/* 3. Member-Driven Club Events */}
        <div className="card-modern p-8 flex flex-col md:flex-row items-start md:items-center gap-8">
          <div className="w-12 h-12 rounded-2xl bg-pink-500 flex items-center justify-center shadow-md shadow-pink-500/30 flex-shrink-0">
            <Sparkles className="text-white" size={22} />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-black uppercase text-black dark:text-white mb-3">Member-Driven Club Events</h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm font-medium leading-relaxed">
              We believe in a democratic community. Every member can propose and vote on future watch party line-ups, campus cosplay themes, local club merchandise designs, or site features. Submit a feature request or event suggestion right from your portal!
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}