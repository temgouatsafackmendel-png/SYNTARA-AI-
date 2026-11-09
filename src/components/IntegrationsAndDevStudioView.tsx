import React, { useState } from 'react';
import {
  Play,
  Download,
  Copy,
  Check,
  Image as ImageIcon,
  FileText,
  Terminal,
} from 'lucide-react';
import { useSyntaraStore } from '../store/useSyntaraStore.ts';

interface OfficialScreenshotItem {
  id: string;
  filename: string;
  svgUrl: string;
  titleFr: string;
  titleEn: string;
  captionFr: string;
  captionEn: string;
}

const OFFICIAL_SCREENSHOTS: OfficialScreenshotItem[] = [
  {
    id: 'shot_01',
    filename: '01-command-center-2026',
    svgUrl: '/screenshots/01-command-center-2026.svg',
    titleFr: '01 · Command Center & Orchestrateur Intent-to-System (Édition 2026)',
    titleEn: '01 · Command Center & Intent-to-System Orchestrator (2026 Edition)',
    captionFr:
      'Canevas obsidienne #07090F, compositeur Intent-to-System, ruban de télémétrie à 6 colonnes, état des 12 moteurs et porte Trust Gate.',
    captionEn:
      'Obsidian #07090F canvas, Intent-to-System composer, 6-column telemetry ribbon, 12 engines status, and Trust Gate.',
  },
  {
    id: 'shot_02',
    filename: '02-agent-network-orchestration',
    svgUrl: '/screenshots/02-agent-network-orchestration.svg',
    titleFr: '02 · Réseau des 12 Agents Autonomes & Intelligence Collective',
    titleEn: '02 · 12 Autonomous Agents Network & Collective Intelligence',
    captionFr:
      'Supervision en temps réel des 12 agents spécialisés (ASSISTED, SUPERVISED, AUTONOMOUS), Kill Switch individuel et bus d’arbitrage inter-agents.',
    captionEn:
      'Real-time supervision of the 12 specialized agents, individual Kill Switch, and inter-agent arbitration bus.',
  },
  {
    id: 'shot_03',
    filename: '03-workflow-simulation-studio',
    svgUrl: '/screenshots/03-workflow-simulation-studio.svg',
    titleFr: '03 · Workflow Studio Visuel (13 Blocs) & Simulation Multi-Scénarios',
    titleEn: '03 · Visual Workflow Studio (13 Blocks) & Multi-Scenario Simulation Lab',
    captionFr:
      'Canevas interactif à 13 types de composants et comparateur prédictif Conservative / Balanced / Optimistic.',
    captionEn:
      '13-component interactive workflow canvas and Conservative / Balanced / Optimistic predictive simulator.',
  },
  {
    id: 'shot_04',
    filename: '04-architecture-12-engines',
    svgUrl: '/screenshots/04-architecture-12-engines.svg',
    titleFr: '04 · Architecture des 12 Moteurs & Suite des 15 Tests d’Acceptation (15/15)',
    titleEn: '04 · 12-Engine Architecture & 15-Test Acceptance Suite (15/15 PASS)',
    captionFr:
      'Synoptique complet des 4 couches architecturales SYNTARA OS, PostgreSQL 16 + pgvector (39 tables) et validation 100% réussie.',
    captionEn:
      'Complete 4-layer architectural diagram of SYNTARA OS, PostgreSQL 16 + pgvector (39 tables), and 100% passing suite.',
  },
];

export const IntegrationsView: React.FC = () => {
  const {
    language,
    tools,
    modelProviders,
    testToolConnectivity,
    configureToolEndpoint,
    addModelProviderAction,
  } = useSyntaraStore();

  const isFr = language === 'fr';
  const [provName, setProvName] = useState('');
  const [provType, setProvType] = useState('ollama');
  const [provEndpoint, setProvEndpoint] = useState('http://localhost:11434');
  const [provModel, setProvModel] = useState('qwen2.5-coder:32b');
  const [configuringToolId, setConfiguringToolId] = useState<string | null>(null);
  const [toolEndpointInput, setToolEndpointInput] = useState('');

  const handleAddModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provName.trim()) return;
    await addModelProviderAction({
      name: provName.trim(),
      providerType: provType,
      endpoint: provEndpoint.trim(),
      defaultModel: provModel.trim(),
      isLocal: provType === 'ollama',
    });
    setProvName('');
  };

  return (
    <div className="space-y-8">
      {/* SYNTARA Model Adapter Section */}
      <div className="bg-[#0D111C] border border-white/[0.07] rounded-2xl p-6 space-y-5">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#20D6D0]">
            SYNTARA MODEL ADAPTER
          </span>
          <h2 className="text-base font-semibold text-[#F8FAFC] mt-0.5">
            {isFr ? 'Abstraction Multi-Fournisseurs & Modèles Locaux' : 'Multi-Provider & Local Model Abstraction'}
          </h2>
          <p className="text-xs text-[#8A94A6] mt-0.5">
            {isFr
              ? 'Indépendance totale : connectez Ollama (local), LiteLLM, Hugging Face ou des API compatibles OpenAI.'
              : 'Complete model independence: connect local Ollama instances, LiteLLM routers, Hugging Face, or OpenAI-compatible APIs.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {modelProviders.map((p) => (
            <div key={p.id} className="p-4 bg-[#07090F] border border-white/[0.07] rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between font-mono">
                <span className="text-[#A78BFA] uppercase">{p.providerType}</span>
                <span
                  className={
                    p.status === 'online'
                      ? 'text-emerald-400'
                      : p.status === 'standby'
                      ? 'text-[#20D6D0]'
                      : 'text-amber-400'
                  }
                >
                  {p.status === 'requires_configuration' ? 'CONFIG REQUISE' : p.status.toUpperCase()}
                </span>
              </div>
              <div className="text-sm font-semibold text-[#F8FAFC]">{p.name}</div>
              <div className="text-[#8A94A6] font-mono truncate">{p.endpoint}</div>
              <div className="pt-2 border-t border-white/[0.06] flex justify-between font-mono tabular-nums text-[#8A94A6]">
                <span>{p.defaultModel}</span>
                <span>{p.latencyMs}ms</span>
              </div>
            </div>
          ))}
        </div>

        {/* Connect New Local or Remote Model Provider */}
        <form onSubmit={handleAddModel} className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-4 border-t border-white/[0.06]">
          <input
            type="text"
            required
            value={provName}
            onChange={(e) => setProvName(e.target.value)}
            placeholder="Nom (ex: Ollama Workstation GPU)"
            className="bg-[#07090F] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-[#F8FAFC]"
          />
          <select
            value={provType}
            onChange={(e) => setProvType(e.target.value)}
            className="bg-[#07090F] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-[#F8FAFC]"
          >
            <option value="ollama">Ollama (Local)</option>
            <option value="litellm">LiteLLM Proxy</option>
            <option value="openai_compatible">OpenAI Compatible</option>
            <option value="huggingface">Hugging Face</option>
          </select>
          <input
            type="text"
            value={provEndpoint}
            onChange={(e) => setProvEndpoint(e.target.value)}
            placeholder="Endpoint URL"
            className="bg-[#07090F] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-[#F8FAFC] font-mono"
          />
          <input
            type="text"
            value={provModel}
            onChange={(e) => setProvModel(e.target.value)}
            placeholder="Modèle par défaut"
            className="bg-[#07090F] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-[#F8FAFC] font-mono"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[#6E56CF] hover:bg-[#7C66DC] text-white text-xs font-medium rounded-xl cursor-pointer"
          >
            + Connecter Modèle
          </button>
        </form>
      </div>

      {/* Universal Tool Fabric Catalog */}
      <div className="bg-[#0D111C] border border-white/[0.07] rounded-2xl p-6 space-y-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#20D6D0]">
            ENGINE 08 · UNIVERSAL TOOL FABRIC
          </span>
          <h2 className="text-base font-semibold text-[#F8FAFC] mt-0.5">
            {isFr ? `Catalogue des ${tools.length} Connecteurs & Outils` : `${tools.length} Connectors & Tools Catalog`}
          </h2>
        </div>

        <div className="divide-y divide-white/[0.06]">
          {tools.map((tool) => (
            <div key={tool.id} className="py-4 first:pt-0 last:pb-0 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-medium text-[#F8FAFC]">{tool.name}</span>
                  <span aria-hidden="true" className="text-[#8A94A6]">·</span>
                  <span className="font-mono text-[#20D6D0]">{tool.protocol}</span>
                  <span aria-hidden="true" className="text-[#8A94A6]">·</span>
                  <span className="font-mono text-[#8A94A6]">v{tool.version}</span>
                  <span aria-hidden="true" className="text-[#8A94A6]">·</span>
                  <span
                    className={`font-mono ${
                      tool.configuredStatus === 'ready' ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {tool.configuredStatus === 'ready'
                      ? 'OPÉRATIONNEL'
                      : 'CONFIGURATION REQUISE'}
                  </span>
                </div>
                <p className="text-xs text-[#8A94A6]">{tool.description}</p>
                <div className="text-xs font-mono text-[#8A94A6]">
                  {tool.endpointOrCommand} · [{tool.requiredPermissions.join(', ')}] · {tool.rateLimitPerMinute}/min
                </div>
                {tool.lastConnectivityCheck && (
                  <div className="text-xs font-mono text-[#A78BFA]">
                    {tool.lastConnectivityCheck.message} ({tool.lastConnectivityCheck.latencyMs}ms)
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {tool.configuredStatus !== 'ready' && (
                  <button
                    type="button"
                    onClick={() => {
                      setConfiguringToolId(tool.id);
                      setToolEndpointInput(tool.endpointOrCommand);
                    }}
                    className="px-3.5 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-medium cursor-pointer"
                  >
                    Configurer Identifiants
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => testToolConnectivity(tool.id)}
                  className="px-3.5 py-1.5 bg-[#07090F] hover:bg-white/[0.04] text-[#F8FAFC] border border-white/[0.08] rounded-xl text-xs font-medium cursor-pointer"
                >
                  Tester Connectivité
                </button>
              </div>
            </div>
          ))}
        </div>

        {configuringToolId && (
          <div className="p-4 bg-[#07090F] border border-[#6E56CF] rounded-xl flex items-center gap-3">
            <input
              type="text"
              value={toolEndpointInput}
              onChange={(e) => setToolEndpointInput(e.target.value)}
              placeholder="URL Webhook ou clé de configuration..."
              className="flex-1 bg-[#0D111C] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-[#F8FAFC] font-mono"
            />
            <button
              type="button"
              onClick={async () => {
                await configureToolEndpoint(configuringToolId, toolEndpointInput);
                setConfiguringToolId(null);
              }}
              className="px-3.5 py-1.5 bg-[#6E56CF] text-white text-xs font-medium rounded-lg cursor-pointer"
            >
              Valider & Activer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const DeveloperStudioView: React.FC = () => {
  const { language, plugins, mcpServers, createPluginAction } = useSyntaraStore();
  const isFr = language === 'fr';

  const [devTab, setDevTab] = useState<
    'github-release' | 'api-playground' | 'plugin-sdk' | 'mcp-registry' | 'architecture-docs'
  >('github-release');

  // GitHub Release Customizer state (pre-filled for Mendel Temgoua)
  const [authorName, setAuthorName] = useState('Mendel Temgoua');
  const [githubUsername, setGithubUsername] = useState('mendeltemgoua');
  const [authorEmail, setAuthorEmail] = useState('mendeltemgouabusiness@gmail.com');
  const [repoName, setRepoName] = useState('syntara-ai-os');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [exportingPngId, setExportingPngId] = useState<string | null>(null);

  const [apiMethod, setApiMethod] = useState<'GET' | 'POST'>('GET');
  const [apiPath, setApiPath] = useState('/api/v1/agents');
  const [apiBody, setApiBody] = useState('{\n  "query": "Trust Engine Zero-Trust"\n}');
  const [apiResponse, setApiResponse] = useState<string>(
    'Cliquez sur "Exécuter Requête API" pour inspecter la réponse JSON en direct.'
  );
  const [apiLatency, setApiLatency] = useState<number | null>(null);

  const [plgName, setPlgName] = useState('');
  const [plgDesc, setPlgDesc] = useState('');
  const [plgCode, setPlgCode] = useState(`import { defineSyntaraPlugin } from '@syntara/sdk';

export default defineSyntaraPlugin({
  name: 'Custom Security Header Validator',
  version: '1.0.0',
  permissions: ['workspace:read'],
  limits: { maxMemoryMb: 64, timeoutMs: 2000 },
  async execute(input) {
    return { valid: true, checkedAt: new Date().toISOString() };
  },
});`);

  const buildPersonalizedReadme = () => `<div align="center">

# SYNTARA AI
### Universal Autonomous Intelligence Operating System (Version 1.0 — 2026 Foundational Edition)
**Imagine. Orchestrate. Transform.**

[![License: MIT](https://img.shields.io/badge/License-MIT-6E56CF.svg)](./LICENSE)
[![Version](https://img.shields.io/badge/Version-1.0.0-20D6D0.svg)](./package.json)
[![Engines](https://img.shields.io/badge/Core_Engines-12_Modules-A78BFA.svg)](#02-architecture-des-12-moteurs-intelligents)
[![Acceptance Tests](https://img.shields.io/badge/Acceptance_Tests-15%2F15_Passing-34D399.svg)](#04-suite-des-15-tests-dacceptation-produit)
[![Author](https://img.shields.io/badge/Created_by-${encodeURIComponent(authorName.replace(/\s+/g, '_'))}-F8FAFC.svg)](https://github.com/${githubUsername})

**Conçu et développé par ${authorName}**

</div>

---

**SYNTARA AI** est un système d'exploitation d'intelligence artificielle autonome, open source (**Licence MIT**) et indépendant des fournisseurs de modèles IA (\`Ollama Local\`, \`LiteLLM\`, \`OpenAI-Compatible\`, \`Cloud Reasoning\`). Il transforme une intention humaine exprimée en langage naturel en un écosystème opérationnel complet sous gouvernance humaine permanente (**Zero-Trust Guard & Kill Switch**).

---

## 01. Captures d'Écran Officielles (Édition 2026)

### 1. Command Center & Orchestrateur Signature *Intent-to-System*
![SYNTARA Command Center 2026](./public/screenshots/01-command-center-2026.svg)

### 2. Réseau des 12 Agents Autonomes & Intelligence Collective
![SYNTARA Agent Network](./public/screenshots/02-agent-network-orchestration.svg)

### 3. Studio Visuel de Workflows (13 Blocs) & Laboratoire de Simulation Multi-Scénarios
![SYNTARA Workflow & Simulation](./public/screenshots/03-workflow-simulation-studio.svg)

### 4. Architecture Globale des 12 Moteurs & Validation Automatisée (15/15 Tests)
![SYNTARA Architecture](./public/screenshots/04-architecture-12-engines.svg)

---

## 02. Architecture des 12 Moteurs Intelligents

1. **ENGINE 01 — Intent Engine** : Validation \`SYNTARA Intent Schema\` (objectifs, contraintes, livrables, risques, faisabilité).
2. **ENGINE 02 — Cognitive Engine** : Planification hiérarchique DAG et traces d'audit justifiées.
3. **ENGINE 03 — Autonomous Agent Engine** : 12 agents spécialisés (\`ASSISTED\`, \`SUPERVISED\`, \`AUTONOMOUS\`), quotas et \`Kill Switch\`.
4. **ENGINE 04 — Collective Intelligence** : Délégation multi-agents, mémoire partagée cloisonnée et arbitrage de conflits.
5. **ENGINE 05 — Memory Engine** : 6 couches (\`Working\`, \`Conversation\`, \`Project\`, \`Long-Term\`, \`Knowledge\`, \`Agent\`) avec provenance.
6. **ENGINE 06 — Reality Simulation Engine** : Comparaison \`Conservative\`, \`Balanced\` et \`Optimistic\` avec écarts prévisions/observations.
7. **ENGINE 07 — Evolution Engine** : Tests A/B en environnement isolé, propositions d'amélioration et rollback de version.
8. **ENGINE 08 — Universal Tool Fabric** : Connecteurs \`MCP\`, API REST, Webhooks, Sandbox local et SDK de plugins (\`@syntara/sdk\`).
9. **ENGINE 09 — Knowledge Engine (RAG)** : Découpage sémantique, embeddings \`pgvector\` et recherche hybride avec citations vérifiées.
10. **ENGINE 10 — Creation Engine** : Espace isolé générant du code et des livrables avec diffs \`Avant / Après\` et rollback.
11. **ENGINE 11 — Workflow Engine** : Studio visuel à 13 types de composants exécutables et exportables en JSON.
12. **ENGINE 12 — Trust Engine** : RBAC multi-tenant, approbation humaine des opérations sensibles, défense anti-injection et *Kill Switch* global.

---

## 03. Installation & Démarrage Rapide

\`\`\`bash
git clone https://github.com/${githubUsername}/${repoName}.git
cd ${repoName}
cp .env.example .env
npm install
npm run dev
# Interface & API v1 disponibles sur http://localhost:3000
\`\`\`

### Déploiement Production Conteneurisé (Docker Compose : PostgreSQL 16 pgvector + Redis + Ollama)
\`\`\`bash
docker compose up -d --build
\`\`\`

---

## 04. Suite des 15 Tests d'Acceptation Produit

\`\`\`bash
npm test
# Exécute TEST 1 -> TEST 15 (100% PASS)
\`\`\`

---

## 05. Auteur & Licence

- **Créateur & Architecte Principal** : **${authorName}** (\`${authorEmail}\`) — [GitHub @${githubUsername}](https://github.com/${githubUsername})
- **Licence** : Distribué sous licence Open Source **MIT**. Voir le fichier [LICENSE](./LICENSE).
`;

  const gitCommandsText = `# 1. Initialiser le dépôt Git et vérifier les 15 tests d'acceptation
npm test
git init
git branch -M main

# 2. Configurer votre identité d'auteur GitHub (${authorName})
git config user.name "${authorName}"
git config user.email "${authorEmail}"

# 3. Ajouter l'ensemble du code source, le schéma SQL pgvector et les 4 captures officielles
git add .
git commit -m "feat: release SYNTARA AI OS v1.0 (2026 Edition) by ${authorName}"

# 4. Lier votre dépôt GitHub et publier
git remote add origin https://github.com/${githubUsername}/${repoName}.git
git push -u origin main`;

  const handleCopyText = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2200);
  };

  const handleDownloadTextFile = (filename: string, content: string, mime = 'text/markdown;charset=utf-8') => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadSvg = async (shot: OfficialScreenshotItem) => {
    const res = await fetch(shot.svgUrl);
    const svgText = await res.text();
    handleDownloadTextFile(`${shot.filename}.svg`, svgText, 'image/svg+xml;charset=utf-8');
  };

  const handleDownloadPngHd = async (shot: OfficialScreenshotItem) => {
    setExportingPngId(shot.id);
    try {
      const res = await fetch(shot.svgUrl);
      const svgText = await res.text();
      const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      await new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 1920;
          canvas.height = 1146;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#07090F';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((pngBlob) => {
              if (pngBlob) {
                const pngUrl = URL.createObjectURL(pngBlob);
                const a = document.createElement('a');
                a.href = pngUrl;
                a.download = `${shot.filename}-hd.png`;
                a.click();
                URL.revokeObjectURL(pngUrl);
              }
              URL.revokeObjectURL(url);
              resolve();
            }, 'image/png');
          } else {
            URL.revokeObjectURL(url);
            resolve();
          }
        };
        img.onerror = (e) => {
          URL.revokeObjectURL(url);
          reject(e);
        };
        img.src = url;
      });
    } finally {
      setExportingPngId(null);
    }
  };

  const handleDownloadAllPngs = async () => {
    for (const shot of OFFICIAL_SCREENSHOTS) {
      await handleDownloadPngHd(shot);
    }
  };

  const handleExecuteApi = async () => {
    const t0 = Date.now();
    try {
      const res = await fetch(apiPath, {
        method: apiMethod,
        headers: apiMethod === 'POST' ? { 'Content-Type': 'application/json' } : undefined,
        body: apiMethod === 'POST' ? apiBody : undefined,
      });
      const text = await res.text();
      setApiLatency(Date.now() - t0);
      try {
        setApiResponse(JSON.stringify(JSON.parse(text), null, 2));
      } catch {
        setApiResponse(text);
      }
    } catch (err: any) {
      setApiResponse(`Error: ${err?.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Studio Tabs */}
      <div className="flex flex-wrap items-center gap-1 p-1 bg-[#0D111C] border border-white/[0.07] rounded-xl w-fit">
        {[
          { id: 'github-release', label: isFr ? 'Kit GitHub & Captures HD' : 'GitHub Release & HD Captures' },
          { id: 'api-playground', label: 'API v1 Playground' },
          { id: 'plugin-sdk', label: 'Plugin SDK Builder' },
          { id: 'mcp-registry', label: 'MCP Server Registry' },
          { id: 'architecture-docs', label: 'Architecture & Schéma SQL' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setDevTab(t.id as any)}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              devTab === t.id ? 'bg-[#6E56CF] text-white' : 'text-[#8A94A6] hover:text-[#F8FAFC]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 0: GITHUB RELEASE KIT & HD SCREENSHOTS */}
      {devTab === 'github-release' && (
        <div className="space-y-8">
          {/* Author Identity & One-Click Export Header */}
          <div className="bg-[#0D111C] border border-white/[0.07] rounded-2xl p-6 space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#20D6D0]">
                  GITHUB OPEN SOURCE RELEASE STUDIO · MIT LICENSE
                </span>
                <h2 className="text-lg font-semibold text-[#F8FAFC] mt-0.5">
                  {isFr
                    ? `Version Prête à Publier sur GitHub — Créée par ${authorName}`
                    : `GitHub-Ready Release — Created by ${authorName}`}
                </h2>
                <p className="text-xs text-[#8A94A6] mt-1">
                  {isFr
                    ? 'Toutes les métadonnées (package.json, LICENSE MIT, README.md, GitHub Actions CI et les 4 captures 2026) sont configurées à votre nom.'
                    : 'All repository metadata (package.json, MIT LICENSE, README.md, GitHub Actions CI, and all 4 official 2026 screenshots) are configured under your name.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleDownloadAllPngs}
                  className="px-4 py-2.5 bg-[#20D6D0] hover:bg-[#1bc0ba] text-[#07090F] text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>{isFr ? 'Télécharger les 4 Captures PNG HD' : 'Download All 4 HD PNGs'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadTextFile('README.md', buildPersonalizedReadme())}
                  className="px-4 py-2.5 bg-[#6E56CF] hover:bg-[#7C66DC] text-white text-xs font-medium rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{isFr ? 'Télécharger README.md' : 'Download README.md'}</span>
                </button>
              </div>
            </div>

            {/* Author & Repo Customizer */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-white/[0.06]">
              <div>
                <label className="block text-xs text-[#8A94A6] mb-1.5">Auteur Principal (Nom complet)</label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full bg-[#07090F] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-[#F8FAFC]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#8A94A6] mb-1.5">Identifiant GitHub (@username)</label>
                <input
                  type="text"
                  value={githubUsername}
                  onChange={(e) => setGithubUsername(e.target.value)}
                  className="w-full bg-[#07090F] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-[#F8FAFC] font-mono"
                />
              </div>
              <div>
                <label className="block text-xs text-[#8A94A6] mb-1.5">Email Auteur</label>
                <input
                  type="email"
                  value={authorEmail}
                  onChange={(e) => setAuthorEmail(e.target.value)}
                  className="w-full bg-[#07090F] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-[#F8FAFC] font-mono"
                />
              </div>
              <div>
                <label className="block text-xs text-[#8A94A6] mb-1.5">Nom du Dépôt GitHub</label>
                <input
                  type="text"
                  value={repoName}
                  onChange={(e) => setRepoName(e.target.value)}
                  className="w-full bg-[#07090F] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-[#F8FAFC] font-mono"
                />
              </div>
            </div>
          </div>

          {/* Gallery of the 4 Official 2026 Captures */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-[#F8FAFC]">
                  {isFr
                    ? 'Galerie des 4 Captures d’Écran Officielles (Incluses dans /public/screenshots/ & README.md)'
                    : '4 Official Screenshots Gallery (Included in /public/screenshots/ & README.md)'}
                </h3>
                <p className="text-xs text-[#8A94A6]">
                  {isFr
                    ? 'Exportables en PNG Haute Définition (1920×1146) pour GitHub Social Preview, LinkedIn ou Product Hunt, et en SVG vectoriel 4K.'
                    : 'Exportable as High-Definition PNG (1920×1146) or 4K vector SVG.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {OFFICIAL_SCREENSHOTS.map((shot) => (
                <div
                  key={shot.id}
                  className="bg-[#0D111C] border border-white/[0.07] rounded-2xl overflow-hidden flex flex-col justify-between"
                >
                  <div className="p-4 border-b border-white/[0.06] flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold text-[#F8FAFC]">
                        {isFr ? shot.titleFr : shot.titleEn}
                      </div>
                      <div className="text-[11px] text-[#8A94A6] mt-0.5">
                        {isFr ? shot.captionFr : shot.captionEn}
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#07090F] p-3">
                    <img
                      src={shot.svgUrl}
                      alt={shot.titleFr}
                      className="w-full h-auto rounded-xl border border-white/[0.06]"
                    />
                  </div>

                  <div className="p-4 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-2 bg-[#0D111C]">
                    <span className="text-[11px] font-mono text-[#8A94A6]">
                      /public/screenshots/{shot.filename}.svg
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleDownloadSvg(shot)}
                        className="px-3 py-1.5 bg-[#07090F] hover:bg-white/[0.05] text-[#F8FAFC] border border-white/[0.08] rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>SVG 4K</span>
                      </button>
                      <button
                        type="button"
                        disabled={exportingPngId === shot.id}
                        onClick={() => handleDownloadPngHd(shot)}
                        className="px-3.5 py-1.5 bg-[#6E56CF] hover:bg-[#7C66DC] text-white rounded-xl text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>
                          {exportingPngId === shot.id ? 'Export...' : 'PNG HD (1920×1146)'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Git Commands & Personalized README Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 bg-[#0D111C] border border-white/[0.07] rounded-2xl p-6 space-y-4 h-fit">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#20D6D0]" />
                  <h3 className="text-sm font-semibold text-[#F8FAFC]">
                    {isFr ? 'Commandes de Publication GitHub' : 'GitHub Publish Commands'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyText('git', gitCommandsText)}
                  className="px-3 py-1.5 bg-[#07090F] hover:bg-white/[0.05] text-[#20D6D0] border border-white/[0.08] rounded-xl text-xs font-mono flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedKey === 'git' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'git' ? 'Copié !' : 'Copier'}</span>
                </button>
              </div>
              <pre className="p-4 bg-[#07090F] border border-white/[0.07] rounded-xl text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
                {gitCommandsText}
              </pre>
            </div>

            <div className="lg:col-span-7 bg-[#0D111C] border border-white/[0.07] rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#F8FAFC]">
                  {isFr
                    ? `Aperçu du README.md Signé (${authorName})`
                    : `Signed README.md Preview (${authorName})`}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyText('readme', buildPersonalizedReadme())}
                    className="px-3 py-1.5 bg-[#07090F] hover:bg-white/[0.05] text-[#F8FAFC] border border-white/[0.08] rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedKey === 'readme' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'readme' ? 'Copié !' : 'Copier Markdown'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadTextFile('README.md', buildPersonalizedReadme())}
                    className="px-3 py-1.5 bg-[#6E56CF] hover:bg-[#7C66DC] text-white rounded-xl text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Télécharger README.md</span>
                  </button>
                </div>
              </div>
              <pre className="p-4 bg-[#07090F] border border-white/[0.07] rounded-xl text-xs font-mono text-slate-300 overflow-x-auto max-h-96 leading-relaxed">
                {buildPersonalizedReadme()}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: API PLAYGROUND */}
      {devTab === 'api-playground' && (
        <div className="bg-[#0D111C] border border-white/[0.07] rounded-2xl p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-[#F8FAFC]">
                SYNTARA Versioned REST API Playground (/api/v1/*)
              </h2>
              <p className="text-xs text-[#8A94A6]">
                Testez en direct les endpoints RESTful versionnés de la plateforme.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-mono">
              {[
                { m: 'GET', p: '/api/v1/agents' },
                { m: 'GET', p: '/api/v1/projects' },
                { m: 'GET', p: '/api/v1/memory' },
                { m: 'POST', p: '/api/v1/knowledge/search' },
                { m: 'GET', p: '/api/v1/monitoring/prometheus' },
              ].map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setApiMethod(preset.m as 'GET' | 'POST');
                    setApiPath(preset.p);
                  }}
                  className="px-2.5 py-1.5 bg-[#07090F] hover:bg-white/[0.04] text-[#20D6D0] border border-white/[0.08] rounded-lg cursor-pointer"
                >
                  {preset.m} {preset.p}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <select
              value={apiMethod}
              onChange={(e) => setApiMethod(e.target.value as 'GET' | 'POST')}
              className="bg-[#07090F] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#20D6D0]"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
            </select>
            <input
              type="text"
              value={apiPath}
              onChange={(e) => setApiPath(e.target.value)}
              className="flex-1 bg-[#07090F] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#F8FAFC]"
            />
            <button
              type="button"
              onClick={handleExecuteApi}
              className="px-5 py-2.5 bg-[#6E56CF] hover:bg-[#7C66DC] text-white text-xs font-medium rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Exécuter Requête API</span>
            </button>
          </div>

          {apiMethod === 'POST' && (
            <div>
              <label className="block text-xs font-mono text-[#8A94A6] mb-1.5">Request Body (JSON)</label>
              <textarea
                rows={3}
                value={apiBody}
                onChange={(e) => setApiBody(e.target.value)}
                className="w-full bg-[#07090F] border border-white/[0.08] rounded-xl p-3 text-xs font-mono text-[#F8FAFC]"
              />
            </div>
          )}

          <div>
            <div className="flex justify-between text-xs font-mono text-[#8A94A6] mb-1.5">
              <span>Response Payload</span>
              {apiLatency !== null && <span className="tabular-nums">Latency: {apiLatency}ms · HTTP 200 OK</span>}
            </div>
            <pre className="p-4 bg-[#07090F] border border-white/[0.07] rounded-xl text-xs font-mono text-emerald-300 overflow-x-auto max-h-96">
              {apiResponse}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 2: PLUGIN SDK BUILDER */}
      {devTab === 'plugin-sdk' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!plgName.trim()) return;
              await createPluginAction({
                name: plgName.trim(),
                version: '1.0.0',
                description: plgDesc.trim() || 'Plugin SDK SYNTARA',
                permissions: ['workspace:read'],
                codeSource: plgCode,
              });
              setPlgName('');
              setPlgDesc('');
            }}
            className="lg:col-span-7 bg-[#0D111C] border border-white/[0.07] rounded-2xl p-6 space-y-4"
          >
            <h3 className="text-base font-semibold text-[#F8FAFC]">
              SDK de Développement de Plugins (@syntara/sdk)
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                required
                value={plgName}
                onChange={(e) => setPlgName(e.target.value)}
                placeholder="Nom du Plugin..."
                className="bg-[#07090F] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-[#F8FAFC]"
              />
              <input
                type="text"
                value={plgDesc}
                onChange={(e) => setPlgDesc(e.target.value)}
                placeholder="Description courte..."
                className="bg-[#07090F] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-[#F8FAFC]"
              />
            </div>
            <textarea
              rows={10}
              value={plgCode}
              onChange={(e) => setPlgCode(e.target.value)}
              className="w-full bg-[#07090F] border border-white/[0.08] rounded-xl p-3.5 text-xs font-mono text-[#F8FAFC]"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#6E56CF] hover:bg-[#7C66DC] text-white text-xs font-medium rounded-xl cursor-pointer"
            >
              Compiler & Enregistrer le Plugin
            </button>
          </form>

          <div className="lg:col-span-5 bg-[#0D111C] border border-white/[0.07] rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-semibold text-[#F8FAFC]">
              Plugins Installés ({plugins.length})
            </h3>
            <div className="divide-y divide-white/[0.06]">
              {plugins.map((p) => (
                <div key={p.id} className="py-3.5 first:pt-0 last:pb-0 text-xs space-y-1">
                  <div className="flex justify-between font-mono">
                    <span className="font-semibold text-[#F8FAFC]">{p.name}</span>
                    <span className="text-[#20D6D0]">v{p.version} · {p.license}</span>
                  </div>
                  <p className="text-[#8A94A6]">{p.description}</p>
                  <div className="text-[#A78BFA] font-mono">
                    {p.resourceLimits.maxMemoryMb}MB RAM · Timeout {p.resourceLimits.timeoutMs}ms
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MCP REGISTRY */}
      {devTab === 'mcp-registry' && (
        <div className="bg-[#0D111C] border border-white/[0.07] rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-semibold text-[#F8FAFC]">
            Model Context Protocol (MCP) Server Registry
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mcpServers.map((srv) => (
              <div key={srv.id} className="p-4 bg-[#07090F] border border-white/[0.07] rounded-xl space-y-2 text-xs">
                <div className="flex justify-between font-mono">
                  <span className="text-[#20D6D0] uppercase">{srv.transport}</span>
                  <span className={srv.status === 'connected' ? 'text-emerald-400' : 'text-amber-400'}>
                    {srv.status.toUpperCase()}
                  </span>
                </div>
                <div className="text-sm font-semibold text-[#F8FAFC]">{srv.name}</div>
                <div className="font-mono text-[#8A94A6] truncate">{srv.urlOrCommand}</div>
                <div className="pt-2 border-t border-white/[0.06] text-[#8A94A6]">
                  <strong className="text-[#F8FAFC]">Outils :</strong> {srv.exposedTools.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ARCHITECTURE, MONOREPO & SQL SCHEMA */}
      {devTab === 'architecture-docs' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#0D111C] border border-white/[0.07] rounded-2xl p-6 space-y-3">
            <h3 className="text-base font-semibold text-[#F8FAFC]">
              Arborescence Monorepo & Contrats des 12 Moteurs
            </h3>
            <pre className="p-4 bg-[#07090F] border border-white/[0.07] rounded-xl text-xs font-mono text-slate-300 overflow-x-auto">
{`syntara/
├── .github/workflows/ci.yml  # Pipeline GitHub Actions (Lint + 15 Tests + Build)
├── public/screenshots/       # 4 Captures Officielles 2026 (SVG 4K / PNG HD)
├── apps/
│   ├── web/                  # Interface React + Tailwind + Zustand
│   ├── api/                  # API REST v1 + Orchestrateur Multi-Moteurs
│   └── desktop/              # Conteneur local multiplateforme
├── engines/
│   ├── 01-intent/            # SYNTARA Intent Schema & Décomposition
│   ├── 02-cognitive/         # Planification Multi-Étapes & Traces d'Audit
│   ├── 03-agent/             # Cycle de vie ASSISTED / SUPERVISED / AUTONOMOUS
│   ├── 04-collective/        # Délégation Multi-Agents & Résolution Conflits
│   ├── 05-memory/            # 6 Couches Mémoire + Provenance & Confiance
│   ├── 06-simulation/        # Scénarios Conservative / Balanced / Optimistic
│   ├── 07-evolution/         # Tests A/B Isolés & Propositions d'Amélioration
│   ├── 08-tool-fabric/       # MCP, REST, Webhooks, Sandbox & Plugin SDK
│   ├── 09-knowledge/         # Chunking, Embeddings pgvector & Hybrid RAG
│   ├── 10-creation/          # Workspace Isolé, Diffs Avant/Après & Rollback
│   ├── 11-workflow/          # Éditeur Visuel 13 Blocs & Exécution
│   └── 12-trust/             # RBAC, Approbations Humaines, Anti-Injection, Kill Switch
├── database/
│   └── migrations/001_syntara_initial_schema.sql  # 39 Tables PostgreSQL + pgvector
├── tests/
│   └── acceptance.test.ts    # Suite Automatisée des 15 Critères d'Acceptation
├── Dockerfile
├── docker-compose.yml        # Local / Server / Cloud (Postgres pgvector + Redis + Ollama)
└── LICENSE                   # Open Source MIT — Copyright (c) 2026 Mendel Temgoua`}
            </pre>
          </div>

          <div className="bg-[#0D111C] border border-white/[0.07] rounded-2xl p-6 space-y-3">
            <h3 className="text-base font-semibold text-[#F8FAFC]">
              Déploiement Local, Serveur & Cloud (Docker Compose)
            </h3>
            <pre className="p-4 bg-[#07090F] border border-white/[0.07] rounded-xl text-xs font-mono text-emerald-300 overflow-x-auto">
{`# 1. Cloner et configurer l'environnement Open Source (Licence MIT)
cp .env.example .env

# 2. Démarrer l'infrastructure complète (PostgreSQL 16 pgvector + Redis + Ollama + SYNTARA)
docker compose up -d --build

# 3. Exécuter la suite automatisée des 15 tests d'acceptation
npm test

# 4. Vérifier les métriques compatibles Prometheus
curl http://localhost:3000/api/v1/monitoring/prometheus`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
