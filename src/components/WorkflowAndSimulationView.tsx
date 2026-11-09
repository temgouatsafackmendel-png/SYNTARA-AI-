import React, { useState } from 'react';
import {
  Play,
  Download,
  AlertTriangle,
} from 'lucide-react';
import { useSyntaraStore } from '../store/useSyntaraStore.ts';
import type { WorkflowNodeType, WorkflowNode } from '../types/syntara.ts';

const WORKFLOW_BLOCK_TYPES: WorkflowNodeType[] = [
  'Trigger',
  'Agent',
  'AI Model',
  'Condition',
  'Action',
  'API',
  'MCP Tool',
  'Database',
  'Loop',
  'Delay',
  'Approval',
  'Notification',
  'Output',
];

export const WorkflowStudioView: React.FC = () => {
  const {
    language,
    workflows,
    workflowRuns,
    runWorkflowAction,
    saveWorkflowAction,
    createWorkflowAction,
    actionBusy,
  } = useSyntaraStore();

  const isFr = language === 'fr';
  const [selectedWfId, setSelectedWfId] = useState(workflows[0]?.id || 'wf_crm_onboarding');
  const activeWf = workflows.find((w) => w.id === selectedWfId) || workflows[0];

  const [newNodeType, setNewNodeType] = useState<WorkflowNodeType>('Agent');
  const [newNodeLabel, setNewNodeLabel] = useState('');
  const [newWfName, setNewWfName] = useState('');
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);

  const handleAddNode = async () => {
    if (!activeWf) return;
    const id = `nd_${Date.now()}`;
    const lastNode = activeWf.nodes[activeWf.nodes.length - 1];
    const nextNode: WorkflowNode = {
      id,
      type: newNodeType,
      label: newNodeLabel.trim() || `${newNodeType} Block`,
      position: {
        x: lastNode ? (lastNode.position.x + 220) % 1000 : 120,
        y: lastNode ? lastNode.position.y : 140,
      },
      config: {},
    };
    const nextEdges = lastNode
      ? [...activeWf.edges, { id: `ed_${Date.now()}`, source: lastNode.id, target: id }]
      : activeWf.edges;

    await saveWorkflowAction({
      ...activeWf,
      nodes: [...activeWf.nodes, nextNode],
      edges: nextEdges,
    });
    setNewNodeLabel('');
  };

  const handleExportWorkflowJson = () => {
    if (!activeWf) return;
    const blob = new Blob([JSON.stringify(activeWf, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeWf.id}_workflow.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCanvasDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!activeWf || !draggingNodeId) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(20, Math.min(rect.width - 180, Math.round(e.clientX - rect.left - 80)));
    const y = Math.max(20, Math.min(rect.height - 80, Math.round(e.clientY - rect.top - 25)));

    const updatedNodes = activeWf.nodes.map((n) =>
      n.id === draggingNodeId ? { ...n, position: { x, y } } : n
    );
    setDraggingNodeId(null);
    await saveWorkflowAction({ ...activeWf, nodes: updatedNodes });
  };

  return (
    <div className="space-y-8">
      {/* Top Toolbar */}
      <div className="bg-[#0D111C] border border-white/[0.07] rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#20D6D0]">
              ENGINE 11 · WORKFLOW STUDIO
            </span>
            <h2 className="text-base font-semibold text-[#F8FAFC] mt-0.5">
              {isFr ? 'Orchestration Visuelle de Processus' : 'Visual Process Orchestrator'}
            </h2>
          </div>
          <select
            value={activeWf?.id || ''}
            onChange={(e) => setSelectedWfId(e.target.value)}
            className="bg-[#07090F] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs font-medium text-[#F8FAFC]"
          >
            {workflows.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} (v{w.version})
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportWorkflowJson}
            className="px-3.5 py-2 bg-[#07090F] hover:bg-white/[0.04] text-[#F8FAFC] border border-white/[0.08] rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>JSON Export</span>
          </button>
          {activeWf && (
            <button
              type="button"
              disabled={actionBusy}
              onClick={() => runWorkflowAction(activeWf.id)}
              className="px-4 py-2 bg-[#6E56CF] hover:bg-[#7C66DC] disabled:opacity-50 text-white text-xs font-medium rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isFr ? 'Exécuter le Workflow' : 'Execute Workflow'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Component Palette & Interactive Canvas */}
      <div className="bg-[#0D111C] border border-white/[0.07] rounded-2xl p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs font-medium text-[#8A94A6]">
            {isFr
              ? '13 composants disponibles — Glisser-déposer les nœuds sur le canevas'
              : '13 workflow components — Drag nodes across the canvas'}
          </div>
          <div className="flex items-center gap-2">
            <select
              value={newNodeType}
              onChange={(e) => setNewNodeType(e.target.value as WorkflowNodeType)}
              className="bg-[#07090F] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-[#F8FAFC]"
            >
              {WORKFLOW_BLOCK_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={newNodeLabel}
              onChange={(e) => setNewNodeLabel(e.target.value)}
              placeholder={isFr ? 'Nom du bloc...' : 'Block label...'}
              className="bg-[#07090F] border border-white/[0.08] focus:border-[#6E56CF] focus:outline-none rounded-xl px-3 py-2 text-xs text-[#F8FAFC]"
            />
            <button
              type="button"
              onClick={handleAddNode}
              className="px-3.5 py-2 bg-[#20D6D0] hover:bg-[#1bc0ba] text-[#07090F] font-medium rounded-xl text-xs cursor-pointer"
            >
              + Ajouter Bloc
            </button>
          </div>
        </div>

        {/* Interactive Visual Canvas */}
        {activeWf && (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleCanvasDrop}
            className="relative h-[340px] bg-[#07090F] border border-white/[0.07] rounded-2xl overflow-x-auto overflow-y-hidden"
          >
            {/* SVG Connections */}
            <svg className="absolute inset-0 w-[1500px] h-full pointer-events-none">
              {activeWf.edges.map((edge) => {
                const src = activeWf.nodes.find((n) => n.id === edge.source);
                const tgt = activeWf.nodes.find((n) => n.id === edge.target);
                if (!src || !tgt) return null;
                const x1 = src.position.x + 175;
                const y1 = src.position.y + 32;
                const x2 = tgt.position.x;
                const y2 = tgt.position.y + 32;
                return (
                  <g key={edge.id}>
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="#6E56CF"
                      strokeWidth="1.75"
                      strokeDasharray="4 3"
                    />
                    {edge.conditionLabel && (
                      <text
                        x={(x1 + x2) / 2}
                        y={(y1 + y2) / 2 - 6}
                        fill="#20D6D0"
                        fontSize="10"
                        textAnchor="middle"
                      >
                        {edge.conditionLabel}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Draggable Nodes */}
            {activeWf.nodes.map((node) => (
              <div
                key={node.id}
                draggable
                onDragStart={() => setDraggingNodeId(node.id)}
                style={{ left: `${node.position.x}px`, top: `${node.position.y}px` }}
                className="absolute w-[175px] p-3.5 bg-[#0D111C] border border-white/[0.12] hover:border-[#6E56CF] rounded-xl cursor-move select-none transition-colors"
              >
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#20D6D0]">
                  {node.type}
                </div>
                <div className="text-xs font-medium text-[#F8FAFC] truncate mt-0.5">{node.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Workflow Execution Logs & Create New Workflow */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-[#0D111C] border border-white/[0.07] rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-[#F8FAFC]">
            {isFr ? 'Historique d’Exécution des Workflows' : 'Workflow Execution Runs'}
          </h3>
          <div className="divide-y divide-white/[0.06]">
            {workflowRuns.map((run) => (
              <div key={run.id} className="py-4 first:pt-0 last:pb-0 text-xs space-y-2.5">
                <div className="flex items-center justify-between font-mono">
                  <span className="font-semibold text-[#F8FAFC]">{run.workflowName}</span>
                  <span className="text-emerald-400 tabular-nums">
                    {run.status.toUpperCase()} · {run.totalDurationMs}ms
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {run.nodeResults.map((nr) => (
                    <div key={nr.nodeId} className="text-[#8A94A6] flex justify-between gap-2">
                      <span className="truncate">
                        <strong className="text-[#A78BFA] font-mono">[{nr.nodeType}]</strong> {nr.nodeLabel}
                      </span>
                      <span className="font-mono tabular-nums shrink-0">{nr.durationMs}ms</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!newWfName.trim()) return;
            await createWorkflowAction(newWfName.trim(), 'Workflow créé depuis Workflow Studio.');
            setNewWfName('');
          }}
          className="lg:col-span-4 bg-[#0D111C] border border-white/[0.07] rounded-2xl p-6 space-y-4 h-fit"
        >
          <h3 className="text-sm font-semibold text-[#F8FAFC]">
            {isFr ? 'Nouveau Workflow Vierge' : 'Create New Workflow'}
          </h3>
          <input
            type="text"
            value={newWfName}
            onChange={(e) => setNewWfName(e.target.value)}
            placeholder="Nom du workflow..."
            className="w-full bg-[#07090F] border border-white/[0.08] focus:border-[#6E56CF] focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-[#F8FAFC]"
          />
          <button
            type="submit"
            className="w-full py-2.5 bg-[#6E56CF] hover:bg-[#7C66DC] text-white text-xs font-medium rounded-xl cursor-pointer"
          >
            + Initialiser Workflow
          </button>
        </form>
      </div>
    </div>
  );
};

export const SimulationLabView: React.FC = () => {
  const { language, simulations, runSimulationAction, actionBusy } = useSyntaraStore();
  const isFr = language === 'fr';
  const activeSim = simulations[0];

  const [simName, setSimName] = useState('Simulation FinOps & Charge — Q4 Scaling');
  const [dailyRuns, setDailyRuns] = useState(1800);
  const [localRatio, setLocalRatio] = useState(60);
  const [concurrentAgents, setConcurrentAgents] = useState(10);

  const handleRunSim = async (e: React.FormEvent) => {
    e.preventDefault();
    await runSimulationAction({
      name: simName,
      description: 'Test de stratégie multi-scénarios avant exécution en production.',
      dailyWorkflowRuns: dailyRuns,
      localModelRatioPercent: localRatio,
      concurrentAgents,
    });
  };

  return (
    <div className="space-y-8">
      {/* Simulation Parameter Form */}
      <form onSubmit={handleRunSim} className="bg-[#0D111C] border border-white/[0.07] rounded-2xl p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#20D6D0]">
              ENGINE 06 · REALITY SIMULATION ENGINE
            </span>
            <h2 className="text-base font-semibold text-[#F8FAFC] mt-0.5">
              {isFr ? 'Comparaison Multi-Scénarios (Conservative · Balanced · Optimistic)' : 'Multi-Scenario Comparison'}
            </h2>
          </div>
          <button
            type="submit"
            disabled={actionBusy}
            className="px-4 py-2.5 bg-[#6E56CF] hover:bg-[#7C66DC] text-white text-xs font-medium rounded-xl cursor-pointer"
          >
            {actionBusy ? 'Calcul...' : isFr ? 'Lancer la Simulation' : 'Run Simulation'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-[#8A94A6] mb-1.5">Nom du Scénario</label>
            <input
              type="text"
              value={simName}
              onChange={(e) => setSimName(e.target.value)}
              className="w-full bg-[#07090F] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-[#F8FAFC]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#8A94A6] mb-1.5">Exécutions / Jour</label>
            <input
              type="number"
              value={dailyRuns}
              onChange={(e) => setDailyRuns(Number(e.target.value))}
              className="w-full bg-[#07090F] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-[#F8FAFC] font-mono tabular-nums"
            />
          </div>
          <div>
            <label className="block text-xs text-[#8A94A6] mb-1.5">% Modèles Locaux (Ollama)</label>
            <input
              type="number"
              min={0}
              max={100}
              value={localRatio}
              onChange={(e) => setLocalRatio(Number(e.target.value))}
              className="w-full bg-[#07090F] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-[#F8FAFC] font-mono tabular-nums"
            />
          </div>
          <div>
            <label className="block text-xs text-[#8A94A6] mb-1.5">Agents Simultanés</label>
            <input
              type="number"
              min={1}
              max={64}
              value={concurrentAgents}
              onChange={(e) => setConcurrentAgents(Number(e.target.value))}
              className="w-full bg-[#07090F] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-[#F8FAFC] font-mono tabular-nums"
            />
          </div>
        </div>
      </form>

      {/* Active Simulation 3-Scenario Comparison */}
      {activeSim && (
        <div className="space-y-5">
          <div className="p-4 bg-[#0D111C] border border-amber-500/30 rounded-2xl text-xs text-amber-300 flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{activeSim.disclaimer}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {activeSim.scenarios.map((sc) => {
              const isRec = sc.scenarioType === activeSim.recommendedScenario;
              return (
                <div
                  key={sc.scenarioType}
                  className={`bg-[#0D111C] rounded-2xl p-6 border space-y-5 ${
                    isRec ? 'border-[#20D6D0]' : 'border-white/[0.07]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-[#F8FAFC]">{sc.scenarioType}</h3>
                    {isRec && (
                      <span className="text-[11px] font-mono tracking-wider text-[#20D6D0]">
                        RECOMMANDÉ
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 divide-x divide-y divide-white/[0.06] border border-white/[0.06] rounded-xl overflow-hidden text-xs font-mono tabular-nums">
                    <div className="p-3.5 bg-[#07090F]">
                      <div className="text-[#8A94A6] font-sans text-[11px]">Coût Mensuel</div>
                      <div className="text-base font-semibold text-[#F8FAFC] mt-1">
                        ${sc.projectedMetrics.estimatedCostUsd.toFixed(2)}
                      </div>
                    </div>
                    <div className="p-3.5 bg-[#07090F]">
                      <div className="text-[#8A94A6] font-sans text-[11px]">Durée Cycle</div>
                      <div className="text-base font-semibold text-[#20D6D0] mt-1">
                        {sc.projectedMetrics.estimatedDurationHours}h
                      </div>
                    </div>
                    <div className="p-3.5 bg-[#07090F]">
                      <div className="text-[#8A94A6] font-sans text-[11px]">Probabilité Succès</div>
                      <div className="text-base font-semibold text-emerald-400 mt-1">
                        {sc.projectedMetrics.expectedSuccessProbability}%
                      </div>
                    </div>
                    <div className="p-3.5 bg-[#07090F]">
                      <div className="text-[#8A94A6] font-sans text-[11px]">Multiplicateur ROI</div>
                      <div className="text-base font-semibold text-[#A78BFA] mt-1">
                        {sc.projectedMetrics.roiMultiplier}x
                      </div>
                    </div>
                  </div>

                  <div className="text-xs space-y-1.5 pt-2 border-t border-white/[0.06]">
                    <div className="font-medium text-[#F8FAFC]">Hypothèses :</div>
                    <ul className="space-y-1 text-[#8A94A6]">
                      {sc.hypotheses.map((h, i) => (
                        <li key={i}>· {h}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="text-xs space-y-1 pt-2 border-t border-white/[0.06]">
                    <div className="font-medium text-[#F8FAFC]">Limites & Risques :</div>
                    {sc.identifiedRisks.map((r, i) => (
                      <div key={i} className="text-amber-400/90">
                        · {r.description} ({(r.probability * 100).toFixed(0)}% · {r.impact})
                      </div>
                    ))}
                  </div>

                  {sc.observedVsForecastDelta && (
                    <div className="pt-2 border-t border-white/[0.06] text-xs font-mono tabular-nums text-[#8A94A6]">
                      Observé vs Prévu : ${sc.observedVsForecastDelta.actualCostUsd} ({sc.observedVsForecastDelta.variancePercent}%)
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
