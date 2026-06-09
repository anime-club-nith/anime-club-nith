import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Hash,
  Plus,
  Smile,
  X,
  MoreHorizontal,
  Loader2,
  Code,
  Image,
  Check,
  AlertCircle,
  ArrowUp,
  Menu,
  Pin,
} from "lucide-react";
import EmojiPicker, { Theme } from "emoji-picker-react";
import CodeModal from "./CodeModal";
import ImageModal from "./ImageModal";
import { socket } from "../services/socket";
import axios from "axios";
import { useBrowserNotifications } from "../hooks/useBrowserNotifications";
import ProfileCard from "./ProfileCard";
import MentionAutocomplete from "./MentionAutocomplete";
import MessageContextMenu from "./MessageContextMenu";
import PinnedMessagesDrawer from "./PinnedMessagesDrawer";

// --- Types ---
interface User {
  id: string;
  _id?: string;
  name: string;
  avatar: string;
  role?: string;
  displayName?: string;
}

interface Message {
  _id: string;
  sender: User;
  text: string;
  createdAt: string;
  room?: string;
  imageURL?: string;
  id?: number | string;
  userId?: string;
  content?: string;
  timestamp?: string;
  type?: "text" | "code";
  image?: string;
  status?: "sending" | "sent" | "error";
  tempId?: string;
  isPinned?: boolean;
  mentions?: string[];
  mentionsEveryone?: boolean;
}

interface RoomDetails {
  id: string;
  _id: string;
  title: string;
  description: string;
  members: User[];
}

interface ChatWindowProps {
  roomId?: string;
  onOpenSidebar?: () => void;
  setCurrentRoom: (roomId: string | null) => void;
}

const MOCK_DB = {
  user: {
    id: "99",
    name: "Alex Dev",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
  },
};

const MemberModal = ({
  isOpen,
  onClose,
  members,
  currentUserId,
}: {
  isOpen: boolean;
  onClose: () => void;
  members: User[];
  currentUserId?: string;
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleInvite = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy invite link", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white border-4 border-black shadow-[10px_10px_0px_#000] overflow-hidden scale-in-95 animate-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b-4 border-black bg-white">
          <div>
            <h3 className="text-black font-black uppercase tracking-wide">
              Room Members
            </h3>
            <p className="text-xs font-semibold text-gray-500">
              {members.length} members total
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white border-2 border-black hover:bg-pink-100 text-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] transition rounded cursor-pointer"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>
        <div className="max-h-[350px] overflow-y-auto p-4 space-y-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-3 p-2 border-2 border-transparent hover:border-black hover:bg-pink-100/40 transition-all"
            >
              <img
                src={member.avatar}
                alt={member.name}
                className="w-10 h-10 border-2 border-black bg-white rounded-none"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black uppercase text-black">
                    {member.name}
                    {(member.id === currentUserId || member._id === currentUserId) && (
                      <span className="text-gray-500 ml-1">(You)</span>
                    )}
                  </span>
                  {member.role && (
                    <span className="text-[10px] px-2 py-0.5 border border-black bg-pink-100 text-black font-black uppercase tracking-wider">
                      {member.role}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="px-6 py-4 border-t-4 border-black bg-white">
          <button
            onClick={handleInvite}
            className="w-full py-2.5 border-4 border-black bg-pink-500 hover:bg-pink-400 text-black font-black uppercase text-xs shadow-[4px_4px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {copied ? (
              <>
                <Check size={16} className="text-black" strokeWidth={2.5} />
                <span>Copied Link!</span>
              </>
            ) : (
              "Invite People"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ChatWindow({ roomId, onOpenSidebar, setCurrentRoom }: ChatWindowProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [activeRoom, setActiveRoom] = useState<RoomDetails | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [viewImage, setViewImage] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [imagePreview, setImagePreview] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const attachmentMenuRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const optionsMenuRef = useRef<HTMLDivElement>(null);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);

  // --- New Features States & Refs ---
  const inputRef = useRef<HTMLInputElement>(null);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; message: Message } | null>(null);
  const [isPinnedDrawerOpen, setIsPinnedDrawerOpen] = useState(false);

  const { permission, requestPermission, showNotification } = useBrowserNotifications();

  const allMembers = useMemo(() => {
    const members: User[] = activeRoom?.members ? [...activeRoom.members] : [];
    if (currentUser && !members.find((m) => m.id === currentUser.id)) {
      members.unshift(currentUser);
    }
    return members;
  }, [activeRoom, currentUser]);

  const effectiveUser: User = currentUser || MOCK_DB.user;
  const effectiveUserRef = useRef(effectiveUser);

  useEffect(() => {
    effectiveUserRef.current = effectiveUser;
  }, [effectiveUser]);

  const getDateLabel = (timestamp: string | Date): string => {
    const messageDate = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const resetTime = (date: Date) => {
      date.setHours(0, 0, 0, 0);
      return date;
    };

    const messageDateOnly = resetTime(new Date(messageDate));
    const todayOnly = resetTime(new Date(today));
    const yesterdayOnly = resetTime(new Date(yesterday));

    if (messageDateOnly.getTime() === todayOnly.getTime()) {
      return 'Today';
    } else if (messageDateOnly.getTime() === yesterdayOnly.getTime()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  const groupMessagesWithDates = (messages: Message[]): any[] => {
    if (!messages || messages.length === 0) return [];

    const grouped: any[] = [];
    let lastDate: string | null = null;

    messages.forEach((message) => {
      const dateLabel = getDateLabel(message.createdAt);

      if (dateLabel !== lastDate) {
        grouped.push({
          type: 'date-separator',
          id: `date-${message.createdAt}`,
          label: dateLabel
        });
        lastDate = dateLabel;
      }

      grouped.push({ ...message, type: 'message' });
    });

    return grouped;
  };

  const handleImageSelect = (dataUrl: string) => {
    setImagePreviewUrl(dataUrl);
    fetch(dataUrl)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], "upload.png", { type: "image/png" });
        setImagePreview(file);
      });
    setIsImageModalOpen(false);
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem("authUser");
      if (raw) {
        const parsed = JSON.parse(raw) as {
          _id: string;
          email?: string;
          name?: string;
          role?: string;
        };
        const displayName =
          parsed.name || (parsed.email ? parsed.email.split("@")[0] : "You");
        const avatarSeed = parsed.email || displayName;

        setCurrentUser({
          id: parsed._id,
          name: displayName,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
            avatarSeed
          )}`,
          role: parsed.role,
        });
      } else {
        setCurrentUser(MOCK_DB.user);
      }
    } catch {
      setCurrentUser(MOCK_DB.user);
    }
  }, []);

  useEffect(() => {
    if (permission === 'default') {
      requestPermission();
    }
  }, [permission, requestPermission]);

  useEffect(() => {
    if (activeRoom?._id) {
      setCurrentRoom(activeRoom._id);
    } else {
      setCurrentRoom(null);
    }
  }, [activeRoom, setCurrentRoom]);

  // --- New features handlers ---
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setMessageText(val);

    const cursorPosition = e.target.selectionStart || 0;
    const textBeforeCursor = val.substring(0, cursorPosition);
    const match = textBeforeCursor.match(/@(\w*)$/);
    if (match) {
      setMentionQuery(match[1]);
    } else {
      setMentionQuery(null);
    }
  };

  const handleSelectMention = (name: string) => {
    if (!inputRef.current) return;
    const input = inputRef.current;
    const cursorPosition = input.selectionStart || 0;
    const textBeforeCursor = messageText.substring(0, cursorPosition);
    const textAfterCursor = messageText.substring(cursorPosition);
    const newTextBefore = textBeforeCursor.replace(/@\w*$/, `@${name} `);
    setMessageText(newTextBefore + textAfterCursor);
    setMentionQuery(null);
    setTimeout(() => {
      input.focus();
      const newPos = newTextBefore.length;
      input.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const handleContextMenu = (e: React.MouseEvent, msg: Message) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      message: msg,
    });
  };

  const handlePinMessage = async (msgId: string) => {
    try {
      await axios.put(`/api/chat/pin/${msgId}`, {}, { withCredentials: true });
      setMessages((prev) =>
        prev.map((m) => (m._id === msgId ? { ...m, isPinned: true } : m))
      );
    } catch (err) {
      console.error("Failed to pin message:", err);
    }
  };

  const handleUnpinMessage = async (msgId: string) => {
    try {
      await axios.put(`/api/chat/unpin/${msgId}`, {}, { withCredentials: true });
      setMessages((prev) =>
        prev.map((m) => (m._id === msgId ? { ...m, isPinned: false } : m))
      );
    } catch (err) {
      console.error("Failed to unpin message:", err);
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    try {
      await axios.delete(`/api/chat/${msgId}`, { withCredentials: true });
      setMessages((prev) => prev.filter((m) => m._id !== msgId));
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
  };

  const handleJumpToMessage = (messageId: string) => {
    const el = document.getElementById(`msg-${messageId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("bg-pink-500/30");
      setTimeout(() => {
        el.classList.remove("bg-pink-500/30");
      }, 2000);
    }
  };

  const renderMessageContent = (text: string) => {
    if (!text) return "";
    const parts = text.split(/(@everyone|@[\w\s]+?)(?=\s|$|[^\w\s])/g);
    return parts.map((part, idx) => {
      if (part === "@everyone") {
        return (
          <span key={idx} className="text-pink-600 dark:text-pink-400 bg-pink-500/10 dark:bg-pink-500/15 px-1 py-0.5 rounded font-semibold text-xs inline-block">
            @everyone
          </span>
        );
      } else if (part.startsWith("@")) {
        const mentionName = part.slice(1).trim();
        const matched = allMembers.find(
          (m) => m.name.toLowerCase() === mentionName.toLowerCase()
        );
        if (matched) {
          return (
            <span key={idx} className="text-pink-600 dark:text-pink-400 bg-pink-500/10 dark:bg-pink-500/15 px-1 py-0.5 rounded font-semibold text-xs inline-block">
              @{matched.displayName || matched.name}
            </span>
          );
        }
      }
      return part;
    });
  };

  useEffect(() => {
    if (!roomId) {
      setActiveRoom(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const fetchData = async () => {
      try {
        const roomRes = await axios.get(`/api/room/${roomId}`, {
          withCredentials: true,
        });

        const roomData = roomRes.data.room[0];
        if (roomData) {
          const members = (roomData.members || []).map((member: any) => ({
            id: member._id,
            name: member.name,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
              member.name
            )}`,
          }));

          setActiveRoom({
            id: roomData.roomId,
            _id: roomData._id,
            title: roomData.title,
            description: roomData.description,
            members: members,
          });

          const messagesRes = await axios.get(`/api/chat/chat-history/${roomData._id}?page=1`, {
            withCredentials: true,
          });

          socket.connect();
          socket.emit("join_room", roomData._id);

          const history = messagesRes.data.map((msg: Message) => ({
            ...msg,
            id: msg._id,
            userId: msg.sender ? msg.sender._id : "unknown",
            content: msg.text,
            timestamp: new Date(msg.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            image: msg.imageURL && msg.imageURL.trim() !== "" ? msg.imageURL : undefined,
            status: "sent",
          }));

          setMessages(history);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    const handleReceiveMessage = (newMessage: any) => {
      const formattedMsg: Message = {
        ...newMessage,
        id: newMessage._id,
        userId: newMessage.sender ? newMessage.sender._id : "unknown",
        content: newMessage.text,
        timestamp: new Date(newMessage.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        image: newMessage.imageURL && newMessage.imageURL.trim() !== "" ? newMessage.imageURL : undefined,
        status: "sent",
      };

      setMessages((prev) => {
        const currentUserId = effectiveUserRef.current.id || effectiveUserRef.current._id;
        if (formattedMsg.userId === currentUserId) {
          const existingIndex = prev.findIndex(
            (m) => m.status === "sending" && (m.content === formattedMsg.content)
          );
          if (existingIndex !== -1) {
            const newMessages = [...prev];
            newMessages[existingIndex] = formattedMsg;
            return newMessages;
          }
        } else {
          const senderName = newMessage.sender?.name || "Someone";
          const messagePreview = newMessage.text || "Sent an image";

          showNotification(`${senderName} in #${activeRoom?.title || 'Chat'}`, {
            body: messagePreview,
            tag: activeRoom?._id || 'chat',
            data: { roomId: activeRoom?._id, roomTitle: activeRoom?.title },
          });
        }
        return [...prev, formattedMsg];
      });
    };

    const handleMessagePinned = (data: any) => {
      const msg = data.chat || data;
      setMessages((prev) =>
        prev.map((m) => (m._id === msg._id ? { ...m, isPinned: true } : m))
      );
    };

    const handleMessageUnpinned = (data: any) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === data.messageId ? { ...m, isPinned: false } : m))
      );
    };

    const handleMessageDeleted = (data: any) => {
      setMessages((prev) => prev.filter((m) => m._id !== data.messageId));
    };

    socket.on("received_message", handleReceiveMessage);
    socket.on("receive_message", handleReceiveMessage);
    socket.on("message_pinned", handleMessagePinned);
    socket.on("message_unpinned", handleMessageUnpinned);
    socket.on("message_deleted", handleMessageDeleted);

    return () => {
      socket.off("received_message", handleReceiveMessage);
      socket.off("receive_message", handleReceiveMessage);
      socket.off("message_pinned", handleMessagePinned);
      socket.off("message_unpinned", handleMessageUnpinned);
      socket.off("message_deleted", handleMessageDeleted);
      socket.disconnect();
    };
  }, [roomId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        attachmentMenuRef.current &&
        !attachmentMenuRef.current.contains(event.target as Node)
      ) {
        setShowAttachmentMenu(false);
      }
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
      if (
        optionsMenuRef.current &&
        !optionsMenuRef.current.contains(event.target as Node)
      ) {
        setShowOptionsMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!messageText.trim() && !imagePreview) || !roomId) return;
    if (!activeRoom?._id) return;

    const tempId = Date.now().toString();
    const optimisticMessage: Message = {
      _id: tempId,
      id: tempId,
      tempId: tempId,
      sender: effectiveUser,
      text: messageText,
      content: messageText,
      createdAt: new Date().toISOString(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "sending",
      room: activeRoom._id,
      userId: effectiveUser.id || effectiveUser._id,
      image: imagePreviewUrl || undefined
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setMessageText("");
    setImagePreview(null);
    setImagePreviewUrl(null);

    const formData = new FormData();
    formData.append("text", optimisticMessage.content || "");
    formData.append("room", activeRoom._id);
    if (imagePreview) {
      formData.append("image", imagePreview);
    }

    try {
      await axios.post(`/api/chat/${activeRoom._id}`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.tempId === tempId ? { ...msg, status: "error" } : msg
        )
      );
    }
  };

  const handleShareCode = async (code: string) => {
    if (!roomId || !activeRoom?._id) return;
    try {
      const formData = new FormData();
      formData.append("text", code);
      formData.append("room", activeRoom._id);

      await axios.post(`/api/chat/${activeRoom._id}`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
    } catch (error) {
      console.error("Failed to share code:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-screen bg-white text-black gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" strokeWidth={2.5} />
        <p className="text-xs font-black uppercase tracking-wide">Loading Channel...</p>
      </div>
    );
  }

  if (!activeRoom) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-white border-l-4 border-black animate-in fade-in duration-300">
        <div className="flex flex-col items-center text-center space-y-6">
          <button
            onClick={() => navigate("/join-room")}
            className="group relative flex items-center justify-center w-24 h-24 border-4 border-black bg-pink-500 hover:bg-pink-400 text-black shadow-[8px_8px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] transition cursor-pointer"
          >
            <Plus
              size={40}
              strokeWidth={3}
              className="text-black transition-colors duration-300"
            />
          </button>
          <div className="space-y-1">
            <h3 className="text-xl font-black uppercase text-black">
              Join Room
            </h3>
            <p className="text-sm font-semibold text-gray-700 max-w-xs mx-auto">
              Navigate to the sidebar or click here to explore channels.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen bg-white border-l-0 md:border-l-4 border-black relative min-w-0">
      <MemberModal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        members={allMembers}
        currentUserId={effectiveUser.id || effectiveUser._id}
      />
      <CodeModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
        onShare={handleShareCode}
      />
      <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onImageSelect={handleImageSelect}
      />
      {viewImage && (
        <ImageModal
          isOpen={true}
          onClose={() => setViewImage(null)}
          imageUrl={viewImage}
        />
      )}

      {/* Dynamic Header */}
      <header className="h-12 px-4 flex items-center justify-between border-b border-slate-200/50 dark:border-slate-900/60 bg-white/80 dark:bg-[#313338]/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className="md:hidden w-8 h-8 rounded-lg bg-transparent hover:bg-slate-100 dark:hover:bg-slate-700/50 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors cursor-pointer mr-1"
          >
            <Menu size={18} />
          </button>
          <Hash className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <div>
            <h2 className="font-bold text-sm text-black dark:text-white">
              {activeRoom.title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              {activeRoom.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsPinnedDrawerOpen(true)}
            className="w-8 h-8 rounded-lg bg-transparent hover:bg-slate-100 dark:hover:bg-slate-700/50 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors cursor-pointer pin-button-trigger"
            title="Pinned Messages"
          >
            <Pin size={18} className="rotate-45" />
          </button>
          <button
            onClick={() => setIsMemberModalOpen(true)}
            className="w-8 h-8 rounded-lg bg-transparent hover:bg-slate-100 dark:hover:bg-slate-700/50 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
            title="View Members"
          >
            <Users size={18} />
          </button>
          <div className="relative" ref={optionsMenuRef}>
            <button
              onClick={() => setShowOptionsMenu(!showOptionsMenu)}
              className="w-8 h-8 rounded-lg bg-transparent hover:bg-slate-100 dark:hover:bg-slate-700/50 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
            >
              <MoreHorizontal size={18} />
            </button>
            {showOptionsMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#2b2d31] rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-xl overflow-hidden z-50">
                <a
                  href="https://github.com/anime-club-nith/tac-frontend/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 text-xs font-medium text-black dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  onClick={() => setShowOptionsMenu(false)}
                >
                  <AlertCircle size={15} className="text-red-500" />
                  Report an issue
                </a>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Message Stream */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 space-y-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] bg-[#f2f3f5] dark:bg-[#313338]"
        ref={scrollRef}
      >
        {/* Dynamic Welcome Message */}
        <div className="py-6 border-b border-slate-200/60 dark:border-slate-700/40 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-pink-500 flex items-center justify-center mb-4 shadow-md shadow-pink-500/30">
            <Hash size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-black dark:text-white mb-1">
            Welcome to #{activeRoom.title}!
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            This is the start of the{" "}
            <span className="text-pink-500 font-semibold">#{activeRoom.title}</span>{" "}
            conversation.
          </p>
        </div>

        {groupMessagesWithDates(messages).map((item, idx) => {
          if (item.type === 'date-separator') {
            return (
              <div key={item.id} className="flex items-center gap-3 my-4 px-2">
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700/60"></div>
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 px-2 whitespace-nowrap">
                  {item.label}
                </span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700/60"></div>
              </div>
            );
          }

          const msg = item;
          const user = msg.sender || {
            id: "unknown",
            _id: "unknown",
            name: "Unknown User",
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=Unknown`,
          };

          const isMe = (user.id === effectiveUser.id || user._id === effectiveUser.id) && user.id !== "unknown";

          const groupedMessages = groupMessagesWithDates(messages);
          const prevItem = groupedMessages[idx - 1];
          const prevMsg = prevItem?.type === 'message' ? prevItem : null;

          const prevSenderId = prevMsg?.sender?.id || prevMsg?.sender?._id || prevMsg?.userId;
          const currentSenderId = user.id || user._id;
          const isSequence = prevMsg && prevSenderId === currentSenderId;

          const avatarUrl = user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name || "User")}`;

          return (
            <div
              key={msg.id}
              id={`msg-${msg._id || msg.id}`}
              onContextMenu={(e) => handleContextMenu(e, msg)}
              className={`flex gap-3 rounded-md px-2 py-0.5 transition-colors relative ${
                isSequence ? 'mt-0.5 pl-11' : 'mt-5'
              } ${
                (msg.mentionsEveryone || (msg.mentions && msg.mentions.includes(effectiveUser.id || effectiveUser._id)))
                  ? 'bg-pink-500/10 dark:bg-pink-500/15 border-l-2 border-pink-500'
                  : isMe
                    ? 'group-hover:bg-pink-500/5 dark:group-hover:bg-pink-500/5'
                    : 'hover:bg-slate-100/60 dark:hover:bg-white/[0.03]'
              } group`}
            >
              {!isSequence && (
                <div 
                  className="flex-shrink-0 mt-0.5 cursor-pointer" 
                  onClick={() => setProfileUserId(user.id || user._id)}
                  title="View Profile"
                >
                  <img
                    src={avatarUrl}
                    alt={user.name}
                    className="w-9 h-9 rounded-full bg-white flex-shrink-0 hover:opacity-85 transition-opacity object-cover"
                  />
                </div>
              )}

              <div className="flex-1 min-w-0">
                {!isSequence && (
                  <div className="flex items-center gap-1 mb-0.5">
                    <span
                      onClick={() => setProfileUserId(user.id || user._id)}
                      className={`text-sm font-bold cursor-pointer hover:underline ${isMe ? 'text-pink-500' : 'text-black dark:text-white'}`}
                      title="View Profile"
                    >
                      {user.name} {isMe && <span className="font-normal text-slate-400 text-xs">(You)</span>}
                    </span>
                    {user.role && (
                      <span className="px-1.5 py-0.5 rounded-full bg-pink-100 dark:bg-pink-500/10 text-[9px] font-semibold text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-500/20">
                        {user.role}
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400 ml-1 font-normal">
                      {msg.timestamp}
                    </span>
                  </div>
                )}
                
                {msg.type === "code" ? (
                  <div className="mt-1 bg-[#0d1117] rounded-xl border border-slate-700 shadow-md overflow-hidden max-w-xl">
                    <pre className="p-4 text-xs text-white font-mono overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                      <code>{msg.content || msg.text}</code>
                    </pre>
                  </div>
                ) : (
                  <p className="text-sm text-black dark:text-[#dbdee1] font-normal leading-[1.375] mt-0.5 whitespace-pre-wrap">
                    {renderMessageContent(msg.content || msg.text)}
                  </p>
                )}
                
                {msg.image && (
                  <div className="mt-2">
                    <img
                      src={msg.image}
                      alt="uploaded content"
                      className="rounded-lg max-w-xs cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
                      onClick={() => setViewImage(msg.image as string)}
                    />
                  </div>
                )}
                
                {isMe && (
                  <div className="flex mt-0.5">
                    {msg.status === "sending" && (
                      <div className="flex space-x-0.5 animate-pulse items-center">
                        <div className="w-1 h-1 bg-slate-400 rounded-full" />
                        <div className="w-1 h-1 bg-slate-400 rounded-full" />
                        <div className="w-1 h-1 bg-slate-400 rounded-full" />
                      </div>
                    )}
                    {msg.status === "sent" && <Check className="w-3 h-3 text-pink-500" />}
                    {msg.status === "error" && <AlertCircle className="w-3 h-3 text-red-500" />}
                  </div>
                )}
              </div>

              {msg.isPinned && (
                <div className="absolute right-3 top-2 text-slate-400 dark:text-slate-500 rotate-45" title="Pinned message">
                  <Pin size={12} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Input Area */}
      <div className="px-4 pb-6 pt-2 bg-[#f2f3f5] dark:bg-[#313338] relative">
        {imagePreviewUrl && (
          <div className="relative mb-2 inline-block">
            <img
              src={imagePreviewUrl}
              alt="preview"
              className="rounded-lg max-w-xs h-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1"
            />
            <button
              onClick={() => {
                setImagePreview(null);
                setImagePreviewUrl(null);
              }}
              className="absolute top-2 left-2 p-1 bg-black/60 hover:bg-black/85 text-white rounded-full transition-colors cursor-pointer"
            >
              <X size={12} />
            </button>
          </div>
        )}
        <form
          onSubmit={handleSendMessage}
          className="bg-[#ebedef] dark:bg-[#383a40] rounded-xl flex items-center gap-2 px-3 py-2 shadow-sm relative animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          {mentionQuery !== null && (
            <MentionAutocomplete
              members={allMembers}
              filterQuery={mentionQuery}
              onSelect={handleSelectMention}
              onClose={() => setMentionQuery(null)}
            />
          )}
          <div className="relative" ref={attachmentMenuRef}>
            <button
              type="button"
              onClick={() => setShowAttachmentMenu((prev) => !prev)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600/50 transition-colors cursor-pointer ${showAttachmentMenu ? "rotate-45" : "rotate-0"} transition-transform duration-200`}
            >
              <Plus size={20} />
            </button>

            {showAttachmentMenu && (
              <div className="absolute bottom-full left-0 mb-3 w-48 bg-white dark:bg-[#2b2d31] rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-xl overflow-hidden z-20 origin-bottom-left animate-in fade-in zoom-in-95 duration-200">
                <div className="p-1">
                  <button
                    onClick={() => {
                      setIsCodeModalOpen(true);
                      setShowAttachmentMenu(false);
                    }}
                    className="w-full text-left px-3 py-2.5 text-sm font-medium text-black dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center gap-3 transition-colors cursor-pointer rounded-lg"
                  >
                    <Code size={16} className="text-slate-500" />
                    <span>Code Snippet</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsImageModalOpen(true);
                      setShowAttachmentMenu(false);
                    }}
                    className="w-full text-left px-3 py-2.5 text-sm font-medium text-black dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center gap-3 transition-colors cursor-pointer rounded-lg"
                  >
                    <Image size={16} className="text-slate-500" />
                    <span>Upload Image</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1">
            <input
              ref={inputRef}
              type="text"
              value={messageText}
              onChange={handleTextChange}
              onSelect={(e) => {
                const input = e.currentTarget;
                const cursorPosition = input.selectionStart || 0;
                const textBeforeCursor = input.value.substring(0, cursorPosition);
                const match = textBeforeCursor.match(/@(\w*)$/);
                if (match) {
                  setMentionQuery(match[1]);
                } else {
                  setMentionQuery(null);
                }
              }}
              placeholder={`Message #${activeRoom.title}`}
              className="w-full bg-transparent border-none focus:outline-none text-black dark:text-[#dbdee1] placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm font-normal"
            />
          </div>

          <div className="flex items-center gap-1 relative" ref={emojiPickerRef}>
            <button
              type="button"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600/50 transition-colors cursor-pointer"
            >
              <Smile size={20} />
            </button>
            {showEmojiPicker && (
              <div className="absolute bottom-full right-0 mb-4 z-50 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <EmojiPicker
                  theme={document.documentElement.classList.contains('dark') ? Theme.DARK : Theme.LIGHT}
                  onEmojiClick={(emojiData) => {
                    setMessageText((prev) => prev + emojiData.emoji);
                    setShowEmojiPicker(false);
                  }}
                  width={320}
                  height={400}
                />
              </div>
            )}
            <button
              type="submit"
              disabled={!messageText.trim() && !imagePreviewUrl}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                messageText.trim() || imagePreviewUrl
                  ? 'bg-pink-500 hover:bg-pink-400 text-white cursor-pointer'
                  : 'bg-slate-200 dark:bg-slate-600/50 text-slate-400 cursor-not-allowed'
              }`}
            >
              <ArrowUp size={18} />
            </button>
          </div>
        </form>
      </div>

      {/* Floating Popups & Modals */}
      {profileUserId && (
        <ProfileCard
          userId={profileUserId}
          onClose={() => setProfileUserId(null)}
        />
      )}

      {contextMenu && (
        <MessageContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          isPinned={!!contextMenu.message.isPinned}
          isOwnMessage={
            contextMenu.message.sender?.id === effectiveUser.id ||
            contextMenu.message.sender?._id === effectiveUser.id ||
            contextMenu.message.userId === effectiveUser.id ||
            effectiveUser.role === "admin" ||
            effectiveUser.role === "moderator"
          }
          messageText={contextMenu.message.content || contextMenu.message.text || ""}
          onPin={() => handlePinMessage(contextMenu.message._id)}
          onUnpin={() => handleUnpinMessage(contextMenu.message._id)}
          onDelete={() => handleDeleteMessage(contextMenu.message._id)}
          onClose={() => setContextMenu(null)}
        />
      )}

      {activeRoom && (
        <PinnedMessagesDrawer
          isOpen={isPinnedDrawerOpen}
          onClose={() => setIsPinnedDrawerOpen(false)}
          roomId={activeRoom._id}
          onUnpinMessage={handleUnpinMessage}
          onJumpToMessage={handleJumpToMessage}
        />
      )}
    </div>
  );
}
