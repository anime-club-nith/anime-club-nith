import { useState, useEffect } from 'react';
import { ArrowUpRight, Search, X, PenTool, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/NavBar';
import Footer from '../components/Footer';

interface BlogPost {
    _id: string;
    id?: string;
    title: string;
    excerpt: string;
    content: string;
    tags: string[];
    readTime: string;
    createdAt: string;
    color?: string;
    user?: {
        name: string;
        email: string;
    };
}

const BlogPage = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [showAuthModal, setShowAuthModal] = useState(false);

    useEffect(() => {
        document.body.style.overflow = showAuthModal ? 'hidden' : 'unset';
    }, [showAuthModal]);

    const [posts, setPosts] = useState<BlogPost[]>([]);

    const formatDate = (isoString: string) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getRandomColor = () => {
        const colors = ['#E56DB1', '#E56DB1', '#E56DB1'];
        return colors[Math.floor(Math.random() * colors.length)];
    };

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch('/api/blog');
                const data = await response.json();

                const processPosts = (rawPosts: any[]): BlogPost[] => {
                    return rawPosts.map(post => ({
                        ...post,
                        readTime: post.readTime || '3 min read',
                        color: post.color || getRandomColor()
                    })).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                };

                if (Array.isArray(data)) {
                    setPosts(processPosts(data));
                } else if (data && Array.isArray(data.blogs)) {
                    setPosts(processPosts(data.blogs));
                } else {
                    setPosts([]);
                }
            } catch (error) {
                console.error("Failed to fetch blogs:", error);
                setPosts([]);
            }
        };

        fetchPosts();
    }, []);

    const filteredPosts = posts.filter(post => {
        const query = searchQuery.toLowerCase();
        return (
            post.title.toLowerCase().includes(query) ||
            post.tags.some(tag => tag.toLowerCase().includes(query)) ||
            (post.user?.name || "").toLowerCase().includes(query) ||
            (post.user?.email || "").toLowerCase().includes(query)
        );
    });

    return (
        <>
            <div className="min-h-screen bg-[#f2f3f5] dark:bg-[#0c0d12] text-black dark:text-white font-sans selection:bg-pink-500/30 transition-colors relative overflow-hidden">
                <Navbar />

                {/* Background glow */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-pink-500/5 dark:bg-pink-500/8 rounded-full blur-3xl pointer-events-none" />

                <div className="pt-24 pb-32 relative z-10">
                    <div className="max-w-[1200px] mx-auto px-6 lg:px-12">

                        {/* HEADER */}
                        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-12 pb-8 border-b border-slate-200/60 dark:border-slate-800/60 mt-8">
                            <div className="flex-1">
                                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-black dark:text-white tracking-tighter uppercase leading-tight">
                                    CLUB<br />BLOGS.
                                </h1>
                            </div>
                            <div className="flex flex-col gap-4 w-full md:w-auto">
                                <div className="w-full md:w-auto relative group shrink-0">
                                    <input
                                        type="text"
                                        placeholder="Search entries..."
                                        className="w-full md:w-80 bg-white dark:bg-[#1e1f22] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 pr-10 text-black dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40 focus:border-pink-500 transition-all font-semibold"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                </div>
                                <div className="flex gap-3">
                                    {localStorage.getItem("authUser") && (
                                        <button
                                            onClick={() => navigate('/my-blogs')}
                                            className="flex-1 md:flex-none btn-outline-modern py-2.5 px-5 text-sm flex items-center justify-center gap-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                                        >
                                            <User size={15} />
                                            <span>My Blogs</span>
                                        </button>
                                    )}
                                    <button
                                        onClick={() => {
                                            const authUser = localStorage.getItem("authUser");
                                            if (!authUser) {
                                                setShowAuthModal(true);
                                                return;
                                            }
                                            navigate('/write-blog');
                                        }}
                                        className="flex-1 md:flex-none btn-pink-modern py-2.5 px-5 text-sm flex items-center justify-center gap-2"
                                    >
                                        <PenTool size={15} />
                                        <span>Write Blog</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* NO-IMAGE POST LIST */}
                        <div className="flex flex-col gap-8">
                            {Array.isArray(filteredPosts) && filteredPosts.length === 0 ? (
                                <div className="text-center py-16 bg-white/40 dark:bg-[#1e1f22]/40 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl p-8">
                                    <p className="text-slate-500 dark:text-slate-400 font-medium">No blog entries found matching your query.</p>
                                </div>
                            ) : (
                                filteredPosts.map((post, index) => (
                                    <div
                                        key={post._id || post.id || index}
                                        className="group relative bg-white/95 dark:bg-[#1e1f22]/90 backdrop-blur-md rounded-2xl border border-slate-200/60 dark:border-slate-700/40 p-8 md:p-12 shadow-lg hover:shadow-xl hover:shadow-pink-500/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                                        onClick={() => navigate(`/blogs/${post._id}`)}
                                    >
                                        <div className="flex flex-col md:flex-row gap-8 md:gap-20 items-start">

                                            {/* Column 1: Index & Meta */}
                                            <div className="w-full md:w-32 flex flex-row md:flex-col justify-between md:justify-start gap-4 shrink-0">
                                                <span className="font-black text-4xl md:text-6xl text-pink-500 select-none opacity-80 group-hover:opacity-100 transition-opacity">
                                                    {(index + 1).toString().padStart(2, '0')}
                                                </span>
                                                <div className="flex flex-col text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                                    <span>{formatDate(post.createdAt)}</span>
                                                    <span className="mt-1 text-pink-500 font-bold">{post.readTime}</span>
                                                </div>
                                            </div>

                                            {/* Column 2: Main Content */}
                                            <div className="flex-1 min-w-0">
                                                {/* Tags */}
                                                <div className="flex flex-wrap gap-2 mb-6">
                                                    {post.tags.map(tag => (
                                                        <span key={tag} className="px-2.5 py-1 rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400 text-[10px] font-semibold border border-pink-500/20 uppercase tracking-wider">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>

                                                {/* Title */}
                                                <h2 className="text-2xl md:text-4xl font-black uppercase text-black dark:text-white mb-4 leading-tight group-hover:text-pink-500 transition-colors">
                                                    {post.title}
                                                </h2>

                                                {/* Excerpt */}
                                                <p className="text-slate-600 dark:text-slate-300 text-base font-medium leading-relaxed mb-6">
                                                    {post.excerpt}
                                                </p>

                                                {/* User Info */}
                                                {post.user && (
                                                    <div className="flex flex-col gap-0.5 text-xs font-bold uppercase text-pink-500">
                                                        <span>By {post.user.name}</span>
                                                    </div>
                                                )}

                                                {/* Action */}
                                                <div className="flex items-center gap-2 text-pink-500 dark:text-pink-400 font-bold uppercase tracking-widest text-xs mt-6 group-hover:text-pink-400 transition-colors">
                                                    Read Entry <ArrowUpRight size={14} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                    </div>
                </div>

                {/* Auth Modal */}
                {showAuthModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAuthModal(false)} />
                        <div className="relative bg-white dark:bg-[#1e1f22] rounded-2xl border border-slate-200/60 dark:border-slate-700/40 p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
                            <button
                                onClick={() => setShowAuthModal(false)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-pink-500 transition-colors cursor-pointer"
                            >
                                <X size={20} />
                            </button>

                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="w-12 h-12 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center mb-2">
                                    <PenTool size={22} />
                                </div>
                                <h3 className="text-xl font-black uppercase text-black dark:text-white">
                                    Login to Write
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
                                    Join the community to share your reviews and thoughts.
                                </p>

                                <div className="grid grid-cols-2 gap-4 w-full pt-4">
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="w-full btn-pink-modern py-2.5 text-xs font-bold uppercase tracking-wide shadow-none"
                                    >
                                        Log In
                                    </button>
                                    <button
                                        onClick={() => navigate('/signup')}
                                        className="w-full btn-outline-modern py-2.5 text-xs font-bold uppercase tracking-wide border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                                    >
                                        Sign Up
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
};

export default BlogPage;