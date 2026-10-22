import React from 'react';
import { SlothMascot } from '../components/SlothMascot';
import { NavTab } from '../components/Sidebar';
import { ConfigStatus, InferenceMode, LocalOllamaStatus } from '../types';
import {
  Brain,
  CalendarCheck,
  FileText,
  MessageSquare,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Heart,
} from 'lucide-react';

interface HomeViewProps {
  onNavigate: (tab: NavTab) => void;
  mode: InferenceMode;
  hostedModel: string;
  localModel: string;
  configStatus: ConfigStatus;
  ollamaStatus: LocalOllamaStatus;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  mode,
  hostedModel,
  localModel,
  configStatus,
  ollamaStatus,
}) => {
  const isHosted = mode === 'hosted';
  const isVerified = isHosted
    ? configStatus.hostedGemmaConfigured
    : ollamaStatus.tested && ollamaStatus.reachable && !ollamaStatus.error;

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#E5EDE4]/70 to-[#F7F5EF] border border-[#E5EDE4] p-8 md:p-12 shadow-xs">
        <div className="absolute top-4 right-4 md:top-8 md:right-8 opacity-80 pointer-events-none">
          <SlothMascot size={120} mood="hanging" />
        </div>

        <div className="max-w-2xl relative z-10 space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-[#72947B]/30 text-xs font-semibold text-[#244C3A]">
            <Sparkles className="w-3.5 h-3.5 text-[#E5B85C]" />
            <span>Built for the Slow and Steady Challenge &bull; Gemma 4</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-[#244C3A] leading-[1.15]">
            Let AI handle the little things.
          </h1>

          <p className="text-base md:text-lg text-[#202821]/80 leading-relaxed">
            Turn messy thoughts into tiny plans, long notes into clear summaries, and everyday busywork into something you barely have to think about.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={() => onNavigate('brain-dump')}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#244C3A] text-white font-medium hover:bg-[#1a382b] transition-all shadow-md shadow-[#244C3A]/15 active:scale-[0.98]"
            >
              <span>Start being a sloth</span>
              <ArrowRight className="w-4 h-4 text-[#E5B85C]" />
            </button>

            <button
              onClick={() => onNavigate('tiny-plan')}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white border border-[#E5EDE4] text-[#244C3A] font-medium hover:bg-[#E5EDE4]/50 transition-colors"
            >
              <CalendarCheck className="w-4 h-4 text-[#72947B]" />
              <span>Make a Tiny Plan</span>
            </button>
          </div>
        </div>

        {/* Live Model Status Indicator Banner */}
        <div className="mt-8 pt-6 border-t border-[#E5EDE4]/80 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2.5">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isVerified ? 'bg-emerald-600' : 'bg-amber-500'
              }`}
            />
            <span className="text-[#202821] font-semibold">Active Engine:</span>
            <span className="font-mono bg-white px-2 py-0.5 rounded border border-[#E5EDE4] text-[#244C3A]">
              {isHosted ? `Hosted Gemma 4 (${hostedModel})` : `Local Gemma 4 (${localModel})`}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[#737A73]">
              {isHosted
                ? isVerified
                  ? 'Cloud API key confirmed'
                  : 'API key required in AI Studio Secrets'
                : isVerified
                ? 'Local Ollama connection tested'
                : 'Ollama connection untested'}
            </span>
            <button
              onClick={() => onNavigate('settings')}
              className="text-[#244C3A] font-semibold underline hover:text-[#1a382b]"
            >
              Configure
            </button>
          </div>
        </div>
      </section>

      {/* 3 Core Feature Cards Required by Spec */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#244C3A]">Calm Productivity Tools</h2>
          <span className="text-xs text-[#737A73]">Zero hustle-culture, 100% actionable</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Feature 1 */}
          <div
            onClick={() => onNavigate('brain-dump')}
            className="group cursor-pointer bg-white rounded-2xl border border-[#E5EDE4] p-6 hover:border-[#72947B]/50 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#E5EDE4] text-[#244C3A] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#244C3A] group-hover:text-[#1a382b]">
                Organize my thoughts
              </h3>
              <p className="text-sm text-[#737A73] leading-relaxed">
                Paste cluttered reminders, unfinished work, and loose ideas. Gemma 4 sorts them into 5-minute wins, deferred tasks, and gentle priorities.
              </p>
            </div>
            <div className="pt-6 flex items-center gap-1.5 text-xs font-semibold text-[#244C3A] group-hover:gap-2.5 transition-all">
              <span>Open Brain Dump</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#E5B85C]" />
            </div>
          </div>

          {/* Feature 2 */}
          <div
            onClick={() => onNavigate('tiny-plan')}
            className="group cursor-pointer bg-white rounded-2xl border border-[#E5EDE4] p-6 hover:border-[#72947B]/50 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#E5EDE4] text-[#244C3A] flex items-center justify-center group-hover:scale-105 transition-transform">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#244C3A] group-hover:text-[#1a382b]">
                Plan my day
              </h3>
              <p className="text-sm text-[#737A73] leading-relaxed">
                Enter your tasks and energy level. Gemma 4 generates an honest schedule with built-in sloth breaks and a guaranteed stopping point.
              </p>
            </div>
            <div className="pt-6 flex items-center gap-1.5 text-xs font-semibold text-[#244C3A] group-hover:gap-2.5 transition-all">
              <span>Make a Tiny Plan</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#E5B85C]" />
            </div>
          </div>

          {/* Feature 3 */}
          <div
            onClick={() => onNavigate('two-line-summary')}
            className="group cursor-pointer bg-white rounded-2xl border border-[#E5EDE4] p-6 hover:border-[#72947B]/50 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#E5EDE4] text-[#244C3A] flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#244C3A] group-hover:text-[#1a382b]">
                Summarize the chaos
              </h3>
              <p className="text-sm text-[#737A73] leading-relaxed">
                Extract exactly two clean sentences, the core takeaway, and hard deadlines from rambling emails, transcripts, or notes.
              </p>
            </div>
            <div className="pt-6 flex items-center gap-1.5 text-xs font-semibold text-[#244C3A] group-hover:gap-2.5 transition-all">
              <span>Condense Text</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#E5B85C]" />
            </div>
          </div>
        </div>
      </section>

      {/* Secondary Features & Dev Studio */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div
          onClick={() => onNavigate('reply-assistant')}
          className="cursor-pointer bg-white rounded-2xl border border-[#E5EDE4] p-6 hover:border-[#72947B]/50 transition-all flex items-start gap-4"
        >
          <div className="p-3 bg-[#E5EDE4] rounded-xl text-[#244C3A] shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-[#244C3A] text-base">Reply Assistant</h4>
            <p className="text-xs text-[#737A73] mt-1 leading-relaxed">
              Craft thoughtful, boundary-respecting responses in seconds. Choose from Casual, Friendly, Professional, or Brief & Direct tones without inventing commitments.
            </p>
          </div>
        </div>

        <div
          onClick={() => onNavigate('devto-studio')}
          className="cursor-pointer bg-gradient-to-br from-[#244C3A] to-[#1a382b] text-white rounded-2xl p-6 hover:opacity-95 transition-all flex items-start gap-4 shadow-sm"
        >
          <div className="p-3 bg-white/10 rounded-xl text-[#E5B85C] shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-white text-base">DEV.to Blog Studio</h4>
              <span className="text-[10px] uppercase font-bold bg-[#E5B85C] text-[#244C3A] px-2 py-0.5 rounded-full">
                Challenge
              </span>
            </div>
            <p className="text-xs text-white/80 mt-1 leading-relaxed">
              Generate a high-quality developer post about your Gemma 4 implementation for the "Slow and Steady" challenge, preview Markdown, and save drafts or publish.
            </p>
          </div>
        </div>
      </section>

      {/* Gemma 4 & Open Innovation Philosophy */}
      <section className="bg-white rounded-3xl border border-[#E5EDE4] p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <SlothMascot size={36} mood="resting" />
          <div>
            <h3 className="text-xl font-bold text-[#244C3A]">Why Open-Weight Gemma 4 Matters</h3>
            <p className="text-xs text-[#737A73]">True architectural sovereignty, privacy, and portability</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
          <div className="p-4 rounded-xl bg-[#F7F5EF] border border-[#E5EDE4] space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-[#244C3A]">
              <ShieldCheck className="w-4 h-4 text-[#72947B]" />
              <span>Genuine Local Privacy</span>
            </div>
            <p className="text-xs text-[#737A73] leading-relaxed">
              In Local Ollama mode (<code className="font-mono text-[#244C3A]">gemma4:e2b</code>), your brain dumps never leave your device. Model weights execute purely in local RAM/VRAM.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F7F5EF] border border-[#E5EDE4] space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-[#244C3A]">
              <Cpu className="w-4 h-4 text-[#72947B]" />
              <span>Offline Capability</span>
            </div>
            <p className="text-xs text-[#737A73] leading-relaxed">
              Once Ollama weights are pulled, you can generate plans in an airplane or off-grid. Hosted inference and DEV.to publishing still require an active network.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F7F5EF] border border-[#E5EDE4] space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-[#244C3A]">
              <Sparkles className="w-4 h-4 text-[#72947B]" />
              <span>Hosted Gemma 4 Option</span>
            </div>
            <p className="text-xs text-[#737A73] leading-relaxed">
              When hardware is lightweight or mobile, toggle to Hosted Gemma 4 (<code className="font-mono text-[#244C3A]">gemma-4-26b-a4b-it</code>) via Google's official GenAI SDK.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
