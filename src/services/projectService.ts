import { projectRepository } from '@/repositories/projectRepository';
import type { Source } from '@/types/source';
import type { ProjectMetadata } from '@/types/project';

export const projectService = {
  async listProjects(): Promise<ProjectMetadata[]> {
    const projects = await projectRepository.findAll();
    return projects.map((p) => ({
      id: p.id,
      title: p.title,
      updatedAt: p.updatedAt.getTime(),
      sourceCount: p._count.sources,
    }));
  },

  async getProject(id: string) {
    const project = await projectRepository.findById(id);
    if (!project) return null;

    const sources: Source[] = project.sources.map((s) => ({
      id: s.id,
      type: s.type as Source['type'],
      url: s.url ?? undefined,
      title: s.title,
      authors: s.authors,
      year: s.year,
      content: s.content ?? undefined,
      transcript: s.transcript ?? undefined,
      summary: s.summary ?? undefined,
      processingStatus: s.processingStatus as Source['processingStatus'],
      metadata: (s.metadata as Record<string, unknown>) || {},
      createdAt: s.createdAt,
    }));

    return {
      id: project.id,
      title: project.title,
      createdAt: project.createdAt.getTime(),
      updatedAt: project.updatedAt.getTime(),
      searchQuery: project.searchQuery,
      sources,
      summaryData: project.summaryData,
      generatedContent: project.generatedContent.map((c) => ({
        id: c.id,
        title: c.title,
        type: c.type,
        format: c.format,
        content: c.content,
        url: c.url ?? null,
        complianceStatus: c.complianceStatus,
        assignee: c.assignee,
        createdAt: c.createdAt,
        isLoading: c.processingStatus === 'processing',
        processingStatus: c.processingStatus,
        sourceId: c.sourceId ?? null,
      })),
    };
  },

  async createProject() {
    const project = await projectRepository.create();
    return {
      id: project.id,
      title: project.title,
      createdAt: project.createdAt.getTime(),
      updatedAt: project.updatedAt.getTime(),
      searchQuery: project.searchQuery,
      sources: [],
      summaryData: project.summaryData,
      generatedContent: [],
    };
  },

  async updateProject(id: string, body: {
    title?: string;
    searchQuery?: string;
    summaryData?: unknown;
  }) {
    await projectRepository.update(id, {
      title: body.title,
      searchQuery: body.searchQuery,
      summaryData: body.summaryData,
    });

    // Sources and content are managed via their own APIs.
  },

  async deleteProject(id: string) {
    await projectRepository.delete(id);
  },
};
