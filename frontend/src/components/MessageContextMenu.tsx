import { useEffect, useRef } from "react";
import { Pin, PinOff, Trash, Copy } from "lucide-react";

interface MessageContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onPin: () => void;
  onUnpin: () => void;
  onDelete: () => void;
  isPinned: boolean;
  isOwnMessage: boolean;
  messageText: string;
}

export default function MessageContextMenu({
  x,
  y,
  onClose,
  onPin,
  onUnpin,
  onDelete,
  isPinned,
  isOwnMessage,
  messageText,
}: MessageContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleScroll = () => onClose();

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("scroll", handleScroll, true);
    };
  }, [onClose]);

  // Adjust menu position if it goes off screen
  const menuWidth = 160;
  const menuHeight = isOwnMessage ? 120 : 80;
  
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  
  let left = x;
  let top = y;
  
  if (x + menuWidth > screenWidth) {
    left = screenWidth - menuWidth - 8;
  }
  if (y + menuHeight > screenHeight) {
    top = screenHeight - menuHeight - 8;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    onClose();
  };

  return (
    <div
      ref={menuRef}
      style={{ top: `${top}px`, left: `${left}px` }}
      className="fixed z-50 w-40 bg-white dark:bg-[#1e1f22] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl flex flex-col p-1.5 space-y-0.5"
    >
      <button
        onClick={handleCopy}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-left font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
      >
        <Copy size={14} className="text-slate-400" />
        Copy Text
      </button>

      {isPinned ? (
        <button
          onClick={() => {
            onUnpin();
            onClose();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-left font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
        >
          <PinOff size={14} className="text-slate-400" />
          Unpin Message
        </button>
      ) : (
        <button
          onClick={() => {
            onPin();
            onClose();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-left font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
        >
          <Pin size={14} className="text-slate-400" />
          Pin Message
        </button>
      )}

      {isOwnMessage && (
        <button
          onClick={() => {
            if (confirm("Are you sure you want to delete this message? This action is permanent.")) {
              onDelete();
            }
            onClose();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-left font-semibold text-red-500 hover:bg-red-500/10 dark:hover:bg-red-500/20 transition-colors cursor-pointer"
        >
          <Trash size={14} />
          Delete Message
        </button>
      )}
    </div>
  );
}
