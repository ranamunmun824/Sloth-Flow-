import React from 'react';
import { SlothMascot } from '../components/SlothMascot';
import {
  ShieldCheck,
  Cpu,
  Cloud,
  FileCode,
  HeartHandshake,
  Layers,
  Sparkles,
  GitBranch,
  Lock,
  WifiOff,
  Scale,
} from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-16">
      {/* Header */}
      <div className="flex items-start gap-4">
        <SlothMascot size={48} mood="hanging" />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#244C3A]">
            About SlothFlow & Gemma 4
          </h1>
          <p className="text-sm text-[#737A73] mt-1">
            "Do less busywork. Keep your brain for better things." — Building with open-weight models that reward calmness.
          </p>
        </div>
      </div>

      {/* The Sloth Philosophy */}
      <div className="bg-white rounded-3xl border border-[#E5EDE4] p-6 md:p-8 space-y-4 shadow-xs">
        <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-[#244C3A]">
          <HeartHandshake className="w-4 h-4 text-[#72947B]" />
          <span>The Philosophy of Slow and Steady</span>
        </div>
        <h2 className="text-xl font-bold text-[#244C3A]">
          Why More Productivity Tools Make Us More Exhausted
        </h2>
        <p className="text-sm text-[#202821] leading-relaxed">
          Modern productivity culture frequently glorifies hyper-optimization: time-blocking every 15-minute slot, maintaining 40-tag Notion workspaces, and striving for impossible inbox-zero standards.
        </p>
        <p className="text-sm text-[#202821] leading-relaxed">
          SlothFlow takes the opposite approach. We believe that when your mind is overwhelmed, you don't need a complicated project-management suite. You need the simplest next step that takes under five minutes, an honest schedule that includes restorative breaks, and permission to defer what doesn't truly matter today.
        </p>
      </div>

      {/* Open Weights & Transparency */}
      <div className="bg-white rounded-3xl border border-[#E5EDE4] p-6 md:p-8 space-y-6 shadow-xs">
        <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-[#244C3A]">
          <Layers className="w-4 h-4 text-[#72947B]" />
          <span>Model Architecture & Sovereignty</span>
        </div>

        <h2 className="text-xl font-bold text-[#244C3A]">
          Understanding Open Weights vs. Closed APIs
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-4 rounded-2xl bg-[#F7F5EF] border border-[#E5EDE4] space-y-2">
            <span className="text-xs font-bold text-[#244C3A] block">1. Model Weights</span>
            <p className="text-xs text-[#737A73] leading-relaxed">
              Open-weight models like Gemma 4 make the trained neural network parameters available to download. Anyone can inspect, quantize, and execute them on consumer laptops using runtimes like Ollama or llama.cpp.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F7F5EF] border border-[#E5EDE4] space-y-2">
            <span className="text-xs font-bold text-[#244C3A] block">2. Hosted Inference</span>
            <p className="text-xs text-[#737A73] leading-relaxed">
              Cloud providers host large Gemma 4 instances (such as <code className="font-mono text-[#244C3A]">gemma-4-26b-a4b-it</code>) so you can access frontier capability without needing a high-end GPU or 32GB of RAM.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F7F5EF] border border-[#E5EDE4] space-y-2">
            <span className="text-xs font-bold text-[#244C3A] block">3. Application Code</span>
            <p className="text-xs text-[#737A73] leading-relaxed">
              SlothFlow provides the orchestration layer. By maintaining a clean dual-provider interface, users have total freedom to switch between local private hardware and cloud endpoints.
            </p>
          </div>
        </div>
      </div>

      {/* Honest Privacy & Offline Truth */}
      <div className="bg-white rounded-3xl border border-[#E5EDE4] p-6 md:p-8 space-y-5 shadow-xs">
        <h2 className="text-lg font-bold text-[#244C3A] flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#72947B]" />
          <span>Honest Privacy & Offline Reality</span>
        </h2>

        <div className="space-y-3 text-xs text-[#202821] leading-relaxed">
          <div className="p-4 rounded-2xl bg-[#E5EDE4]/50 border border-[#72947B]/20 flex items-start gap-3">
            <Lock className="w-4 h-4 text-[#244C3A] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#244C3A]">Local Gemma 4 Mode (Ollama):</p>
              <p className="mt-0.5 text-[#202821]">
                Your prompts, tasks, and notes are transmitted directly from your browser to your local Ollama daemon (<code className="font-mono">http://localhost:11434</code>). Zero text is ever transmitted across the internet. Once downloaded, this mode operates 100% offline.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#F7F5EF] border border-[#E5EDE4] flex items-start gap-3">
            <Cloud className="w-4 h-4 text-[#72947B] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#202821]">Hosted Gemma 4 Mode (@google/genai):</p>
              <p className="mt-0.5 text-[#737A73]">
                Your prompt is proxied through your server to Google's official GenAI API using your server-side <code className="font-mono">GEMINI_API_KEY</code>. This requires an active internet connection.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#F7F5EF] border border-[#E5EDE4] flex items-start gap-3">
            <WifiOff className="w-4 h-4 text-[#72947B] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#202821]">What Works Offline vs. Online:</p>
              <p className="mt-0.5 text-[#737A73]">
                - <strong>Works Offline:</strong> Local Ollama tasks (Brain Dump, Tiny Plan, Summaries) after the model weights have been downloaded.<br />
                - <strong>Requires Internet:</strong> Hosted Gemma API, DEV.to draft saving, and DEV.to live publishing.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Hardware Considerations */}
      <div className="bg-white rounded-3xl border border-[#E5EDE4] p-6 space-y-4">
        <h3 className="text-base font-bold text-[#244C3A] flex items-center gap-2">
          <Scale className="w-4 h-4 text-[#72947B]" />
          <span>Hardware & Model Sizing Trade-Offs</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-[#F7F5EF] border border-[#E5EDE4] space-y-1">
            <p className="font-bold text-[#244C3A]">Local Gemma 4 2B (e2b)</p>
            <p className="text-[#737A73]">
              ~2.5 GB RAM/VRAM required. Runs smoothly on modern Apple Silicon (M1/M2/M3) and budget GPUs. Fast token generation, ideal for daily triage and instant replies.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F7F5EF] border border-[#E5EDE4] space-y-1">
            <p className="font-bold text-[#244C3A]">Hosted Gemma 4 26B/31B</p>
            <p className="text-[#737A73]">
              Executed in Google's cloud infrastructure. Handles deep nuance, complex schedule balancing, and long developer articles without heating up your laptop battery.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
