import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export const sourceRepository = {
  async findByProjectId(projectId: string) {
    return prisma.source.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  },

  async findById(id: string) {
    return prisma.source.findUnique({ where: { id } });
  },

  async create(data: {
    projectId: string;
    type: string;
    url?: string;
    title: string;
    authors?: string;
    year?: number;
    content?: string;
    metadata?: Record<string, unknown>;
  }) {
    return prisma.source.create({
      data: {
        projectId: data.projectId,
        type: data.type,
        url: data.url,
        title: data.title,
        authors: data.authors || '',
        year: data.year || new Date().getFullYear(),
        content: data.content,
        metadata: (data.metadata || {}) as Prisma.InputJsonValue,
        processingStatus: 'pending',
      },
    });
  },

  async update(id: string, data: Partial<{
    title: string;
    transcript: string;
    summary: string;
    diaflowSessionId: string;
    processingStatus: string;
    content: string;
    metadata: Record<string, unknown>;
  }>) {
    const updateData: Record<string, unknown> = { ...data };
    if (data.metadata) {
      updateData.metadata = data.metadata as unknown as Prisma.InputJsonValue;
    }
    return prisma.source.update({
      where: { id },
      data: updateData,
    });
  },

  async delete(id: string) {
    return prisma.source.delete({ where: { id } });
  },

  async deleteByProjectId(projectId: string) {
    return prisma.source.deleteMany({ where: { projectId } });
  },

  async createMany(projectId: string, sources: Array<{
    id?: string;
    type: string;
    url?: string;
    title: string;
    authors?: string;
    year?: number;
    content?: string;
    transcript?: string;
    summary?: string;
    processingStatus?: string;
    metadata?: Record<string, unknown>;
  }>) {
    return prisma.source.createMany({
      data: sources.map((s) => ({
        id: s.id,
        projectId,
        type: s.type,
        url: s.url,
        title: s.title,
        authors: s.authors || '',
        year: s.year || new Date().getFullYear(),
        content: s.content,
        transcript: s.transcript,
        summary: s.summary,
        processingStatus: s.processingStatus || 'pending',
        metadata: (s.metadata || {}) as Prisma.InputJsonValue,
      })),
    });
  },
};
