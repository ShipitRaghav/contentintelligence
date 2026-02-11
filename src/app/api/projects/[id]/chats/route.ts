import { NextResponse } from 'next/server';
import { chatService } from '@/services/chatService';

// GET /api/projects/:id/chats — list chats for a project
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const chats = await chatService.listChats(projectId);
    return NextResponse.json(chats);
  } catch (error) {
    console.error('Error listing chats:', error);
    return NextResponse.json({ error: 'Failed to list chats' }, { status: 500 });
  }
}

// POST /api/projects/:id/chats — create a new chat
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    let title: string | undefined;
    try {
      const body = await request.json();
      title = body.title;
    } catch {
      // No body or invalid JSON — that's fine, title stays undefined
    }
    const chat = await chatService.createChat(projectId, title);
    return NextResponse.json(chat);
  } catch (error) {
    console.error('Error creating chat:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to create chat', details: message }, { status: 500 });
  }
}
