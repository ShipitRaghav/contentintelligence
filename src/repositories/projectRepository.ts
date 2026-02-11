import { prisma } from '@/lib/prisma';

export const projectRepository = {
  async findAll() {
    return prisma.project.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: { select: { sources: true } },
      },
    });
  },

  async findById(id: string) {
    return prisma.project.findUnique({
      where: { id },
      include: {
        sources: { orderBy: { createdAt: 'desc' } },
        generatedContent: { orderBy: { createdAt: 'desc' } },
      },
    });
  },

  async create() {
    return prisma.project.create({
      data: { title: 'Untitled Project' },
      include: {
        sources: true,
        generatedContent: true,
      },
    });
  },

  async update(id: string, data: { title?: string; searchQuery?: string; summaryData?: unknown }) {
    return prisma.project.update({
      where: { id },
      data: {
        title: data.title,
        searchQuery: data.searchQuery,
        summaryData: data.summaryData ?? undefined,
      },
    });
  },

  async delete(id: string) {
    return prisma.project.delete({ where: { id } });
  },
};
