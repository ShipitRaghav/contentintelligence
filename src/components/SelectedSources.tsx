'use client';

import { motion } from 'framer-motion';
import { MoreVertical, Trash2, FileText, Mic, Youtube, Loader2, Sparkles } from 'lucide-react';
import { useState } from 'react';
import type { Source } from '@/types/source';
import { useProduct } from '@/lib/productContext';

interface SelectedSourcesProps {
    sources: Source[];
    onSourceClick: (source: Source) => void;
    onRemove: (sourceId: string) => void;
}

export default function SelectedSources({ sources, onSourceClick, onRemove }: SelectedSourcesProps) {
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const { currentProduct } = useProduct();
    const isFundBuzz = currentProduct === 'fundbuzz';

    const getIcon = (source: Source) => {
        switch (source.type) {
            case 'video':
                return <Youtube className="w-5 h-5 text-red-600" />;
            case 'audio':
                return <Mic className="w-5 h-5 text-pink-500" />;
            case 'document':
            default:
                return <FileText className="w-5 h-5 text-purple-500" />;
        }
    };

    const getStatusIndicator = (source: Source) => {
        if (source.processingStatus === 'processing') {
            return <Loader2 className="w-3.5 h-3.5 shrink-0 text-amber-400 animate-spin" />;
        }
        if (source.processingStatus === 'completed') {
            return <Sparkles className="w-3.5 h-3.5 shrink-0 text-green-400" />;
        }
        if (source.processingStatus === 'failed') {
            return <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />;
        }
        return null;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`rounded-xl p-3 border transition-colors ${isFundBuzz ? 'bg-white border-slate-100' : 'bg-white/5 border-white/10'}`}
        >
            <h3 className={`text-sm font-semibold mb-3 ${isFundBuzz ? 'text-slate-500' : 'text-gray-300'}`}>
                Sources ({sources.length})
            </h3>

            <div className="space-y-2">
                {sources.map((source) => (
                    <div
                        key={source.id}
                        className={`group relative flex items-start gap-3 p-3 border rounded-lg transition-colors ${isFundBuzz ? 'bg-slate-50/50 border-slate-100 hover:bg-slate-100' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                    >
                        {/* Icon */}
                        <div className="p-1 shrink-0">
                            {getIcon(source)}
                        </div>

                        {/* Content */}
                        <div
                            className="flex-1 min-w-0 cursor-pointer"
                            onClick={() => onSourceClick(source)}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <h4 className={`text-sm font-medium line-clamp-2 pr-8 ${isFundBuzz ? 'text-slate-900' : 'text-white'}`}>{source.title}</h4>
                                {getStatusIndicator(source)}
                            </div>
                            <p className="text-xs text-gray-400">
                                {source.authors ? `${source.authors} • ` : ''}{source.type}
                            </p>
                        </div>

                        {/* More options */}
                        <div className="absolute top-2 right-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(openMenuId === source.id ? null : source.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-colors"
                            >
                                <MoreVertical className="w-4 h-4 text-gray-400" />
                            </button>

                            {openMenuId === source.id && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setOpenMenuId(null)}
                                    />
                                    <div className={`absolute right-0 top-8 mt-1 w-40 border rounded-lg shadow-xl overflow-hidden z-20 ${isFundBuzz ? 'bg-white border-slate-200' : 'bg-slate-800 border-white/10'}`}>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onRemove(source.id);
                                                setOpenMenuId(null);
                                            }}
                                            className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-red-400 hover:text-red-300 transition-colors ${isFundBuzz ? 'hover:bg-slate-50' : 'hover:bg-white/5'}`}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Remove
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
