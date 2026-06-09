import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, Terminal as TerminalIcon, X, Trash2 } from 'lucide-react';
import Navbar from '../components/NavBar';
import Footer from '../components/Footer';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkBreaks from 'remark-breaks';
import rehypeHighlight from 'rehype-highlight';

interface BlogPost {
    _id: string;
    title: string;
    excerpt: string;
    content: string;
    imageURL?: string[];
    tags: string[];
    readTime: string;
    createdAt: string;
    user?: {
        _id?: string;
        name: string;
        email: string;
    };
}

const ReadBlog = () => {
    const { blogId } = useParams<{ blogId: string }>();
    const navigate = useNavigate();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedImage, setExpandedImage] = useState<string | null>(null);

    const authUser = localStorage.getItem("authUser");
    const loggedInUser = authUser ? JSON.parse(authUser) : null;
    const isAuthor = loggedInUser && post && post.user && (post.user.email === loggedInUser.email || post.user._id === loggedInUser._id);
    const isAdminOrMod = loggedInUser && (loggedInUser.role === 'admin' || loggedInUser.role === 'moderator');
    const canDelete = isAuthor || isAdminOrMod;

    const handleDeleteBlog = async () => {
        if (!window.confirm("Are you sure you want to delete this blog post? This action cannot be undone.")) {
            return;
        }

        try {
            const response = await fetch(`/api/blog/delete/${blogId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to delete blog post');
            }

            navigate('/blogs');
        } catch (err) {
            console.error('Error deleting blog:', err);
            alert(err instanceof Error ? err.message : 'Failed to delete blog post');
        }
    };

    const formatDate = (isoString: string) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const normalizeImagePlaceholders = (content: string, imageUrls: string[]) => {
        let index = 0;
        return content.replace(/uploaded_image-[A-Za-z0-9_-]+/g, () => imageUrls[index++] || '');
    };

    const renderedContent = post ? normalizeImagePlaceholders(post.content, post.imageURL || []) : '';

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/blog/${blogId}`);

                if (!response.ok) {
                    throw new Error('Blog post not found');
                }

                const data = await response.json();
                setPost({
                    ...data,
                    tags: data.tags || [],
                    readTime: data.readTime || '3 min read'
                });
                setError(null);
            } catch (err) {
                console.error('Failed to fetch blog:', err);
                setError(err instanceof Error ? err.message : 'Failed to load blog post');
            } finally {
                setLoading(false);
            }
        };

        if (blogId) {
            fetchBlog();
        }
    }, [blogId]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setExpandedImage(null);
            }
        };

        if (expandedImage) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [expandedImage]);

    if (loading) {
        return (
            <>
                <div className="min-h-screen bg-[#f2f3f5] dark:bg-[#0c0d12] text-black dark:text-white font-sans flex flex-col items-center justify-center transition-colors">
                    <Navbar />
                    <div className="flex flex-col items-center justify-center pt-24 pb-32">
                        <div className="w-12 h-12 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin mb-4"></div>
                        <p className="text-slate-500 dark:text-slate-400 font-semibold text-xs tracking-wider uppercase">Loading entry...</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (error || !post) {
        return (
            <>
                <div className="min-h-screen bg-[#f2f3f5] dark:bg-[#0c0d12] text-black dark:text-white font-sans flex flex-col items-center justify-center transition-colors relative overflow-hidden">
                    <Navbar />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/5 dark:bg-pink-500/8 rounded-full blur-3xl pointer-events-none" />
                    <div className="pt-24 pb-32 flex items-center justify-center relative z-10 w-full max-w-md p-6">
                        <div className="card-modern w-full p-8 text-center">
                            <X size={48} className="text-red-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-black uppercase mb-4">Entry Not Found</h2>
                            <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 text-sm">{error || 'The blog post you are looking for does not exist.'}</p>
                            <button
                                onClick={() => navigate('/blogs')}
                                className="w-full btn-pink-modern text-sm"
                            >
                                Return to Index
                            </button>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-[#f2f3f5] dark:bg-[#0c0d12] text-black dark:text-white font-sans selection:bg-pink-500/30 transition-colors relative overflow-hidden">
                <Navbar />

                {/* Background glow */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-pink-500/5 dark:bg-pink-500/8 rounded-full blur-3xl pointer-events-none" />

                <div className="pt-24 pb-32 relative z-10">
                    <div className="max-w-4xl mx-auto px-6 lg:px-12 mt-8 card-modern p-8 md:p-12">
                        
                        {/* Reader Header */}
                        <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-200/60 dark:border-slate-800/60">
                            <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 font-semibold uppercase text-xs">
                                <TerminalIcon size={14} />
                                <span>~/logs/{post._id}</span>
                            </div>
                            <button
                                onClick={() => navigate('/blogs')}
                                className="p-2 bg-white dark:bg-[#2b2d31] border border-slate-200 dark:border-slate-700/60 hover:bg-pink-500/10 text-slate-500 dark:text-slate-400 hover:text-pink-500 rounded-xl transition-all cursor-pointer group"
                            >
                                <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                            </button>
                        </div>

                        {/* Title Block */}
                        <div className="mb-12 border-b border-slate-200/60 dark:border-slate-800/60 pb-8">
                            {post.tags && post.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-8">
                                    {post.tags.map(tag => (
                                        <span
                                            key={tag}
                                            className="px-2.5 py-1 rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400 text-[10px] font-semibold border border-pink-500/20 uppercase tracking-wider"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                            <h1 className="text-3xl md:text-5xl font-black uppercase text-black dark:text-white mb-6 leading-tight">
                                {post.title}
                            </h1>
                            <div className="flex flex-col md:flex-row md:items-center gap-4 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase border-l-2 border-pink-500 pl-4">
                                <span>{formatDate(post.createdAt)}</span>
                                <span className="hidden md:inline">/</span>
                                <span className="text-pink-500 font-bold">{post.readTime}</span>
                            </div>
                            {post.user && (
                                <div className="flex flex-col gap-0.5 mt-8 text-xs font-bold uppercase text-pink-500">
                                    <span>Author: {post.user.name}</span>
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="prose prose-lg mx-auto max-w-3xl text-slate-800 dark:text-slate-200 leading-relaxed selection:bg-pink-500/30 dark:prose-invert">
                            <ReactMarkdown
                                rehypePlugins={[rehypeRaw, rehypeHighlight]}
                                remarkPlugins={[remarkBreaks]}
                                components={{
                                    img: ({ src, alt }) => (
                                        <img
                                            src={src}
                                            alt={alt}
                                            onClick={() => setExpandedImage(src || '')}
                                            className="cursor-pointer hover:opacity-75 transition-opacity border border-slate-200 dark:border-slate-850 rounded-xl shadow-md"
                                            title="Click to expand"
                                        />
                                    )
                                }}
                            >
                                {renderedContent}
                            </ReactMarkdown>
                        </div>

                        {/* Image Expansion Modal */}
                        {expandedImage && (
                            <div
                                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
                                onClick={() => setExpandedImage(null)}
                            >
                                <div
                                    className="relative max-w-5xl max-h-[90vh] animate-in zoom-in-95 duration-200"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <img
                                        src={expandedImage}
                                        alt="Expanded view"
                                        className="w-full h-full object-contain border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e1f22] p-2 rounded-2xl shadow-2xl"
                                    />
                                    <button
                                        onClick={() => setExpandedImage(null)}
                                        className="absolute -top-12 -right-12 p-2 bg-white dark:bg-[#1e1f22] border border-slate-200 dark:border-slate-750 text-slate-600 dark:text-slate-400 hover:text-pink-500 rounded-full transition-colors cursor-pointer"
                                        aria-label="Close expanded image"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Footer Navigation */}
                        <div className="mt-20 pt-8 border-t border-slate-200/60 dark:border-slate-800/60 flex justify-between items-center">
                            <button
                                onClick={() => navigate('/blogs')}
                                className="flex items-center gap-2 btn-outline-modern py-2.5 px-5 text-xs uppercase border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                            >
                                <ChevronRight className="rotate-180" size={16} />
                                <span>Return to Index</span>
                            </button>

                            {canDelete && (
                                <button
                                    onClick={handleDeleteBlog}
                                    className="flex items-center gap-2 bg-red-500 hover:bg-red-400 text-white font-bold rounded-xl px-5 py-2.5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-md hover:shadow-red-500/30 text-xs uppercase"
                                >
                                    <Trash2 size={16} />
                                    <span>Delete Entry</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default ReadBlog;
