export interface TextPromptInput {
  format: string;
  language: string;
  length: string;
  vibe: string;
  audience: string;
  layout: string[];
  focus: string;
  boosts: string[];
  includeCitations: boolean;
  sourceContext?: {
    title: string;
    summary?: string;
    content?: string;
  };
}

export interface ImagePromptInput {
  format: string;
  style: string;
  includeText: boolean;
  prompt: string;
  imageCount: number;
  sourceContext?: {
    title: string;
    summary?: string;
  };
}

export function buildTextPrompt(input: TextPromptInput): string {
  const parts: string[] = [];

  parts.push(`Generate a ${input.format} in ${input.language}.`);
  parts.push(`Target length: ${input.length}.`);

  if (input.vibe) parts.push(`Tone/Vibe: ${input.vibe}.`);
  if (input.audience) parts.push(`Target audience: ${input.audience}.`);

  if (input.layout.length > 0) {
    parts.push(`\nStructure the content as follows:`);
    input.layout.forEach((row, i) => parts.push(`${i + 1}. ${row}`));
  }

  if (input.focus) {
    parts.push(`\nFocus area: ${input.focus}`);
  }

  if (input.boosts.length > 0) {
    parts.push(`\nAdditional instructions:`);
    input.boosts.forEach((b) => parts.push(`- ${b}`));
  }

  if (input.includeCitations) {
    parts.push(`\nInclude citations and references to source material.`);
  }

  if (input.sourceContext) {
    parts.push(`\n--- Source Context ---`);
    parts.push(`Title: ${input.sourceContext.title}`);
    if (input.sourceContext.summary) {
      parts.push(`Summary: ${input.sourceContext.summary}`);
    } else if (input.sourceContext.content) {
      parts.push(`Content: ${input.sourceContext.content}`);
    }
  }

  return parts.join('\n');
}

export function buildImagePrompt(input: ImagePromptInput): string {
  const parts: string[] = [];

  parts.push(`Generate ${input.imageCount} ${input.format} image(s).`);
  parts.push(`Style: ${input.style}.`);
  parts.push(`Include text overlay: ${input.includeText ? 'Yes' : 'No'}.`);

  if (input.prompt) {
    parts.push(`\nUser description: ${input.prompt}`);
  }

  if (input.sourceContext) {
    parts.push(`\n--- Source Context ---`);
    parts.push(`Topic: ${input.sourceContext.title}`);
    if (input.sourceContext.summary) {
      parts.push(`Key points: ${input.sourceContext.summary}`);
    }
  }

  return parts.join('\n');
}

export function buildNoteTitlePrompt(content: string): string {
  return `Generate a concise title (max 60 characters) for this research note. Return ONLY the title text, no quotes or formatting.\n\nContent:\n${content.slice(0, 500)}`;
}
