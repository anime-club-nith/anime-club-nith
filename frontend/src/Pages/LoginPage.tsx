import React, { useState, useEffect, useRef } from "react";
import { Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/NavBar";
import AnimatedBackground from "../components/AnimatedBackground";

// Extend Window type for Google Identity Services
declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            ux_mode?: string;
            callback: (response: { access_token?: string; error?: string }) => void;
          }) => { requestAccessToken: () => void };
        };
      };
    };
  }
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [googleClientId, setGoogleClientId] = useState("");
  const [showGoogleMockModal, setShowGoogleMockModal] = useState(false);
  const tokenClientRef = useRef<{ requestAccessToken: () => void } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const fetchAndNavigate = async () => {
    try {
      const res = await fetch("/api/rooms", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
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

  // Load GSI script and initialize token client when clientId is available
  useEffect(() => {
    if (!googleClientId) return;

    const loadGsi = () => {
      if (window.google?.accounts?.oauth2) {
        tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: "openid profile email",
          ux_mode: "popup",
          callback: handleGoogleTokenResponse,
        });
        return;
      }
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.google?.accounts?.oauth2) {
          tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
            client_id: googleClientId,
            scope: "openid profile email",
            ux_mode: "popup",
            callback: handleGoogleTokenResponse,
          });
        }
      };
      document.head.appendChild(script);
    };

    loadGsi();
  }, [googleClientId]);

  const handleGoogleTokenResponse = async (tokenResponse: { access_token?: string; error?: string }) => {
    if (tokenResponse.error || !tokenResponse.access_token) {
      setError("Google sign-in was cancelled or failed.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/google-login-success", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: tokenResponse.access_token }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || "Google sign-in failed");
        return;
      }
      try {
        localStorage.setItem("authUser", JSON.stringify(data.user));
      } catch { /* ignore */ }
      await fetchAndNavigate();
    } catch (err) {
      console.error(err);
      setError("Something went wrong during Google sign-in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = () => {
    if (googleClientId && tokenClientRef.current) {
      tokenClientRef.current.requestAccessToken();
    } else if (googleClientId && !tokenClientRef.current) {
      // GSI script might still be loading, show brief message
      setError("Google Sign-In is loading, please try again in a moment.");
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
        headers: { "Content-Type": "application/json" },
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
        headers: { "Content-Type": "application/json" },
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
    <div className="min-h-screen bg-[#f2f3f5] dark:bg-[#0c0d12] text-black dark:text-white font-sans flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-pink-500/30 transition-colors">
      <Navbar />
      <AnimatedBackground />

      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/5 dark:bg-pink-500/8 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white/90 dark:bg-[#1e1f22]/90 backdrop-blur-md rounded-2xl border border-slate-200/60 dark:border-slate-700/40 shadow-2xl shadow-slate-900/10 dark:shadow-black/40 p-8 relative z-10 mt-24">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-pink-500 flex items-center justify-center mx-auto mb-4 shadow-md shadow-pink-500/30">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-black text-black dark:text-white mb-1">
            Welcome back
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Sign in to continue to Anime Club NITH.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400 text-sm">
              <span>{error}</span>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="email"
                placeholder="example@gmail.com"
                className="w-full bg-[#f2f3f5] dark:bg-[#2b2d31] border border-slate-200 dark:border-slate-700/60 rounded-xl py-3 pl-10 pr-4 text-black dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40 focus:border-pink-500 transition-all"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Password
              </label>
              <a
                href="/forgot-password"
                className="text-xs text-pink-500 hover:text-pink-400 transition-colors font-medium"
              >
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full bg-[#f2f3f5] dark:bg-[#2b2d31] border border-slate-200 dark:border-slate-700/60 rounded-xl py-3 pl-10 pr-11 text-black dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40 focus:border-pink-500 transition-all"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-pink-500 transition-colors cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 rounded-xl bg-pink-500 hover:bg-pink-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-pink-500/25 hover:shadow-lg hover:shadow-pink-500/30 transition-all duration-200 cursor-pointer"
          >
            <span>{isSubmitting ? "Signing in..." : "Sign In"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* OR divider */}
        <div className="relative flex py-5 items-center">
          <div className="flex-grow h-px bg-slate-200 dark:bg-slate-700/60" />
          <span className="flex-shrink mx-4 text-xs font-semibold text-slate-400 dark:text-slate-500">OR</span>
          <div className="flex-grow h-px bg-slate-200 dark:bg-slate-700/60" />
        </div>

        {/* Google Auth Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full py-3 px-6 rounded-xl bg-white dark:bg-[#2b2d31] hover:bg-slate-50 dark:hover:bg-[#383a40] border border-slate-200 dark:border-slate-700/60 text-black dark:text-white font-semibold text-sm flex items-center justify-center gap-3 transition-all duration-200 cursor-pointer shadow-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.359 0 3.373 2.673 1.455 6.573L5.266 9.765z" />
            <path fill="#34A853" d="M16.04 15.34c-1.07.73-2.5 1.169-4.04 1.169a7.07 7.07 0 0 1-6.733-4.855l-3.818 3.127C3.373 21.327 7.359 24 12 24c3.082 0 5.891-1.009 8.018-2.836l-3.978-5.824z" />
            <path fill="#4285F4" d="M23.49 12.273c0-.818-.082-1.609-.227-2.373H12v4.51h6.445A5.518 5.518 0 0 1 16.04 15.34l3.978 5.824c2.327-2.145 3.472-5.3 3.472-8.891z" />
            <path fill="#FBBC05" d="M5.267 11.654A7.02 7.02 0 0 1 5.267 9.765l-3.812-3.19A11.954 11.954 0 0 0 0 12c0 2.018.5 3.918 1.455 5.618l3.812-3.964z" />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Footer Link */}
        <p className="mt-6 text-center text-slate-500 dark:text-slate-400 text-sm">
          Don&apos;t have an account?{" "}
          <a href="/signup" className="text-pink-500 hover:text-pink-400 transition-colors font-semibold">
            Sign up
          </a>
        </p>
      </div>

      {/* Mock Google Account Chooser Modal */}
      {showGoogleMockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white dark:bg-[#1e1f22] rounded-2xl border border-slate-200/60 dark:border-slate-700/40 shadow-2xl p-6 relative">
            <h2 className="text-lg font-black text-black dark:text-white mb-1">Sign in with Google</h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs mb-5">Demo mode: select a sandbox Google account.</p>

            <div className="space-y-2">
              {[
                { name: "Vismay Gawai", email: "vismay@nith.ac.in", token: "mock-access-token-otaku" },
                { name: "Anime Fan", email: "fan@nith.ac.in", token: "mock-access-token-fan" },
                { name: "Otaku Member", email: "otaku@nith.ac.in", token: "mock-access-token-otaku" },
              ].map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleMockLogin(acc.token)}
                  className="w-full text-left p-3 rounded-xl bg-slate-50 dark:bg-[#2b2d31] hover:bg-pink-50 dark:hover:bg-pink-500/10 border border-slate-200/60 dark:border-slate-700/40 flex items-center gap-3 transition-all cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-full bg-pink-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {acc.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-black dark:text-white">{acc.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{acc.email}</div>
                  </div>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowGoogleMockModal(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 text-black dark:text-white font-semibold text-sm transition-all cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
