import { GoogleGenAI } from '@google/genai';
import { suggestedQuestionsPrompt, chatContextPrompt, trendingGroundingPrompt } from './prompts';
import type { GroundingMetadata } from '@/types/chat';

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }
  return new GoogleGenAI({ apiKey });
}

export const geminiChatAgent = {
  /**
   * Generate 3 suggested questions based on a source summary.
   */
  async generateSuggestedQuestions(summary: string): Promise<string[]> {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: suggestedQuestionsPrompt(summary),
      config: {
        responseMimeType: 'application/json',
      },
    });

    try {
      const text = response.text ?? '[]';
      const questions = JSON.parse(text);
      if (Array.isArray(questions)) return questions.slice(0, 3);
      return [];
    } catch {
      return [];
    }
  },

  /**
   * Send a chat message with source context and conversation history.
   */
  async chat(
    message: string,
    sourceContext: string,
    history: { role: string; content: string }[]
  ): Promise<string> {
    const ai = getClient();
    const prompt = chatContextPrompt(message, sourceContext, history);
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text ?? 'I could not generate a response. Please try again.';
  },

  /**
   * Get trending insights using Gemini with Google Search grounding.
   */
  async trendingWithGrounding(
    summary: string
  ): Promise<{ content: string; groundingMetadata: GroundingMetadata | null }> {
    const ai = getClient();
    const prompt = trendingGroundingPrompt(summary);
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const content = response.text ?? 'Could not retrieve trending insights.';

    // Extract grounding metadata from the response
    const candidate = response.candidates?.[0];
    const rawGrounding = candidate?.groundingMetadata;

    let groundingMetadata: GroundingMetadata | null = null;
    if (rawGrounding) {
      groundingMetadata = {
        groundingChunks: rawGrounding.groundingChunks?.map((chunk) => ({
          web: chunk.web ? {
            uri: chunk.web.uri ?? '',
            title: chunk.web.title ?? '',
          } : undefined,
        })) ?? [],
        webSearchQueries: (rawGrounding.webSearchQueries as string[]) ?? [],
      };
    }

    return { content, groundingMetadata };
  },
};
