import type { Project, ProjectMetadata, GeneratedContent } from '@/types/project';
import type { Source } from '@/types/source';
import type { Chat, ChatWithMessages, ChatMessage } from '@/types/chat';

// Save a project (update)
export async function saveProject(project: Project): Promise<void> {
    await fetch(`/api/projects/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: project.title,
            searchQuery: project.searchQuery,
            summaryData: project.summaryData,
            sources: project.sources,
        }),
    });
}

// Load a project by ID
export async function loadProject(projectId: string): Promise<Project | null> {
    const res = await fetch(`/api/projects/${projectId}`);
    if (!res.ok) return null;
    return res.json();
}

// Get all projects metadata
export async function getAllProjects(): Promise<ProjectMetadata[]> {
    const res = await fetch('/api/projects');
    if (!res.ok) return [];
    return res.json();
}

// Delete a project
export async function deleteProject(projectId: string): Promise<void> {
    await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
}

// Update project title
export async function updateProjectTitle(projectId: string, title: string): Promise<void> {
    await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
    });
}

// Create a new project
export async function createNewProject(): Promise<Project> {
    const res = await fetch('/api/projects', { method: 'POST' });
    return res.json();
}

// Add a source to a project (triggers Diaflow processing if URL provided)
export async function addSource(
    projectId: string,
    input: { url?: string; type: string; title: string; content?: string }
): Promise<Source> {
    const res = await fetch(`/api/projects/${projectId}/sources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error('Failed to add source');
    return res.json();
}

// Poll a source's processing status
export async function checkSourceStatus(projectId: string, sourceId: string): Promise<Source> {
    const res = await fetch(`/api/projects/${projectId}/sources/${sourceId}/status`);
    if (!res.ok) throw new Error('Failed to check source status');
    return res.json();
}

// Update content status/title/assignee
export async function updateContent(
    projectId: string,
    contentId: string,
    updates: { title?: string; complianceStatus?: string; assignee?: string }
): Promise<void> {
    await fetch(`/api/projects/${projectId}/content`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId, ...updates }),
    });
}

// Create content (note, text generation, or image generation)
export async function createContent(
    projectId: string,
    payload: {
        action: 'note' | 'text' | 'image';
        content?: string;
        sourceId?: string;
        promptInput?: unknown;
    }
): Promise<GeneratedContent> {
    const res = await fetch(`/api/projects/${projectId}/content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create content');
    return res.json();
}

// List content for a project (optionally filtered by source)
export async function listContent(
    projectId: string,
    sourceId?: string
): Promise<GeneratedContent[]> {
    const url = sourceId
        ? `/api/projects/${projectId}/content?sourceId=${sourceId}`
        : `/api/projects/${projectId}/content`;
    const res = await fetch(url);
    if (!res.ok) return [];
    return res.json();
}

// Delete a single content item
export async function deleteContent(
    projectId: string,
    contentId: string
): Promise<void> {
    await fetch(`/api/projects/${projectId}/content?contentId=${contentId}`, {
        method: 'DELETE',
    });
}

// Poll content processing status
export async function checkContentStatus(
    projectId: string,
    contentId: string
): Promise<GeneratedContent> {
    const res = await fetch(`/api/projects/${projectId}/content/${contentId}/status`);
    if (!res.ok) throw new Error('Failed to check content status');
    return res.json();
}

// --- Chat API ---

// Create a new chat for a project
export async function createChat(projectId: string): Promise<Chat> {
    const res = await fetch(`/api/projects/${projectId}/chats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.details || err.error || 'Failed to create chat');
    }
    return res.json();
}

// List all chats for a project
export async function listChats(projectId: string): Promise<Chat[]> {
    const res = await fetch(`/api/projects/${projectId}/chats`);
    if (!res.ok) return [];
    return res.json();
}

// Get a chat with all messages
export async function getChat(projectId: string, chatId: string): Promise<ChatWithMessages> {
    const res = await fetch(`/api/projects/${projectId}/chats/${chatId}`);
    if (!res.ok) throw new Error('Failed to get chat');
    return res.json();
}

// Delete a chat
export async function deleteChat(projectId: string, chatId: string): Promise<void> {
    await fetch(`/api/projects/${projectId}/chats/${chatId}`, { method: 'DELETE' });
}

// Send a chat message and get AI response
export async function sendChatMessage(
    projectId: string,
    chatId: string,
    message: string,
    sourceContext?: string
): Promise<ChatMessage> {
    const res = await fetch(`/api/projects/${projectId}/chats/${chatId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, sourceContext }),
    });
    if (!res.ok) throw new Error('Failed to send message');
    return res.json();
}

// Get suggested questions for a source
export async function getSuggestedQuestions(projectId: string, sourceId: string): Promise<string[]> {
    const res = await fetch(`/api/projects/${projectId}/sources/${sourceId}/questions`);
    if (!res.ok) return [];
    return res.json();
}

// Get trending insights with grounding
export async function getTrendingInsights(
    projectId: string,
    chatId: string,
    summary: string
): Promise<ChatMessage> {
    const res = await fetch(`/api/projects/${projectId}/chats/${chatId}/trending`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary }),
    });
    if (!res.ok) throw new Error('Failed to get trending insights');
    return res.json();
}
