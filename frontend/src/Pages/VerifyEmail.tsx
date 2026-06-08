import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2, ArrowRight, ShieldCheck } from "lucide-react";
import Navbar from "../components/NavBar";

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("Verifying your email...");

    useEffect(() => {
        const verify = async () => {
            const hash = searchParams.get("hash");
            if (!hash) {
                setStatus("error");
                setMessage("Invalid verification link.");
                return;
            }

            try {
                const res = await fetch(`/api/auth/verify-acc?hash=${hash}`, {
                    method: "GET",
                    credentials: "include",
                });

                const data = await res.json();

                if (res.ok) {
                    setStatus("success");
                    setMessage("Email verified successfully! Redirecting...");

                    if (data.token) {
                        setTimeout(() => {
                            navigate("/join-room");
                        }, 1500);
                    }
                } else {
                    setStatus("error");
                    setMessage(data.message || "Verification failed.");
                }
            } catch (error) {
                setStatus("error");
                setMessage("Something went wrong. Please try again.");
            }
        };

        setTimeout(verify, 1500);
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen bg-pink-100/35 text-black font-sans flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-pink-500/30">
            <Navbar />
            
            <div className="w-full max-w-md border-4 border-black bg-white p-8 shadow-[10px_10px_0px_#000] relative z-10 mt-24">
                {/* Status Icon Area */}
                <div className="flex justify-center mb-8">
                    <div className={`w-20 h-20 border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_#000] transition-colors duration-500 ${status === 'loading' ? 'bg-pink-100' :
                            status === 'success' ? 'bg-emerald-100' :
                                'bg-red-100'
                        }`}>
                        {status === "loading" && (
                            <Loader2 className="w-10 h-10 text-black animate-spin" strokeWidth={2.5} />
                        )}
                        {status === "success" && (
                            <CheckCircle2 className="w-10 h-10 text-emerald-600 animate-in zoom-in duration-300" strokeWidth={2.5} />
                        )}
                        {status === "error" && (
                            <XCircle className="w-10 h-10 text-red-600 animate-in zoom-in duration-300" strokeWidth={2.5} />
                        )}
                    </div>
                </div>

                {/* Text Content */}
                <h1 className="text-2xl font-black uppercase text-black text-center mb-3">
                    {status === "loading" ? "Verifying..." : status === "success" ? "Verified!" : "Verification Failed"}
                </h1>

                <p className="text-gray-700 font-semibold leading-relaxed text-center mb-10 min-h-[48px]">
                    {message}
                </p>

                {/* Action Button */}
                {status !== "loading" && (
                    <button
                        onClick={() => navigate("/login")}
                        className="w-full py-4 px-6 border-4 border-black bg-pink-500 hover:bg-pink-400 text-black font-black uppercase text-sm tracking-wider flex items-center justify-center gap-2 shadow-[6px_6px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] transition cursor-pointer"
                    >
                        <span>Go to Login</span>
                        <ArrowRight className="w-4 h-4" strokeWidth={3} />
                    </button>
                )}

                {/* Footer Brand */}
                <div className="mt-8 text-center">
                    <ShieldCheck className="w-5 h-5 mx-auto text-black mb-2" strokeWidth={2} />
                    <p className="text-xs text-black font-black tracking-widest uppercase">Secure Verification</p>
                </div>
            </div>
        </div>
    );
}