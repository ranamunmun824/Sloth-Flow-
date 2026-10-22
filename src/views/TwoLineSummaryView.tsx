import React, { useState } from 'react';
import { executeAiTask } from '../services/aiService';
import {
  ConfigStatus,
  HostedModelId,
  InferenceMode,
  LocalOllamaStatus,
  SummaryTone,
  TwoLineSummaryResult,
} from '../types';
import { SlothMascot } from '../components/SlothMascot';
import {
  FileText,
  Sparkles,
  RotateCcw,
  Copy,
  Check,
  AlertCircle,
  AlertTriangle,
  ShieldCheck,
  Sliders,
  CheckSquare,
  Calendar,
} from 'lucide-react';

interface TwoLineSummaryProps {
  mode: InferenceMode;
  hostedModel: HostedModelId;
  ollamaBaseUrl: string;
  localModel: string;
  configStatus: ConfigStatus;
  ollamaStatus: LocalOllamaStatus;
}

export const TwoLineSummaryView: React.FC<TwoLineSummaryProps> = ({
  mode,
  hostedModel,
  ollamaBaseUrl,
  localModel,
}) => {
  const [inputText, setInputText] = useState('');
  const [tone, setTone] = useState<SummaryTone>('standard');
  const [includeActions, setIncludeActions] = useState(true);
  const [includeDates, setIncludeDates] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TwoLineSummaryResult | null>(null);
  const [copied, setCopied] = useState(false);

  const loadExample = () => {
    setInputText(
      `From: Jordan (Head of Design)
Subject: Design sync follow-up & Q4 Design System

Hey team, thanks for jumping onto the call today. As discussed, the transition from Figma components to our React token system has hit a slight blocker because the tokens haven't been signed off by engineering. 

We agreed that Maya will finalize the color palette tokens by Thursday 5 PM. Then, the frontend engineering team can run the build script on Friday morning. If we don't hit the Thursday deadline, the whole Q4 release is going to slip by at least two weeks. Also, please remember to update the sprint retro document before our Monday 10 AM retrospective. Note that Jordan mentioned maybe doing a design offsite in November, but no budget or location was agreed on yet.`
    );
    setTone('standard');
    setIncludeActions(true);
    setIncludeDates(true);
  };

  const handleSummarize = async () => {
    if (!inputText.trim()) {
      setError('Please paste or type text to summarize.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await executeAiTask({
        feature: 'two-line-summary',
        input: inputText,
        preferences: {
          tone,
          includeActionItems: includeActions,
          includeDates,
        },
        mode,
        hostedModel,
        ollamaBaseUrl,
        localModel,
      });

      if (data && typeof data === 'object') {
        const validated: TwoLineSummaryResult = {
          twoLineSummary: data.twoLineSummary || 'Summary unavailable.',
          centralMessage: data.centralMessage || 'Central message unavailable.',
          actionItems: Array.isArray(data.actionItems) ? data.actionItems : [],
          importantDatesAndDeadlines: Array.isArray(data.importantDatesAndDeadlines)
            ? data.importantDatesAndDeadlines
            : [],
          ambiguityWarning: data.ambiguityWarning || null,
          rawText: data.rawText,
        };
        setResult(validated);
      } else {
        throw new Error('Received unexpected summary output from Gemma 4.');
      }
    } catch (err: any) {
      console.error('Summary error:', err);
      setError(err?.message || 'Failed to generate summary with Gemma 4.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    let txt = `📄 SlothFlow Two-Line Summary\n\n`;
    txt += `Key Takeaway: ${result.centralMessage}\n\n`;
    txt += `Summary:\n${result.twoLineSummary}\n\n`;
    if (result.actionItems.length > 0) {
      txt += `Action Items:\n` + result.actionItems.map((a) => `- ${a}`).join('\n') + `\n\n`;
    }
    if (result.importantDatesAndDeadlines.length > 0) {
      txt += `Dates & Deadlines:\n` + result.importantDatesAndDeadlines.map((d) => `- ${d}`).join('\n') + `\n\n`;
    }
    if (result.ambiguityWarning) {
      txt += `⚠️ Warning: ${result.ambiguityWarning}\n`;
    }

    navigator.clipboard.writeText(txt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#E5EDE4] rounded-xl text-[#244C3A]">
              <FileText className="w-5 h-5" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#244C3A]">Two-Line Summary</h1>
          </div>
          <p className="text-sm text-[#737A73] mt-1.5">
            Cut straight to the point. Exactly two sentences, the core decision, and zero fluff.
          </p>
        </div>

        <button
          onClick={loadExample}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#E5EDE4]/70 text-[#244C3A] hover:bg-[#E5EDE4] transition-colors"
        >
          Try an example
        </button>
      </div>

      {/* Input area */}
      <div className="bg-white rounded-3xl border border-[#E5EDE4] p-6 shadow-xs space-y-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#737A73] mb-2">
            Text to Condense
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={7}
            placeholder="Paste lengthy meeting notes, Slack messages, articles, or student materials..."
            className="w-full rounded-2xl border border-[#E5EDE4] bg-[#F7F5EF]/40 p-4 text-sm text-[#202821] placeholder:text-[#737A73]/60 focus:outline-none focus:ring-2 focus:ring-[#72947B]/40 focus:bg-white transition-all"
          />
        </div>

        {/* Explicit Privacy Reminder: Section 7 Requirement */}
        <div className="p-3.5 rounded-2xl bg-[#F7F5EF] border border-[#E5EDE4] flex items-center gap-3 text-xs text-[#737A73]">
          <ShieldCheck className="w-4 h-4 text-[#72947B] shrink-0" />
          <span>
            <strong>Privacy Guarantee:</strong> SlothFlow does not connect to or monitor your email, WhatsApp, or private chat apps. All summarization happens on text you explicitly paste here.
          </span>
        </div>

        {/* Optional Controls: Section 7 Requirement */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div>
            <label className="block text-xs font-semibold text-[#202821] mb-1.5 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[#72947B]" />
              <span>Language Style</span>
            </label>
            <div className="grid grid-cols-3 gap-1">
              {(['standard', 'formal', 'simple'] as SummaryTone[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTone(t)}
                  className={`text-[11px] py-2 rounded-lg capitalize font-medium transition-colors ${
                    tone === t
                      ? 'bg-[#244C3A] text-white shadow-xs'
                      : 'bg-[#F7F5EF] text-[#737A73] hover:bg-[#E5EDE4]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center">
            <label className="cursor-pointer flex items-center gap-2 text-xs font-medium text-[#202821] p-3 rounded-xl bg-[#F7F5EF] border border-[#E5EDE4] w-full">
              <input
                type="checkbox"
                checked={includeActions}
                onChange={(e) => setIncludeActions(e.target.checked)}
                className="rounded text-[#244C3A] focus:ring-[#72947B]"
              />
              <CheckSquare className="w-3.5 h-3.5 text-[#72947B]" />
              <span>Extract Action Items</span>
            </label>
          </div>

          <div className="flex items-center">
            <label className="cursor-pointer flex items-center gap-2 text-xs font-medium text-[#202821] p-3 rounded-xl bg-[#F7F5EF] border border-[#E5EDE4] w-full">
              <input
                type="checkbox"
                checked={includeDates}
                onChange={(e) => setIncludeDates(e.target.checked)}
                className="rounded text-[#244C3A] focus:ring-[#72947B]"
              />
              <Calendar className="w-3.5 h-3.5 text-[#72947B]" />
              <span>Dates & Deadlines</span>
            </label>
          </div>
        </div>

        {/* Controls */}
        <div className="pt-3 border-t border-[#E5EDE4] flex items-center justify-between">
          <button
            onClick={() => {
              setInputText('');
              setResult(null);
              setError(null);
            }}
            disabled={loading || (!inputText && !result)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-[#737A73] hover:text-[#202821] hover:bg-[#F7F5EF] transition-colors disabled:opacity-40"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>

          <button
            onClick={handleSummarize}
            disabled={loading || !inputText.trim()}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#244C3A] text-white text-xs font-semibold hover:bg-[#1a382b] transition-all shadow-sm active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Gemma 4 Condensing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-[#E5B85C]" />
                <span>Summarize to 2 Lines</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Summary Output */}
      {result && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-between bg-white px-5 py-3 rounded-2xl border border-[#E5EDE4]">
            <div className="flex items-center gap-2">
              <SlothMascot size={26} mood="thinking" />
              <span className="text-xs font-bold text-[#244C3A]">2-Line Distillation</span>
            </div>

            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5EDE4] text-xs font-medium text-[#202821] hover:bg-[#F7F5EF] transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#737A73]" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Ambiguity Warning if input lacked clarity */}
          {result.ambiguityWarning && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Ambiguity / Insufficient Context Notice</p>
                <p className="mt-0.5 text-amber-800">{result.ambiguityWarning}</p>
              </div>
            </div>
          )}

          {/* Central Message */}
          <div className="p-4 rounded-2xl bg-[#E5EDE4]/60 border border-[#72947B]/30">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#244C3A]">
              Central Message
            </span>
            <p className="text-sm font-semibold text-[#244C3A] mt-0.5">{result.centralMessage}</p>
          </div>

          {/* Exactly Two Lines Summary */}
          <div className="bg-white rounded-3xl border border-[#E5EDE4] p-6 space-y-2 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#737A73]">
              Two-Line Summary
            </span>
            <p className="text-base text-[#202821] leading-relaxed font-medium">
              {result.twoLineSummary}
            </p>
          </div>

          {/* Action Items & Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.actionItems.length > 0 && (
              <div className="p-5 rounded-2xl bg-white border border-[#E5EDE4] space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#244C3A] flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-[#72947B]" />
                  <span>Key Decisions & Action Items</span>
                </span>
                <ul className="space-y-2 text-xs text-[#202821]">
                  {result.actionItems.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 p-2 rounded-xl bg-[#F7F5EF]">
                      <span className="text-emerald-600 font-bold">&bull;</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.importantDatesAndDeadlines.length > 0 && (
              <div className="p-5 rounded-2xl bg-white border border-[#E5EDE4] space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#244C3A] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#72947B]" />
                  <span>Important Dates & Deadlines</span>
                </span>
                <ul className="space-y-2 text-xs text-[#202821]">
                  {result.importantDatesAndDeadlines.map((date, idx) => (
                    <li key={idx} className="flex items-start gap-2 p-2 rounded-xl bg-[#F7F5EF]">
                      <span className="text-[#E5B85C] font-bold">&bull;</span>
                      <span>{date}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
