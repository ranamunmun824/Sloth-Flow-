import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Middleware
app.use(express.json({ limit: '2mb' }));

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'SlothFlow Backend',
  });
});

// Config Status endpoint - strictly reports boolean configuration without revealing keys
app.get('/api/config-status', (_req: Request, res: Response) => {
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
  const hasDevtoKey = Boolean(process.env.DEVTO_API_KEY && process.env.DEVTO_API_KEY.trim().length > 0);
  const hasPublisherCode = Boolean(process.env.PUBLISHER_ACCESS_CODE && process.env.PUBLISHER_ACCESS_CODE.trim().length > 0);

  res.json({
    hostedGemmaConfigured: hasGeminiKey,
    devtoConfigured: hasDevtoKey,
    publisherAuthRequired: hasPublisherCode,
    defaultHostedModel: 'gemma-4-26b-a4b-it',
    alternateHostedModel: 'gemma-4-31b-it',
  });
});

// Helper to get GoogleGenAI client
function getGenAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim().length === 0) {
    throw new Error('GEMINI_API_KEY is not configured on the server. Please add it to your environment secrets.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// POST /api/ai/generate - Hosted Gemma 4 inference
app.post('/api/ai/generate', async (req: Request, res: Response) => {
  try {
    const { feature, input, preferences, modelId } = req.body;

    if (!input || typeof input !== 'string' || input.trim().length === 0) {
      return res.status(400).json({
        error: 'Validation Error: Input text is required and cannot be empty.',
      });
    }

    if (input.length > 50000) {
      return res.status(400).json({
        error: 'Validation Error: Input exceeds maximum allowed size (50,000 characters).',
      });
    }

    // Supported Gemma 4 hosted models
    const supportedHostedModels = ['gemma-4-26b-a4b-it', 'gemma-4-31b-it'];
    const selectedModel = supportedHostedModels.includes(modelId) ? modelId : 'gemma-4-26b-a4b-it';

    const ai = getGenAIClient();

    // Construct tailored system instruction and prompt based on feature
    let systemInstruction = '';
    let prompt = '';

    switch (feature) {
      case 'brain-dump': {
        const energy = preferences?.energy || 'Medium';
        const timeAvailable = preferences?.timeAvailable || 'unspecified';
        const context = preferences?.context ? `\nContext/Category: ${preferences.context}` : '';

        systemInstruction = `You are SlothFlow's productivity engine powered by open-weight Gemma 4.
The user is providing an unorganized brain dump of messy thoughts, tasks, and responsibilities.
Current energy level: ${energy}.
Available time: ${timeAvailable}.${context}
Your philosophy: "Slow and Steady. Small steps, minimal mental friction, zero hustle-culture burnout."
Rules:
1. Do NOT invent commitments, deadlines, or personal facts not present in the user input.
2. Return a strictly valid JSON object matching the requested schema.
3. Keep next actions micro-scoped (under 5 minutes).
4. Identify realistic postponements and optional deletions/delegations.`;

        prompt = `Analyze this unorganized brain dump and organize it into actionable, calm steps.
Input text:
"""
${input}
"""

You must respond ONLY with a valid JSON object matching this exact structure:
{
  "summary": "One sentence summary of primary focus without overwhelm",
  "nextAction": "One micro-step that takes under 5 minutes to build easy momentum",
  "actionableTasks": [
    {
      "task": "Specific task name",
      "priority": "High" | "Medium" | "Low",
      "effort": "e.g. 10m / 25m / low",
      "whyNow": "Brief practical reason"
    }
  ],
  "canWait": [
    {
      "task": "Task name that can be deferred safely",
      "reason": "Why it does not need to happen today"
    }
  ],
  "removeOrDelegate": [
    {
      "task": "Low-value task or busywork to drop or delegate",
      "recommendation": "Advice on dropping or passing it off"
    }
  ],
  "suggestedOrder": [
    "Step 1: ...",
    "Step 2: ...",
    "Step 3: ..."
  ]
}`;
        break;
      }

      case 'tiny-plan': {
        const energy = preferences?.energy || 'Medium';
        const timeAvailable = preferences?.timeAvailable || '60 minutes';
        const deadline = preferences?.deadline ? `Deadline: ${preferences.deadline}.` : '';
        const priorityPref = preferences?.priorityPref ? `Priority preference: ${preferences.priorityPref}.` : '';
        const mode = preferences?.mode || 'standard'; // 'standard' | 'easier' | 'shorter'

        systemInstruction = `You are SlothFlow's Tiny Plan scheduler powered by open-weight Gemma 4.
Philosophy: Less cognitive load, small steps, realistic pacing, anti-burnout.
User energy: ${energy}. Time available: ${timeAvailable}. ${deadline} ${priorityPref}
${mode === 'easier' ? 'SPECIAL DIRECTIVE: The user requested "Make the plan easier". Radically reduce friction, cut non-essential subtasks, increase breaks, and make starting trivial.' : ''}
${mode === 'shorter' ? 'SPECIAL DIRECTIVE: The user requested "Fit into less time". Condense the schedule, pick only the top 1-2 critical essentials, and postpone everything else.' : ''}
Rules:
1. NEVER schedule more work than the available time allows.
2. If the user provides conflicting deadlines or insufficient time, explicitly state the conflict in the "conflictNotes" field.
3. Include restorative sloth breaks.
4. Define a clear, healthy stopping point so the user knows when to rest.`;

        prompt = `Create a realistic Tiny Plan for these tasks:
"""
${input}
"""

Respond ONLY with a valid JSON object matching this structure:
{
  "conflictNotes": "Explicit note if time is insufficient or deadlines conflict, or null if schedule fits comfortably",
  "firstTask": "The absolute first task to start",
  "smallestNextAction": "A tiny 2-3 minute entry step to overcome inertia",
  "totalEstimatedMinutes": 45,
  "schedule": [
    {
      "order": 1,
      "task": "Task description",
      "duration": "15m",
      "isBreak": false,
      "notes": "Low-stress execution tip"
    },
    {
      "order": 2,
      "task": "Sloth Pause: Hydrate & stretch eyes",
      "duration": "5m",
      "isBreak": true,
      "notes": "Step away from screen"
    }
  ],
  "whatCanWait": [
    "Tasks explicitly deferred to protect user bandwidth"
  ],
  "stoppingPoint": "The exact milestone after which the user should stop for the session"
}`;
        break;
      }

      case 'two-line-summary': {
        const tone = preferences?.tone || 'standard'; // 'standard' | 'formal' | 'simple'
        const includeActionItems = preferences?.includeActionItems ?? true;
        const includeDates = preferences?.includeDates ?? true;

        systemInstruction = `You are SlothFlow's Two-Line Summarizer powered by open-weight Gemma 4.
Your mandate is precision, honesty, and extreme cognitive economy.
Tone preference: ${tone}.
Include action items: ${includeActionItems}. Include dates/deadlines: ${includeDates}.
Rules:
1. Provide EXACTLY two concise summary sentences by default for the core summary.
2. Identify the central message.
3. If the input text is ambiguous, incomplete, or lacks evidence for firm conclusions, explicitly output a warning in "ambiguityWarning".
4. Do not invent any outside facts.`;

        prompt = `Analyze and summarize this text:
"""
${input}
"""

Respond ONLY with a valid JSON object matching this structure:
{
  "twoLineSummary": "Sentence one stating key event/topic. Sentence two stating consequence or core conclusion.",
  "centralMessage": "One concise takeaway phrase",
  "actionItems": [
    "Specific action item or decision (if present)"
  ],
  "importantDatesAndDeadlines": [
    "Specific date, time, or deadline (if present)"
  ],
  "ambiguityWarning": "Explanation of any ambiguity or lack of clarity in the source text, or null if text was completely clear"
}`;
        break;
      }

      case 'reply-assistant': {
        const tone = preferences?.tone || 'Friendly'; // 'Friendly', 'Professional', 'Casual', 'Polite but firm', 'Brief and direct'
        const desiredLength = preferences?.desiredLength || 'Moderate'; // 'Very short', 'Moderate', 'Detailed'
        const intent = preferences?.intent || '';

        systemInstruction = `You are SlothFlow's Reply Assistant powered by open-weight Gemma 4.
You craft natural, emotionally intelligent drafts for everyday messages.
Tone requested: ${tone}. Desired length: ${desiredLength}.
User's intended message/boundaries: ${intent}.
Rules:
1. Never invent personal commitments, promises, or facts not requested by the user.
2. The user will review and manually send; you are producing a polished draft.
3. Sound human, grounded, and respectful.`;

        prompt = `Craft an appropriate response to this received message:
"""
${input}
"""
User wants to say:
"""
${intent}
"""

Respond ONLY with a valid JSON object matching this structure:
{
  "replyText": "The draft response message",
  "toneUsed": "${tone}",
  "keyPointsCovered": [
    "Point 1",
    "Point 2"
  ],
  "slothTip": "Calm communication tip for this interaction"
}`;
        break;
      }

      case 'devto-article': {
        const details = preferences || {};
        systemInstruction = `You are a senior full-stack AI engineer and technical writer drafting an article for DEV.to's "Slow and Steady" Open-Weight AI challenge about SlothFlow.
Theme: Slow and Steady — building with open-weight models (Gemma 4) that reward laziness and calm productivity.
Tone: Natural, developer-to-developer, technical, honest, and humble.
Rules:
1. Do NOT invent fictional benchmarks, stars, user numbers, or fake tests.
2. Accurately identify Gemma 4 and distinguish between Hosted Gemma 4 API (via @google/genai) and Local Gemma 4 (via Ollama at http://localhost:11434).
3. Clearly explain what offline operation means: Local model works offline once downloaded; hosted API and DEV.to publishing require internet.
4. Discuss open innovation: model weight sovereignty, local privacy vs hosted convenience, hardware requirements.
5. Provide a rich, complete Markdown article of ~800-1,200 words with headings, code snippets, architecture flow, and honest limitations.`;

        prompt = `Generate a DEV.to technical blog post for SlothFlow based on these verified project details:
Project Name: ${details.projectName || 'SlothFlow'}
Creator: ${details.creatorName || 'SlothFlow Developer'}
Description: ${details.projectDescription || 'A Lazy-Day AI Assistant powered by open-weight Gemma 4'}
GitHub Repository URL: ${details.githubUrl || '[To be provided by developer]'}
Live Demo URL: ${details.demoUrl || '[Configured in environment]'}
Implemented Features: ${JSON.stringify(details.features || ['Brain Dump', 'Tiny Plan', 'Two-Line Summary', 'Reply Assistant', 'DEV.to Blog Studio', 'Local & Hosted Gemma 4 Modes'])}
Hosted Model: ${details.hostedModel || 'gemma-4-26b-a4b-it'}
Local Model: ${details.localModel || 'gemma4:e2b via Ollama'}
Dev Environment: ${details.devEnvironment || 'Node.js, React, TypeScript, Express, Vite, @google/genai SDK'}
Completed Tests: ${details.completedTests || 'Server route validation, schema adherence, local Ollama connectivity test, draft creation flow'}
Known Limitations: ${details.knownLimitations || 'Local Ollama requires local runtime download and origin configuration; hosted API requires valid GEMINI_API_KEY'}
What was learned: ${details.whatWasLearned || 'Open-weight models like Gemma 4 provide genuine architectural flexibility, enabling true on-device privacy alongside hosted deployment.'}
Additional Notes: ${details.additionalNotes || 'Built for the Slow and Steady Challenge.'}

Return ONLY a valid JSON object matching this structure:
{
  "title": "Article Title (catchy, developer-focused, e.g. 'SlothFlow: I Built a Lazy-Day AI Assistant with Open-Weight Gemma 4')",
  "description": "Short article description (1-2 sentences for DEV.to metadata)",
  "tags": ["opensource", "ai", "productivity", "webdev"],
  "body_markdown": "Full article markdown content with # Headings, ## Subheadings, code blocks, architecture diagram, and honest review"
}`;
        break;
      }

      case 'devto-edit': {
        const action = preferences?.action || 'improve'; // 'intro', 'technical', 'concise'
        systemInstruction = `You are a technical editor refining a DEV.to blog post about SlothFlow and Gemma 4.`;
        prompt = `Action requested: ${action}.
Current Markdown content:
"""
${input}
"""
Instructions for action "${action}":
- If "intro": Rewrite and elevate the opening hook and problem statement to be punchier and more relatable.
- If "technical": Deepen the technical explanations of Ollama, Gemma 4 weight architecture, server proxying, and latency trade-offs with clear code examples.
- If "concise": Trim repetitive phrasing, tighten paragraphs, and increase clarity while preserving all technical substance.

Return ONLY a valid JSON object matching this structure:
{
  "body_markdown": "The updated article markdown"
}`;
        break;
      }

      default: {
        return res.status(400).json({
          error: `Unknown feature '${feature}'. Supported: brain-dump, tiny-plan, two-line-summary, reply-assistant, devto-article, devto-edit.`,
        });
      }
    }

    // Call Gemma 4 via official @google/genai SDK
    // Explicitly use selectedModel
    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '';
    let parsedJson: any = null;

    try {
      parsedJson = JSON.parse(responseText.trim());
    } catch {
      // If parsing directly fails, try extracting JSON from markdown fences
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        try {
          parsedJson = JSON.parse(jsonMatch[1].trim());
        } catch {
          parsedJson = null;
        }
      }
    }

    return res.json({
      success: true,
      provider: 'hosted-gemma',
      model: selectedModel,
      data: parsedJson || { rawText: responseText },
    });
  } catch (error: any) {
    // Specific error handling for Gemma 4
    console.error('Hosted Gemma Error:', error?.message || error);

    const errorMessage = error?.message || 'Unknown error occurred while contacting Gemma 4 API.';

    // NEVER silently switch to Gemini! Report transparently.
    return res.status(502).json({
      error: `Hosted Gemma 4 inference failed: ${errorMessage}. (Note: SlothFlow strictly preserves open-weight Gemma 4 and will not fall back to closed models).`,
      details: {
        modelRequested: req.body?.modelId || 'gemma-4-26b-a4b-it',
        suggestion: 'Verify GEMINI_API_KEY in your AI Studio Secrets panel, or switch to Local Gemma 4 mode via Ollama in Settings.',
      },
    });
  }
});

// In-memory rate limiting and duplicate protection for DEV.to publishing
let lastPublishTimestamp = 0;
const PUBLISH_COOLDOWN_MS = 10000; // 10 seconds between API requests

// POST /api/devto/articles - Protected DEV.to Forem API integration
app.post('/api/devto/articles', async (req: Request, res: Response) => {
  try {
    const { accessCode, article } = req.body;

    // Validate Server Configuration
    const devtoApiKey = process.env.DEVTO_API_KEY;
    const requiredAccessCode = process.env.PUBLISHER_ACCESS_CODE;

    if (!devtoApiKey || devtoApiKey.trim().length === 0) {
      return res.status(400).json({
        error: 'DEVTO_API_KEY is not configured on the server. Please add DEVTO_API_KEY to your server secrets.',
        hint: 'You can generate an API key at https://dev.to/settings/extensions under DEV Community API Keys.',
      });
    }

    if (!requiredAccessCode || requiredAccessCode.trim().length === 0) {
      return res.status(403).json({
        error: 'PUBLISHER_ACCESS_CODE is not configured in server secrets. For security, article submission is disabled until the app owner sets PUBLISHER_ACCESS_CODE.',
        hint: 'Set a secret passphrase in PUBLISHER_ACCESS_CODE to protect your DEV.to account from unauthorized publishes.',
      });
    }

    // Validate Access Code
    if (!accessCode || accessCode.trim() !== requiredAccessCode.trim()) {
      return res.status(403).json({
        error: 'Invalid Publisher Access Code. Please provide the correct authorization code configured for this instance.',
      });
    }

    // Rate Limiting & Duplicate Protection
    const now = Date.now();
    if (now - lastPublishTimestamp < PUBLISH_COOLDOWN_MS) {
      const waitSeconds = Math.ceil((PUBLISH_COOLDOWN_MS - (now - lastPublishTimestamp)) / 1000);
      return res.status(429).json({
        error: `Publishing cooldown active. Please wait ${waitSeconds}s before submitting again to avoid duplicate posts.`,
      });
    }

    // Validate Article payload
    if (!article || typeof article !== 'object') {
      return res.status(400).json({ error: 'Missing article data object.' });
    }

    const { title, description, body_markdown, published, tags } = article;

    if (!title || typeof title !== 'string' || title.trim().length < 5) {
      return res.status(400).json({ error: 'Article title must be at least 5 characters long.' });
    }

    if (!body_markdown || typeof body_markdown !== 'string' || body_markdown.trim().length < 100) {
      return res.status(400).json({ error: 'Article body markdown must be at least 100 characters long.' });
    }

    const sanitizedTags = Array.isArray(tags)
      ? tags.map((t: string) => String(t).trim().toLowerCase().replace(/[^a-z0-9]/g, '')).filter(Boolean).slice(0, 4)
      : ['opensource', 'ai', 'productivity', 'webdev'];

    const isPublished = Boolean(published);

    // Call official DEV.to Forem API
    lastPublishTimestamp = now;

    const payload = {
      article: {
        title: title.trim(),
        description: (description || '').trim(),
        body_markdown: body_markdown.trim(),
        published: isPublished,
        tags: sanitizedTags,
      },
    };

    const devtoResponse = await fetch('https://dev.to/api/articles', {
      method: 'POST',
      headers: {
        'api-key': devtoApiKey.trim(),
        'Accept': 'application/vnd.forem.api-v1+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const devtoData = await devtoResponse.json().catch(() => ({}));

    if (!devtoResponse.ok) {
      console.error('DEV.to API Error response:', devtoData);
      return res.status(devtoResponse.status).json({
        error: devtoData?.error || devtoData?.message || `DEV.to API returned status ${devtoResponse.status}`,
        details: devtoData,
      });
    }

    return res.json({
      success: true,
      published: isPublished,
      articleId: devtoData.id,
      url: devtoData.url || (devtoData.id ? `https://dev.to/dashboard` : undefined),
      title: devtoData.title,
      status: isPublished ? 'Published live on DEV.to' : 'Saved as private draft on DEV.to',
      raw: devtoData,
    });
  } catch (error: any) {
    console.error('DEV.to server error:', error?.message || error);
    return res.status(500).json({
      error: `Failed to communicate with DEV.to: ${error?.message || 'Internal network error'}`,
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SlothFlow] Server listening on http://0.0.0.0:${PORT} (${isProduction ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start SlothFlow server:', err);
  process.exit(1);
});
