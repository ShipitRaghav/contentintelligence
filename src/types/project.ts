import type { Source, SummaryData } from './source';

export interface GeneratedContent {
    id: string;
    title: string;
    type: 'text' | 'image' | 'audio' | 'video' | 'note';
    format?: string;
    content?: string;
    url?: string | null;
    createdAt: Date;
    isLoading: boolean;
    processingStatus?: string;
    complianceStatus?: 'Draft' | 'Pending Review' | 'Approved';
    assignee?: string;
    sourceId?: string | null;
}

export interface Project {
    id: string;
    title: string;
    createdAt: number;
    updatedAt: number;
    searchQuery: string;
    sources: Source[];
    summaryData: SummaryData | null;
    generatedContent: GeneratedContent[];
}

export interface ProjectMetadata {
    id: string;
    title: string;
    updatedAt: number;
    sourceCount: number;
}
