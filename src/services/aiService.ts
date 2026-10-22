import {
  BrainDumpResult,
  ConfigStatus,
  DevtoArticleData,
  DevtoArticleDetails,
  EnergyLevel,
  HostedModelId,
  InferenceMode,
  LocalOllamaStatus,
  ReplyAssistantResult,
  ReplyTone,
  SummaryTone,
  TinyPlanResult,
  TwoLineSummaryResult,
} from '../types';

/**
 * Fetch server configuration status (checks if GEMINI_API_KEY, DEVTO_API_KEY, PUBLISHER_ACCESS_CODE exist)
 */
export async function fetchConfigStatus(): Promise<ConfigStatus> {
  try {
    const res = await fetch('/api/config-status');
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    return await res.json();
  } catch (err: any) {
    console.error('Failed to fetch config status:', err);
    return {
      hostedGemmaConfigured: false,
      devtoConfigured: false,
      publisherAuthRequired: false,
      defaultHostedModel: 'gemma-4-26b-a4b-it',
      alternateHostedModel: 'gemma-4-31b-it',
    };
  }
}

/**
 * Test Ollama connectivity directly from the browser to the local endpoint.
 * Note: Never proxies local inference through a cloud backend.
 */
export async function testLocalOllama(baseUrl: string, expectedModel: string): Promise<LocalOllamaStatus> {
  const cleanUrl = baseUrl.replace(/\/+$/, '');
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${cleanUrl}/api/tags`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return {
        tested: true,
        reachable: false,
        models: [],
        lastTestedAt: new Date().toISOString(),
        error: `Ollama returned HTTP status ${res.status}. Verify Ollama is running at ${cleanUrl}.`,
      };
    }

    const data = await res.json();
    const modelNames: string[] = Array.isArray(data?.models)
      ? data.models.map((m: any) => m.name || m.model || '')
      : [];

    const hasExpected = modelNames.some((m) => m.toLowerCase().includes(expectedModel.toLowerCase().trim()));

    return {
      tested: true,
      reachable: true,
      models: modelNames,
      lastTestedAt: new Date().toISOString(),
      error: hasExpected
        ? undefined
        : `Connected to Ollama, but model '${expectedModel}' was not found. Available models: ${modelNames.length > 0 ? modelNames.join(', ') : 'none'}. Run: 'ollama pull ${expectedModel}' in your terminal.`,
    };
  } catch (err: any) {
    let msg = err.message || 'Connection refused';
    if (err.name === 'AbortError') {
      msg = 'Connection timed out after 4 seconds.';
    }
    return {
      tested: true,
      reachable: false,
      models: [],
      lastTestedAt: new Date().toISOString(),
      error: `Could not connect to Ollama at ${cleanUrl} (${msg}). If you are running locally, ensure Ollama is started with 'ollama serve' and CORS allows browser requests via OLLAMA_ORIGINS="*".`,
    };
  }
}

/**
 * Helper to invoke local Ollama OpenAI-compatible chat completion
 */
async function callLocalOllama(
  baseUrl: string,
  modelName: string,
  systemPrompt: string,
  userPrompt: string
): Promise<any> {
  const cleanUrl = baseUrl.replace(/\/+$/, '');
  const endpoint = `${cleanUrl}/v1/chat/completions`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelName,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Local Ollama error (status ${response.status}): ${errorText || response.statusText}`);
  }

  const data = await response.json();
  const rawText = data?.choices?.[0]?.message?.content || '';

  // Attempt JSON parse
  try {
    return JSON.parse(rawText.trim());
  } catch {
    const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        return JSON.parse(jsonMatch[1].trim());
      } catch {
        // Return raw if JSON parse fails
      }
    }
    return { rawText };
  }
}

/**
 * Helper to invoke hosted Gemma 4 via our backend server route /api/ai/generate
 */
async function callHostedGemma(
  feature: string,
  input: string,
  preferences: any,
  modelId: HostedModelId
): Promise<any> {
  const response = await fetch('/api/ai/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      feature,
      input,
      preferences,
      modelId,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.error || `Hosted Gemma API failed with HTTP ${response.status}`);
  }

  return data.data;
}

/**
 * Universal dispatcher: routes task to either Hosted Gemma 4 or Local Ollama Gemma 4.
 * CRITICAL: Never falls back to a proprietary or closed model.
 */
export async function executeAiTask(params: {
  feature: 'brain-dump' | 'tiny-plan' | 'two-line-summary' | 'reply-assistant' | 'devto-article' | 'devto-edit';
  input: string;
  preferences?: any;
  mode: InferenceMode;
  hostedModel: HostedModelId;
  ollamaBaseUrl: string;
  localModel: string;
}): Promise<any> {
  const { feature, input, preferences, mode, hostedModel, ollamaBaseUrl, localModel } = params;

  if (mode === 'local') {
    // Construct local prompts equivalent to server prompts
    let systemInstruction = '';
    let userPrompt = '';

    if (feature === 'brain-dump') {
      systemInstruction = `You are SlothFlow's productivity assistant powered by local Gemma 4.
Philosophy: "Slow and Steady. Small steps, minimal mental friction, zero burnout."
Rules: Do NOT invent deadlines or commitments. Return ONLY a valid JSON object matching the requested schema.`;
      userPrompt = `Analyze this brain dump for someone with ${preferences?.energy || 'Medium'} energy and ${preferences?.timeAvailable || 'unspecified'} time available. Context: ${preferences?.context || 'none'}.
Input:
"""
${input}
"""
Respond strictly in JSON with:
{
  "summary": "One sentence summary",
  "nextAction": "One 5-minute micro momentum task",
  "actionableTasks": [{"task": "string", "priority": "High"|"Medium"|"Low", "effort": "15m", "whyNow": "string"}],
  "canWait": [{"task": "string", "reason": "string"}],
  "removeOrDelegate": [{"task": "string", "recommendation": "string"}],
  "suggestedOrder": ["Step 1...", "Step 2..."]
}`;
    } else if (feature === 'tiny-plan') {
      systemInstruction = `You are SlothFlow's Tiny Plan scheduler powered by local Gemma 4.
Philosophy: Less cognitive load, small steps, realistic pacing. Do NOT schedule more work than time allows.
Mode: ${preferences?.mode || 'standard'}. Energy: ${preferences?.energy || 'Medium'}. Time: ${preferences?.timeAvailable || '60m'}.`;
      userPrompt = `Create a realistic Tiny Plan for:
"""
${input}
"""
Respond strictly in JSON:
{
  "conflictNotes": "String note if time/deadlines conflict or null",
  "firstTask": "First task to start",
  "smallestNextAction": "Tiny 2-minute entry step",
  "totalEstimatedMinutes": 45,
  "schedule": [{"order": 1, "task": "string", "duration": "15m", "isBreak": false, "notes": "string"}],
  "whatCanWait": ["task 1", "task 2"],
  "stoppingPoint": "Healthy stopping point"
}`;
    } else if (feature === 'two-line-summary') {
      systemInstruction = `You are SlothFlow's Two-Line Summarizer powered by local Gemma 4.
Provide exactly two concise sentences for the summary. Point out ambiguity if present.`;
      userPrompt = `Summarize:
"""
${input}
"""
Respond strictly in JSON:
{
  "twoLineSummary": "Sentence one. Sentence two.",
  "centralMessage": "Core point",
  "actionItems": ["action 1"],
  "importantDatesAndDeadlines": ["date 1"],
  "ambiguityWarning": "string warning or null"
}`;
    } else if (feature === 'reply-assistant') {
      systemInstruction = `You are SlothFlow's Reply Assistant powered by local Gemma 4.
Tone: ${preferences?.tone || 'Friendly'}. Length: ${preferences?.desiredLength || 'Moderate'}. Intent: ${preferences?.intent || 'none'}.
Never invent false promises.`;
      userPrompt = `Draft a reply to:
"""
${input}
"""
User wants to communicate:
"""
${preferences?.intent || ''}
"""
Respond strictly in JSON:
{
  "replyText": "Draft reply text",
  "toneUsed": "${preferences?.tone || 'Friendly'}",
  "keyPointsCovered": ["point 1"],
  "slothTip": "communication tip"
}`;
    } else if (feature === 'devto-article') {
      systemInstruction = `You are a senior developer drafting a DEV.to article about SlothFlow and open-weight Gemma 4 for the Slow and Steady challenge.`;
      userPrompt = `Create a comprehensive Markdown article for DEV.to based on: ${JSON.stringify(preferences)}.
Respond strictly in JSON:
{
  "title": "Article Title",
  "description": "Short description",
  "tags": ["opensource", "ai", "productivity", "webdev"],
  "body_markdown": "# SlothFlow..."
}`;
    } else if (feature === 'devto-edit') {
      systemInstruction = `You are a technical editor refining a DEV.to blog post about SlothFlow.`;
      userPrompt = `Action: ${preferences?.action || 'improve'}.
Markdown:
"""
${input}
"""
Respond strictly in JSON:
{
  "body_markdown": "Updated markdown text"
}`;
    }

    return await callLocalOllama(ollamaBaseUrl, localModel, systemInstruction, userPrompt);
  }

  // Hosted Gemma 4
  return await callHostedGemma(feature, input, preferences, hostedModel);
}

/**
 * Send DEV.to article to backend server route
 */
export async function submitDevtoArticle(params: {
  accessCode: string;
  article: {
    title: string;
    description: string;
    body_markdown: string;
    published: boolean;
    tags: string[];
  };
}) {
  const response = await fetch('/api/devto/articles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.error || `DEV.to request failed with status ${response.status}`);
  }

  return data;
}
