const DIAFLOW_BASE = 'https://api.diaflow.io/api/v1/builders';
const PRESIGN_URL = 'https://api.diaflow.io/api/v1/auth/presign-token';
const TEXT_BUILDER_ID = 'KSEvJWAKmC';
const IMAGE_BUILDER_ID = 'sMuymSs16q';

function getHeaders() {
  const apiKey = process.env.DIAFLOW_API_KEY;
  if (!apiKey) {
    throw new Error('DIAFLOW_API_KEY environment variable is not set');
  }
  return {
    'X-API-Key': apiKey,
    'Content-Type': 'application/json',
  };
}

export type ContentGenerationType = 'text' | 'image';

export interface ContentDiaflowResult {
  sessionId: string;
  status: 'processing' | 'completed' | 'failed';
  content: string | null;
  url: string | null;
  imagePath: string | null;
  raw?: unknown;
}

function getBuilderId(type: ContentGenerationType): string {
  return type === 'text' ? TEXT_BUILDER_ID : IMAGE_BUILDER_ID;
}

// --- Presign token cache ---
let cachedPresignToken: {
  Policy: string;
  Signature: string;
  KeyPairId: string;
  expiresAt: number; // Unix seconds
} | null = null;

async function fetchPresignToken(): Promise<{ Policy: string; Signature: string; KeyPairId: string }> {
  const now = Date.now() / 1000;
  if (cachedPresignToken && now < cachedPresignToken.expiresAt - 60) {
    return cachedPresignToken;
  }

  const jwt = process.env.DIAFLOW_JWT;
  const workspaceId = process.env.DIAFLOW_WORKSPACE_ID || '7991';
  if (!jwt) throw new Error('DIAFLOW_JWT environment variable is not set');

  const res = await fetch(PRESIGN_URL, {
    method: 'GET',
    headers: {
      'authorization': `Bearer ${jwt}`,
      'workspace-id': workspaceId,
      'content-type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`Presign token API error ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  cachedPresignToken = {
    Policy: data.Policy,
    Signature: data.Signature,
    KeyPairId: data['Key-Pair-Id'],
    expiresAt: data.expires_at,
  };

  return cachedPresignToken;
}

/**
 * Build a full CDN URL from a Diaflow image path.
 * Fetches fresh presign credentials dynamically.
 */
async function buildCdnUrl(path: string): Promise<string> {
  const token = await fetchPresignToken();
  return `https://cdn.diaflow.io/${path}?Policy=${token.Policy}&Signature=${token.Signature}&Key-Pair-Id=${token.KeyPairId}`;
}

/**
 * Diaflow output node mapping by content generation type.
 *
 * Each builder has specific output nodes with keyed fields.
 */
interface ContentOutputNodeConfig {
  node: string;
  contentKey: string;  // Field key for text content OR image path
}

const TEXT_OUTPUT_NODES: ContentOutputNodeConfig[] = [
  { node: 'output', contentKey: '1770497874518' },
];

const IMAGE_OUTPUT_NODES: ContentOutputNodeConfig[] = [
  { node: 'output', contentKey: '1770475858951' },
];

const OUTPUT_NODES: Record<ContentGenerationType, ContentOutputNodeConfig[]> = {
  text: TEXT_OUTPUT_NODES,
  image: IMAGE_OUTPUT_NODES,
};

/**
 * Extract content or image path from a Diaflow result object
 * by trying each candidate output node for the given content type.
 */
function extractFromResult(
  result: Record<string, unknown>,
  type: ContentGenerationType,
): { content: string | null; url: string | null; imagePath: string | null } {
  const candidates = OUTPUT_NODES[type];

  for (const { node, contentKey } of candidates) {
    const outputNode = result[node] as Record<string, unknown> | undefined;
    if (!outputNode) continue;

    const value = outputNode[contentKey];
    if (typeof value === 'string' && value.length > 0) {
      if (type === 'image') {
        return { content: null, url: null, imagePath: value };
      }
      return { content: value, url: null, imagePath: null };
    }
  }

  return { content: null, url: null, imagePath: null };
}

export const contentDiaflowAgent = {
  /**
   * Start a content generation flow.
   * Sends a prompt to the appropriate Diaflow builder (text or image).
   */
  async startGeneration(
    type: ContentGenerationType,
    prompt: string,
  ): Promise<{ sessionId: string }> {
    const builderId = getBuilderId(type);
    const response = await fetch(`${DIAFLOW_BASE}/${builderId}/process`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Diaflow content API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return { sessionId: data.sessionId || data.session_id || data.id };
  },

  /**
   * Check the status of a content generation flow.
   * Returns the generated content when completed.
   */
  async checkStatus(
    type: ContentGenerationType,
    sessionId: string,
  ): Promise<ContentDiaflowResult> {
    const builderId = getBuilderId(type);
    const response = await fetch(
      `${DIAFLOW_BASE}/${builderId}/process-checks/${sessionId}`,
      { method: 'GET', headers: getHeaders() },
    );

    if (!response.ok) {
      throw new Error(`Diaflow content status API error ${response.status}`);
    }

    const data = await response.json();
    const isDone = data.status === 'Done' || data.status === 'completed';
    const isFailed = data.status === 'failed' || data.status === 'Failed' || data.status === 'Error';

    if (isDone && data.result) {
      const resultObj = data.result as Record<string, unknown>;
      const { content, url, imagePath } = extractFromResult(resultObj, type);
      return { sessionId, status: 'completed', content, url, imagePath, raw: data };
    }

    return {
      sessionId,
      status: isFailed ? 'failed' : 'processing',
      content: null,
      url: null,
      imagePath: null,
      raw: data,
    };
  },

  /**
   * Download an image from Diaflow CDN using fresh presign credentials.
   * Returns the raw image binary and its MIME type.
   */
  async downloadImageFromPath(path: string): Promise<{ data: Uint8Array<ArrayBuffer>; mimeType: string }> {
    const cdnUrl = await buildCdnUrl(path);
    const res = await fetch(cdnUrl);
    if (!res.ok) {
      throw new Error(`Failed to download image from CDN: ${res.status}`);
    }

    const mimeType = res.headers.get('content-type') || 'image/png';
    const arrayBuffer = await res.arrayBuffer();
    return { data: new Uint8Array(arrayBuffer), mimeType };
  },
};
