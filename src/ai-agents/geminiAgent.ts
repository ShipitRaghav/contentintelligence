import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateTitlePrompt } from './prompts';

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }
  return new GoogleGenerativeAI(apiKey);
}

export const geminiAgent = {
  /**
   * Generate a descriptive title for a given URL using Gemini.
   */
  async generateTitle(url: string): Promise<string> {
    const genAI = getClient();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const prompt = generateTitlePrompt(url);
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    return text;
  },
};
