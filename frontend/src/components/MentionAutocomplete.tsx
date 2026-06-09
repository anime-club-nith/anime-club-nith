import { useEffect, useState, useRef } from "react";

interface Member {
  id: string;
  name: string;
  displayName?: string;
  avatar?: string;
}

interface MentionAutocompleteProps {
  members: Member[];
  filterQuery: string;
  onSelect: (name: string) => void;
  onClose: () => void;
}

export default function MentionAutocomplete({ members, filterQuery, onSelect, onClose }: MentionAutocompleteProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter members based on query
  const query = filterQuery.toLowerCase();
  
  // Include @everyone as a pseudo-member if it matches the query
  const everyoneItem = { id: "everyone", name: "everyone", displayName: "everyone", isEveryone: true };
  
  const filtered = [
    ...( "everyone".includes(query) ? [everyoneItem] : [] ),
    ...members.filter(m => 
      m.name?.toLowerCase().includes(query) || 
      m.displayName?.toLowerCase().includes(query)
    )
  ];

  useEffect(() => {
    // Reset selection index when query changes
    setSelectedIndex(0);
  }, [filterQuery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (filtered.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filtered.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        const selected = filtered[selectedIndex];
        onSelect(selected.name);
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [filtered, selectedIndex, onSelect, onClose]);

  // Scroll active item into view
  useEffect(() => {
    if (containerRef.current) {
      const activeEl = containerRef.current.children[selectedIndex] as HTMLElement;
      if (activeEl) {
        const parent = containerRef.current;
        const parentTop = parent.scrollTop;
        const parentBottom = parentTop + parent.clientHeight;
        const elemTop = activeEl.offsetTop;
        const elemBottom = elemTop + activeEl.clientHeight;

        if (elemTop < parentTop) {
          parent.scrollTop = elemTop;
        } else if (elemBottom > parentBottom) {
          parent.scrollTop = elemBottom - parent.clientHeight;
        }
      }
    }
  }, [selectedIndex]);

  if (filtered.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="absolute bottom-full left-4 mb-2 w-64 max-h-48 overflow-y-auto bg-white dark:bg-[#2b2d31] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 flex flex-col p-1.5 space-y-0.5"
    >
      {filtered.map((item, idx) => {
        const isSelected = idx === selectedIndex;
        const isEveryone = 'isEveryone' in item && item.isEveryone;
        
        const avatarUrl = isEveryone 
          ? `https://api.dicebear.com/7.x/identicon/svg?seed=everyone`
          : (item as Member).avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(item.name)}`;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.name)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-colors cursor-pointer ${
              isSelected
                ? "bg-pink-500/15 text-pink-600 dark:text-pink-400 font-medium"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
            }`}
          >
            <img
              src={avatarUrl}
              alt={item.displayName || item.name}
              className="w-6 h-6 rounded-full bg-white flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <span className="truncate block">
                {isEveryone ? (
                  <span className="font-bold text-pink-500">everyone</span>
                ) : (
                  item.displayName || item.name
                )}
              </span>
              {!isEveryone && item.displayName && item.displayName !== item.name && (
                <span className="text-[10px] text-slate-400 block -mt-0.5 truncate">
                  @{item.name}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
