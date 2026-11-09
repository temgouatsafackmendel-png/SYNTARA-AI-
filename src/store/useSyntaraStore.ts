/**
 * SYNTARA AI — Frontend Zustand State & Live API Orchestration Store
 */

import { create } from 'zustand';
import type {
  LanguageCode,
  NavigationSection,
  SyntaraUser,
  SyntaraProject,
  SyntaraTask,
  SyntaraAgent,
  AgentVersionRecord,
  AgentRun,
  AgentTeam,
  InterAgentMessage,
  SyntaraMemoryItem,
  SyntaraSimulation,
  ImprovementProposal,
  SyntaraTool,
  SyntaraMcpServer,
  SyntaraPluginManifest,
  KnowledgeBaseCollection,
  KnowledgeDocument,
  KnowledgeChunk,
  KnowledgeSearchResult,
  WorkspaceArtifact,
  SyntaraWorkflow,
  WorkflowRunLog,
  HumanApprovalRequest,
  AuditLogEntry,
  SyntaraModelProvider,
  SyntaraConversation,
  CognitiveDecisionNode,
  SystemNotification,
} from '../types/syntara.ts';

interface SyntaraClientStore {
  language: LanguageCode;
  activeSection: NavigationSection;
  selectedProjectId: string | null;
  loading: boolean;
  actionBusy: boolean;
  bannerMessage: { text: string; type: 'info' | 'success' | 'error' } | null;

  // Hydrated Server State
  globalKillSwitchActive: boolean;
  budgetLimits: {
    dailyCostLimitUsd: number;
    currentDailySpendUsd: number;
    maxTokensPerMission: number;
  };
  users: SyntaraUser[];
  currentUserId: string;
  modelProviders: SyntaraModelProvider[];
  projects: SyntaraProject[];
  tasks: SyntaraTask[];
  cognitiveDecisions: CognitiveDecisionNode[];
  agents: SyntaraAgent[];
  agentVersions: AgentVersionRecord[];
  agentRuns: AgentRun[];
  teams: AgentTeam[];
  interAgentMessages: InterAgentMessage[];
  memories: SyntaraMemoryItem[];
  simulations: SyntaraSimulation[];
  improvementProposals: ImprovementProposal[];
  tools: SyntaraTool[];
  mcpServers: SyntaraMcpServer[];
  plugins: SyntaraPluginManifest[];
  knowledgeCollections: KnowledgeBaseCollection[];
  knowledgeDocuments: KnowledgeDocument[];
  knowledgeChunks: KnowledgeChunk[];
  workspaceArtifacts: WorkspaceArtifact[];
  workflows: SyntaraWorkflow[];
  workflowRuns: WorkflowRunLog[];
  approvals: HumanApprovalRequest[];
  auditLogs: AuditLogEntry[];
  conversations: SyntaraConversation[];
  notifications: SystemNotification[];

  // UI Actions
  setLanguage: (lang: LanguageCode) => void;
  setActiveSection: (sec: NavigationSection) => void;
  setSelectedProjectId: (id: string | null) => void;
  setBanner: (msg: { text: string; type: 'info' | 'success' | 'error' } | null) => void;
  markNotificationsRead: () => void;

  // Server Sync Actions
  fetchSystemState: () => Promise<void>;
  triggerIntentToSystem: (intent: string) => Promise<SyntaraProject | null>;
  executeAgentMissionAction: (params: {
    agentId: string;
    mission: string;
    projectId?: string;
    requireApprovalForSensitive?: boolean;
  }) => Promise<void>;
  killAgentImmediate: (agentId: string) => Promise<void>;
  toggleGlobalKillSwitch: (active: boolean) => Promise<void>;
  createCustomAgent: (payload: Partial<SyntaraAgent>) => Promise<void>;
  resolveApprovalRequest: (id: string, status: 'approved' | 'rejected', note?: string) => Promise<void>;
  sendConversationMessage: (params: {
    conversationId: string;
    content: string;
    mode: string;
    modelId: string;
    attachments?: Array<{ name: string; type: string; size: number }>;
  }) => Promise<void>;
  createTaskAction: (payload: {
    projectId?: string;
    title: string;
    description: string;
    assignedAgentId?: string;
    priority?: string;
  }) => Promise<void>;
  updateTaskStatusAction: (taskId: string, status: string, outputSummary?: string) => Promise<void>;
  createMemoryItemAction: (payload: Partial<SyntaraMemoryItem>) => Promise<void>;
  deleteMemoryItemAction: (id: string) => Promise<void>;
  runWorkflowAction: (workflowId: string) => Promise<void>;
  saveWorkflowAction: (workflow: SyntaraWorkflow) => Promise<void>;
  createWorkflowAction: (name: string, description: string) => Promise<void>;
  runSimulationAction: (params: {
    name: string;
    description: string;
    dailyWorkflowRuns: number;
    localModelRatioPercent: number;
    concurrentAgents: number;
  }) => Promise<void>;
  searchKnowledgeAction: (query: string, collectionId?: string) => Promise<KnowledgeSearchResult[]>;
  uploadKnowledgeDocAction: (params: {
    collectionId: string;
    title: string;
    format: string;
    rawContent: string;
  }) => Promise<void>;
  deleteKnowledgeDocAction: (id: string) => Promise<void>;
  rollbackArtifactAction: (id: string) => Promise<void>;
  createArtifactAction: (params: {
    projectId?: string;
    path: string;
    title: string;
    type: string;
    language: string;
    currentContent: string;
  }) => Promise<void>;
  resolveEvolutionProposal: (id: string, decision: 'approve' | 'reject' | 'rollback') => Promise<void>;
  testToolConnectivity: (toolId: string) => Promise<void>;
  configureToolEndpoint: (toolId: string, endpointOrCommand: string) => Promise<void>;
  createPluginAction: (params: {
    name: string;
    version: string;
    description: string;
    permissions: string[];
    codeSource: string;
  }) => Promise<void>;
  addModelProviderAction: (params: {
    name: string;
    providerType: string;
    endpoint: string;
    defaultModel: string;
    isLocal: boolean;
  }) => Promise<void>;
  registerUserAccountAction: (params: {
    name: string;
    email: string;
    role: string;
    organizationName: string;
  }) => Promise<void>;
  switchUserAction: (userId: string) => Promise<void>;
  triggerTeamCollaboration: (teamId: string, mission: string) => Promise<void>;
  createTeamAction: (params: {
    name: string;
    description: string;
    orchestratorAgentId: string;
    memberAgentIds: string[];
    conflictResolutionPolicy: string;
  }) => Promise<void>;
}

export const useSyntaraStore = create<SyntaraClientStore>((set, get) => ({
  language: 'fr',
  activeSection: 'command-center',
  selectedProjectId: 'prj_crm_saas_01',
  loading: true,
  actionBusy: false,
  bannerMessage: null,

  globalKillSwitchActive: false,
  budgetLimits: {
    dailyCostLimitUsd: 25,
    currentDailySpendUsd: 0.42,
    maxTokensPerMission: 120000,
  },
  users: [],
  currentUserId: 'usr_founder_01',
  modelProviders: [],
  projects: [],
  tasks: [],
  cognitiveDecisions: [],
  agents: [],
  agentVersions: [],
  agentRuns: [],
  teams: [],
  interAgentMessages: [],
  memories: [],
  simulations: [],
  improvementProposals: [],
  tools: [],
  mcpServers: [],
  plugins: [],
  knowledgeCollections: [],
  knowledgeDocuments: [],
  knowledgeChunks: [],
  workspaceArtifacts: [],
  workflows: [],
  workflowRuns: [],
  approvals: [],
  auditLogs: [],
  conversations: [],
  notifications: [],

  setLanguage: (language) => set({ language }),
  setActiveSection: (activeSection) => set({ activeSection }),
  setSelectedProjectId: (selectedProjectId) => set({ selectedProjectId }),
  setBanner: (bannerMessage) => set({ bannerMessage }),
  markNotificationsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),

  fetchSystemState: async () => {
    try {
      const res = await fetch('/api/v1/state');
      if (!res.ok) throw new Error('Erreur réseau /api/v1/state');
      const data = await res.json();
      set({
        ...data,
        loading: false,
        selectedProjectId: get().selectedProjectId || data.projects?.[0]?.id || null,
      });
    } catch (err) {
      console.error('Failed to hydrate SYNTARA state:', err);
      set({ loading: false });
    }
  },

  triggerIntentToSystem: async (intent: string) => {
    set({ actionBusy: true, bannerMessage: { text: 'Moteur Intent-to-System en cours d’orchestration...', type: 'info' } });
    try {
      const res = await fetch('/api/v1/projects/intent-to-system', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Échec Intent-to-System');
      await get().fetchSystemState();
      set({
        selectedProjectId: data.id,
        actionBusy: false,
        bannerMessage: {
          text: `Système "${data.name}" généré avec plan cognitif, agents, tâches, livrables et workflow.`,
          type: 'success',
        },
      });
      return data as SyntaraProject;
    } catch (err: any) {
      set({
        actionBusy: false,
        bannerMessage: { text: err?.message || 'Erreur Intent-to-System', type: 'error' },
      });
      return null;
    }
  },

  executeAgentMissionAction: async (params) => {
    set({ actionBusy: true });
    try {
      const res = await fetch('/api/v1/agent-runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Échec de la mission');
      await get().fetchSystemState();
      set({
        actionBusy: false,
        bannerMessage: {
          text:
            data.state === 'Waiting Approval'
              ? `Mission mise en attente d'approbation humaine (Trust Engine).`
              : `Mission exécutée avec succès par ${data.agentName}.`,
          type: data.state === 'Waiting Approval' ? 'info' : 'success',
        },
      });
    } catch (err: any) {
      set({ actionBusy: false, bannerMessage: { text: err?.message || 'Erreur agent', type: 'error' } });
    }
  },

  killAgentImmediate: async (agentId) => {
    await fetch(`/api/v1/agents/${agentId}/kill`, { method: 'POST' });
    await get().fetchSystemState();
    set({
      bannerMessage: { text: 'Arrêt immédiat (Kill Switch) exécuté sur l’agent.', type: 'info' },
    });
  },

  toggleGlobalKillSwitch: async (active) => {
    await fetch('/api/v1/trust/kill-switch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active }),
    });
    await get().fetchSystemState();
    set({
      bannerMessage: {
        text: active
          ? 'KILL SWITCH GLOBAL ACTIVÉ : Tous les agents autonomes sont mis en pause.'
          : 'Kill Switch global désactivé : reprise nominale des moteurs.',
        type: active ? 'error' : 'success',
      },
    });
  },

  createCustomAgent: async (payload) => {
    set({ actionBusy: true });
    try {
      const res = await fetch('/api/v1/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la création de l’agent');
      await get().fetchSystemState();
      set({
        actionBusy: false,
        bannerMessage: { text: `Agent "${data.name}" publié et enregistré dans l'Agent Network.`, type: 'success' },
      });
    } catch (err: any) {
      set({ actionBusy: false, bannerMessage: { text: err?.message, type: 'error' } });
    }
  },

  resolveApprovalRequest: async (id, status, resolutionNote) => {
    await fetch(`/api/v1/approvals/${id}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, resolutionNote }),
    });
    await get().fetchSystemState();
    set({
      bannerMessage: {
        text: status === 'approved' ? 'Opération sensible autorisée et journalisée.' : 'Opération sensible rejetée.',
        type: status === 'approved' ? 'success' : 'info',
      },
    });
  },

  sendConversationMessage: async (params) => {
    set({ actionBusy: true });
    try {
      const res = await fetch(`/api/v1/conversations/${params.conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur conversation');
      await get().fetchSystemState();
      set({ actionBusy: false });
    } catch (err: any) {
      set({ actionBusy: false, bannerMessage: { text: err?.message, type: 'error' } });
    }
  },

  createTaskAction: async (payload) => {
    await fetch('/api/v1/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    await get().fetchSystemState();
    set({ bannerMessage: { text: `Tâche "${payload.title}" ajoutée au projet.`, type: 'success' } });
  },

  updateTaskStatusAction: async (taskId, status, outputSummary) => {
    await fetch(`/api/v1/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, outputSummary }),
    });
    await get().fetchSystemState();
  },

  createMemoryItemAction: async (payload) => {
    await fetch('/api/v1/memory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    await get().fetchSystemState();
    set({ bannerMessage: { text: 'Entrée mémoire enregistrée avec provenance vérifiée.', type: 'success' } });
  },

  deleteMemoryItemAction: async (id) => {
    await fetch(`/api/v1/memory/${id}`, { method: 'DELETE' });
    await get().fetchSystemState();
  },

  runWorkflowAction: async (workflowId) => {
    set({ actionBusy: true });
    const res = await fetch(`/api/v1/workflows/${workflowId}/run`, { method: 'POST' });
    const data = await res.json();
    await get().fetchSystemState();
    set({
      actionBusy: false,
      bannerMessage: {
        text: `Workflow exécuté avec succès en ${data.totalDurationMs}ms (${data.nodeResults?.length || 0} noeuds).`,
        type: 'success',
      },
    });
  },

  saveWorkflowAction: async (workflow) => {
    await fetch(`/api/v1/workflows/${workflow.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(workflow),
    });
    await get().fetchSystemState();
    set({ bannerMessage: { text: `Workflow "${workflow.name}" sauvegardé et versionné.`, type: 'success' } });
  },

  createWorkflowAction: async (name, description) => {
    await fetch('/api/v1/workflows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        description,
        nodes: [
          { id: 'n_trig', type: 'Trigger', label: 'Déclencheur API/Webhook', position: { x: 40, y: 120 }, config: {} },
          { id: 'n_agt', type: 'Agent', label: 'Automation Agent', position: { x: 320, y: 120 }, config: { agentId: 'agt_automation' } },
          { id: 'n_out', type: 'Output', label: 'Sortie Validée', position: { x: 600, y: 120 }, config: {} },
        ],
        edges: [
          { id: 'e_1', source: 'n_trig', target: 'n_agt' },
          { id: 'e_2', source: 'n_agt', target: 'n_out' },
        ],
      }),
    });
    await get().fetchSystemState();
    set({ bannerMessage: { text: `Workflow "${name}" créé dans Workflow Studio.`, type: 'success' } });
  },

  runSimulationAction: async (params) => {
    set({ actionBusy: true });
    await fetch('/api/v1/simulations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    await get().fetchSystemState();
    set({
      actionBusy: false,
      bannerMessage: {
        text: 'Simulation multi-scénarios (Conservative, Balanced, Optimistic) calculée.',
        type: 'success',
      },
    });
  },

  searchKnowledgeAction: async (query, collectionId) => {
    const res = await fetch('/api/v1/knowledge/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, collectionId, topK: 5 }),
    });
    const data = await res.json();
    return data.results || [];
  },

  uploadKnowledgeDocAction: async (params) => {
    const res = await fetch('/api/v1/knowledge/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) {
      set({ bannerMessage: { text: data.error || 'Rejeté par le Trust Engine', type: 'error' } });
      return;
    }
    await get().fetchSystemState();
    set({ bannerMessage: { text: `Document "${params.title}" découpé en chunks et indexé en vecteurs.`, type: 'success' } });
  },

  deleteKnowledgeDocAction: async (id) => {
    await fetch(`/api/v1/knowledge/documents/${id}`, { method: 'DELETE' });
    await get().fetchSystemState();
  },

  rollbackArtifactAction: async (id) => {
    await fetch(`/api/v1/creation/${id}/rollback`, { method: 'POST' });
    await get().fetchSystemState();
    set({ bannerMessage: { text: 'Rollback du fichier vers la version précédente effectué.', type: 'info' } });
  },

  createArtifactAction: async (params) => {
    await fetch('/api/v1/creation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    await get().fetchSystemState();
    set({ bannerMessage: { text: `Livrable "${params.path}" généré dans l'espace isolé.`, type: 'success' } });
  },

  resolveEvolutionProposal: async (id, decision) => {
    await fetch(`/api/v1/evolution/${id}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision }),
    });
    await get().fetchSystemState();
    set({
      bannerMessage: {
        text:
          decision === 'approve'
            ? 'Amélioration Evolution Engine approuvée et appliquée.'
            : decision === 'rollback'
            ? 'Retour à la version antérieure effectué.'
            : 'Proposition rejetée.',
        type: 'success',
      },
    });
  },

  testToolConnectivity: async (toolId) => {
    const res = await fetch(`/api/v1/tools/${toolId}/test`, { method: 'POST' });
    const data = await res.json();
    await get().fetchSystemState();
    set({
      bannerMessage: {
        text: data.message,
        type: data.ok ? 'success' : 'error',
      },
    });
  },

  configureToolEndpoint: async (toolId, endpointOrCommand) => {
    await fetch(`/api/v1/tools/${toolId}/configure`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpointOrCommand }),
    });
    await get().fetchSystemState();
    set({ bannerMessage: { text: 'Outil configuré et activé.', type: 'success' } });
  },

  createPluginAction: async (params) => {
    await fetch('/api/v1/plugins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    await get().fetchSystemState();
    set({ bannerMessage: { text: `Plugin SDK "${params.name}" enregistré.`, type: 'success' } });
  },

  addModelProviderAction: async (params) => {
    await fetch('/api/v1/models', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    await get().fetchSystemState();
    set({ bannerMessage: { text: `Adaptateur modèle "${params.name}" connecté.`, type: 'success' } });
  },

  registerUserAccountAction: async (params) => {
    await fetch('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    await get().fetchSystemState();
    set({ bannerMessage: { text: `Compte "${params.name}" créé et activé.`, type: 'success' } });
  },

  switchUserAction: async (userId) => {
    await fetch('/api/v1/auth/switch-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    await get().fetchSystemState();
  },

  triggerTeamCollaboration: async (teamId, mission) => {
    await fetch('/api/v1/collective/collaborate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId, mission }),
    });
    await get().fetchSystemState();
    set({ bannerMessage: { text: 'Mission collaborative déléguée à l’équipe d’agents.', type: 'success' } });
  },

  createTeamAction: async (params) => {
    await fetch('/api/v1/collective/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    await get().fetchSystemState();
    set({ bannerMessage: { text: `Équipe "${params.name}" créée.`, type: 'success' } });
  },
}));
