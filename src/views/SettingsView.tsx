import React, { useState } from 'react';
import { testLocalOllama } from '../services/aiService';
import {
  ConfigStatus,
  EnergyLevel,
  HostedModelId,
  InferenceMode,
  LocalOllamaStatus,
  ReplyTone,
  UserPreferences,
} from '../types';
import { SlothMascot } from '../components/SlothMascot';
import {
  Settings as SettingsIcon,
  Cpu,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Trash2,
  Lock,
  ExternalLink,
  Shield,
  HelpCircle,
  Terminal,
  Activity,
} from 'lucide-react';

interface SettingsViewProps {
  preferences: UserPreferences;
  onUpdatePreferences: (updates: Partial<UserPreferences>) => void;
  configStatus: ConfigStatus;
  ollamaStatus: LocalOllamaStatus;
  onUpdateOllamaStatus: (status: LocalOllamaStatus) => void;
  onClearAllData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  preferences,
  onUpdatePreferences,
  configStatus,
  ollamaStatus,
  onUpdateOllamaStatus,
  onClearAllData,
}) => {
  const [testingOllama, setTestingOllama] = useState(false);
  const [clearedNotice, setClearedNotice] = useState(false);

  const handleTestOllama = async () => {
    setTestingOllama(true);
    const status = await testLocalOllama(preferences.ollamaBaseUrl, preferences.localModel);
    onUpdateOllamaStatus(status);
    setTestingOllama(false);
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear your local history and saved Tiny Plans?')) {
      onClearAllData();
      setClearedNotice(true);
      setTimeout(() => setClearedNotice(false), 2500);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#E5EDE4] rounded-xl text-[#244C3A]">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#244C3A]">Settings & Architecture</h1>
        </div>
        <p className="text-sm text-[#737A73] mt-1.5">
          Manage your Gemma 4 runtime, local Ollama endpoints, privacy storage, and DEV.to publishing access.
        </p>
      </div>

      {/* 3 Status Dashboards Required by Section 13 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status 1: Hosted Gemma */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5EDE4] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#737A73]">
              1. Hosted Gemma API
            </span>
            <Cloud className="w-4 h-4 text-[#72947B]" />
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                configStatus.hostedGemmaConfigured ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
            <span className="text-sm font-bold text-[#202821]">
              {configStatus.hostedGemmaConfigured ? 'Configured & Ready' : 'Key Missing'}
            </span>
          </div>
          <p className="text-[11px] text-[#737A73]">
            {configStatus.hostedGemmaConfigured
              ? `Model: ${preferences.hostedModel} via @google/genai`
              : 'Add GEMINI_API_KEY in AI Studio Secrets to enable hosted inference.'}
          </p>
        </div>

        {/* Status 2: Local Ollama */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5EDE4] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#737A73]">
              2. Local Ollama
            </span>
            <Cpu className="w-4 h-4 text-[#72947B]" />
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                ollamaStatus.tested && ollamaStatus.reachable && !ollamaStatus.error
                  ? 'bg-emerald-500'
                  : 'bg-stone-400'
              }`}
            />
            <span className="text-sm font-bold text-[#202821]">
              {ollamaStatus.tested
                ? ollamaStatus.reachable && !ollamaStatus.error
                  ? 'Connected & Verified'
                  : 'Connection Issue'
                : 'Untested'}
            </span>
          </div>
          <p className="text-[11px] text-[#737A73]">
            {ollamaStatus.tested
              ? ollamaStatus.reachable
                ? `Models: ${ollamaStatus.models.length} detected`
                : 'Could not reach localhost:11434'
              : 'Click "Test Connection" below to probe localhost.'}
          </p>
        </div>

        {/* Status 3: DEV.to Publishing */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5EDE4] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#737A73]">
              3. DEV.to Publishing
            </span>
            <Lock className="w-4 h-4 text-[#72947B]" />
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                configStatus.devtoConfigured ? 'bg-emerald-500' : 'bg-stone-400'
              }`}
            />
            <span className="text-sm font-bold text-[#202821]">
              {configStatus.devtoConfigured ? 'API Key Present' : 'API Key Missing'}
            </span>
          </div>
          <p className="text-[11px] text-[#737A73]">
            {configStatus.devtoConfigured
              ? `Access Gate: ${configStatus.publisherAuthRequired ? 'Enabled' : 'Open'}`
              : 'Provide DEVTO_API_KEY in server secrets.'}
          </p>
        </div>
      </div>

      {/* Inference Provider Toggle */}
      <div className="bg-white rounded-3xl border border-[#E5EDE4] p-6 space-y-6 shadow-xs">
        <h2 className="text-base font-bold text-[#244C3A]">Inference Provider Selection</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            onClick={() => onUpdatePreferences({ inferenceMode: 'hosted' })}
            className={`cursor-pointer p-5 rounded-2xl border-2 transition-all flex items-start gap-4 ${
              preferences.inferenceMode === 'hosted'
                ? 'border-[#244C3A] bg-[#E5EDE4]/30'
                : 'border-[#E5EDE4] hover:bg-[#F7F5EF]'
            }`}
          >
            <div
              className={`p-2.5 rounded-xl ${
                preferences.inferenceMode === 'hosted'
                  ? 'bg-[#244C3A] text-white'
                  : 'bg-[#E5EDE4] text-[#244C3A]'
              }`}
            >
              <Cloud className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[#202821]">Hosted Gemma 4</span>
                {preferences.inferenceMode === 'hosted' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#244C3A] text-white">
                    Active
                  </span>
                )}
              </div>
              <p className="text-xs text-[#737A73] leading-relaxed">
                Uses Google's official @google/genai SDK on the server with model{' '}
                <code className="font-mono text-[#244C3A]">{preferences.hostedModel}</code>. Great for mobile or low-spec devices.
              </p>
            </div>
          </div>

          <div
            onClick={() => onUpdatePreferences({ inferenceMode: 'local' })}
            className={`cursor-pointer p-5 rounded-2xl border-2 transition-all flex items-start gap-4 ${
              preferences.inferenceMode === 'local'
                ? 'border-[#244C3A] bg-[#E5EDE4]/30'
                : 'border-[#E5EDE4] hover:bg-[#F7F5EF]'
            }`}
          >
            <div
              className={`p-2.5 rounded-xl ${
                preferences.inferenceMode === 'local'
                  ? 'bg-[#244C3A] text-white'
                  : 'bg-[#E5EDE4] text-[#244C3A]'
              }`}
            >
              <Cpu className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[#202821]">Local Gemma 4 (Ollama)</span>
                {preferences.inferenceMode === 'local' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#244C3A] text-white">
                    Active
                  </span>
                )}
              </div>
              <p className="text-xs text-[#737A73] leading-relaxed">
                Sends requests directly from your browser to your local Ollama runtime. Complete on-device privacy; prompts never touch the cloud.
              </p>
            </div>
          </div>
        </div>

        {/* Hosted Model Configuration */}
        {preferences.inferenceMode === 'hosted' && (
          <div className="p-4 rounded-2xl bg-[#F7F5EF] border border-[#E5EDE4] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#244C3A]">
                  Hosted Model Selection
                </label>
                <p className="text-[11px] text-[#737A73]">
                  Select the Gemma 4 variant supported by Google GenAI.
                </p>
              </div>

              <select
                value={preferences.hostedModel}
                onChange={(e) => onUpdatePreferences({ hostedModel: e.target.value as HostedModelId })}
                className="text-xs font-mono font-medium rounded-xl border border-[#E5EDE4] bg-white px-3 py-2 text-[#244C3A] focus:outline-none focus:ring-1 focus:ring-[#72947B]"
              >
                <option value="gemma-4-26b-a4b-it">gemma-4-26b-a4b-it (Default)</option>
                <option value="gemma-4-31b-it">gemma-4-31b-it (High Capacity)</option>
              </select>
            </div>
          </div>
        )}

        {/* Local Ollama Configuration */}
        {preferences.inferenceMode === 'local' && (
          <div className="p-5 rounded-2xl bg-[#F7F5EF] border border-[#E5EDE4] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#244C3A]">
                Local Ollama Settings
              </span>
              <button
                onClick={handleTestOllama}
                disabled={testingOllama}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#244C3A] text-white text-xs font-semibold hover:bg-[#1a382b] transition-colors"
              >
                <Activity className="w-3.5 h-3.5 text-[#E5B85C]" />
                <span>{testingOllama ? 'Probing Ollama...' : 'Test Local Connection'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#202821] mb-1">
                  Ollama Base URL
                </label>
                <input
                  type="text"
                  value={preferences.ollamaBaseUrl}
                  onChange={(e) => onUpdatePreferences({ ollamaBaseUrl: e.target.value })}
                  placeholder="http://localhost:11434"
                  className="w-full text-xs font-mono rounded-xl border border-[#E5EDE4] bg-white p-2.5"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202821] mb-1">
                  Local Gemma 4 Model Name
                </label>
                <input
                  type="text"
                  value={preferences.localModel}
                  onChange={(e) => onUpdatePreferences({ localModel: e.target.value })}
                  placeholder="gemma4:e2b"
                  className="w-full text-xs font-mono rounded-xl border border-[#E5EDE4] bg-white p-2.5"
                />
              </div>
            </div>

            {/* Test Outcome feedback */}
            {ollamaStatus.tested && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                  ollamaStatus.reachable && !ollamaStatus.error
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-amber-50 border-amber-300 text-amber-900'
                }`}
              >
                {ollamaStatus.reachable && !ollamaStatus.error ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-bold">
                    {ollamaStatus.reachable && !ollamaStatus.error
                      ? 'Local Ollama connection verified!'
                      : 'Connection Warning'}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-relaxed">
                    {ollamaStatus.error || `Successfully reached Ollama. Configured model '${preferences.localModel}' is ready for offline tasks.`}
                  </p>
                </div>
              </div>
            )}

            {/* Ollama Terminal Setup Instructions (Section 13 requirement) */}
            <div className="pt-2 text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-[#202821]">
                <Terminal className="w-3.5 h-3.5 text-[#72947B]" />
                <span>Ollama Terminal Commands</span>
              </div>
              <div className="bg-[#202821] text-emerald-300 p-3 rounded-xl font-mono text-[11px] space-y-1">
                <p># 1. Download Gemma 4 (lightweight 2B open weights):</p>
                <p className="text-white">ollama pull gemma4:e2b</p>
                <p className="pt-1"># 2. Start Ollama with browser origin permissions:</p>
                <p className="text-white">OLLAMA_ORIGINS="*" ollama serve</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Defaults & Privacy Settings */}
      <div className="bg-white rounded-3xl border border-[#E5EDE4] p-6 space-y-5 shadow-xs">
        <h2 className="text-base font-bold text-[#244C3A]">Default Behaviors & Privacy</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#202821] mb-1">
              Default Brain Dump Energy
            </label>
            <select
              value={preferences.defaultEnergy}
              onChange={(e) => onUpdatePreferences({ defaultEnergy: e.target.value as EnergyLevel })}
              className="w-full text-xs rounded-xl border border-[#E5EDE4] bg-[#F7F5EF]/40 px-3 py-2 text-[#202821]"
            >
              <option value="Very low">Very low (Gentle)</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202821] mb-1">
              Preferred Reply Tone
            </label>
            <select
              value={preferences.defaultReplyTone}
              onChange={(e) => onUpdatePreferences({ defaultReplyTone: e.target.value as ReplyTone })}
              className="w-full text-xs rounded-xl border border-[#E5EDE4] bg-[#F7F5EF]/40 px-3 py-2 text-[#202821]"
            >
              <option value="Friendly">Friendly</option>
              <option value="Professional">Professional</option>
              <option value="Casual">Casual</option>
              <option value="Polite but firm">Polite but firm</option>
              <option value="Brief and direct">Brief and direct</option>
            </select>
          </div>
        </div>

        {/* History Toggle */}
        <div className="pt-2 border-t border-[#E5EDE4] flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#202821]">Local History Storage</p>
            <p className="text-[11px] text-[#737A73]">
              Store recent Tiny Plans and Brain Dump summaries inside browser localStorage.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.saveHistory}
              onChange={(e) => onUpdatePreferences({ saveHistory: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[#E5EDE4] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#244C3A]"></div>
          </label>
        </div>

        {/* Clear Data */}
        <div className="pt-4 border-t border-[#E5EDE4] flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-red-700">Clear Application Data</p>
            <p className="text-[11px] text-[#737A73]">
              Wipes all saved plans, brain dump history, and local preferences from this browser.
            </p>
          </div>

          <button
            onClick={handleClearData}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Local Storage</span>
          </button>
        </div>

        {clearedNotice && (
          <p className="text-xs text-emerald-700 font-semibold text-right">
            Local data successfully cleared!
          </p>
        )}
      </div>
    </div>
  );
};
