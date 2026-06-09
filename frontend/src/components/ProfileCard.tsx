import { useState, useEffect, useRef } from "react";
import { X, Calendar, Mail } from "lucide-react";

interface ProfileCardProps {
  userId: string;
  onClose: () => void;
}

interface UserProfile {
  _id: string;
  name: string;
  displayName?: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  status?: "online" | "idle" | "dnd" | "invisible";
  createdAt?: string;
}

export default function ProfileCard({ userId, onClose }: ProfileCardProps) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/profile/${userId}`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setErrorMsg("Could not fetch user profile details.");
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setErrorMsg("Failed to load user profile.");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  // Click outside detection
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const statusOptions = {
    online: { label: "Online", color: "bg-green-500" },
    idle: { label: "Idle", color: "bg-amber-500" },
    dnd: { label: "Do Not Disturb", color: "bg-red-500" },
    invisible: { label: "Invisible", color: "bg-slate-400" },
  };

  const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.email || user?.name || "user")}`;
  const currentAvatar = user?.avatarUrl || defaultAvatar;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div
        ref={cardRef}
        className="w-full max-w-sm bg-white dark:bg-[#1e1f22] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative transition-all"
      >
        {/* Banner */}
        <div className="h-24 bg-pink-500 relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Avatar */}
        <div className="absolute top-12 left-6">
          <div className="relative">
            <img
              src={currentAvatar}
              alt={user?.displayName || user?.name || "User Avatar"}
              className="w-20 h-20 rounded-full bg-white border-4 border-white dark:border-[#1e1f22] shadow-md object-cover"
            />
            {user && (
              <div
                className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-4 border-white dark:border-[#1e1f22] ${
                  statusOptions[user.status || "online"]?.color
                }`}
                title={statusOptions[user.status || "online"]?.label}
              />
            )}
          </div>
        </div>

        {/* Card Content */}
        <div className="pt-12 px-6 pb-6 mt-2">
          {loading ? (
            <div className="py-8 flex justify-center">
              <div className="w-8 h-8 border-3 border-pink-500/20 border-t-pink-500 rounded-full animate-spin"></div>
            </div>
          ) : errorMsg ? (
            <div className="text-center py-4">
              <p className="text-sm text-red-500">{errorMsg}</p>
            </div>
          ) : user ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-xl text-black dark:text-white leading-tight">
                  {user.displayName || user.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">@{user.name}</p>
              </div>

              {user.bio ? (
                <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200/40 dark:border-slate-700/30 rounded-xl p-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                    About Me
                  </p>
                  <p className="text-sm text-slate-700 dark:text-[#dbdee1] leading-relaxed break-words whitespace-pre-wrap">
                    {user.bio}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-slate-400 dark:text-slate-500 italic">No bio written yet.</p>
              )}

              <div className="border-t border-slate-100 dark:border-slate-800 pt-3.5 space-y-2.5">
                <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400">
                  <Mail size={14} className="text-slate-400" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400">
                  <Calendar size={14} className="text-slate-400" />
                  <span>Member since {formatDate(user.createdAt)}</span>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
