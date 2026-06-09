import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/NavBar";

export default function GoogleCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Parse access token from url hash
        const hash = window.location.hash;
        if (!hash) {
          setError("Google Authentication failed: No callback parameters received.");
          return;
        }

        // URLSearchParams expects query format, replace hash with query format
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get("access_token");

        if (!accessToken) {
          setError("Google Authentication failed: Access token was not returned.");
          return;
        }

        // Login on backend
        const res = await fetch("/api/auth/google-login-success", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ accessToken }),
          credentials: "include",
        });

        let data;
        try {
          data = await res.json();
        } catch (jsonErr: any) {
          const text = await res.text().catch(() => "");
          console.error("Failed to parse JSON response:", jsonErr);
          setError(`Server returned non-JSON response (Status ${res.status}): ${text.substring(0, 120) || jsonErr.message}`);
          return;
        }

        if (!res.ok) {
          setError(data.message || "Failed to log in via Google.");
          return;
        }

        try {
          localStorage.setItem("authUser", JSON.stringify(data.user));
        } catch (storageErr) {
          console.error("Storage error:", storageErr);
        }
        
        // Fetch and navigate to user's rooms or default room
        try {
          const roomsRes = await fetch("/api/room/all-rooms", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          });
          
          if (roomsRes.ok) {
            const roomsData = await roomsRes.json();
            if (roomsData && roomsData.length > 0) {
              navigate(`/room/${roomsData[0].roomId}`);
              return;
            }
          }
        } catch (roomsErr) {
          console.error("Failed to fetch rooms:", roomsErr);
        }

        navigate("/room");
      } catch (err: any) {
        console.error("Google auth callback error:", err);
        setError(`An error occurred during Google authentication: ${err?.message || err}`);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#f2f3f5] dark:bg-[#0c0d12] text-black dark:text-white font-sans flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-pink-500/30 transition-colors">
      <Navbar />
      
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/5 dark:bg-pink-500/8 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white/90 dark:bg-[#1e1f22]/90 backdrop-blur-md rounded-2xl border border-slate-200/60 dark:border-slate-700/40 shadow-2xl shadow-slate-900/10 dark:shadow-black/40 p-8 relative z-10 text-center mt-24">
        {error ? (
          <>
            <h1 className="text-xl font-black text-red-500 mb-4">Auth Error</h1>
            <p className="font-semibold text-slate-600 dark:text-slate-300 mb-6">{error}</p>
            <a href="/login" className="w-full py-3.5 px-6 rounded-xl bg-pink-500 hover:bg-pink-400 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-pink-500/25 hover:shadow-lg hover:shadow-pink-500/30 transition-all duration-200 cursor-pointer">
              Back to Login
            </a>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-black text-black dark:text-white mb-4">Authenticating</h1>
            <div className="flex justify-center items-center gap-2 mb-4">
              <span className="w-3 h-3 bg-pink-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-3 h-3 bg-pink-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-3 h-3 bg-pink-500 rounded-full animate-bounce"></span>
            </div>
            <p className="font-semibold text-slate-500 dark:text-slate-400">Please wait while we sync with Google...</p>
          </>
        )}
      </div>
    </div>
  );
}
