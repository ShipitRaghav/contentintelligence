import { sourceRepository } from '@/repositories/sourceRepository';
import { diaflowAgent } from '@/ai-agents/diaflowAgent';
import { geminiAgent } from '@/ai-agents/geminiAgent';
import { SourceType } from '@/types/source';
import type { Source } from '@/types/source';

export const sourceService = {
  /**
   * Add a source to a project and optionally start Diaflow processing.
   */
  async addSource(projectId: string, input: {
    type: SourceType;
    url?: string;
    title: string;
    authors?: string;
    year?: number;
    content?: string;
    metadata?: Record<string, unknown>;
  }): Promise<Source> {
    // Generate a descriptive title using Gemini if a URL is provided
    let title = input.title;
    if (input.url) {
      try {
        title = await geminiAgent.generateTitle(input.url);
      } catch (error) {
        console.error('Gemini title generation failed, using client-provided title:', error);
      }
    }

    // Create the source record
    const source = await sourceRepository.create({
      projectId,
      type: input.type,
      url: input.url,
      title,
      authors: input.authors,
      year: input.year,
      content: input.content,
      metadata: input.metadata,
    });

    // If there's a URL, start Diaflow transcribe flow
    if (input.url) {
      try {
        const { sessionId } = await diaflowAgent.startTranscribeFlow(input.url, input.type);
        await sourceRepository.update(source.id, {
          diaflowSessionId: sessionId,
          processingStatus: 'processing',
        });

        return this.toSource({ ...source, diaflowSessionId: sessionId, processingStatus: 'processing' });
      } catch (error) {
        console.error('Failed to start Diaflow processing:', error);
        await sourceRepository.update(source.id, { processingStatus: 'failed' });
        return this.toSource({ ...source, processingStatus: 'failed' });
      }
    }

    return this.toSource(source);
  },

  /**
   * Check and update the processing status of a source.
   */
  async checkProcessingStatus(sourceId: string): Promise<Source> {
    const source = await sourceRepository.findById(sourceId);
    if (!source) throw new Error('Source not found');

    if (!source.diaflowSessionId || source.processingStatus === 'completed') {
      return this.toSource(source);
    }

    const result = await diaflowAgent.checkFlowStatus(source.diaflowSessionId, source.type as SourceType);

    if (result.status === 'completed') {
      const updateData: Record<string, string> = { processingStatus: 'completed' };
      if (result.transcript) updateData.transcript = result.transcript;
      if (result.summary) updateData.summary = result.summary;

      await sourceRepository.update(sourceId, updateData);
      return this.toSource({
        ...source,
        transcript: result.transcript ?? source.transcript,
        summary: result.summary ?? source.summary,
        processingStatus: 'completed',
      });
    }

    if (result.status === 'failed') {
      await sourceRepository.update(sourceId, { processingStatus: 'failed' });
      return this.toSource({ ...source, processingStatus: 'failed' });
    }

    return this.toSource(source);
  },

  /**
   * List all sources for a project.
   */
  async listSources(projectId: string): Promise<Source[]> {
    const sources = await sourceRepository.findByProjectId(projectId);
    return sources.map(this.toSource);
  },

  /**
   * Transform a Prisma source record to the frontend Source type.
   */
  toSource(record: {
    id: string;
    type: string;
    url: string | null;
    title: string;
    authors: string;
    year: number;
    content: string | null;
    transcript: string | null;
    summary: string | null;
    diaflowSessionId?: string | null;
    processingStatus: string;
    metadata: unknown;
    createdAt: Date;
  }): Source {
    return {
      id: record.id,
      type: record.type as Source['type'],
      url: record.url ?? undefined,
      title: record.title,
      authors: record.authors,
      year: record.year,
      content: record.content ?? undefined,
      transcript: record.transcript ?? undefined,
      summary: record.summary ?? undefined,
      processingStatus: record.processingStatus as Source['processingStatus'],
      metadata: (record.metadata as Record<string, unknown>) || {},
      createdAt: record.createdAt,
    };
  },
};
