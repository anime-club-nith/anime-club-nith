import { useState, useEffect } from "react";
import RoomSidebar from "../components/RoomSidebar";
import ChannelSidebar from "../components/ChannelSidebar";
import ChatWindow from "../components/ChatWindow";
import LogOutModal from "../components/LogOutModal";
import { useParams, useNavigate } from "react-router-dom";
import { socket } from "../services/socket";

interface ChatInterfaceProps {
  setCurrentRoom: (roomId: string | null) => void;
}

export default function ChatInterface({ setCurrentRoom }: ChatInterfaceProps) {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [joinedSlugs, setJoinedSlugs] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; _id?: string } | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Track unread mentions per channel slug
  const [unreadMentions, setUnreadMentions] = useState<Record<string, number>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem('authUser');
      if (raw) {
        const parsed = JSON.parse(raw);
        setCurrentUser({ 
          name: parsed.name || 'User', 
          email: parsed.email || '',
          _id: parsed._id || ''
        });
      }
    } catch { /* ignore */ }

    const fetchJoined = async () => {
      try {
        const cached = localStorage.getItem('joinedRooms');
        if (cached) setJoinedSlugs(JSON.parse(cached));
        const res = await fetch('/api/room/joined', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          const slugs = (data.rooms || []).map((r: { roomId: string }) => r.roomId);
          setJoinedSlugs(slugs);
          localStorage.setItem('joinedRooms', JSON.stringify(slugs));
        }
      } catch { /* ignore */ }
    };
    fetchJoined();
  }, []);

  // Listen for real-time mention notifications
  useEffect(() => {
    if (!currentUser?._id) return;

    if (!socket.connected) {
      socket.connect();
    }

    // Join personal user socket room for alerts
    socket.emit("join_room", { room: `user:${currentUser._id}`, userId: currentUser._id });

    const handleMentionNotification = (data: { roomId: string }) => {
      // Don't count mention if user is already viewing that channel
      if (data.roomId === roomId) return;

      setUnreadMentions((prev) => ({
        ...prev,
        [data.roomId]: (prev[data.roomId] || 0) + 1,
      }));
    };

    socket.on("mention_notification", handleMentionNotification);

    return () => {
      socket.off("mention_notification", handleMentionNotification);
    };
  }, [currentUser, roomId]);

  // Clear unread mentions when active room changes
  useEffect(() => {
    if (roomId && unreadMentions[roomId]) {
      setUnreadMentions((prev) => ({
        ...prev,
        [roomId]: 0,
      }));
    }
  }, [roomId, unreadMentions]);

  const handleSelectRoom = (slug: string) => {
    navigate(`/room/${slug}`);
    setIsMobileSidebarOpen(false);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      if (res.ok) {
        localStorage.removeItem('authUser');
        localStorage.removeItem('joinedRooms');
        navigate('/');
      }
    } catch { /* ignore */ } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f2f3f5] dark:bg-[#313338]">
      <RoomSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />
      <ChannelSidebar
        activeRoomSlug={roomId}
        onSelectRoom={handleSelectRoom}
        joinedSlugs={joinedSlugs}
        currentUser={currentUser}
        unreadMentions={unreadMentions}
        onLogout={() => setShowLogoutModal(true)}
      />
      <ChatWindow
        roomId={roomId}
        onOpenSidebar={() => setIsMobileSidebarOpen(true)}
        setCurrentRoom={setCurrentRoom}
      />
      <LogOutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        isLoggingOut={isLoggingOut}
      />
    </div>
  );
}
