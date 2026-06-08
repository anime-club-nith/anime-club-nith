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

        const data = await res.json();
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
      } catch (err) {
        console.error(err);
        setError("An error occurred during Google authentication.");
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-pink-100/35 text-black font-sans flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-pink-500/30">
      <Navbar />
      <div className="w-full max-w-md border-4 border-black bg-white p-8 shadow-[10px_10px_0px_#000] relative z-10 text-center mt-24">
        {error ? (
          <>
            <h1 className="text-2xl font-black uppercase text-red-600 mb-4 border-2 border-black bg-red-100 py-2">Auth Error</h1>
            <p className="font-semibold mb-6">{error}</p>
            <a href="/login" className="w-full py-4 px-6 border-4 border-black bg-pink-500 hover:bg-pink-400 text-black font-black uppercase text-sm tracking-wider flex items-center justify-center gap-2 shadow-[6px_6px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] transition cursor-pointer">
              Back to Login
            </a>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-black uppercase text-black mb-4">Authenticating</h1>
            <div className="flex justify-center items-center gap-2 mb-4">
              <span className="w-3 h-3 bg-pink-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-3 h-3 bg-pink-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-3 h-3 bg-pink-500 rounded-full animate-bounce"></span>
            </div>
            <p className="font-semibold text-gray-600">Please wait while we sync with Google...</p>
          </>
        )}
      </div>
    </div>
  );
}
