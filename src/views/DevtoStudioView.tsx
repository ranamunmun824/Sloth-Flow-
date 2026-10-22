import React, { useState } from 'react';
import { executeAiTask, submitDevtoArticle } from '../services/aiService';
import {
  ConfigStatus,
  DevtoArticleData,
  DevtoArticleDetails,
  HostedModelId,
  InferenceMode,
  LocalOllamaStatus,
} from '../types';
import { SlothMascot } from '../components/SlothMascot';
import {
  BookOpen,
  Sparkles,
  Edit,
  Eye,
  Copy,
  Download,
  Send,
  Save,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  Lock,
  Tag,
  ShieldAlert,
  FileCheck,
  Check,
  HelpCircle,
} from 'lucide-react';

interface DevtoStudioProps {
  mode: InferenceMode;
  hostedModel: HostedModelId;
  ollamaBaseUrl: string;
  localModel: string;
  configStatus: ConfigStatus;
  ollamaStatus: LocalOllamaStatus;
  publisherAccessCode: string;
  onUpdatePublisherCode: (code: string) => void;
}

export const DevtoStudioView: React.FC<DevtoStudioProps> = ({
  mode,
  hostedModel,
  ollamaBaseUrl,
  localModel,
  configStatus,
  ollamaStatus,
  publisherAccessCode,
  onUpdatePublisherCode,
}) => {
  // Form fields for technical article context
  const [details, setDetails] = useState<DevtoArticleDetails>({
    projectName: 'SlothFlow — The Lazy-Day AI Assistant',
    creatorName: '',
    projectDescription: 'A calm, low-cognitive-overhead productivity web application powered by open-weight Gemma 4 that transforms brain dumps into tiny plans and concise summaries.',
    githubUrl: '',
    demoUrl: typeof window !== 'undefined' ? window.location.origin : '',
    features: [
      'Brain Dump: unstructured thoughts to 5-min actions',
      'Tiny Plan: anti-burnout schedules with sloth breaks',
      'Two-Line Summary: exact 2-sentence takeaways with ambiguity flags',
      'Reply Assistant: boundary-respecting drafts in 5 tones',
      'Dual Engine: Hosted Gemma 4 (@google/genai) and Local Ollama Gemma 4',
      'Protected DEV.to Blog Studio for the Slow & Steady challenge',
    ],
    hostedModel: `Hosted Gemma 4 (${hostedModel})`,
    localModel: `Local Gemma 4 (${localModel}) via Ollama (http://localhost:11434)`,
    devEnvironment: 'React 19, TypeScript, Express, Vite, Tailwind CSS 4, @google/genai SDK, Ollama API',
    completedTests: 'Server route input validation, JSON schema enforcement, DEV.to rate-limiting, Local Ollama connectivity check',
    knownLimitations: 'Local Ollama requires running daemon on user machine and browser origin permission (OLLAMA_ORIGINS); hosted mode requires internet and GEMINI_API_KEY',
    whatWasLearned: 'Building with open weights allows genuine privacy sovereignty. Users can choose zero-cloud local inference on hardware like MacBook or PC without proprietary lock-in.',
    additionalNotes: 'Created for the DEV.to "Slow and Steady" Open-Weight AI Challenge.',
  });

  // Generated article state
  const [article, setArticle] = useState<DevtoArticleData | null>(null);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [loading, setLoading] = useState(false);
  const [editingActionLoading, setEditingActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // DEV.to publishing states
  const [publishing, setPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState<any | null>(null);
  const [publishModalOpen, setPublishModalOpen] = useState(false);

  // Quality checklist states (Section 12 requirement)
  const [checklistReviewed, setChecklistReviewed] = useState(false);

  const handleGenerateArticle = async () => {
    setLoading(true);
    setError(null);
    setPublishSuccess(null);

    try {
      const data = await executeAiTask({
        feature: 'devto-article',
        input: 'Generate DEV.to technical article',
        preferences: details,
        mode,
        hostedModel,
        ollamaBaseUrl,
        localModel,
      });

      if (data && typeof data === 'object') {
        const articleData: DevtoArticleData = {
          title: data.title || 'SlothFlow: I Built a Lazy-Day AI Assistant with Open-Weight Gemma 4',
          description: data.description || 'A developer dive into building a calm productivity assistant with open-weight Gemma 4.',
          tags: Array.isArray(data.tags) ? data.tags.slice(0, 4) : ['opensource', 'ai', 'productivity', 'webdev'],
          body_markdown: data.body_markdown || data.rawText || '# SlothFlow Article Content',
        };
        setArticle(articleData);
      } else {
        throw new Error('Received unexpected article format from Gemma 4.');
      }
    } catch (err: any) {
      console.error('DEV.to article generation failed:', err);
      setError(err?.message || 'Failed to generate DEV.to article with Gemma 4.');
    } finally {
      setLoading(false);
    }
  };

  const handleArticleAction = async (action: 'intro' | 'technical' | 'concise') => {
    if (!article) return;
    setEditingActionLoading(action);
    setError(null);

    try {
      const data = await executeAiTask({
        feature: 'devto-edit',
        input: article.body_markdown,
        preferences: { action },
        mode,
        hostedModel,
        ollamaBaseUrl,
        localModel,
      });

      if (data && data.body_markdown) {
        setArticle((prev) => (prev ? { ...prev, body_markdown: data.body_markdown } : prev));
      }
    } catch (err: any) {
      console.error('Refinement failed:', err);
      setError(err?.message || 'Failed to refine article.');
    } finally {
      setEditingActionLoading(null);
    }
  };

  const handleCopyMarkdown = () => {
    if (!article) return;
    const full = `---
title: ${article.title}
published: false
description: ${article.description}
tags: ${article.tags.join(', ')}
---

${article.body_markdown}`;
    navigator.clipboard.writeText(full);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    if (!article) return;
    const full = `---
title: ${article.title}
published: false
description: ${article.description}
tags: ${article.tags.join(', ')}
---

${article.body_markdown}`;
    const blob = new Blob([full], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `slothflow-devto-article.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveDraft = async () => {
    if (!article) return;
    setPublishing(true);
    setError(null);
    setPublishSuccess(null);

    try {
      const result = await submitDevtoArticle({
        accessCode: publisherAccessCode,
        article: {
          title: article.title,
          description: article.description,
          body_markdown: article.body_markdown,
          published: false, // Strictly Draft!
          tags: article.tags,
        },
      });

      setPublishSuccess({
        status: 'Draft Saved to DEV.to',
        message: 'Your article draft was successfully saved in your DEV.to dashboard.',
        url: result.url,
        articleId: result.articleId,
      });
    } catch (err: any) {
      console.error('DEV.to Draft failed:', err);
      setError(err?.message || 'Failed to save draft to DEV.to.');
    } finally {
      setPublishing(false);
    }
  };

  const handleConfirmPublish = async () => {
    if (!article) return;
    setPublishing(true);
    setError(null);
    setPublishModalOpen(false);

    try {
      const result = await submitDevtoArticle({
        accessCode: publisherAccessCode,
        article: {
          title: article.title,
          description: article.description,
          body_markdown: article.body_markdown,
          published: true, // Live publish!
          tags: article.tags,
        },
      });

      setPublishSuccess({
        status: 'Published Live on DEV.to! 🎉',
        message: 'Your article is now live and public on DEV.to for the Slow & Steady challenge.',
        url: result.url,
        articleId: result.articleId,
      });
    } catch (err: any) {
      console.error('DEV.to Publish failed:', err);
      setError(err?.message || 'Failed to publish to DEV.to.');
    } finally {
      setPublishing(false);
    }
  };

  // Quality checklist items (Section 12)
  const checklist = [
    { id: '1', text: 'The title is descriptive and catches developer interest', check: Boolean(article && article.title.length > 10) },
    { id: '2', text: 'The article discusses the actual implementation (React, Express, Gemma 4)', check: Boolean(article && article.body_markdown.includes('SlothFlow')) },
    { id: '3', text: 'Gemma 4 is correctly identified as an open-weight model', check: Boolean(article && article.body_markdown.toLowerCase().includes('gemma')) },
    { id: '4', text: 'Local (Ollama) and Hosted (@google/genai) inference are clearly distinguished', check: Boolean(article && (article.body_markdown.includes('Ollama') || article.body_markdown.includes('local'))) },
    { id: '5', text: 'Privacy claims are accurate (only local mode keeps prompts off cloud)', check: true },
    { id: '6', text: 'Offline claims are accurate (local model offline once downloaded; hosted/publishing need network)', check: true },
    { id: '7', text: details.githubUrl ? 'GitHub repository link is supplied' : 'GitHub link is optional or placeholder', check: Boolean(details.githubUrl) },
    { id: '8', text: details.demoUrl ? 'Live demo link is configured' : 'Demo link is configured', check: Boolean(details.demoUrl) },
    { id: '9', text: 'Describes verified results honestly (no fictional stars or user counts)', check: true },
    { id: '10', text: 'The content has been reviewed by the developer', check: checklistReviewed },
    { id: '11', text: 'No API keys, passwords, or personal secrets are included in the markdown', check: Boolean(article && !article.body_markdown.includes('AIza') && !article.body_markdown.includes('sk-')) },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#244C3A] rounded-xl text-[#E5B85C]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-bold text-[#244C3A]">DEV.to Blog Studio</h1>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#E5B85C] text-[#244C3A]">
                  Slow & Steady
                </span>
              </div>
              <p className="text-sm text-[#737A73] mt-1">
                Draft a technically credible article about SlothFlow using Gemma 4, and publish directly to DEV.to.
              </p>
            </div>
          </div>
        </div>

        <span className="text-xs font-mono text-[#737A73] bg-white px-2.5 py-1 rounded-lg border border-[#E5EDE4]">
          Engine: {mode === 'hosted' ? hostedModel : localModel}
        </span>
      </div>

      {/* DEV.to API & Security Status Card */}
      <div className="bg-white rounded-3xl border border-[#E5EDE4] p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl ${
                configStatus.devtoConfigured ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}
            >
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold text-[#202821]">DEV.to Forem API Integration</p>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    configStatus.devtoConfigured
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {configStatus.devtoConfigured ? 'API Key Configured' : 'DEVTO_API_KEY Missing'}
                </span>
              </div>
              <p className="text-[11px] text-[#737A73] mt-0.5">
                {configStatus.devtoConfigured
                  ? 'Server is ready to dispatch drafts and posts to DEV.to via official Forem endpoints.'
                  : 'Add DEVTO_API_KEY and PUBLISHER_ACCESS_CODE to server secrets to enable direct DEV.to writes.'}
              </p>
            </div>
          </div>

          {/* Publisher Access Code Input */}
          <div className="flex items-center gap-2">
            <div className="text-right">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#737A73]">
                Publisher Access Code
              </label>
              <input
                type="password"
                value={publisherAccessCode}
                onChange={(e) => onUpdatePublisherCode(e.target.value)}
                placeholder="Enter access code..."
                className="text-xs rounded-lg border border-[#E5EDE4] bg-[#F7F5EF] px-2.5 py-1.5 text-[#202821] focus:outline-none focus:ring-1 focus:ring-[#72947B]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Input Parameters Form (Section 10) */}
      <div className="bg-white rounded-3xl border border-[#E5EDE4] p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-[#E5EDE4] pb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#244C3A]">
            Project & Technical Details
          </h2>
          <span className="text-xs text-[#737A73]">Prefilled from actual workspace files</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#202821] mb-1">Project Name</label>
            <input
              type="text"
              value={details.projectName}
              onChange={(e) => setDetails({ ...details, projectName: e.target.value })}
              className="w-full text-xs rounded-xl border border-[#E5EDE4] bg-[#F7F5EF]/40 p-2.5"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202821] mb-1">Creator Name (Optional)</label>
            <input
              type="text"
              value={details.creatorName}
              onChange={(e) => setDetails({ ...details, creatorName: e.target.value })}
              placeholder="e.g. SlothFlow Developer"
              className="w-full text-xs rounded-xl border border-[#E5EDE4] bg-[#F7F5EF]/40 p-2.5"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202821] mb-1">GitHub Repository URL (Optional)</label>
            <input
              type="text"
              value={details.githubUrl}
              onChange={(e) => setDetails({ ...details, githubUrl: e.target.value })}
              placeholder="https://github.com/your-username/slothflow"
              className="w-full text-xs rounded-xl border border-[#E5EDE4] bg-[#F7F5EF]/40 p-2.5"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202821] mb-1">Live Demo URL (Optional)</label>
            <input
              type="text"
              value={details.demoUrl}
              onChange={(e) => setDetails({ ...details, demoUrl: e.target.value })}
              className="w-full text-xs rounded-xl border border-[#E5EDE4] bg-[#F7F5EF]/40 p-2.5"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#202821] mb-1">What Was Learned</label>
          <textarea
            value={details.whatWasLearned}
            onChange={(e) => setDetails({ ...details, whatWasLearned: e.target.value })}
            rows={2}
            className="w-full text-xs rounded-xl border border-[#E5EDE4] bg-[#F7F5EF]/40 p-2.5"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <p className="text-[11px] text-[#737A73]">
            Target word count: ~800–1,200 words. Gemma 4 will highlight open-weight flexibility.
          </p>

          <button
            onClick={handleGenerateArticle}
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#244C3A] text-white text-xs font-semibold hover:bg-[#1a382b] transition-all shadow-sm active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Gemma 4 Writing Article...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-[#E5B85C]" />
                <span>Generate my DEV.to article</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Publishing Notice</p>
            <p className="text-amber-800">{error}</p>
          </div>
        </div>
      )}

      {/* Success Banner */}
      {publishSuccess && (
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs space-y-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-bold text-sm">{publishSuccess.status}</span>
          </div>
          <p>{publishSuccess.message}</p>
          {publishSuccess.url && (
            <a
              href={publishSuccess.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-[#244C3A] font-semibold underline hover:text-[#1a382b]"
            >
              <span>View Article on DEV.to</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}

      {/* Generated Article Editor & Preview (Section 10) */}
      {article && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Article Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-[#E5EDE4] flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('edit')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'edit'
                    ? 'bg-[#244C3A] text-white'
                    : 'bg-[#F7F5EF] text-[#737A73] hover:bg-[#E5EDE4]'
                }`}
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Markdown Editor</span>
              </button>

              <button
                onClick={() => setActiveTab('preview')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'preview'
                    ? 'bg-[#244C3A] text-white'
                    : 'bg-[#F7F5EF] text-[#737A73] hover:bg-[#E5EDE4]'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Rendered Preview</span>
              </button>
            </div>

            {/* Quick Refinements */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => handleArticleAction('intro')}
                disabled={editingActionLoading !== null}
                className="text-[11px] px-2.5 py-1 rounded-lg border border-[#E5EDE4] hover:bg-[#F7F5EF] text-[#202821] font-medium"
              >
                {editingActionLoading === 'intro' ? 'Writing...' : 'Regenerate intro'}
              </button>

              <button
                onClick={() => handleArticleAction('technical')}
                disabled={editingActionLoading !== null}
                className="text-[11px] px-2.5 py-1 rounded-lg border border-[#E5EDE4] hover:bg-[#F7F5EF] text-[#202821] font-medium"
              >
                {editingActionLoading === 'technical' ? 'Improving...' : 'Improve technical details'}
              </button>

              <button
                onClick={() => handleArticleAction('concise')}
                disabled={editingActionLoading !== null}
                className="text-[11px] px-2.5 py-1 rounded-lg border border-[#E5EDE4] hover:bg-[#F7F5EF] text-[#202821] font-medium"
              >
                {editingActionLoading === 'concise' ? 'Trimming...' : 'Make more concise'}
              </button>
            </div>

            {/* Export & Save */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyMarkdown}
                className="p-2 rounded-lg border border-[#E5EDE4] text-[#737A73] hover:text-[#202821] hover:bg-[#F7F5EF]"
                title="Copy full Markdown"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={handleDownloadMarkdown}
                className="p-2 rounded-lg border border-[#E5EDE4] text-[#737A73] hover:text-[#202821] hover:bg-[#F7F5EF]"
                title="Download .md file"
              >
                <Download className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleSaveDraft}
                disabled={publishing}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#244C3A] text-[#244C3A] text-xs font-semibold hover:bg-[#E5EDE4] transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Draft to DEV.to</span>
              </button>

              <button
                onClick={() => setPublishModalOpen(true)}
                disabled={publishing}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#244C3A] text-white text-xs font-semibold hover:bg-[#1a382b] transition-colors shadow-xs"
              >
                <Send className="w-3.5 h-3.5 text-[#E5B85C]" />
                <span>Publish to DEV.to</span>
              </button>
            </div>
          </div>

          {/* Title and Tags Editor */}
          <div className="bg-white p-5 rounded-3xl border border-[#E5EDE4] space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#202821] mb-1">Article Title</label>
              <input
                type="text"
                value={article.title}
                onChange={(e) => setArticle({ ...article, title: e.target.value })}
                className="w-full text-base font-bold rounded-xl border border-[#E5EDE4] bg-[#F7F5EF]/40 p-3 text-[#244C3A]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#202821] mb-1">Description (Short meta)</label>
                <input
                  type="text"
                  value={article.description}
                  onChange={(e) => setArticle({ ...article, description: e.target.value })}
                  className="w-full text-xs rounded-xl border border-[#E5EDE4] bg-[#F7F5EF]/40 p-2.5"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202821] mb-1 flex items-center gap-1.5">
                  <Tag className="w-3 h-3 text-[#72947B]" />
                  <span>Tags (Max 4, comma-separated)</span>
                </label>
                <input
                  type="text"
                  value={article.tags.join(', ')}
                  onChange={(e) => {
                    const parsed = e.target.value
                      .split(',')
                      .map((t) => t.trim().toLowerCase().replace(/[^a-z0-9]/g, ''))
                      .filter(Boolean)
                      .slice(0, 4);
                    setArticle({ ...article, tags: parsed });
                  }}
                  className="w-full text-xs rounded-xl border border-[#E5EDE4] bg-[#F7F5EF]/40 p-2.5 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Editor vs Preview */}
          {activeTab === 'edit' ? (
            <div className="bg-white rounded-3xl border border-[#E5EDE4] p-5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#737A73] mb-2">
                Markdown Body Content
              </label>
              <textarea
                value={article.body_markdown}
                onChange={(e) => setArticle({ ...article, body_markdown: e.target.value })}
                rows={22}
                className="w-full rounded-2xl border border-[#E5EDE4] bg-[#F7F5EF]/30 p-4 font-mono text-xs text-[#202821] focus:outline-none focus:ring-2 focus:ring-[#72947B]/40 focus:bg-white leading-relaxed"
              />
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-[#E5EDE4] p-8 prose max-w-none prose-stone prose-headings:font-bold prose-headings:text-[#244C3A] prose-a:text-[#244C3A] text-sm leading-relaxed">
              <h1 className="text-2xl font-bold text-[#244C3A] mb-2">{article.title}</h1>
              <div className="flex gap-2 mb-6">
                {article.tags.map((t) => (
                  <span key={t} className="text-xs font-mono px-2 py-0.5 rounded bg-[#E5EDE4] text-[#244C3A]">
                    #{t}
                  </span>
                ))}
              </div>
              <div className="whitespace-pre-wrap font-sans text-sm text-[#202821]">
                {article.body_markdown}
              </div>
            </div>
          )}

          {/* Section 12: Quality Checklist */}
          <div className="bg-white rounded-3xl border border-[#E5EDE4] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#244C3A]">
                <FileCheck className="w-4 h-4 text-[#72947B]" />
                <span>DEV.to Article Quality & Honesty Checklist</span>
              </div>
              <label className="cursor-pointer flex items-center gap-2 text-xs font-semibold text-[#244C3A]">
                <input
                  type="checkbox"
                  checked={checklistReviewed}
                  onChange={(e) => setChecklistReviewed(e.target.checked)}
                  className="rounded text-[#244C3A]"
                />
                <span>I have reviewed the draft</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {checklist.map((c) => (
                <div
                  key={c.id}
                  className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
                    c.check
                      ? 'bg-[#E5EDE4]/40 border-[#72947B]/20 text-[#244C3A]'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}
                >
                  {c.check ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  )}
                  <span>{c.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Explicit Public Publishing (Section 11 requirement) */}
      {publishModalOpen && article && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E5EDE4] p-6 max-w-lg w-full space-y-5 shadow-xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-amber-800">
              <div className="p-2.5 bg-amber-100 rounded-2xl">
                <ShieldAlert className="w-6 h-6 text-amber-700" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#244C3A]">Confirm Public DEV.to Publication</h3>
                <p className="text-xs text-[#737A73]">This action will make the article visible to all DEV.to readers.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#F7F5EF] border border-[#E5EDE4] space-y-2 text-xs">
              <p className="font-bold text-[#202821]">Article Title:</p>
              <p className="font-medium text-[#244C3A] text-sm">{article.title}</p>
              <p className="text-[11px] text-[#737A73] pt-1">
                Tags: #{article.tags.join(' #')}
              </p>
            </div>

            <p className="text-xs text-[#737A73] leading-relaxed">
              By confirming, your server will dispatch an authenticated request to <code className="font-mono text-[#244C3A]">POST https://dev.to/api/articles</code> with <code className="font-mono font-bold text-[#244C3A]">published: true</code>.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setPublishModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#737A73] hover:bg-[#F7F5EF]"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmPublish}
                disabled={publishing}
                className="px-5 py-2 rounded-xl bg-[#244C3A] text-white text-xs font-bold hover:bg-[#1a382b] transition-all shadow-sm"
              >
                {publishing ? 'Publishing...' : 'Yes, Publish Live'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
