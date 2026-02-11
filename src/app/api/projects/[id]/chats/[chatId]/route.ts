import { NextResponse } from 'next/server';
import { chatService } from '@/services/chatService';

// GET /api/projects/:id/chats/:chatId — get chat with messages
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; chatId: string }> }
) {
  try {
    const { chatId } = await params;
    const chat = await chatService.getChat(chatId);
    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }
    return NextResponse.json(chat);
  } catch (error) {
    console.error('Error getting chat:', error);
    return NextResponse.json({ error: 'Failed to get chat' }, { status: 500 });
  }
}

// DELETE /api/projects/:id/chats/:chatId — delete a chat
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; chatId: string }> }
) {
  try {
    const { chatId } = await params;
    await chatService.deleteChat(chatId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting chat:', error);
    return NextResponse.json({ error: 'Failed to delete chat' }, { status: 500 });
  }
}
