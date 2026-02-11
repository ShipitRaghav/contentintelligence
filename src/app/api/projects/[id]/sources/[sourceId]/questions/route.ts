import { NextResponse } from 'next/server';
import { chatService } from '@/services/chatService';
import { sourceRepository } from '@/repositories/sourceRepository';

// GET /api/projects/:id/sources/:sourceId/questions — generate suggested questions
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; sourceId: string }> }
) {
  try {
    const { sourceId } = await params;
    const source = await sourceRepository.findById(sourceId);

    if (!source) {
      return NextResponse.json({ error: 'Source not found' }, { status: 404 });
    }

    const summary = source.summary || source.content || source.title;
    const questions = await chatService.getSuggestedQuestions(summary);
    return NextResponse.json(questions);
  } catch (error) {
    console.error('Error generating questions:', error);
    return NextResponse.json({ error: 'Failed to generate questions' }, { status: 500 });
  }
}
