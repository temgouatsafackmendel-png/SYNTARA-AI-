-- ============================================================================
-- SYNTARA AI — Universal Autonomous Intelligence Operating System
-- Migration 001: Complete Relational Schema (PostgreSQL 16 + pgvector)
-- Covers all 33 required tables, foreign keys, indexes & RLS tenant isolation
-- License: MIT
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 1. organizations
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(128) NOT NULL UNIQUE,
  daily_budget_usd NUMERIC(10, 2) NOT NULL DEFAULT 25.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. roles
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(64) NOT NULL,
  description TEXT,
  UNIQUE(organization_id, name)
);

-- 4. permissions
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(128) NOT NULL UNIQUE,
  engine VARCHAR(64) NOT NULL,
  description TEXT NOT NULL
);

-- 5. memberships
CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, organization_id)
);

-- 6. model_providers (SYNTARA Model Adapter)
CREATE TABLE model_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(128) NOT NULL,
  provider_type VARCHAR(64) NOT NULL, -- 'gemini', 'ollama', 'litellm', 'huggingface', 'openai_compatible'
  endpoint_url TEXT NOT NULL,
  is_local BOOLEAN NOT NULL DEFAULT FALSE,
  encrypted_api_key BYTEA, -- Never stored in plaintext
  status VARCHAR(32) NOT NULL DEFAULT 'standby',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. model_configurations
CREATE TABLE model_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES model_providers(id) ON DELETE CASCADE,
  model_identifier VARCHAR(128) NOT NULL,
  context_window INTEGER NOT NULL DEFAULT 64000,
  cost_per_1k_tokens_usd NUMERIC(10, 6) NOT NULL DEFAULT 0.0,
  is_default BOOLEAN NOT NULL DEFAULT FALSE
);

-- 8. projects (Central Object: SYNTARA PROJECT)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  original_intent TEXT NOT NULL,
  intent_schema JSONB NOT NULL, -- Standardized SYNTARA Intent Schema
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_projects_org_status ON projects(organization_id, status);

-- 9. project_members
CREATE TABLE project_members (
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  access_level VARCHAR(32) NOT NULL DEFAULT 'contributor',
  PRIMARY KEY (project_id, user_id)
);

-- 10. agents (Engine 03 — Autonomous Agent Engine)
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(128) NOT NULL,
  role VARCHAR(128) NOT NULL,
  description TEXT,
  mission TEXT NOT NULL,
  instructions TEXT NOT NULL,
  model_config_id UUID REFERENCES model_configurations(id),
  autonomy_level VARCHAR(32) NOT NULL CHECK (autonomy_level IN ('ASSISTED', 'SUPERVISED', 'AUTONOMOUS')),
  execution_state VARCHAR(32) NOT NULL DEFAULT 'Ready',
  max_tokens_per_run INTEGER NOT NULL DEFAULT 32000,
  max_cost_usd_per_run NUMERIC(8, 4) NOT NULL DEFAULT 1.0000,
  current_version VARCHAR(32) NOT NULL DEFAULT '1.0.0',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. agent_versions
CREATE TABLE agent_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  version VARCHAR(32) NOT NULL,
  instructions TEXT NOT NULL,
  autonomy_level VARCHAR(32) NOT NULL,
  changelog TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. tools (Engine 08 — Universal Tool Fabric)
CREATE TABLE tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(128) NOT NULL,
  slug VARCHAR(128) NOT NULL UNIQUE,
  protocol VARCHAR(32) NOT NULL, -- 'MCP', 'REST_API', 'WEBHOOK', 'PLUGIN', 'LOCAL_SANDBOX'
  endpoint_or_command TEXT NOT NULL,
  input_schema JSONB NOT NULL,
  output_schema JSONB NOT NULL,
  configured_status VARCHAR(32) NOT NULL DEFAULT 'ready',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. agent_tools
CREATE TABLE agent_tools (
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  PRIMARY KEY (agent_id, tool_id)
);

-- 14. agent_permissions
CREATE TABLE agent_permissions (
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (agent_id, permission_id)
);

-- 15. conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  mode VARCHAR(32) NOT NULL DEFAULT 'project',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role VARCHAR(32) NOT NULL,
  content TEXT NOT NULL,
  model_used VARCHAR(128),
  tokens_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. memories (Engine 05 — 6-Layer Memory Engine)
CREATE TABLE memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  layer VARCHAR(64) NOT NULL, -- Working, Conversation, Project, Long-Term, Knowledge, Agent
  memory_key VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  epistemic_status VARCHAR(32) NOT NULL CHECK (epistemic_status IN ('verified_fact', 'model_hypothesis', 'user_directive', 'external_citation')),
  confidence_score NUMERIC(4, 3) NOT NULL CHECK (confidence_score BETWEEN 0 AND 1),
  version INTEGER NOT NULL DEFAULT 1,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 18. memory_sources
CREATE TABLE memory_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id UUID NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  source_type VARCHAR(64) NOT NULL,
  source_reference TEXT NOT NULL,
  verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 19. tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  assigned_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(32) NOT NULL DEFAULT 'queued',
  priority VARCHAR(32) NOT NULL DEFAULT 'medium',
  output_summary TEXT,
  tokens_used INTEGER NOT NULL DEFAULT 0,
  cost_usd NUMERIC(10, 5) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 20. task_dependencies
CREATE TABLE task_dependencies (
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  depends_on_task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, depends_on_task_id)
);

-- 21. executions
CREATE TABLE executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  correlation_id VARCHAR(128) NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  state VARCHAR(32) NOT NULL,
  tokens_used INTEGER NOT NULL DEFAULT 0,
  cost_usd NUMERIC(10, 5) NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_executions_correlation ON executions(correlation_id);

-- 22. execution_steps
CREATE TABLE execution_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id UUID NOT NULL REFERENCES executions(id) ON DELETE CASCADE,
  step_index INTEGER NOT NULL,
  action_description TEXT NOT NULL,
  tool_id UUID REFERENCES tools(id),
  status VARCHAR(32) NOT NULL,
  output_summary TEXT,
  duration_ms INTEGER NOT NULL DEFAULT 0
);

-- 23. approvals (Engine 12 — Trust Engine Human Control)
CREATE TABLE approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  correlation_id VARCHAR(128) NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  operation_type VARCHAR(64) NOT NULL,
  severity VARCHAR(32) NOT NULL,
  proposed_payload JSONB NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  resolved_by UUID REFERENCES users(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 24. workflows (Engine 11 — Workflow Engine)
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  current_version VARCHAR(32) NOT NULL DEFAULT '1.0.0',
  schedule_cron VARCHAR(64),
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 25. workflow_versions
CREATE TABLE workflow_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  version VARCHAR(32) NOT NULL,
  graph_definition JSONB NOT NULL, -- Nodes, edges, variables
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 26. workflow_runs
CREATE TABLE workflow_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  correlation_id VARCHAR(128) NOT NULL,
  status VARCHAR(32) NOT NULL,
  node_results JSONB NOT NULL,
  total_duration_ms INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 27. plugins
CREATE TABLE plugins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(128) NOT NULL,
  version VARCHAR(32) NOT NULL,
  manifest JSONB NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 28. mcp_servers
CREATE TABLE mcp_servers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(128) NOT NULL,
  transport VARCHAR(32) NOT NULL,
  url_or_command TEXT NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'connected',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 29. knowledge_bases (Engine 09 — Knowledge Engine)
CREATE TABLE knowledge_bases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  embedding_model VARCHAR(128) NOT NULL,
  vector_dimension INTEGER NOT NULL DEFAULT 768,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 30. documents
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  knowledge_base_id UUID NOT NULL REFERENCES knowledge_bases(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  format VARCHAR(32) NOT NULL,
  raw_content TEXT NOT NULL,
  indexed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 31. document_chunks & 32. embeddings (pgvector)
CREATE TABLE document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  token_count INTEGER NOT NULL
);

CREATE TABLE embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chunk_id UUID NOT NULL REFERENCES document_chunks(id) ON DELETE CASCADE,
  embedding vector(768) NOT NULL
);

CREATE INDEX idx_embeddings_hnsw ON embeddings USING hnsw (embedding vector_cosine_ops);

-- 33. simulations & 34. simulation_scenarios (Engine 06)
CREATE TABLE simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  dataset_used TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE simulation_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  simulation_id UUID NOT NULL REFERENCES simulations(id) ON DELETE CASCADE,
  scenario_type VARCHAR(32) NOT NULL CHECK (scenario_type IN ('Conservative', 'Balanced', 'Optimistic')),
  hypotheses JSONB NOT NULL,
  projected_metrics JSONB NOT NULL,
  identified_risks JSONB NOT NULL
);

-- 35. improvement_proposals (Engine 07 — Evolution Engine)
CREATE TABLE improvement_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type VARCHAR(32) NOT NULL,
  target_id UUID NOT NULL,
  current_version VARCHAR(32) NOT NULL,
  proposed_version VARCHAR(32) NOT NULL,
  proposed_changes JSONB NOT NULL,
  ab_test_results JSONB NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'pending_approval',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 36. audit_logs, 37. notifications, 38. usage_records, 39. api_keys
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  correlation_id VARCHAR(128) NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  actor_type VARCHAR(32) NOT NULL,
  actor_id VARCHAR(128) NOT NULL,
  engine VARCHAR(64) NOT NULL,
  action VARCHAR(128) NOT NULL,
  resource_type VARCHAR(64) NOT NULL,
  resource_id VARCHAR(128) NOT NULL,
  status VARCHAR(32) NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  severity VARCHAR(32) NOT NULL DEFAULT 'info',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE usage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  model_identifier VARCHAR(128) NOT NULL,
  tokens_used INTEGER NOT NULL,
  cost_usd NUMERIC(10, 6) NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(128) NOT NULL,
  key_prefix VARCHAR(16) NOT NULL,
  key_hash TEXT NOT NULL, -- SHA-256 hash, never plaintext
  scopes JSONB NOT NULL,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
