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
        <div className="min-h-screen bg-pink-100/35 text-black font-sans flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-pink-500/30">
            <Navbar />
            
            <div className="w-full max-w-md border-4 border-black bg-white p-8 shadow-[10px_10px_0px_#000] relative z-10 mt-24">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black uppercase tracking-tight text-black mb-2">Set New Password</h1>
                    <p className="text-gray-600 font-semibold text-sm">Create a secure password for your account.</p>
                </div>

                {status === "success" ? (
                    <div className="text-center py-8 animate-in zoom-in duration-300">
                        <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
                        <h3 className="text-xl font-black uppercase text-black mb-2">All Set!</h3>
                        <p className="text-gray-700 font-semibold">{message}</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-black tracking-wider ml-1">New Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <ShieldCheck className="h-5 w-5 text-black" strokeWidth={2.5} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    placeholder="••••••••"
                                    className="w-full bg-white border-4 border-black py-3.5 pl-11 pr-12 text-black placeholder:text-gray-400 font-semibold focus:outline-none focus:bg-pink-100 shadow-[4px_4px_0px_#000] focus:shadow-[2px_2px_0px_#000] transition"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-black hover:text-pink-500 cursor-pointer"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" strokeWidth={2.5} /> : <Eye className="h-5 w-5" strokeWidth={2.5} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-black tracking-wider ml-1">Confirm Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <ShieldCheck className="h-5 w-5 text-black" strokeWidth={2.5} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    placeholder="••••••••"
                                    className="w-full bg-white border-4 border-black py-3.5 pl-11 pr-4 text-black placeholder:text-gray-400 font-semibold focus:outline-none focus:bg-pink-100 shadow-[4px_4px_0px_#000] focus:shadow-[2px_2px_0px_#000] transition"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {status === "error" && (
                            <div className="p-3 border-4 border-black bg-red-100 text-red-800 text-xs font-black uppercase flex items-center gap-2 shadow-[4px_4px_0px_#000] animate-in slide-in-from-top-2 fade-in">
                                <XCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
                                <span>{message}</span>
                            </div>
                        )}

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading || !token}
                                className="w-full py-4 px-6 border-4 border-black bg-pink-500 hover:bg-pink-400 text-black font-black uppercase text-sm tracking-wider flex items-center justify-center gap-2 shadow-[6px_6px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] transition cursor-pointer"
                            >
                                <span>{isLoading ? 'Resetting...' : 'Reset Password'}</span>
                                {!isLoading && <ArrowRight className="w-4 h-4" strokeWidth={3} />}
                            </button>
                        </div>

                    </form>
                )}
            </div>
        </div>
    );
}
