import { useState, useEffect } from 'react';
import { ArrowUpRight, Search, ArrowLeft, PenTool, Edit, Trash2 } from 'lucide-react';
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
    isDraft?: boolean;
    user?: {
        name: string;
        email: string;
    };
}

const MyBlogsPage = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

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
        const fetchMyBlogs = async () => {
            try {
                setLoading(true);
                const authUser = localStorage.getItem("authUser");

                if (!authUser) {
                    navigate('/login');
                    return;
                }

                const user = JSON.parse(authUser);
                const userId = user._id;

                const response = await fetch(`/api/blog/my-blogs/${userId}`);
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
                console.error("Failed to fetch my blogs:", error);
                setError("Failed to load your blogs");
                setPosts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchMyBlogs();
    }, [navigate]);

    const filteredPosts = posts.filter(post => {
        const query = searchQuery.toLowerCase();
        return (
            post.title.toLowerCase().includes(query) ||
            post.tags.some(tag => tag.toLowerCase().includes(query))
        );
    });

    const handleDeleteClick = (e: React.MouseEvent, blogId: string) => {
        e.stopPropagation();
        setDeleteConfirmId(blogId);
    };

    const handleDeleteConfirm = async (blogId: string) => {
        try {
            const response = await fetch(`/api/blog/delete/${blogId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setPosts(posts.filter(post => post._id !== blogId));
                setDeleteConfirmId(null);
            } else {
                const error = await response.json();
                alert(`Failed to delete blog: ${error.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error deleting blog:', error);
            alert('Failed to delete blog');
        }
    };

    const handleDeleteCancel = () => {
        setDeleteConfirmId(null);
    };

    const handleEdit = (e: React.MouseEvent, blogId: string) => {
        e.stopPropagation();
        navigate(`/edit-blog/${blogId}`);
    };

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
                                    MY<br />BLOGS.
                                </h1>
                            </div>
                            <div className="flex flex-col gap-4 w-full md:w-auto">
                                <div className="w-full md:w-auto relative group shrink-0">
                                    <input
                                        type="text"
                                        placeholder="Search my entries..."
                                        className="w-full md:w-80 bg-white dark:bg-[#1e1f22] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 pr-10 text-black dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40 focus:border-pink-500 transition-all font-semibold"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => navigate('/blogs')}
                                        className="flex-1 md:flex-none btn-outline-modern py-2.5 px-5 text-sm flex items-center justify-center gap-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                                    >
                                        <ArrowLeft size={16} />
                                        <span>All Blogs</span>
                                    </button>
                                    <button
                                        onClick={() => navigate('/write-blog')}
                                        className="flex-1 md:flex-none btn-pink-modern py-2.5 px-5 text-sm flex items-center justify-center gap-2"
                                    >
                                        <PenTool size={16} />
                                        <span>Write Blog</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="flex items-center justify-center py-32">
                                <div className="text-center">
                                    <div className="w-12 h-12 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-slate-500 dark:text-slate-400 font-semibold text-xs tracking-wider uppercase">Loading your blogs...</p>
                                </div>
                            </div>
                        )}

                        {/* Error State */}
                        {error && !loading && (
                            <div className="flex items-center justify-center py-32">
                                <div className="text-center">
                                    <p className="text-red-600 border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-4 rounded-xl font-semibold text-xs tracking-wider uppercase">{error}</p>
                                </div>
                            </div>
                        )}

                        {/* Empty State */}
                        {!loading && !error && filteredPosts.length === 0 && (
                            <div className="flex items-center justify-center py-32">
                                <div className="text-center max-w-md card-modern p-8 shadow-xl">
                                    <h2 className="text-2xl font-black uppercase text-black dark:text-white mb-4">No Blogs Yet</h2>
                                    <p className="text-slate-500 dark:text-slate-400 font-semibold mb-8 text-sm">Start sharing your reviews and thoughts with the community.</p>
                                    <button
                                        onClick={() => navigate('/write-blog')}
                                        className="w-full btn-pink-modern text-sm"
                                    >
                                        Write Your First Blog
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Blog List */}
                        {!loading && !error && filteredPosts.length > 0 && (
                            <div className="flex flex-col gap-8">
                                {filteredPosts.map((post, index) => (
                                    <div
                                        key={post._id || post.id || index}
                                        className="group relative bg-white/95 dark:bg-[#1e1f22]/90 backdrop-blur-md rounded-2xl border border-slate-200/60 dark:border-slate-700/40 p-8 md:p-12 shadow-lg hover:shadow-xl hover:shadow-pink-500/5 hover:-translate-y-1 transition-all duration-300"
                                    >
                                        {/* Draft Label */}
                                        {post.isDraft && (
                                            <div className="absolute top-4 left-4 z-10">
                                                <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-semibold border border-amber-500/20 uppercase tracking-wider">
                                                    Draft
                                                </span>
                                            </div>
                                        )}

                                        {/* Edit and Delete Buttons */}
                                        <div className="absolute top-4 right-4 flex gap-2 z-10">
                                            <button
                                                onClick={(e) => handleEdit(e, post._id)}
                                                className="p-2 bg-white dark:bg-[#2b2d31] border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-pink-500/10 hover:text-pink-500 rounded-xl transition-all shadow-sm cursor-pointer"
                                                title="Edit blog"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <div className="relative">
                                                <button
                                                    onClick={(e) => handleDeleteClick(e, post._id)}
                                                    className="p-2 bg-white dark:bg-[#2b2d31] border border-slate-200 dark:border-slate-700/60 text-red-500 hover:bg-red-500/10 rounded-xl transition-all shadow-sm cursor-pointer"
                                                    title="Delete blog"
                                                >
                                                    <Trash2 size={18} />
                                                </button>

                                                {/* Delete Confirmation Modal */}
                                                {deleteConfirmId === post._id && (
                                                    <div
                                                        className="absolute top-12 right-0 bg-white dark:bg-[#1e1f22] border border-slate-200 dark:border-slate-700 shadow-2xl rounded-2xl p-4 w-64 z-50"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <p className="text-black dark:text-white font-bold text-xs uppercase tracking-wider mb-4">Delete this blog?</p>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleDeleteConfirm(post._id)}
                                                                className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-lg px-3 py-2 text-xs font-semibold cursor-pointer"
                                                            >
                                                                Yes
                                                            </button>
                                                            <button
                                                                onClick={handleDeleteCancel}
                                                                className="flex-1 bg-transparent border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg px-3 py-2 text-xs font-semibold cursor-pointer"
                                                            >
                                                                No
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div
                                            className="flex flex-col md:flex-row gap-8 md:gap-20 items-start cursor-pointer"
                                            onClick={() => navigate(post.isDraft ? `/edit-blog/${post._id}` : `/blogs/${post._id}`)}
                                        >
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

                                                {/* Action */}
                                                <div className="flex items-center gap-2 text-pink-500 dark:text-pink-400 font-bold uppercase tracking-widest text-xs mt-6 group-hover:text-pink-400 transition-colors">
                                                    Read Entry <ArrowUpRight size={14} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <Footer />
            </div>
        </>
    );
};

export default MyBlogsPage;
