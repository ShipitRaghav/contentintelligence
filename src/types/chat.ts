export interface Chat {
  id: string;
  projectId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  groundingMetadata?: GroundingMetadata | null;
  createdAt: Date;
}

export interface ChatWithMessages extends Chat {
  messages: ChatMessage[];
}

export interface GroundingMetadata {
  groundingChunks?: { web?: { uri: string; title: string } }[];
  webSearchQueries?: string[];
}
