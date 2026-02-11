import { NextResponse } from 'next/server';
import { chatService } from '@/services/chatService';

// POST /api/projects/:id/chats/:chatId/messages — send a message and get AI response
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; chatId: string }> }
) {
  try {
    const { chatId } = await params;
    const body = await request.json();

    if (!body.message) {
      return NextResponse.json({ error: 'message is required' }, { status: 400 });
    }

    const aiMessage = await chatService.sendMessage(
      chatId,
      body.message,
      body.sourceContext
    );

    return NextResponse.json(aiMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
