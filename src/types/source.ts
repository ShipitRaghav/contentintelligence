export enum SourceType {
  Video = 'video',
  Audio = 'audio',
  Document = 'document',
}

/** Labels for rendering in UI dropdowns / display */
export const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  [SourceType.Video]: 'Video',
  [SourceType.Audio]: 'Audio',
  [SourceType.Document]: 'Document',
};

export interface Source {
  id: string;
  type: SourceType;
  url?: string;
  title: string;
  authors: string;
  year: number;
  content?: string;
  transcript?: string;
  summary?: string;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface SummaryData {
  title: string;
  summary: string;
  questions: string[];
}
