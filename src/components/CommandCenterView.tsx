import React, { useState } from 'react';
import {
  Sparkles,
  ShieldAlert,
  Square,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowUpRight,
} from 'lucide-react';
import { useSyntaraStore } from '../store/useSyntaraStore.ts';
import type { NavigationSection } from '../types/syntara.ts';

interface EngineMatrixItem {
  code: string;
  name: string;
  summaryFr: string;
  summaryEn: string;
  section: NavigationSection;
  metric: string;
}

const ENGINE_MATRIX: EngineMatrixItem[] = [
  {
    code: 'ENGINE 01',
    name: 'Intent Engine',
    summaryFr: 'SYNTARA Intent Schema & faisabilité',
    summaryEn: 'SYNTARA Intent Schema & feasibility',
    section: 'intelligence',
    metric: 'Schema v1.0',
  },
  {
    code: 'ENGINE 02',
    name: 'Cognitive Engine',
    summaryFr: 'Planification DAG & traces justifiées',
    summaryEn: 'DAG planning & justified audit traces',
    section: 'intelligence',
    metric: 'DAG Active',
  },
  {
    code: 'ENGINE 03',
    name: 'Autonomous Agent',
    summaryFr: '12 agents · ASSISTED / SUPERVISED / AUTONOMOUS',
    summaryEn: '12 agents · ASSISTED / SUPERVISED / AUTONOMOUS',
    section: 'agent-network',
    metric: '12 Agents',
  },
  {
    code: 'ENGINE 04',
    name: 'Collective Intelligence',
    summaryFr: 'Délégation d’équipes & arbitrage conflits',
    summaryEn: 'Squad delegation & conflict arbitration',
    section: 'collective',
    metric: '3 Squads',
  },
  {
    code: 'ENGINE 05',
    name: 'Memory Engine',
    summaryFr: '6 couches mémoire & provenance vérifiée',
    summaryEn: '6 memory layers & verified provenance',
    section: 'intelligence',
    metric: '6 Layers',
  },
  {
    code: 'ENGINE 06',
    name: 'Reality Simulation',
    summaryFr: 'Scénarios Conservative, Balanced, Optimistic',
    summaryEn: 'Conservative, Balanced, Optimistic scenarios',
    section: 'simulation-lab',
    metric: '3 Scenarios',
  },
  {
    code: 'ENGINE 07',
    name: 'Evolution Engine',
    summaryFr: 'Tests A/B isolés & rollback de version',
    summaryEn: 'Isolated A/B tests & version rollback',
    section: 'monitoring',
    metric: 'A/B Guard',
  },
  {
    code: 'ENGINE 08',
    name: 'Universal Tool Fabric',
    summaryFr: 'Connecteurs MCP, API REST, Sandbox & SDK',
    summaryEn: 'MCP connectors, REST APIs, Sandbox & SDK',
    section: 'integrations',
    metric: 'MCP Ready',
  },
  {
    code: 'ENGINE 09',
    name: 'Knowledge RAG',
    summaryFr: 'Recherche hybride pgvector & citations',
    summaryEn: 'Hybrid pgvector search & citations',
    section: 'knowledge-center',
    metric: 'pgvector',
  },
  {
    code: 'ENGINE 10',
    name: 'Creation Engine',
    summaryFr: 'Workspace isolé, diffs Avant/Après & rollback',
    summaryEn: 'Isolated workspace, Before/After diffs',
    section: 'creation-studio',
    metric: 'Sandbox',
  },
  {
    code: 'ENGINE 11',
    name: 'Workflow Engine',
    summaryFr: 'Studio visuel 13 blocs & export JSON',
    summaryEn: '13-block visual studio & JSON export',
    section: 'workflow-studio',
    metric: '13 Blocks',
  },
  {
    code: 'ENGINE 12',
    name: 'Trust & Security',
    summaryFr: 'RBAC, approbation humaine & Kill Switch',
    summaryEn: 'RBAC, human approval & Kill Switch',
    section: 'settings',
    metric: 'Zero-Trust',
  },
];

export const CommandCenterView: React.FC = () => {
  const {
    language,
    agents,
    projects,
    tasks,
    approvals,
    modelProviders,
    auditLogs,
    budgetLimits,
    globalKillSwitchActive,
    actionBusy,
    triggerIntentToSystem,
    resolveApprovalRequest,
    killAgentImmediate,
    toggleGlobalKillSwitch,
    setActiveSection,
    setSelectedProjectId,
  } = useSyntaraStore();

  const [intentInput, setIntentInput] = useState('');
  const isFr = language === 'fr';

  const activeAgents = agents.filter((a) => a.state === 'Ready' || a.state === 'Running');
  const runningTasks = tasks.filter((t) => t.status === 'running' || t.status === 'queued');
  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const pendingApprovals = approvals.filter((a) => a.status === 'pending');
  const totalTokens = tasks.reduce((sum, t) => sum + t.tokensUsed, 0);

  const handleIntentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!intentInput.trim()) return;
    const created = await triggerIntentToSystem(intentInput.trim());
    if (created) {
      setIntentInput('');
      setSelectedProjectId(created.id);
      setActiveSection('projects');
    }
  };

  const quickIntents = isFr
    ? [
        {
          short: 'SaaS Gestion Commerciale B2B',
          full: 'Crée-moi une plateforme SaaS de gestion commerciale avec pipeline B2B et facturation supervisée',
        },
        {
          short: 'Cellule Cyber-Audit Zero-Trust',
          full: 'Construis un système autonome de veille cyber-sécurité et d’audit Zero-Trust continu',
        },
        {
          short: 'Unité FinOps Multi-Scénarios',
          full: 'Déploie une cellule d’analyse financière multi-scénarios connectée à PostgreSQL',
        },
      ]
    : [
        {
          short: 'B2B Commercial SaaS Platform',
          full: 'Build a multi-tenant B2B commercial management SaaS platform with supervised billing',
        },
        {
          short: 'Zero-Trust Cyber Audit Cell',
          full: 'Create an autonomous cybersecurity threat intelligence and continuous Zero-Trust auditing system',
        },
        {
          short: 'Multi-Scenario FinOps Unit',
          full: 'Deploy a multi-scenario financial analysis unit connected to PostgreSQL',
        },
      ];

  return (
    <div className="space-y-8">
      {/* 2026 V2 Architectural Focal Anchor: Intent-to-System Composer */}
      <section className="relative bg-gradient-to-br from-[#121728] via-[#0C101A] to-[#0B1420] border border-white/[0.09] rounded-2xl p-7 lg:p-9 overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-[#20D6D0]">
            <span>SIGNATURE · INTENT-TO-SYSTEM ORCHESTRATOR</span>
            <span aria-hidden="true" className="text-white/20">·</span>
            <span className="text-[#A78BFA]">
              {isFr ? '12 Moteurs Synchronisés' : '12 Synchronized Engines'}
            </span>
          </div>

          <h1
            className="text-2xl sm:text-3xl lg:text-[34px] font-semibold text-white tracking-tight leading-[1.16]"
            style={{ textWrap: 'balance' }}
          >
            {isFr
              ? 'Transformez une intention en un écosystème autonome opérationnel.'
              : 'Transform any intent into an operational autonomous ecosystem.'}
          </h1>

          <p className="text-sm text-[#8A94A6] leading-relaxed max-w-2xl">
            {isFr
              ? 'Exprimez votre objectif en langage naturel. SYNTARA valide le schéma d’intention, mobilise les agents spécialisés, simule les scénarios de risques et génère les livrables sous contrôle humain.'
              : 'Express your goal in natural language. SYNTARA validates the intent schema, mobilizes specialized agents, simulates risk scenarios, and generates deliverables under human governance.'}
          </p>

          <form onSubmit={handleIntentSubmit} className="pt-2 space-y-3.5">
            <div className="flex flex-col sm:flex-row gap-2.5 p-1.5 bg-[#06080E]/90 border border-white/[0.1] focus-within:border-[#6E56CF] rounded-xl">
              <input
                type="text"
                value={intentInput}
                onChange={(e) => setIntentInput(e.target.value)}
                placeholder={
                  isFr
                    ? 'Décrivez l’architecture, le produit SaaS ou le workflow autonome à construire...'
                    : 'Describe the architecture, SaaS product, or autonomous workflow to build...'
                }
                className="flex-1 bg-transparent px-3.5 py-2.5 text-sm text-white placeholder-[#8A94A6]/60 focus:outline-none"
              />
              <button
                type="submit"
                disabled={actionBusy || !intentInput.trim()}
                className="px-5 py-2.5 bg-[#6E56CF] hover:bg-[#7C66DC] disabled:opacity-40 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {actionBusy
                    ? isFr
                      ? 'Orchestration...'
                      : 'Orchestrating...'
                    : isFr
                    ? 'Orchestrer le Système'
                    : 'Orchestrate System'}
                </span>
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-1 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[#8A94A6]">
                  {isFr ? 'Amorces rapides :' : 'Quick starters:'}
                </span>
                {quickIntents.map((sample, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIntentInput(sample.full)}
                    className="text-slate-300 hover:text-[#20D6D0] transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>{sample.short}</span>
                    <ArrowUpRight className="w-3 h-3 text-slate-500" />
                  </button>
                ))}
              </div>

              <div className="hidden xl:flex items-center gap-2 font-mono text-[11px] text-[#8A94A6]">
                <span className="text-[#20D6D0]">01.Schema</span>
                <span>→</span>
                <span className="text-[#A78BFA]">02.DAG</span>
                <span>→</span>
                <span className="text-[#20D6D0]">03.Squad</span>
                <span>→</span>
                <span className="text-[#A78BFA]">04.Sim</span>
                <span>→</span>
                <span className="text-emerald-400">05.Trust</span>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* Unified Architectural Telemetry Ribbon (Single Container with Hairline Dividers) */}
      <section className="bg-[#0C101A] border border-white/[0.07] rounded-2xl grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 divide-y md:divide-y-0 md:divide-x divide-white/[0.07]">
        <div className="p-5">
          <div className="text-xs text-[#8A94A6]">
            {isFr ? 'Agents Actifs' : 'Active Agents'}
          </div>
          <div className="text-2xl font-semibold text-white font-mono tabular-nums mt-1.5">
            {activeAgents.length} <span className="text-sm text-slate-500 font-normal">/ {agents.length}</span>
          </div>
          <div className="text-[11px] text-emerald-400 font-mono mt-1">
            {isFr ? '12 moteurs en ligne' : '12 engines online'}
          </div>
        </div>

        <div className="p-5">
          <div className="text-xs text-[#8A94A6]">
            {isFr ? 'Projets SYNTARA' : 'SYNTARA Projects'}
          </div>
          <div className="text-2xl font-semibold text-white font-mono tabular-nums mt-1.5">
            {projects.length}
          </div>
          <div className="text-[11px] text-[#20D6D0] font-mono mt-1">
            {isFr ? 'Persistance atomique' : 'Atomic persistence'}
          </div>
        </div>

        <div className="p-5">
          <div className="text-xs text-[#8A94A6]">
            {isFr ? 'Tâches Exécutées' : 'Tasks Executed'}
          </div>
          <div className="text-2xl font-semibold text-white font-mono tabular-nums mt-1.5">
            {completedTasks.length} <span className="text-sm text-slate-500 font-normal">/ {tasks.length}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono tabular-nums">
            {runningTasks.length} {isFr ? 'en file active' : 'in active queue'}
          </div>
        </div>

        <div className="p-5">
          <div className="text-xs text-[#8A94A6]">
            {isFr ? 'Portes Trust Engine' : 'Trust Engine Gates'}
          </div>
          <div className="text-2xl font-semibold text-amber-400 font-mono tabular-nums mt-1.5">
            {pendingApprovals.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {isFr ? 'Validation humaine' : 'Human validation'}
          </div>
        </div>

        <div className="p-5">
          <div className="text-xs text-[#8A94A6]">
            {isFr ? 'Volume Tokens' : 'Token Volume'}
          </div>
          <div className="text-2xl font-semibold text-white font-mono tabular-nums mt-1.5">
            {(totalTokens / 1000).toFixed(1)}k
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono tabular-nums">
            {isFr ? 'Plafond' : 'Cap'} {(budgetLimits.maxTokensPerMission / 1000).toFixed(0)}k / run
          </div>
        </div>

        <div className="p-5">
          <div className="text-xs text-[#8A94A6]">
            {isFr ? 'Dépense FinOps Jour' : 'Daily FinOps Spend'}
          </div>
          <div className="text-2xl font-semibold text-[#20D6D0] font-mono tabular-nums mt-1.5">
            ${budgetLimits.currentDailySpendUsd.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono tabular-nums">
            {isFr ? 'Quota' : 'Quota'} ${budgetLimits.dailyCostLimitUsd.toFixed(2)}
          </div>
        </div>
      </section>

      {/* Main Executive Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        {/* Left 7 Cols: Human Control Gate & Operational Projects */}
        <div className="lg:col-span-7 space-y-7">
          {/* Trust Engine Approvals */}
          <div className="bg-[#0C101A] border border-white/[0.07] rounded-2xl p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-amber-400">
                  ENGINE 12 · ZERO-TRUST GOVERNANCE GATE
                </span>
                <h2 className="text-base font-semibold text-white mt-0.5">
                  {isFr ? 'Supervision Humaine & Approbations Critiques' : 'Human Supervision & Critical Approvals'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => toggleGlobalKillSwitch(!globalKillSwitchActive)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  globalKillSwitchActive
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-red-500/10 text-red-300 border border-red-500/25 hover:bg-red-500/20'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>
                  {globalKillSwitchActive
                    ? isFr
                      ? 'Réactiver les Moteurs'
                      : 'Resume All Engines'
                    : isFr
                    ? 'Kill Switch Global'
                    : 'Global Kill Switch'}
                </span>
              </button>
            </div>

            {pendingApprovals.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                {isFr
                  ? 'Aucune opération sensible en attente d’approbation humaine.'
                  : 'No sensitive operations awaiting human approval.'}
              </div>
            ) : (
              <div className="divide-y divide-white/[0.06]">
                {pendingApprovals.map((req) => (
                  <div key={req.id} className="py-5 first:pt-0 last:pb-0 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="text-xs text-amber-400/90 font-mono">
                          <span>{req.agentName}</span>
                          <span aria-hidden="true"> · </span>
                          <span>{req.operationType}</span>
                          <span aria-hidden="true"> · </span>
                          <span>{req.severity.toUpperCase()}</span>
                        </div>
                        <h3 className="text-sm font-semibold text-white">{req.title}</h3>
                        <p className="text-xs text-[#8A94A6] leading-relaxed">{req.description}</p>
                      </div>
                    </div>

                    <pre className="text-[11px] font-mono text-slate-300 bg-[#06080E] px-3.5 py-2.5 rounded-xl border border-white/[0.06] overflow-x-auto">
                      {req.proposedPayload}
                    </pre>

                    <div className="flex items-center justify-end gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={() => resolveApprovalRequest(req.id, 'rejected')}
                        className="px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-white/[0.04] hover:bg-red-500/20 border border-white/[0.08] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5 text-red-400" />
                        <span>{isFr ? 'Rejeter' : 'Reject'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => resolveApprovalRequest(req.id, 'approved')}
                        className="px-4 py-1.5 text-xs font-medium text-white bg-[#6E56CF] hover:bg-[#7C66DC] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isFr ? 'Autoriser l’Exécution' : 'Authorize Execution'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Operational Projects Ledger */}
          <div className="bg-[#0C101A] border border-white/[0.07] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#20D6D0]">
                  INTENT-TO-SYSTEM ECOSYSTEMS
                </span>
                <h2 className="text-base font-semibold text-white mt-0.5">
                  {isFr ? 'Projets Opérationnels Actifs' : 'Active Operational Projects'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveSection('projects')}
                className="text-xs text-[#8A94A6] hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <span>{isFr ? 'Tous les projets' : 'All projects'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-white/[0.06]">
              {projects.map((prj) => (
                <div key={prj.id} className="py-4 first:pt-1 last:pb-0 flex items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{prj.name}</div>
                    <div className="text-xs text-[#8A94A6]">
                      <span>{prj.agentIds.length} agents</span>
                      <span aria-hidden="true"> · </span>
                      <span>{prj.taskIds.length} tâches</span>
                      <span aria-hidden="true"> · </span>
                      <span>{prj.artifactIds.length} livrables</span>
                      <span aria-hidden="true"> · </span>
                      <span className="font-mono tabular-nums text-[#20D6D0]">
                        Faisabilité {prj.intentSchema.feasibilityScore}%
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProjectId(prj.id);
                      setActiveSection('projects');
                    }}
                    className="px-3.5 py-1.5 text-xs font-medium bg-white/[0.04] hover:bg-white/[0.09] text-slate-200 border border-white/[0.08] rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {isFr ? 'Ouvrir' : 'Open'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Model Adapter, Agent Control & Audit Stream */}
        <div className="lg:col-span-5 space-y-7">
          {/* Model Adapter Telemetry */}
          <div className="bg-[#0C101A] border border-white/[0.07] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#A78BFA]">
                  SYNTARA MODEL ADAPTER
                </span>
                <h2 className="text-base font-semibold text-white mt-0.5">
                  {isFr ? 'Routeur Multi-Modèles IA' : 'Multi-Provider AI Router'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveSection('integrations')}
                className="text-xs text-[#8A94A6] hover:text-white cursor-pointer"
              >
                {isFr ? 'Gérer' : 'Manage'}
              </button>
            </div>
            <div className="divide-y divide-white/[0.06]">
              {modelProviders.map((prov) => (
                <div key={prov.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                  <div className="min-w-0 pr-3">
                    <div className="font-medium text-slate-200 truncate">{prov.name}</div>
                    <div className="text-slate-500 font-mono truncate mt-0.5">
                      {prov.defaultModel} · {prov.isLocal ? 'Local' : 'Remote'}
                    </div>
                  </div>
                  <div className="text-right font-mono tabular-nums shrink-0">
                    <div
                      className={
                        prov.status === 'online'
                          ? 'text-emerald-400'
                          : prov.status === 'standby'
                          ? 'text-[#20D6D0]'
                          : 'text-amber-400'
                      }
                    >
                      {prov.status.toUpperCase()}
                    </div>
                    <div className="text-slate-500 mt-0.5">{prov.latencyMs}ms</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Agent Fleet Quick Supervision */}
          <div className="bg-[#0C101A] border border-white/[0.07] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <h2 className="text-base font-semibold text-white">
                {isFr ? 'Flotte d’Agents Autonomes' : 'Autonomous Agent Fleet'}
              </h2>
              <button
                type="button"
                onClick={() => setActiveSection('agent-network')}
                className="text-xs text-[#8A94A6] hover:text-white cursor-pointer"
              >
                {isFr ? 'Voir les 12 agents' : 'View 12 agents'}
              </button>
            </div>
            <div className="divide-y divide-white/[0.06]">
              {agents.slice(0, 5).map((agent) => (
                <div key={agent.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-slate-200 truncate">{agent.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono tabular-nums mt-0.5">
                      {agent.autonomyLevel} · {agent.state} · {agent.successRate}%
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => killAgentImmediate(agent.id)}
                    className="px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:text-red-300 bg-white/[0.03] hover:bg-red-500/15 border border-white/[0.07] rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Square className="w-2.5 h-2.5" />
                    <span>Stop</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Correlated Audit Stream */}
          <div className="bg-[#0C101A] border border-white/[0.07] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <h2 className="text-base font-semibold text-white">
                {isFr ? 'Flux d’Audit Corrélé' : 'Correlated Audit Stream'}
              </h2>
              <button
                type="button"
                onClick={() => setActiveSection('monitoring')}
                className="text-xs text-[#8A94A6] hover:text-white cursor-pointer"
              >
                {isFr ? 'Historique complet' : 'Full log'}
              </button>
            </div>
            <div className="divide-y divide-white/[0.06]">
              {auditLogs.slice(0, 4).map((log) => (
                <div key={log.id} className="py-3 first:pt-0 last:pb-0 text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-500 font-mono tabular-nums text-[11px]">
                    <span>{log.engine}</span>
                    <span>{log.correlationId}</span>
                  </div>
                  <div className="font-medium text-slate-200">{log.action}</div>
                  <div className="text-[#8A94A6] leading-relaxed">{log.details}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2026 Interactive 12-Engine Architectural Matrix */}
      <section className="bg-[#0C101A] border border-white/[0.07] rounded-2xl p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-white/[0.06]">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#20D6D0]">
              ARCHITECTURE SYSTÈME · 12 CORE INTELLIGENT ENGINES
            </span>
            <h2 className="text-base font-semibold text-white mt-0.5">
              {isFr
                ? 'Matrice Interactive des 12 Moteurs Intelligents SYNTARA'
                : 'Interactive Matrix of the 12 SYNTARA Intelligent Engines'}
            </h2>
          </div>
          <span className="text-xs font-mono text-emerald-400">
            12 / 12 ONLINE · ZERO-TRUST ACTIVE
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {ENGINE_MATRIX.map((eng) => (
            <button
              key={eng.code}
              type="button"
              onClick={() => setActiveSection(eng.section)}
              className="text-left p-4 bg-[#06080E] hover:bg-[#101624] border border-white/[0.06] hover:border-[#6E56CF]/60 rounded-xl transition-all group cursor-pointer space-y-1.5"
            >
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-[#20D6D0]">{eng.code}</span>
                <span className="text-[#A78BFA] group-hover:text-white transition-colors">
                  {eng.metric} →
                </span>
              </div>
              <div className="text-xs font-semibold text-white">{eng.name}</div>
              <div className="text-[11px] text-[#8A94A6] line-clamp-1">
                {isFr ? eng.summaryFr : eng.summaryEn}
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
