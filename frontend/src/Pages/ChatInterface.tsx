import React from "react";
import RoomSidebar from "../components/RoomSidebar";
import ChatWindow from "../components/ChatWindow";
import { useParams } from "react-router-dom";

interface ChatInterfaceProps {
  setCurrentRoom: (roomId: string | null) => void;
}

export default function ChatInterface({ setCurrentRoom }: ChatInterfaceProps) {
  const { roomId } = useParams<{ roomId: string }>();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden">
      <RoomSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />
      <ChatWindow
        roomId={roomId}
        onOpenSidebar={() => setIsMobileSidebarOpen(true)}
        setCurrentRoom={setCurrentRoom}
      />
    </div>
  );
}
