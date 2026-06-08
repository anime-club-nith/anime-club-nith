import React, { useEffect, useState } from "react";
import { Box, Cpu, Cloud, Palette, Layout, Server, Hash, Menu } from "lucide-react";
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

  const activeIndex = joinedRooms.findIndex((room) =>
    currentPath.includes(room.slug)
  );
  const safeActiveIndex = activeIndex >= 0 ? activeIndex : 0;

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
          flex flex-col items-center py-6 bg-white border-r-4 border-black 
          w-20 h-screen 
          fixed top-0 left-0 z-50 
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 md:static md:sticky md:inset-auto
        `}
      >
        <div className="md:hidden w-full flex justify-center mb-4">
          <button
            onClick={onClose}
            className="p-2 text-black hover:text-pink-500 transition-colors cursor-pointer"
          >
            <Menu size={24} strokeWidth={2.5} />
          </button>
        </div>

        {/* Brand / Logo */}
        <div className="mb-8">
          <div
            className="w-10 h-10 border-4 border-black bg-pink-500 flex items-center justify-center cursor-pointer hover:bg-pink-400 shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] transition"
            onClick={() => navigate("/")}
          >
            <span className="font-black text-black uppercase tracking-tighter text-xs">NITH</span>
          </div>
        </div>

        {/* Navigation Items Container */}
        <div className="flex-1 w-full flex flex-col items-center relative gap-4">
          {joinedRooms.length > 0 && (
            <div
              className="absolute w-12 h-12 bg-pink-500 border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]"
              style={{
                top: `${safeActiveIndex * 64}px`,
                opacity: activeIndex >= 0 ? 1 : 0,
              }}
            />
          )}

          {joinedRooms.map((room, _index) => {
            const isActive = currentPath.includes(room.slug);

            return (
              <button
                key={room.id}
                onClick={() => handleNavigation(room.slug)}
                className={`
                  relative z-10 group w-12 h-12 flex items-center justify-center cursor-pointer transition-colors duration-300
                  ${isActive ? "text-black" : "text-gray-500 hover:text-black"}
                `}
                aria-label={`Maps to ${room.title}`}
              >
                <room.icon size={22} strokeWidth={2.5} />

                {/* Tooltip */}
                <div className="absolute left-14 px-3 py-1.5 border-2 border-black bg-white text-xs font-black uppercase text-black opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-[3px_3px_0px_#000]">
                  {room.title}
                </div>
              </button>
            );
          })}
        </div>

        {/* Add / Join Rooms */}
        <div className="mb-4">
          <button
            onClick={() => navigate("/join-room")}
            className="w-10 h-10 border-4 border-dashed border-black bg-white text-black hover:bg-pink-100 flex items-center justify-center transition-colors cursor-pointer font-black text-lg shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px]"
            title="Join another room"
          >
            +
          </button>
        </div>
      </nav>
    </>
  );
}
