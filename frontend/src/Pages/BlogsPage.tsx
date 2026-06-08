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
            <div className="min-h-screen bg-pink-100/35 text-black font-sans selection:bg-pink-500/30 relative">

                {/* MAIN LIST */}
                <Navbar />
                <div className="pt-24 pb-32">

                    <div className="max-w-[1200px] mx-auto px-6 lg:px-12">

                        {/* HEADER */}
                        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-12 pb-8 border-b-4 border-black mt-8">
                            <div className="flex-1">
                                <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-black tracking-tighter uppercase leading-tight">
                                    CLUB<br />BLOGS.
                                </h1>
                            </div>
                            <div className="flex flex-col gap-4 w-full md:w-auto">
                                <div className="w-full md:w-auto relative group shrink-0">
                                    <input
                                        type="text"
                                        placeholder="Search entries..."
                                        className="w-full md:w-80 bg-white border-4 border-black text-black px-4 py-3 pr-10 focus:outline-none focus:bg-pink-100 shadow-[4px_4px_0px_#000] focus:shadow-[2px_2px_0px_#000] transition placeholder:text-gray-500 font-semibold"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <Search size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-black" strokeWidth={2.5} />
                                </div>
                                <div className="flex gap-3">
                                    {localStorage.getItem("authUser") && (
                                        <button
                                            onClick={() => navigate('/my-blogs')}
                                            className="flex items-center justify-center cursor-pointer gap-2 px-6 py-3 border-4 border-black bg-white hover:bg-pink-100 text-black shadow-[4px_4px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] transition font-black uppercase text-xs tracking-wider"
                                        >
                                            <User size={16} strokeWidth={2.5} />
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
                                        className="flex items-center justify-center cursor-pointer gap-2 px-6 py-3 border-4 border-black bg-pink-500 hover:bg-pink-400 text-black shadow-[4px_4px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] transition font-black uppercase text-xs tracking-wider"
                                    >
                                        <PenTool size={16} strokeWidth={2.5} />
                                        <span>Write Blog</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* NO-IMAGE POST LIST */}
                        <div className="flex flex-col gap-8">
                            {Array.isArray(filteredPosts) && filteredPosts.map((post, index) => (
                                <div
                                    key={post._id || post.id || index}
                                    className="group relative border-4 border-black bg-white p-8 md:p-12 shadow-[8px_8px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[6px_6px_0px_#000] transition-all duration-200 cursor-pointer"
                                    onClick={() => navigate(`/blogs/${post._id}`)}
                                >
                                    <div className="flex flex-col md:flex-row gap-8 md:gap-20 items-start">

                                        {/* Column 1: Index & Meta */}
                                        <div className="w-full md:w-32 flex flex-row md:flex-col justify-between md:justify-start gap-4 shrink-0">
                                            <span className="font-black text-4xl md:text-6xl text-pink-500 select-none">
                                                {(index + 1).toString().padStart(2, '0')}
                                            </span>
                                            <div className="flex flex-col text-xs font-black uppercase tracking-widest text-gray-500">
                                                <span>{formatDate(post.createdAt)}</span>
                                                <span className="mt-1 text-pink-600">{post.readTime}</span>
                                            </div>
                                        </div>

                                        {/* Column 2: Main Content */}
                                        <div className="flex-1 min-w-0">
                                            {/* Tags */}
                                            <div className="flex flex-wrap gap-2 mb-6">
                                                {post.tags.map(tag => (
                                                    <span key={tag} className="px-2 py-1 border-2 border-black bg-pink-100 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000]">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>

                                            {/* Title */}
                                            <h2 className="text-3xl md:text-5xl font-black uppercase text-black mb-4 leading-tight">
                                                {post.title}
                                            </h2>

                                            {/* Excerpt */}
                                            <p className="text-gray-700 text-base md:text-lg font-semibold leading-relaxed mb-6">
                                                {post.excerpt}
                                            </p>

                                            {/* User Info */}
                                            {post.user && (
                                                <div className="flex flex-col gap-0.5 text-xs font-black uppercase text-pink-600">
                                                    <span>By {post.user.name}</span>
                                                </div>
                                            )}

                                            {/* Action */}
                                            <div className="flex items-center gap-2 text-black font-black uppercase tracking-widest text-xs mt-6">
                                                Read Entry <ArrowUpRight size={16} strokeWidth={2.5} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>

                {/* Auth Modal */}
                {showAuthModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAuthModal(false)} />
                        <div className="relative bg-white border-4 border-black p-8 max-w-md w-full shadow-[10px_10px_0px_#000] animate-in fade-in zoom-in duration-200">
                            <button
                                onClick={() => setShowAuthModal(false)}
                                className="absolute top-4 right-4 text-black hover:text-pink-500 transition-colors cursor-pointer"
                            >
                                <X size={20} strokeWidth={2.5} />
                            </button>

                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="w-12 h-12 border-4 border-black bg-pink-500 text-black flex items-center justify-center mb-2">
                                    <PenTool size={24} strokeWidth={2.5} />
                                </div>
                                <h3 className="text-xl font-black uppercase text-black">
                                    Login to Write
                                </h3>
                                <p className="text-gray-600 font-semibold text-sm">
                                    Join the community to share your reviews and thoughts.
                                </p>

                                <div className="grid grid-cols-2 gap-4 w-full pt-4">
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="w-full py-2.5 px-4 border-4 border-black bg-pink-500 hover:bg-pink-400 text-black font-black uppercase text-sm shadow-[4px_4px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] transition cursor-pointer"
                                    >
                                        Log In
                                    </button>
                                    <button
                                        onClick={() => navigate('/signup')}
                                        className="w-full py-2.5 px-4 border-4 border-black bg-white hover:bg-pink-100 text-black font-black uppercase text-sm shadow-[4px_4px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] transition cursor-pointer"
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