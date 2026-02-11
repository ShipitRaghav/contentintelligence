import { chatRepository } from '@/repositories/chatRepository';
import { messageRepository } from '@/repositories/messageRepository';
import { geminiChatAgent } from '@/ai-agents/geminiChatAgent';
import type { Chat, ChatMessage, ChatWithMessages, GroundingMetadata } from '@/types/chat';

export const chatService = {
  async createChat(projectId: string, title?: string): Promise<Chat> {
    const chat = await chatRepository.create(projectId, title);
    return this.toChat(chat);
  },

  async getChat(chatId: string): Promise<ChatWithMessages | null> {
    const chat = await chatRepository.findById(chatId);
    if (!chat) return null;
    return {
      ...this.toChat(chat),
      messages: chat.messages.map(this.toMessage),
    };
  },

  async listChats(projectId: string): Promise<Chat[]> {
    const chats = await chatRepository.findByProjectId(projectId);
    return chats.map(this.toChat);
  },

  async deleteChat(chatId: string): Promise<void> {
    await chatRepository.delete(chatId);
  },

  async sendMessage(
    chatId: string,
    userMessage: string,
    sourceContext?: string
  ): Promise<ChatMessage> {
    // Save user message
    await messageRepository.create({
      chatId,
      role: 'user',
      content: userMessage,
    });

    // Get conversation history for context
    const allMessages = await messageRepository.findByChatId(chatId);
    const history = allMessages.map((m) => ({ role: m.role, content: m.content }));

    // Call Gemini
    const aiResponse = await geminiChatAgent.chat(
      userMessage,
      sourceContext || '',
      history
    );

    // Save AI response
    const aiMessage = await messageRepository.create({
      chatId,
      role: 'assistant',
      content: aiResponse,
    });

    return this.toMessage(aiMessage);
  },

  async getSuggestedQuestions(summary: string): Promise<string[]> {
    return geminiChatAgent.generateSuggestedQuestions(summary);
  },

  async getTrendingInsights(
    chatId: string,
    summary: string
  ): Promise<ChatMessage> {
    // Save user message for the trending request
    await messageRepository.create({
      chatId,
      role: 'user',
      content: 'Trending now',
    });

    // Call Gemini with grounding
    const result = await geminiChatAgent.trendingWithGrounding(summary);

    // Save AI response with grounding metadata
    const aiMessage = await messageRepository.create({
      chatId,
      role: 'assistant',
      content: result.content,
      groundingMetadata: result.groundingMetadata as unknown as Record<string, unknown> | null,
    });

    return this.toMessage(aiMessage);
  },

  toChat(record: {
    id: string;
    projectId: string;
    title: string;
    createdAt: Date;
    updatedAt: Date;
  }): Chat {
    return {
      id: record.id,
      projectId: record.projectId,
      title: record.title,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  },

  toMessage(record: {
    id: string;
    chatId: string;
    role: string;
    content: string;
    groundingMetadata: unknown;
    createdAt: Date;
  }): ChatMessage {
    return {
      id: record.id,
      chatId: record.chatId,
      role: record.role as ChatMessage['role'],
      content: record.content,
      groundingMetadata: (record.groundingMetadata as GroundingMetadata) ?? null,
      createdAt: record.createdAt,
    };
  },
};
