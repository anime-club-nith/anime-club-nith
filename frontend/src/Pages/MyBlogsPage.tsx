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
            <div className="min-h-screen bg-pink-100/35 text-black font-sans selection:bg-pink-500/30 relative">
                <Navbar />
                <div className="pt-24 pb-32">
                    <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
                        {/* HEADER */}
                        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-12 pb-8 border-b-4 border-black mt-8">
                            <div className="flex-1">
                                <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-black tracking-tighter uppercase leading-tight">
                                    MY<br />BLOGS.
                                </h1>
                            </div>
                            <div className="flex flex-col gap-4 w-full md:w-auto">
                                <div className="w-full md:w-auto relative group shrink-0">
                                    <input
                                        type="text"
                                        placeholder="Search my entries..."
                                        className="w-full md:w-80 bg-white border-4 border-black text-black px-4 py-3 pr-10 focus:outline-none focus:bg-pink-100 shadow-[4px_4px_0px_#000] focus:shadow-[2px_2px_0px_#000] transition placeholder:text-gray-500 font-semibold"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <Search size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-black" strokeWidth={2.5} />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => navigate('/blogs')}
                                        className="flex items-center justify-center cursor-pointer gap-2 px-6 py-3 border-4 border-black bg-white hover:bg-pink-100 text-black shadow-[4px_4px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] transition font-black uppercase text-xs tracking-wider"
                                    >
                                        <ArrowLeft size={16} strokeWidth={2.5} />
                                        <span>All Blogs</span>
                                    </button>
                                    <button
                                        onClick={() => navigate('/write-blog')}
                                        className="flex items-center justify-center cursor-pointer gap-2 px-6 py-3 border-4 border-black bg-pink-500 hover:bg-pink-400 text-black shadow-[4px_4px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] transition font-black uppercase text-xs tracking-wider"
                                    >
                                        <PenTool size={16} strokeWidth={2.5} />
                                        <span>Write Blog</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="flex items-center justify-center py-32">
                                <div className="text-center">
                                    <div className="w-16 h-16 border-8 border-black border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-black font-black uppercase text-xs tracking-wider">Loading your blogs...</p>
                                </div>
                            </div>
                        )}

                        {/* Error State */}
                        {error && !loading && (
                            <div className="flex items-center justify-center py-32">
                                <div className="text-center">
                                    <p className="text-red-600 border-4 border-black bg-red-100 p-4 font-black uppercase text-xs tracking-wider shadow-[4px_4px_0px_#000]">{error}</p>
                                </div>
                            </div>
                        )}

                        {/* Empty State */}
                        {!loading && !error && filteredPosts.length === 0 && (
                            <div className="flex items-center justify-center py-32">
                                <div className="text-center max-w-md border-4 border-black bg-white p-8 shadow-[8px_8px_0px_#000]">
                                    <h2 className="text-3xl font-black uppercase text-black mb-4">No Blogs Yet</h2>
                                    <p className="text-gray-700 font-semibold mb-8">Start sharing your reviews and thoughts with the community.</p>
                                    <button
                                        onClick={() => navigate('/write-blog')}
                                        className="px-6 py-3 border-4 border-black bg-pink-500 hover:bg-pink-400 text-black font-black uppercase shadow-[4px_4px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] transition cursor-pointer text-sm"
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
                                        className="group relative border-4 border-black bg-white p-8 md:p-12 shadow-[8px_8px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[6px_6px_0px_#000] transition-all duration-200"
                                    >
                                        {/* Draft Label */}
                                        {post.isDraft && (
                                            <div className="absolute top-4 left-4 z-10">
                                                <span className="px-3 py-1 bg-yellow-100 border-2 border-black text-black font-black text-xs uppercase tracking-widest shadow-[2px_2px_0px_#000]">
                                                    Draft
                                                </span>
                                            </div>
                                        )}

                                        {/* Edit and Delete Buttons */}
                                        <div className="absolute top-4 right-4 flex gap-2 z-10">
                                            <button
                                                onClick={(e) => handleEdit(e, post._id)}
                                                className="p-2 bg-white border-2 border-black text-black hover:bg-pink-100 shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] transition rounded cursor-pointer"
                                                title="Edit blog"
                                            >
                                                <Edit size={18} strokeWidth={2.5} />
                                            </button>
                                            <div className="relative">
                                                <button
                                                    onClick={(e) => handleDeleteClick(e, post._id)}
                                                    className="p-2 bg-white border-2 border-black text-red-600 hover:bg-red-50 hover:border-red-600 shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] transition rounded cursor-pointer"
                                                    title="Delete blog"
                                                >
                                                    <Trash2 size={18} strokeWidth={2.5} />
                                                </button>

                                                {/* Delete Confirmation Modal */}
                                                {deleteConfirmId === post._id && (
                                                    <div
                                                        className="absolute top-12 right-0 bg-white border-4 border-black shadow-[4px_4px_0px_#000] p-4 w-64 z-50"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <p className="text-black font-black uppercase text-xs tracking-wider mb-4">Delete this blog?</p>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleDeleteConfirm(post._id)}
                                                                className="flex-1 px-3 py-2 border-2 border-black bg-red-500 hover:bg-red-600 text-black font-black uppercase text-[10px] tracking-wider transition-colors cursor-pointer"
                                                            >
                                                                Yes
                                                            </button>
                                                            <button
                                                                onClick={handleDeleteCancel}
                                                                className="flex-1 px-3 py-2 border-2 border-black bg-white hover:bg-gray-100 text-black font-black uppercase text-[10px] tracking-wider transition-colors cursor-pointer"
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

                                                {/* Action */}
                                                <div className="flex items-center gap-2 text-black font-black uppercase tracking-widest text-xs mt-6">
                                                    Read Entry <ArrowUpRight size={16} strokeWidth={2.5} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default MyBlogsPage;
