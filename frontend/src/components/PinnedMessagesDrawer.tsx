import { useState, useEffect, useRef } from "react";
import { X, PinOff, ExternalLink, Hash, RefreshCw } from "lucide-react";

interface PinnedMessagesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string; // Database ObjectId of the room
  onUnpinMessage: (messageId: string) => Promise<void>;
  onJumpToMessage: (messageId: string) => void;
}

interface PinnedMessage {
  _id: string;
  sender: {
    _id: string;
    name: string;
    displayName?: string;
    avatarUrl?: string;
  };
  text: string;
  imageURL?: string;
  pinnedAt: string;
  pinnedBy?: {
    name: string;
    displayName?: string;
  };
}

export default function PinnedMessagesDrawer({
  isOpen,
  onClose,
  roomId,
  onUnpinMessage,
  onJumpToMessage,
}: PinnedMessagesDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [pinnedMessages, setPinnedMessages] = useState<PinnedMessage[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const drawerRef = useRef<HTMLDivElement>(null);

  const fetchPinned = async () => {
    if (!roomId) return;
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await fetch(`/api/chat/pinned/${roomId}`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setPinnedMessages(data.messages || []);
      } else {
        setErrorMsg("Failed to load pinned messages.");
      }
    } catch (err) {
      console.error("Error fetching pinned messages:", err);
      setErrorMsg("Error loading pins.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && roomId) {
      fetchPinned();
    }
  }, [isOpen, roomId]);

  // Click outside detection for the drawer panel
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        isOpen &&
        drawerRef.current &&
        !drawerRef.current.contains(e.target as Node) &&
        !(e.target as HTMLElement).closest(".pin-button-trigger")
      ) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleUnpin = async (msgId: string) => {
    try {
      await onUnpinMessage(msgId);
      // Remove from local list optimistically
      setPinnedMessages((prev) => prev.filter((m) => m._id !== msgId));
    } catch (err) {
      console.error("Unpin failed:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/10 z-40 backdrop-blur-xs transition-opacity duration-300" />

      {/* Drawer Container */}
      <div
        ref={drawerRef}
        className="w-80 h-screen bg-[#f2f3f5] dark:bg-[#2b2d31] border-l border-slate-200/60 dark:border-slate-800/60 shadow-2xl fixed top-0 right-0 z-50 flex flex-col transition-transform duration-300"
      >
        {/* Drawer Header */}
        <div className="h-12 px-4 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-900/60 bg-white dark:bg-[#313338] flex-shrink-0">
          <div className="flex items-center gap-1.5 font-bold text-sm text-black dark:text-white">
            <Hash size={16} className="text-slate-400" />
            <span>Pinned Messages</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={fetchPinned}
              title="Refresh pins"
              className="p-1.5 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 cursor-pointer"
            >
              <RefreshCw size={14} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-hide">
          {loading ? (
            <div className="py-12 flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-3 border-pink-500/20 border-t-pink-500 rounded-full animate-spin"></div>
              <p className="text-xs text-slate-400">Loading pins...</p>
            </div>
          ) : errorMsg ? (
            <p className="text-center text-xs text-red-500 py-6">{errorMsg}</p>
          ) : pinnedMessages.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-2">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No Pinned Messages</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 leading-normal">
                Right-click any message in the chat feed and select "Pin Message" to keep track of important announcements!
              </p>
            </div>
          ) : (
            pinnedMessages.map((msg) => {
              const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(msg.sender?.name || "user")}`;
              const avatarUrl = msg.sender?.avatarUrl || defaultAvatar;

              return (
                <div
                  key={msg._id}
                  className="bg-white dark:bg-[#1e1f22] border border-slate-200/60 dark:border-slate-800/60 rounded-xl p-3.5 shadow-sm space-y-2.5 hover:shadow-md transition-shadow group/pin"
                >
                  {/* Sender Header */}
                  <div className="flex items-start gap-2">
                    <img
                      src={avatarUrl}
                      alt={msg.sender?.name}
                      className="w-7 h-7 rounded-full bg-slate-100 flex-shrink-0 object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-black dark:text-white truncate">
                        {msg.sender?.displayName || msg.sender?.name}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                        Pinned at {new Date(msg.pinnedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Message Body */}
                  <div className="text-xs text-slate-800 dark:text-[#dbdee1] leading-relaxed break-words whitespace-pre-wrap">
                    {msg.text}
                  </div>

                  {msg.imageURL && msg.imageURL.trim() !== "" && (
                    <img
                      src={msg.imageURL}
                      alt="Pinned Attachment"
                      className="max-h-28 rounded-lg object-cover w-full border border-slate-100 dark:border-slate-800"
                    />
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                    <button
                      onClick={() => onJumpToMessage(msg._id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-pink-500/10 dark:hover:bg-pink-500/20 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:text-pink-500 dark:hover:text-pink-400 transition-colors cursor-pointer"
                    >
                      <ExternalLink size={12} />
                      Jump to Message
                    </button>
                    <button
                      onClick={() => handleUnpin(msg._id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-red-500/10 dark:hover:bg-red-500/20 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer"
                    >
                      <PinOff size={12} />
                      Unpin
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
