import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, X, Save, AlertCircle, Maximize2, Minimize2, Terminal as TerminalIcon } from 'lucide-react';
import Navbar from '../components/NavBar';
import Footer from '../components/Footer';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkBreaks from 'remark-breaks';
import rehypeHighlight from 'rehype-highlight';

const EditBlog = () => {
    const navigate = useNavigate();
    const { blogId } = useParams<{ blogId: string }>();
    const [title, setTitle] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [currentTag, setCurrentTag] = useState('');
    const [viewMode, setViewMode] = useState<'write' | 'preview'>('write');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isImageUploading, setIsImageUploading] = useState(false);
    const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
    const [selection, setSelection] = useState<{ start: number; end: number } | null>(null);
    const editorRef = useRef<HTMLTextAreaElement>(null);

    const captureSelection = () => {
        if (editorRef.current) {
            setSelection({
                start: editorRef.current.selectionStart,
                end: editorRef.current.selectionEnd
            });
        }
    };

    const toggleViewMode = () => {
        if (viewMode === 'write') {
            captureSelection();
        }
        setViewMode(prev => prev === 'write' ? 'preview' : 'write');
    };

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`/api/blog/${blogId}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch blog');
                }

                const data = await response.json();
                const existingImageURLs: string[] = Array.isArray(data.imageURL) ? data.imageURL : [];

                setTitle(data.title || '');
                setExcerpt(data.excerpt || '');
                setContent(data.content || '');
                setTags(data.tags || []);
                setUploadedImageUrls(existingImageURLs);
            } catch (err: any) {
                setError(err.message || 'Failed to load blog');
                console.error('Error fetching blog:', err);
            } finally {
                setIsLoading(false);
            }
        };

        if (blogId) {
            fetchBlog();
        }
    }, [blogId]);

    useEffect(() => {
        document.body.style.overflow = isFullscreen ? 'hidden' : 'unset';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isFullscreen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === 'Escape') {
                e.preventDefault();
                toggleViewMode();
            } else if (e.key === 'Escape' && !e.ctrlKey) {
                e.preventDefault();
                setIsFullscreen(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [viewMode]);

    useEffect(() => {
        if (viewMode === 'write' && selection && editorRef.current) {
            const editor = editorRef.current;
            editor.focus();
            requestAnimationFrame(() => {
                editor.setSelectionRange(selection.start, selection.end);
            });
        }
    }, [viewMode, selection]);

    const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (currentTag.trim() && tags.length < 4 && !tags.includes(currentTag.trim())) {
                setTags([...tags, currentTag.trim()]);
                setCurrentTag('');
            }
        } else if (e.key === 'Backspace' && !currentTag && tags.length > 0) {
            setTags(tags.slice(0, -1));
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const insertTextAtCursor = (textArea: HTMLTextAreaElement, insertion: string) => {
        if (!textArea) {
            setContent((prev) => `${prev}${insertion}`);
            return;
        }

        const start = textArea.selectionStart ?? textArea.value.length;
        const end = textArea.selectionEnd ?? textArea.value.length;
        const currentValue = textArea.value;
        const nextValue = `${currentValue.slice(0, start)}${insertion}${currentValue.slice(end)}`;
        setContent(nextValue);

        requestAnimationFrame(() => {
            if (typeof textArea.setSelectionRange === 'function') {
                const caret = start + insertion.length;
                textArea.setSelectionRange(caret, caret);
            }
        });
    };

    const uploadPastedImage = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch('/api/blog/upload-image', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.message || 'Unable to upload pasted image');
        }

        const data = await response.json();
        return data.imageURL || data.url;
    };

    const handlePaste = async (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const clipboardItems = Array.from(event.clipboardData.items || []);
        const imageItem = clipboardItems.find(item => item.type.startsWith('image/'));
        if (!imageItem) return;

        event.preventDefault();
        const file = imageItem.getAsFile();
        if (!file) return;

        try {
            setError('');
            setIsImageUploading(true);
            const imageUrl = await uploadPastedImage(file);
            setUploadedImageUrls((prev) => [...prev, imageUrl]);
            insertTextAtCursor(event.currentTarget, `![pasted image](${imageUrl})\n`);
        } catch (err: any) {
            setError(err?.message || 'Image upload failed');
        } finally {
            setIsImageUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!title || !excerpt || !content) {
            setError('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(`/api/blog/edit/${blogId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    excerpt,
                    tags,
                    content,
                    imageURL: uploadedImageUrls,
                    isDraft: false,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to update blog');
            }

            navigate(`/blogs/${blogId}`);
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSaveDraft = async () => {
        setError('');

        if (!title || !excerpt || !content) {
            setError('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(`/api/blog/edit/${blogId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    excerpt,
                    tags,
                    content,
                    imageURL: uploadedImageUrls,
                    isDraft: true,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to save draft');
            }

            navigate('/my-blogs');
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-pink-100/35 text-black font-sans">
                <Navbar />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="w-16 h-16 border-8 border-pink-500/20 border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-black font-black uppercase text-xs tracking-wider">Loading blog...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f2f3f5] dark:bg-[#0c0d12] text-black dark:text-white font-sans selection:bg-pink-500/30 transition-colors relative overflow-hidden">
            <Navbar />

            {/* Background glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-pink-500/5 dark:bg-pink-500/8 rounded-full blur-3xl pointer-events-none" />
            
            <div className="pt-24 pb-32 relative z-10">
                <div className="max-w-4xl mx-auto px-6 lg:px-12 mt-8 card-modern p-8 md:p-12">
                    {/* Mode Toggle & Status */}
                    <div className="flex justify-between items-center mb-12 border-b border-slate-200/60 dark:border-slate-800/60 pb-6">
                        <button
                            type="button"
                            onClick={() => navigate('/my-blogs')}
                            className="btn-outline-modern py-2 px-4 text-xs flex items-center justify-center gap-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                        >
                            <ArrowLeft size={16} />
                            <span>Abort & Return</span>
                        </button>
                        
                        <div className="flex items-center gap-6">
                            <div className="flex flex-col items-end gap-1 border-r border-slate-200 dark:border-slate-700 pr-6">
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (viewMode === 'preview') setViewMode('write');
                                        }}
                                        className={`text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${viewMode === 'write' ? 'text-pink-500 border-b-2 border-pink-500' : 'text-slate-400 hover:text-pink-500'}`}
                                    >
                                        Write
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (viewMode === 'write') {
                                                captureSelection();
                                                setViewMode('preview');
                                            }
                                        }}
                                        className={`text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${viewMode === 'preview' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-slate-400 hover:text-pink-500'}`}
                                    >
                                        Preview
                                    </button>
                                </div>
                                <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Ctrl + Esc to toggle</span>
                            </div>
                            <div className="flex items-center gap-2 bg-pink-500/10 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400 px-3 py-1.5 rounded-full text-xs font-semibold">
                                <div className={`w-1.5 h-1.5 rounded-full ${viewMode === 'write' ? 'bg-pink-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                                <span>
                                    {viewMode === 'write' ? 'Write Mode' : 'Preview Mode'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div className="mb-12 border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 p-4 rounded-xl font-semibold text-xs flex items-center gap-3">
                                <AlertCircle size={14} />
                                <span>ERROR: {error}</span>
                            </div>
                        )}

                        {viewMode === 'write' ? (
                            <div className="space-y-12">
                                {/* Title Input */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Entry Title</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Enter title..."
                                        className="w-full input-modern text-xl md:text-2xl font-bold uppercase"
                                    />
                                </div>

                                {/* Abstract Input */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Abstract / Description</label>
                                    <textarea
                                        value={excerpt}
                                        onChange={(e) => setExcerpt(e.target.value)}
                                        placeholder="Briefly describe this entry..."
                                        className="w-full input-modern h-24 resize-none leading-relaxed text-sm font-medium"
                                    />
                                </div>

                                {/* Metadata & Tags */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Metadata Tags [{tags.length}/4]</label>
                                        <div className="flex flex-wrap gap-2 p-2 bg-[#f2f3f5] dark:bg-[#2b2d31] border border-slate-200 dark:border-slate-700 rounded-xl min-h-12 items-center">
                                            {tags.map(tag => (
                                                <span key={tag} className="flex items-center gap-1.5 rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400 text-xs font-semibold border border-pink-500/20 px-2 py-1">
                                                    {tag}
                                                    <button type="button" onClick={() => removeTag(tag)} className="text-pink-500 hover:text-red-500 cursor-pointer transition-colors ml-1">
                                                        <X size={10} />
                                                    </button>
                                                </span>
                                            ))}
                                            {tags.length < 4 && (
                                                <input
                                                    type="text"
                                                    value={currentTag}
                                                    onChange={(e) => setCurrentTag(e.target.value)}
                                                    onKeyDown={handleTagKeyDown}
                                                    placeholder="Add tag..."
                                                    className="bg-transparent border-none text-xs font-semibold focus:outline-none w-20 py-1 text-black dark:text-white placeholder:text-slate-400"
                                                />
                                            )}
                                        </div>
                                    </div>
                                    <div className="pt-6 flex justify-end gap-4">
                                        <button
                                            type="button"
                                            onClick={handleSaveDraft}
                                            disabled={isSubmitting}
                                            className="btn-outline-modern py-2.5 px-5 text-xs uppercase flex items-center gap-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                                        >
                                            Save Draft
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="btn-pink-modern py-2.5 px-5 text-xs uppercase flex items-center gap-2"
                                        >
                                            Commit Entry
                                        </button>
                                    </div>
                                </div>

                                {/* Content Input */}
                                <div className="space-y-2 relative group">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Main Content (Markdown)</label>
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 ml-1">Paste images directly into the editor to upload and embed them.</p>
                                    {isImageUploading && (
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-pink-500 ml-1 animate-pulse">Uploading image...</p>
                                    )}
                                    <textarea
                                        ref={editorRef}
                                        value={content}
                                        onPaste={handlePaste}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="Begin entry... Markdown and HTML supported."
                                        className="w-full bg-white dark:bg-[#1e1f22] text-black dark:text-white text-base font-medium p-6 h-[500px] border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 transition-all placeholder:text-slate-400 scrollbar-hide"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setIsFullscreen(true)}
                                        className="absolute bottom-4 right-4 p-2 bg-white dark:bg-[#2b2d31] border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-pink-500/10 hover:text-pink-500 rounded-xl transition-all shadow-md cursor-pointer"
                                    >
                                        <Maximize2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white/95 dark:bg-[#1e1f22]/90 backdrop-blur-md rounded-2xl border border-slate-200/60 dark:border-slate-700/40 p-8 md:p-12 shadow-lg">
                                <div className="max-w-6xl mx-auto">
                                    {/* Title Block Mock */}
                                    <div className="mb-12 border-b border-slate-200/60 dark:border-slate-800/60 pb-8">
                                        {tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-8">
                                                {tags.map(tag => (
                                                    <span key={tag} className="px-2.5 py-1 rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400 text-[10px] font-semibold border border-pink-500/20 uppercase tracking-wider">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        <h1 className="text-3xl md:text-5xl font-black uppercase text-black dark:text-white mb-6 leading-tight">
                                            {title || 'Untitled Entry'}
                                        </h1>
                                        <div className="flex flex-col md:flex-row md:items-center gap-4 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase border-l-2 border-pink-500 pl-4">
                                            <span>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                            <span className="hidden md:inline">/</span>
                                            <span className="text-pink-500 font-bold font-semibold">Reading Time: Est. ~{Math.ceil(content.split(' ').length / 200)} min</span>
                                        </div>
                                    </div>

                                    {/* Content Mock */}
                                    <div className="prose prose-lg mx-auto max-w-3xl text-slate-800 dark:text-slate-200 leading-relaxed selection:bg-pink-500/30 dark:prose-invert">
                                        {content ? (
                                            <ReactMarkdown
                                                rehypePlugins={[rehypeRaw, rehypeHighlight]}
                                                remarkPlugins={[remarkBreaks]}
                                            >
                                                {content}
                                            </ReactMarkdown>
                                        ) : (
                                            <div className="h-48 flex items-center justify-center text-slate-400 dark:text-slate-500 font-semibold uppercase text-xs tracking-wider border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                                                Empty Content State
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Submit */}
                        <div className="flex justify-between pt-12 border-t border-slate-200/60 dark:border-slate-800/60 mt-12">
                            <button
                                type="button"
                                onClick={handleSaveDraft}
                                disabled={isSubmitting}
                                className="btn-outline-modern py-2.5 px-5 text-sm flex items-center justify-center gap-2 border border-slate-350 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold"
                            >
                                <Save size={16} />
                                {isSubmitting ? 'Saving...' : 'Save Draft'}
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="btn-pink-modern py-2.5 px-5 text-sm flex items-center justify-center gap-2"
                            >
                                <Save size={16} />
                                {isSubmitting ? 'Publishing...' : 'Publish Entry'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Fullscreen Content Editor */}
            {isFullscreen && (
                <div className="fixed inset-0 z-50 bg-[#f2f3f5]/95 dark:bg-[#0c0d12]/95 backdrop-blur-md flex flex-col p-8 animate-in fade-in duration-300">
                    <div className="flex-1 flex flex-col p-8 card-modern min-h-0">
                        {/* Header with Toggles */}
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200 dark:border-slate-700">
                            <div className="flex gap-8">
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (viewMode === 'preview') setViewMode('write');
                                    }}
                                    className={`text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer ${viewMode === 'write' ? 'text-pink-500 border-b-2 border-pink-500' : 'text-slate-400 hover:text-pink-500'}`}
                                >
                                    Write
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (viewMode === 'write') {
                                            captureSelection();
                                            setViewMode('preview');
                                        }
                                    }}
                                    className={`text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer ${viewMode === 'preview' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-slate-400 hover:text-pink-500'}`}
                                >
                                    Preview
                                </button>
                            </div>
                            <div className="flex items-center gap-6">
                                <span className={`text-xs font-semibold uppercase tracking-wider ${viewMode === 'write' ? 'text-pink-500' : 'text-emerald-500'}`}>
                                    {viewMode === 'write' ? 'Active Workflow: Editing' : 'Active Workflow: Reviewing'}
                                </span>
                                <button
                                    onClick={() => setIsFullscreen(false)}
                                    className="p-2 bg-white dark:bg-[#2b2d31] border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-pink-500/10 hover:text-pink-500 rounded-xl transition-all shadow-md cursor-pointer"
                                >
                                    <Minimize2 size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-hidden min-h-0">
                            {viewMode === 'write' ? (
                                <textarea
                                    ref={editorRef}
                                    value={content}
                                    onPaste={handlePaste}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="w-full h-full bg-white dark:bg-[#1e1f22] text-black dark:text-white text-lg font-medium p-8 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 transition-all max-w-5xl mx-auto block resize-none"
                                    autoFocus
                                    placeholder="Begin log entry..."
                                />
                            ) : (
                                <div className="w-full h-full overflow-y-auto px-12 py-8 scrollbar-hide">
                                    <div className="max-w-4xl mx-auto">
                                        <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-200 dark:border-slate-700">
                                            <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 font-semibold uppercase text-xs">
                                                <TerminalIcon size={14} />
                                                <span>~/fullscreen/preview</span>
                                            </div>
                                        </div>
                                        <h1 className="text-4xl font-black uppercase mb-12">{title || 'Untitled Entry'}</h1>
                                        <div className="prose prose-lg mx-auto max-w-3xl text-slate-800 dark:text-slate-200 leading-relaxed dark:prose-invert">
                                            <ReactMarkdown
                                                rehypePlugins={[rehypeRaw, rehypeHighlight]}
                                                remarkPlugins={[remarkBreaks]}
                                            >
                                                {content}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            <Footer />
        </div>
    );
};

export default EditBlog;
