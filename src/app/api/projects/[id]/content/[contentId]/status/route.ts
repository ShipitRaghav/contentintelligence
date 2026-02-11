import { NextResponse } from 'next/server';
import { contentService } from '@/services/contentService';

// GET /api/projects/:id/content/:contentId/status — check processing status
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; contentId: string }> },
) {
  try {
    const { contentId } = await params;
    const content = await contentService.checkProcessingStatus(contentId);
    return NextResponse.json(content);
  } catch (error) {
    console.error('Error checking content status:', error);
    return NextResponse.json(
      { error: 'Failed to check status' },
      { status: 500 },
    );
  }
}
