import { SourceType } from '@/types/source';

const DIAFLOW_BASE_URL = 'https://api.diaflow.io/api/v1/builders/BdUHY6d9kF';

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

export interface DiaflowResult {
  sessionId: string;
  status: 'processing' | 'completed' | 'failed';
  transcript: string | null;
  summary: string | null;
  raw?: unknown;
}

/**
 * Diaflow output node mapping by source type.
 *
 * The Diaflow workflow branches based on type_of_link:
 *   - Video/Audio → transcription + summary (output, output-1, output-2)
 *   - Document    → summary only           (output-0, output-3)
 *
 * Each output node has keyed fields (by numeric ID) for transcript/summary.
 * We try all possible output nodes for a given type and return the first match found.
 */
interface OutputNodeConfig {
  node: string;
  transcriptKey?: string;
  summaryKey: string;
}

const OUTPUT_NODES: Record<SourceType, OutputNodeConfig[]> = {
  // Video sources — have both transcript and summary
  [SourceType.Video]: [
    { node: 'output-1', transcriptKey: '1770137732643', summaryKey: '1770137743166' },
    { node: 'output',   transcriptKey: '1770137539142', summaryKey: '1770137548552' },
  ],
  // Audio sources — have both transcript and summary
  [SourceType.Audio]: [
    { node: 'output-2', transcriptKey: '1770182495615', summaryKey: '1770182505341' },
    { node: 'output-1', transcriptKey: '1770137732643', summaryKey: '1770137743166' },
    { node: 'output',   transcriptKey: '1770137539142', summaryKey: '1770137548552' },
  ],
  // Document sources — summary only, no transcript
  [SourceType.Document]: [
    { node: 'output-3', summaryKey: '1770284485944' },
    { node: 'output-0', summaryKey: '1770137831214' },
  ],
};

/**
 * Map our source types to Diaflow's type_of_link dropdown values.
 */
const TYPE_MAP: Record<SourceType, string> = {
  [SourceType.Video]: 'Video',
  [SourceType.Audio]: 'Audio',
  [SourceType.Document]: 'Document',
};

/**
 * Extract transcript and summary from a Diaflow result object
 * by trying each candidate output node for the given source type.
 */
function extractFromResult(
  result: Record<string, unknown>,
  sourceType: SourceType,
): { transcript: string | null; summary: string | null } {
  const candidates = OUTPUT_NODES[sourceType];

  for (const { node, transcriptKey, summaryKey } of candidates) {
    const outputNode = result[node] as Record<string, unknown> | undefined;
    if (!outputNode) continue;

    const summary = outputNode[summaryKey];
    if (typeof summary === 'string' && summary.length > 0) {
      const transcript = transcriptKey
        ? (typeof outputNode[transcriptKey] === 'string' ? outputNode[transcriptKey] as string : null)
        : null;

      return { transcript, summary };
    }
  }

  return { transcript: null, summary: null };
}

export const diaflowAgent = {
  /**
   * Start the transcribe flow — sends a link and type to Diaflow for processing.
   * Returns a sessionId that can be used to poll for results.
   */
  async startTranscribeFlow(link: string, typeOfLink: SourceType): Promise<{ sessionId: string }> {
    const diaflowType = TYPE_MAP[typeOfLink];

    const response = await fetch(`${DIAFLOW_BASE_URL}/process`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ link, type_of_link: diaflowType }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Diaflow process API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return { sessionId: data.sessionId || data.session_id || data.id };
  },

  /**
   * Check the status of a running flow.
   * Extracts transcript/summary from the correct output node based on source type.
   */
  async checkFlowStatus(sessionId: string, sourceType: SourceType = SourceType.Document): Promise<DiaflowResult> {
    const response = await fetch(`${DIAFLOW_BASE_URL}/process-checks/${sessionId}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Diaflow status API error ${response.status}`);
    }

    const data = await response.json();

    const isDone = data.status === 'Done' || data.status === 'completed';
    const isFailed = data.status === 'failed' || data.status === 'Failed' || data.status === 'Error';

    if (isDone && data.result) {
      const { transcript, summary } = extractFromResult(data.result, sourceType);

      return {
        sessionId,
        status: 'completed',
        transcript,
        summary,
        raw: data,
      };
    }

    return {
      sessionId,
      status: isFailed ? 'failed' : 'processing',
      transcript: null,
      summary: null,
      raw: data,
    };
  },
};
