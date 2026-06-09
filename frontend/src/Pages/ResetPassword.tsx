import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ShieldCheck, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import Navbar from "../components/NavBar";

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("Invalid or missing reset token.");
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setStatus("error");
            setMessage("Passwords do not match.");
            return;
        }

        if (password.length < 6) {
            setStatus("error");
            setMessage("Password must be at least 6 characters.");
            return;
        }

        setIsLoading(true);
        setStatus("idle");
        setMessage("");

        try {
            const res = await fetch(`/api/auth/reset-password?token=${token}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newPassword: password }),
            });

            const data = await res.json();

            if (res.ok) {
                setStatus("success");
                setMessage("Password reset successfully! Redirecting to login...");
                setTimeout(() => navigate("/login"), 3000);
            } else {
                setStatus("error");
                setMessage(data.message || "Failed to reset password.");
            }
        } catch (error) {
            setStatus("error");
            setMessage("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f2f3f5] dark:bg-[#0c0d12] text-black dark:text-white font-sans flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-pink-500/30 transition-colors">
            <Navbar />
            
            {/* Background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/5 dark:bg-pink-500/8 rounded-full blur-3xl pointer-events-none" />

            <div className="w-full max-w-md bg-white/90 dark:bg-[#1e1f22]/90 backdrop-blur-md rounded-2xl border border-slate-200/60 dark:border-slate-700/40 shadow-2xl shadow-slate-900/10 dark:shadow-black/40 p-8 relative z-10 mt-24">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-black text-black dark:text-white mb-1">Set New Password</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Create a secure password for your account.</p>
                </div>

                {status === "success" ? (
                    <div className="text-center py-8 animate-in zoom-in duration-300">
                        <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
                        <h3 className="text-xl font-black uppercase text-black dark:text-white mb-2">All Set!</h3>
                        <p className="text-slate-600 dark:text-slate-300 font-semibold">{message}</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">

                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">New Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <ShieldCheck className="h-4 w-4 text-slate-400" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    placeholder="••••••••"
                                    className="w-full bg-[#f2f3f5] dark:bg-[#2b2d31] border border-slate-200 dark:border-slate-700/60 rounded-xl py-3 pl-10 pr-11 text-black dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40 focus:border-pink-500 transition-all"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-pink-500 transition-colors cursor-pointer"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Confirm Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <ShieldCheck className="h-4 w-4 text-slate-400" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    placeholder="••••••••"
                                    className="w-full bg-[#f2f3f5] dark:bg-[#2b2d31] border border-slate-200 dark:border-slate-700/60 rounded-xl py-3 pl-10 pr-4 text-black dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40 focus:border-pink-500 transition-all"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {status === "error" && (
                            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400 text-sm">
                                <XCircle className="w-4 h-4 flex-shrink-0" />
                                <span>{message}</span>
                            </div>
                        )}

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading || !token}
                                className="w-full py-3.5 px-6 rounded-xl bg-pink-500 hover:bg-pink-400 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-pink-500/25 hover:shadow-lg hover:shadow-pink-500/30 transition-all duration-200 cursor-pointer disabled:opacity-50"
                            >
                                <span>{isLoading ? 'Resetting...' : 'Reset Password'}</span>
                                {!isLoading && <ArrowRight className="w-4 h-4" />}
                            </button>
                        </div>

                    </form>
                )}
            </div>
        </div>
    );
}
