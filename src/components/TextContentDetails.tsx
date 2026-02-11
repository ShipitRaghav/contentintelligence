import React, { useState, useEffect } from 'react';
import { ArrowLeft, Eye, Pencil, MoreHorizontal, Share2, Copy, Check, Download, Image as ImageIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { GeneratedContent } from '@/types/project';
import { useProduct } from '@/lib/productContext';

interface TextContentDetailsProps {
    content: GeneratedContent;
    onBack: () => void;
    onUpdateTitle?: (id: string, newTitle: string) => void;
}

export default function TextContentDetails({ content, onBack, onUpdateTitle }: TextContentDetailsProps) {
    const [text, setText] = useState('');
    const [title, setTitle] = useState('');
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [copied, setCopied] = useState(false);
    const { currentProduct } = useProduct();
    const isFundBuzz = currentProduct === 'fundbuzz';

    useEffect(() => {
        if (content.content) {
            setText(content.content);
        } else {
            setText('');
        }
        setTitle(content.title);
        setIsEditing(false);
    }, [content]);

    const isImage = content.type === 'image';

    const handleCopy = () => {
        navigator.clipboard.writeText(isImage ? (content.url || '') : text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleTitleSave = () => {
        setIsEditingTitle(false);
        if (title.trim() && title !== content.title && onUpdateTitle) {
            onUpdateTitle(content.id, title);
        } else {
            setTitle(content.title);
        }
    };

    return (
        <div className={`flex flex-col h-full ${isFundBuzz ? 'bg-white' : 'bg-slate-900'}`}>
            {/* Header */}
            <div className={`flex items-center justify-between p-4 border-b ${isFundBuzz ? 'border-slate-200' : 'border-white/10'}`}>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button
                        onClick={onBack}
                        className={`p-2 rounded-lg transition-colors shrink-0 ${isFundBuzz ? 'hover:bg-slate-100 text-slate-500 hover:text-slate-900' : 'hover:bg-white/10 text-gray-400 hover:text-white'}`}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex-1 min-w-0">
                        {isEditingTitle && onUpdateTitle ? (
                            <input
                                autoFocus
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                onBlur={handleTitleSave}
                                onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
                                className={`w-full bg-transparent font-semibold focus:outline-none ${isFundBuzz ? 'text-slate-900' : 'text-gray-200'}`}
                            />
                        ) : (
                            <h2
                                onClick={() => onUpdateTitle && setIsEditingTitle(true)}
                                className={`font-semibold truncate ${onUpdateTitle ? 'cursor-pointer hover:opacity-70 transition-opacity' : ''} ${isFundBuzz ? 'text-slate-900' : 'text-gray-200'}`}
                            >
                                {title}
                            </h2>
                        )}
                        <p className={`text-xs ${isFundBuzz ? 'text-slate-500' : 'text-gray-500'}`}>{content.format || (isImage ? 'Image' : content.type === 'text' ? 'Document' : 'Generated Content')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {!isImage && (
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className={`p-2 rounded-lg transition-colors ${isEditing
                                ? (isFundBuzz ? 'bg-blue-50 text-blue-600' : 'bg-white/10 text-blue-400')
                                : (isFundBuzz ? 'hover:bg-slate-100 text-slate-500 hover:text-slate-900' : 'hover:bg-white/10 text-gray-400 hover:text-white')
                            }`}
                            title={isEditing ? 'Preview' : 'Edit'}
                        >
                            {isEditing ? <Eye className="w-5 h-5" /> : <Pencil className="w-5 h-5" />}
                        </button>
                    )}
                    {isImage && content.url && (
                        <a
                            href={content.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`p-2 rounded-lg transition-colors ${isFundBuzz ? 'hover:bg-slate-100 text-slate-500 hover:text-slate-900' : 'hover:bg-white/10 text-gray-400 hover:text-white'}`}
                            title="Open full size"
                        >
                            <Download className="w-5 h-5" />
                        </a>
                    )}
                    <button
                        onClick={handleCopy}
                        className={`p-2 rounded-lg transition-colors ${isFundBuzz ? 'hover:bg-slate-100 text-slate-500 hover:text-slate-900' : 'hover:bg-white/10 text-gray-400 hover:text-white'}`}
                        title="Copy to clipboard"
                    >
                        {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                    </button>
                    <button className={`p-2 rounded-lg transition-colors ${isFundBuzz ? 'hover:bg-slate-100 text-slate-500 hover:text-slate-900' : 'hover:bg-white/10 text-gray-400 hover:text-white'}`}>
                        <Share2 className="w-5 h-5" />
                    </button>
                    <button className={`p-2 rounded-lg transition-colors ${isFundBuzz ? 'hover:bg-slate-100 text-slate-500 hover:text-slate-900' : 'hover:bg-white/10 text-gray-400 hover:text-white'}`}>
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-8 overflow-y-auto">
                {isImage ? (
                    content.url ? (
                        <div className="flex items-center justify-center h-full">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={content.url}
                                alt={content.title}
                                className="max-w-full max-h-full object-contain rounded-lg"
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full gap-3">
                            <ImageIcon className={`w-12 h-12 ${isFundBuzz ? 'text-slate-300' : 'text-gray-600'}`} />
                            <p className={`text-sm ${isFundBuzz ? 'text-slate-400' : 'text-gray-500'}`}>
                                {content.isLoading ? 'Generating image...' : 'Image unavailable'}
                            </p>
                        </div>
                    )
                ) : isEditing ? (
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className={`w-full h-full bg-transparent resize-none focus:outline-none text-sm font-mono leading-relaxed ${isFundBuzz ? 'text-slate-900' : 'text-gray-300'}`}
                        spellCheck={false}
                    />
                ) : (
                    <div className={`prose max-w-none text-sm leading-relaxed ${isFundBuzz ? 'prose-slate' : 'prose-invert'}`}>
                        <ReactMarkdown
                            components={{
                                h1: ({ ...props }) => <h1 className={`text-2xl font-bold mb-4 mt-6 first:mt-0 ${isFundBuzz ? 'text-slate-900' : 'text-white'}`} {...props} />,
                                h2: ({ ...props }) => <h2 className={`text-xl font-bold mb-3 mt-5 first:mt-0 ${isFundBuzz ? 'text-slate-900' : 'text-white'}`} {...props} />,
                                h3: ({ ...props }) => <h3 className={`text-lg font-bold mb-2 mt-4 first:mt-0 ${isFundBuzz ? 'text-slate-900' : 'text-white'}`} {...props} />,
                                p: ({ ...props }) => <p className={`mb-3 last:mb-0 ${isFundBuzz ? 'text-slate-700' : 'text-gray-300'}`} {...props} />,
                                ul: ({ ...props }) => <ul className="list-disc ml-5 space-y-1.5 my-3" {...props} />,
                                ol: ({ ...props }) => <ol className="list-decimal ml-5 space-y-1.5 my-3" {...props} />,
                                li: ({ ...props }) => <li className={`${isFundBuzz ? 'text-slate-700' : 'text-gray-300'}`} {...props} />,
                                strong: ({ ...props }) => <strong className={`font-semibold ${isFundBuzz ? 'text-slate-900' : 'text-white'}`} {...props} />,
                                em: ({ ...props }) => <em className="italic" {...props} />,
                                blockquote: ({ ...props }) => <blockquote className={`border-l-4 pl-4 my-3 italic ${isFundBuzz ? 'border-slate-300 text-slate-600' : 'border-white/20 text-gray-400'}`} {...props} />,
                                code: ({ className, children, ...props }) => {
                                    const isBlock = className?.includes('language-');
                                    if (isBlock) {
                                        return (
                                            <pre className={`rounded-lg p-4 my-3 overflow-x-auto text-sm ${isFundBuzz ? 'bg-slate-100' : 'bg-white/5'}`}>
                                                <code className={className} {...props}>{children}</code>
                                            </pre>
                                        );
                                    }
                                    return <code className={`px-1.5 py-0.5 rounded text-sm ${isFundBuzz ? 'bg-slate-100 text-slate-800' : 'bg-white/10 text-gray-200'}`} {...props}>{children}</code>;
                                },
                                a: ({ ...props }) => (
                                    <a
                                        {...props}
                                        className="text-blue-500 hover:underline"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    />
                                ),
                                hr: () => <hr className={`my-6 ${isFundBuzz ? 'border-slate-200' : 'border-white/10'}`} />,
                            }}
                        >
                            {text || '*No content yet*'}
                        </ReactMarkdown>
                    </div>
                )}
            </div>
        </div>
    );
}
