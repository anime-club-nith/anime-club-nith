import { useNavigate } from 'react-router-dom';
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
        <div className="min-h-screen bg-white dark:bg-[#0c0d12] text-black dark:text-white font-sans selection:bg-pink-500/30 transition-colors">
            <div className="relative z-10">

                {/* Hero Section */}
                <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto text-left">
                    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
                        
                        {/* Left Content */}
                        <div className="space-y-10">
                            <div className="inline-block border-4 border-black dark:border-white px-5 py-1 font-black uppercase text-xs tracking-widest bg-pink-100 dark:bg-[#2b1724] text-black dark:text-white">
                                NIT Hamirpur Anime Club
                            </div>

                            <h1 className="text-5xl md:text-7xl font-black uppercase leading-[1.05] tracking-tight text-black dark:text-white">
                                ANIME CLUB <br />
                                <span className="text-pink-500">
                                    NITH
                                </span>
                            </h1>

                            <p className="text-sm md:text-base font-semibold text-pink-600 max-w-xl tracking-wide">
                                The First Rule of Anime Club is: You DO talk about Anime
                            </p>

                            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 max-w-xl leading-relaxed">
                                Anime Club NITH is the premier space for otaku, artists, and fans to connect. 
                                Join real-time room chats, publish reviews/blogs, showcase your artwork, and grow the community.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-6 pt-4">
                                <button
                                    onClick={handleStartChatting}
                                    className="px-10 py-4 bg-pink-500 hover:bg-pink-400 border-4 border-black dark:border-white font-black uppercase shadow-[6px_6px_0px_#000] dark:shadow-[6px_6px_0px_#E56DB1] active:translate-x-[2px] active:translate-y-[2px] transition flex items-center justify-center gap-2 cursor-pointer text-black dark:text-white"
                                >
                                    Get Started
                                    <ArrowRight size={18} />
                                </button>

                                <a
                                    href="https://github.com/anime-club-nith"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-10 py-4 bg-white dark:bg-[#161822] border-4 border-black dark:border-white font-black uppercase shadow-[6px_6px_0px_#000] dark:shadow-[6px_6px_0px_#E56DB1] hover:bg-gray-50 dark:hover:bg-[#1e2030] active:translate-x-[2px] active:translate-y-[2px] transition text-center text-black dark:text-white flex items-center justify-center gap-2"
                                >
                                    Get the App
                                    <Download size={18} />
                                </a>
                            </div>
                        </div>

                        {/* Right Visual */}
                        <div className="relative flex justify-center lg:justify-end">
                            <div className="relative w-[350px] h-[350px] md:w-[400px] md:h-[400px] border-4 border-black dark:border-white shadow-[10px_10px_0px_#000] dark:shadow-[10px_10px_0px_#E56DB1] bg-white dark:bg-[#161822] flex items-center justify-center p-8 transition-all">
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