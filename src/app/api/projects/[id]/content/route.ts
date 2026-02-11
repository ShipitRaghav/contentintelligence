import { NextResponse } from 'next/server';
import { contentService } from '@/services/contentService';

// GET /api/projects/:id/content — list content (optional ?sourceId= filter)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: projectId } = await params;
    const { searchParams } = new URL(request.url);
    const sourceId = searchParams.get('sourceId');

    const items = sourceId
      ? await contentService.listBySource(sourceId)
      : await contentService.listByProject(projectId);

    return NextResponse.json(items);
  } catch (error) {
    console.error('Error listing content:', error);
    return NextResponse.json(
      { error: 'Failed to list content' },
      { status: 500 },
    );
  }
}

// POST /api/projects/:id/content — create content (note, text, or image)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: projectId } = await params;
    const body = await request.json();

    let result;
    switch (body.action) {
      case 'note':
        result = await contentService.saveNote(
          projectId,
          body.content,
          body.sourceId,
        );
        break;
      case 'text':
        result = await contentService.generateText(
          projectId,
          body.promptInput,
          body.sourceId,
        );
        break;
      case 'image':
        result = await contentService.generateImage(
          projectId,
          body.promptInput,
          body.sourceId,
        );
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating content:', error);
    return NextResponse.json(
      { error: 'Failed to create content' },
      { status: 500 },
    );
  }
}

// PUT /api/projects/:id/content — update a single content item
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await params;
    const body = await request.json();
    const { contentId, ...updates } = body;

    if (!contentId) {
      return NextResponse.json(
        { error: 'contentId is required' },
        { status: 400 },
      );
    }

    const result = await contentService.updateContent(contentId, updates);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating content:', error);
    return NextResponse.json(
      { error: 'Failed to update content' },
      { status: 500 },
    );
  }
}

// DELETE /api/projects/:id/content — delete a single content item
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await params;
    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get('contentId');

    if (!contentId) {
      return NextResponse.json(
        { error: 'contentId query param required' },
        { status: 400 },
      );
    }

    await contentService.deleteContent(contentId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting content:', error);
    return NextResponse.json(
      { error: 'Failed to delete content' },
      { status: 500 },
    );
  }
}
