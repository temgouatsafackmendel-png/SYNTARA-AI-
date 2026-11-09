import React, { useState } from 'react';
import {
  Play,
  Square,
  Download,
} from 'lucide-react';
import { useSyntaraStore } from '../store/useSyntaraStore.ts';
import type { AutonomyLevel } from '../types/syntara.ts';

export const AgentNetworkView: React.FC = () => {
  const {
    language,
    agents,
    agentRuns,
    projects,
    executeAgentMissionAction,
    killAgentImmediate,
    actionBusy,
  } = useSyntaraStore();

  const isFr = language === 'fr';
  const [selectedAgentId, setSelectedAgentId] = useState<string>(agents[0]?.id || 'agt_system_architect');
  const [missionText, setMissionText] = useState('');
  const [sensitiveFlag, setSensitiveFlag] = useState(false);
  const [filterAutonomy, setFilterAutonomy] = useState<string>('ALL');

  const selectedAgent = agents.find((a) => a.id === selectedAgentId) || agents[0];
  const filteredAgents = agents.filter(
    (a) => filterAutonomy === 'ALL' || a.autonomyLevel === filterAutonomy
  );

  const handleLaunchMission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgent || !missionText.trim()) return;
    await executeAgentMissionAction({
      agentId: selectedAgent.id,
      mission: missionText.trim(),
      projectId: projects[0]?.id,
      requireApprovalForSensitive: sensitiveFlag,
    });
    setMissionText('');
  };

  return (
    <div className="space-y-8">
      {/* Header & Filter Controls */}
      <div className="bg-[#0D111C] border border-white/[0.07] rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#20D6D0]">
            ENGINE 03 · AUTONOMOUS AGENT NETWORK
          </span>
          <h2 className="text-base font-semibold text-[#F8FAFC] mt-0.5">
            {isFr ? `Réseau des ${agents.length} Agents Spécialisés` : `${agents.length} Specialized Autonomous Agents`}
          </h2>
          <p className="text-xs text-[#8A94A6] mt-0.5">
            {isFr
              ? 'Supervision en temps réel, niveaux d’autonomie explicites et arrêt immédiat (Kill Switch).'
              : 'Real-time supervision, explicit autonomy levels, and immediate stop controls.'}
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-[#07090F] border border-white/[0.08] rounded-xl">
          {['ALL', 'ASSISTED', 'SUPERVISED', 'AUTONOMOUS'].map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setFilterAutonomy(lvl)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                filterAutonomy === lvl
                  ? 'bg-[#6E56CF] text-white'
                  : 'text-[#8A94A6] hover:text-[#F8FAFC]'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split: Agent Grid (7 cols) + Selected Agent Inspector & Mission Runner (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAgents.map((agt) => {
            const isSelected = agt.id === selectedAgent?.id;
            return (
              <div
                key={agt.id}
                onClick={() => setSelectedAgentId(agt.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#121827] border-[#6E56CF]'
                    : 'bg-[#0D111C] border-white/[0.07] hover:border-white/[0.16]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[11px] text-[#20D6D0] font-mono tracking-wider">
                      {agt.autonomyLevel} · v{agt.version}
                    </div>
                    <h3 className="text-sm font-semibold text-[#F8FAFC] mt-1">{agt.name}</h3>
                    <div className="text-xs text-[#8A94A6]">{agt.role}</div>
                  </div>
                  <span
                    className={`text-xs font-mono ${
                      agt.state === 'Running'
                        ? 'text-[#20D6D0]'
                        : agt.state === 'Waiting Approval'
                        ? 'text-amber-400'
                        : agt.state === 'Paused'
                        ? 'text-red-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {agt.state}
                  </span>
                </div>

                <p className="text-xs text-[#8A94A6] mt-3 line-clamp-2 leading-relaxed">{agt.description}</p>

                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono tabular-nums text-[#8A94A6]">
                  <span>{agt.successRate}% · {agt.totalRuns} runs</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      killAgentImmediate(agt.id);
                    }}
                    className="px-2.5 py-1 text-red-400 hover:text-white bg-red-500/[0.08] hover:bg-red-500/20 border border-red-500/25 rounded-lg text-[11px] transition-colors cursor-pointer"
                  >
                    Kill Switch
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right 5 cols: Agent Inspector + Live Mission Execution + Run History */}
        {selectedAgent && (
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#0D111C] border border-white/[0.07] rounded-2xl p-6 space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] text-[#A78BFA] font-mono">{selectedAgent.id}</div>
                  <h3 className="text-base font-semibold text-[#F8FAFC] mt-0.5">{selectedAgent.name}</h3>
                  <p className="text-xs text-[#8A94A6] mt-1 leading-relaxed">{selectedAgent.mission}</p>
                </div>
                <button
                  type="button"
                  onClick={() => killAgentImmediate(selectedAgent.id)}
                  className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg text-xs font-medium flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>{isFr ? 'Arrêt' : 'Stop'}</span>
                </button>
              </div>

              <div className="divide-y divide-white/[0.06] border-y border-white/[0.06] text-xs">
                <div className="py-2.5 flex justify-between gap-4">
                  <span className="text-[#8A94A6]">{isFr ? 'Instructions' : 'Instructions'}</span>
                  <span className="text-[#F8FAFC] text-right">{selectedAgent.instructions}</span>
                </div>
                <div className="py-2.5 flex justify-between gap-4">
                  <span className="text-[#8A94A6]">{isFr ? 'Outils autorisés' : 'Tools'}</span>
                  <span className="text-[#20D6D0] font-mono text-right">{selectedAgent.tools.join(', ')}</span>
                </div>
                <div className="py-2.5 flex justify-between gap-4">
                  <span className="text-[#8A94A6]">{isFr ? 'Permissions' : 'Permissions'}</span>
                  <span className="text-[#F8FAFC] font-mono text-right">{selectedAgent.permissions.join(', ')}</span>
                </div>
                <div className="py-2.5 flex justify-between gap-4 font-mono tabular-nums">
                  <span className="text-[#8A94A6] font-sans">{isFr ? 'Quotas' : 'Quotas'}</span>
                  <span className="text-[#F8FAFC]">
                    {selectedAgent.resourceLimits.maxTokensPerRun} tok · ${selectedAgent.resourceLimits.maxCostUsdPerRun} · {selectedAgent.resourceLimits.maxExecutionTimeSeconds}s
                  </span>
                </div>
              </div>

              {/* Dispatch Mission to this Agent */}
              <form onSubmit={handleLaunchMission} className="space-y-3">
                <div className="text-xs font-medium text-[#F8FAFC]">
                  {isFr ? 'Assigner et exécuter une mission' : 'Assign & execute mission'}
                </div>
                <textarea
                  rows={2}
                  value={missionText}
                  onChange={(e) => setMissionText(e.target.value)}
                  placeholder={
                    isFr
                      ? 'Décrivez la mission à planifier et exécuter par cet agent...'
                      : 'Describe the mission for this agent to plan and execute...'
                  }
                  className="w-full bg-[#07090F] border border-white/[0.08] focus:border-[#6E56CF] focus:outline-none rounded-xl p-3 text-xs text-[#F8FAFC]"
                />
                <div className="flex items-center justify-between gap-2">
                  <label className="flex items-center gap-2 text-xs text-[#8A94A6] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sensitiveFlag}
                      onChange={(e) => setSensitiveFlag(e.target.checked)}
                      className="rounded border-white/20"
                    />
                    <span>{isFr ? 'Simuler opération sensible (Trust Gate)' : 'Simulate sensitive op'}</span>
                  </label>
                  <button
                    type="submit"
                    disabled={actionBusy || !missionText.trim()}
                    className="px-4 py-2 bg-[#6E56CF] hover:bg-[#7C66DC] disabled:opacity-50 text-white text-xs font-medium rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{isFr ? 'Exécuter' : 'Execute'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Recent Agent Runs */}
            <div className="bg-[#0D111C] border border-white/[0.07] rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-semibold text-[#F8FAFC]">
                {isFr ? 'Journal des Exécutions' : 'Agent Execution Runs'}
              </h3>
              <div className="divide-y divide-white/[0.06] max-h-80 overflow-y-auto">
                {agentRuns.map((run) => (
                  <div key={run.id} className="py-3.5 first:pt-0 last:pb-0 text-xs space-y-1.5">
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-[#F8FAFC] font-medium">{run.agentName}</span>
                      <span className={run.state === 'Completed' ? 'text-emerald-400' : 'text-amber-400'}>
                        {run.state}
                      </span>
                    </div>
                    <div className="text-[#8A94A6]">{run.mission}</div>
                    <div className="space-y-1 pt-1">
                      {run.steps.map((s) => (
                        <div key={s.id} className="text-[#8A94A6] flex justify-between gap-2">
                          <span>· {s.action}</span>
                          <span className="font-mono tabular-nums">{s.durationMs}ms</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const AgentBuilderView: React.FC = () => {
  const { language, tools, modelProviders, createCustomAgent, setActiveSection } = useSyntaraStore();
  const isFr = language === 'fr';

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [mission, setMission] = useState('');
  const [instructions, setInstructions] = useState('');
  const [autonomyLevel, setAutonomyLevel] = useState<AutonomyLevel>('SUPERVISED');
  const [modelId, setModelId] = useState('gemini-3.8-flash');
  const [selectedTools, setSelectedTools] = useState<string[]>(['tool_fs_sandbox', 'tool_knowledge_rag']);
  const [selectedPermissions] = useState<string[]>(['workspace:read', 'knowledge:read']);
  const [maxTokens, setMaxTokens] = useState(32000);
  const [maxCost] = useState(0.8);
  const [testOutput, setTestOutput] = useState<string | null>(null);

  const toggleItem = (list: string[], item: string, setter: (v: string[]) => void) => {
    setter(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) return;
    await createCustomAgent({
      name: name.trim(),
      role: role.trim(),
      description: mission.trim() || `Agent spécialisé ${role}`,
      mission: mission.trim() || 'Accomplir les missions assignées avec rigueur.',
      instructions: instructions.trim() || 'Vérifier les sources et respecter les quotas.',
      modelId,
      autonomyLevel,
      tools: selectedTools,
      permissions: selectedPermissions,
      resourceLimits: {
        maxTokensPerRun: maxTokens,
        maxCostUsdPerRun: maxCost,
        maxExecutionTimeSeconds: 120,
        maxRetries: 2,
      },
    });
    setActiveSection('agent-network');
  };

  const handleExportConfig = () => {
    const config = {
      name: name || 'Custom Syntara Agent',
      role: role || 'Specialist',
      mission,
      instructions,
      modelId,
      autonomyLevel,
      tools: selectedTools,
      permissions: selectedPermissions,
      resourceLimits: { maxTokensPerRun: maxTokens, maxCostUsdPerRun: maxCost },
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'syntara_agent_manifest.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <form onSubmit={handlePublish} className="lg:col-span-8 bg-[#0D111C] border border-white/[0.07] rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#20D6D0]">
              AGENT BUILDER STUDIO
            </span>
            <h2 className="text-base font-semibold text-[#F8FAFC] mt-0.5">
              {isFr ? 'Conception d’Agent Autonome sur Mesure' : 'Autonomous Agent Designer'}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleExportConfig}
            className="px-3.5 py-2 bg-[#07090F] hover:bg-white/[0.04] text-[#F8FAFC] border border-white/[0.08] rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isFr ? 'Exporter Manifeste JSON' : 'Export JSON'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[#8A94A6] mb-1.5">Nom de l’Agent</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Cloud FinOps Optimizer Agent"
              className="w-full bg-[#07090F] border border-white/[0.08] focus:border-[#6E56CF] focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-[#F8FAFC]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#8A94A6] mb-1.5">Rôle Spécialisé</label>
            <input
              type="text"
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Ex: Infrastructure & Cost Architect"
              className="w-full bg-[#07090F] border border-white/[0.08] focus:border-[#6E56CF] focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-[#F8FAFC]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-[#8A94A6] mb-1.5">Mission Principale</label>
          <input
            type="text"
            value={mission}
            onChange={(e) => setMission(e.target.value)}
            placeholder="Ex: Auditer les coûts d’exécution et proposer des optimisations de routage vers des modèles locaux."
            className="w-full bg-[#07090F] border border-white/[0.08] focus:border-[#6E56CF] focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-[#F8FAFC]"
          />
        </div>

        <div>
          <label className="block text-xs text-[#8A94A6] mb-1.5">Instructions Système & Garde-Fous</label>
          <textarea
            rows={3}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Instructions détaillées, politiques d’erreur et format de rapport attendu..."
            className="w-full bg-[#07090F] border border-white/[0.08] focus:border-[#6E56CF] focus:outline-none rounded-xl p-3.5 text-xs text-[#F8FAFC]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-[#8A94A6] mb-1.5">Niveau d’Autonomie</label>
            <select
              value={autonomyLevel}
              onChange={(e) => setAutonomyLevel(e.target.value as AutonomyLevel)}
              className="w-full bg-[#07090F] border border-white/[0.08] rounded-xl px-3 py-2.5 text-xs text-[#F8FAFC]"
            >
              <option value="ASSISTED">ASSISTED (Confirmation systématique)</option>
              <option value="SUPERVISED">SUPERVISED (Actions sensibles validées)</option>
              <option value="AUTONOMOUS">AUTONOMOUS (Quotas & permissions)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-[#8A94A6] mb-1.5">Modèle IA (SYNTARA Adapter)</label>
            <select
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
              className="w-full bg-[#07090F] border border-white/[0.08] rounded-xl px-3 py-2.5 text-xs text-[#F8FAFC] font-mono"
            >
              {modelProviders
                .flatMap((p) => p.availableModels)
                .map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-[#8A94A6] mb-1.5">Quota Tokens / Run</label>
            <input
              type="number"
              value={maxTokens}
              onChange={(e) => setMaxTokens(Number(e.target.value))}
              className="w-full bg-[#07090F] border border-white/[0.08] rounded-xl px-3 py-2.5 text-xs text-[#F8FAFC] font-mono tabular-nums"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-[#8A94A6] mb-2">Outils Autorisés (Universal Tool Fabric)</label>
          <div className="flex flex-wrap gap-2">
            {tools.map((t) => {
              const active = selectedTools.includes(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggleItem(selectedTools, t.id, setSelectedTools)}
                  className={`px-3 py-1.5 text-xs rounded-xl border transition-all cursor-pointer ${
                    active
                      ? 'bg-[#6E56CF]/20 border-[#6E56CF] text-white'
                      : 'bg-[#07090F] border-white/[0.08] text-[#8A94A6] hover:text-[#F8FAFC]'
                  }`}
                >
                  {t.name} ({t.protocol})
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.06]">
          <button
            type="button"
            onClick={() =>
              setTestOutput(
                `[SANDBOX TEST PASS] Agent "${name || 'Candidat'}" initialisé en mode ${autonomyLevel} avec ${selectedTools.length} outils et plafond ${maxTokens} tokens.`
              )
            }
            className="px-4 py-2.5 bg-[#07090F] hover:bg-white/[0.04] text-[#20D6D0] border border-white/[0.08] rounded-xl text-xs font-medium cursor-pointer"
          >
            {isFr ? 'Tester en Sandbox' : 'Test in Sandbox'}
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#6E56CF] hover:bg-[#7C66DC] text-white text-xs font-medium rounded-xl cursor-pointer"
          >
            {isFr ? 'Publier l’Agent' : 'Publish Agent'}
          </button>
        </div>

        {testOutput && (
          <div className="p-3.5 bg-[#07090F] border border-emerald-500/30 rounded-xl text-xs font-mono text-emerald-400">
            {testOutput}
          </div>
        )}
      </form>

      <div className="lg:col-span-4 bg-[#0D111C] border border-white/[0.07] rounded-2xl p-6 space-y-4 h-fit">
        <h3 className="text-sm font-semibold text-[#F8FAFC]">
          {isFr ? 'Charte des 3 Niveaux d’Autonomie' : '3 Autonomy Levels Charter'}
        </h3>
        <div className="divide-y divide-white/[0.06] text-xs">
          <div className="py-3.5 first:pt-0">
            <div className="font-mono font-semibold text-[#A78BFA]">01 · ASSISTED</div>
            <p className="text-[#8A94A6] mt-1 leading-relaxed">
              L’agent prépare le plan et chaque opération, puis attend la confirmation de l’opérateur humain.
            </p>
          </div>
          <div className="py-3.5">
            <div className="font-mono font-semibold text-[#20D6D0]">02 · SUPERVISED</div>
            <p className="text-[#8A94A6] mt-1 leading-relaxed">
              L’agent exécute les actions standard autorisées et sollicite le Trust Engine pour toute opération sensible.
            </p>
          </div>
          <div className="py-3.5 last:pb-0">
            <div className="font-mono font-semibold text-emerald-400">03 · AUTONOMOUS</div>
            <p className="text-[#8A94A6] mt-1 leading-relaxed">
              L’agent exécute ses missions de bout en bout dans le strict respect des quotas, permissions et du Kill Switch.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CollectiveIntelligenceView: React.FC = () => {
  const {
    language,
    teams,
    interAgentMessages,
    triggerTeamCollaboration,
    createTeamAction,
  } = useSyntaraStore();

  const isFr = language === 'fr';
  const [collabMission, setCollabMission] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState(teams[0]?.id || 'team_fullstack_squad');
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamMembers] = useState<string[]>([
    'agt_system_architect',
    'agt_software_engineer',
    'agt_qa',
  ]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Teams & Multi-Agent Delegation */}
      <div className="lg:col-span-7 bg-[#0D111C] border border-white/[0.07] rounded-2xl p-6 space-y-6">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#20D6D0]">
            ENGINE 04 · COLLECTIVE INTELLIGENCE
          </span>
          <h2 className="text-base font-semibold text-[#F8FAFC] mt-0.5">
            {isFr ? 'Orchestration d’Équipes Multi-Agents' : 'Multi-Agent Squad Orchestration'}
          </h2>
          <p className="text-xs text-[#8A94A6] mt-0.5">
            {isFr
              ? 'Répartissez une mission complexe entre un architecte, des ingénieurs et un agent QA avec mémoire partagée cloisonnée.'
              : 'Distribute complex missions across an architect, engineers, and QA with scoped memory sharing.'}
          </p>
        </div>

        <div className="space-y-3">
          {teams.map((team) => (
            <div
              key={team.id}
              onClick={() => setSelectedTeamId(team.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedTeamId === team.id
                  ? 'bg-[#121827] border-[#6E56CF]'
                  : 'bg-[#07090F] border-white/[0.07] hover:border-white/[0.15]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-[#F8FAFC]">{team.name}</div>
                <span className="text-xs font-mono text-[#20D6D0]">
                  {team.memberAgentIds.length} agents · {team.conflictResolutionPolicy}
                </span>
              </div>
              <p className="text-xs text-[#8A94A6] mt-1">{team.description}</p>
              <div className="text-[11px] text-[#A78BFA] font-mono mt-2">
                Scope mémoire : {team.sharedMemoryScope}
              </div>
            </div>
          ))}
        </div>

        {/* Launch Collaborative Mission */}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!collabMission.trim()) return;
            await triggerTeamCollaboration(selectedTeamId, collabMission.trim());
            setCollabMission('');
          }}
          className="pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row gap-3"
        >
          <input
            type="text"
            value={collabMission}
            onChange={(e) => setCollabMission(e.target.value)}
            placeholder={
              isFr
                ? 'Déléguer une mission complexe à l’équipe sélectionnée...'
                : 'Delegate a complex mission to the selected squad...'
            }
            className="flex-1 bg-[#07090F] border border-white/[0.08] focus:border-[#6E56CF] focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-[#F8FAFC]"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-[#6E56CF] hover:bg-[#7C66DC] text-white text-xs font-medium rounded-xl whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isFr ? 'Orchestrer l’Équipe' : 'Orchestrate Squad'}
          </button>
        </form>

        {/* Create Custom Squad */}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!newTeamName.trim()) return;
            await createTeamAction({
              name: newTeamName.trim(),
              description: 'Équipe multi-agents configurée sur mesure.',
              orchestratorAgentId: 'agt_project_manager',
              memberAgentIds: newTeamMembers,
              conflictResolutionPolicy: 'orchestrator_decides',
            });
            setNewTeamName('');
          }}
          className="pt-4 border-t border-white/[0.06] space-y-2.5"
        >
          <div className="text-xs font-medium text-[#F8FAFC]">
            {isFr ? 'Créer une Équipe Personnalisée' : 'Create Custom Agent Squad'}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder="Nom de la nouvelle équipe (ex: Cyber Defense & Audit Squad)"
              className="flex-1 bg-[#07090F] border border-white/[0.08] focus:border-[#6E56CF] focus:outline-none rounded-xl px-3.5 py-2 text-xs text-[#F8FAFC]"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#07090F] hover:bg-white/[0.04] text-[#20D6D0] border border-white/[0.08] rounded-xl text-xs font-medium cursor-pointer"
            >
              + Créer
            </button>
          </div>
        </form>
      </div>

      {/* Inter-Agent Communication Bus */}
      <div className="lg:col-span-5 bg-[#0D111C] border border-white/[0.07] rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-[#F8FAFC]">
          {isFr ? 'Bus de Communication Inter-Agents & Arbitrage' : 'Inter-Agent Communication & Arbitration Bus'}
        </h3>
        <div className="divide-y divide-white/[0.06] max-h-[520px] overflow-y-auto">
          {interAgentMessages.map((m) => (
            <div key={m.id} className="py-3.5 first:pt-0 last:pb-0 text-xs space-y-1.5">
              <div className="flex items-center justify-between font-mono text-[#20D6D0]">
                <span>
                  {m.fromAgentName} → {m.toAgentName}
                </span>
                <span className="uppercase text-[#A78BFA]">{m.messageType}</span>
              </div>
              <div className="font-medium text-[#F8FAFC]">{m.subject}</div>
              <div className="text-[#8A94A6] leading-relaxed">{m.payload}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
