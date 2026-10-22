import React from 'react';
import { ConfigStatus, InferenceMode, LocalOllamaStatus } from '../types';
import { Cpu, Cloud, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';

interface StatusPillProps {
  mode: InferenceMode;
  hostedModel: string;
  localModel: string;
  configStatus: ConfigStatus;
  ollamaStatus: LocalOllamaStatus;
  onOpenSettings?: () => void;
  compact?: boolean;
}

export const StatusPill: React.FC<StatusPillProps> = ({
  mode,
  hostedModel,
  localModel,
  configStatus,
  ollamaStatus,
  onOpenSettings,
  compact = false,
}) => {
  const isHosted = mode === 'hosted';

  // Rule: Never display green unless verified!
  let statusColor = 'bg-amber-100 text-amber-900 border-amber-300';
  let dotColor = 'bg-amber-500';
  let statusText = 'Checking...';
  let Icon = HelpCircle;

  if (isHosted) {
    if (configStatus.hostedGemmaConfigured) {
      statusColor = 'bg-[#E5EDE4] text-[#244C3A] border-[#72947B]/30';
      dotColor = 'bg-[#244C3A]';
      statusText = `Hosted: ${hostedModel}`;
      Icon = Cloud;
    } else {
      statusColor = 'bg-red-50 text-red-900 border-red-200';
      dotColor = 'bg-red-500';
      statusText = 'Hosted: Key Missing';
      Icon = AlertCircle;
    }
  } else {
    // Local Ollama
    if (ollamaStatus.tested && ollamaStatus.reachable && !ollamaStatus.error) {
      statusColor = 'bg-emerald-50 text-emerald-900 border-emerald-300';
      dotColor = 'bg-emerald-600 animate-pulse';
      statusText = `Local: ${localModel}`;
      Icon = CheckCircle;
    } else if (ollamaStatus.tested && (!ollamaStatus.reachable || ollamaStatus.error)) {
      statusColor = 'bg-amber-50 text-amber-900 border-amber-300';
      dotColor = 'bg-amber-500';
      statusText = `Local: Unreachable`;
      Icon = AlertCircle;
    } else {
      statusColor = 'bg-stone-100 text-stone-800 border-stone-300';
      dotColor = 'bg-stone-400';
      statusText = `Local: Untested (${localModel})`;
      Icon = Cpu;
    }
  }

  if (compact) {
    return (
      <button
        onClick={onOpenSettings}
        title={`Inference: ${isHosted ? 'Hosted Google GenAI API' : 'Local Ollama'}. Click to configure.`}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border transition-colors hover:opacity-90 ${statusColor}`}
      >
        <span className={`w-2 h-2 rounded-full ${dotColor}`} />
        <span className="truncate max-w-[140px]">{statusText}</span>
      </button>
    );
  }

  return (
    <div
      onClick={onOpenSettings}
      role={onOpenSettings ? 'button' : undefined}
      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${statusColor} ${
        onOpenSettings ? 'cursor-pointer hover:shadow-sm' : ''
      }`}
    >
      <div className="flex items-center gap-2.5">
        <span className="p-1.5 bg-white/60 rounded-lg">
          <Icon className="w-4 h-4" />
        </span>
        <div>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${dotColor}`} />
            <span className="text-xs font-semibold tracking-wide uppercase">
              {isHosted ? 'Hosted Gemma 4' : 'Local Gemma 4'}
            </span>
          </div>
          <p className="text-sm font-medium mt-0.5">
            {isHosted ? hostedModel : `${localModel} (Ollama)`}
          </p>
        </div>
      </div>
      <span className="text-[11px] font-medium opacity-80 underline hover:opacity-100">
        Settings
      </span>
    </div>
  );
};
