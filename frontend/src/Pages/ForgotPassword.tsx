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
    <div className="min-h-screen bg-pink-100/35 text-black font-sans flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-pink-500/30">
      <Navbar />
      
      <div className="w-full max-w-md border-4 border-black bg-white p-8 shadow-[10px_10px_0px_#000] relative z-10 mt-24">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black uppercase tracking-tight text-black mb-2">Reset Password</h1>
          <p className="text-gray-600 font-semibold text-sm">Choose a method to recover your account.</p>
        </div>

        {/* Tab Switcher */}
        <div className="border-4 border-black bg-white flex shadow-[4px_4px_0px_#000] mb-8 overflow-hidden">
          <button
            onClick={() => { setActiveTab('viaOldPass'); setMessage(null); }}
            className={`
              flex-1 py-3 text-xs font-black uppercase tracking-widest text-center transition-colors duration-200 border-r-4 border-black cursor-pointer
              ${activeTab === 'viaOldPass' ? 'bg-pink-500 text-black' : 'bg-white text-black hover:bg-pink-100'}
            `}
          >
            Use Old Password
          </button>
          <button
            onClick={() => { setActiveTab('viaEmail'); setMessage(null); }}
            className={`
              flex-1 py-3 text-xs font-black uppercase tracking-widest text-center transition-colors duration-200 cursor-pointer
              ${activeTab === 'viaEmail' ? 'bg-pink-500 text-black' : 'bg-white text-black hover:bg-pink-100'}
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
                <label className="text-xs font-black uppercase text-black tracking-wider ml-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-black" strokeWidth={2.5} />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    className="w-full bg-white border-4 border-black py-3.5 pl-11 pr-4 text-black placeholder:text-gray-400 font-semibold focus:outline-none focus:bg-pink-100 shadow-[4px_4px_0px_#000] focus:shadow-[2px_2px_0px_#000] transition"
                    value={oldPassForm.email}
                    onChange={(e) => setOldPassForm({ ...oldPassForm, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-black tracking-wider ml-1">Old Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-black" strokeWidth={2.5} />
                  </div>
                  <input
                    type={showOldPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    className="w-full bg-white border-4 border-black py-3.5 pl-11 pr-12 text-black placeholder:text-gray-400 font-semibold focus:outline-none focus:bg-pink-100 shadow-[4px_4px_0px_#000] focus:shadow-[2px_2px_0px_#000] transition"
                    value={oldPassForm.oldPassword}
                    onChange={(e) => setOldPassForm({ ...oldPassForm, oldPassword: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-black hover:text-pink-500 cursor-pointer"
                  >
                    {showOldPassword ? <EyeOff className="h-5 w-5" strokeWidth={2.5} /> : <Eye className="h-5 w-5" strokeWidth={2.5} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-black tracking-wider ml-1">New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <ShieldCheck className="h-5 w-5 text-black" strokeWidth={2.5} />
                  </div>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    className="w-full bg-white border-4 border-black py-3.5 pl-11 pr-12 text-black placeholder:text-gray-400 font-semibold focus:outline-none focus:bg-pink-100 shadow-[4px_4px_0px_#000] focus:shadow-[2px_2px_0px_#000] transition"
                    value={oldPassForm.newPassword}
                    onChange={(e) => setOldPassForm({ ...oldPassForm, newPassword: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-black hover:text-pink-500 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="h-5 w-5" strokeWidth={2.5} /> : <Eye className="h-5 w-5" strokeWidth={2.5} />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 px-6 border-4 border-black bg-pink-500 hover:bg-pink-400 text-black font-black uppercase text-sm tracking-wider flex items-center justify-center gap-2 shadow-[6px_6px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] transition cursor-pointer"
                >
                  <span>{isLoading ? 'Updating...' : 'Change Password'}</span>
                  {!isLoading && <ArrowRight className="w-4 h-4" strokeWidth={3} />}
                </button>
              </div>
            </form>
          </div>

          {/* METHOD 2: VIA EMAIL LINK */}
          <div className={`transition-all duration-300 col-start-1 row-start-1 w-full ${activeTab === 'viaEmail' ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 translate-x-8 pointer-events-none'}`}>
            <div className="mb-6 p-4 border-4 border-black bg-pink-100 text-black text-xs font-semibold leading-relaxed shadow-[4px_4px_0px_#000]">
              We will send a secure link to your email address to reset your password. The link will expire in 30 minutes.
            </div>

            <form onSubmit={handleViaEmail} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-black tracking-wider ml-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-black" strokeWidth={2.5} />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    className="w-full bg-white border-4 border-black py-3.5 pl-11 pr-4 text-black placeholder:text-gray-400 font-semibold focus:outline-none focus:bg-pink-100 shadow-[4px_4px_0px_#000] focus:shadow-[2px_2px_0px_#000] transition"
                    value={emailForm.email}
                    onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 px-6 border-4 border-black bg-pink-500 hover:bg-pink-400 text-black font-black uppercase text-sm tracking-wider flex items-center justify-center gap-2 shadow-[6px_6px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] transition cursor-pointer"
                >
                  <span>{isLoading ? 'Sending...' : 'Send Reset Link'}</span>
                  {!isLoading && <ArrowRight className="w-4 h-4" strokeWidth={3} />}
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Message Alert */}
        {message && (
          <div className={`mt-6 p-4 border-4 border-black flex items-start gap-3 text-xs font-black uppercase shadow-[4px_4px_0px_#000] ${message.type === 'success' ? 'bg-emerald-100 text-emerald-800 border-emerald-500' : 'bg-red-100 text-red-800 border-red-500'}`}>
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <p>{message.text}</p>
          </div>
        )}

        {/* Footer Link */}
        <div className="mt-8 text-center">
          <a href="/login" className="text-sm text-pink-600 hover:text-pink-700 transition-colors font-black uppercase hover:underline">
            ← Back to Login
          </a>
        </div>
      </div>
    </div>    
  );
}