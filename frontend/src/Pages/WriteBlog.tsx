import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X, AlertCircle, Maximize2, Minimize2, Terminal as TerminalIcon } from 'lucide-react';
import Navbar from '../components/NavBar';
import Footer from '../components/Footer';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkBreaks from 'remark-breaks';
import rehypeHighlight from 'rehype-highlight';

const WriteBlog = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [currentTag, setCurrentTag] = useState('');
    const [viewMode, setViewMode] = useState<'write' | 'preview'>('write');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [selection, setSelection] = useState<{ start: number; end: number } | null>(null);
    const editorRef = useRef<HTMLTextAreaElement>(null);
    const [isImageUploading, setIsImageUploading] = useState(false);
    const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);

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
            const response = await fetch('/api/blog', {
                method: 'POST',
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
                throw new Error(data.message || 'Failed to publish blog');
            }

            navigate('/blogs');
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
            const response = await fetch('/api/blog', {
                method: 'POST',
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

    return (
        <div className="min-h-screen bg-pink-100/35 text-black font-sans selection:bg-pink-500/30">
            <Navbar />
            
            <div className="pt-24 pb-32">
                <div className="max-w-4xl mx-auto px-6 lg:px-12 mt-8 border-4 border-black bg-white p-8 md:p-12 shadow-[10px_10px_0px_#000]">
                    {/* Mode Toggle & Status */}
                    <div className="flex justify-between items-center mb-12 border-b-4 border-black pb-6">
                        <button
                            type="button"
                            onClick={() => navigate('/blogs')}
                            className="flex items-center gap-2 border-4 border-black px-4 py-2 bg-white hover:bg-pink-100 text-black font-black uppercase text-xs shadow-[3px_3px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] transition cursor-pointer"
                        >
                            <ArrowLeft size={16} strokeWidth={2.5} />
                            <span>Abort & Return</span>
                        </button>
                        
                        <div className="flex items-center gap-6">
                            <div className="flex flex-col items-end gap-1 border-r-4 border-black pr-6">
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (viewMode === 'preview') setViewMode('write');
                                        }}
                                        className={`text-xs font-black uppercase tracking-widest transition-colors cursor-pointer ${viewMode === 'write' ? 'text-pink-500 border-b-2 border-pink-500' : 'text-black hover:text-pink-500'}`}
                                    >
                                        [ Write ]
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (viewMode === 'write') {
                                                captureSelection();
                                                setViewMode('preview');
                                            }
                                        }}
                                        className={`text-xs font-black uppercase tracking-widest transition-colors cursor-pointer ${viewMode === 'preview' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-black hover:text-pink-500'}`}
                                    >
                                        [ Preview ]
                                    </button>
                                </div>
                                <span className="text-[9px] font-black text-gray-500 uppercase tracking-tighter">Ctrl + Esc to toggle</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 border-2 border-black ${viewMode === 'write' ? 'bg-pink-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                                <span className={`font-black text-xs uppercase tracking-widest ${viewMode === 'write' ? 'text-pink-500' : 'text-emerald-600'}`}>
                                    {viewMode === 'write' ? 'Write Mode' : 'Preview Mode'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div className="mb-12 border-4 border-black bg-red-100 text-red-800 p-4 font-black text-xs flex items-center gap-3 shadow-[4px_4px_0px_#000]">
                                <AlertCircle size={14} strokeWidth={2.5} />
                                <span>ERROR: {error}</span>
                            </div>
                        )}

                        {viewMode === 'write' ? (
                            <div className="space-y-12">
                                {/* Title Input */}
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-black tracking-wider ml-1">Entry Title</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="TITLE_HERE"
                                        className="w-full bg-white border-4 border-black p-4 text-black text-3xl font-black uppercase focus:outline-none focus:bg-pink-100 shadow-[4px_4px_0px_#000] focus:shadow-[2px_2px_0px_#000] transition placeholder:text-gray-400"
                                    />
                                </div>

                                {/* Abstract Input */}
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-black tracking-wider ml-1">Abstract / Description</label>
                                    <textarea
                                        value={excerpt}
                                        onChange={(e) => setExcerpt(e.target.value)}
                                        placeholder="Briefly describe this entry..."
                                        className="w-full bg-white border-4 border-black p-4 text-black text-base font-semibold focus:outline-none focus:bg-pink-100 shadow-[4px_4px_0px_#000] focus:shadow-[2px_2px_0px_#000] transition placeholder:text-gray-400 h-24 resize-none leading-relaxed"
                                    />
                                </div>

                                {/* Metadata & Tags */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase text-black tracking-wider ml-1">Metadata Tags [{tags.length}/4]</label>
                                        <div className="flex flex-wrap gap-2 p-2 border-4 border-black bg-white min-h-12 shadow-[4px_4px_0px_#000] items-center">
                                            {tags.map(tag => (
                                                <span key={tag} className="flex items-center gap-2 border-2 border-black bg-pink-100 text-black px-3 py-1 text-[10px] font-black uppercase shadow-[2px_2px_0px_#000]">
                                                    {tag}
                                                    <button type="button" onClick={() => removeTag(tag)} className="text-black hover:text-red-500 cursor-pointer"><X size={10} strokeWidth={2.5} /></button>
                                                </span>
                                            ))}
                                            {tags.length < 4 && (
                                                <input
                                                    type="text"
                                                    value={currentTag}
                                                    onChange={(e) => setCurrentTag(e.target.value)}
                                                    onKeyDown={handleTagKeyDown}
                                                    placeholder="ADD_TAG"
                                                    className="bg-transparent border-none text-[10px] font-black uppercase focus:outline-none w-20 py-1 text-black placeholder:text-gray-500"
                                                />
                                            )}
                                        </div>
                                    </div>
                                    <div className="pt-6 flex justify-end gap-4">
                                        <button
                                            type="button"
                                            onClick={handleSaveDraft}
                                            disabled={isSubmitting}
                                            className="px-4 py-2.5 border-4 border-black bg-white hover:bg-pink-100 text-black font-black uppercase tracking-widest text-xs shadow-[3px_3px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] transition cursor-pointer disabled:opacity-50"
                                        >
                                            Save Draft
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="px-4 py-2.5 border-4 border-black bg-pink-500 hover:bg-pink-400 text-black font-black uppercase tracking-widest text-xs shadow-[3px_3px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] transition cursor-pointer disabled:opacity-50"
                                        >
                                            Commit Entry
                                        </button>
                                    </div>
                                </div>

                                {/* Content Input */}
                                <div className="space-y-2 relative group">
                                    <label className="text-xs font-black uppercase text-black tracking-wider ml-1">Main Content (Markdown)</label>
                                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 ml-1">Paste images directly into the editor to upload and embed them.</p>
                                    {isImageUploading && (
                                        <p className="text-[10px] font-black uppercase tracking-wider text-pink-600 ml-1 animate-pulse">Uploading image...</p>
                                    )}
                                    <textarea
                                        ref={editorRef}
                                        value={content}
                                        onPaste={handlePaste}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="Begin entry... Markdown and HTML supported."
                                        className="w-full bg-white text-black text-lg font-semibold p-8 h-[600px] border-4 border-black focus:outline-none focus:bg-pink-100 shadow-[8px_8px_0px_#000] focus:shadow-[4px_4px_0px_#000] transition placeholder:text-gray-500 scrollbar-hide"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setIsFullscreen(true)}
                                        className="absolute bottom-4 right-4 p-2 bg-white border-2 border-black hover:bg-pink-100 text-black rounded shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] transition cursor-pointer"
                                    >
                                        <Maximize2 size={16} strokeWidth={2.5} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="border-4 border-black bg-white p-8 md:p-12 shadow-[10px_10px_0px_#000]">
                                <div className="max-w-6xl mx-auto">
                                    {/* Title Block Mock */}
                                    <div className="mb-12 border-b-4 border-black pb-8">
                                        {tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-8">
                                                {tags.map(tag => (
                                                    <span key={tag} className="px-2 py-1 border-2 border-black bg-pink-100 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000]">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        <h1 className="text-3xl md:text-5xl font-black uppercase text-black mb-6 leading-tight">
                                            {title || 'Untitled Entry'}
                                        </h1>
                                        <div className="flex flex-col md:flex-row md:items-center gap-4 text-gray-700 text-xs font-black uppercase border-l-4 border-black pl-4">
                                            <span>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                            <span className="hidden md:inline">/</span>
                                            <span className="text-pink-600">Reading Time: Est. ~{Math.ceil(content.split(' ').length / 200)} min</span>
                                        </div>
                                    </div>

                                    {/* Content Mock */}
                                    <div className="prose prose-lg mx-auto max-w-3xl text-black leading-relaxed selection:bg-pink-500/30">
                                        {content ? (
                                            <ReactMarkdown
                                                rehypePlugins={[rehypeRaw, rehypeHighlight]}
                                                remarkPlugins={[remarkBreaks]}
                                            >
                                                {content}
                                            </ReactMarkdown>
                                        ) : (
                                            <div className="h-48 flex items-center justify-center text-gray-400 font-black uppercase text-xs tracking-widest border-4 border-dashed border-black">
                                                Empty Content State
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>

            {/* Fullscreen Content Editor */}
            {isFullscreen && (
                <div className="fixed inset-0 z-50 bg-pink-100/35 flex flex-col p-8 animate-in fade-in duration-300">
                    <div className="flex-1 flex flex-col p-8 border-4 border-black bg-white shadow-[10px_10px_0px_#000] min-h-0">
                        {/* Header with Toggles */}
                        <div className="flex items-center justify-between mb-8 pb-4 border-b-4 border-black">
                            <div className="flex gap-8">
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (viewMode === 'preview') setViewMode('write');
                                    }}
                                    className={`text-sm font-black uppercase tracking-widest transition-colors cursor-pointer ${viewMode === 'write' ? 'text-pink-500 border-b-2 border-pink-500' : 'text-black hover:text-pink-500'}`}
                                >
                                    [ Write ]
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (viewMode === 'write') {
                                            captureSelection();
                                            setViewMode('preview');
                                        }
                                    }}
                                    className={`text-sm font-black uppercase tracking-widest transition-colors cursor-pointer ${viewMode === 'preview' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-black hover:text-pink-500'}`}
                                >
                                    [ Preview ]
                                </button>
                            </div>
                            <div className="flex items-center gap-6">
                                <span className={`text-xs font-black uppercase tracking-widest ${viewMode === 'write' ? 'text-pink-500' : 'text-emerald-600'}`}>
                                    {viewMode === 'write' ? 'Active Workflow: Editing' : 'Active Workflow: Reviewing'}
                                </span>
                                <button
                                    onClick={() => setIsFullscreen(false)}
                                    className="p-2 bg-white border-2 border-black hover:bg-pink-100 text-black rounded shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] transition cursor-pointer"
                                >
                                    <Minimize2 size={20} strokeWidth={2.5} />
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
                                    className="w-full h-full bg-white text-black text-xl font-semibold p-12 border-4 border-black shadow-[10px_10px_0px_#000] focus:outline-none focus:bg-pink-100/10 max-w-5xl mx-auto block resize-none"
                                    autoFocus
                                    placeholder="Begin log entry..."
                                />
                            ) : (
                                <div className="w-full h-full overflow-y-auto px-12 py-8 scrollbar-hide">
                                    <div className="max-w-4xl mx-auto">
                                        <div className="flex justify-between items-center mb-8 pb-4 border-b-4 border-black">
                                            <div className="flex items-center gap-2 text-black font-black uppercase text-xs">
                                                <TerminalIcon size={14} strokeWidth={2.5} />
                                                <span>~/fullscreen/preview</span>
                                            </div>
                                        </div>
                                        <h1 className="text-4xl font-black uppercase text-black mb-12">{title || 'Untitled Entry'}</h1>
                                        <div className="prose prose-lg mx-auto max-w-3xl text-black leading-relaxed">
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

export default WriteBlog;
