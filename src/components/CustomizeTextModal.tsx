import React, { useState } from 'react';
import { X, ChevronDown, RotateCcw, Plus, GripVertical, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProduct } from '@/lib/productContext';

interface CustomizeTextModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate?: (title: string, format: string, layout: string[], focus: string, boosts: string[], contextSource: 'summary' | 'transcript') => void;
    sourceType?: string;
    hasTranscript?: boolean;
}

export default function CustomizeTextModal({ isOpen, onClose, onGenerate, sourceType, hasTranscript }: CustomizeTextModalProps) {
    const { currentProduct } = useProduct();
    const isFundBuzz = currentProduct === 'fundbuzz';

    const [selectedFormat, setSelectedFormat] = useState('Thread Pack');
    const [contextSource, setContextSource] = useState<'summary' | 'transcript'>('summary');
    const showTranscriptToggle = (sourceType === 'video' || sourceType === 'audio') && hasTranscript;
    const [selectedLanguage, setSelectedLanguage] = useState('English');
    const [selectedLength, setSelectedLength] = useState('Default');
    const [selectedVibe, setSelectedVibe] = useState('');
    const [selectedAudience, setSelectedAudience] = useState('');
    const [includeCitations, setIncludeCitations] = useState(false);
    const [layoutRows, setLayoutRows] = useState<string[]>([]);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editingText, setEditingText] = useState('');
    const [aiFocus, setAiFocus] = useState('');
    const [selectedBoosts, setSelectedBoosts] = useState<string[]>([]);
    const [customPrompts, setCustomPrompts] = useState<string[]>([]);
    const [isAddingCustomPrompt, setIsAddingCustomPrompt] = useState(false);
    const [customPromptInput, setCustomPromptInput] = useState('');

    const formats = [
        {
            name: 'Thread Pack',
            description: 'Threads drive saves, shares, and debate — perfect for myth-busting and quick insights.'
        },
        {
            name: 'Carousel Copy',
            description: 'Slide-by-slide storytelling: 8-10 cards with short lines of text.'
        },
        {
            name: 'Captions',
            description: 'Long-form or micro-captions that accompany visuals.'
        },
        {
            name: 'Fact Card',
            description: 'Short, high-clarity statements optimized for image posts.'
        },
        {
            name: 'Micro-Newsletter',
            description: 'Substack-style short science digest'
        }
    ];

    const layoutTemplates: { [key: string]: string[] } = {
        'Thread Pack': [
            '[Hook] A surprising claim or myth.',
            '[Proof] One key study finding in 1 line.',
            '[Nuance] A limitation or boundary condition.',
            '[Takeaway] What this means for real people.'
        ],
        'Carousel Copy': [
            'Slide 1: Title + 1-line promise.',
            'Slide 2: Common belief.',
            'Slide 3: What the research actually says.',
            'Slide 4: Key takeaway or action step.'
        ],
        'Captions': [
            'Short: 1 punchy insight + 1 data point.',
            'Medium: 2–3 lines explaining why it matters.',
            'Long: Mini-story → finding → takeaway → soft CTA.'
        ],
        'Fact Card': [
            'Title: Clear, simple fact.',
            'Body: 2–3 bullets with key findings.',
            'Footer: Source shorthand or confidence level.'
        ],
        'Micro-Newsletter': [
            'Headline: The core idea in one line.',
            'Insight: 2–3 bullets summarizing the science.',
            'Takeaway: 1 line on what to do with it.'
        ]
    };

    const languages = ['English', 'Spanish', 'Hindi', 'Arabic', 'Tagalog', 'Vietnamese'];
    const vibes = ['Professional', 'Casual', 'Educational', 'Engaging', 'Formal'];
    const audiences = ['General Public', 'Students', 'Researchers', 'Professionals', 'Enthusiasts'];

    // Update layout rows when format changes
    React.useEffect(() => {
        setLayoutRows(layoutTemplates[selectedFormat] || []);
    }, [selectedFormat]);

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const newRows = [...layoutRows];
        const draggedItem = newRows[draggedIndex];
        newRows.splice(draggedIndex, 1);
        newRows.splice(index, 0, draggedItem);
        setLayoutRows(newRows);
        setDraggedIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    const handleRemoveRow = (index: number) => {
        const newRows = layoutRows.filter((_, i) => i !== index);
        setLayoutRows(newRows);
    };

    const handleResetLayout = () => {
        setLayoutRows(layoutTemplates[selectedFormat] || []);
    };

    const handleStartEdit = (index: number, text: string) => {
        setEditingIndex(index);
        setEditingText(text);
    };

    const handleSaveEdit = (index: number) => {
        if (editingText.trim()) {
            const newRows = [...layoutRows];
            newRows[index] = editingText;
            setLayoutRows(newRows);
        }
        setEditingIndex(null);
        setEditingText('');
    };

    const handleCancelEdit = () => {
        setEditingIndex(null);
        setEditingText('');
    };

    const handleAddRow = () => {
        const newRows = [...layoutRows, 'New row: Add your content here'];
        setLayoutRows(newRows);
        // Set the new row to edit mode immediately
        const newIndex = newRows.length - 1;
        setEditingIndex(newIndex);
        setEditingText('New row: Add your content here');
    };

    // Check if layout has been modified from default
    const isLayoutModified = () => {
        const defaultLayout = layoutTemplates[selectedFormat] || [];
        if (layoutRows.length !== defaultLayout.length) return true;
        return layoutRows.some((row, index) => row !== defaultLayout[index]);
    };

    const toggleBoost = (boost: string) => {
        setSelectedBoosts(prev =>
            prev.includes(boost)
                ? prev.filter(b => b !== boost)
                : [...prev, boost]
        );
    };

    const handleAddCustomPrompt = () => {
        if (customPromptInput.trim()) {
            setCustomPrompts(prev => [customPromptInput.trim(), ...prev]);
            setCustomPromptInput('');
            setIsAddingCustomPrompt(false);
        }
    };

    const handleDeleteCustomPrompt = (index: number) => {
        setCustomPrompts(prev => prev.filter((_, i) => i !== index));
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isFundBuzz ? 'bg-slate-900/40 backdrop-blur-md' : 'bg-black/70 backdrop-blur-sm'}`}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`${isFundBuzz ? 'bg-white border-slate-200' : 'bg-[#1a1a1a] border-white/10'} w-full max-w-[86.4rem] rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]`}
                >
                    {/* Main Content Area */}
                    <div className="flex flex-1 overflow-hidden">
                        {/* Left Panel - Configuration */}
                        <div className="flex-1 p-8 overflow-y-auto">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-8">
                                <h2 className={`text-2xl font-semibold ${isFundBuzz ? 'text-slate-900' : 'text-white'}`}>Customize Text Content</h2>
                                <button
                                    onClick={onClose}
                                    className={`p-2 rounded-lg transition-colors ${isFundBuzz ? 'hover:bg-slate-100 text-slate-400 hover:text-slate-600' : 'hover:bg-white/10 text-gray-400 hover:text-white'}`}
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Source Context Toggle - only for video/audio with transcript */}
                            {showTranscriptToggle && (
                                <div className="mb-8">
                                    <label className={`text-sm font-medium mb-3 block ${isFundBuzz ? 'text-slate-500' : 'text-gray-300'}`}>Source Context</label>
                                    <div className={`inline-flex rounded-lg p-1 border ${isFundBuzz ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'}`}>
                                        {(['summary', 'transcript'] as const).map((option) => (
                                            <button
                                                key={option}
                                                onClick={() => setContextSource(option)}
                                                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${contextSource === option
                                                    ? (isFundBuzz ? 'bg-white text-blue-600 shadow-sm' : 'bg-white/10 text-white shadow-sm')
                                                    : (isFundBuzz ? 'text-slate-500 hover:text-slate-900' : 'text-gray-400 hover:text-white')
                                                    }`}
                                            >
                                                {option === 'summary' ? 'Summary' : 'Transcript'}
                                            </button>
                                        ))}
                                    </div>
                                    <p className={`text-xs mt-2 ${isFundBuzz ? 'text-slate-400' : 'text-gray-500'}`}>
                                        Choose whether the AI uses the source summary or full transcript as context.
                                    </p>
                                </div>
                            )}

                            {/* Formats Section */}
                            <div className="mb-8">
                                <h3 className={`text-sm font-medium mb-4 ${isFundBuzz ? 'text-slate-500' : 'text-gray-300'}`}>Formats</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {formats.map((format) => (
                                        <button
                                            key={format.name}
                                            onClick={() => setSelectedFormat(format.name)}
                                            className={`p-5 rounded-xl text-left transition-all border-2 ${selectedFormat === format.name
                                                ? (isFundBuzz ? 'bg-blue-50 border-blue-600' : 'bg-blue-600/20 border-blue-500')
                                                : (isFundBuzz ? 'bg-slate-50 border-transparent hover:bg-slate-100' : 'bg-white/5 border-transparent hover:bg-white/10')
                                                }`}
                                        >
                                            <div className={`font-medium mb-2 ${isFundBuzz ? 'text-slate-900' : 'text-white'}`}>{format.name}</div>
                                            <div className={`text-xs leading-relaxed ${isFundBuzz ? 'text-slate-500' : 'text-gray-400'}`}>{format.description}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Language and Length Row */}
                            <div className="grid grid-cols-2 gap-6 mb-8">
                                {/* Language Dropdown */}
                                <div>
                                    <label className={`text-sm font-medium mb-3 block ${isFundBuzz ? 'text-slate-500' : 'text-gray-300'}`}>Choose language</label>
                                    <div className="relative">
                                        <select
                                            value={selectedLanguage}
                                            onChange={(e) => setSelectedLanguage(e.target.value)}
                                            className={`w-full border rounded-lg px-4 py-3 appearance-none cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${isFundBuzz ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                                                }`}
                                        >
                                            {languages.map((lang) => (
                                                <option key={lang} value={lang} className={isFundBuzz ? 'bg-white text-slate-900' : 'bg-[#1a1a1a]'}>
                                                    {lang}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Length Switcher */}
                                <div>
                                    <label className={`text-sm font-medium mb-3 block ${isFundBuzz ? 'text-slate-500' : 'text-gray-300'}`}>Length</label>
                                    <div className={`inline-flex rounded-lg p-1 border ${isFundBuzz ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'}`}>
                                        {['Short', 'Default', 'Long'].map((length) => (
                                            <button
                                                key={length}
                                                onClick={() => setSelectedLength(length)}
                                                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${selectedLength === length
                                                    ? (isFundBuzz ? 'bg-white text-blue-600 shadow-sm' : 'bg-white/10 text-white shadow-sm')
                                                    : (isFundBuzz ? 'text-slate-500 hover:text-slate-900' : 'text-gray-400 hover:text-white')
                                                    }`}
                                            >
                                                {length}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Vibe and Audience Row */}
                            <div className="grid grid-cols-2 gap-6 mb-8">
                                {/* Vibe Dropdown */}
                                <div>
                                    <label className={`text-sm font-medium mb-3 block ${isFundBuzz ? 'text-slate-500' : 'text-gray-300'}`}>Vibe</label>
                                    <div className="relative">
                                        <select
                                            value={selectedVibe}
                                            onChange={(e) => setSelectedVibe(e.target.value)}
                                            className={`w-full border rounded-lg px-4 py-3 appearance-none cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${isFundBuzz ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                                                }`}
                                        >
                                            <option value="" className={isFundBuzz ? 'bg-white text-slate-900' : 'bg-[#1a1a1a]'}>Select vibe...</option>
                                            {vibes.map((vibe) => (
                                                <option key={vibe} value={vibe} className={isFundBuzz ? 'bg-white text-slate-900' : 'bg-[#1a1a1a]'}>
                                                    {vibe}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Audience Dropdown */}
                                <div>
                                    <label className={`text-sm font-medium mb-3 block ${isFundBuzz ? 'text-slate-500' : 'text-gray-300'}`}>Audience</label>
                                    <div className="relative">
                                        <select
                                            value={selectedAudience}
                                            onChange={(e) => setSelectedAudience(e.target.value)}
                                            className={`w-full border rounded-lg px-4 py-3 appearance-none cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${isFundBuzz ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                                                }`}
                                        >
                                            <option value="" className={isFundBuzz ? 'bg-white text-slate-900' : 'bg-[#1a1a1a]'}>Select audience...</option>
                                            {audiences.map((audience) => (
                                                <option key={audience} value={audience} className={isFundBuzz ? 'bg-white text-slate-900' : 'bg-[#1a1a1a]'}>
                                                    {audience}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Include Citations Checkbox */}
                            <div className="flex items-center gap-3 mb-8">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            checked={includeCitations}
                                            onChange={(e) => setIncludeCitations(e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className={`w-5 h-5 border-2 rounded transition-all flex items-center justify-center ${isFundBuzz
                                            ? 'bg-slate-50 border-slate-200 peer-checked:bg-blue-600 peer-checked:border-blue-600'
                                            : 'bg-white/5 border-white/20 peer-checked:bg-blue-600 peer-checked:border-blue-600'
                                            }`}>
                                            {includeCitations && (
                                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                    <span className={`text-sm font-medium ${isFundBuzz ? 'text-slate-700' : 'text-gray-300'}`}>Include Citations</span>
                                </label>
                            </div>
                        </div>

                        {/* Right Panel - Preview */}
                        <div className={`w-[600px] border-l p-8 flex flex-col ${isFundBuzz ? 'bg-slate-50 border-slate-200' : 'bg-[#0f0f0f] border-white/10'}`}>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className={`text-sm font-medium ${isFundBuzz ? 'text-slate-400' : 'text-gray-400'}`}>Layout Preview</h3>
                                <div className="flex items-center gap-2">
                                    {isLayoutModified() && (
                                        <button
                                            onClick={handleResetLayout}
                                            className="p-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors text-white"
                                            title="Reset Layout"
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button
                                        onClick={handleAddRow}
                                        className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors text-white text-xs font-medium shadow-sm"
                                        title="Add Row"
                                    >
                                        <Plus className="w-4 h-4 text-white" />
                                        <span className="text-white">Add row</span>
                                    </button>
                                </div>
                            </div>

                            {/* Draggable Layout Rows */}
                            <div className={`h-[280px] rounded-xl p-4 border mb-8 overflow-y-auto ${isFundBuzz ? 'bg-white border-slate-200' : 'bg-[#0a0f1a] border-white/10'}`}>
                                {layoutRows.length > 0 ? (
                                    <div className="space-y-2">
                                        {layoutRows.map((row, index) => (
                                            <div
                                                key={`${row}-${index}`}
                                                draggable
                                                onDragStart={() => handleDragStart(index)}
                                                onDragOver={(e) => handleDragOver(e, index)}
                                                onDragEnd={handleDragEnd}
                                                className={`group relative border rounded-lg p-3 cursor-move transition-all ${draggedIndex === index ? 'opacity-50' : ''} ${isFundBuzz
                                                    ? 'bg-slate-50 border-slate-100 hover:bg-slate-100 hover:border-slate-200'
                                                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                                                    }`}
                                            >
                                                {/* Drag Handle */}
                                                <div className="flex items-start gap-3">
                                                    <GripVertical className={`w-4 h-4 shrink-0 mt-0.5 ${isFundBuzz ? 'text-slate-300' : 'text-gray-600'}`} />

                                                    {/* Row Content */}
                                                    {editingIndex === index ? (
                                                        <div className="flex-1 flex items-center gap-2">
                                                            <input
                                                                type="text"
                                                                value={editingText}
                                                                onChange={(e) => setEditingText(e.target.value)}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        handleSaveEdit(index);
                                                                    } else if (e.key === 'Escape') {
                                                                        handleCancelEdit();
                                                                    }
                                                                }}
                                                                className={`flex-1 border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${isFundBuzz ? 'bg-white border-blue-500 text-slate-900' : 'bg-white/10 border-blue-500 text-white'
                                                                    }`}
                                                                autoFocus
                                                            />
                                                            <button
                                                                onClick={() => handleSaveEdit(index)}
                                                                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                                                            >
                                                                Save
                                                            </button>
                                                            <button
                                                                onClick={handleCancelEdit}
                                                                className={`px-2 py-1 text-xs rounded transition-colors ${isFundBuzz ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' : 'bg-gray-600 hover:bg-gray-500 text-white'}`}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div
                                                            onClick={() => handleStartEdit(index, row)}
                                                            className={`flex-1 text-sm leading-relaxed cursor-text transition-colors ${isFundBuzz ? 'text-slate-600 hover:text-slate-900' : 'text-gray-300 hover:text-white'}`}
                                                        >
                                                            {row}
                                                        </div>
                                                    )}

                                                    {/* Remove Button */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemoveRow(index);
                                                        }}
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500 text-red-400 hover:text-white rounded"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className={`flex items-center justify-center h-full text-sm ${isFundBuzz ? 'text-slate-400' : 'text-gray-500'}`}>
                                        No layout rows. Click "Reset Layout" to restore.
                                    </div>
                                )}
                            </div>

                            {/* AI Focus Textarea */}
                            <div className="mb-6">
                                <textarea
                                    value={aiFocus}
                                    onChange={(e) => setAiFocus(e.target.value)}
                                    placeholder="What should the AI focus on?"
                                    rows={3}
                                    className={`w-full border rounded-lg px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${isFundBuzz ? 'bg-white border-slate-200 text-slate-900 placeholder-slate-400' : 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                                        }`}
                                />
                            </div>

                            {/* Suggested Boosts Section */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className={`text-sm font-medium ${isFundBuzz ? 'text-slate-500' : 'text-gray-400'}`}>Suggested Boosts</h4>
                                    <button
                                        onClick={() => setIsAddingCustomPrompt(true)}
                                        className="p-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors text-white shadow-sm"
                                        title="Add Custom Prompt"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="max-h-[240px] overflow-y-auto space-y-2 pr-1 scrollbar-hide">
                                    {/* Add Custom Prompt Input */}
                                    {isAddingCustomPrompt && (
                                        <div className={`flex items-center gap-2 p-3 border rounded-lg ${isFundBuzz ? 'bg-white border-blue-500' : 'bg-white/5 border-blue-500'}`}>
                                            <input
                                                type="text"
                                                value={customPromptInput}
                                                onChange={(e) => setCustomPromptInput(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleAddCustomPrompt();
                                                    } else if (e.key === 'Escape') {
                                                        setIsAddingCustomPrompt(false);
                                                        setCustomPromptInput('');
                                                    }
                                                }}
                                                placeholder="Enter your custom prompt..."
                                                className={`flex-1 bg-transparent text-xs placeholder-gray-500 focus:outline-none ${isFundBuzz ? 'text-slate-900' : 'text-white'}`}
                                                autoFocus
                                            />
                                            <button
                                                onClick={handleAddCustomPrompt}
                                                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setIsAddingCustomPrompt(false);
                                                    setCustomPromptInput('');
                                                }}
                                                className={`px-2 py-1 text-xs rounded transition-colors ${isFundBuzz ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' : 'bg-gray-600 hover:bg-gray-500 text-white'}`}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}

                                    {/* Custom Prompts (User Added) */}
                                    {customPrompts.map((prompt, index) => (
                                        <div
                                            key={`custom-${index}`}
                                            className={`flex items-center gap-2 p-3 rounded-lg border transition-all cursor-pointer ${selectedBoosts.includes(prompt)
                                                ? (isFundBuzz ? 'bg-blue-50 border-blue-600' : 'bg-blue-600/20 border-blue-500')
                                                : (isFundBuzz ? 'bg-white border-slate-100 hover:bg-slate-50' : 'bg-white/5 border-white/10 hover:bg-white/10')
                                                }`}
                                            onClick={() => toggleBoost(prompt)}
                                        >
                                            <div className={`w-2 h-2 rounded-full shrink-0 ${selectedBoosts.includes(prompt) ? 'bg-blue-500' : 'bg-gray-300'}`} />
                                            <span className={`text-xs flex-1 ${isFundBuzz ? 'text-slate-700' : 'text-gray-300'}`}>{prompt}</span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteCustomPrompt(index);
                                                }}
                                                className="p-1 hover:bg-red-500 text-red-400 hover:text-white rounded transition-colors"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}

                                    {/* Predefined Boosts */}
                                    {[
                                        'Summarize the core points.',
                                        'Highlight the strongest insights.',
                                        'Clarify common misunderstandings.',
                                        'Provide practical takeaways.',
                                        'Compare the key ideas.',
                                        'Write a short explainer.'
                                    ].map((boost) => (
                                        <div
                                            key={boost}
                                            onClick={() => toggleBoost(boost)}
                                            className={`flex items-center gap-2 p-3 rounded-lg border transition-all cursor-pointer ${selectedBoosts.includes(boost)
                                                ? (isFundBuzz ? 'bg-blue-50 border-blue-600' : 'bg-blue-600/20 border-blue-500')
                                                : (isFundBuzz ? 'bg-white border-slate-100 hover:bg-slate-50' : 'bg-white/5 border-white/10 hover:bg-white/10')
                                                }`}
                                        >
                                            <div className={`w-2 h-2 rounded-full shrink-0 ${selectedBoosts.includes(boost) ? 'bg-blue-500' : 'bg-gray-300'}`} />
                                            <span className={`text-xs ${isFundBuzz ? 'text-slate-700' : 'text-gray-300'}`}>{boost}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer with Generate Button */}
                    <div className={`border-t px-8 py-5 flex justify-end ${isFundBuzz ? 'bg-slate-50 border-slate-200' : 'bg-[#0f0f0f] border-white/10'}`}>
                        <button
                            onClick={() => {
                                if (onGenerate) {
                                    onGenerate(selectedFormat, selectedFormat, layoutRows, aiFocus, selectedBoosts, contextSource);
                                    onClose();
                                }
                            }}
                            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-lg shadow-blue-600/20"
                        >
                            Generate
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

