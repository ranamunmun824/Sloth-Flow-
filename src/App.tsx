import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/Sidebar';
import { HomeView } from './views/HomeView';
import { BrainDumpView } from './views/BrainDumpView';
import { TinyPlanView } from './views/TinyPlanView';
import { TwoLineSummaryView } from './views/TwoLineSummaryView';
import { ReplyAssistantView } from './views/ReplyAssistantView';
import { DevtoStudioView } from './views/DevtoStudioView';
import { SettingsView } from './views/SettingsView';
import { AboutView } from './views/AboutView';
import { fetchConfigStatus, testLocalOllama } from './services/aiService';
import {
  ConfigStatus,
  LocalOllamaStatus,
  UserPreferences,
} from './types';

const PREFS_STORAGE_KEY = 'slothflow_user_preferences';

const DEFAULT_PREFERENCES: UserPreferences = {
  inferenceMode: 'hosted',
  hostedModel: 'gemma-4-26b-a4b-it',
  ollamaBaseUrl: 'http://localhost:11434',
  localModel: 'gemma4:e2b',
  defaultEnergy: 'Medium',
  defaultReplyTone: 'Friendly',
  saveHistory: true,
  publisherAccessCode: '',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    try {
      const saved = localStorage.getItem(PREFS_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) };
      }
    } catch {
      // ignore
    }
    return DEFAULT_PREFERENCES;
  });

  const [configStatus, setConfigStatus] = useState<ConfigStatus>({
    hostedGemmaConfigured: false,
    devtoConfigured: false,
    publisherAuthRequired: false,
    defaultHostedModel: 'gemma-4-26b-a4b-it',
    alternateHostedModel: 'gemma-4-31b-it',
  });

  const [ollamaStatus, setOllamaStatus] = useState<LocalOllamaStatus>({
    tested: false,
    reachable: false,
    models: [],
    lastTestedAt: null,
  });

  // Fetch server configuration on load
  useEffect(() => {
    fetchConfigStatus().then((status) => {
      setConfigStatus(status);
    });
  }, []);

  // Save preferences changes to localStorage
  const updatePreferences = (updates: Partial<UserPreferences>) => {
    setPreferences((prev) => {
      const next = { ...prev, ...updates };
      try {
        if (next.saveHistory) {
          localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(next));
        }
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleClearAllData = () => {
    localStorage.removeItem(PREFS_STORAGE_KEY);
    localStorage.removeItem('slothflow_saved_plans');
    localStorage.removeItem('slothflow_brain_dump_history');
    setPreferences(DEFAULT_PREFERENCES);
    setOllamaStatus({
      tested: false,
      reachable: false,
      models: [],
      lastTestedAt: null,
    });
  };

  return (
    <div className="min-h-screen bg-[#F7F5EF] flex flex-col lg:flex-row text-[#202821]">
      {/* Responsive Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        mode={preferences.inferenceMode}
        hostedModel={preferences.hostedModel}
        localModel={preferences.localModel}
        configStatus={configStatus}
        ollamaStatus={ollamaStatus}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8 lg:px-10 lg:py-10 max-h-screen">
        {activeTab === 'home' && (
          <HomeView
            onNavigate={setActiveTab}
            mode={preferences.inferenceMode}
            hostedModel={preferences.hostedModel}
            localModel={preferences.localModel}
            configStatus={configStatus}
            ollamaStatus={ollamaStatus}
          />
        )}

        {activeTab === 'brain-dump' && (
          <BrainDumpView
            mode={preferences.inferenceMode}
            hostedModel={preferences.hostedModel}
            ollamaBaseUrl={preferences.ollamaBaseUrl}
            localModel={preferences.localModel}
            defaultEnergy={preferences.defaultEnergy}
            configStatus={configStatus}
            ollamaStatus={ollamaStatus}
            saveHistory={preferences.saveHistory}
          />
        )}

        {activeTab === 'tiny-plan' && (
          <TinyPlanView
            mode={preferences.inferenceMode}
            hostedModel={preferences.hostedModel}
            ollamaBaseUrl={preferences.ollamaBaseUrl}
            localModel={preferences.localModel}
            defaultEnergy={preferences.defaultEnergy}
            configStatus={configStatus}
            ollamaStatus={ollamaStatus}
            saveHistory={preferences.saveHistory}
          />
        )}

        {activeTab === 'two-line-summary' && (
          <TwoLineSummaryView
            mode={preferences.inferenceMode}
            hostedModel={preferences.hostedModel}
            ollamaBaseUrl={preferences.ollamaBaseUrl}
            localModel={preferences.localModel}
            configStatus={configStatus}
            ollamaStatus={ollamaStatus}
          />
        )}

        {activeTab === 'reply-assistant' && (
          <ReplyAssistantView
            mode={preferences.inferenceMode}
            hostedModel={preferences.hostedModel}
            ollamaBaseUrl={preferences.ollamaBaseUrl}
            localModel={preferences.localModel}
            defaultTone={preferences.defaultReplyTone}
          />
        )}

        {activeTab === 'devto-studio' && (
          <DevtoStudioView
            mode={preferences.inferenceMode}
            hostedModel={preferences.hostedModel}
            ollamaBaseUrl={preferences.ollamaBaseUrl}
            localModel={preferences.localModel}
            configStatus={configStatus}
            ollamaStatus={ollamaStatus}
            publisherAccessCode={preferences.publisherAccessCode}
            onUpdatePublisherCode={(code) => updatePreferences({ publisherAccessCode: code })}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            preferences={preferences}
            onUpdatePreferences={updatePreferences}
            configStatus={configStatus}
            ollamaStatus={ollamaStatus}
            onUpdateOllamaStatus={setOllamaStatus}
            onClearAllData={handleClearAllData}
          />
        )}

        {activeTab === 'about' && <AboutView />}
      </main>
    </div>
  );
}
