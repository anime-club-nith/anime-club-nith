import React, { useEffect, useState } from "react";
import { Box, Cpu, Cloud, Palette, Layout, Server, Hash, Plus } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface Room {
  id: number;
  title: string;
  slug: string;
  icon: React.ElementType;
}

const ROOMS: Room[] = [
  { id: 1, title: "Blockchain", slug: "blockchain", icon: Box },
  { id: 2, title: "Yaps", slug: "yaps", icon: Hash },
  { id: 3, title: "AI/ML", slug: "ai-ml", icon: Cpu },
  { id: 4, title: "Cloud", slug: "cloud", icon: Cloud },
  { id: 5, title: "Design", slug: "design", icon: Palette },
  { id: 6, title: "Frontend", slug: "frontend", icon: Layout },
  { id: 7, title: "Backend", slug: "backend", icon: Server },
];

interface RoomSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function RoomSidebar({ isOpen = true, onClose }: RoomSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const [joinedSlugs, setJoinedSlugs] = useState<string[]>([]);
  const [_isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJoinedRooms = async () => {
      try {
        const cached = localStorage.getItem("joinedRooms");
        if (cached) {
          const parsed: string[] = JSON.parse(cached);
          setJoinedSlugs(parsed);
          setIsLoading(false);
        }
      } catch {
        // ignore
      }

      try {
        const res = await fetch("/api/room/joined", {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          const slugs = (data.rooms || []).map(
            (room: { roomId: string }) => room.roomId
          );
          setJoinedSlugs(slugs);
          localStorage.setItem("joinedRooms", JSON.stringify(slugs));
        }
      } catch (err) {
        console.error("Failed to fetch joined rooms:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJoinedRooms();
  }, [location.pathname]);

  const joinedRooms = ROOMS.filter((room) => {
    return joinedSlugs.some(
      (slug) => slug.toLowerCase() === room.slug.toLowerCase()
    );
  });

  const handleNavigation = (slug: string) => {
    const targetPath = `/room/${slug}`;
    navigate(targetPath);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
          onClick={onClose}
        />
      )}

      <nav
        className={`
          flex flex-col items-center py-3 gap-2
          bg-[#e3e5e8] dark:bg-[#1e1f22]
          w-[72px] h-screen
          border-r border-slate-300/40 dark:border-slate-900/40
          flex-shrink-0
          fixed top-0 left-0 z-50
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static md:sticky md:inset-auto
        `}
      >
        {/* Brand / Logo */}
        <div
          className="w-12 h-12 rounded-[24px] hover:rounded-[16px] transition-all duration-200 overflow-hidden bg-pink-500 flex items-center justify-center cursor-pointer shadow-md"
          onClick={() => navigate("/")}
        >
          <img
            src="/logo-light.png"
            alt="Anime Club NITH"
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = '<span class="font-black text-white text-xs uppercase">AC</span>';
              }
            }}
          />
        </div>

        {/* Separator */}
        <div className="w-8 h-0.5 bg-slate-300 dark:bg-slate-700 rounded-full my-1" />

        {/* Navigation Items */}
        <div className="flex-1 w-full flex flex-col items-center gap-2 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {joinedRooms.map((room) => {
            const isActive = currentPath.includes(room.slug);
            const IconComponent = room.icon;

            return (
              <button
                key={room.id}
                onClick={() => handleNavigation(room.slug)}
                className={`
                  relative group w-12 h-12 flex items-center justify-center cursor-pointer
                  transition-all duration-200 shadow-sm
                  ${isActive
                    ? 'rounded-[16px] bg-pink-500'
                    : 'rounded-[24px] hover:rounded-[16px] bg-white dark:bg-[#313338] hover:bg-pink-100 dark:hover:bg-pink-500/20'
                  }
                `}
                aria-label={`Navigate to ${room.title}`}
              >
                <IconComponent
                  size={22}
                  className={isActive ? 'text-white' : 'text-slate-600 dark:text-slate-400'}
                />

                {/* Tooltip */}
                <div className="absolute left-14 px-3 py-1.5 rounded-lg bg-[#111214] text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-xl">
                  {room.title}
                </div>

                {/* Active indicator pill */}
                {isActive && (
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-white dark:bg-white rounded-r-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Add / Join Rooms */}
        <div className="mb-2">
          <button
            onClick={() => navigate("/join-room")}
            className="w-12 h-12 rounded-[24px] hover:rounded-[16px] transition-all duration-200 bg-white dark:bg-[#313338] flex items-center justify-center cursor-pointer shadow-sm border-2 border-dashed border-slate-300 dark:border-slate-600 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20"
            title="Join another room"
          >
            <Plus size={22} />
          </button>
        </div>
      </nav>
    </>
  );
}
