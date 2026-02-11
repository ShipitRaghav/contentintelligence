import { prisma } from '@/lib/prisma';

// Select all fields except imageData for list/detail queries
const contentFieldsWithoutImage = {
  id: true,
  title: true,
  type: true,
  format: true,
  content: true,
  url: true,
  complianceStatus: true,
  assignee: true,
  createdAt: true,
  sourceId: true,
  diaflowSessionId: true,
  processingStatus: true,
  projectId: true,
  imageMimeType: true,
} as const;

export const contentRepository = {
  async findByProjectId(projectId: string) {
    return prisma.generatedContent.findMany({
      where: { projectId, processingStatus: { not: 'failed' } },
      orderBy: { createdAt: 'desc' },
      select: contentFieldsWithoutImage,
    });
  },

  async findBySourceId(sourceId: string) {
    return prisma.generatedContent.findMany({
      where: { sourceId, processingStatus: { not: 'failed' } },
      orderBy: { createdAt: 'desc' },
      select: contentFieldsWithoutImage,
    });
  },

  async findById(id: string) {
    return prisma.generatedContent.findUnique({
      where: { id },
      select: contentFieldsWithoutImage,
    });
  },

  async findImageData(id: string) {
    return prisma.generatedContent.findUnique({
      where: { id },
      select: { imageData: true, imageMimeType: true },
    });
  },

  async create(data: {
    projectId: string;
    title: string;
    type: string;
    format?: string;
    content?: string;
    complianceStatus?: string;
    assignee?: string;
    sourceId?: string;
    url?: string;
    diaflowSessionId?: string;
    processingStatus?: string;
  }) {
    return prisma.generatedContent.create({
      data: {
        projectId: data.projectId,
        title: data.title,
        type: data.type,
        format: data.format,
        content: data.content,
        url: data.url,
        complianceStatus: data.complianceStatus || 'Draft',
        assignee: data.assignee,
        sourceId: data.sourceId,
        diaflowSessionId: data.diaflowSessionId,
        processingStatus: data.processingStatus || 'completed',
      },
      select: contentFieldsWithoutImage,
    });
  },

  async update(
    id: string,
    data: Partial<{
      title: string;
      content: string;
      url: string;
      complianceStatus: string;
      assignee: string;
      processingStatus: string;
      diaflowSessionId: string;
      imageData: Uint8Array<ArrayBuffer>;
      imageMimeType: string;
    }>,
  ) {
    return prisma.generatedContent.update({
      where: { id },
      data,
      select: contentFieldsWithoutImage,
    });
  },

  async delete(id: string) {
    return prisma.generatedContent.delete({ where: { id } });
  },

  async deleteByProjectId(projectId: string) {
    return prisma.generatedContent.deleteMany({ where: { projectId } });
  },
};
