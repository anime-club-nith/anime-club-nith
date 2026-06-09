import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Download } from 'lucide-react';

export default function HeroSection() {
    const navigate = useNavigate();

    const handleStartChatting = () => {
        const user = localStorage.getItem("authUser");
        if (user) {
            navigate('/join-room');
        } else {
            navigate('/login');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-pink-50/30 to-white dark:from-[#0c0d12] dark:via-[#0c0d12] dark:to-[#0c0d12] text-black dark:text-white font-sans selection:bg-pink-500/30 transition-colors">
            <div className="relative z-10">

                {/* Hero Section */}
                <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto text-left">
                    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
                        
                        {/* Left Content */}
                        <div className="space-y-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-100 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 text-xs font-semibold border border-pink-200 dark:border-pink-500/20">
                                NIT Hamirpur Anime Club
                            </div>

                            <h1 className="font-black text-5xl md:text-7xl uppercase leading-[1.05] tracking-tight text-black dark:text-white">
                                ANIME CLUB <br />
                                <span className="text-pink-500">
                                    NITH
                                </span>
                            </h1>

                            <p className="text-sm md:text-base font-semibold text-pink-600 dark:text-pink-400 max-w-xl tracking-wide">
                                The First Rule of Anime Club is: You DO talk about Anime
                            </p>

                            <p className="text-lg font-medium text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
                                Anime Club NITH is the premier space for otaku, artists, and fans to connect. 
                                Join real-time room chats, publish reviews/blogs, showcase your artwork, and grow the community.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 pt-2">
                                <button
                                    onClick={handleStartChatting}
                                    className="btn-pink-modern flex items-center justify-center gap-2"
                                >
                                    Get Started
                                    <ArrowRight size={18} />
                                </button>

                                <Link
                                    to="/download"
                                    className="btn-outline-modern flex items-center justify-center gap-2 text-black dark:text-white"
                                >
                                    Get the App
                                    <Download size={18} />
                                </Link>
                            </div>
                        </div>

                        {/* Right Visual */}
                        <div className="relative flex justify-center lg:justify-end">
                            {/* Pink glow decoration */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-80 h-80 bg-pink-500/10 rounded-full blur-3xl" />
                            </div>
                            <div className="relative w-80 h-80 md:w-96 md:h-96 rounded-3xl bg-white/60 dark:bg-[#1e1f22]/60 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 shadow-2xl shadow-pink-500/10 flex items-center justify-center p-10">
                                <img
                                    src="/logo-vertical.png"
                                    alt="Anime Club NITH Logo"
                                    className="object-contain w-full h-full"
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}