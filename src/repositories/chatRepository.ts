import { prisma } from '@/lib/prisma';

export const chatRepository = {
  async create(projectId: string, title?: string) {
    return prisma.chat.create({
      data: {
        projectId,
        title: title || 'New Chat',
      },
    });
  },

  async findById(chatId: string) {
    return prisma.chat.findUnique({
      where: { id: chatId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
  },

  async findByProjectId(projectId: string) {
    return prisma.chat.findMany({
      where: { projectId },
      orderBy: { updatedAt: 'desc' },
    });
  },

  async updateTitle(chatId: string, title: string) {
    return prisma.chat.update({
      where: { id: chatId },
      data: { title },
    });
  },

  async delete(chatId: string) {
    return prisma.chat.delete({ where: { id: chatId } });
  },
};
