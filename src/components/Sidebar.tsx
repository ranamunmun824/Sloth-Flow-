import React from 'react';
import { SlothMascot } from './SlothMascot';
import { StatusPill } from './StatusPill';
import { ConfigStatus, InferenceMode, LocalOllamaStatus } from '../types';
import {
  Home,
  Brain,
  CalendarCheck,
  FileText,
  MessageSquare,
  BookOpen,
  Settings,
  Info,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

export type NavTab =
  | 'home'
  | 'brain-dump'
  | 'tiny-plan'
  | 'two-line-summary'
  | 'reply-assistant'
  | 'devto-studio'
  | 'settings'
  | 'about';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  mode: InferenceMode;
  hostedModel: string;
  localModel: string;
  configStatus: ConfigStatus;
  ollamaStatus: LocalOllamaStatus;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  mode,
  hostedModel,
  localModel,
  configStatus,
  ollamaStatus,
}) => {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const navItems = [
    { id: 'home' as NavTab, label: 'Home', icon: Home, badge: null },
    { id: 'brain-dump' as NavTab, label: 'Brain Dump', icon: Brain, badge: null },
    { id: 'tiny-plan' as NavTab, label: 'Tiny Plan', icon: CalendarCheck, badge: null },
    { id: 'two-line-summary' as NavTab, label: 'Two-Line Summary', icon: FileText, badge: null },
    { id: 'reply-assistant' as NavTab, label: 'Reply Assistant', icon: MessageSquare, badge: null },
    { id: 'devto-studio' as NavTab, label: 'DEV.to Blog Studio', icon: BookOpen, badge: 'Slow & Steady' },
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings, badge: null },
    { id: 'about' as NavTab, label: 'About the Project', icon: Info, badge: null },
  ];

  const handleNavClick = (tab: NavTab) => {
    onSelectTab(tab);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <header className="lg:hidden sticky top-0 z-40 bg-[#F7F5EF]/95 backdrop-blur-md border-b border-[#E5EDE4] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5" onClick={() => handleNavClick('home')}>
          <SlothMascot size={32} mood="hanging" />
          <div>
            <span className="font-bold text-lg tracking-tight text-[#244C3A]">SlothFlow</span>
            <span className="text-[10px] text-[#737A73] block leading-none">Gemma 4 Assistant</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusPill
            mode={mode}
            hostedModel={hostedModel}
            localModel={localModel}
            configStatus={configStatus}
            ollamaStatus={ollamaStatus}
            onOpenSettings={() => handleNavClick('settings')}
            compact
          />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-[#244C3A] hover:bg-[#E5EDE4] rounded-lg transition-colors"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-xs"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#FAF8F3] border-r border-[#E5EDE4] flex flex-col justify-between transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header & Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-5">
          {/* Logo */}
          <div
            className="cursor-pointer flex items-center gap-3 px-2 mb-6 group"
            onClick={() => handleNavClick('home')}
          >
            <div className="w-10 h-10 rounded-xl bg-[#E5EDE4] flex items-center justify-center transition-transform group-hover:scale-105 shadow-xs">
              <SlothMascot size={32} mood="hanging" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xl tracking-tight text-[#244C3A]">SlothFlow</span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-[#E5B85C]/20 text-[#855B14] rounded">
                  Gemma 4
                </span>
              </div>
              <p className="text-xs text-[#737A73] leading-tight">The Lazy-Day AI Assistant</p>
            </div>
          </div>

          {/* Model Status Card */}
          <div className="mb-5">
            <StatusPill
              mode={mode}
              hostedModel={hostedModel}
              localModel={localModel}
              configStatus={configStatus}
              ollamaStatus={ollamaStatus}
              onOpenSettings={() => handleNavClick('settings')}
            />
          </div>

          {/* Nav Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#244C3A] text-white shadow-sm shadow-[#244C3A]/20'
                      : 'text-[#202821] hover:bg-[#E5EDE4]/70 hover:text-[#244C3A]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#E5B85C]' : 'text-[#72947B]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-[#E5EDE4] text-[#244C3A]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Calm Note */}
        <div className="p-4 border-t border-[#E5EDE4] bg-[#F7F5EF]/60">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/70 border border-[#E5EDE4]/60">
            <SlothMascot size={26} mood="resting" />
            <div className="text-xs">
              <p className="font-semibold text-[#244C3A]">Slow & Steady</p>
              <p className="text-[#737A73] text-[11px] leading-tight mt-0.5">
                Do less busywork. Keep your brain for better things.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
