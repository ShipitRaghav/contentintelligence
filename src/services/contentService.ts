import { contentRepository } from '@/repositories/contentRepository';
import {
  contentDiaflowAgent,
  type ContentGenerationType,
} from '@/ai-agents/contentDiaflowAgent';
import {
  buildTextPrompt,
  buildImagePrompt,
  buildNoteTitlePrompt,
  type TextPromptInput,
  type ImagePromptInput,
} from '@/ai-agents/promptBuilder';
import type { GeneratedContent } from '@/types/project';
import { GoogleGenAI } from '@google/genai';

function toContent(record: {
  id: string;
  title: string;
  type: string;
  format: string | null;
  content: string | null;
  complianceStatus: string;
  assignee: string | null;
  createdAt: Date;
  url?: string | null;
  sourceId?: string | null;
  diaflowSessionId?: string | null;
  processingStatus?: string;
}): GeneratedContent {
  return {
    id: record.id,
    title: record.title,
    type: record.type as GeneratedContent['type'],
    format: record.format ?? undefined,
    content: record.content ?? undefined,
    url: record.url ?? null,
    complianceStatus:
      record.complianceStatus as GeneratedContent['complianceStatus'],
    assignee: record.assignee ?? undefined,
    createdAt: record.createdAt,
    isLoading: record.processingStatus === 'processing',
    processingStatus: record.processingStatus,
    sourceId: record.sourceId ?? null,
  };
}

async function generateNoteTitle(content: string): Promise<string> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return 'Research Note';

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: buildNoteTitlePrompt(content),
    });

    const title = response.text?.trim();
    return title && title.length > 0 ? title : 'Research Note';
  } catch (error) {
    console.error('Title generation failed, using default:', error);
    return 'Research Note';
  }
}

export const contentService = {
  // --- Queries ---

  async listByProject(projectId: string): Promise<GeneratedContent[]> {
    const records = await contentRepository.findByProjectId(projectId);
    return records.map(toContent);
  },

  async listBySource(sourceId: string): Promise<GeneratedContent[]> {
    const records = await contentRepository.findBySourceId(sourceId);
    return records.map(toContent);
  },

  async getById(contentId: string): Promise<GeneratedContent | null> {
    const record = await contentRepository.findById(contentId);
    return record ? toContent(record) : null;
  },

  // --- Mutations ---

  async updateContent(
    contentId: string,
    updates: { title?: string; complianceStatus?: string; assignee?: string },
  ): Promise<GeneratedContent> {
    const record = await contentRepository.update(contentId, updates);
    return toContent(record);
  },

  async deleteContent(contentId: string): Promise<void> {
    await contentRepository.delete(contentId);
  },

  // --- Path A: Save to Note ---

  async saveNote(
    projectId: string,
    content: string,
    sourceId?: string,
  ): Promise<GeneratedContent> {
    const title = await generateNoteTitle(content);

    const record = await contentRepository.create({
      projectId,
      title,
      type: 'note',
      content,
      sourceId,
      processingStatus: 'completed',
    });

    return toContent(record);
  },

  // --- Path B: Text Content Generation ---

  async generateText(
    projectId: string,
    promptInput: TextPromptInput,
    sourceId?: string,
  ): Promise<GeneratedContent> {
    const prompt = buildTextPrompt(promptInput);
    const title = promptInput.focus
      ? promptInput.focus.charAt(0).toUpperCase() +
        promptInput.focus.slice(1, 40)
      : (promptInput.sourceContext?.title?.slice(0, 40) ?? 'Text Content');

    try {
      const { sessionId } = await contentDiaflowAgent.startGeneration(
        'text',
        prompt,
      );

      const record = await contentRepository.create({
        projectId,
        title,
        type: 'text',
        format: promptInput.format,
        sourceId,
        diaflowSessionId: sessionId,
        processingStatus: 'processing',
      });

      return toContent(record);
    } catch (error) {
      console.error('Failed to start text generation:', error);

      const record = await contentRepository.create({
        projectId,
        title,
        type: 'text',
        format: promptInput.format,
        sourceId,
        processingStatus: 'failed',
      });

      return toContent(record);
    }
  },

  // --- Path C: Image Content Generation ---

  async generateImage(
    projectId: string,
    promptInput: ImagePromptInput,
    sourceId?: string,
  ): Promise<GeneratedContent> {
    const prompt = buildImagePrompt(promptInput);
    const title =
      promptInput.prompt?.slice(0, 40) || `${promptInput.format} Image`;

    try {
      const { sessionId } = await contentDiaflowAgent.startGeneration(
        'image',
        prompt,
      );

      const record = await contentRepository.create({
        projectId,
        title,
        type: 'image',
        format: promptInput.style,
        sourceId,
        diaflowSessionId: sessionId,
        processingStatus: 'processing',
      });

      return toContent(record);
    } catch (error) {
      console.error('Failed to start image generation:', error);

      const record = await contentRepository.create({
        projectId,
        title,
        type: 'image',
        format: promptInput.style,
        sourceId,
        processingStatus: 'failed',
      });

      return toContent(record);
    }
  },

  // --- Polling ---

  async checkProcessingStatus(
    contentId: string,
  ): Promise<GeneratedContent> {
    const record = await contentRepository.findById(contentId);
    if (!record) throw new Error('Content not found');

    if (!record.diaflowSessionId || record.processingStatus !== 'processing') {
      return toContent(record);
    }

    const contentType: ContentGenerationType =
      record.type === 'image' ? 'image' : 'text';

    const result = await contentDiaflowAgent.checkStatus(
      contentType,
      record.diaflowSessionId,
    );

    if (result.status === 'completed') {
      // For images: download binary from CDN and store in DB
      if (contentType === 'image' && result.imagePath) {
        try {
          const { data, mimeType } = await contentDiaflowAgent.downloadImageFromPath(result.imagePath);
          const updated = await contentRepository.update(contentId, {
            processingStatus: 'completed',
            imageData: data,
            imageMimeType: mimeType,
            url: `/api/content/${contentId}/image`,
          });
          return toContent(updated);
        } catch (downloadErr) {
          console.error('Failed to download image from CDN:', downloadErr);
          const updated = await contentRepository.update(contentId, {
            processingStatus: 'failed',
          });
          return toContent(updated);
        }
      }

      const updated = await contentRepository.update(contentId, {
        processingStatus: 'completed',
        content: result.content ?? undefined,
        url: result.url ?? undefined,
      });
      return toContent(updated);
    }

    if (result.status === 'failed') {
      const updated = await contentRepository.update(contentId, {
        processingStatus: 'failed',
      });
      return toContent(updated);
    }

    return toContent(record);
  },
};
