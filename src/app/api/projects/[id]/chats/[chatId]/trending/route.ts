import { NextResponse } from 'next/server';
import { chatService } from '@/services/chatService';

// POST /api/projects/:id/chats/:chatId/trending — trending with grounding
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; chatId: string }> }
) {
  try {
    const { chatId } = await params;
    const body = await request.json();

    if (!body.summary) {
      return NextResponse.json({ error: 'summary is required' }, { status: 400 });
    }

    const aiMessage = await chatService.getTrendingInsights(chatId, body.summary);
    return NextResponse.json(aiMessage);
  } catch (error) {
    console.error('Error getting trending insights:', error);
    return NextResponse.json({ error: 'Failed to get trending insights' }, { status: 500 });
  }
}
