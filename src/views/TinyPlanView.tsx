import React, { useState, useEffect } from 'react';
import { executeAiTask } from '../services/aiService';
import {
  ConfigStatus,
  EnergyLevel,
  HostedModelId,
  InferenceMode,
  LocalOllamaStatus,
  SavedPlanHistory,
  TinyPlanResult,
} from '../types';
import { SlothMascot } from '../components/SlothMascot';
import {
  CalendarCheck,
  Sparkles,
  Clock,
  Battery,
  AlertTriangle,
  RotateCcw,
  Copy,
  BookmarkCheck,
  Check,
  Coffee,
  CheckCircle,
  Zap,
  ArrowRight,
  Plus,
  Trash2,
} from 'lucide-react';

interface TinyPlanViewProps {
  mode: InferenceMode;
  hostedModel: HostedModelId;
  ollamaBaseUrl: string;
  localModel: string;
  defaultEnergy: EnergyLevel;
  configStatus: ConfigStatus;
  ollamaStatus: LocalOllamaStatus;
  saveHistory: boolean;
}

export const TinyPlanView: React.FC<TinyPlanViewProps> = ({
  mode,
  hostedModel,
  ollamaBaseUrl,
  localModel,
  defaultEnergy,
  configStatus,
  ollamaStatus,
  saveHistory,
}) => {
  const [tasksInput, setTasksInput] = useState('');
  const [availableTime, setAvailableTime] = useState('60 minutes');
  const [energy, setEnergy] = useState<EnergyLevel>(defaultEnergy || 'Medium');
  const [deadline, setDeadline] = useState('');
  const [priorityPref, setPriorityPref] = useState('Complete urgent tasks first');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<TinyPlanResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [savedPlans, setSavedPlans] = useState<SavedPlanHistory[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('slothflow_saved_plans');
      if (stored) {
        setSavedPlans(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const loadExample = () => {
    setTasksInput(
      `- Review and merge PR #42
- Write unit tests for checkout validation
- Reply to product manager about delivery timeline
- Update the team meeting agenda for 4 PM
- Fix responsive CSS padding bug on mobile`
    );
    setAvailableTime('45 minutes');
    setEnergy('Low');
    setDeadline('Team meeting at 4:00 PM');
    setPriorityPref('Protect energy and do minimum needed');
  };

  const runPlanGeneration = async (planMode: 'standard' | 'easier' | 'shorter' = 'standard') => {
    if (!tasksInput.trim()) {
      setError('Please provide at least one task to plan.');
      return;
    }

    if (planMode === 'standard') {
      setLoading(true);
    } else {
      setActionLoading(planMode);
    }
    setError(null);

    try {
      const data = await executeAiTask({
        feature: 'tiny-plan',
        input: tasksInput,
        preferences: {
          energy,
          timeAvailable: availableTime,
          deadline,
          priorityPref,
          mode: planMode,
        },
        mode,
        hostedModel,
        ollamaBaseUrl,
        localModel,
      });

      if (data && typeof data === 'object') {
        const validated: TinyPlanResult = {
          conflictNotes: data.conflictNotes || null,
          firstTask: data.firstTask || 'Start step 1',
          smallestNextAction: data.smallestNextAction || 'Open the relevant document',
          totalEstimatedMinutes: Number(data.totalEstimatedMinutes) || 30,
          schedule: Array.isArray(data.schedule) ? data.schedule : [],
          whatCanWait: Array.isArray(data.whatCanWait) ? data.whatCanWait : [],
          stoppingPoint: data.stoppingPoint || 'Wrap up for this block',
          rawText: data.rawText,
        };
        setPlan(validated);
      } else {
        throw new Error('Received unexpected schedule format from Gemma 4.');
      }
    } catch (err: any) {
      console.error('Plan generation failed:', err);
      setError(err?.message || 'Failed to generate Tiny Plan with Gemma 4.');
    } finally {
      setLoading(false);
      setActionLoading(null);
    }
  };

  const handleMakeEasier = () => {
    runPlanGeneration('easier');
  };

  const handleFitLessTime = () => {
    runPlanGeneration('shorter');
  };

  const handleIncreaseTime = () => {
    const times = ['15 minutes', '30 minutes', '45 minutes', '60 minutes', '90 minutes', '2 hours', '3 hours'];
    const currentIdx = times.indexOf(availableTime);
    const nextTime = currentIdx !== -1 && currentIdx < times.length - 1 ? times[currentIdx + 1] : '2 hours';
    setAvailableTime(nextTime);
  };

  const handleSaveLocally = () => {
    if (!plan) return;
    const newEntry: SavedPlanHistory = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      title: plan.firstTask ? `Plan: ${plan.firstTask.slice(0, 30)}...` : 'Tiny Plan',
      plan,
    };
    const updated = [newEntry, ...savedPlans.slice(0, 9)];
    setSavedPlans(updated);
    try {
      localStorage.setItem('slothflow_saved_plans', JSON.stringify(updated));
    } catch {
      // ignore
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleCopyPlan = () => {
    if (!plan) return;
    let text = `🗓️ SlothFlow Tiny Plan\n\n`;
    if (plan.conflictNotes) {
      text += `⚠️ Note: ${plan.conflictNotes}\n\n`;
    }
    text += `🎯 First Task: ${plan.firstTask}\n`;
    text += `⚡ Tiny Next Action (Under 3 mins): ${plan.smallestNextAction}\n\n`;
    text += `⏱️ Schedule (${plan.totalEstimatedMinutes} mins total):\n`;
    plan.schedule.forEach((item) => {
      text += `  ${item.order}. ${item.task} (${item.duration})${item.isBreak ? ' [Sloth Break]' : ''}\n`;
    });
    if (plan.whatCanWait.length > 0) {
      text += `\n⏸️ What Can Wait:\n`;
      plan.whatCanWait.forEach((w) => (text += `  - ${w}\n`));
    }
    text += `\n🛑 Stopping Point: ${plan.stoppingPoint}\n`;

    navigator.clipboard.writeText(text);
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
              <CalendarCheck className="w-5 h-5" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#244C3A]">Tiny Plan</h1>
          </div>
          <p className="text-sm text-[#737A73] mt-1.5">
            Real schedules that respect your human limits. Gemma 4 builds small steps with built-in rests.
          </p>
        </div>

        <button
          onClick={loadExample}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#E5EDE4]/70 text-[#244C3A] hover:bg-[#E5EDE4] transition-colors"
        >
          Try an example
        </button>
      </div>

      {/* Input form */}
      <div className="bg-white rounded-3xl border border-[#E5EDE4] p-6 shadow-xs space-y-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#737A73] mb-2">
            Tasks to Tackle
          </label>
          <textarea
            value={tasksInput}
            onChange={(e) => setTasksInput(e.target.value)}
            rows={4}
            placeholder="- Draft customer email&#10;- Clean kitchen dishes&#10;- Push git commit"
            className="w-full rounded-2xl border border-[#E5EDE4] bg-[#F7F5EF]/40 p-4 text-sm text-[#202821] placeholder:text-[#737A73]/60 focus:outline-none focus:ring-2 focus:ring-[#72947B]/40 focus:bg-white transition-all"
          />
        </div>

        {/* Time, Energy, Deadline, Priority Preferences */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#202821] mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#72947B]" />
              <span>Available Time</span>
            </label>
            <select
              value={availableTime}
              onChange={(e) => setAvailableTime(e.target.value)}
              className="w-full text-xs rounded-xl border border-[#E5EDE4] bg-[#F7F5EF]/40 px-3 py-2 text-[#202821] focus:outline-none focus:ring-1 focus:ring-[#72947B]"
            >
              <option value="15 minutes">15 minutes</option>
              <option value="30 minutes">30 minutes</option>
              <option value="45 minutes">45 minutes</option>
              <option value="60 minutes">60 minutes</option>
              <option value="90 minutes">90 minutes</option>
              <option value="2 hours">2 hours</option>
              <option value="3 hours">3 hours</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202821] mb-1.5 flex items-center gap-1.5">
              <Battery className="w-3.5 h-3.5 text-[#72947B]" />
              <span>Energy</span>
            </label>
            <select
              value={energy}
              onChange={(e) => setEnergy(e.target.value as EnergyLevel)}
              className="w-full text-xs rounded-xl border border-[#E5EDE4] bg-[#F7F5EF]/40 px-3 py-2 text-[#202821] focus:outline-none focus:ring-1 focus:ring-[#72947B]"
            >
              <option value="Very low">Very low (Sloth mode)</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202821] mb-1.5">
              Optional Deadline
            </label>
            <input
              type="text"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              placeholder="e.g. By 3 PM"
              className="w-full text-xs rounded-xl border border-[#E5EDE4] bg-[#F7F5EF]/40 px-3 py-2 text-[#202821] focus:outline-none focus:ring-1 focus:ring-[#72947B]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202821] mb-1.5">
              Priority Preference
            </label>
            <input
              type="text"
              value={priorityPref}
              onChange={(e) => setPriorityPref(e.target.value)}
              placeholder="e.g. Quick wins first"
              className="w-full text-xs rounded-xl border border-[#E5EDE4] bg-[#F7F5EF]/40 px-3 py-2 text-[#202821] focus:outline-none focus:ring-1 focus:ring-[#72947B]"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2 border-t border-[#E5EDE4] flex items-center justify-between">
          <span className="text-[11px] text-[#737A73]">
            Engine: {mode === 'hosted' ? `Hosted Gemma 4 (${hostedModel})` : `Local Gemma 4 (${localModel})`}
          </span>

          <button
            onClick={() => runPlanGeneration('standard')}
            disabled={loading || !tasksInput.trim()}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#244C3A] text-white text-xs font-semibold hover:bg-[#1a382b] transition-all shadow-sm active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Generating Plan...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-[#E5B85C]" />
                <span>Create Tiny Plan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Generated Plan Result */}
      {plan && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Action buttons toolbar: Section 6 requirement */}
          <div className="bg-white p-4 rounded-2xl border border-[#E5EDE4] flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleMakeEasier}
                disabled={actionLoading !== null}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#E5EDE4] text-[#244C3A] hover:bg-[#d8e4d6] transition-colors"
                title="Sends a fresh prompt to Gemma 4 to reduce cognitive burden and lower task friction"
              >
                {actionLoading === 'easier' ? (
                  <div className="w-3 h-3 border-2 border-[#244C3A]/30 border-t-[#244C3A] rounded-full animate-spin" />
                ) : (
                  <Coffee className="w-3.5 h-3.5 text-[#72947B]" />
                )}
                <span>Make the plan easier</span>
              </button>

              <button
                onClick={handleFitLessTime}
                disabled={actionLoading !== null}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#F7F5EF] text-[#202821] border border-[#E5EDE4] hover:bg-[#E5EDE4] transition-colors"
                title="Asks Gemma 4 to distill to only the most vital tasks for tighter time limits"
              >
                {actionLoading === 'shorter' ? (
                  <div className="w-3 h-3 border-2 border-[#244C3A]/30 border-t-[#244C3A] rounded-full animate-spin" />
                ) : (
                  <Zap className="w-3.5 h-3.5 text-[#E5B85C]" />
                )}
                <span>Fit into less time</span>
              </button>

              <button
                onClick={handleIncreaseTime}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-[#737A73] hover:text-[#202821] hover:bg-[#F7F5EF] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Increase time ({availableTime})</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => runPlanGeneration('standard')}
                disabled={loading || actionLoading !== null}
                className="p-2 rounded-xl text-[#737A73] hover:text-[#202821] hover:bg-[#F7F5EF] transition-colors"
                title="Regenerate plan"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={handleCopyPlan}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E5EDE4] text-xs font-medium text-[#202821] hover:bg-[#F7F5EF] transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#737A73]" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={handleSaveLocally}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#244C3A] text-white text-xs font-medium hover:bg-[#1a382b] transition-colors"
              >
                {savedSuccess ? <Check className="w-3.5 h-3.5 text-[#E5B85C]" /> : <BookmarkCheck className="w-3.5 h-3.5 text-[#E5B85C]" />}
                <span>{savedSuccess ? 'Saved' : 'Save Plan'}</span>
              </button>
            </div>
          </div>

          {/* Conflict Warning if present */}
          {plan.conflictNotes && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Schedule Adjustment Note</p>
                <p className="mt-0.5 text-amber-800">{plan.conflictNotes}</p>
              </div>
            </div>
          )}

          {/* First Task & Micro Action */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-[#E5EDE4] space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#72947B]">
                First Task to Start
              </span>
              <p className="text-base font-bold text-[#244C3A]">{plan.firstTask}</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#E5EDE4]/70 border border-[#72947B]/30 space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#244C3A]">
                Smallest Next Action (&lt; 3 mins)
              </span>
              <p className="text-sm font-semibold text-[#202821]">{plan.smallestNextAction}</p>
            </div>
          </div>

          {/* Ordered Task Schedule with Break suggestions */}
          <div className="bg-white rounded-3xl border border-[#E5EDE4] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#244C3A]">
                Ordered Plan Flow
              </h3>
              <span className="text-xs font-mono px-2 py-0.5 bg-[#F7F5EF] text-[#737A73] rounded-md border border-[#E5EDE4]">
                Total: ~{plan.totalEstimatedMinutes} mins
              </span>
            </div>

            <div className="space-y-3">
              {plan.schedule.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                    item.isBreak
                      ? 'bg-[#E5EDE4]/40 border-[#72947B]/20 text-[#244C3A]'
                      : 'bg-[#F7F5EF]/60 border-[#E5EDE4] text-[#202821]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                        item.isBreak
                          ? 'bg-[#72947B] text-white'
                          : 'bg-[#244C3A] text-white'
                      }`}
                    >
                      {item.isBreak ? <Coffee className="w-3.5 h-3.5" /> : item.order || idx + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{item.task}</p>
                      {item.notes && <p className="text-xs text-[#737A73] mt-0.5">{item.notes}</p>}
                    </div>
                  </div>

                  <span className="text-xs font-mono font-medium px-2 py-0.5 bg-white rounded-md border border-[#E5EDE4] shrink-0">
                    {item.duration}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* What Can Wait & Guaranteed Stopping Point */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-[#E5EDE4] space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-[#737A73]">
                What Can Wait
              </p>
              {plan.whatCanWait.length > 0 ? (
                <ul className="space-y-1.5 text-xs text-[#737A73]">
                  {plan.whatCanWait.map((w, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold">&bull;</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-[#737A73]">Everything comfortably fit into the timeline.</p>
              )}
            </div>

            <div className="p-5 rounded-2xl bg-[#244C3A] text-white space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-[#E5B85C]">
                Realistic Stopping Point
              </p>
              <p className="text-sm font-medium leading-relaxed">{plan.stoppingPoint}</p>
              <p className="text-[11px] text-white/70">
                When you hit this milestone, close your laptop and let your brain recharge.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Local Saved Plans Drawer / History */}
      {savedPlans.length > 0 && (
        <div className="bg-white rounded-3xl border border-[#E5EDE4] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#737A73]">
              Locally Saved Tiny Plans ({savedPlans.length})
            </h3>
            <button
              onClick={() => {
                setSavedPlans([]);
                localStorage.removeItem('slothflow_saved_plans');
              }}
              className="text-[11px] text-[#737A73] hover:text-red-600 transition-colors"
            >
              Clear saved
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {savedPlans.map((entry) => (
              <div
                key={entry.id}
                onClick={() => setPlan(entry.plan)}
                className="cursor-pointer p-3.5 rounded-xl border border-[#E5EDE4] hover:bg-[#F7F5EF] transition-all flex items-center justify-between"
              >
                <div className="space-y-0.5 truncate pr-2">
                  <p className="text-xs font-semibold text-[#202821] truncate">{entry.title}</p>
                  <p className="text-[10px] text-[#737A73]">
                    {entry.timestamp} &bull; ~{entry.plan.totalEstimatedMinutes}m
                  </p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#72947B] shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
