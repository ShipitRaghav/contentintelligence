'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { ArrowLeft, Youtube, FileText, Mic, ChevronDown, ChevronUp, Sparkles, Loader2, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { Source } from '@/types/source';
import { useProduct } from '@/lib/productContext';

interface SourceDetailsProps {
    source: Source;
    onBack: () => void;
}

const typeConfig: Record<string, { icon: any; label: string; color: string }> = {
    video: { icon: Youtube, label: 'Video', color: 'bg-red-500/20 text-red-400' },
    audio: { icon: Mic, label: 'Audio', color: 'bg-pink-500/20 text-pink-400' },
    document: { icon: FileText, label: 'Document', color: 'bg-purple-500/20 text-purple-400' },
};

export default function SourceDetails({ source, onBack }: SourceDetailsProps) {
    const [summaryExpanded, setSummaryExpanded] = useState(false);
    const [transcriptExpanded, setTranscriptExpanded] = useState(false);
    const { currentProduct } = useProduct();
    const isFundBuzz = currentProduct === 'fundbuzz';

    const config = typeConfig[source.type] || typeConfig.document;
    const TypeIcon = config.icon;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full flex flex-col bg-slate-900"
        >
            {/* Header */}
            <div className={`p-4 border-b flex items-center gap-3 ${isFundBuzz ? 'border-slate-200' : 'border-white/10'}`}>
                <button
                    onClick={onBack}
                    className={`p-2 rounded-lg transition-colors ${isFundBuzz ? 'hover:bg-slate-100 text-slate-500 hover:text-slate-900' : 'hover:bg-white/10 text-gray-400 hover:text-white'}`}
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className={`text-lg font-semibold ${isFundBuzz ? 'text-slate-900' : 'text-white'}`}>
                    Source Details
                </h2>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 pb-20 space-y-8 scrollbar-hide">
                {/* Title */}
                <div>
                    <h3 className={`text-2xl font-bold leading-tight mb-2 ${isFundBuzz ? 'text-slate-900' : 'text-white'}`}>
                        {source.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        {source.authors && <span>{source.authors}</span>}
                        {source.authors && <span>•</span>}
                        <span>{source.year}</span>
                    </div>
                </div>

                {/* Type Badge + Processing Status */}
                <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${isFundBuzz ? config.color.replace('/20', '/10').replace('/400', '/700') : config.color}`}>
                        <TypeIcon className="w-3.5 h-3.5" />
                        {config.label}
                    </span>
                    {source.processingStatus === 'processing' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Processing
                        </span>
                    )}
                    {source.processingStatus === 'completed' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                            <Sparkles className="w-3 h-3" />
                            Completed
                        </span>
                    )}
                    {source.processingStatus === 'failed' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                            Failed
                        </span>
                    )}
                </div>

                {/* URL Link */}
                {source.url && (
                    <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm transition-colors ${isFundBuzz
                            ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            : 'bg-white/5 border-white/10 text-gray-300 hover:text-white hover:bg-white/10'
                        }`}
                    >
                        <ExternalLink className="w-4 h-4" />
                        <span className="truncate">{source.url}</span>
                    </a>
                )}

                {/* AI Summary Accordion */}
                {source.summary && (
                    <div className={`rounded-xl overflow-hidden border transition-all ${isFundBuzz ? 'border-indigo-100 bg-indigo-50/50' : 'border-indigo-500/20 bg-indigo-500/10'}`}>
                        <button
                            onClick={() => setSummaryExpanded(!summaryExpanded)}
                            className="w-full flex items-center justify-between p-4 text-left transition-colors hover:bg-black/5"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${isFundBuzz ? 'bg-indigo-100 text-indigo-600' : 'bg-indigo-500/20 text-indigo-400'}`}>
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className={`font-semibold ${isFundBuzz ? 'text-indigo-900' : 'text-indigo-200'}`}>AI Summary</h4>
                                    <p className={`text-xs ${isFundBuzz ? 'text-indigo-600' : 'text-indigo-400'}`}>
                                        {summaryExpanded ? 'Click to collapse' : 'Click to expand'}
                                    </p>
                                </div>
                            </div>
                            {summaryExpanded ? (
                                <ChevronUp className="w-5 h-5 text-indigo-400" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-indigo-400" />
                            )}
                        </button>
                        {summaryExpanded && (
                            <div className={`p-5 pt-0 border-t ${isFundBuzz ? 'border-indigo-100' : 'border-indigo-500/20'}`}>
                                <div className={`mt-4 text-sm leading-relaxed prose prose-sm max-w-none ${isFundBuzz ? 'prose-slate text-slate-700' : 'prose-invert text-gray-300'}`}>
                                    <ReactMarkdown>{source.summary}</ReactMarkdown>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Transcript Accordion */}
                {source.transcript && (
                    <div className={`rounded-xl overflow-hidden border transition-all ${isFundBuzz ? 'border-slate-200 bg-slate-50' : 'border-white/10 bg-white/5'}`}>
                        <button
                            onClick={() => setTranscriptExpanded(!transcriptExpanded)}
                            className="w-full flex items-center justify-between p-4 text-left transition-colors hover:bg-black/5"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${isFundBuzz ? 'bg-slate-200 text-slate-600' : 'bg-white/10 text-gray-400'}`}>
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className={`font-semibold ${isFundBuzz ? 'text-slate-900' : 'text-white'}`}>Transcript</h4>
                                    <p className={`text-xs ${isFundBuzz ? 'text-slate-500' : 'text-gray-500'}`}>
                                        {transcriptExpanded ? 'Click to collapse' : 'Click to expand'}
                                    </p>
                                </div>
                            </div>
                            {transcriptExpanded ? (
                                <ChevronUp className={`w-5 h-5 ${isFundBuzz ? 'text-slate-400' : 'text-gray-400'}`} />
                            ) : (
                                <ChevronDown className={`w-5 h-5 ${isFundBuzz ? 'text-slate-400' : 'text-gray-400'}`} />
                            )}
                        </button>
                        {transcriptExpanded && (
                            <div className={`p-5 pt-0 border-t ${isFundBuzz ? 'border-slate-200' : 'border-white/10'}`}>
                                <div className={`mt-4 text-sm leading-relaxed prose prose-sm max-w-none ${isFundBuzz ? 'prose-slate text-slate-700' : 'prose-invert text-gray-300'}`}>
                                    <ReactMarkdown>{source.transcript}</ReactMarkdown>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Raw Content */}
                {source.content && !source.transcript && (
                    <div className="space-y-3">
                        <h4 className={`text-sm font-semibold uppercase tracking-wider ${isFundBuzz ? 'text-slate-500' : 'text-gray-400'}`}>
                            Content
                        </h4>
                        <div className={`p-5 rounded-2xl border text-base leading-relaxed ${isFundBuzz
                            ? 'bg-slate-50 border-slate-200 text-slate-800 shadow-sm'
                            : 'bg-white/5 border-white/10 text-gray-200'
                        }`}>
                            <p className="whitespace-pre-wrap">{source.content}</p>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
