import React, { useState } from 'react';
import { executeAiTask } from '../services/aiService';
import {
  HostedModelId,
  InferenceMode,
  ReplyAssistantResult,
  ReplyTone,
} from '../types';
import { SlothMascot } from '../components/SlothMascot';
import {
  MessageSquare,
  Sparkles,
  Copy,
  Check,
  AlertCircle,
  RotateCcw,
  Edit3,
  ShieldCheck,
  Smile,
  Send,
} from 'lucide-react';

interface ReplyAssistantProps {
  mode: InferenceMode;
  hostedModel: HostedModelId;
  ollamaBaseUrl: string;
  localModel: string;
  defaultTone: ReplyTone;
}

export const ReplyAssistantView: React.FC<ReplyAssistantProps> = ({
  mode,
  hostedModel,
  ollamaBaseUrl,
  localModel,
  defaultTone,
}) => {
  const [receivedMessage, setReceivedMessage] = useState('');
  const [intent, setIntent] = useState('');
  const [tone, setTone] = useState<ReplyTone>(defaultTone || 'Friendly');
  const [desiredLength, setDesiredLength] = useState<'Very short' | 'Moderate' | 'Detailed'>('Moderate');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReplyAssistantResult | null>(null);
  const [editableReply, setEditableReply] = useState('');
  const [copied, setCopied] = useState(false);

  const loadExample = () => {
    setReceivedMessage(
      `Hey! Any chance you can take a look at the design system branch before the end of the day? We kind of need your sign-off before QA tests it tomorrow morning.`
    );
    setIntent(
      `I'm swamped with another launch today so I can't look at it tonight. I will review it first thing tomorrow morning by 9:30 AM.`
    );
    setTone('Polite but firm');
    setDesiredLength('Moderate');
  };

  const handleGenerate = async () => {
    if (!receivedMessage.trim()) {
      setError('Please provide the message you received.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await executeAiTask({
        feature: 'reply-assistant',
        input: receivedMessage,
        preferences: {
          intent,
          tone,
          desiredLength,
        },
        mode,
        hostedModel,
        ollamaBaseUrl,
        localModel,
      });

      if (data && typeof data === 'object') {
        const validated: ReplyAssistantResult = {
          replyText: data.replyText || 'Thank you for your message.',
          toneUsed: data.toneUsed || tone,
          keyPointsCovered: Array.isArray(data.keyPointsCovered) ? data.keyPointsCovered : [],
          slothTip: data.slothTip,
          rawText: data.rawText,
        };
        setResult(validated);
        setEditableReply(validated.replyText);
      } else {
        throw new Error('Received unexpected reply format from Gemma 4.');
      }
    } catch (err: any) {
      console.error('Reply drafting failed:', err);
      setError(err?.message || 'Failed to draft reply with Gemma 4.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editableReply);
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
              <MessageSquare className="w-5 h-5" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#244C3A]">Reply Assistant</h1>
          </div>
          <p className="text-sm text-[#737A73] mt-1.5">
            Draft calm, clear responses in your chosen tone without the emotional drain of typing from scratch.
          </p>
        </div>

        <button
          onClick={loadExample}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#E5EDE4]/70 text-[#244C3A] hover:bg-[#E5EDE4] transition-colors"
        >
          Try an example
        </button>
      </div>

      {/* Input workspace */}
      <div className="bg-white rounded-3xl border border-[#E5EDE4] p-6 shadow-xs space-y-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#737A73] mb-2">
            Message You Received
          </label>
          <textarea
            value={receivedMessage}
            onChange={(e) => setReceivedMessage(e.target.value)}
            rows={4}
            placeholder="Paste the email, Slack DM, client question, or text you need to respond to..."
            className="w-full rounded-2xl border border-[#E5EDE4] bg-[#F7F5EF]/40 p-4 text-sm text-[#202821] placeholder:text-[#737A73]/60 focus:outline-none focus:ring-2 focus:ring-[#72947B]/40 focus:bg-white transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#737A73] mb-2">
            What You Want to Say (Raw Thoughts / Boundaries)
          </label>
          <input
            type="text"
            value={intent}
            onChange={(e) => setIntent(e.target.value)}
            placeholder="e.g. Yes but next week; No thanks; Need more time; Price is non-negotiable"
            className="w-full text-xs rounded-xl border border-[#E5EDE4] bg-[#F7F5EF]/40 p-3 text-[#202821] placeholder:text-[#737A73]/60 focus:outline-none focus:ring-2 focus:ring-[#72947B]/40 focus:bg-white"
          />
        </div>

        {/* Tone and Length Selection: Section 8 requirements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block text-xs font-semibold text-[#202821] mb-1.5">
              Preferred Tone
            </label>
            <div className="grid grid-cols-3 gap-1">
              {(['Friendly', 'Professional', 'Casual', 'Polite but firm', 'Brief and direct'] as ReplyTone[]).map(
                (t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    className={`text-[11px] py-2 px-1 rounded-lg font-medium text-center truncate transition-colors ${
                      tone === t
                        ? 'bg-[#244C3A] text-white shadow-xs'
                        : 'bg-[#F7F5EF] text-[#737A73] hover:bg-[#E5EDE4]'
                    }`}
                  >
                    {t}
                  </button>
                )
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202821] mb-1.5">
              Desired Length
            </label>
            <div className="grid grid-cols-3 gap-1">
              {(['Very short', 'Moderate', 'Detailed'] as const).map((len) => (
                <button
                  key={len}
                  type="button"
                  onClick={() => setDesiredLength(len)}
                  className={`text-[11px] py-2 rounded-lg font-medium transition-colors ${
                    desiredLength === len
                      ? 'bg-[#244C3A] text-white shadow-xs'
                      : 'bg-[#F7F5EF] text-[#737A73] hover:bg-[#E5EDE4]'
                  }`}
                >
                  {len}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Boundary Notice: Section 8 Requirement */}
        <div className="flex items-center gap-2 text-[11px] text-[#737A73] pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-[#72947B]" />
          <span>
            SlothFlow drafts the reply for your review. It will <strong>never</strong> send messages automatically or invent personal promises.
          </span>
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-[#E5EDE4] flex items-center justify-between">
          <button
            onClick={() => {
              setReceivedMessage('');
              setIntent('');
              setResult(null);
              setEditableReply('');
              setError(null);
            }}
            disabled={loading || (!receivedMessage && !result)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-[#737A73] hover:text-[#202821] hover:bg-[#F7F5EF] transition-colors disabled:opacity-40"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>

          <button
            onClick={handleGenerate}
            disabled={loading || !receivedMessage.trim()}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#244C3A] text-white text-xs font-semibold hover:bg-[#1a382b] transition-all shadow-sm active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Gemma 4 Drafting...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-[#E5B85C]" />
                <span>Draft Response</span>
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

      {/* Result Display: Editable in place & Copyable */}
      {result && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl border border-[#E5EDE4] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlothMascot size={26} mood="hanging" />
                <span className="text-xs font-bold text-[#244C3A]">
                  Draft ({result.toneUsed})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="p-1.5 text-[#737A73] hover:text-[#202821] hover:bg-[#F7F5EF] rounded-lg transition-colors"
                  title="Regenerate reply"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#244C3A] text-white text-xs font-medium hover:bg-[#1a382b] transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#E5B85C]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Reply'}</span>
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#737A73] flex items-center gap-1">
                  <Edit3 className="w-3 h-3 text-[#72947B]" />
                  <span>Editable Reply</span>
                </label>
                <span className="text-[11px] text-[#737A73]">Review & customize before sending</span>
              </div>

              <textarea
                value={editableReply}
                onChange={(e) => setEditableReply(e.target.value)}
                rows={5}
                className="w-full rounded-2xl border border-[#E5EDE4] bg-[#F7F5EF]/40 p-4 text-sm text-[#202821] focus:outline-none focus:ring-2 focus:ring-[#72947B]/40 focus:bg-white leading-relaxed"
              />
            </div>

            {/* Key Points Covered */}
            {result.keyPointsCovered.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-[#F7F5EF] border border-[#E5EDE4] space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#737A73]">
                  Key Points Addressed
                </p>
                <div className="flex flex-wrap gap-2 pt-0.5">
                  {result.keyPointsCovered.map((pt, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2.5 py-1 rounded-full bg-white border border-[#E5EDE4] text-[#244C3A] font-medium"
                    >
                      {pt}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Sloth Communication Tip */}
            {result.slothTip && (
              <div className="p-4 rounded-2xl bg-[#E5EDE4]/60 border border-[#72947B]/30 flex items-start gap-3">
                <Smile className="w-4 h-4 text-[#72947B] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-[#244C3A]">Sloth Tip</p>
                  <p className="text-[#202821] mt-0.5 leading-relaxed">{result.slothTip}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
