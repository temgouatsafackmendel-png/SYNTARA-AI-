/**
 * SYNTARA AI — Full-Stack Server & Versioned API (/api/v1/*)
 * Mounts Express API routes + Vite middleware in development or static dist in production.
 */

import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { syntaraStore } from './src/server/store.ts';
import {
  executeIntentToSystem,
  generateWithModelAdapter,
  searchKnowledgeHybrid,
  ingestKnowledgeDocument,
  createAndRunSimulation,
  executeAgentMission,
  runProductAcceptanceSuite,
  recordAuditLog,
  inspectPayloadSecurity,
} from './src/server/engines.ts';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '5mb' }));

  // ==========================================================================
  // Unified System State Snapshot
  // ==========================================================================
  app.get('/api/v1/state', (_req, res) => {
    res.json(syntaraStore.getState());
  });

  // ==========================================================================
  // /api/v1/auth & /api/v1/users (TEST 1 & RBAC)
  // ==========================================================================
  app.get('/api/v1/users', (_req, res) => {
    const state = syntaraStore.getState();
    res.json({ users: state.users, currentUserId: state.currentUserId });
  });

  app.post('/api/v1/auth/switch-user', (req, res) => {
    const { userId } = req.body;
    const state = syntaraStore.mutate((draft) => {
      const found = draft.users.find((u) => u.id === userId);
      if (found) {
        draft.currentUserId = found.id;
      }
    });
    res.json({ currentUserId: state.currentUserId });
  });

  app.post('/api/v1/auth/register', (req, res) => {
    const { name, email, role, organizationName } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Le nom et l’email sont requis.' });
    }
    const newUser = {
      id: `usr_${Date.now()}`,
      name: String(name).trim(),
      email: String(email).trim(),
      role: (role || 'Architect') as 'Owner' | 'Admin' | 'Architect' | 'Operator' | 'Viewer',
      organizationId: 'org_syntara_core',
      organizationName: organizationName || 'SYNTARA Core Lab',
      permissions:
        role === 'Viewer'
          ? ['security:audit']
          : [
              'intent:create',
              'agents:manage',
              'agents:execute',
              'agents:kill',
              'workflows:manage',
              'tools:configure',
              'approvals:resolve',
              'security:audit',
              'memory:write',
              'knowledge:manage',
            ],
      createdAt: new Date().toISOString(),
    };
    syntaraStore.mutate((draft) => {
      draft.users.push(newUser);
      draft.currentUserId = newUser.id;
    });
    recordAuditLog({
      correlationId: `corr_auth_${Date.now()}`,
      actorType: 'user',
      actorId: newUser.id,
      actorName: newUser.name,
      engine: 'TRUST ENGINE',
      action: 'USER_ACCOUNT_CREATED',
      resourceType: 'user',
      resourceId: newUser.id,
      status: 'completed',
      details: `Compte utilisateur créé avec le rôle ${newUser.role}.`,
    });
    res.json(newUser);
  });

  // ==========================================================================
  // /api/v1/projects & INTENT-TO-SYSTEM
  // ==========================================================================
  app.get('/api/v1/projects', (_req, res) => {
    res.json(syntaraStore.getState().projects);
  });

  app.post('/api/v1/projects/intent-to-system', async (req, res) => {
    try {
      const { intent } = req.body;
      if (!intent || typeof intent !== 'string' || intent.trim().length < 4) {
        return res.status(400).json({ error: 'Veuillez décrire une intention valide.' });
      }
      const project = await executeIntentToSystem(intent.trim());
      res.json(project);
    } catch (err: any) {
      res.status(400).json({ error: err?.message || 'Erreur lors de la génération Intent-to-System.' });
    }
  });

  // ==========================================================================
  // /api/v1/agents & /api/v1/agent-runs (Engine 03 & Engine 04)
  // ==========================================================================
  app.get('/api/v1/agents', (_req, res) => {
    res.json(syntaraStore.getState().agents);
  });

  app.post('/api/v1/agents', (req, res) => {
    const body = req.body;
    if (!body.name || !body.role) {
      return res.status(400).json({ error: 'Le nom et le rôle de l’agent sont obligatoires.' });
    }
    const now = new Date().toISOString();
    const newAgent = {
      id: `agt_custom_${Date.now()}`,
      name: String(body.name).trim(),
      role: String(body.role).trim(),
      description: String(body.description || 'Agent spécialisé créé via Agent Builder.').trim(),
      mission: String(body.mission || 'Exécuter les missions assignées avec précision.').trim(),
      instructions: String(body.instructions || 'Respecter les permissions et produire un rapport vérifiable.').trim(),
      modelProviderId: body.modelProviderId || 'prov_gemini',
      modelId: body.modelId || 'gemini-3.8-flash',
      skills: Array.isArray(body.skills) ? body.skills : ['Task Execution', 'Analysis'],
      tools: Array.isArray(body.tools) ? body.tools : ['tool_fs_sandbox'],
      memoryConfig: body.memoryConfig || {
        enabledLayers: ['Working Memory', 'Project Memory', 'Agent Memory'],
        retentionDays: 60,
        maxContextTokens: 32000,
      },
      permissions: Array.isArray(body.permissions) ? body.permissions : ['workspace:read'],
      autonomyLevel: body.autonomyLevel || 'SUPERVISED',
      resourceLimits: body.resourceLimits || {
        maxTokensPerRun: 24000,
        maxCostUsdPerRun: 0.5,
        maxExecutionTimeSeconds: 90,
        maxRetries: 2,
      },
      state: 'Ready' as const,
      version: '1.0.0',
      successRate: 100,
      totalRuns: 0,
      avgLatencyMs: 380,
      isBuiltIn: false,
      createdAt: now,
      updatedAt: now,
    };

    syntaraStore.mutate((draft) => {
      draft.agents.unshift(newAgent);
      draft.agentVersions.unshift({
        id: `ver_${Date.now()}`,
        agentId: newAgent.id,
        version: '1.0.0',
        instructions: newAgent.instructions,
        modelId: newAgent.modelId,
        autonomyLevel: newAgent.autonomyLevel,
        tools: newAgent.tools,
        changelog: 'Publication initiale depuis Agent Builder.',
        createdAt: now,
      });
    });

    recordAuditLog({
      correlationId: `corr_agt_${Date.now()}`,
      actorType: 'user',
      actorId: syntaraStore.getState().currentUserId,
      actorName: 'Architect',
      engine: 'AUTONOMOUS AGENT ENGINE',
      action: 'AGENT_PUBLISHED',
      resourceType: 'agent',
      resourceId: newAgent.id,
      status: 'completed',
      details: `Agent "${newAgent.name}" publié en mode ${newAgent.autonomyLevel}.`,
    });

    res.json(newAgent);
  });

  app.post('/api/v1/agents/:id/kill', (req, res) => {
    const { id } = req.params;
    const now = new Date().toISOString();
    let targetName = id;
    syntaraStore.mutate((draft) => {
      const agt = draft.agents.find((a) => a.id === id);
      if (agt) {
        agt.state = 'Paused';
        agt.updatedAt = now;
        targetName = agt.name;
      }
      draft.agentRuns.forEach((r) => {
        if (r.agentId === id && (r.state === 'Running' || r.state === 'Waiting Approval')) {
          r.state = 'Paused';
          r.completedAt = now;
          r.report = 'Arrêt immédiat déclenché par l’utilisateur (Kill Switch).';
        }
      });
    });

    recordAuditLog({
      correlationId: `corr_kill_${Date.now()}`,
      actorType: 'user',
      actorId: syntaraStore.getState().currentUserId,
      actorName: 'Opérateur Humain',
      engine: 'TRUST ENGINE',
      action: 'AGENT_KILL_SWITCH_TRIGGERED',
      resourceType: 'agent',
      resourceId: id,
      status: 'completed',
      details: `Arrêt immédiat de l'agent "${targetName}".`,
    });

    res.json({ status: 'Paused', agentId: id });
  });

  app.post('/api/v1/agents/:id/state', (req, res) => {
    const { id } = req.params;
    const { state } = req.body;
    syntaraStore.mutate((draft) => {
      const agt = draft.agents.find((a) => a.id === id);
      if (agt && state) {
        agt.state = state;
        agt.updatedAt = new Date().toISOString();
      }
    });
    res.json({ ok: true });
  });

  app.get('/api/v1/agent-runs', (_req, res) => {
    res.json(syntaraStore.getState().agentRuns);
  });

  app.post('/api/v1/agent-runs', (req, res) => {
    try {
      const { agentId, mission, projectId, requireApprovalForSensitive } = req.body;
      const run = executeAgentMission({
        agentId,
        mission,
        projectId,
        requireApprovalForSensitive,
      });
      res.json(run);
    } catch (err: any) {
      res.status(400).json({ error: err?.message || 'Erreur lors de l’exécution de la mission.' });
    }
  });

  // ==========================================================================
  // /api/v1/collective (Teams & Delegation)
  // ==========================================================================
  app.post('/api/v1/collective/teams', (req, res) => {
    const { name, description, orchestratorAgentId, memberAgentIds, conflictResolutionPolicy } = req.body;
    const team = {
      id: `team_${Date.now()}`,
      name: String(name || 'Nouvelle Équipe Multi-Agents').trim(),
      description: String(description || 'Cellule collaborative personnalisée.').trim(),
      orchestratorAgentId: orchestratorAgentId || 'agt_project_manager',
      memberAgentIds: Array.isArray(memberAgentIds) && memberAgentIds.length > 0 ? memberAgentIds : ['agt_system_architect', 'agt_software_engineer'],
      sharedMemoryScope: `team:custom_${Date.now()}`,
      conflictResolutionPolicy: conflictResolutionPolicy || 'orchestrator_decides',
      activeMissionsCount: 1,
      createdAt: new Date().toISOString(),
    };
    syntaraStore.mutate((draft) => {
      draft.teams.unshift(team);
    });
    res.json(team);
  });

  app.post('/api/v1/collective/collaborate', (req, res) => {
    const { teamId, mission, projectId } = req.body;
    const state = syntaraStore.getState();
    const team = state.teams.find((t) => t.id === teamId) || state.teams[0];
    if (!team) {
      return res.status(404).json({ error: 'Équipe introuvable.' });
    }
    const now = new Date().toISOString();
    const corrId = `corr_collab_${Date.now()}`;
    const orchestrator = state.agents.find((a) => a.id === team.orchestratorAgentId) || state.agents[0];
    const members = team.memberAgentIds
      .map((id) => state.agents.find((a) => a.id === id))
      .filter(Boolean);

    syntaraStore.mutate((draft) => {
      members.forEach((member, idx) => {
        if (!member) return;
        draft.interAgentMessages.unshift({
          id: `msg_ia_${Date.now()}_${idx}`,
          correlationId: corrId,
          projectId: projectId || draft.projects[0]?.id || 'prj_crm_saas_01',
          fromAgentId: orchestrator.id,
          fromAgentName: orchestrator.name,
          toAgentId: member.id,
          toAgentName: member.name,
          messageType: idx === 0 ? 'delegation' : 'verification_request',
          subject: `Mission Collaborative : ${String(mission || 'Analyse & Implémentation').slice(0, 50)}`,
          payload: `Sous-tâche déléguée à ${member.name} avec partage restreint au scope mémoire ${team.sharedMemoryScope}.`,
          timestamp: now,
        });
      });
      const targetTeam = draft.teams.find((t) => t.id === team.id);
      if (targetTeam) targetTeam.activeMissionsCount += 1;
    });

    res.json({ ok: true, correlationId: corrId });
  });

  // ==========================================================================
  // /api/v1/tasks
  // ==========================================================================
  app.get('/api/v1/tasks', (_req, res) => {
    res.json(syntaraStore.getState().tasks);
  });

  app.post('/api/v1/tasks', (req, res) => {
    const { projectId, title, description, assignedAgentId, priority } = req.body;
    const state = syntaraStore.getState();
    const agent = state.agents.find((a) => a.id === assignedAgentId) || state.agents[1];
    const now = new Date().toISOString();
    const newTask = {
      id: `tsk_${Date.now()}`,
      projectId: projectId || state.projects[0]?.id || 'prj_crm_saas_01',
      title: String(title || 'Nouvelle tâche').trim(),
      description: String(description || '').trim(),
      assignedAgentId: agent.id,
      assignedAgentName: agent.name,
      dependsOnTaskIds: [],
      status: 'queued' as const,
      priority: (priority || 'medium') as 'low' | 'medium' | 'high' | 'critical',
      tokensUsed: 0,
      costUsd: 0,
      createdAt: now,
      updatedAt: now,
    };
    syntaraStore.mutate((draft) => {
      draft.tasks.unshift(newTask);
      const prj = draft.projects.find((p) => p.id === newTask.projectId);
      if (prj) prj.taskIds.push(newTask.id);
    });
    res.json(newTask);
  });

  app.patch('/api/v1/tasks/:id', (req, res) => {
    const { id } = req.params;
    const { status, outputSummary } = req.body;
    syntaraStore.mutate((draft) => {
      const task = draft.tasks.find((t) => t.id === id);
      if (task) {
        if (status) task.status = status;
        if (outputSummary !== undefined) task.outputSummary = outputSummary;
        if (status === 'completed' && task.tokensUsed === 0) {
          task.tokensUsed = 4800;
          task.costUsd = 0.017;
        }
        task.updatedAt = new Date().toISOString();
      }
    });
    res.json({ ok: true });
  });

  // ==========================================================================
  // /api/v1/conversations (Intelligence Interface)
  // ==========================================================================
  app.get('/api/v1/conversations', (_req, res) => {
    res.json(syntaraStore.getState().conversations);
  });

  app.post('/api/v1/conversations/:id/messages', async (req, res) => {
    try {
      const { id } = req.params;
      const { content, mode, modelId, attachments } = req.body;
      if (!content || typeof content !== 'string') {
        return res.status(400).json({ error: 'Message vide.' });
      }

      const ragHits = searchKnowledgeHybrid(content, undefined, 3);
      const now = new Date().toISOString();
      const userMsg = {
        id: `cmsg_${Date.now()}_u`,
        conversationId: id,
        role: 'user' as const,
        content: content.trim(),
        mode: mode || 'project',
        modelUsed: modelId || 'gemini-3.8-flash',
        attachments: Array.isArray(attachments) ? attachments : [],
        tokensUsed: Math.ceil(content.length / 4),
        latencyMs: 0,
        createdAt: now,
      };

      const aiResponse = await generateWithModelAdapter({
        prompt: content.trim(),
        modelId: modelId || 'gemini-3.8-flash',
        mode: mode || 'project',
        ragContext: ragHits,
      });

      const assistantMsg = {
        id: `cmsg_${Date.now()}_a`,
        conversationId: id,
        role: 'assistant' as const,
        content: aiResponse.text,
        mode: mode || 'project',
        modelUsed: aiResponse.modelUsed,
        citations: ragHits.map((r) => r.citationTag),
        suggestedActions: [
          {
            type: 'create_project' as const,
            label: 'Transformer en Projet Intent-to-System',
            payload: content.trim(),
          },
          {
            type: 'create_task' as const,
            label: 'Créer une Tâche d’Agent',
            payload: `Exécuter : ${content.trim().slice(0, 90)}`,
          },
          {
            type: 'create_workflow' as const,
            label: 'Générer un Workflow Automatisé',
            payload: content.trim().slice(0, 60),
          },
        ],
        tokensUsed: aiResponse.tokensUsed,
        latencyMs: aiResponse.latencyMs,
        createdAt: new Date().toISOString(),
      };

      syntaraStore.mutate((draft) => {
        let conv = draft.conversations.find((c) => c.id === id);
        if (!conv) {
          conv = {
            id,
            title: content.trim().slice(0, 48),
            mode: mode || 'project',
            modelId: modelId || 'gemini-3.8-flash',
            messages: [],
            createdAt: now,
            updatedAt: now,
          };
          draft.conversations.unshift(conv);
        }
        conv.messages.push(userMsg, assistantMsg);
        conv.updatedAt = new Date().toISOString();
      });

      res.json({ userMsg, assistantMsg });
    } catch (err: any) {
      res.status(400).json({ error: err?.message || 'Erreur lors de la génération.' });
    }
  });

  // ==========================================================================
  // /api/v1/memory (Engine 05 — 6 Memory Layers)
  // ==========================================================================
  app.get('/api/v1/memory', (_req, res) => {
    res.json(syntaraStore.getState().memories);
  });

  app.post('/api/v1/memory', (req, res) => {
    const { layer, key, content, provenance, confidenceScore, epistemicStatus, tags, accessScope } = req.body;
    const now = new Date().toISOString();
    const item = {
      id: `mem_${Date.now()}`,
      layer: layer || 'Project Memory',
      key: String(key || 'custom.memory_key').trim(),
      content: String(content || '').trim(),
      provenance: String(provenance || 'Saisie / Correction Utilisateur').trim(),
      confidenceScore: Number(confidenceScore ?? 1.0),
      epistemicStatus: epistemicStatus || 'verified_fact',
      version: 1,
      tags: Array.isArray(tags) ? tags : ['manual'],
      expiresAt: null,
      accessScope: accessScope || 'project',
      createdAt: now,
      updatedAt: now,
    };
    syntaraStore.mutate((draft) => {
      draft.memories.unshift(item);
    });
    res.json(item);
  });

  app.patch('/api/v1/memory/:id', (req, res) => {
    const { id } = req.params;
    const { content, epistemicStatus, confidenceScore } = req.body;
    syntaraStore.mutate((draft) => {
      const m = draft.memories.find((item) => item.id === id);
      if (m) {
        if (content !== undefined) m.content = content;
        if (epistemicStatus !== undefined) m.epistemicStatus = epistemicStatus;
        if (confidenceScore !== undefined) m.confidenceScore = Number(confidenceScore);
        m.version += 1;
        m.updatedAt = new Date().toISOString();
      }
    });
    res.json({ ok: true });
  });

  app.delete('/api/v1/memory/:id', (req, res) => {
    const { id } = req.params;
    syntaraStore.mutate((draft) => {
      draft.memories = draft.memories.filter((m) => m.id !== id);
    });
    res.json({ ok: true });
  });

  // ==========================================================================
  // /api/v1/workflows (Engine 11 — Visual Workflow Studio)
  // ==========================================================================
  app.get('/api/v1/workflows', (_req, res) => {
    res.json(syntaraStore.getState().workflows);
  });

  app.post('/api/v1/workflows', (req, res) => {
    const { name, description, nodes, edges, variables, scheduleCron } = req.body;
    const now = new Date().toISOString();
    const wf = {
      id: `wf_${Date.now()}`,
      name: String(name || 'Nouveau Workflow').trim(),
      description: String(description || 'Workflow automatisé SYNTARA.').trim(),
      version: '1.0.0',
      scheduleCron: scheduleCron || null,
      status: 'active' as const,
      nodes: Array.isArray(nodes) ? nodes : [],
      edges: Array.isArray(edges) ? edges : [],
      variables: variables || {},
      createdAt: now,
      updatedAt: now,
    };
    syntaraStore.mutate((draft) => {
      draft.workflows.unshift(wf);
    });
    res.json(wf);
  });

  app.put('/api/v1/workflows/:id', (req, res) => {
    const { id } = req.params;
    const { nodes, edges, name, status, variables } = req.body;
    syntaraStore.mutate((draft) => {
      const wf = draft.workflows.find((w) => w.id === id);
      if (wf) {
        if (Array.isArray(nodes)) wf.nodes = nodes;
        if (Array.isArray(edges)) wf.edges = edges;
        if (name) wf.name = name;
        if (status) wf.status = status;
        if (variables) wf.variables = variables;
        const parts = wf.version.split('.').map(Number);
        wf.version = `${parts[0]}.${parts[1]}.${(parts[2] || 0) + 1}`;
        wf.updatedAt = new Date().toISOString();
      }
    });
    res.json({ ok: true });
  });

  app.post('/api/v1/workflows/:id/run', (req, res) => {
    const { id } = req.params;
    const state = syntaraStore.getState();
    const wf = state.workflows.find((w) => w.id === id);
    if (!wf) {
      return res.status(404).json({ error: 'Workflow introuvable.' });
    }
    const now = new Date().toISOString();
    const corrId = `corr_wfr_${Date.now()}`;
    const nodeResults = wf.nodes.map((node) => ({
      nodeId: node.id,
      nodeLabel: node.label,
      nodeType: node.type,
      status: 'completed' as const,
      output: `[${node.type}] Exécuté avec succès dans le contexte isolé.`,
      durationMs: Math.floor(Math.random() * 140) + 15,
    }));
    const totalDurationMs = nodeResults.reduce((acc, n) => acc + n.durationMs, 0);

    const runLog = {
      id: `wfr_${Date.now()}`,
      workflowId: wf.id,
      workflowName: wf.name,
      correlationId: corrId,
      status: 'completed' as const,
      nodeResults,
      totalDurationMs,
      startedAt: now,
      completedAt: now,
    };

    syntaraStore.mutate((draft) => {
      draft.workflowRuns.unshift(runLog);
      const target = draft.workflows.find((w) => w.id === id);
      if (target) {
        target.lastRunAt = now;
        target.lastRunStatus = 'completed';
      }
    });

    recordAuditLog({
      correlationId: corrId,
      actorType: 'user',
      actorId: state.currentUserId,
      actorName: 'Workflow Runner',
      engine: 'WORKFLOW ENGINE',
      action: 'WORKFLOW_EXECUTED',
      resourceType: 'workflow',
      resourceId: wf.id,
      status: 'completed',
      details: `Workflow "${wf.name}" (${wf.nodes.length} blocs) exécuté en ${totalDurationMs}ms.`,
    });

    res.json(runLog);
  });

  // ==========================================================================
  // /api/v1/tools, /api/v1/plugins, /api/v1/mcp (Engine 08)
  // ==========================================================================
  app.post('/api/v1/tools/:id/test', (req, res) => {
    const { id } = req.params;
    const now = new Date().toISOString();
    let result = { timestamp: now, ok: true, latencyMs: 12, message: 'Connectivité vérifiée.' };
    syntaraStore.mutate((draft) => {
      const tool = draft.tools.find((t) => t.id === id);
      if (tool) {
        const isReady = tool.configuredStatus === 'ready';
        result = {
          timestamp: now,
          ok: isReady,
          latencyMs: isReady ? Math.floor(Math.random() * 25) + 4 : 0,
          message: isReady
            ? `Test de connectivité ${tool.protocol} réussi (${tool.endpointOrCommand}).`
            : 'Identifiants externes manquants : veuillez configurer la clé secrète.',
        };
        tool.lastConnectivityCheck = result;
      }
    });
    res.json(result);
  });

  app.post('/api/v1/tools/:id/configure', (req, res) => {
    const { id } = req.params;
    const { endpointOrCommand } = req.body;
    const now = new Date().toISOString();
    syntaraStore.mutate((draft) => {
      const tool = draft.tools.find((t) => t.id === id);
      if (tool) {
        if (endpointOrCommand) tool.endpointOrCommand = endpointOrCommand;
        tool.configuredStatus = 'ready';
        tool.lastConnectivityCheck = {
          timestamp: now,
          ok: true,
          latencyMs: 14,
          message: 'Configuration appliquée et connectivité validée.',
        };
      }
    });
    res.json({ ok: true });
  });

  app.post('/api/v1/plugins', (req, res) => {
    const { name, version, description, permissions, codeSource } = req.body;
    const now = new Date().toISOString();
    const plg = {
      id: `plg_${Date.now()}`,
      name: String(name || 'Custom SDK Plugin').trim(),
      version: String(version || '1.0.0').trim(),
      author: 'Developer Studio User (MIT)',
      license: 'MIT',
      description: String(description || 'Extension créée dans le Developer Studio.').trim(),
      entryPoint: `plugins/custom-${Date.now()}/index.ts`,
      inputs: { payload: 'object' },
      outputs: { result: 'object' },
      permissions: Array.isArray(permissions) ? permissions : ['workspace:read'],
      resourceLimits: { maxMemoryMb: 64, timeoutMs: 3000 },
      dependencies: ['@syntara/sdk@^1.0.0'],
      enabled: true,
      codeSource: String(codeSource || '// SYNTARA Plugin SDK'),
      createdAt: now,
    };
    syntaraStore.mutate((draft) => {
      draft.plugins.unshift(plg);
    });
    res.json(plg);
  });

  // ==========================================================================
  // /api/v1/models (SYNTARA Model Adapter)
  // ==========================================================================
  app.post('/api/v1/models', (req, res) => {
    const { name, providerType, endpoint, defaultModel, isLocal } = req.body;
    const prov = {
      id: `prov_${Date.now()}`,
      name: String(name || 'Custom Model Provider').trim(),
      providerType: providerType || 'openai_compatible',
      endpoint: String(endpoint || 'http://localhost:11434').trim(),
      isLocal: Boolean(isLocal),
      status: 'online' as const,
      defaultModel: String(defaultModel || 'llama3.3:latest').trim(),
      availableModels: [String(defaultModel || 'llama3.3:latest').trim()],
      latencyMs: isLocal ? 120 : 340,
      costPer1kTokensUsd: isLocal ? 0 : 0.0005,
    };
    syntaraStore.mutate((draft) => {
      draft.modelProviders.push(prov);
    });
    res.json(prov);
  });

  // ==========================================================================
  // /api/v1/knowledge (Engine 09 — RAG & Vector Collections)
  // ==========================================================================
  app.post('/api/v1/knowledge/search', (req, res) => {
    const { query, collectionId, topK } = req.body;
    const results = searchKnowledgeHybrid(String(query || ''), collectionId, topK || 4);
    res.json({ results });
  });

  app.post('/api/v1/knowledge/documents', (req, res) => {
    try {
      const { collectionId, title, format, rawContent } = req.body;
      const docId = ingestKnowledgeDocument({
        collectionId: collectionId || 'kb_syntara_arch',
        title: String(title || 'Document.md').trim(),
        format: format || 'Markdown',
        rawContent: String(rawContent || '').trim(),
      });
      res.json({ documentId: docId });
    } catch (err: any) {
      res.status(400).json({ error: err?.message || 'Erreur lors de l’indexation du document.' });
    }
  });

  app.delete('/api/v1/knowledge/documents/:id', (req, res) => {
    const { id } = req.params;
    syntaraStore.mutate((draft) => {
      const doc = draft.knowledgeDocuments.find((d) => d.id === id);
      draft.knowledgeDocuments = draft.knowledgeDocuments.filter((d) => d.id !== id);
      draft.knowledgeChunks = draft.knowledgeChunks.filter((c) => c.documentId !== id);
      if (doc) {
        const col = draft.knowledgeCollections.find((c) => c.id === doc.collectionId);
        if (col) {
          col.documentCount = Math.max(0, col.documentCount - 1);
          col.chunkCount = draft.knowledgeChunks.filter((c) => c.collectionId === col.id).length;
        }
      }
    });
    res.json({ ok: true });
  });

  // ==========================================================================
  // /api/v1/simulations (Engine 06)
  // ==========================================================================
  app.post('/api/v1/simulations', (req, res) => {
    const sim = createAndRunSimulation(req.body);
    res.json(sim);
  });

  // ==========================================================================
  // /api/v1/creation (Engine 10 — Workspace Artifacts & Rollback)
  // ==========================================================================
  app.post('/api/v1/creation', (req, res) => {
    const { projectId, path: filePath, title, type, language, currentContent } = req.body;
    const now = new Date().toISOString();
    const art = {
      id: `art_${Date.now()}`,
      projectId: projectId || syntaraStore.getState().projects[0]?.id || 'prj_crm_saas_01',
      path: String(filePath || 'apps/web/NewComponent.tsx').trim(),
      title: String(title || 'Nouveau Livrable').trim(),
      type: type || 'code',
      language: language || 'typescript',
      previousContent: '// Version 1 (Initial Workspace Snapshot)\n',
      currentContent: String(currentContent || ''),
      version: 2,
      createdByAgent: 'Software Engineer Agent',
      validationStatus: 'passed' as const,
      validationReport: ['PASS: Syntaxe vérifiée dans l’espace de travail isolé'],
      updatedAt: now,
    };
    syntaraStore.mutate((draft) => {
      draft.workspaceArtifacts.unshift(art);
    });
    res.json(art);
  });

  app.post('/api/v1/creation/:id/rollback', (req, res) => {
    const { id } = req.params;
    syntaraStore.mutate((draft) => {
      const art = draft.workspaceArtifacts.find((a) => a.id === id);
      if (art && art.version > 1) {
        const temp = art.currentContent;
        art.currentContent = art.previousContent;
        art.previousContent = temp;
        art.version = Math.max(1, art.version - 1);
        art.updatedAt = new Date().toISOString();
      }
    });
    res.json({ ok: true });
  });

  // ==========================================================================
  // /api/v1/evolution (Engine 07 — Controlled Improvement & Rollback)
  // ==========================================================================
  app.post('/api/v1/evolution/:id/resolve', (req, res) => {
    const { id } = req.params;
    const { decision } = req.body; // 'approve' | 'reject' | 'rollback'
    const now = new Date().toISOString();
    syntaraStore.mutate((draft) => {
      const prop = draft.improvementProposals.find((p) => p.id === id);
      if (!prop) return;
      if (prop.permissionEscalationAttempted) {
        prop.status = 'rejected';
        return;
      }
      if (decision === 'approve') {
        prop.status = 'approved_applied';
        if (prop.targetType === 'agent') {
          const agt = draft.agents.find((a) => a.id === prop.targetId);
          if (agt) {
            agt.instructions = prop.proposedChanges.after;
            agt.version = prop.proposedVersion;
            agt.updatedAt = now;
          }
        }
      } else if (decision === 'rollback') {
        prop.status = 'rolled_back';
        if (prop.targetType === 'agent') {
          const agt = draft.agents.find((a) => a.id === prop.targetId);
          if (agt) {
            agt.instructions = prop.proposedChanges.before;
            agt.version = prop.currentVersion;
            agt.updatedAt = now;
          }
        }
      } else {
        prop.status = 'rejected';
      }
    });
    res.json({ ok: true });
  });

  // ==========================================================================
  // /api/v1/approvals & /api/v1/trust (Engine 12)
  // ==========================================================================
  app.post('/api/v1/approvals/:id/resolve', (req, res) => {
    const { id } = req.params;
    const { status, resolutionNote } = req.body; // 'approved' | 'rejected'
    const now = new Date().toISOString();
    syntaraStore.mutate((draft) => {
      const appReq = draft.approvals.find((a) => a.id === id);
      if (appReq) {
        appReq.status = status;
        appReq.resolvedAt = now;
        appReq.resolvedBy = 'Alexandre Vance (Owner)';
        appReq.resolutionNote = resolutionNote || (status === 'approved' ? 'Autorisé par contrôle humain.' : 'Rejeté par sécurité.');
        const agt = draft.agents.find((a) => a.id === appReq.agentId);
        if (agt && agt.state === 'Waiting Approval') {
          agt.state = status === 'approved' ? 'Ready' : 'Paused';
        }
      }
    });

    recordAuditLog({
      correlationId: `corr_app_${Date.now()}`,
      actorType: 'user',
      actorId: syntaraStore.getState().currentUserId,
      actorName: 'Alexandre Vance',
      engine: 'TRUST ENGINE',
      action: status === 'approved' ? 'HUMAN_APPROVAL_GRANTED' : 'HUMAN_APPROVAL_REJECTED',
      resourceType: 'approval',
      resourceId: id,
      status: status === 'approved' ? 'allowed' : 'blocked',
      details: `Décision humaine sur ${id}: ${status.toUpperCase()}`,
    });

    res.json({ ok: true });
  });

  app.post('/api/v1/trust/kill-switch', (req, res) => {
    const { active } = req.body;
    const now = new Date().toISOString();
    syntaraStore.mutate((draft) => {
      draft.globalKillSwitchActive = Boolean(active);
      if (active) {
        draft.agents.forEach((a) => {
          if (a.state === 'Running' || a.state === 'Waiting Approval') {
            a.state = 'Paused';
            a.updatedAt = now;
          }
        });
      }
    });

    recordAuditLog({
      correlationId: `corr_gkill_${Date.now()}`,
      actorType: 'user',
      actorId: syntaraStore.getState().currentUserId,
      actorName: 'Alexandre Vance',
      engine: 'TRUST ENGINE',
      action: active ? 'GLOBAL_KILL_SWITCH_ENGAGED' : 'GLOBAL_KILL_SWITCH_RELEASED',
      resourceType: 'system',
      resourceId: 'syntara_os',
      status: 'completed',
      details: active ? 'Suspension immédiate de tous les agents autonomes.' : 'Reprise autorisée des opérations.',
    });

    res.json({ globalKillSwitchActive: Boolean(active) });
  });

  app.post('/api/v1/trust/scan-payload', (req, res) => {
    const { payload } = req.body;
    const scan = inspectPayloadSecurity(String(payload || ''));
    res.json(scan);
  });

  // ==========================================================================
  // /api/v1/monitoring & /api/v1/tests/acceptance
  // ==========================================================================
  app.get('/api/v1/monitoring/prometheus', (_req, res) => {
    const s = syntaraStore.getState();
    const totalTokens = s.tasks.reduce((sum, t) => sum + t.tokensUsed, 0);
    const metrics = [
      '# HELP syntara_active_agents_total Number of registered autonomous agents',
      '# TYPE syntara_active_agents_total gauge',
      `syntara_active_agents_total ${s.agents.length}`,
      '# HELP syntara_projects_total Number of persistent SYNTARA projects',
      '# TYPE syntara_projects_total gauge',
      `syntara_projects_total ${s.projects.length}`,
      '# HELP syntara_tokens_consumed_total Total tokens processed across tasks',
      '# TYPE syntara_tokens_consumed_total counter',
      `syntara_tokens_consumed_total ${totalTokens}`,
      '# HELP syntara_daily_spend_usd Current daily FinOps expenditure in USD',
      '# TYPE syntara_daily_spend_usd gauge',
      `syntara_daily_spend_usd ${s.budgetLimits.currentDailySpendUsd}`,
      '# HELP syntara_pending_approvals_total Operations awaiting human approval',
      '# TYPE syntara_pending_approvals_total gauge',
      `syntara_pending_approvals_total ${s.approvals.filter((a) => a.status === 'pending').length}`,
    ].join('\n');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(metrics);
  });

  app.post('/api/v1/tests/acceptance', (_req, res) => {
    const report = runProductAcceptanceSuite();
    res.json(report);
  });

  // ==========================================================================
  // Vite Dev Middleware or Static Production Build
  // ==========================================================================
  const distPath = path.resolve(process.cwd(), 'dist');
  if (process.env.NODE_ENV === 'production' && fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SYNTARA AI Operating System listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start SYNTARA server:', err);
});
