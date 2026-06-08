import React, { useState, useEffect } from "react";
import { Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/NavBar";

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [googleClientId, setGoogleClientId] = useState("");
  const [showGoogleMockModal, setShowGoogleMockModal] = useState(false);

  useEffect(() => {
    const fetchGoogleConfig = async () => {
      try {
        const res = await fetch("/api/auth/google-config");
        if (res.ok) {
          const data = await res.json();
          if (data.googleClientId && data.googleClientId !== "YOUR_GOOGLE_CLIENT_ID") {
            setGoogleClientId(data.googleClientId);
          }
        }
      } catch (err) {
        console.error("Failed to load Google configuration:", err);
      }
    };
    fetchGoogleConfig();
  }, []);

  const handleGoogleSignIn = () => {
    if (googleClientId) {
      const redirectUri = encodeURIComponent(`${window.location.origin}/google-callback`);
      window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${redirectUri}&response_type=token&scope=openid%20profile%20email`;
    } else {
      setShowGoogleMockModal(true);
    }
  };

  const handleMockLogin = async (mockToken: string) => {
    setShowGoogleMockModal(false);
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/google-login-success", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ accessToken: mockToken }),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || "Mock login failed");
        return;
      }

      try {
        localStorage.setItem("authUser", JSON.stringify(data.user));
      } catch {
        // ignore
      }

      await fetchAndNavigate();
    } catch (err) {
      console.error(err);
      setError("Mock login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const fetchAndNavigate = async () => {
    try {
      const res = await fetch("/api/rooms", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        navigate("/room");
        return;
      }

      const { roomIds } = data;
      if (roomIds && roomIds.length > 0) {
        navigate(`/room/${roomIds[0]}`);
      } else {
        navigate("/room");
      }
    } catch (err) {
      console.error("Failed to fetch rooms, navigating to default:", err);
      navigate("/room");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.email || !formData.password) {
      setError("All fields are required");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "Failed to login");
        return;
      }

      try {
        localStorage.setItem("authUser", JSON.stringify(data.user));
      } catch {
        // ignore storage failures
      }

      await fetchAndNavigate();
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-pink-100/35 text-black font-sans flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-pink-500/30">
      <Navbar />
      
      <div className="w-full max-w-md border-4 border-black bg-white p-8 shadow-[10px_10px_0px_#000] relative z-10 mt-24">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black uppercase tracking-tight text-black mb-2">
            Welcome back
          </h1>
          <p className="text-gray-600 font-semibold text-sm">
            Enter your credentials to access the workspace.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Status Messages */}
          {error && (
            <p className="text-xs font-black uppercase text-red-600 border-2 border-black bg-red-100 p-3 shadow-[3px_3px_0px_#000] text-center mb-4">
              {error}
            </p>
          )}

          {/* Email Field */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-black tracking-wider ml-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-black" strokeWidth={2.5} />
              </div>
              <input
                type="email"
                placeholder="john@example.com"
                className="w-full bg-white border-4 border-black py-3.5 pl-11 pr-4 text-black placeholder:text-gray-400 font-semibold focus:outline-none focus:bg-pink-100 shadow-[4px_4px_0px_#000] focus:shadow-[2px_2px_0px_#000] transition"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between ml-1">
              <label className="text-xs font-black uppercase text-black tracking-wider">
                Password
              </label>
              <a
                href="/forgot-password"
                className="text-xs text-pink-600 hover:text-pink-700 transition-colors cursor-pointer font-black uppercase tracking-wider hover:underline"
              >
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-black" strokeWidth={2.5} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full bg-white border-4 border-black py-3.5 pl-11 pr-10 text-black placeholder:text-gray-400 font-semibold focus:outline-none focus:bg-pink-100 shadow-[4px_4px_0px_#000] focus:shadow-[2px_2px_0px_#000] transition"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-black hover:text-pink-500"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" strokeWidth={2.5} />
                ) : (
                  <Eye className="w-5 h-5" strokeWidth={2.5} />
                )}
              </button>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 border-4 border-black bg-pink-500 hover:bg-pink-400 text-black font-black uppercase text-sm tracking-wider flex items-center justify-center gap-2 shadow-[6px_6px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] transition cursor-pointer"
            >
              <span>{isSubmitting ? "Signing in..." : "Sign In"}</span>
              <ArrowRight className="w-4 h-4" strokeWidth={3} />
            </button>
          </div>
        </form>

        {/* OR divider */}
        <div className="relative flex py-4 items-center">
          <div className="flex-grow border-t-2 border-black"></div>
          <span className="flex-shrink mx-4 text-xs font-black uppercase text-black">OR</span>
          <div className="flex-grow border-t-2 border-black"></div>
        </div>

        {/* Google Auth Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full py-4 px-6 border-4 border-black bg-white hover:bg-gray-50 text-black font-black uppercase text-sm tracking-wider flex items-center justify-center gap-3 shadow-[6px_6px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] transition cursor-pointer"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.359 0 3.373 2.673 1.455 6.573L5.266 9.765z"
            />
            <path
              fill="#34A853"
              d="M16.04 15.34c-1.07.73-2.5 1.169-4.04 1.169a7.07 7.07 0 0 1-6.733-4.855l-3.818 3.127C3.373 21.327 7.359 24 12 24c3.082 0 5.891-1.009 8.018-2.836l-3.978-5.824z"
            />
            <path
              fill="#4285F4"
              d="M23.49 12.273c0-.818-.082-1.609-.227-2.373H12v4.51h6.445A5.518 5.518 0 0 1 16.04 15.34l3.978 5.824c2.327-2.145 3.472-5.3 3.472-8.891z"
            />
            <path
              fill="#FBBC05"
              d="M5.267 11.654A7.02 7.02 0 0 1 5.267 9.765l-3.812-3.19A11.954 11.954 0 0 0 0 12c0 2.018.5 3.918 1.455 5.618l3.812-3.964z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Footer Link */}
        <p className="mt-8 text-center text-gray-500 text-sm font-semibold">
          Don't have an account?{" "}
          <a
            href="/signup"
            className="text-pink-600 hover:text-pink-700 transition-colors font-black uppercase hover:underline"
          >
            Sign up
          </a>
        </p>
      </div>

      {/* Mock Google Account Chooser Modal */}
      {showGoogleMockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm border-4 border-black bg-white p-6 shadow-[8px_8px_0px_#000] relative">
            <h2 className="text-xl font-black uppercase text-black mb-1">Sign in with Google</h2>
            <p className="text-gray-600 text-xs font-semibold mb-6">Demo mode: select a sandbox Google account.</p>
            
            <div className="space-y-3">
              {[
                { name: "Vismay Gawai", email: "vismay@nith.ac.in", token: "mock-access-token-otaku" },
                { name: "Anime Fan", email: "fan@nith.ac.in", token: "mock-access-token-fan" },
                { name: "Otaku Member", email: "otaku@nith.ac.in", token: "mock-access-token-otaku" }
              ].map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleMockLogin(acc.token)}
                  className="w-full text-left p-3 border-2 border-black bg-pink-50 hover:bg-pink-100 flex items-center gap-3 shadow-[3px_3px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] transition cursor-pointer"
                >
                  <div className="w-8 h-8 border-2 border-black bg-pink-505 text-black flex items-center justify-center font-black rounded-full uppercase text-xs" style={{ backgroundColor: '#ec4899' }}>
                    {acc.name[0]}
                  </div>
                  <div>
                    <div className="font-black text-sm text-black">{acc.name}</div>
                    <div className="text-xs font-semibold text-gray-500">{acc.email}</div>
                  </div>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowGoogleMockModal(false)}
              className="mt-6 w-full py-2 border-4 border-black bg-gray-200 hover:bg-gray-300 text-black font-black uppercase text-xs tracking-wider shadow-[3px_3px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] transition cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
