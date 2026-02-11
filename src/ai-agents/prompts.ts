/**
 * Central place for all AI prompt templates.
 */

export function generateTitlePrompt(url: string): string {
  return `Given the following URL, generate a concise, descriptive title for the content it points to. The title should be human-readable, properly capitalized, and no longer than 80 characters. Return ONLY the title text with no quotes, no explanation, and no extra formatting.

URL: ${url}`;
}

export function suggestedQuestionsPrompt(summary: string): string {
  return `Given the following source summary, generate exactly 3 specific, one-line max 100 characters, insightful questions that a marketing professional or researcher might ask about this content. The questions should help them extract actionable insights for content creation.

Return your response as a JSON array of 3 strings. Example: ["Question 1?", "Question 2?", "Question 3?"]

Source Summary:
${summary}`;
}

export function chatContextPrompt(question: string, sourceContext: string, history: { role: string; content: string }[]): string {
  const historyText = history.length > 0
    ? `\n\nConversation so far:\n${history.map(m => `${m.role}: ${m.content}`).join('\n')}`
    : '';

  return `You are a research assistant helping analyze sources for marketing content creation. Be concise, insightful, and actionable. Use markdown formatting for readability.

Source Context:
${sourceContext}
${historyText}

User Question: ${question}`;
}

export function trendingGroundingPrompt(summary: string): string {
  return `Based on the following research summary, find the most relevant trending news, market movements, and industry developments that relate to these topics. Provide 3-5 key trending insights with real sources.

Format your response with markdown headers and bullet points. Include specific data points and link to sources where possible.

Research Summary:
${summary}`;
}
