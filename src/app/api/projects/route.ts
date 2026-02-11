import { NextResponse } from 'next/server';
import { projectService } from '@/services/projectService';

export async function GET() {
  try {
    const projects = await projectService.listProjects();
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const project = await projectService.createProject();
    return NextResponse.json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
