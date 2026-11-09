/**
 * SYNTARA AI — Universal Autonomous Intelligence Operating System
 * 2026 Architectural Minimalist Edition (MIT Open Source)
 */

import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  MessageSquareCode,
  FolderKanban,
  Network,
  Wrench,
  Users,
  GitBranch,
  FlaskConical,
  BookOpen,
  Code,
  Plug,
  TerminalSquare,
  Activity,
  Settings,
  Bell,
  Menu,
  X,
  CheckCircle2,
  Search,
  ArrowUpRight,
} from 'lucide-react';
import { useSyntaraStore } from './store/useSyntaraStore.ts';
import type { NavigationSection } from './types/syntara.ts';
import { CommandCenterView } from './components/CommandCenterView.tsx';
import { IntelligenceView, ProjectsView } from './components/IntelligenceAndProjectsView.tsx';
import {
  AgentNetworkView,
  AgentBuilderView,
  CollectiveIntelligenceView,
} from './components/AgentsAndCollectiveView.tsx';
import { WorkflowStudioView, SimulationLabView } from './components/WorkflowAndSimulationView.tsx';
import { KnowledgeCenterView, CreationStudioView } from './components/KnowledgeAndCreationView.tsx';
import { IntegrationsView, DeveloperStudioView } from './components/IntegrationsAndDevStudioView.tsx';
import { MonitoringView, SettingsView } from './components/MonitoringAndSettingsView.tsx';

interface NavItemConfig {
  id: NavigationSection;
  labelFr: string;
  labelEn: string;
  groupFr: string;
  groupEn: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAVIGATION_ITEMS: NavItemConfig[] = [
  { id: 'command-center', labelFr: 'Command Center', labelEn: 'Command Center', groupFr: 'Pilotage', groupEn: 'Core Control', icon: LayoutDashboard },
  { id: 'intelligence', labelFr: 'Intelligence', labelEn: 'Intelligence', groupFr: 'Pilotage', groupEn: 'Core Control', icon: MessageSquareCode },
  { id: 'projects', labelFr: 'Projects', labelEn: 'Projects', groupFr: 'Pilotage', groupEn: 'Core Control', icon: FolderKanban },

  { id: 'agent-network', labelFr: 'Agent Network', labelEn: 'Agent Network', groupFr: 'Agents & Orchestration', groupEn: 'Agents & Orchestration', icon: Network },
  { id: 'agent-builder', labelFr: 'Agent Builder', labelEn: 'Agent Builder', groupFr: 'Agents & Orchestration', groupEn: 'Agents & Orchestration', icon: Wrench },
  { id: 'collective', labelFr: 'Collective Intelligence', labelEn: 'Collective Intelligence', groupFr: 'Agents & Orchestration', groupEn: 'Agents & Orchestration', icon: Users },
  { id: 'workflow-studio', labelFr: 'Workflow Studio', labelEn: 'Workflow Studio', groupFr: 'Agents & Orchestration', groupEn: 'Agents & Orchestration', icon: GitBranch },

  { id: 'simulation-lab', labelFr: 'Simulation Lab', labelEn: 'Simulation Lab', groupFr: 'Connaissance & Création', groupEn: 'Knowledge & Creation', icon: FlaskConical },
  { id: 'knowledge-center', labelFr: 'Knowledge Center', labelEn: 'Knowledge Center', groupFr: 'Connaissance & Création', groupEn: 'Knowledge & Creation', icon: BookOpen },
  { id: 'creation-studio', labelFr: 'Creation Studio', labelEn: 'Creation Studio', groupFr: 'Connaissance & Création', groupEn: 'Knowledge & Creation', icon: Code },

  { id: 'integrations', labelFr: 'Integrations', labelEn: 'Integrations', groupFr: 'Système & Gouvernance', groupEn: 'System & Governance', icon: Plug },
  { id: 'developer-studio', labelFr: 'Developer Studio', labelEn: 'Developer Studio', groupFr: 'Système & Gouvernance', groupEn: 'System & Governance', icon: TerminalSquare },
  { id: 'monitoring', labelFr: 'Monitoring', labelEn: 'Monitoring', groupFr: 'Système & Gouvernance', groupEn: 'System & Governance', icon: Activity },
  { id: 'settings', labelFr: 'Settings', labelEn: 'Settings', groupFr: 'Système & Gouvernance', groupEn: 'System & Governance', icon: Settings },
];

export default function App() {
  const {
    language,
    activeSection,
    setActiveSection,
    fetchSystemState,
    loading,
    bannerMessage,
    setBanner,
    notifications,
    markNotificationsRead,
    users,
    currentUserId,
    approvals,
  } = useSyntaraStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');

  useEffect(() => {
    fetchSystemState();
  }, [fetchSystemState]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setCommandOpen(false);
        setNotifOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const isFr = language === 'fr';
  const currentUser = users.find((u) => u.id === currentUserId) || users[0];
  const unreadNotifs = notifications.filter((n) => !n.read).length;
  const pendingApprovalsCount = approvals.filter((a) => a.status === 'pending').length;
  const alertTotal = unreadNotifs + pendingApprovalsCount;

  const activeNavConfig =
    NAVIGATION_ITEMS.find((n) => n.id === activeSection) || NAVIGATION_ITEMS[0];

  const groups = Array.from(
    new Set(NAVIGATION_ITEMS.map((item) => (isFr ? item.groupFr : item.groupEn)))
  );

  const filteredCommandItems = NAVIGATION_ITEMS.filter((item) => {
    const label = (isFr ? item.labelFr : item.labelEn).toLowerCase();
    const grp = (isFr ? item.groupFr : item.groupEn).toLowerCase();
    const q = commandQuery.toLowerCase().trim();
    return !q || label.includes(q) || grp.includes(q);
  });

  return (
    <div className="min-h-screen bg-[#07090F] text-[#F8FAFC] flex flex-col selection:bg-[#7557FF]/30 selection:text-white">
      {/* Strict 3-Zone Top Bar Contract (2026 Minimalist Precision) */}
      <header className="h-14 bg-[#07090F]/90 backdrop-blur-md border-b border-white/[0.07] px-6 flex items-center justify-between gap-8 sticky top-0 z-30">
        {/* Zone 1: Single-line Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white cursor-pointer"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
          <a
            href="#command-center"
            onClick={(e) => {
              e.preventDefault();
              setActiveSection('command-center');
            }}
            className="text-base font-semibold tracking-tight text-white whitespace-nowrap shrink-0 font-display"
          >
            SYNTARA
          </a>
        </div>

        {/* Zone 2: 5 Concise Single-Line Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-[13px] font-medium text-slate-400">
          {[
            { id: 'command-center', label: 'Command Center' },
            { id: 'intelligence', label: 'Intelligence' },
            { id: 'projects', label: 'Projects' },
            { id: 'workflow-studio', label: 'Workflows' },
            { id: 'monitoring', label: 'Monitoring' },
          ].map((item) => {
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id as NavigationSection)}
                className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1 ${
                  active
                    ? 'text-white font-semibold underline decoration-[#7557FF] decoration-2 underline-offset-[18px]'
                    : 'hover:text-slate-200'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 Primary Action Button */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => {
              setNotifOpen(!notifOpen);
              markNotificationsRead();
            }}
            className="px-3.5 py-1.5 text-xs font-medium text-white bg-white/[0.06] hover:bg-white/[0.11] border border-white/[0.09] rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer"
          >
            <Bell className="w-3.5 h-3.5 text-[#A78BFA]" />
            <span>
              {isFr ? 'Notifications' : 'Notifications'}{' '}
              {alertTotal > 0 ? `(${alertTotal})` : ''}
            </span>
          </button>
        </div>
      </header>

      {/* Main Workspace Container */}
      <div className="flex-1 flex relative">
        {/* Minimalist 2026 Sidebar (248px width, categorized without mechanical noise) */}
        <aside
          className={`${
            mobileMenuOpen ? 'fixed inset-y-14 left-0 z-40 block bg-[#07090F]' : 'hidden'
          } lg:flex w-[248px] bg-[#07090F] border-r border-white/[0.07] shrink-0 flex-col justify-between py-5 px-3.5`}
        >
          <div className="space-y-6">
            {/* Quick Search / Command Palette Trigger inside Sidebar */}
            <button
              type="button"
              onClick={() => setCommandOpen(true)}
              className="w-full flex items-center justify-between px-3 py-2 bg-[#0D111C] hover:bg-[#131926] border border-white/[0.07] rounded-lg text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-slate-500" />
                <span>{isFr ? 'Navigation rapide...' : 'Quick jump...'}</span>
              </span>
              <kbd className="text-[10px] font-mono text-slate-500 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06]">
                ⌘K
              </kbd>
            </button>

            {/* Grouped Navigation Links */}
            <div className="space-y-5">
              {groups.map((groupName) => {
                const itemsInGroup = NAVIGATION_ITEMS.filter(
                  (i) => (isFr ? i.groupFr : i.groupEn) === groupName
                );
                return (
                  <div key={groupName} className="space-y-1">
                    <div className="px-2.5 text-[11px] font-medium text-slate-500 tracking-wide">
                      {groupName}
                    </div>
                    {itemsInGroup.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeSection === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setActiveSection(item.id);
                            setMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                            isActive
                              ? 'bg-[#7557FF]/15 text-white font-medium border border-[#7557FF]/35'
                              : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.03] border border-transparent'
                          }`}
                        >
                          <Icon
                            className={`w-4 h-4 shrink-0 ${
                              isActive ? 'text-[#A78BFA]' : 'text-slate-500'
                            }`}
                          />
                          <span className="truncate">{isFr ? item.labelFr : item.labelEn}</span>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Minimalist Account & Open Source Identity Footer */}
          <div className="mt-8 pt-4 border-t border-white/[0.07] px-2.5 space-y-2">
            {currentUser && (
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs font-medium text-slate-200 truncate">
                    {currentUser.name}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono truncate">
                    {currentUser.role} · {currentUser.organizationName}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSection('settings')}
                  className="text-[11px] text-slate-400 hover:text-white underline underline-offset-4 shrink-0 cursor-pointer"
                >
                  RBAC
                </button>
              </div>
            )}
            <div className="text-[11px] text-slate-500 font-mono">
              SYNTARA OS 1.0 · par Mendel Temgoua
            </div>
          </div>
        </aside>

        {/* Command Palette Modal (⌘K) */}
        {commandOpen && (
          <div
            onClick={() => setCommandOpen(false)}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-start justify-center pt-24 px-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-[#0D111C] border border-white/[0.12] rounded-xl overflow-hidden shadow-2xl"
            >
              <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.07]">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  autoFocus
                  value={commandQuery}
                  onChange={(e) => setCommandQuery(e.target.value)}
                  placeholder={
                    isFr
                      ? 'Rechercher un module SYNTARA (ex: Workflow, Simulation, RAG, Agents)...'
                      : 'Search SYNTARA modules (e.g., Workflow, Simulation, RAG, Agents)...'
                  }
                  className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setCommandOpen(false)}
                  className="text-xs text-slate-500 hover:text-slate-300 font-mono cursor-pointer"
                >
                  ESC
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto p-2 divide-y divide-white/[0.04]">
                {filteredCommandItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveSection(item.id);
                        setCommandOpen(false);
                        setCommandQuery('');
                      }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/[0.05] text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-[#A78BFA]" />
                        <span className="text-xs font-medium text-slate-200">
                          {isFr ? item.labelFr : item.labelEn}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <span>{isFr ? item.groupFr : item.groupEn}</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Notification Center Popover */}
        {notifOpen && (
          <div className="fixed right-6 top-16 z-50 w-96 bg-[#0D111C] border border-white/[0.12] rounded-xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-white/[0.07] pb-2.5">
              <h3 className="text-xs font-semibold text-white">
                {isFr ? 'Notifications & Alertes Système' : 'System Notifications & Alerts'}
              </h3>
              <button
                type="button"
                onClick={() => setNotifOpen(false)}
                className="text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                {isFr ? 'Fermer' : 'Close'}
              </button>
            </div>
            <div className="divide-y divide-white/[0.06] max-h-80 overflow-y-auto">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    if (n.linkSection) setActiveSection(n.linkSection);
                    setNotifOpen(false);
                  }}
                  className="py-3 first:pt-1 last:pb-1 text-xs cursor-pointer hover:opacity-90"
                >
                  <div className="font-medium text-white">{n.title}</div>
                  <div className="text-slate-400 mt-0.5 leading-relaxed">{n.message}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Primary Content Viewport (Generous 2026 Pacing & Max-Width 1440px) */}
        <main className="flex-1 min-w-0 px-6 py-7 lg:px-10 lg:py-8 max-w-[1400px] mx-auto w-full space-y-7">
          {/* Clean Contextual Breadcrumb Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/[0.07]">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>{isFr ? activeNavConfig.groupFr : activeNavConfig.groupEn}</span>
              <span aria-hidden="true">/</span>
              <span className="text-white font-medium">
                {isFr ? activeNavConfig.labelFr : activeNavConfig.labelEn}
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-500">Universal Autonomous Intelligence OS</span>
            </div>

            {bannerMessage ? (
              <div
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 border ${
                  bannerMessage.type === 'error'
                    ? 'bg-red-950/40 border-red-500/30 text-red-200'
                    : bannerMessage.type === 'success'
                    ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
                    : 'bg-[#131926] border-[#7557FF]/40 text-slate-100'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[#20D6D0]" />
                <span>{bannerMessage.text}</span>
                <button
                  type="button"
                  onClick={() => setBanner(null)}
                  className="ml-2 text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <button
                  type="button"
                  onClick={() => setActiveSection('developer-studio')}
                  className="text-[#20D6D0] hover:text-white transition-colors cursor-pointer font-mono"
                >
                  {isFr ? 'Kit GitHub & Captures HD →' : 'GitHub Kit & HD Captures →'}
                </button>
                <span aria-hidden="true" className="text-white/15">·</span>
                <button
                  type="button"
                  onClick={() => setCommandOpen(true)}
                  className="hover:text-white transition-colors cursor-pointer font-mono"
                >
                  ⌘K {isFr ? 'Palette de commandes' : 'Command Palette'}
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-32 bg-[#0D111C] border border-white/[0.07] rounded-xl p-6 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <>
              {activeSection === 'command-center' && <CommandCenterView />}
              {activeSection === 'intelligence' && <IntelligenceView />}
              {activeSection === 'projects' && <ProjectsView />}
              {activeSection === 'agent-network' && <AgentNetworkView />}
              {activeSection === 'agent-builder' && <AgentBuilderView />}
              {activeSection === 'collective' && <CollectiveIntelligenceView />}
              {activeSection === 'workflow-studio' && <WorkflowStudioView />}
              {activeSection === 'simulation-lab' && <SimulationLabView />}
              {activeSection === 'knowledge-center' && <KnowledgeCenterView />}
              {activeSection === 'creation-studio' && <CreationStudioView />}
              {activeSection === 'integrations' && <IntegrationsView />}
              {activeSection === 'developer-studio' && <DeveloperStudioView />}
              {activeSection === 'monitoring' && <MonitoringView />}
              {activeSection === 'settings' && <SettingsView />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
