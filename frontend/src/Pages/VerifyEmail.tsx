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
        <div className="min-h-screen bg-[#f2f3f5] dark:bg-[#0c0d12] text-black dark:text-white font-sans flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-pink-500/30 transition-colors">
            <Navbar />
            
            {/* Background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/5 dark:bg-pink-500/8 rounded-full blur-3xl pointer-events-none" />

            <div className="w-full max-w-md bg-white/90 dark:bg-[#1e1f22]/90 backdrop-blur-md rounded-2xl border border-slate-200/60 dark:border-slate-700/40 shadow-2xl shadow-slate-900/10 dark:shadow-black/40 p-8 relative z-10 mt-24">
                {/* Status Icon Area */}
                <div className="flex justify-center mb-8">
                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg transition-colors duration-500 ${
                        status === 'loading' ? 'bg-pink-100 dark:bg-pink-500/10' :
                        status === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/20' :
                        'bg-red-50 dark:bg-red-950/20'
                    }`}>
                        {status === "loading" && (
                            <Loader2 className="w-10 h-10 text-pink-500 animate-spin" strokeWidth={2.5} />
                        )}
                        {status === "success" && (
                            <CheckCircle2 className="w-10 h-10 text-emerald-500 animate-in zoom-in duration-300" strokeWidth={2.5} />
                        )}
                        {status === "error" && (
                            <XCircle className="w-10 h-10 text-red-500 animate-in zoom-in duration-300" strokeWidth={2.5} />
                        )}
                    </div>
                </div>

                {/* Text Content */}
                <h1 className="text-2xl font-black text-black dark:text-white text-center mb-3">
                    {status === "loading" ? "Verifying..." : status === "success" ? "Verified!" : "Verification Failed"}
                </h1>

                <p className="text-slate-500 dark:text-slate-400 font-semibold leading-relaxed text-center mb-10 min-h-[48px]">
                    {message}
                </p>

                {/* Action Button */}
                {status !== "loading" && (
                    <button
                        onClick={() => navigate("/login")}
                        className="w-full py-3.5 px-6 rounded-xl bg-pink-500 hover:bg-pink-400 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-pink-500/25 hover:shadow-lg hover:shadow-pink-500/30 transition-all duration-200 cursor-pointer"
                    >
                        <span>Go to Login</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                )}

                {/* Footer Brand */}
                <div className="mt-8 text-center text-slate-400 dark:text-slate-500">
                    <ShieldCheck className="w-5 h-5 mx-auto mb-2" strokeWidth={2} />
                    <p className="text-xs font-semibold tracking-wider uppercase">Secure Verification</p>
                </div>
            </div>
        </div>
    );
}