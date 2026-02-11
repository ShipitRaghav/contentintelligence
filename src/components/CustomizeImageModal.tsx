import React, { useState } from 'react';
import { X, ChevronDown, Check, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProduct } from '@/lib/productContext';

interface CustomizeImageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate?: (format: string, style: string, includeText: boolean, prompt: string, imageCount: number) => void;
}

export default function CustomizeImageModal({ isOpen, onClose, onGenerate }: CustomizeImageModalProps) {
    const { currentProduct } = useProduct();
    const isFundBuzz = currentProduct === 'fundbuzz';

    const [selectedFormat, setSelectedFormat] = useState('Cover / Thumbnail');
    const [selectedStyle, setSelectedStyle] = useState('Clean modern');
    const [includeText, setIncludeText] = useState(true);
    const [prompt, setPrompt] = useState('');
    const [imageCount, setImageCount] = useState(1);

    const formats = [
        {
            name: 'Cover / Thumbnail',
            description: 'Bold, eye-catching layout for videos or posts.'
        },
        {
            name: 'Fact Card',
            description: 'Simple, data-driven visual with 1–3 insights.'
        },
        {
            name: 'Infographic',
            description: 'Visualizing stats, diagrams'
        },
        {
            name: 'Carousel Slide',
            description: 'Clean slide templates for IG/LinkedIn.'
        }
    ];

    const styles = [
        'Minimal',
        'Clean modern',
        'Bold creator aesthetic',
        'High contrast',
        'Scientific / technical',
        'Warm editorial'
    ];

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isFundBuzz ? 'bg-slate-900/40 backdrop-blur-md' : 'bg-black/70 backdrop-blur-sm'}`}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`${isFundBuzz ? 'bg-white border-slate-200' : 'bg-[#1a1a1a] border-white/10'} w-full max-w-4xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]`}
                >
                    {/* Header */}
                    <div className={`flex items-center justify-between px-6 py-4 border-b ${isFundBuzz ? 'bg-white border-slate-100' : 'bg-[#1a1a1a] border-white/10'}`}>
                        <div className="flex items-center gap-2">
                            <ImageIcon className={`w-5 h-5 ${isFundBuzz ? 'text-slate-900' : 'text-white'}`} />
                            <h2 className={`text-lg font-semibold ${isFundBuzz ? 'text-slate-900' : 'text-white'}`}>Customise Image</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className={`p-2 rounded-full transition-colors ${isFundBuzz ? 'hover:bg-slate-100 text-slate-400 hover:text-slate-600' : 'hover:bg-white/10 text-gray-400 hover:text-white'}`}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-8 overflow-y-auto">
                        {/* Format Section */}
                        <div className="mb-8">
                            <h3 className={`text-sm font-medium mb-4 ${isFundBuzz ? 'text-slate-500' : 'text-gray-300'}`}>Format</h3>
                            <div className="grid grid-cols-4 gap-4">
                                {formats.map((format) => (
                                    <button
                                        key={format.name}
                                        onClick={() => setSelectedFormat(format.name)}
                                        className={`relative p-5 rounded-xl text-left transition-all h-full flex flex-col border-2 ${selectedFormat === format.name
                                            ? (isFundBuzz ? 'bg-blue-50 border-blue-600' : 'bg-[#2a303c] border-transparent')
                                            : (isFundBuzz ? 'bg-slate-50 border-transparent hover:bg-slate-100' : 'bg-[#2a303c]/50 border-transparent hover:bg-[#2a303c]/80')
                                            }`}
                                    >
                                        <div className="flex justify-between items-start w-full mb-2">
                                            <div className={`font-medium text-sm ${isFundBuzz ? 'text-slate-900' : 'text-white'}`}>{format.name}</div>
                                            {selectedFormat === format.name && (
                                                <div className={`rounded-full p-0.5 shrink-0 ml-2 ${isFundBuzz ? 'bg-blue-600' : 'bg-white'}`}>
                                                    <Check className={`w-3 h-3 ${isFundBuzz ? 'text-white' : 'text-black'}`} strokeWidth={3} />
                                                </div>
                                            )}
                                        </div>
                                        <div className={`text-xs leading-relaxed ${isFundBuzz ? 'text-slate-500' : 'text-gray-400'}`}>
                                            {format.description}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Style and Text Toggle Row */}
                        <div className="grid grid-cols-2 gap-12 mb-8">
                            {/* Style Dropdown */}
                            <div>
                                <label className={`text-sm font-medium mb-3 block ${isFundBuzz ? 'text-slate-500' : 'text-gray-300'}`}>Style</label>
                                <div className="relative">
                                    <select
                                        value={selectedStyle}
                                        onChange={(e) => setSelectedStyle(e.target.value)}
                                        className={`w-full border rounded-lg px-4 py-3 appearance-none cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 ${isFundBuzz ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-[#1a1a1a] border-white/20 text-white hover:border-white/40'
                                            }`}
                                    >
                                        {styles.map((style) => (
                                            <option key={style} value={style} className={isFundBuzz ? 'bg-white text-slate-900' : 'bg-[#1a1a1a]'}>
                                                {style}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Add Text Toggle */}
                            <div>
                                <label className={`text-sm font-medium mb-3 block ${isFundBuzz ? 'text-slate-500' : 'text-gray-300'}`}>Add text</label>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setIncludeText(!includeText)}
                                        className={`relative w-12 h-6 rounded-full transition-colors ${includeText ? 'bg-purple-600' : 'bg-gray-400'}`}
                                    >
                                        <div
                                            className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${includeText ? 'translate-x-6' : 'translate-x-0'}`}
                                        />
                                    </button>
                                    <span className={`text-sm ${isFundBuzz ? 'text-slate-500' : 'text-gray-400'}`}>
                                        {includeText ? 'On' : 'Off'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Content Prompt */}
                        <div>
                            <label className={`text-sm font-medium mb-3 block ${isFundBuzz ? 'text-slate-500' : 'text-gray-300'}`}>
                                Content Prompt
                            </label>
                            <div className="relative">
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    rows={4}
                                    className={`w-full border rounded-lg px-4 py-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${isFundBuzz ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400' : 'bg-[#1a1a1a] border-white/20 text-white placeholder-gray-500'
                                        }`}
                                    placeholder="Describe the visual you want to create…"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className={`border-t px-6 py-4 flex justify-end gap-4 ${isFundBuzz ? 'bg-white border-slate-100' : 'bg-[#1a1a1a] border-white/10'}`}>
                        {/* Image Count Dropdown - temporarily disabled, locked to 1 */}

                        <button
                            onClick={() => {
                                if (onGenerate) {
                                    onGenerate(selectedFormat, selectedStyle, includeText, prompt, imageCount);
                                    onClose();
                                }
                            }}
                            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-full transition-colors shadow-lg shadow-purple-600/20"
                        >
                            Generate
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

