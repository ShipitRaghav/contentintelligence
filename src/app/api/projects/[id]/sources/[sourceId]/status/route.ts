import { NextResponse } from 'next/server';
import { sourceService } from '@/services/sourceService';

// GET /api/projects/:id/sources/:sourceId/status — check processing status
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; sourceId: string }> }
) {
  try {
    const { sourceId } = await params;
    const source = await sourceService.checkProcessingStatus(sourceId);
    return NextResponse.json(source);
  } catch (error) {
    console.error('Error checking source status:', error);
    return NextResponse.json({ error: 'Failed to check status' }, { status: 500 });
  }
}
