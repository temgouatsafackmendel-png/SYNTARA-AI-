import React, { useState } from 'react';
import {
  Send,
  Paperclip,
  Sparkles,
  CheckSquare,
  GitBranch,
  Trash2,
  Download,
} from 'lucide-react';
import { useSyntaraStore } from '../store/useSyntaraStore.ts';
import type { IntelligenceMode, MemoryLayerType, EpistemicStatus } from '../types/syntara.ts';

export const IntelligenceView: React.FC = () => {
  const {
    language,
    conversations,
    modelProviders,
    actionBusy,
    sendConversationMessage,
    triggerIntentToSystem,
    createTaskAction,
    createWorkflowAction,
    uploadKnowledgeDocAction,
    setActiveSection,
  } = useSyntaraStore();

  const isFr = language === 'fr';
  const activeConv = conversations[0];
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<IntelligenceMode>('project');
  const [selectedModel, setSelectedModel] = useState('gemini-3.8-flash');
  const [attachedDocs, setAttachedDocs] = useState<
    Array<{ name: string; type: string; size: number; content: string }>
  >([]);

  const availableModels = modelProviders.flatMap((p) =>
    p.availableModels.map((m) => ({ label: `${m} (${p.name})`, value: m }))
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = typeof reader.result === 'string' ? reader.result : '';
      setAttachedDocs((prev) => [
        ...prev,
        { name: file.name, type: file.type || 'text/markdown', size: file.size, content },
      ]);
    };
    reader.readAsText(file);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && attachedDocs.length === 0) return;

    for (const doc of attachedDocs) {
      if (doc.content) {
        await uploadKnowledgeDocAction({
          collectionId: 'kb_syntara_arch',
          title: doc.name,
          format: 'Markdown',
          rawContent: doc.content,
        });
      }
    }

    const promptText =
      attachedDocs.length > 0
        ? `${input.trim()}\n\n[Pièces jointes : ${attachedDocs.map((d) => d.name).join(', ')}]`
        : input.trim();

    setInput('');
    setAttachedDocs([]);

    await sendConversationMessage({
      conversationId: activeConv?.id || 'conv_main_01',
      content: promptText,
      mode,
      modelId: selectedModel,
      attachments: attachedDocs.map(({ name, type, size }) => ({ name, type, size })),
    });
  };

  const modes: Array<{ id: IntelligenceMode; labelFr: string; labelEn: string }> = [
    { id: 'chat', labelFr: 'Discussion', labelEn: 'Chat' },
    { id: 'research', labelFr: 'Recherche RAG', labelEn: 'Research RAG' },
    { id: 'project', labelFr: 'Projet', labelEn: 'Project' },
    { id: 'agent', labelFr: 'Agent', labelEn: 'Agent' },
    { id: 'execution', labelFr: 'Exécution', labelEn: 'Execution' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-stretch">
      <div className="lg:col-span-9 bg-[#0D111C] border border-white/[0.07] rounded-2xl flex flex-col h-[750px]">
        {/* Sleek Top Control Bar */}
        <div className="px-5 py-3.5 border-b border-white/[0.07] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 bg-[#07090F] border border-white/[0.07] rounded-xl">
            {modes.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  mode === m.id
                    ? 'bg-[#7557FF] text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isFr ? m.labelFr : m.labelEn}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 whitespace-nowrap">
              {isFr ? 'Adaptateur :' : 'Adapter:'}
            </span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-[#07090F] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-[#7557FF]"
            >
              {availableModels.map((m) => (
                <option key={m.label} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clean Conversation Ledger */}
        <div className="flex-1 overflow-y-auto px-6 py-6 divide-y divide-white/[0.06]">
          {(activeConv?.messages || []).map((msg) => (
            <div key={msg.id} className="py-6 first:pt-0 last:pb-0 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <div>
                  <span className="font-semibold text-white">
                    {msg.role === 'user'
                      ? isFr
                        ? 'Vous'
                        : 'You'
                      : 'SYNTARA Intelligence'}
                  </span>
                  <span aria-hidden="true"> · </span>
                  <span className="font-mono text-slate-500">{msg.modelUsed}</span>
                  <span aria-hidden="true"> · </span>
                  <span className="uppercase text-[11px] text-[#A78BFA]">{msg.mode}</span>
                </div>
                <div className="font-mono tabular-nums text-[11px] text-slate-500">
                  {msg.tokensUsed} tok {msg.latencyMs > 0 ? `· ${msg.latencyMs}ms` : ''}
                </div>
              </div>

              <div className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                {msg.content}
              </div>

              {msg.citations && msg.citations.length > 0 && (
                <div className="pt-1 text-xs text-[#20D6D0] font-mono">
                  {isFr ? 'Sources vérifiées :' : 'Verified citations:'} {msg.citations.join(' · ')}
                </div>
              )}

              {msg.role === 'assistant' && msg.suggestedActions && (
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  {msg.suggestedActions.map((act, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={async () => {
                        if (act.type === 'create_project') {
                          await triggerIntentToSystem(act.payload);
                          setActiveSection('projects');
                        } else if (act.type === 'create_task') {
                          await createTaskAction({
                            title: act.label,
                            description: act.payload,
                            priority: 'high',
                          });
                          setActiveSection('projects');
                        } else if (act.type === 'create_workflow') {
                          await createWorkflowAction(act.label, act.payload);
                          setActiveSection('workflow-studio');
                        }
                      }}
                      className="px-3 py-1.5 text-xs font-medium bg-white/[0.04] hover:bg-[#7557FF] text-slate-200 hover:text-white border border-white/[0.08] hover:border-[#7557FF] rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {act.type === 'create_project' && <Sparkles className="w-3.5 h-3.5 text-[#A78BFA]" />}
                      {act.type === 'create_task' && <CheckSquare className="w-3.5 h-3.5 text-[#20D6D0]" />}
                      {act.type === 'create_workflow' && <GitBranch className="w-3.5 h-3.5 text-amber-400" />}
                      <span>{act.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Minimalist Input Composer */}
        <form onSubmit={handleSend} className="p-4 border-t border-white/[0.07] bg-[#07090F]/50 space-y-2">
          {attachedDocs.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#20D6D0]">
              <span>{isFr ? 'Joints (RAG) :' : 'Attached:'}</span>
              {attachedDocs.map((d, i) => (
                <span key={i} className="font-mono underline">
                  {d.name} ({Math.round(d.size / 1024)} KB)
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2.5 p-1.5 bg-[#07090F] border border-white/[0.09] focus-within:border-[#7557FF] rounded-xl">
            <label className="p-2 text-slate-400 hover:text-white cursor-pointer transition-colors">
              <Paperclip className="w-4 h-4" />
              <input
                type="file"
                accept=".md,.txt,.json,.csv,.html"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                isFr
                  ? 'Écrivez une directive, interrogez le RAG ou orchestrez un projet...'
                  : 'Write a directive, query RAG, or orchestrate a project...'
              }
              className="flex-1 bg-transparent px-2 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={actionBusy}
              className="px-4 py-2 bg-[#7557FF] hover:bg-[#6344F5] disabled:opacity-40 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{actionBusy ? (isFr ? 'Calcul...' : 'Thinking...') : isFr ? 'Envoyer' : 'Send'}</span>
            </button>
          </div>
        </form>
      </div>

      <div className="lg:col-span-3 space-y-6">
        <div className="bg-[#0D111C] border border-white/[0.07] rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-white">
            {isFr ? 'Continuité Opérationnelle' : 'Operational Continuity'}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {isFr
              ? 'Chaque réponse peut être matérialisée en projet structuré, en tâche d’agent ou en workflow automatisé d’un seul clic.'
              : 'Every response can be materialized into a structured project, an agent task, or an automated workflow in one click.'}
          </p>
          <div className="divide-y divide-white/[0.06] pt-2 text-xs">
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-400">Filtre Anti-Injection</span>
              <span className="text-emerald-400 font-mono">ACTIF</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-400">Ancrage RAG Hybride</span>
              <span className="text-[#20D6D0] font-mono">ACTIF</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-400">Trace Cognitive</span>
              <span className="text-slate-300 font-mono">AUDITÉE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProjectsView: React.FC = () => {
  const {
    language,
    projects,
    selectedProjectId,
    setSelectedProjectId,
    tasks,
    cognitiveDecisions,
    memories,
    agents,
    createTaskAction,
    updateTaskStatusAction,
    createMemoryItemAction,
    deleteMemoryItemAction,
    triggerIntentToSystem,
    actionBusy,
  } = useSyntaraStore();

  const isFr = language === 'fr';
  const currentProject = projects.find((p) => p.id === selectedProjectId) || projects[0];
  const projectTasks = tasks.filter((t) => t.projectId === currentProject?.id);
  const projectDecisions = cognitiveDecisions.filter((d) => d.projectId === currentProject?.id);

  const [activeTab, setActiveTab] = useState<'intent-schema' | 'tasks' | 'cognitive' | 'memory'>(
    'intent-schema'
  );
  const [selectedMemoryLayer, setSelectedMemoryLayer] = useState<string>('ALL');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAgent, setNewTaskAgent] = useState(agents[0]?.id || 'agt_software_engineer');

  const [newMemKey, setNewMemKey] = useState('');
  const [newMemContent, setNewMemContent] = useState('');
  const [newMemLayer, setNewMemLayer] = useState<MemoryLayerType>('Project Memory');
  const [newMemStatus, setNewMemStatus] = useState<EpistemicStatus>('verified_fact');
  const [newIntentPrompt, setNewIntentPrompt] = useState('');

  const filteredMemories = memories.filter(
    (m) => selectedMemoryLayer === 'ALL' || m.layer === selectedMemoryLayer
  );

  const handleExportMemories = () => {
    const blob = new Blob([JSON.stringify(memories, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'syntara_memories_export.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Project Bar */}
      <div className="bg-[#0D111C] border border-white/[0.07] rounded-2xl p-5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs text-slate-400">
            {isFr ? 'Projet actif :' : 'Active project:'}
          </span>
          <select
            value={currentProject?.id || ''}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="bg-[#07090F] border border-white/[0.09] rounded-xl px-3.5 py-2 text-sm font-medium text-white focus:outline-none focus:border-[#7557FF]"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!newIntentPrompt.trim()) return;
            await triggerIntentToSystem(newIntentPrompt.trim());
            setNewIntentPrompt('');
          }}
          className="flex items-center gap-2 flex-1 max-w-xl"
        >
          <input
            type="text"
            value={newIntentPrompt}
            onChange={(e) => setNewIntentPrompt(e.target.value)}
            placeholder={
              isFr
                ? 'Nouvelle intention → Générer un nouveau projet...'
                : 'New intent → Generate a new project...'
            }
            className="flex-1 bg-[#07090F] border border-white/[0.09] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#7557FF]"
          />
          <button
            type="submit"
            disabled={actionBusy || !newIntentPrompt.trim()}
            className="px-4 py-2 bg-[#7557FF] hover:bg-[#6344F5] disabled:opacity-40 text-white text-xs font-semibold rounded-xl whitespace-nowrap shrink-0 cursor-pointer"
          >
            + Intent-to-System
          </button>
        </form>
      </div>

      {/* Clean Segmented Tabs */}
      <div className="flex flex-wrap items-center gap-1 p-1 bg-[#0D111C] border border-white/[0.07] rounded-xl w-fit">
        {[
          { id: 'intent-schema', label: 'SYNTARA Intent Schema' },
          { id: 'cognitive', label: isFr ? 'Décisions Cognitives' : 'Cognitive Decisions' },
          { id: 'tasks', label: `${isFr ? 'Tâches & Exécution' : 'Tasks & Execution'} (${projectTasks.length})` },
          { id: 'memory', label: isFr ? 'Memory Engine (6 Couches)' : 'Memory Engine (6 Layers)' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === tab.id ? 'bg-[#7557FF] text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: SYNTARA INTENT SCHEMA */}
      {activeTab === 'intent-schema' && currentProject && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
          <div className="lg:col-span-8 bg-[#0D111C] border border-white/[0.07] rounded-2xl p-7 space-y-6">
            <div>
              <div className="text-xs text-[#20D6D0] font-mono mb-1">
                SYNTARA INTENT SCHEMA · {currentProject.intentSchema.id}
              </div>
              <h2 className="text-xl font-semibold text-white">{currentProject.name}</h2>
              <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                {currentProject.intentSchema.objective}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-5 border-t border-white/[0.06]">
              <div>
                <h3 className="text-xs font-semibold text-slate-200 mb-3">
                  {isFr ? 'Contraintes Système' : 'System Constraints'}
                </h3>
                <ul className="space-y-2 text-xs text-slate-400">
                  {currentProject.intentSchema.constraints.map((c, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#A78BFA] font-mono">0{i + 1}.</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-slate-200 mb-3">
                  {isFr ? 'Livrables Attendus' : 'Expected Deliverables'}
                </h3>
                <ul className="space-y-2 text-xs text-slate-400">
                  {currentProject.intentSchema.expectedDeliverables.map((d, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#20D6D0] font-mono">✓</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-5 border-t border-white/[0.06]">
              <h3 className="text-xs font-semibold text-slate-200 mb-3">
                {isFr ? 'Risques Identifiés & Mitigations' : 'Identified Risks & Mitigations'}
              </h3>
              <div className="divide-y divide-white/[0.06]">
                {currentProject.intentSchema.identifiedRisks.map((r, i) => (
                  <div key={i} className="py-3 first:pt-0 last:pb-0 text-xs">
                    <div className="font-medium text-white">
                      {r.risk}{' '}
                      <span className="text-amber-400 font-mono">({r.severity.toUpperCase()})</span>
                    </div>
                    <div className="text-slate-400 mt-0.5">Mitigation : {r.mitigation}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#0D111C] border border-white/[0.07] rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-semibold text-white">
                {isFr ? 'Métriques de Faisabilité' : 'Feasibility Metrics'}
              </h3>
              <div className="grid grid-cols-2 divide-x divide-white/[0.07] border border-white/[0.07] rounded-xl bg-[#07090F]">
                <div className="p-4">
                  <div className="text-xs text-slate-400">Faisabilité</div>
                  <div className="text-xl font-semibold text-[#20D6D0] font-mono tabular-nums mt-1">
                    {currentProject.intentSchema.feasibilityScore}%
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-xs text-slate-400">Coût Estimé</div>
                  <div className="text-xl font-semibold text-white font-mono tabular-nums mt-1">
                    ${currentProject.intentSchema.estimatedResources.estimatedCostUsd.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="text-xs text-slate-400 space-y-1.5 pt-1">
                <div>
                  Permissions :{' '}
                  <span className="font-mono text-slate-200">
                    {currentProject.intentSchema.requiredPermissions.join(', ')}
                  </span>
                </div>
                <div>{currentProject.intentSchema.ambiguitiesDetected.join(' ')}</div>
              </div>
            </div>

            <div className="bg-[#0D111C] border border-white/[0.07] rounded-2xl p-6 space-y-3">
              <h3 className="text-sm font-semibold text-white">
                {isFr ? 'Trace d’Orchestration' : 'Orchestration Trace'}
              </h3>
              <div className="divide-y divide-white/[0.06]">
                {currentProject.executionLogs.map((log) => (
                  <div key={log.id} className="py-2.5 first:pt-0 last:pb-0 text-xs">
                    <div className="font-mono text-[11px] text-[#A78BFA]">{log.engine}</div>
                    <div className="text-slate-300 mt-0.5">{log.message}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COGNITIVE ENGINE DECISIONS */}
      {activeTab === 'cognitive' && (
        <div className="space-y-6">
          {projectDecisions.map((dec) => (
            <div
              key={dec.id}
              className="bg-[#0D111C] border border-white/[0.07] rounded-2xl p-7 space-y-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-[#20D6D0] font-mono">
                    COGNITIVE ENGINE · {dec.auditCorrelationId}
                  </div>
                  <h3 className="text-lg font-semibold text-white mt-1">{dec.title}</h3>
                </div>
                <span className="text-xs font-mono text-emerald-400">
                  {dec.hypothesisVerified ? 'HYPOTHÈSE VÉRIFIÉE' : 'EN ÉVALUATION'}
                </span>
              </div>

              <p className="text-sm text-slate-400 leading-relaxed">{dec.problemAnalysis}</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {dec.comparedStrategies.map((st, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border ${
                      st.name === dec.selectedStrategy
                        ? 'bg-[#131926] border-[#7557FF]/60'
                        : 'bg-[#07090F] border-white/[0.07]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-white mb-2">
                      <span>{st.name}</span>
                      <span className="font-mono tabular-nums text-[#20D6D0]">{st.score}/100</span>
                    </div>
                    <div className="text-xs text-emerald-400 mb-1">+ {st.pros.join(', ')}</div>
                    <div className="text-xs text-amber-400/90">- {st.cons.join(', ')}</div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-white/[0.06] text-xs space-y-1">
                <div className="font-semibold text-white">
                  Stratégie Retenue : {dec.selectedStrategy}
                </div>
                <div className="text-slate-400">{dec.justifiedDecision}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: TASKS */}
      {activeTab === 'tasks' && (
        <div className="bg-[#0D111C] border border-white/[0.07] rounded-2xl p-6 space-y-6">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!newTaskTitle.trim()) return;
              await createTaskAction({
                projectId: currentProject?.id,
                title: newTaskTitle.trim(),
                description: 'Tâche opérationnelle assignée.',
                assignedAgentId: newTaskAgent,
                priority: 'high',
              });
              setNewTaskTitle('');
            }}
            className="flex flex-col sm:flex-row gap-3 pb-5 border-b border-white/[0.07]"
          >
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder={isFr ? 'Nouvelle tâche à déléguer...' : 'New task to delegate...'}
              className="flex-1 bg-[#07090F] border border-white/[0.09] rounded-xl px-3.5 py-2 text-xs text-white"
            />
            <select
              value={newTaskAgent}
              onChange={(e) => setNewTaskAgent(e.target.value)}
              className="bg-[#07090F] border border-white/[0.09] rounded-xl px-3 py-2 text-xs text-slate-200"
            >
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="px-4 py-2 bg-[#7557FF] hover:bg-[#6344F5] text-white text-xs font-semibold rounded-xl whitespace-nowrap shrink-0 cursor-pointer"
            >
              {isFr ? 'Ajouter la Tâche' : 'Add Task'}
            </button>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/[0.07] text-slate-400">
                  <th className="py-2.5 px-3 font-medium">Tâche</th>
                  <th className="py-2.5 px-3 font-medium">Agent Assigné</th>
                  <th className="py-2.5 px-3 font-medium">Priorité</th>
                  <th className="py-2.5 px-3 font-medium">Statut</th>
                  <th className="py-2.5 px-3 font-medium text-right">Tokens / Coût</th>
                  <th className="py-2.5 px-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {projectTasks.map((t) => (
                  <tr key={t.id} className="hover:bg-white/[0.02]">
                    <td className="py-3.5 px-3">
                      <div className="font-medium text-white">{t.title}</div>
                      <div className="text-slate-400 mt-0.5">{t.outputSummary || t.description}</div>
                    </td>
                    <td className="py-3.5 px-3 text-[#A78BFA]">{t.assignedAgentName}</td>
                    <td className="py-3.5 px-3 font-mono uppercase text-slate-400">{t.priority}</td>
                    <td className="py-3.5 px-3 font-mono">
                      <span
                        className={
                          t.status === 'completed'
                            ? 'text-emerald-400'
                            : t.status === 'waiting_approval'
                            ? 'text-amber-400'
                            : 'text-[#20D6D0]'
                        }
                      >
                        {t.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono tabular-nums text-slate-400">
                      {t.tokensUsed} tok · ${t.costUsd.toFixed(3)}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      {t.status !== 'completed' && (
                        <button
                          type="button"
                          onClick={() =>
                            updateTaskStatusAction(
                              t.id,
                              'completed',
                              'Exécuté et validé par contrôle opérateur.'
                            )
                          }
                          className="px-2.5 py-1 bg-white/[0.05] hover:bg-emerald-500/20 text-emerald-300 border border-white/[0.08] rounded-md text-xs cursor-pointer"
                        >
                          {isFr ? 'Valider' : 'Complete'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: MEMORY ENGINE */}
      {activeTab === 'memory' && (
        <div className="bg-[#0D111C] border border-white/[0.07] rounded-2xl p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-white">
                Memory Engine — 6 Couches & Provenance Épistémique
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isFr
                  ? 'Distinction stricte entre faits vérifiés et hypothèses générées par un modèle.'
                  : 'Strict distinction between verified facts and model-generated hypotheses.'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportMemories}
              className="px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/[0.08] rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1 p-1 bg-[#07090F] border border-white/[0.07] rounded-xl w-fit">
            {[
              'ALL',
              'Working Memory',
              'Conversation Memory',
              'Project Memory',
              'Long-Term Memory',
              'Knowledge Memory',
              'Agent Memory',
            ].map((layer) => (
              <button
                key={layer}
                type="button"
                onClick={() => setSelectedMemoryLayer(layer)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  selectedMemoryLayer === layer
                    ? 'bg-[#7557FF] text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {layer}
              </button>
            ))}
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!newMemKey.trim() || !newMemContent.trim()) return;
              await createMemoryItemAction({
                layer: newMemLayer,
                key: newMemKey.trim(),
                content: newMemContent.trim(),
                epistemicStatus: newMemStatus,
                confidenceScore: newMemStatus === 'model_hypothesis' ? 0.65 : 1.0,
                provenance: 'Validation Manuelle Opérateur',
              });
              setNewMemKey('');
              setNewMemContent('');
            }}
            className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-4 border-t border-white/[0.07]"
          >
            <select
              value={newMemLayer}
              onChange={(e) => setNewMemLayer(e.target.value as MemoryLayerType)}
              className="md:col-span-2 bg-[#07090F] border border-white/[0.09] rounded-xl px-3 py-2 text-xs text-slate-200"
            >
              <option value="Working Memory">Working Memory</option>
              <option value="Conversation Memory">Conversation Memory</option>
              <option value="Project Memory">Project Memory</option>
              <option value="Long-Term Memory">Long-Term Memory</option>
              <option value="Knowledge Memory">Knowledge Memory</option>
              <option value="Agent Memory">Agent Memory</option>
            </select>
            <select
              value={newMemStatus}
              onChange={(e) => setNewMemStatus(e.target.value as EpistemicStatus)}
              className="md:col-span-2 bg-[#07090F] border border-white/[0.09] rounded-xl px-3 py-2 text-xs text-slate-200"
            >
              <option value="verified_fact">Fait Vérifié (100%)</option>
              <option value="user_directive">Directive Utilisateur</option>
              <option value="model_hypothesis">Hypothèse Modèle</option>
            </select>
            <input
              type="text"
              value={newMemKey}
              onChange={(e) => setNewMemKey(e.target.value)}
              placeholder="Clé (ex: architecture.cache_ttl)"
              className="md:col-span-3 bg-[#07090F] border border-white/[0.09] rounded-xl px-3 py-2 text-xs text-white font-mono"
            />
            <input
              type="text"
              value={newMemContent}
              onChange={(e) => setNewMemContent(e.target.value)}
              placeholder="Contenu mémorisé..."
              className="md:col-span-3 bg-[#07090F] border border-white/[0.09] rounded-xl px-3 py-2 text-xs text-white"
            />
            <button
              type="submit"
              className="md:col-span-2 px-3 py-2 bg-[#7557FF] hover:bg-[#6344F5] text-white text-xs font-semibold rounded-xl cursor-pointer"
            >
              + Mémoriser
            </button>
          </form>

          <div className="divide-y divide-white/[0.06]">
            {filteredMemories.map((mem) => (
              <div
                key={mem.id}
                className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono font-semibold text-white">{mem.key}</span>
                    <span aria-hidden="true" className="text-slate-500">·</span>
                    <span className="text-[#A78BFA]">{mem.layer}</span>
                    <span aria-hidden="true" className="text-slate-500">·</span>
                    <span
                      className={`font-mono ${
                        mem.epistemicStatus === 'model_hypothesis'
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {mem.epistemicStatus === 'model_hypothesis'
                        ? 'HYPOTHÈSE MODÈLE'
                        : 'FAIT VÉRIFIÉ'}
                    </span>
                    <span aria-hidden="true" className="text-slate-500">·</span>
                    <span className="font-mono tabular-nums text-slate-400">
                      Confiance {(mem.confidenceScore * 100).toFixed(0)}% · v{mem.version}
                    </span>
                  </div>
                  <p className="text-sm text-slate-200">{mem.content}</p>
                  <div className="text-xs text-slate-500">
                    Provenance : {mem.provenance} · Scope : {mem.accessScope}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => deleteMemoryItemAction(mem.id)}
                  className="p-1.5 text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                  title="Supprimer cette mémoire"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
