/**
 * SYNTARA AI — Universal Autonomous Intelligence Operating System
 * Core Domain Contracts, Relational Schema Types & 12-Engine Interfaces
 * License: MIT
 */

export type LanguageCode = 'fr' | 'en';

export type NavigationSection =
  | 'command-center'
  | 'intelligence'
  | 'projects'
  | 'agent-network'
  | 'agent-builder'
  | 'collective'
  | 'workflow-studio'
  | 'simulation-lab'
  | 'knowledge-center'
  | 'creation-studio'
  | 'integrations'
  | 'developer-studio'
  | 'monitoring'
  | 'settings';

// ============================================================================
// ENGINE 01 — INTENT ENGINE (SYNTARA Intent Schema)
// ============================================================================
export interface SyntaraIntentSchema {
  id: string;
  rawInput: string;
  objective: string;
  context: string;
  constraints: string[];
  resources: string[];
  expectedDeliverables: string[];
  successCriteria: string[];
  requiredPermissions: string[];
  identifiedRisks: Array<{
    risk: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    mitigation: string;
  }>;
  ambiguitiesDetected: string[];
  feasibilityScore: number; // 0 - 100
  estimatedResources: {
    estimatedTokens: number;
    estimatedCostUsd: number;
    estimatedDurationMinutes: number;
    recommendedAgents: string[];
  };
  decomposedGoals: Array<{
    id: string;
    title: string;
    description: string;
    dependsOn: string[];
    assignedRole: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
  }>;
  createdAt: string;
}

// ============================================================================
// ENGINE 02 — COGNITIVE ENGINE
// ============================================================================
export interface CognitiveDecisionNode {
  id: string;
  projectId: string;
  stepNumber: number;
  title: string;
  problemAnalysis: string;
  comparedStrategies: Array<{
    name: string;
    pros: string[];
    cons: string[];
    score: number;
  }>;
  selectedStrategy: string;
  justifiedDecision: string;
  executableSteps: string[];
  hypothesisVerified: boolean;
  auditCorrelationId: string;
  createdAt: string;
}

// ============================================================================
// ENGINE 03 — AUTONOMOUS AGENT ENGINE
// ============================================================================
export type AgentExecutionState =
  | 'Draft'
  | 'Ready'
  | 'Running'
  | 'Waiting Approval'
  | 'Paused'
  | 'Completed'
  | 'Failed'
  | 'Disabled';

export type AutonomyLevel = 'ASSISTED' | 'SUPERVISED' | 'AUTONOMOUS';

export interface SyntaraAgent {
  id: string;
  name: string;
  role: string;
  description: string;
  mission: string;
  instructions: string;
  modelProviderId: string;
  modelId: string;
  skills: string[];
  tools: string[]; // Tool IDs
  memoryConfig: {
    enabledLayers: MemoryLayerType[];
    retentionDays: number;
    maxContextTokens: number;
  };
  permissions: string[];
  autonomyLevel: AutonomyLevel;
  resourceLimits: {
    maxTokensPerRun: number;
    maxCostUsdPerRun: number;
    maxExecutionTimeSeconds: number;
    maxRetries: number;
  };
  state: AgentExecutionState;
  version: string;
  successRate: number;
  totalRuns: number;
  avgLatencyMs: number;
  isBuiltIn: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AgentVersionRecord {
  id: string;
  agentId: string;
  version: string;
  instructions: string;
  modelId: string;
  autonomyLevel: AutonomyLevel;
  tools: string[];
  changelog: string;
  createdAt: string;
}

export interface AgentRun {
  id: string;
  correlationId: string;
  agentId: string;
  agentName: string;
  projectId?: string;
  taskId?: string;
  mission: string;
  state: AgentExecutionState;
  autonomyLevel: AutonomyLevel;
  steps: Array<{
    id: string;
    timestamp: string;
    action: string;
    toolUsed?: string;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'waiting_approval';
    outputSummary: string;
    durationMs: number;
  }>;
  tokensUsed: number;
  costUsd: number;
  report?: string;
  error?: string;
  startedAt: string;
  completedAt?: string;
}

// ============================================================================
// ENGINE 04 — COLLECTIVE INTELLIGENCE ENGINE
// ============================================================================
export interface AgentTeam {
  id: string;
  name: string;
  description: string;
  orchestratorAgentId: string;
  memberAgentIds: string[];
  sharedMemoryScope: string;
  conflictResolutionPolicy: 'orchestrator_decides' | 'consensus_vote' | 'human_arbitration';
  activeMissionsCount: number;
  createdAt: string;
}

export interface InterAgentMessage {
  id: string;
  correlationId: string;
  projectId: string;
  fromAgentId: string;
  fromAgentName: string;
  toAgentId: string;
  toAgentName: string;
  messageType: 'delegation' | 'artifact_handoff' | 'verification_request' | 'conflict_resolution' | 'synthesis';
  subject: string;
  payload: string;
  timestamp: string;
}

// ============================================================================
// ENGINE 05 — MEMORY ENGINE
// ============================================================================
export type MemoryLayerType =
  | 'Working Memory'
  | 'Conversation Memory'
  | 'Project Memory'
  | 'Long-Term Memory'
  | 'Knowledge Memory'
  | 'Agent Memory';

export type EpistemicStatus = 'verified_fact' | 'model_hypothesis' | 'user_directive' | 'external_citation';

export interface SyntaraMemoryItem {
  id: string;
  layer: MemoryLayerType;
  projectId?: string;
  agentId?: string;
  key: string;
  content: string;
  provenance: string;
  confidenceScore: number; // 0.0 to 1.0
  epistemicStatus: EpistemicStatus;
  version: number;
  tags: string[];
  expiresAt?: string | null;
  accessScope: 'private' | 'project' | 'organization' | 'global';
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// ENGINE 06 — REALITY SIMULATION ENGINE
// ============================================================================
export type SimulationScenarioType = 'Conservative' | 'Balanced' | 'Optimistic';

export interface SimulationScenarioResult {
  scenarioType: SimulationScenarioType;
  hypotheses: string[];
  inputVariables: Record<string, string | number>;
  limitations: string[];
  projectedMetrics: {
    estimatedCostUsd: number;
    estimatedDurationHours: number;
    tokenConsumption: number;
    computeUnits: number;
    expectedSuccessProbability: number; // 0-100
    roiMultiplier: number;
  };
  identifiedRisks: Array<{
    description: string;
    probability: number;
    impact: 'low' | 'medium' | 'high';
  }>;
  observedVsForecastDelta?: {
    actualCostUsd?: number;
    actualDurationHours?: number;
    variancePercent?: number;
  };
}

export interface SyntaraSimulation {
  id: string;
  name: string;
  projectId?: string;
  workflowId?: string;
  description: string;
  datasetUsed: string;
  disclaimer: string;
  scenarios: SimulationScenarioResult[];
  recommendedScenario: SimulationScenarioType;
  createdAt: string;
}

// ============================================================================
// ENGINE 07 — EVOLUTION ENGINE
// ============================================================================
export interface ImprovementProposal {
  id: string;
  targetType: 'agent' | 'workflow';
  targetId: string;
  targetName: string;
  currentVersion: string;
  proposedVersion: string;
  detectedIssue: string;
  recurringErrorPattern?: string;
  proposedChanges: {
    field: 'instructions' | 'tools' | 'strategy' | 'retry_policy';
    before: string;
    after: string;
  };
  abTestResults: {
    sampleSize: number;
    baselineSuccessRate: number;
    candidateSuccessRate: number;
    latencyDeltaMs: number;
    costDeltaPercent: number;
  };
  requiresHumanApproval: boolean;
  permissionEscalationAttempted: boolean; // Always blocked by Trust Engine if true
  status: 'pending_approval' | 'approved_applied' | 'rejected' | 'rolled_back';
  createdAt: string;
}

// ============================================================================
// ENGINE 08 — UNIVERSAL TOOL FABRIC (Tools, Plugins, MCP)
// ============================================================================
export type ToolProtocol = 'MCP' | 'REST_API' | 'WEBHOOK' | 'PLUGIN' | 'LOCAL_SANDBOX';

export interface SyntaraTool {
  id: string;
  name: string;
  slug: string;
  protocol: ToolProtocol;
  category: string;
  description: string;
  version: string;
  endpointOrCommand: string;
  authType: 'none' | 'api_key' | 'oauth2' | 'bearer_token' | 'system_sandbox';
  configuredStatus: 'ready' | 'missing_credentials' | 'disconnected';
  requiredPermissions: string[];
  rateLimitPerMinute: number;
  inputSchemaJson: string;
  outputSchemaJson: string;
  lastConnectivityCheck?: {
    timestamp: string;
    ok: boolean;
    latencyMs: number;
    message: string;
  };
}

export interface SyntaraMcpServer {
  id: string;
  name: string;
  transport: 'stdio' | 'sse' | 'streamable_http';
  urlOrCommand: string;
  status: 'connected' | 'requires_config' | 'error';
  exposedTools: string[];
  exposedResources: string[];
  version: string;
  lastPingMs: number;
}

export interface SyntaraPluginManifest {
  id: string;
  name: string;
  version: string;
  author: string;
  license: string;
  description: string;
  entryPoint: string;
  inputs: Record<string, string>;
  outputs: Record<string, string>;
  permissions: string[];
  resourceLimits: {
    maxMemoryMb: number;
    timeoutMs: number;
  };
  dependencies: string[];
  enabled: boolean;
  codeSource: string;
  createdAt: string;
}

// ============================================================================
// ENGINE 09 — KNOWLEDGE ENGINE & RAG
// ============================================================================
export interface KnowledgeBaseCollection {
  id: string;
  name: string;
  description: string;
  embeddingModel: string;
  vectorDimension: number;
  documentCount: number;
  chunkCount: number;
  createdAt: string;
}

export interface KnowledgeDocument {
  id: string;
  collectionId: string;
  title: string;
  format: 'PDF' | 'DOCX' | 'TXT' | 'Markdown' | 'CSV' | 'JSON' | 'HTML' | 'TechDoc';
  rawContent: string;
  sizeBytes: number;
  chunkCount: number;
  indexedAt: string;
}

export interface KnowledgeChunk {
  id: string;
  documentId: string;
  collectionId: string;
  documentTitle: string;
  chunkIndex: number;
  content: string;
  tokenCount: number;
  embeddingVector: number[]; // Deterministic or model-generated normalized vector
}

export interface KnowledgeSearchResult {
  chunkId: string;
  documentId: string;
  documentTitle: string;
  content: string;
  vectorScore: number;
  lexicalScore: number;
  hybridScore: number;
  citationTag: string;
}

// ============================================================================
// ENGINE 10 — CREATION ENGINE (Isolated Workspace & Deliverables)
// ============================================================================
export type DeliverableType =
  | 'code'
  | 'website'
  | 'application'
  | 'document'
  | 'report'
  | 'presentation'
  | 'workflow_spec'
  | 'script';

export interface WorkspaceArtifact {
  id: string;
  projectId: string;
  path: string;
  title: string;
  type: DeliverableType;
  language: string;
  previousContent: string;
  currentContent: string;
  version: number;
  createdByAgent: string;
  validationStatus: 'passed' | 'warning' | 'failed';
  validationReport: string[];
  updatedAt: string;
}

// ============================================================================
// ENGINE 11 — WORKFLOW ENGINE
// ============================================================================
export type WorkflowNodeType =
  | 'Trigger'
  | 'Agent'
  | 'AI Model'
  | 'Condition'
  | 'Action'
  | 'API'
  | 'MCP Tool'
  | 'Database'
  | 'Loop'
  | 'Delay'
  | 'Approval'
  | 'Notification'
  | 'Output';

export interface WorkflowNode {
  id: string;
  type: WorkflowNodeType;
  label: string;
  position: { x: number; y: number };
  config: Record<string, any>;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  conditionLabel?: string;
}

export interface SyntaraWorkflow {
  id: string;
  projectId?: string;
  name: string;
  description: string;
  version: string;
  scheduleCron?: string | null;
  status: 'active' | 'draft' | 'paused';
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  variables: Record<string, string>;
  lastRunAt?: string;
  lastRunStatus?: 'completed' | 'waiting_approval' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowRunLog {
  id: string;
  workflowId: string;
  workflowName: string;
  correlationId: string;
  status: 'running' | 'completed' | 'waiting_approval' | 'failed';
  nodeResults: Array<{
    nodeId: string;
    nodeLabel: string;
    nodeType: WorkflowNodeType;
    status: 'completed' | 'skipped' | 'waiting_approval' | 'failed';
    output: string;
    durationMs: number;
  }>;
  totalDurationMs: number;
  startedAt: string;
  completedAt?: string;
}

// ============================================================================
// ENGINE 12 — TRUST ENGINE (RBAC, Approvals, Kill Switch, Audit)
// ============================================================================
export interface HumanApprovalRequest {
  id: string;
  correlationId: string;
  projectId?: string;
  agentId: string;
  agentName: string;
  operationType:
    | 'permanent_deletion'
    | 'financial_transfer'
    | 'external_publication'
    | 'production_code_change'
    | 'permission_modification'
    | 'high_cost_execution';
  severity: 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  proposedPayload: string;
  estimatedCostUsd: number;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNote?: string;
}

export interface AuditLogEntry {
  id: string;
  correlationId: string;
  timestamp: string;
  actorType: 'user' | 'agent' | 'system' | 'trust_engine';
  actorId: string;
  actorName: string;
  engine: string;
  action: string;
  resourceType: string;
  resourceId: string;
  status: 'allowed' | 'blocked' | 'requires_approval' | 'completed' | 'error';
  details: string;
}

// ============================================================================
// SYNTARA MODEL ADAPTER
// ============================================================================
export type ModelProviderType = 'gemini' | 'ollama' | 'litellm' | 'huggingface' | 'openai_compatible';

export interface SyntaraModelProvider {
  id: string;
  name: string;
  providerType: ModelProviderType;
  endpoint: string;
  isLocal: boolean;
  status: 'online' | 'standby' | 'requires_configuration';
  defaultModel: string;
  availableModels: string[];
  latencyMs: number;
  costPer1kTokensUsd: number;
}

// ============================================================================
// CENTRAL OBJECT: SYNTARA PROJECT & TASKS
// ============================================================================
export interface SyntaraTask {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assignedAgentId: string;
  assignedAgentName: string;
  dependsOnTaskIds: string[];
  status: 'queued' | 'running' | 'waiting_approval' | 'completed' | 'failed' | 'paused';
  priority: 'low' | 'medium' | 'high' | 'critical';
  outputSummary?: string;
  tokensUsed: number;
  costUsd: number;
  createdAt: string;
  updatedAt: string;
}

export interface SyntaraProject {
  id: string;
  name: string;
  description: string;
  originalIntent: string;
  status: 'planning' | 'active' | 'waiting_approval' | 'paused' | 'completed';
  intentSchema: SyntaraIntentSchema;
  agentIds: string[];
  taskIds: string[];
  artifactIds: string[];
  workflowIds: string[];
  knowledgeCollectionId?: string;
  decisionIds: string[];
  executionLogs: Array<{
    id: string;
    timestamp: string;
    engine: string;
    message: string;
    level: 'info' | 'success' | 'warn' | 'error';
  }>;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// CONVERSATIONS & INTELLIGENCE INTERFACE
// ============================================================================
export type IntelligenceMode = 'chat' | 'research' | 'project' | 'agent' | 'execution';

export interface ConversationMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  mode: IntelligenceMode;
  modelUsed: string;
  attachments?: Array<{ name: string; type: string; size: number }>;
  citations?: string[];
  suggestedActions?: Array<{
    type: 'create_project' | 'create_task' | 'create_workflow';
    label: string;
    payload: string;
  }>;
  tokensUsed: number;
  latencyMs: number;
  createdAt: string;
}

export interface SyntaraConversation {
  id: string;
  title: string;
  mode: IntelligenceMode;
  modelId: string;
  projectId?: string;
  agentId?: string;
  messages: ConversationMessage[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// USERS, ORGANIZATIONS & RBAC
// ============================================================================
export interface SyntaraUser {
  id: string;
  email: string;
  name: string;
  role: 'Owner' | 'Admin' | 'Architect' | 'Operator' | 'Viewer';
  organizationId: string;
  organizationName: string;
  permissions: string[];
  createdAt: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical' | 'success';
  read: boolean;
  linkSection?: NavigationSection;
  createdAt: string;
}
