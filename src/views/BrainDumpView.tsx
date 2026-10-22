import React, { useState } from 'react';
import { executeAiTask } from '../services/aiService';
import {
  BrainDumpResult,
  ConfigStatus,
  EnergyLevel,
  HostedModelId,
  InferenceMode,
  LocalOllamaStatus,
} from '../types';
import { SlothMascot } from '../components/SlothMascot';
import {
  Brain,
  Sparkles,
  RotateCcw,
  Copy,
  Download,
  Check,
  AlertCircle,
  Clock,
  Battery,
  Shield,
  ArrowRight,
  ListOrdered,
  CalendarX,
  Trash2,
  CheckCircle2,
} from 'lucide-react';

interface BrainDumpViewProps {
  mode: InferenceMode;
  hostedModel: HostedModelId;
  ollamaBaseUrl: string;
  localModel: string;
  defaultEnergy: EnergyLevel;
  configStatus: ConfigStatus;
  ollamaStatus: LocalOllamaStatus;
  saveHistory: boolean;
}

export const BrainDumpView: React.FC<BrainDumpViewProps> = ({
  mode,
  hostedModel,
  ollamaBaseUrl,
  localModel,
  defaultEnergy,
  configStatus,
  ollamaStatus,
  saveHistory,
}) => {
  const [input, setInput] = useState('');
  const [context, setContext] = useState('');
  const [energy, setEnergy] = useState<EnergyLevel>(defaultEnergy || 'Medium');
  const [timeAvailable, setTimeAvailable] = useState('45 minutes');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BrainDumpResult | null>(null);
  const [copied, setCopied] = useState(false);

  // Sample prompt to help user test quickly
  const loadExample = () => {
    setInput(
      `Need to finish the slide deck for tomorrow's standup.
Also my car registration is due next Tuesday.
Haven't replied to Sarah about dinner this weekend.
Need to buy oat milk and dog food.
Read 3 chapters of biology book if I have time.
Fix the broken button bug on the staging site.
Laundry is piling up in the basket.`
    );
    setContext('Work & Personal Life');
    setEnergy('Low');
    setTimeAvailable('30 minutes');
  };

  const handleGenerate = async () => {
    if (!input.trim()) {
      setError('Please paste or type some unorganized thoughts first.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await executeAiTask({
        feature: 'brain-dump',
        input,
        preferences: {
          energy,
          timeAvailable,
          context,
        },
        mode,
        hostedModel,
        ollamaBaseUrl,
        localModel,
      });

      if (data && typeof data === 'object') {
        const validated: BrainDumpResult = {
          summary: data.summary || 'Summary unavailable.',
          nextAction: data.nextAction || 'Start with the smallest 2-minute step.',
          actionableTasks: Array.isArray(data.actionableTasks) ? data.actionableTasks : [],
          canWait: Array.isArray(data.canWait) ? data.canWait : [],
          removeOrDelegate: Array.isArray(data.removeOrDelegate) ? data.removeOrDelegate : [],
          suggestedOrder: Array.isArray(data.suggestedOrder) ? data.suggestedOrder : [],
          rawText: data.rawText,
        };
        setResult(validated);

        if (saveHistory) {
          try {
            const stored = JSON.parse(localStorage.getItem('slothflow_brain_dump_history') || '[]');
            stored.unshift({
              id: Date.now().toString(),
              timestamp: new Date().toISOString(),
              summary: validated.summary,
              tasksCount: validated.actionableTasks.length,
            });
            localStorage.setItem('slothflow_brain_dump_history', JSON.stringify(stored.slice(0, 20)));
          } catch {
            // ignore storage errors
          }
        }
      } else {
        throw new Error('Received unexpected output format from Gemma 4.');
      }
    } catch (err: any) {
      console.error('Brain dump processing failed:', err);
      setError(err?.message || 'Failed to process brain dump with Gemma 4.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setInput('');
    setContext('');
    setResult(null);
    setError(null);
  };

  const generateMarkdownExport = () => {
    if (!result) return '';
    let md = `# SlothFlow Brain Dump Summary\n\n`;
    md += `> **Main Focus:** ${result.summary}\n\n`;
    md += `## ⚡ 5-Minute Quick Momentum Action\n${result.nextAction}\n\n`;

    if (result.actionableTasks.length > 0) {
      md += `## 📋 Actionable Tasks\n`;
      result.actionableTasks.forEach((t) => {
        md += `- [ ] **${t.task}** [Priority: ${t.priority} | Est: ${t.effort}]${t.whyNow ? ` - *${t.whyNow}*` : ''}\n`;
      });
      md += `\n`;
    }

    if (result.suggestedOrder.length > 0) {
      md += `## 🚶 Realistic Suggested Flow\n`;
      result.suggestedOrder.forEach((step, idx) => {
        md += `${idx + 1}. ${step}\n`;
      });
      md += `\n`;
    }

    if (result.canWait.length > 0) {
      md += `## ⏸️ Can Wait (Preserve Your Energy)\n`;
      result.canWait.forEach((w) => {
        md += `- **${w.task}**: ${w.reason}\n`;
      });
      md += `\n`;
    }

    if (result.removeOrDelegate.length > 0) {
      md += `## 🍃 Drop or Delegate\n`;
      result.removeOrDelegate.forEach((r) => {
        md += `- **${r.task}**: ${r.recommendation}\n`;
      });
    }

    return md;
  };

  const handleCopy = () => {
    const md = generateMarkdownExport();
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const md = generateMarkdownExport();
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `slothflow-brain-dump-${new Date().toISOString().slice(0, 10)}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#E5EDE4] rounded-xl text-[#244C3A]">
              <Brain className="w-5 h-5" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#244C3A]">Brain Dump</h1>
          </div>
          <p className="text-sm text-[#737A73] mt-1.5">
            Pour out your thoughts, tasks, and chaotic mental notes. Gemma 4 sorts them with zero guilt.
          </p>
        </div>

        <button
          onClick={loadExample}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#E5EDE4]/70 text-[#244C3A] hover:bg-[#E5EDE4] transition-colors"
        >
          Try an example
        </button>
      </div>

      {/* Input Workspace */}
      <div className="bg-white rounded-3xl border border-[#E5EDE4] p-6 shadow-xs space-y-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#737A73] mb-2">
            Unstructured Notes & Tasks
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={6}
            placeholder="What's spinning in your head right now? Paste notes, deadlines, chores, loose reminders..."
            className="w-full rounded-2xl border border-[#E5EDE4] bg-[#F7F5EF]/40 p-4 text-sm text-[#202821] placeholder:text-[#737A73]/60 focus:outline-none focus:ring-2 focus:ring-[#72947B]/40 focus:bg-white transition-all resize-y"
          />
        </div>

        {/* Parameters: Context, Energy, Time */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div>
            <label className="block text-xs font-semibold text-[#202821] mb-1.5 flex items-center gap-1.5">
              <span>Context (Optional)</span>
            </label>
            <input
              type="text"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="e.g. Work, Finals week, Weekend"
              className="w-full text-xs rounded-xl border border-[#E5EDE4] bg-[#F7F5EF]/40 px-3 py-2.5 text-[#202821] focus:outline-none focus:ring-1 focus:ring-[#72947B]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202821] mb-1.5 flex items-center gap-1.5">
              <Battery className="w-3.5 h-3.5 text-[#72947B]" />
              <span>Current Energy</span>
            </label>
            <div className="grid grid-cols-4 gap-1">
              {(['Very low', 'Low', 'Medium', 'High'] as EnergyLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setEnergy(lvl)}
                  className={`text-[11px] py-2 rounded-lg font-medium transition-colors ${
                    energy === lvl
                      ? 'bg-[#244C3A] text-white shadow-xs'
                      : 'bg-[#F7F5EF] text-[#737A73] hover:bg-[#E5EDE4]'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202821] mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#72947B]" />
              <span>Available Time</span>
            </label>
            <select
              value={timeAvailable}
              onChange={(e) => setTimeAvailable(e.target.value)}
              className="w-full text-xs rounded-xl border border-[#E5EDE4] bg-[#F7F5EF]/40 px-3 py-2.5 text-[#202821] focus:outline-none focus:ring-1 focus:ring-[#72947B]"
            >
              <option value="15 minutes">15 minutes (Quick triage)</option>
              <option value="30 minutes">30 minutes</option>
              <option value="45 minutes">45 minutes</option>
              <option value="1 hour">1 hour</option>
              <option value="2 hours">2 hours</option>
              <option value="Rest of the day">Rest of the day</option>
            </select>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="pt-2 flex items-center gap-2 text-[11px] text-[#737A73]">
          <Shield className="w-3.5 h-3.5 text-[#72947B]" />
          <span>
            {mode === 'local'
              ? `Inference will run 100% locally on your machine via Ollama (${localModel}). No data is sent to the cloud.`
              : `Inference will use Hosted Gemma 4 (${hostedModel}) through Google's GenAI API.`}
          </span>
        </div>

        {/* Action Controls */}
        <div className="pt-3 border-t border-[#E5EDE4] flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleClear}
            disabled={loading || (!input && !result)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-[#737A73] hover:text-[#202821] hover:bg-[#F7F5EF] transition-colors disabled:opacity-40"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>

          <button
            onClick={handleGenerate}
            disabled={loading || !input.trim()}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#244C3A] text-white text-xs font-semibold hover:bg-[#1a382b] transition-all shadow-sm active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Gemma 4 Organizing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-[#E5B85C]" />
                <span>Generate Organized Tasks</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">{error}</p>
            <p className="text-amber-800/80">
              {mode === 'hosted'
                ? 'Check that GEMINI_API_KEY is configured in AI Studio Secrets, or switch to Local Ollama in Settings.'
                : 'Ensure Ollama is running (`ollama serve`) and the model is downloaded (`ollama pull gemma4:e2b`).'}
            </p>
          </div>
        </div>
      )}

      {/* Structured Output Presentation */}
      {result && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Header & Export controls */}
          <div className="flex items-center justify-between bg-white px-5 py-3 rounded-2xl border border-[#E5EDE4]">
            <div className="flex items-center gap-2">
              <SlothMascot size={28} mood="resting" />
              <span className="text-xs font-bold text-[#244C3A]">Gemma 4 Calm Plan</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5EDE4] text-xs font-medium text-[#202821] hover:bg-[#F7F5EF] transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#737A73]" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5EDE4] text-xs font-medium text-[#202821] hover:bg-[#F7F5EF] transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-[#737A73]" />
                <span>Export .md</span>
              </button>
            </div>
          </div>

          {/* 1. Main Priority Summary */}
          <div className="p-5 rounded-2xl bg-[#E5EDE4]/70 border border-[#72947B]/30 text-[#244C3A]">
            <p className="text-xs font-bold uppercase tracking-wider opacity-75">Main Priority</p>
            <p className="text-base font-semibold mt-1 leading-snug">{result.summary}</p>
          </div>

          {/* 5-minute Micro Action (Section 5 requirement) */}
          <div className="p-5 rounded-2xl bg-white border-2 border-[#E5B85C]/60 shadow-xs flex items-start gap-4">
            <div className="p-2.5 bg-[#E5B85C]/20 rounded-xl text-[#855B14] shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#855B14]">
                Next Action (Under 5 Minutes)
              </span>
              <p className="text-sm font-semibold text-[#202821] mt-0.5 leading-relaxed">
                {result.nextAction}
              </p>
              <p className="text-xs text-[#737A73] mt-1">
                Sloth wisdom: Starting tiny is 90% of overcoming friction. Do just this one step now.
              </p>
            </div>
          </div>

          {/* 2 & 3 & 4. Actionable Tasks */}
          {result.actionableTasks.length > 0 && (
            <div className="bg-white rounded-3xl border border-[#E5EDE4] p-6 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#244C3A] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#72947B]" />
                <span>Actionable Tasks</span>
              </h3>

              <div className="divide-y divide-[#E5EDE4]/60">
                {result.actionableTasks.map((t, idx) => (
                  <div key={idx} className="py-3 flex items-start justify-between gap-4 first:pt-0 last:pb-0">
                    <div className="space-y-1">
                      <span className="text-sm font-medium text-[#202821]">{t.task}</span>
                      {t.whyNow && <p className="text-xs text-[#737A73]">{t.whyNow}</p>}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#F7F5EF] text-[#737A73] font-mono border border-[#E5EDE4]">
                        {t.effort}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          t.priority === 'High'
                            ? 'bg-red-100 text-red-700'
                            : t.priority === 'Medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-[#E5EDE4] text-[#244C3A]'
                        }`}
                      >
                        {t.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. Realistic Suggested Order */}
          {result.suggestedOrder.length > 0 && (
            <div className="bg-white rounded-3xl border border-[#E5EDE4] p-6 space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#244C3A] flex items-center gap-2">
                <ListOrdered className="w-4 h-4 text-[#72947B]" />
                <span>Suggested Calm Workflow</span>
              </h3>
              <ol className="space-y-2 text-xs text-[#202821]">
                {result.suggestedOrder.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 p-2 rounded-xl bg-[#F7F5EF]">
                    <span className="w-5 h-5 rounded-full bg-[#E5EDE4] text-[#244C3A] font-bold flex items-center justify-center shrink-0 text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="mt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* 6 & 7. Tasks that can wait or be dropped */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.canWait.length > 0 && (
              <div className="p-5 rounded-2xl bg-white border border-[#E5EDE4] space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#737A73]">
                  <CalendarX className="w-4 h-4 text-amber-600" />
                  <span>Can Wait (Not Today)</span>
                </div>
                <div className="space-y-2">
                  {result.canWait.map((w, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-[#F7F5EF] text-xs space-y-0.5">
                      <p className="font-semibold text-[#202821]">{w.task}</p>
                      <p className="text-[#737A73] text-[11px]">{w.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.removeOrDelegate.length > 0 && (
              <div className="p-5 rounded-2xl bg-white border border-[#E5EDE4] space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#737A73]">
                  <Trash2 className="w-4 h-4 text-stone-500" />
                  <span>Drop or Delegate</span>
                </div>
                <div className="space-y-2">
                  {result.removeOrDelegate.map((r, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-[#F7F5EF] text-xs space-y-0.5">
                      <p className="font-semibold text-[#202821]">{r.task}</p>
                      <p className="text-[#737A73] text-[11px]">{r.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
