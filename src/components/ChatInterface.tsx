import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Bookmark, ArrowRight, LayoutTemplate, TrendingUp, User, Bot, ExternalLink, FileText, Youtube, Mic, X } from 'lucide-react';
import { useProduct } from '@/lib/productContext';
import ReactMarkdown from 'react-markdown';
import type { Source } from '@/types/source';
import type { Chat, ChatMessage, ChatWithMessages, GroundingMetadata } from '@/types/chat';
import {
    createChat,
    getChat,
    sendChatMessage,
    getSuggestedQuestions,
    getTrendingInsights,
} from '@/lib/projectStorage';

interface ChatInterfaceProps {
    projectId: string;
    selectedSource: Source | null;
    onSaveToNote: (content: string) => void;
    currentChat: ChatWithMessages | null;
    onChatCreated: (chat: ChatWithMessages) => void;
    onMessagesUpdated: (messages: ChatMessage[]) => void;
}

export default function ChatInterface({
    projectId,
    selectedSource,
    onSaveToNote,
    currentChat,
    onChatCreated,
    onMessagesUpdated,
}: ChatInterfaceProps) {
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
    const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
    const [showSourceDetail, setShowSourceDetail] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { currentProduct } = useProduct();
    const isFundBuzz = currentProduct === 'fundbuzz';

    const messages = currentChat?.messages ?? [];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    // Load suggested questions when source changes
    useEffect(() => {
        if (!selectedSource?.id || !selectedSource.summary) {
            setSuggestedQuestions([]);
            return;
        }

        let cancelled = false;
        setIsLoadingQuestions(true);

        getSuggestedQuestions(projectId, selectedSource.id)
            .then((questions) => {
                if (!cancelled) setSuggestedQuestions(questions);
            })
            .catch(() => {
                if (!cancelled) setSuggestedQuestions([]);
            })
            .finally(() => {
                if (!cancelled) setIsLoadingQuestions(false);
            });

        return () => { cancelled = true; };
    }, [projectId, selectedSource?.id, selectedSource?.summary]);

    const getSourceContext = useCallback(() => {
        if (!selectedSource) return '';
        const parts = [`Title: ${selectedSource.title}`];
        if (selectedSource.authors) parts.push(`Authors: ${selectedSource.authors}`);
        if (selectedSource.summary) parts.push(`Summary: ${selectedSource.summary}`);
        else if (selectedSource.content) parts.push(`Content: ${selectedSource.content.slice(0, 2000)}`);
        return parts.join('\n');
    }, [selectedSource]);

    const ensureChat = useCallback(async (): Promise<ChatWithMessages> => {
        if (currentChat) return currentChat;
        const newChat = await createChat(projectId);
        const fullChat: ChatWithMessages = { ...newChat, messages: [] };
        onChatCreated(fullChat);
        return fullChat;
    }, [currentChat, projectId, onChatCreated]);

    const handleSend = async (text: string) => {
        if (!text.trim() || isTyping) return;

        const chat = await ensureChat();
        const userMsg: ChatMessage = {
            id: `temp-${Date.now()}`,
            chatId: chat.id,
            role: 'user',
            content: text,
            createdAt: new Date(),
        };

        const updatedMessages = [...(chat.messages ?? []), userMsg];
        onMessagesUpdated(updatedMessages);
        setInputValue('');
        setIsTyping(true);

        try {
            const aiMessage = await sendChatMessage(
                projectId,
                chat.id,
                text,
                getSourceContext()
            );
            onMessagesUpdated([...updatedMessages, aiMessage]);
        } catch (error) {
            console.error('Failed to send message:', error);
            const errorMsg: ChatMessage = {
                id: `error-${Date.now()}`,
                chatId: chat.id,
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
                createdAt: new Date(),
            };
            onMessagesUpdated([...updatedMessages, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleTrending = async () => {
        if (isTyping) return;

        const chat = await ensureChat();
        const sourceContext = getSourceContext();
        if (!sourceContext) return;

        const userMsg: ChatMessage = {
            id: `temp-${Date.now()}`,
            chatId: chat.id,
            role: 'user',
            content: 'Trending now',
            createdAt: new Date(),
        };

        const updatedMessages = [...(chat.messages ?? []), userMsg];
        onMessagesUpdated(updatedMessages);
        setIsTyping(true);

        try {
            const aiMessage = await getTrendingInsights(
                projectId,
                chat.id,
                selectedSource?.summary || selectedSource?.content || selectedSource?.title || ''
            );
            onMessagesUpdated([...updatedMessages, aiMessage]);
        } catch (error) {
            console.error('Failed to get trending:', error);
            const errorMsg: ChatMessage = {
                id: `error-${Date.now()}`,
                chatId: chat.id,
                role: 'assistant',
                content: 'Sorry, I could not retrieve trending insights. Please try again.',
                createdAt: new Date(),
            };
            onMessagesUpdated([...updatedMessages, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend(inputValue);
        }
    };

    const sourceIcon = selectedSource?.type === 'video'
        ? <Youtube className="w-4 h-4 text-red-500" />
        : selectedSource?.type === 'audio'
            ? <Mic className="w-4 h-4 text-pink-500" />
            : <FileText className="w-4 h-4 text-purple-500" />;

    // Empty state when no source selected
    if (!selectedSource) {
        return (
            <div className={`flex flex-col h-full items-center justify-center ${isFundBuzz ? 'bg-slate-50' : 'bg-transparent'}`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${isFundBuzz ? 'bg-slate-200' : 'bg-white/10'}`}>
                    <FileText className={`w-6 h-6 ${isFundBuzz ? 'text-slate-400' : 'text-gray-500'}`} />
                </div>
                <p className={`text-sm ${isFundBuzz ? 'text-slate-500' : 'text-gray-400'}`}>
                    Select a source to begin chatting
                </p>
            </div>
        );
    }

    return (
        <div className={`flex flex-col h-full min-h-0 relative ${isFundBuzz ? 'bg-slate-50' : 'bg-transparent'}`}>
            {/* Scrollable Content */}
            <div className="flex-1 min-h-0 overflow-y-auto p-8 pb-44 scrollbar-hide">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-3xl mx-auto space-y-5"
                >
                    {/* Compact Source Card */}
                    <div
                        onClick={() => setShowSourceDetail(true)}
                        className={`rounded-xl p-4 border cursor-pointer transition-all ${isFundBuzz ? 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300' : 'bg-[#1e293b] border-white/10 hover:border-white/20'}`}
                    >
                        <div className="flex items-start gap-3">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${isFundBuzz ? 'bg-slate-100' : 'bg-white/10'}`}>
                                {sourceIcon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className={`font-semibold text-sm leading-tight truncate ${isFundBuzz ? 'text-slate-900' : 'text-white'}`}>
                                    {selectedSource.title}
                                </h3>
                                <p className={`text-xs mt-0.5 ${isFundBuzz ? 'text-slate-500' : 'text-gray-400'}`}>
                                    {[selectedSource.authors, selectedSource.year].filter(Boolean).join(' · ')}
                                </p>
                                {selectedSource.summary && (
                                    <p className={`text-xs mt-2 line-clamp-3 ${isFundBuzz ? 'text-slate-600' : 'text-gray-300'}`}>
                                        {selectedSource.summary.slice(0, 300)}{selectedSource.summary.length > 300 ? '...' : ''}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Source Detail Popup */}
                    <AnimatePresence>
                        {showSourceDetail && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                                onClick={() => setShowSourceDetail(false)}
                            >
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    onClick={(e) => e.stopPropagation()}
                                    className={`w-full max-w-2xl max-h-[80vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col ${isFundBuzz ? 'bg-white' : 'bg-[#1e293b] border border-white/10'}`}
                                >
                                    {/* Header */}
                                    <div className={`flex items-start gap-3 p-6 pb-4 border-b ${isFundBuzz ? 'border-slate-200' : 'border-white/10'}`}>
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isFundBuzz ? 'bg-slate-100' : 'bg-white/10'}`}>
                                            {sourceIcon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className={`font-semibold text-base leading-tight ${isFundBuzz ? 'text-slate-900' : 'text-white'}`}>
                                                {selectedSource.title}
                                            </h3>
                                            <p className={`text-sm mt-1 ${isFundBuzz ? 'text-slate-500' : 'text-gray-400'}`}>
                                                {[selectedSource.authors, selectedSource.year].filter(Boolean).join(' · ')}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setShowSourceDetail(false)}
                                            className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${isFundBuzz ? 'hover:bg-slate-100 text-slate-400' : 'hover:bg-white/10 text-gray-400'}`}
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* Body */}
                                    <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                                        {selectedSource.summary && (
                                            <div className="mb-4">
                                                <h4 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isFundBuzz ? 'text-slate-400' : 'text-gray-500'}`}>
                                                    Summary
                                                </h4>
                                                <p className={`text-sm leading-relaxed ${isFundBuzz ? 'text-slate-700' : 'text-gray-300'}`}>
                                                    {selectedSource.summary}
                                                </p>
                                            </div>
                                        )}
                                        {selectedSource.content && (
                                            <div>
                                                <h4 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isFundBuzz ? 'text-slate-400' : 'text-gray-500'}`}>
                                                    Content
                                                </h4>
                                                <p className={`text-sm leading-relaxed whitespace-pre-wrap ${isFundBuzz ? 'text-slate-700' : 'text-gray-300'}`}>
                                                    {selectedSource.content}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Suggested Questions (only when no messages yet) */}
                    {messages.length === 0 && !isLoadingQuestions && suggestedQuestions.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                            {suggestedQuestions.map((question, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSend(question)}
                                    className={`text-left p-3.5 rounded-xl transition-all group ${index === 2 ? 'md:col-span-2' : ''} ${isFundBuzz
                                        ? 'bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md text-slate-700'
                                        : 'bg-[#1e293b] border border-white/10 hover:bg-white/5 text-gray-300'
                                        }`}
                                >
                                    <p className="text-sm font-medium leading-tight">{question}</p>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Loading questions skeleton */}
                    {messages.length === 0 && isLoadingQuestions && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 animate-pulse">
                            <div className={`h-14 rounded-xl ${isFundBuzz ? 'bg-white border border-slate-100' : 'bg-white/5 border border-white/10'}`} />
                            <div className={`h-14 rounded-xl ${isFundBuzz ? 'bg-white border border-slate-100' : 'bg-white/5 border border-white/10'}`} />
                            <div className={`h-14 rounded-xl md:col-span-2 ${isFundBuzz ? 'bg-white border border-slate-100' : 'bg-white/5 border border-white/10'}`} />
                        </div>
                    )}

                    {/* Chat Messages */}
                    <div className="space-y-4 pt-2">
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-blue-600' : (isFundBuzz ? 'bg-slate-200' : 'bg-pink-500')}`}>
                                    {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className={`w-4 h-4 ${isFundBuzz ? 'text-slate-600' : 'text-white'}`} />}
                                </div>
                                <div className={`flex-1 max-w-[85%] rounded-2xl p-3.5 shadow-sm ${msg.role === 'user'
                                    ? 'bg-blue-600 text-white'
                                    : (isFundBuzz ? 'bg-white border border-slate-200 text-slate-800' : 'bg-[#1e293b] border border-white/10 text-gray-300')
                                    }`}>
                                    <div className={`text-sm leading-relaxed max-w-none ${msg.role === 'user' ? 'text-white' : (isFundBuzz ? 'text-slate-800' : 'text-gray-300')}`}>
                                        <ReactMarkdown
                                            components={{
                                                ul: ({ ...props }) => <ul className="list-disc ml-4 space-y-1 my-2" {...props} />,
                                                li: ({ ...props }) => <li className="text-sm" {...props} />,
                                                p: ({ ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                                h3: ({ ...props }) => <h3 className="text-base font-bold mb-2 mt-4 first:mt-0" {...props} />,
                                                a: ({ ...props }) => (
                                                    <a
                                                        {...props}
                                                        className="text-blue-600 font-semibold hover:underline"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    />
                                                )
                                            }}
                                        >
                                            {msg.content}
                                        </ReactMarkdown>
                                    </div>

                                    {/* Grounding Sources */}
                                    {msg.role === 'assistant' && msg.groundingMetadata?.groundingChunks && msg.groundingMetadata.groundingChunks.length > 0 && (
                                        <div className={`mt-3 pt-3 border-t ${isFundBuzz ? 'border-slate-100' : 'border-white/10'}`}>
                                            <p className={`text-xs font-medium mb-2 ${isFundBuzz ? 'text-slate-500' : 'text-gray-400'}`}>
                                                Sources
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {msg.groundingMetadata.groundingChunks.map((chunk, idx) => (
                                                    chunk.web?.uri && (
                                                        <a
                                                            key={idx}
                                                            href={chunk.web.uri}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-colors ${isFundBuzz
                                                                ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                                                                : 'bg-white/5 text-blue-400 hover:bg-white/10'
                                                                }`}
                                                        >
                                                            <ExternalLink className="w-3 h-3" />
                                                            {chunk.web.title || new URL(chunk.web.uri).hostname}
                                                        </a>
                                                    )
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Save to note button */}
                                    {msg.role === 'assistant' && (
                                        <div className={`mt-3 pt-3 border-t ${isFundBuzz ? 'border-slate-100' : 'border-white/10'} ${msg.groundingMetadata?.groundingChunks?.length ? '' : ''}`}>
                                            <button
                                                onClick={() => onSaveToNote(msg.content)}
                                                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${isFundBuzz ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                                            >
                                                <Bookmark className="w-4 h-4" />
                                                Save to note
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}

                        {/* Typing indicator */}
                        {isTyping && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex gap-3"
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isFundBuzz ? 'bg-slate-200' : 'bg-pink-500'}`}>
                                    <Bot className={`w-4 h-4 ${isFundBuzz ? 'text-slate-600' : 'text-white'}`} />
                                </div>
                                <div className={`rounded-2xl p-3 flex items-center gap-2 ${isFundBuzz ? 'bg-white border border-slate-200 shadow-sm' : 'bg-[#1e293b] border border-white/10'}`}>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </motion.div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </motion.div>
            </div>

            {/* Input Area */}
            <div className={`absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t pointer-events-none z-20 ${isFundBuzz ? 'from-slate-50 via-slate-50/80 to-transparent' : 'from-[#0f172a] via-[#0f172a] to-transparent'}`}>
                <div className="max-w-3xl mx-auto relative px-4 md:px-0 pointer-events-auto">
                    {/* Quick Actions */}
                    <div className="flex items-center gap-3 mb-4 overflow-x-auto scrollbar-hide">
                        <button
                            disabled={isTyping}
                            onClick={() => handleSend('Framing Guidelines')}
                            className={`flex items-center gap-2 px-4 py-2 border rounded-xl transition-all whitespace-nowrap group shadow-sm ${isTyping ? 'opacity-50 cursor-not-allowed' : ''} ${isFundBuzz
                                ? 'bg-purple-600 border-purple-500 hover:bg-purple-700 text-white'
                                : 'bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20 text-purple-200'
                                }`}
                        >
                            <LayoutTemplate className={`w-4 h-4 ${isFundBuzz ? 'text-white' : 'text-purple-400'}`} />
                            <span className="text-sm font-medium">Framing Guidelines</span>
                        </button>
                        <button
                            disabled={isTyping}
                            onClick={handleTrending}
                            className={`flex items-center gap-2 px-4 py-2 border rounded-xl transition-all whitespace-nowrap group shadow-sm ${isTyping ? 'opacity-50 cursor-not-allowed' : ''} ${isFundBuzz
                                ? 'bg-amber-600 border-amber-500 hover:bg-amber-700 text-white'
                                : 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20 text-amber-200'
                                }`}
                        >
                            <TrendingUp className={`w-4 h-4 ${isFundBuzz ? 'text-white' : 'text-amber-400'}`} />
                            <span className="text-sm font-medium">Trending now</span>
                        </button>
                    </div>

                    <div className="relative">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isTyping}
                            placeholder={isTyping ? 'Thinking...' : 'Ask about this source...'}
                            className={`w-full border rounded-2xl py-4 pl-6 pr-16 transition-all shadow-lg ${isFundBuzz
                                ? 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                                : 'bg-[#1e293b] border-white/10 text-white placeholder-gray-500 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50'
                                } ${isTyping ? 'opacity-50' : ''}`}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <button
                                onClick={() => handleSend(inputValue)}
                                disabled={isTyping}
                                className={`p-2 rounded-full transition-colors shadow-sm ${isFundBuzz ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white text-black hover:bg-gray-200'} ${isTyping ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
