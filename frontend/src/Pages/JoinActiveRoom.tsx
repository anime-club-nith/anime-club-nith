import React, { useState } from "react";
import {
  ArrowRight,
  Box,
  Cpu,
  Cloud,
  Palette,
  Layout,
  Server,
  Hash,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/NavBar";
import Footer from "../components/Footer";

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
    title: "Blockchain",
    slug: "blockchain",
    description:
      "Discussions on decentralized ledgers, smart contracts, Web3 protocols, and the future of DeFi.",
    icon: Box,
  },
  {
    id: 2,
    title: "AI/ML",
    slug: "ai-ml",
    description:
      "Deep dive into Large Language Models, neural networks, computer vision, and predictive analytics.",
    icon: Cpu,
  },
  {
    id: 3,
    title: "Cloud",
    slug: "cloud",
    description:
      "Architecture patterns for AWS, Azure, and GCP. Serverless computing and DevOps practices.",
    icon: Cloud,
  },
  {
    id: 4,
    title: "Design",
    slug: "design",
    description:
      "UI/UX principles, design systems, accessibility standards, and creative workshops.",
    icon: Palette,
  },
  {
    id: 5,
    title: "Frontend",
    slug: "frontend",
    description:
      "Modern web development with React, state management, performance optimization, and CSS architecture.",
    icon: Layout,
  },
  {
    id: 6,
    title: "Backend",
    slug: "backend",
    description:
      "API design, database scalability, microservices, and high-performance system engineering.",
    icon: Server,
  },
  {
    id: 7,
    title: "Yaps",
    slug: "yaps",
    description:
      "The digital watercooler. Casual conversations, daily banter, and non-technical discussions.",
    icon: Hash,
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
    <div className="group relative flex flex-col justify-between h-full p-8 bg-white/90 dark:bg-[#1e1f22]/90 backdrop-blur-md rounded-2xl border border-slate-200/60 dark:border-slate-700/40 shadow-lg hover:shadow-xl hover:shadow-pink-500/5 hover:-translate-y-1 transition-all duration-300">
      {/* Content Section */}
      <div className="space-y-4">
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
      <div className="mt-8 space-y-2">
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

      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-pink-500/5 dark:bg-pink-500/8 rounded-full blur-3xl pointer-events-none" />
      
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-12 text-center relative z-10">
        <h1 className="text-4xl md:text-5xl font-black uppercase text-black dark:text-white tracking-tight mb-4">
          Active Rooms
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-lg max-w-2xl mx-auto font-medium">
          Select a domain to connect with peers. Real-time discussions for
          engineering, design, and casual conversations.
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
