import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, ShieldCheck, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import Navbar from '../components/NavBar';

type Tab = 'viaOldPass' | 'viaEmail';

export default function ForgotPassword() {
  const [activeTab, setActiveTab] = useState<Tab>('viaOldPass');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Form States
  const [oldPassForm, setOldPassForm] = useState({
    email: '',
    oldPassword: '',
    newPassword: ''
  });

  const [emailForm, setEmailForm] = useState({
    email: ''
  });

  // API Handlers
  const handleViaOldPass = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/auth/forget-password/viaOldPass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(oldPassForm)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Server error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViaEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/auth/forget-password/viaEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailForm)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Server error. Please try again.' });
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
          <h1 className="text-2xl font-black text-black dark:text-white mb-1">Reset Password</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Choose a method to recover your account.</p>
        </div>

        {/* Tab Switcher */}
        <div className="bg-[#f2f3f5] dark:bg-[#2b2d31] p-1 rounded-xl flex gap-1 mb-8 border border-slate-200 dark:border-slate-700/60">
          <button
            onClick={() => { setActiveTab('viaOldPass'); setMessage(null); }}
            className={`
              flex-1 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider text-center transition-all duration-200 cursor-pointer
              ${activeTab === 'viaOldPass' ? 'bg-white dark:bg-[#1e1f22] text-pink-500 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}
            `}
          >
            Use Old Password
          </button>
          <button
            onClick={() => { setActiveTab('viaEmail'); setMessage(null); }}
            className={`
              flex-1 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider text-center transition-all duration-200 cursor-pointer
              ${activeTab === 'viaEmail' ? 'bg-white dark:bg-[#1e1f22] text-pink-500 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}
            `}
          >
            Use Email Link
          </button>
        </div>

        {/* Content Area */}
        <div className="relative grid grid-cols-1">

          {/* METHOD 1: VIA OLD PASSWORD */}
          <div className={`transition-all duration-300 col-start-1 row-start-1 w-full ${activeTab === 'viaOldPass' ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 -translate-x-8 pointer-events-none'}`}>
            <form onSubmit={handleViaOldPass} className="space-y-5">

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    className="w-full bg-[#f2f3f5] dark:bg-[#2b2d31] border border-slate-200 dark:border-slate-700/60 rounded-xl py-3 pl-10 pr-4 text-black dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40 focus:border-pink-500 transition-all"
                    value={oldPassForm.email}
                    onChange={(e) => setOldPassForm({ ...oldPassForm, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Old Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type={showOldPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    className="w-full bg-[#f2f3f5] dark:bg-[#2b2d31] border border-slate-200 dark:border-slate-700/60 rounded-xl py-3 pl-10 pr-11 text-black dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40 focus:border-pink-500 transition-all"
                    value={oldPassForm.oldPassword}
                    onChange={(e) => setOldPassForm({ ...oldPassForm, oldPassword: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-pink-500 transition-colors cursor-pointer"
                  >
                    {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <ShieldCheck className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    className="w-full bg-[#f2f3f5] dark:bg-[#2b2d31] border border-slate-200 dark:border-slate-700/60 rounded-xl py-3 pl-10 pr-11 text-black dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40 focus:border-pink-500 transition-all"
                    value={oldPassForm.newPassword}
                    onChange={(e) => setOldPassForm({ ...oldPassForm, newPassword: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-pink-500 transition-colors cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-6 rounded-xl bg-pink-500 hover:bg-pink-400 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-pink-500/25 hover:shadow-lg hover:shadow-pink-500/30 transition-all duration-200 cursor-pointer"
                >
                  <span>{isLoading ? 'Updating...' : 'Change Password'}</span>
                  {!isLoading && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </form>
          </div>

          {/* METHOD 2: VIA EMAIL LINK */}
          <div className={`transition-all duration-300 col-start-1 row-start-1 w-full ${activeTab === 'viaEmail' ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 translate-x-8 pointer-events-none'}`}>
            <div className="mb-5 p-4 rounded-xl bg-pink-50 dark:bg-pink-900/10 border border-pink-100 dark:border-pink-900/20 text-slate-600 dark:text-slate-300 text-xs font-semibold leading-relaxed">
              We will send a secure link to your email address to reset your password. The link will expire in 30 minutes.
            </div>

            <form onSubmit={handleViaEmail} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    className="w-full bg-[#f2f3f5] dark:bg-[#2b2d31] border border-slate-200 dark:border-slate-700/60 rounded-xl py-3 pl-10 pr-4 text-black dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40 focus:border-pink-500 transition-all"
                    value={emailForm.email}
                    onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-6 rounded-xl bg-pink-500 hover:bg-pink-400 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-pink-500/25 hover:shadow-lg hover:shadow-pink-500/30 transition-all duration-200 cursor-pointer"
                >
                  <span>{isLoading ? 'Sending...' : 'Send Reset Link'}</span>
                  {!isLoading && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Message Alert */}
        {message && (
          <div className={`mt-6 p-4 rounded-xl border flex items-start gap-3 text-sm transition-all ${message.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400'}`}>
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <p>{message.text}</p>
          </div>
        )}

        {/* Footer Link */}
        <div className="mt-8 text-center">
          <a href="/login" className="text-sm text-pink-500 hover:text-pink-400 transition-colors font-semibold">
            &larr; Back to Login
          </a>
        </div>
      </div>
    </div>    
  );
}