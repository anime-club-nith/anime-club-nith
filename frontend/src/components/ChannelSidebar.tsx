import { Hash, ChevronDown, LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ChannelSidebarProps {
  activeRoomSlug?: string;
  onSelectRoom: (slug: string) => void;
  joinedSlugs: string[];
  currentUser: { name: string; email: string } | null;
  unreadMentions?: Record<string, number>;
  onLogout: () => void;
}

export default function ChannelSidebar({ activeRoomSlug, onSelectRoom, joinedSlugs, currentUser, unreadMentions, onLogout }: ChannelSidebarProps) {
  const navigate = useNavigate();
  
  let avatarUrl = '';
  try {
    const cached = localStorage.getItem("authUser");
    if (cached) {
      const parsed = JSON.parse(cached);
      avatarUrl = parsed.avatar || '';
    }
  } catch { /* ignore */ }

  if (!avatarUrl) {
    const avatarSeed = currentUser?.name || currentUser?.email || 'User';
    avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(avatarSeed)}`;
  }

  return (
    <div className="flex flex-col w-60 h-screen bg-[#f2f3f5] dark:bg-[#2b2d31] border-r border-slate-200/40 dark:border-slate-900/40 flex-shrink-0">
      {/* Server Header */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-900/60 cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700/30 transition-colors flex-shrink-0">
        <span className="font-bold text-sm text-black dark:text-white truncate">Anime Club NITH</span>
        <ChevronDown size={16} className="text-slate-500 dark:text-slate-400 flex-shrink-0" />
      </div>

      {/* Channels List */}
      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-0.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <p className="px-2 mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          Text Channels
        </p>
        {joinedSlugs.length === 0 && (
          <p className="px-2 text-xs text-slate-400 dark:text-slate-500 mt-4">No rooms joined yet.</p>
        )}
        {joinedSlugs.map((slug) => {
          const isActive = slug === activeRoomSlug;
          return (
            <button
              key={slug}
              onClick={() => onSelectRoom(slug)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer group ${
                isActive
                  ? 'bg-pink-500/15 text-pink-600 dark:text-pink-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700/40 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Hash size={16} className={isActive ? 'text-pink-500' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'} />
              <span className="truncate flex-1 text-left">{slug.replace(/-/g, ' ')}</span>
              {unreadMentions && unreadMentions[slug] > 0 && (
                <span className="bg-pink-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 min-w-5 text-center shadow-sm">
                  {unreadMentions[slug]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* User Footer */}
      {currentUser && (
        <div className="flex-shrink-0 h-14 px-2 flex items-center justify-between bg-slate-200/70 dark:bg-[#232428] border-t border-slate-200/40 dark:border-slate-900/40">
          <div 
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 flex-1 min-w-0 p-1 rounded-md hover:bg-slate-300/40 dark:hover:bg-slate-800/45 cursor-pointer transition-colors"
            title="Edit Profile"
          >
            <img
              src={avatarUrl}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full bg-white flex-shrink-0 object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-black dark:text-white truncate">{currentUser.name}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{currentUser.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => navigate('/profile')}
              className="p-1.5 rounded-md hover:bg-slate-300/40 dark:hover:bg-slate-700/40 text-slate-500 dark:text-slate-400 hover:text-pink-500 dark:hover:text-pink-400 transition-colors cursor-pointer"
              title="Settings"
            >
              <Settings size={15} />
            </button>
            <button
              onClick={onLogout}
              className="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
