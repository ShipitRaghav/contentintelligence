'use client';
import { useState } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Link as LinkIcon } from 'lucide-react';
import { useProduct } from '@/lib/productContext';
import { SourceType, SOURCE_TYPE_LABELS } from '@/types/source';

interface AddSourcesModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentSourceCount: number;
    onAddSource: (input: { url: string; type: string; title: string }) => void;
}

export default function AddSourcesModal({ isOpen, onClose, currentSourceCount, onAddSource }: AddSourcesModalProps) {
    const { theme, currentProduct } = useProduct();
    const limit = 30;
    const progressPercentage = Math.min((currentSourceCount / limit) * 100, 100);

    const isFundBuzz = currentProduct === 'fundbuzz';

    const [linkUrl, setLinkUrl] = useState('');
    const [sourceType, setSourceType] = useState<SourceType>(SourceType.Document);

    const handleSubmit = () => {
        if (!linkUrl.trim()) return;

        // Derive a title from the URL
        const title = deriveTitleFromUrl(linkUrl);

        onAddSource({ url: linkUrl.trim(), type: sourceType, title });
        setLinkUrl('');
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4"
                    >
                        <div className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden pointer-events-auto flex flex-col transition-colors ${isFundBuzz ? 'bg-white border-slate-200' : 'bg-slate-800 border-white/10'}`}>
                            {/* Header */}
                            <div className={`p-6 flex items-center justify-between border-b ${isFundBuzz ? 'bg-white border-slate-100' : 'bg-slate-800 border-white/5'}`}>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
                                        <img src={theme.logo} alt={`${theme.displayName} Logo`} className="w-full h-full object-cover" />
                                    </div>
                                    <span className={`font-semibold text-lg ${isFundBuzz ? 'text-slate-900' : 'text-white'}`}>{theme.displayName}</span>
                                </div>
                                <button onClick={onClose} className={`p-2 rounded-full transition-colors ${isFundBuzz ? 'hover:bg-slate-100 text-slate-400' : 'hover:bg-white/5 text-gray-400'}`}>
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Main Content */}
                            <div className="p-8 space-y-6">
                                <div>
                                    <h2 className={`text-xl font-medium mb-4 ${isFundBuzz ? 'text-slate-900' : 'text-white'}`}>Add Source</h2>

                                    <div className="space-y-4">
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${isFundBuzz ? 'text-slate-700' : 'text-gray-300'}`}>Link URL</label>
                                            <div className="relative">
                                                <LinkIcon className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isFundBuzz ? 'text-slate-400' : 'text-gray-500'}`} />
                                                <input
                                                    type="text"
                                                    value={linkUrl}
                                                    onChange={(e) => setLinkUrl(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                                                    placeholder="Paste link here..."
                                                    className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:outline-none ${isFundBuzz ? 'bg-white border-slate-200 focus:ring-blue-500/20 text-slate-900' : 'bg-white/5 border-white/10 focus:ring-blue-500/20 text-white placeholder-gray-500'}`}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${isFundBuzz ? 'text-slate-700' : 'text-gray-300'}`}>Type</label>
                                            <select
                                                value={sourceType}
                                                onChange={(e) => setSourceType(e.target.value as SourceType)}
                                                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:outline-none appearance-none ${isFundBuzz ? 'bg-white border-slate-200 focus:ring-blue-500/20 text-slate-900' : 'bg-white/5 border-white/10 focus:ring-blue-500/20 text-white'}`}
                                            >
                                                {Object.values(SourceType).map((t) => (
                                                    <option key={t} value={t}>{SOURCE_TYPE_LABELS[t]}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className={`p-6 border-t flex items-center justify-between ${isFundBuzz ? 'bg-slate-50 border-slate-200' : 'bg-slate-800 border-white/5'}`}>
                                <div className={`text-sm ${isFundBuzz ? 'text-slate-500' : 'text-gray-400'}`}>
                                    {currentSourceCount} / {limit} sources
                                    <div className={`w-32 h-1.5 rounded-full mt-1 ${isFundBuzz ? 'bg-slate-200' : 'bg-white/10'}`}>
                                        <div
                                            className="h-full rounded-full bg-blue-500 transition-all"
                                            style={{ width: `${progressPercentage}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Primary CTA */}
                                <button
                                    onClick={handleSubmit}
                                    disabled={!linkUrl.trim()}
                                    className={`px-6 py-2 rounded-full font-medium transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed ${isFundBuzz ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                                >
                                    Add Source
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

function deriveTitleFromUrl(url: string): string {
    try {
        const parsed = new URL(url);
        // Use hostname + pathname as a reasonable title
        const path = parsed.pathname.replace(/\/$/, '').split('/').pop();
        if (path && path !== '') {
            return decodeURIComponent(path).replace(/[-_]/g, ' ').replace(/\.\w+$/, '');
        }
        return parsed.hostname;
    } catch {
        return url.substring(0, 60);
    }
}
