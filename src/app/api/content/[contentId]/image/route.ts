import { NextResponse } from 'next/server';
import { contentRepository } from '@/repositories/contentRepository';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ contentId: string }> },
) {
  try {
    const { contentId } = await params;
    const record = await contentRepository.findImageData(contentId);

    if (!record?.imageData) {
      return new NextResponse('Image not found', { status: 404 });
    }

    return new NextResponse(record.imageData, {
      headers: {
        'Content-Type': record.imageMimeType || 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving image:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
