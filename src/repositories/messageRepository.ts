import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export const messageRepository = {
  async create(data: {
    chatId: string;
    role: string;
    content: string;
    groundingMetadata?: Record<string, unknown> | null;
  }) {
    return prisma.message.create({
      data: {
        chatId: data.chatId,
        role: data.role,
        content: data.content,
        groundingMetadata: data.groundingMetadata
          ? (data.groundingMetadata as Prisma.InputJsonValue)
          : undefined,
      },
    });
  },

  async findByChatId(chatId: string) {
    return prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
    });
  },
};
