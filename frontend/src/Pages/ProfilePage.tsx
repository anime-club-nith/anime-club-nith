import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, FileText, CheckCircle } from "lucide-react";
import NavBar from "../components/NavBar";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  const [profile, setProfile] = useState({
    displayName: "",
    bio: "",
    avatarUrl: "",
    status: "online" as "online" | "idle" | "dnd" | "invisible",
  });
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile/me/info", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setProfile({
              displayName: data.user.displayName || "",
              bio: data.user.bio || "",
              avatarUrl: data.user.avatarUrl || "",
              status: data.user.status || "online",
            });
            setEmail(data.user.email || "");
            setUsername(data.user.name || "");
          }
        } else {
          // If not logged in, redirect to login
          navigate("/login");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setErrorMsg("Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    if (profile.bio.length > 180) {
      setErrorMsg("Bio must be 180 characters or less.");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/profile/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
        credentials: "include",
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Profile updated successfully!");
        // Update local authUser storage so frontend updates user info immediately
        const cached = localStorage.getItem("authUser");
        if (cached) {
          const parsed = JSON.parse(cached);
          parsed.displayName = data.user.displayName;
          parsed.avatar = data.user.avatarUrl;
          localStorage.setItem("authUser", JSON.stringify(parsed));
        }
      } else {
        setErrorMsg(data.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      setErrorMsg("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const statusOptions = [
    { value: "online", label: "Online", color: "bg-green-500" },
    { value: "idle", label: "Idle", color: "bg-amber-500" },
    { value: "dnd", label: "Do Not Disturb", color: "bg-red-500" },
    { value: "invisible", label: "Invisible", color: "bg-slate-400" },
  ];

  // Fallback to DiceBear avatar if custom URL is empty
  const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email || username || "user")}`;
  const currentAvatar = profile.avatarUrl || defaultAvatar;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-pink-50/10 to-white dark:from-[#0c0d12] dark:via-[#0c0d12] dark:to-[#0c0d12] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-pink-50/10 to-white dark:from-[#0c0d12] dark:via-[#0c0d12] dark:to-[#0c0d12] text-black dark:text-white flex flex-col">
      <NavBar />
      <div className="flex-1 flex items-center justify-center p-4 pt-24">
        <div className="w-full max-w-2xl bg-white/80 dark:bg-[#1e1f22]/80 backdrop-blur-md rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-xl overflow-hidden">
          {/* Decorative Header Banner */}
          <div className="h-32 bg-pink-500 relative flex items-end px-8 pb-4">
            <div className="absolute top-4 left-4">
              <button
                onClick={() => navigate("/room")}
                className="btn-outline-modern bg-white/10 border-white/20 text-white hover:bg-white/20 px-3 py-1.5 flex items-center gap-1.5 text-xs rounded-lg"
              >
                <ArrowLeft size={14} /> Back to Chat
              </button>
            </div>
            <div className="text-white">
              <h2 className="text-2xl font-black">User Profile Settings</h2>
              <p className="text-xs text-pink-100">Customize your presence in the club</p>
            </div>
          </div>

          <div className="p-8">
            {errorMsg && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-600 dark:text-green-400 text-sm flex items-center gap-2">
                <CheckCircle size={16} /> {successMsg}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
              {/* Profile Avatar Card Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                {/* Left side: Avatar Preview */}
                <div className="flex flex-col items-center gap-3 bg-slate-50/50 dark:bg-slate-800/20 border border-slate-200/60 dark:border-slate-700/40 rounded-2xl p-6">
                  <div className="relative">
                    <img
                      src={currentAvatar}
                      alt="Avatar Preview"
                      className="w-24 h-24 rounded-full bg-white border-2 border-pink-500 object-cover"
                    />
                    <div className={`absolute bottom-0 right-0 w-6 h-6 rounded-full border-4 border-white dark:border-[#1e1f22] ${
                      statusOptions.find(opt => opt.value === profile.status)?.color || "bg-green-500"
                    }`} />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-base">{profile.displayName || username}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">@{username}</p>
                  </div>
                </div>

                {/* Right side: Input Fields */}
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Display Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                      <input
                        type="text"
                        value={profile.displayName}
                        onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                        placeholder={username}
                        className="input-modern w-full pl-11"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Avatar Image URL
                    </label>
                    <input
                      type="url"
                      value={profile.avatarUrl}
                      onChange={(e) => setProfile({ ...profile, avatarUrl: e.target.value })}
                      placeholder="Leave blank for DiceBear avatar"
                      className="input-modern w-full"
                    />
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                      Supports direct image URLs. Leave empty to use your auto-generated DiceBear character.
                    </p>
                  </div>
                </div>
              </div>

              {/* Status and Bio fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Status
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {statusOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setProfile({ ...profile, status: opt.value as any })}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 cursor-pointer ${
                          profile.status === opt.value
                            ? "border-pink-500 bg-pink-500/5 text-pink-600 dark:text-pink-400 font-semibold"
                            : "border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full ${opt.color}`} />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Bio
                    </label>
                    <span className={`text-[10px] ${
                      profile.bio.length > 180
                        ? "text-red-500 font-bold"
                        : "text-slate-400 dark:text-slate-500"
                    }`}>
                      {profile.bio.length} / 180
                    </span>
                  </div>
                  <div className="relative">
                    <FileText className="absolute left-3.5 top-3 text-slate-400 dark:text-slate-500" size={18} />
                    <textarea
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value.substring(0, 180) })}
                      placeholder="Tell the club about yourself..."
                      rows={3}
                      className="input-modern w-full pl-11 pt-3 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200/60 dark:border-slate-700/60">
                <button
                  type="button"
                  onClick={() => navigate("/room")}
                  className="btn-outline-modern rounded-xl px-5 py-2.5 text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-pink-modern rounded-xl px-6 py-2.5 text-sm flex items-center gap-2 cursor-pointer"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
