import React, { useState } from 'react';
import {
  Search,
  Trash2,
  RotateCcw,
  Download,
} from 'lucide-react';
import { useSyntaraStore } from '../store/useSyntaraStore.ts';
import type { KnowledgeSearchResult } from '../types/syntara.ts';

export const KnowledgeCenterView: React.FC = () => {
  const {
    language,
    knowledgeCollections,
    knowledgeDocuments,
    knowledgeChunks,
    searchKnowledgeAction,
    uploadKnowledgeDocAction,
    deleteKnowledgeDocAction,
  } = useSyntaraStore();

  const isFr = language === 'fr';
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<KnowledgeSearchResult[]>([]);
  const [docTitle, setDocTitle] = useState('');
  const [docFormat, setDocFormat] = useState('Markdown');
  const [docContent, setDocContent] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const hits = await searchKnowledgeAction(query.trim());
    setSearchResults(hits);
  };

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !docContent.trim()) return;
    await uploadKnowledgeDocAction({
      collectionId: knowledgeCollections[0]?.id || 'kb_syntara_arch',
      title: docTitle.trim(),
      format: docFormat,
      rawContent: docContent.trim(),
    });
    setDocTitle('');
    setDocContent('');
  };

  return (
    <div className="space-y-8">
      {/* Hybrid Vector + Lexical Search Bar */}
      <div className="bg-[#0D111C] border border-white/[0.07] rounded-2xl p-6 space-y-5">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#20D6D0]">
            ENGINE 09 · KNOWLEDGE ENGINE & HYBRID RAG
          </span>
          <h2 className="text-base font-semibold text-[#F8FAFC] mt-0.5">
            {isFr
              ? 'Recherche Hybride Vectorielle & Lexicale avec Citations Vérifiées'
              : 'Hybrid Vector & Lexical Search with Verified Citations'}
          </h2>
        </div>

        <form onSubmit={handleSearch} className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              isFr
                ? 'Rechercher dans la base de connaissances (ex: "Trust Engine approbation humaine pgvector")...'
                : 'Search knowledge base (e.g., "Trust Engine human approval pgvector")...'
            }
            className="flex-1 bg-[#07090F] border border-white/[0.08] focus:border-[#6E56CF] focus:outline-none rounded-xl px-4 py-2.5 text-sm text-[#F8FAFC]"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#6E56CF] hover:bg-[#7C66DC] text-white text-xs font-medium rounded-xl flex items-center gap-2 cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>{isFr ? 'Recherche RAG' : 'RAG Search'}</span>
          </button>
        </form>

        {searchResults.length > 0 && (
          <div className="divide-y divide-white/[0.06] pt-3 border-t border-white/[0.06]">
            {searchResults.map((r) => (
              <div key={r.chunkId} className="py-3.5 first:pt-0 last:pb-0 text-xs space-y-1.5">
                <div className="flex items-center justify-between font-mono">
                  <span className="text-[#A78BFA] font-medium">[{r.citationTag}]</span>
                  <span className="text-[#20D6D0] tabular-nums">
                    Score {(r.hybridScore * 100).toFixed(1)}% (Vec {(r.vectorScore * 100).toFixed(0)}% · Lex {(r.lexicalScore * 100).toFixed(0)}%)
                  </span>
                </div>
                <p className="text-[#F8FAFC] leading-relaxed">{r.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Document Collection & Ingestion */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-[#0D111C] border border-white/[0.07] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#F8FAFC]">
              {isFr
                ? `Documents Indexés (${knowledgeDocuments.length}) · ${knowledgeChunks.length} Chunks`
                : `Indexed Documents (${knowledgeDocuments.length}) · ${knowledgeChunks.length} Chunks`}
            </h3>
            <span className="text-xs font-mono text-[#8A94A6]">pgvector Ready</span>
          </div>

          <div className="divide-y divide-white/[0.06]">
            {knowledgeDocuments.map((doc) => (
              <div key={doc.id} className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-medium text-[#F8FAFC]">{doc.title}</span>
                    <span aria-hidden="true" className="text-[#8A94A6]">·</span>
                    <span className="font-mono text-[#20D6D0]">{doc.format}</span>
                    <span aria-hidden="true" className="text-[#8A94A6]">·</span>
                    <span className="font-mono tabular-nums text-[#8A94A6]">
                      {doc.chunkCount} chunks · {doc.sizeBytes}B
                    </span>
                  </div>
                  <p className="text-xs text-[#8A94A6] line-clamp-2 leading-relaxed">{doc.rawContent}</p>
                </div>
                <button
                  type="button"
                  onClick={() => deleteKnowledgeDocAction(doc.id)}
                  className="p-1.5 text-[#8A94A6] hover:text-red-400 transition-colors cursor-pointer"
                  title="Supprimer ce document et ses vecteurs"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Ingest New Document Form */}
        <form
          onSubmit={handleIngest}
          className="lg:col-span-5 bg-[#0D111C] border border-white/[0.07] rounded-2xl p-6 space-y-4 h-fit"
        >
          <h3 className="text-sm font-semibold text-[#F8FAFC]">
            {isFr ? 'Indexer un Nouveau Document' : 'Ingest New Knowledge Document'}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#8A94A6] mb-1.5">Titre du Document</label>
              <input
                type="text"
                required
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="Ex: Architecture_Guide.md"
                className="w-full bg-[#07090F] border border-white/[0.08] focus:border-[#6E56CF] focus:outline-none rounded-xl px-3 py-2 text-xs text-[#F8FAFC]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#8A94A6] mb-1.5">Format</label>
              <select
                value={docFormat}
                onChange={(e) => setDocFormat(e.target.value)}
                className="w-full bg-[#07090F] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-[#F8FAFC]"
              >
                {['Markdown', 'PDF', 'DOCX', 'TXT', 'CSV', 'JSON', 'HTML', 'TechDoc'].map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-[#8A94A6] mb-1.5">
              Contenu (Vérifié par le filtre anti-injection Trust Engine)
            </label>
            <textarea
              rows={5}
              required
              value={docContent}
              onChange={(e) => setDocContent(e.target.value)}
              placeholder="Collez le contenu technique à découper en chunks et vectoriser..."
              className="w-full bg-[#07090F] border border-white/[0.08] focus:border-[#6E56CF] focus:outline-none rounded-xl p-3 text-xs text-[#F8FAFC]"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-[#6E56CF] hover:bg-[#7C66DC] text-white text-xs font-medium rounded-xl cursor-pointer"
          >
            {isFr ? 'Extraire, Découper & Vectoriser' : 'Extract, Chunk & Embed'}
          </button>
        </form>
      </div>
    </div>
  );
};

export const CreationStudioView: React.FC = () => {
  const {
    language,
    workspaceArtifacts,
    rollbackArtifactAction,
    createArtifactAction,
  } = useSyntaraStore();

  const isFr = language === 'fr';
  const [selectedArtId, setSelectedArtId] = useState(workspaceArtifacts[0]?.id || 'art_crm_schema');
  const activeArt = workspaceArtifacts.find((a) => a.id === selectedArtId) || workspaceArtifacts[0];
  const [viewMode, setViewMode] = useState<'diff' | 'current'>('diff');

  const [newPath, setNewPath] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newCode, setNewCode] = useState('');

  const handleExportFile = () => {
    if (!activeArt) return;
    const blob = new Blob([activeArt.currentContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeArt.path.split('/').pop() || 'artifact.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left 4 cols: Isolated Workspace Files + New Deliverable Form */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-[#0D111C] border border-white/[0.07] rounded-2xl p-6 space-y-4">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#20D6D0]">
              ENGINE 10 · CREATION STUDIO
            </span>
            <h2 className="text-base font-semibold text-[#F8FAFC] mt-0.5">
              {isFr ? 'Espace de Travail Isolé' : 'Isolated Workspace'}
            </h2>
          </div>

          <div className="space-y-2">
            {workspaceArtifacts.map((art) => (
              <button
                key={art.id}
                type="button"
                onClick={() => setSelectedArtId(art.id)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                  activeArt?.id === art.id
                    ? 'bg-[#121827] border-[#6E56CF]'
                    : 'bg-[#07090F] border-white/[0.07] hover:border-white/[0.15]'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono text-[#20D6D0]">
                  <span className="truncate">{art.path}</span>
                  <span>v{art.version}</span>
                </div>
                <div className="text-xs font-medium text-[#F8FAFC] mt-1">{art.title}</div>
                <div className="text-[11px] text-[#8A94A6] mt-0.5">
                  {art.createdByAgent} · {art.validationStatus.toUpperCase()}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Create Deliverable in Sandbox */}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!newPath.trim() || !newCode.trim()) return;
            await createArtifactAction({
              path: newPath.trim(),
              title: newTitle.trim() || newPath.trim(),
              type: 'code',
              language: 'typescript',
              currentContent: newCode,
            });
            setNewPath('');
            setNewTitle('');
            setNewCode('');
          }}
          className="bg-[#0D111C] border border-white/[0.07] rounded-2xl p-6 space-y-3"
        >
          <h3 className="text-sm font-semibold text-[#F8FAFC]">
            {isFr ? 'Nouveau Livrable Sandbox' : 'New Sandbox Deliverable'}
          </h3>
          <input
            type="text"
            required
            value={newPath}
            onChange={(e) => setNewPath(e.target.value)}
            placeholder="Chemin (ex: apps/api/routes/billing.ts)"
            className="w-full bg-[#07090F] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-[#F8FAFC] font-mono"
          />
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Titre descriptif..."
            className="w-full bg-[#07090F] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-[#F8FAFC]"
          />
          <textarea
            rows={4}
            required
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            placeholder="Code ou contenu du livrable..."
            className="w-full bg-[#07090F] border border-white/[0.08] rounded-xl p-3 text-xs text-[#F8FAFC] font-mono"
          />
          <button
            type="submit"
            className="w-full py-2.5 bg-[#6E56CF] hover:bg-[#7C66DC] text-white text-xs font-medium rounded-xl cursor-pointer"
          >
            + Écrire dans l’Espace Isolé
          </button>
        </form>
      </div>

      {/* Right 8 cols: Before/After Diff Viewer, Validation & Rollback */}
      {activeArt && (
        <div className="lg:col-span-8 bg-[#0D111C] border border-white/[0.07] rounded-2xl p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
            <div>
              <div className="text-xs font-mono text-[#20D6D0]">
                {activeArt.path} · Version {activeArt.version}
              </div>
              <h3 className="text-base font-semibold text-[#F8FAFC] mt-0.5">{activeArt.title}</h3>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 p-1 bg-[#07090F] border border-white/[0.08] rounded-xl">
                <button
                  type="button"
                  onClick={() => setViewMode('diff')}
                  className={`px-3 py-1 text-xs font-medium rounded-lg cursor-pointer ${
                    viewMode === 'diff' ? 'bg-[#6E56CF] text-white' : 'text-[#8A94A6]'
                  }`}
                >
                  Diff Avant / Après
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('current')}
                  className={`px-3 py-1 text-xs font-medium rounded-lg cursor-pointer ${
                    viewMode === 'current' ? 'bg-[#6E56CF] text-white' : 'text-[#8A94A6]'
                  }`}
                >
                  Code Final
                </button>
              </div>

              <button
                type="button"
                onClick={() => rollbackArtifactAction(activeArt.id)}
                className="px-3 py-1.5 bg-[#07090F] hover:bg-white/[0.04] text-amber-300 border border-white/[0.08] rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Rollback</span>
              </button>

              <button
                type="button"
                onClick={handleExportFile}
                className="px-3 py-1.5 bg-[#07090F] hover:bg-white/[0.04] text-[#F8FAFC] border border-white/[0.08] rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exporter</span>
              </button>
            </div>
          </div>

          {viewMode === 'diff' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="text-xs font-mono text-red-400">
                  AVANT (v{Math.max(1, activeArt.version - 1)})
                </div>
                <pre className="p-4 bg-[#07090F] border border-red-500/20 rounded-xl text-xs font-mono text-slate-300 overflow-x-auto max-h-96">
                  {activeArt.previousContent}
                </pre>
              </div>
              <div className="space-y-1.5">
                <div className="text-xs font-mono text-emerald-400">
                  APRÈS (v{activeArt.version} — Actuel)
                </div>
                <pre className="p-4 bg-[#07090F] border border-emerald-500/20 rounded-xl text-xs font-mono text-emerald-100 overflow-x-auto max-h-96">
                  {activeArt.currentContent}
                </pre>
              </div>
            </div>
          ) : (
            <pre className="p-4 bg-[#07090F] border border-white/[0.07] rounded-xl text-xs font-mono text-[#F8FAFC] overflow-x-auto max-h-96">
              {activeArt.currentContent}
            </pre>
          )}

          {/* Automated Validation Suite Results */}
          <div className="pt-4 border-t border-white/[0.06] space-y-2">
            <div className="text-xs font-medium text-emerald-400">
              Rapport de Validation Automatisée (Sandbox QA)
            </div>
            <ul className="space-y-1 text-xs font-mono text-[#8A94A6]">
              {activeArt.validationReport.map((rep, idx) => (
                <li key={idx}>{rep}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
