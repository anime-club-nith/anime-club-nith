import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, Terminal as TerminalIcon, X } from 'lucide-react';
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
                <div className="min-h-screen bg-pink-100/35 text-black font-sans">
                    <Navbar />
                    <div className="pt-24 pb-32 flex items-center justify-center min-h-screen">
                        <div className="text-center">
                            <div className="w-16 h-16 border-8 border-black border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-black font-black uppercase text-xs tracking-wider">Loading entry...</p>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (error || !post) {
        return (
            <>
                <div className="min-h-screen bg-pink-100/35 text-black font-sans">
                    <Navbar />
                    <div className="pt-24 pb-32 flex items-center justify-center min-h-screen">
                        <div className="text-center max-w-md border-4 border-black bg-white p-8 shadow-[8px_8px_0px_#000]">
                            <X size={64} className="text-red-600 mx-auto mb-4" strokeWidth={2.5} />
                            <h2 className="text-3xl font-black uppercase text-black mb-4">Entry Not Found</h2>
                            <p className="text-gray-700 font-semibold mb-8">{error || 'The blog post you are looking for does not exist.'}</p>
                            <button
                                onClick={() => navigate('/blogs')}
                                className="px-6 py-3 border-4 border-black bg-pink-500 hover:bg-pink-400 text-black font-black uppercase shadow-[4px_4px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] transition cursor-pointer text-sm"
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
            <div className="min-h-screen bg-pink-100/35 text-black font-sans selection:bg-pink-500/30">
                <Navbar />

                <div className="pt-24 pb-32">
                    <div className="max-w-4xl mx-auto px-6 lg:px-12 mt-8 border-4 border-black bg-white p-8 md:p-12 shadow-[10px_10px_0px_#000]">
                        
                        {/* Reader Header */}
                        <div className="flex justify-between items-center mb-8 pb-4 border-b-4 border-black">
                            <div className="flex items-center gap-2 text-black font-black uppercase text-xs">
                                <TerminalIcon size={14} strokeWidth={2.5} />
                                <span>~/logs/{post._id}</span>
                            </div>
                            <button
                                onClick={() => navigate('/blogs')}
                                className="p-2 bg-white border-2 border-black hover:bg-pink-100 text-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer group"
                            >
                                <X size={20} strokeWidth={2.5} className="group-hover:rotate-90 transition-transform duration-300" />
                            </button>
                        </div>

                        {/* Title Block */}
                        <div className="mb-12 border-b-4 border-black pb-8">
                            {post.tags && post.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-8">
                                    {post.tags.map(tag => (
                                        <span
                                            key={tag}
                                            className="px-2 py-1 border-2 border-black bg-pink-100 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000]"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                            <h1 className="text-3xl md:text-5xl font-black uppercase text-black mb-6 leading-tight">
                                {post.title}
                            </h1>
                            <div className="flex flex-col md:flex-row md:items-center gap-4 text-gray-700 text-xs font-black uppercase border-l-4 border-black pl-4">
                                <span>{formatDate(post.createdAt)}</span>
                                <span className="hidden md:inline">/</span>
                                <span className="text-pink-600">{post.readTime}</span>
                            </div>
                            {post.user && (
                                <div className="flex flex-col gap-0.5 mt-8 text-xs font-black uppercase text-pink-600">
                                    <span>Author: {post.user.name}</span>
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="prose prose-lg mx-auto max-w-3xl text-black leading-relaxed selection:bg-pink-500/30">
                            <ReactMarkdown
                                rehypePlugins={[rehypeRaw, rehypeHighlight]}
                                remarkPlugins={[remarkBreaks]}
                                components={{
                                    img: ({ src, alt }) => (
                                        <img
                                            src={src}
                                            alt={alt}
                                            onClick={() => setExpandedImage(src || '')}
                                            className="cursor-pointer hover:opacity-75 transition-opacity border-4 border-black shadow-[4px_4px_0px_#000]"
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
                                    className="relative max-w-8xl max-h-[90vh] animate-in zoom-in-95 duration-200"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <img
                                        src={expandedImage}
                                        alt="Expanded view"
                                        className="w-full h-full object-contain border-4 border-black bg-white shadow-[10px_10px_0px_#000]"
                                    />
                                    <button
                                        onClick={() => setExpandedImage(null)}
                                        className="absolute -top-12 -right-12 p-2 bg-white border-2 border-black hover:bg-pink-100 text-black rounded-full transition-colors cursor-pointer"
                                        aria-label="Close expanded image"
                                    >
                                        <X size={24} strokeWidth={2.5} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Footer Navigation */}
                        <div className="mt-20 pt-8 border-t-4 border-black flex justify-between items-center">
                            <button
                                onClick={() => navigate('/blogs')}
                                className="flex items-center gap-2 border-4 border-black px-6 py-3 bg-white hover:bg-pink-100 text-black font-black uppercase text-xs tracking-wider shadow-[4px_4px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] transition cursor-pointer"
                            >
                                <ChevronRight className="rotate-180" size={16} strokeWidth={2.5} />
                                <span>Return to Index</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default ReadBlog;
