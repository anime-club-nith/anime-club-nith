import React, { useState } from "react";
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react";
import Navbar from "../components/NavBar";

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("All fields are required");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "Failed to sign up");
        return;
      }

      try {
        const storedUser = {
          name: formData.name,
          email: formData.email,
        };
        localStorage.setItem("authUser", JSON.stringify(storedUser));
      } catch {
        // ignore storage failures
      }

      setSuccess(data?.message || "Email sent for verification");
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
            Create an account
          </h1>
          <p className="text-gray-600 font-semibold text-sm">
            Join the community of anime enthusiasts.
          </p>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Status Messages */}
          {error && (
            <p className="text-xs font-black uppercase text-red-600 border-2 border-black bg-red-100 p-3 shadow-[3px_3px_0px_#000] text-center mb-2">
              {error}
            </p>
          )}
          {success && (
            <p className="text-xs font-black uppercase text-emerald-600 border-2 border-black bg-emerald-100 p-3 shadow-[3px_3px_0px_#000] text-center mb-2">
              {success}
            </p>
          )}

          {/* Name Field */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-black tracking-wider ml-1">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-black" strokeWidth={2.5} />
              </div>
              <input
                type="text"
                placeholder="John Doe"
                className="w-full bg-white border-4 border-black py-3.5 pl-11 pr-4 text-black placeholder:text-gray-400 font-semibold focus:outline-none focus:bg-pink-100 shadow-[4px_4px_0px_#000] focus:shadow-[2px_2px_0px_#000] transition"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
          </div>

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
            <label className="text-xs font-black uppercase text-black tracking-wider ml-1">
              Password
            </label>
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

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-black tracking-wider ml-1">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <ShieldCheck className="h-5 w-5 text-black" strokeWidth={2.5} />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full bg-white border-4 border-black py-3.5 pl-11 pr-10 text-black placeholder:text-gray-400 font-semibold focus:outline-none focus:bg-pink-100 shadow-[4px_4px_0px_#000] focus:shadow-[2px_2px_0px_#000] transition"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-black hover:text-pink-500"
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                {showConfirmPassword ? (
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
              <span>
                {isSubmitting ? "Creating account..." : "Create Account"}
              </span>
              <ArrowRight className="w-4 h-4" strokeWidth={3} />
            </button>
          </div>
        </form>

        {/* Footer Link */}
        <p className="mt-8 text-center text-gray-500 text-sm font-semibold">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-pink-600 hover:text-pink-700 transition-colors font-black uppercase hover:underline"
          >
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}
