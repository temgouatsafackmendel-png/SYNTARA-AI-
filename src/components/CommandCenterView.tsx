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
      {/* 2026 Architectural Focal Anchor: Intent-to-System Composer */}
      <section className="relative bg-[#0D111C] border border-white/[0.08] rounded-2xl p-7 lg:p-9 overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-2 text-xs text-[#20D6D0] font-medium tracking-wide">
            <span>INTENT-TO-SYSTEM ENGINE</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-400">
              {isFr ? 'Orchestration autonome de bout en bout' : 'End-to-end autonomous orchestration'}
            </span>
          </div>

          <h1
            className="text-2xl sm:text-3xl lg:text-[34px] font-semibold text-white tracking-tight leading-[1.18]"
            style={{ textWrap: 'balance' }}
          >
            {isFr
              ? 'Transformez une intention en un système autonome opérationnel.'
              : 'Transform any intent into an operational autonomous system.'}
          </h1>

          <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">
            {isFr
              ? 'Décrivez votre objectif. SYNTARA compile le schéma d’intention, mobilise une équipe d’agents spécialisés, génère le code dans un espace isolé et construit le workflow associé.'
              : 'Describe your objective. SYNTARA compiles the intent schema, assembles a specialized agent squad, generates isolated workspace code, and builds the workflow.'}
          </p>

          <form onSubmit={handleIntentSubmit} className="pt-2 space-y-3">
            <div className="flex flex-col sm:flex-row gap-2.5 p-1.5 bg-[#07090F] border border-white/[0.09] focus-within:border-[#7557FF] rounded-xl">
              <input
                type="text"
                value={intentInput}
                onChange={(e) => setIntentInput(e.target.value)}
                placeholder={
                  isFr
                    ? 'Décrivez l’architecture, le produit SaaS ou le workflow autonome à construire...'
                    : 'Describe the architecture, SaaS product, or autonomous workflow to build...'
                }
                className="flex-1 bg-transparent px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={actionBusy || !intentInput.trim()}
                className="px-5 py-2.5 bg-[#7557FF] hover:bg-[#6344F5] disabled:opacity-40 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
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

            <div className="flex flex-wrap items-center gap-3 pt-0.5 text-xs">
              <span className="text-slate-500">
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
          </form>
        </div>
      </section>

      {/* Unified Architectural Telemetry Ribbon (Single Container with Hairline Dividers) */}
      <section className="bg-[#0D111C] border border-white/[0.07] rounded-2xl grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 divide-y md:divide-y-0 md:divide-x divide-white/[0.07]">
        <div className="p-5">
          <div className="text-xs text-slate-400">
            {isFr ? 'Agents Actifs' : 'Active Agents'}
          </div>
          <div className="text-2xl font-semibold text-white font-mono tabular-nums mt-1.5">
            {activeAgents.length} <span className="text-sm text-slate-500 font-normal">/ {agents.length}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {isFr ? '12 moteurs synchronisés' : '12 engines synced'}
          </div>
        </div>

        <div className="p-5">
          <div className="text-xs text-slate-400">
            {isFr ? 'Projets SYNTARA' : 'SYNTARA Projects'}
          </div>
          <div className="text-2xl font-semibold text-white font-mono tabular-nums mt-1.5">
            {projects.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {isFr ? 'Persistance atomique' : 'Atomic persistence'}
          </div>
        </div>

        <div className="p-5">
          <div className="text-xs text-slate-400">
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
          <div className="text-xs text-slate-400">
            {isFr ? 'Portes Trust Engine' : 'Trust Engine Gates'}
          </div>
          <div className="text-2xl font-semibold text-amber-400 font-mono tabular-nums mt-1.5">
            {pendingApprovals.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {isFr ? 'En attente de validation' : 'Awaiting approval'}
          </div>
        </div>

        <div className="p-5">
          <div className="text-xs text-slate-400">
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
          <div className="text-xs text-slate-400">
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
          <div className="bg-[#0D111C] border border-white/[0.07] rounded-2xl p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
              <div>
                <h2 className="text-base font-semibold text-white">
                  {isFr ? 'Supervision Humaine & Trust Engine' : 'Human Supervision & Trust Engine'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isFr
                    ? 'Validation obligatoire des publications externes, opérations financières et changements critiques.'
                    : 'Mandatory human validation for external publications, financial actions, and critical changes.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggleGlobalKillSwitch(!globalKillSwitchActive)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
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
                        <p className="text-xs text-slate-400 leading-relaxed">{req.description}</p>
                      </div>
                    </div>

                    <pre className="text-[11px] font-mono text-slate-300 bg-[#07090F] px-3.5 py-2.5 rounded-lg border border-white/[0.06] overflow-x-auto">
                      {req.proposedPayload}
                    </pre>

                    <div className="flex items-center justify-end gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={() => resolveApprovalRequest(req.id, 'rejected')}
                        className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-white/[0.04] hover:bg-red-500/20 border border-white/[0.08] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5 text-red-400" />
                        <span>{isFr ? 'Rejeter' : 'Reject'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => resolveApprovalRequest(req.id, 'approved')}
                        className="px-3.5 py-1.5 text-xs font-medium text-white bg-[#7557FF] hover:bg-[#6344F5] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
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
          <div className="bg-[#0D111C] border border-white/[0.07] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <h2 className="text-base font-semibold text-white">
                {isFr ? 'Projets Opérationnels Actifs' : 'Active Operational Projects'}
              </h2>
              <button
                type="button"
                onClick={() => setActiveSection('projects')}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
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
                    <div className="text-xs text-slate-400">
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
                    className="px-3 py-1.5 text-xs font-medium bg-white/[0.04] hover:bg-white/[0.09] text-slate-200 border border-white/[0.08] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
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
          <div className="bg-[#0D111C] border border-white/[0.07] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <h2 className="text-base font-semibold text-white">
                {isFr ? 'Adaptateurs de Modèles IA' : 'AI Model Adapters'}
              </h2>
              <button
                type="button"
                onClick={() => setActiveSection('integrations')}
                className="text-xs text-slate-400 hover:text-white cursor-pointer"
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
          <div className="bg-[#0D111C] border border-white/[0.07] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <h2 className="text-base font-semibold text-white">
                {isFr ? 'Flotte d’Agents Autonomes' : 'Autonomous Agent Fleet'}
              </h2>
              <button
                type="button"
                onClick={() => setActiveSection('agent-network')}
                className="text-xs text-slate-400 hover:text-white cursor-pointer"
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
                    className="px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:text-red-300 bg-white/[0.03] hover:bg-red-500/15 border border-white/[0.07] rounded-md transition-colors flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Square className="w-2.5 h-2.5" />
                    <span>Stop</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Correlated Audit Stream */}
          <div className="bg-[#0D111C] border border-white/[0.07] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <h2 className="text-base font-semibold text-white">
                {isFr ? 'Flux d’Audit Corrélé' : 'Correlated Audit Stream'}
              </h2>
              <button
                type="button"
                onClick={() => setActiveSection('monitoring')}
                className="text-xs text-slate-400 hover:text-white cursor-pointer"
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
                  <div className="text-slate-400 leading-relaxed">{log.details}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
