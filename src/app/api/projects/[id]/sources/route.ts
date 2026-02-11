import { NextResponse } from 'next/server';
import { sourceService } from '@/services/sourceService';

// POST /api/projects/:id/sources — add a source and start Diaflow processing
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const body = await request.json();

    if (!body.type || !body.title) {
      return NextResponse.json(
        { error: 'type and title are required' },
        { status: 400 }
      );
    }

    const source = await sourceService.addSource(projectId, {
      type: body.type,
      url: body.url,
      title: body.title,
      authors: body.authors,
      year: body.year,
      content: body.content,
      metadata: body.metadata,
    });

    return NextResponse.json(source);
  } catch (error) {
    console.error('Error adding source:', error);
    return NextResponse.json({ error: 'Failed to add source' }, { status: 500 });
  }
}

// GET /api/projects/:id/sources — list all sources for a project
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const sources = await sourceService.listSources(projectId);
    return NextResponse.json(sources);
  } catch (error) {
    console.error('Error listing sources:', error);
    return NextResponse.json({ error: 'Failed to list sources' }, { status: 500 });
  }
}
