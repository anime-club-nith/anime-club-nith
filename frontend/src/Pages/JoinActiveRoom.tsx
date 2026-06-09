import React, { useState } from "react";
import {
  ArrowRight,
  Hash,
  Zap,
  Heart,
  BookOpen,
  Palette,
  Film,
  Gamepad2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/NavBar";
import Footer from "../components/Footer";
import AnimatedBackground from "../components/AnimatedBackground";

interface Room {
  id: number;
  title: string;
  slug: string;
  description: string;
  icon: React.ElementType;
}

const ROOM_DATA: Room[] = [
  {
    id: 1,
    title: "General Anime",
    slug: "general-anime",
    description: "General chat about all things anime, seasonal releases, recommendations, and news.",
    icon: Hash,
  },
  {
    id: 2,
    title: "Shounen Zone",
    slug: "shounen-zone",
    description: "Discussions about action, adventure, and shounen series like Jujutsu Kaisen, Demon Slayer, Naruto.",
    icon: Zap,
  },
  {
    id: 3,
    title: "Slice of Life / Shojo",
    slug: "slice-of-life",
    description: "Heartwarming slice of life, romance, shojo, drama, and school-life series.",
    icon: Heart,
  },
  {
    id: 4,
    title: "Manga & Novels",
    slug: "manga-novels",
    description: "Discussing raw chapters, upcoming spoilers, art styles, manga reviews, and light novels.",
    icon: BookOpen,
  },
  {
    id: 5,
    title: "Cosplay & Fan Art",
    slug: "cosplay-art",
    description: "Share your amazing cosplay photos, digital artwork, character sketches, and creative builds.",
    icon: Palette,
  },
  {
    id: 6,
    title: "Movies & Ghibli",
    slug: "movies-ghibli",
    description: "Special anime film screenings, Studio Ghibli, watch parties, and movie reviews.",
    icon: Film,
  },
  {
    id: 7,
    title: "Gaming & Music",
    slug: "gaming-music",
    description: "Anime games, J-RPGs, visual novels, Japanese music, OSTs, and J-Pop/J-Rock.",
    icon: Gamepad2,
  },
];

const ChatRoomCard = ({ room }: { room: Room }) => {
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleJoinRoom = async (slug: string) => {
    setJoinError(null);
    try {
      setIsJoining(true);
      const res = await fetch(`/api/room/${slug}/join`, {
        method: "GET",
        credentials: "include",
      });

      let data;
      try {
        data = await res.json();
      } catch (parseError) {
        console.error("Failed to parse join API response:", parseError);
        setJoinError("Failed to join room - invalid response");
        setIsJoining(false);
        return;
      }

      if (!res.ok) {
        console.error("Join API failed:", data);
        setJoinError(data?.message || "Failed to join room");
        setIsJoining(false);
        return;
      }

      try {
        const refreshRes = await fetch(
          "/api/room/joined",
          {
            credentials: "include",
          }
        );

        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          const slugs = (refreshData.rooms || []).map(
            (room: { roomId: string }) => room.roomId
          );
          localStorage.setItem("joinedRooms", JSON.stringify(slugs));
        } else {
          const errorData = await refreshRes.json().catch(() => ({}));
          console.warn(
            "Failed to refresh joined rooms:",
            refreshRes.status,
            errorData
          );
          const raw = localStorage.getItem("joinedRooms");
          const existing: string[] = raw ? JSON.parse(raw) : [];
          if (!existing.includes(slug)) {
            existing.push(slug);
            localStorage.setItem("joinedRooms", JSON.stringify(existing));
          }
        }
      } catch (err) {
        console.error("Error refreshing joined rooms:", err);
        try {
          const raw = localStorage.getItem("joinedRooms");
          const existing: string[] = raw ? JSON.parse(raw) : [];
          if (!existing.includes(slug)) {
            existing.push(slug);
            localStorage.setItem("joinedRooms", JSON.stringify(existing));
          }
        } catch (storageErr) {
          console.error("Storage error:", storageErr);
        }
      }

      const targetPath = `/room/${slug}`;
      navigate(targetPath);
    } catch (err) {
      console.error(err);
      setJoinError("Something went wrong while joining. Please try again.");
      setIsJoining(false);
    }
  };

  return (
    <div className="group relative flex flex-col justify-between h-full p-8 bg-white dark:bg-[#1e1f22] rounded-2xl border border-slate-200/60 dark:border-slate-700/40 shadow-lg hover:shadow-xl hover:shadow-pink-500/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      {/* Subtle background gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-transparent pointer-events-none" />
      
      {/* Animated glow on hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-pink-400/5 to-pink-600/10 blur-sm" />
      </div>

      {/* Content Section */}
      <div className="relative z-10 space-y-4">
        {/* Header with Icon */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black uppercase text-black dark:text-white tracking-wide">
            {room.title}
          </h3>
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center">
            <room.icon className="w-5 h-5" />
          </div>
        </div>

        {/* Description */}
        <p className="text-slate-600 dark:text-slate-300 text-sm font-medium leading-relaxed min-h-[48px]">
          {room.description}
        </p>
      </div>

      {/* Button Section */}
      <div className="mt-8 space-y-2 relative z-10">
        <button
          onClick={() => {
            void handleJoinRoom(room.slug);
          }}
          disabled={isJoining}
          className="w-full py-3 px-6 rounded-xl bg-pink-500 hover:bg-pink-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-pink-500/25 hover:shadow-lg hover:shadow-pink-500/30 transition-all duration-200 cursor-pointer"
        >
          <span>{isJoining ? "Joining..." : "Join Room"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {joinError && (
          <p className="text-xs font-semibold text-red-500 text-center">{joinError}</p>
        )}
      </div>
    </div>
  );
};

const JoinActiveRoom = () => {
  return (
    <div className="min-h-screen bg-[#f2f3f5] dark:bg-[#0c0d12] text-black dark:text-white font-sans selection:bg-pink-500/30 transition-colors relative overflow-hidden">
      <Navbar />
      <AnimatedBackground />

      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-pink-500/5 dark:bg-pink-500/8 rounded-full blur-3xl pointer-events-none" />
      
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-12 text-center relative z-10">
        <h1 className="text-4xl md:text-5xl font-black uppercase text-black dark:text-white tracking-tight mb-4">
          Active Rooms
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-lg max-w-2xl mx-auto font-medium">
          Join a themed room to chat with peers. Real-time discussions for
          anime genres, manga, creative showcases, and movie nights.
        </p>
      </div>

      {/* Grid Layout Section */}
      <main className="max-w-7xl mx-auto px-6 pb-24 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {ROOM_DATA.map((room) => (
            <ChatRoomCard key={room.id} room={room} />
          ))}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default JoinActiveRoom;
