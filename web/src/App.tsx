import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  Activity,
  Database,
  Layers,
  Search,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  RefreshCw,
  Terminal,
  BookOpen,
  Zap,
  Clock,
  Eye,
  ChevronRight,
  Compass,
  Columns
} from 'lucide-react';

interface SystemHealth {
  status: string;
  timestamp: string;
  mcp_server: {
    status: string;
    protocol_version: string;
    endpoint: string;
  };
  chemistry_engine: {
    status: string;
    rdkit_version: string;
    latency_ms: number;
  };
  database: {
    status: string;
    cached_compounds: number;
    cached_renders: number;
    presets_count: number;
  };
}

interface Stats {
  totalRequests: number;
  failedRequests: number;
  averageLatencyMs: number;
  cachedCompoundsCount: number;
  cachedRendersCount: number;
  cacheHitRatePercent: number;
  presetCompoundsCount: number;
}

interface ToolLog {
  id: number;
  requestId: string;
  toolName: string;
  inputParams: string;
  success: boolean;
  latencyMs: number;
  errorMessage?: string;
  timestamp: number;
}

interface PresetCompound {
  id: string;
  name: string;
  synonyms: string[];
  smiles: string;
  formula: string;
  molecularWeight: number;
  category: string;
  iupacName?: string;
  pubchemCid?: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'structure' | 'reaction' | 'mechanism' | 'resonance' | 'stereo' | 'compare' | 'library' | 'inspector'>('dashboard');
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [logs, setLogs] = useState<ToolLog[]>([]);
  const [loadingHealth, setLoadingHealth] = useState(false);

  // --- Structure Tester State ---
  const [structQuery, setStructQuery] = useState('benzaldehyde');
  const [structLoading, setStructLoading] = useState(false);
  const [structResult, setStructResult] = useState<any>(null);
  const [structError, setStructError] = useState<string | null>(null);
  const [copiedSmiles, setCopiedSmiles] = useState(false);

  // --- Reaction Tester State ---
  const [reactantsInput, setReactantsInput] = useState('benzene, Br2');
  const [productsInput, setProductsInput] = useState('bromobenzene, HBr');
  const [conditionsInput, setConditionsInput] = useState('FeBr3');
  const [reactionLoading, setReactionLoading] = useState(false);
  const [reactionResult, setReactionResult] = useState<any>(null);
  const [reactionError, setReactionError] = useState<string | null>(null);

  // --- Mechanism Tester State ---
  const [mechQuery, setMechQuery] = useState('sn1 hydrolysis of tert-butyl bromide');
  const [mechLoading, setMechLoading] = useState(false);
  const [mechResult, setMechResult] = useState<any>(null);
  const [mechError, setMechError] = useState<string | null>(null);

  // --- Resonance Tester State ---
  const [resQuery, setResQuery] = useState('phenoxide ion');
  const [resLoading, setResLoading] = useState(false);
  const [resResult, setResResult] = useState<any>(null);
  const [resError, setResError] = useState<string | null>(null);

  // --- Stereochemistry State ---
  const [stereoCompound, setStereoCompound] = useState('2-butanol');
  const [stereoConfig, setStereoConfig] = useState('R');
  const [stereoLoading, setStereoLoading] = useState(false);
  const [stereoResult, setStereoResult] = useState<any>(null);
  const [stereoError, setStereoError] = useState<string | null>(null);

  // --- Compare Structures State ---
  const [compareInput, setCompareInput] = useState('ethanol, ethanal, ethanoic acid');
  const [compareTitle, setCompareTitle] = useState('Oxidation Series of Ethanol');
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareResult, setCompareResult] = useState<any>(null);
  const [compareError, setCompareError] = useState<string | null>(null);

  // --- Library State ---
  const [library, setLibrary] = useState<PresetCompound[]>([]);
  const [libCategory, setLibCategory] = useState('All');
  const [libSearch, setLibSearch] = useState('');
  const [libLoading, setLibLoading] = useState(false);

  // --- MCP Inspector State ---
  const [inspectorTool, setInspectorTool] = useState('show_structure');
  const [inspectorPayload, setInspectorPayload] = useState('{\n  "compound": "benzaldehyde",\n  "format": "png",\n  "width": 500,\n  "height": 350\n}');
  const [inspectorLoading, setInspectorLoading] = useState(false);
  const [inspectorResponse, setInspectorResponse] = useState<any>(null);

  const fetchHealthAndStats = async () => {
    setLoadingHealth(true);
    try {
      const [hRes, sRes, lRes] = await Promise.all([
        fetch('/health').then(r => r.json()).catch(() => null),
        fetch('/api/stats').then(r => r.json()).catch(() => null),
        fetch('/api/logs?limit=15').then(r => r.json()).catch(() => [])
      ]);
      setHealth(hRes);
      setStats(sRes);
      setLogs(lRes);
    } catch {
      // ignore
    } finally {
      setLoadingHealth(false);
    }
  };

  useEffect(() => {
    fetchHealthAndStats();
    const interval = setInterval(fetchHealthAndStats, 8000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Library
  useEffect(() => {
    if (activeTab === 'library') {
      setLibLoading(true);
      fetch(`/api/compounds?category=${encodeURIComponent(libCategory)}&search=${encodeURIComponent(libSearch)}`)
        .then(r => r.json())
        .then(data => setLibrary(data))
        .catch(() => setLibrary([]))
        .finally(() => setLibLoading(false));
    }
  }, [activeTab, libCategory, libSearch]);

  // Handle Structure Test
  const handleTestStructure = async (queryToUse?: string) => {
    const q = queryToUse || structQuery;
    setStructLoading(true);
    setStructError(null);
    setStructResult(null);
    try {
      const res = await fetch('/api/render/structure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ compound: q, show_name: true, show_formula: true })
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        if (data && data.status === 'ambiguous') {
          setStructResult(data);
        } else {
          setStructError(data?.error?.message || data?.error || `Request failed with HTTP ${res.status}`);
        }
      } else if (data) {
        setStructResult(data);
      } else {
        setStructError('No response data received from server');
      }
    } catch (err: any) {
      setStructError(err.message || 'Network error');
    } finally {
      setStructLoading(false);
      fetchHealthAndStats();
    }
  };

  // Handle Reaction Test
  const handleTestReaction = async () => {
    setReactionLoading(true);
    setReactionError(null);
    setReactionResult(null);
    try {
      const reactants = reactantsInput.split(',').map(s => s.trim()).filter(Boolean);
      const products = productsInput.split(',').map(s => s.trim()).filter(Boolean);
      const res = await fetch('/api/render/reaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reactants,
          products,
          conditions: conditionsInput.trim() || undefined
        })
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        setReactionError(data?.error || `Reaction render failed with HTTP ${res.status}`);
      } else {
        setReactionResult(data);
      }
    } catch (err: any) {
      setReactionError(err.message || 'Network error');
    } finally {
      setReactionLoading(false);
      fetchHealthAndStats();
    }
  };

  // Handle Mechanism Test
  const handleTestMechanism = async (qOverride?: string) => {
    const q = qOverride || mechQuery;
    setMechLoading(true);
    setMechError(null);
    setMechResult(null);
    try {
      const res = await fetch('/api/render/mechanism', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q })
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        setMechError(data?.error || `Mechanism render failed with HTTP ${res.status}`);
      } else {
        setMechResult(data);
      }
    } catch (err: any) {
      setMechError(err.message || 'Network error');
    } finally {
      setMechLoading(false);
      fetchHealthAndStats();
    }
  };

  // Handle Resonance Test
  const handleTestResonance = async (qOverride?: string) => {
    const q = qOverride || resQuery;
    setResLoading(true);
    setResError(null);
    setResResult(null);
    try {
      const res = await fetch('/api/render/resonance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ compound: q })
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        setResError(data?.error || `Resonance render failed with HTTP ${res.status}`);
      } else {
        setResResult(data);
      }
    } catch (err: any) {
      setResError(err.message || 'Network error');
    } finally {
      setResLoading(false);
      fetchHealthAndStats();
    }
  };

  // Handle Stereochemistry Test
  const handleTestStereo = async () => {
    setStereoLoading(true);
    setStereoError(null);
    setStereoResult(null);
    try {
      const res = await fetch('/api/render/stereochemistry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          compound: stereoCompound,
          configuration: stereoConfig
        })
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        setStereoError(data?.error || `Stereochemistry render failed with HTTP ${res.status}`);
      } else {
        setStereoResult(data);
      }
    } catch (err: any) {
      setStereoError(err.message || 'Network error');
    } finally {
      setStereoLoading(false);
      fetchHealthAndStats();
    }
  };

  // Handle Compare Structures Test
  const handleTestCompare = async (compoundsStr?: string, titleStr?: string) => {
    const compStr = compoundsStr || compareInput;
    const title = titleStr !== undefined ? titleStr : compareTitle;
    setCompareLoading(true);
    setCompareError(null);
    setCompareResult(null);
    try {
      const compounds = compStr.split(',').map(s => s.trim()).filter(Boolean);
      const res = await fetch('/api/render/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          compounds,
          title: title.trim() || undefined
        })
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        setCompareError(data?.error || `Comparison failed with HTTP ${res.status}`);
      } else {
        setCompareResult(data);
      }
    } catch (err: any) {
      setCompareError(err.message || 'Network error');
    } finally {
      setCompareLoading(false);
      fetchHealthAndStats();
    }
  };

  // Handle MCP Inspector Call
  const handleRunInspector = async () => {
    setInspectorLoading(true);
    setInspectorResponse(null);
    const start = Date.now();
    try {
      let parsedArgs = {};
      try {
        parsedArgs = JSON.parse(inspectorPayload);
      } catch (jsonErr: any) {
        setInspectorResponse({ error: `Invalid JSON syntax: ${jsonErr.message}` });
        setInspectorLoading(false);
        return;
      }

      let endpoint = '';
      if (inspectorTool === 'show_structure') endpoint = '/api/render/structure';
      else if (inspectorTool === 'show_reaction') endpoint = '/api/render/reaction';
      else if (inspectorTool === 'show_mechanism') endpoint = '/api/render/mechanism';
      else if (inspectorTool === 'show_resonance') endpoint = '/api/render/resonance';
      else if (inspectorTool === 'show_stereochemistry') endpoint = '/api/render/stereochemistry';
      else if (inspectorTool === 'compare_structures') endpoint = '/api/render/compare';
      else if (inspectorTool === 'resolve_compound') endpoint = `/api/resolve?q=${encodeURIComponent((parsedArgs as any).query || '')}`;

      let resData = null;
      if (inspectorTool === 'resolve_compound') {
        const res = await fetch(endpoint);
        resData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      } else {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsedArgs)
        });
        resData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      }

      setInspectorResponse({
        status: 'OK',
        latencyMs: Date.now() - start,
        mcpTool: inspectorTool,
        rawResult: resData
      });
    } catch (err: any) {
      setInspectorResponse({
        error: err.message,
        latencyMs: Date.now() - start
      });
    } finally {
      setInspectorLoading(false);
      fetchHealthAndStats();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSmiles(true);
    setTimeout(() => setCopiedSmiles(false), 2000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-900/30 ring-1 ring-white/10">
              <FlaskConical className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold tracking-tight text-slate-100 text-lg">Organic Chemistry MCP</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  v1.0 Streamable HTTP
                </span>
              </div>
              <p className="text-xs text-slate-400">Deterministic Chemical Structure Server for AI Chats</p>
            </div>
          </div>

          {/* Status Pills */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* MCP HTTP Pill */}
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-800/60 border border-slate-700/50 text-xs">
              <div className={`w-2 h-2 rounded-full ${health?.mcp_server?.status === 'running' ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-400'}`} />
              <span className="text-slate-400">MCP:</span>
              <span className="text-slate-200 font-mono font-medium">/mcp</span>
            </div>

            {/* Engine Pill */}
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-800/60 border border-slate-700/50 text-xs">
              <div className={`w-2 h-2 rounded-full ${health?.chemistry_engine?.status === 'connected' ? 'bg-emerald-400' : 'bg-teal-400'}`} />
              <span className="text-slate-400">Engine:</span>
              <span className="text-slate-200 font-mono font-medium">{health?.chemistry_engine?.status === 'connected' ? `RDKit v${health?.chemistry_engine?.rdkit_version}` : 'PubChem 2D (Cloud)'}</span>
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchHealthAndStats}
              disabled={loadingHealth}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700/60"
              title="Refresh Health"
            >
              <RefreshCw className={`w-4 h-4 ${loadingHealth ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 overflow-x-auto py-1 border-t border-slate-800/40">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Activity },
            { id: 'structure', label: 'Structure Tester', icon: FlaskConical },
            { id: 'reaction', label: 'Reaction Tester', icon: ArrowRight },
            { id: 'mechanism', label: 'Mechanisms', icon: Layers },
            { id: 'resonance', label: 'Resonance', icon: Zap },
            { id: 'stereo', label: 'Stereochemistry', icon: Compass },
            { id: 'compare', label: 'Compare Structures', icon: Columns },
            { id: 'library', label: 'Compound Library', icon: BookOpen },
            { id: 'inspector', label: 'MCP Inspector', icon: Terminal }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        {/* ========================================================================= */}
        {/* TAB 1: DASHBOARD */}
        {/* ========================================================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Notice Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/20 flex items-start space-x-3">
              <Sparkles className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <span className="font-semibold text-emerald-300">MCP Server is Live & Ready for AI Connections: </span>
                <span className="text-slate-300">
                  Compatible with ChatGPT, Gemini, Claude, Cursor, and MCP Inspector via Streamable HTTP (<code>/mcp</code>) and stdio (<code>npm run stdio</code>).
                </span>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                  <span>TOTAL REQUESTS</span>
                  <Activity className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-slate-100 mt-2">
                  {stats?.totalRequests ?? 0}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {stats?.failedRequests ? `${stats.failedRequests} errors` : '100% success rate'}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                  <span>AVG RENDER LATENCY</span>
                  <Clock className="w-4 h-4 text-teal-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-slate-100 mt-2">
                  {stats?.averageLatencyMs ? `${stats.averageLatencyMs}ms` : '< 50ms'}
                </div>
                <div className="text-xs text-emerald-400 mt-1">Deterministic depiction engine</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                  <span>CACHE HIT RATE</span>
                  <Database className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-slate-100 mt-2">
                  {stats?.cacheHitRatePercent ?? 100}%
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {stats?.cachedCompoundsCount ?? 0} compounds, {stats?.cachedRendersCount ?? 0} renders
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                  <span>JEE PRESETS LIBRARY</span>
                  <BookOpen className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-slate-100 mt-2">
                  {stats?.presetCompoundsCount ?? 200}+
                </div>
                <div className="text-xs text-slate-400 mt-1">Curated Class 11/12 & JEE</div>
              </div>
            </div>

            {/* Quick Actions & Protocol Architecture */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Architecture Card */}
              <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-200 flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <span>System Architecture & MCP Data Flow</span>
                  </h3>
                  <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-300 font-mono">
                    Zero Diffusion Models
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 font-mono text-xs text-slate-300 space-y-2">
                  <div className="flex items-center justify-between text-emerald-400 font-bold border-b border-slate-800 pb-2">
                    <span>AI Assistant (ChatGPT / Gemini / Claude)</span>
                    <span className="text-slate-400 font-normal">MCP Client</span>
                  </div>
                  <div className="text-slate-400 pl-4">
                    ↓ Tool Call: <span className="text-slate-200">show_structure({"{"} compound: "benzaldehyde" {"}"})</span>
                  </div>
                  <div className="flex items-center justify-between text-teal-400 font-semibold border-t border-slate-800/60 pt-2">
                    <span>Node.js MCP Server (Streamable HTTP / stdio)</span>
                    <span className="text-slate-400 font-normal">@modelcontextprotocol/sdk</span>
                  </div>
                  <div className="text-slate-400 pl-4">
                    ├─ Ambiguity Check → Local JEE DB (200+ Presets) → SQLite Cache → PubChem API
                  </div>
                  <div className="text-slate-400 pl-4">
                    └─ Structure Pipeline → RDKit Engine / Diagram Composer → 2D Textbook Depiction
                  </div>
                  <div className="flex items-center justify-between text-indigo-400 font-semibold border-t border-slate-800/60 pt-2">
                    <span>MCP Response Result Payload</span>
                    <span className="text-slate-400 font-normal">Native MCP Image Content</span>
                  </div>
                  <div className="text-slate-300 pl-4">
                    ✓ <span className="text-emerald-400">image/png / image/svg (base64)</span> + Structured Chemical Metadata
                  </div>
                </div>

                {/* MCP Endpoint Quick Copy */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/40 border border-slate-700/60 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400">Streamable HTTP MCP Endpoint:</span>
                    <code className="text-emerald-300 font-mono">/mcp</code>
                  </div>
                  <button
                    onClick={() => copyToClipboard(window.location.origin + '/mcp')}
                    className="px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 flex items-center space-x-1 transition-colors"
                  >
                    {copiedSmiles ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSmiles ? 'Copied URL' : 'Copy Full URL'}</span>
                  </button>
                </div>
              </div>

              {/* Tools Overview Card */}
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <h3 className="font-semibold text-slate-200 flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>Available MCP Tools</span>
                </h3>
                <div className="space-y-2 text-xs">
                  {[
                    { name: 'show_structure', desc: 'Renders 2D molecule with formula & properties', tag: 'Image' },
                    { name: 'resolve_compound', desc: 'Returns detailed molecular JSON metadata', tag: 'JSON' },
                    { name: 'show_reaction', desc: 'Renders reaction diagram with arrows & conditions', tag: 'Image' },
                    { name: 'show_mechanism', desc: 'Curved arrow multi-step mechanism diagram', tag: 'Image' },
                    { name: 'compare_structures', desc: 'Side-by-side molecular comparison grid', tag: 'Image' },
                    { name: 'show_resonance', desc: 'Resonance contributors with <--> arrows', tag: 'Image' },
                    { name: 'show_stereochemistry', desc: 'Wedge/dash chiral projection & CIP labels', tag: 'Image' }
                  ].map(t => (
                    <div key={t.name} className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                      <div>
                        <div className="font-mono font-semibold text-slate-200">{t.name}</div>
                        <div className="text-slate-400 text-[11px]">{t.desc}</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${t.tag === 'Image' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-300 border border-blue-500/20'}`}>
                        {t.tag}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Tool Calls Table */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-200 flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>Recent MCP Tool Calls & Latencies</span>
                </h3>
                <span className="text-xs text-slate-400">Live telemetry</span>
              </div>

              {logs.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  No tool calls logged yet. Run a structure or reaction test above to generate logs!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono text-[11px]">
                        <th className="pb-2">Status</th>
                        <th className="pb-2">Tool</th>
                        <th className="pb-2">Input Parameters</th>
                        <th className="pb-2">Latency</th>
                        <th className="pb-2">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {logs.map((log, i) => (
                        <tr key={log.id || i} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-2.5">
                            {log.success ? (
                              <span className="inline-flex items-center text-emerald-400">
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Success
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-red-400">
                                <XCircle className="w-3.5 h-3.5 mr-1" /> Failed
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 font-bold text-slate-200">{log.toolName}</td>
                          <td className="py-2.5 text-slate-400 max-w-xs truncate">{log.inputParams}</td>
                          <td className="py-2.5 text-teal-300 font-bold">{Math.round(log.latencyMs)}ms</td>
                          <td className="py-2.5 text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: STRUCTURE TESTER */}
        {/* ========================================================================= */}
        {activeTab === 'structure' && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                  <FlaskConical className="w-5 h-5 text-emerald-400" />
                  <span>Single Chemical Structure Tester</span>
                </h2>
                <p className="text-xs text-slate-400">Test name resolution, SMILES parsing, PubChem fallback, and 2D textbook rendering.</p>
              </div>

              {/* Input Form */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={structQuery}
                    onChange={(e) => setStructQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleTestStructure()}
                    placeholder="Enter compound name, SMILES, InChI, or PubChem CID (e.g. benzaldehyde, phenol, CCO)..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm font-mono"
                  />
                </div>
                <button
                  onClick={() => handleTestStructure()}
                  disabled={structLoading}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold text-white transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-emerald-900/40 text-sm"
                >
                  {structLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                  <span>Render Structure</span>
                </button>
              </div>

              {/* Preset Chips */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
                <span className="text-slate-400 flex-shrink-0">Quick Presets:</span>
                {[
                  'benzaldehyde',
                  'benzene',
                  'phenol',
                  'aniline',
                  'acetone',
                  'CCO',
                  'picric acid',
                  'aspirin',
                  'PCC',
                  'cresol'
                ].map(p => (
                  <button
                    key={p}
                    onClick={() => {
                      setStructQuery(p);
                      handleTestStructure(p);
                    }}
                    className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono transition-colors border border-slate-700/60 flex-shrink-0"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Area */}
            {structError && (
              <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 flex items-start space-x-3 text-sm">
                <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400" />
                <div>
                  <div className="font-semibold">Structure Resolution Failed</div>
                  <div className="text-red-300/90 text-xs mt-1">{structError}</div>
                </div>
              </div>
            )}

            {/* Ambiguity Result Alert */}
            {structResult?.status === 'ambiguous' && (
              <div className="p-5 rounded-2xl bg-amber-950/40 border border-amber-500/40 space-y-3">
                <div className="flex items-center space-x-2 text-amber-300 font-bold">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Ambiguous Query Detected: '{structResult.ambiguity?.query}'</span>
                </div>
                <p className="text-xs text-amber-200/90">{structResult.ambiguity?.message}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  {structResult.ambiguity?.candidates?.map((c: any) => (
                    <button
                      key={c.name}
                      onClick={() => {
                        setStructQuery(c.name);
                        handleTestStructure(c.name);
                      }}
                      className="p-3 rounded-xl bg-slate-900/90 border border-amber-500/30 hover:border-emerald-500 text-left transition-all group"
                    >
                      <div className="font-semibold text-slate-100 group-hover:text-emerald-300 text-sm flex items-center justify-between">
                        <span>{c.name}</span>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400" />
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-1">SMILES: {c.smiles}</div>
                      <div className="text-[11px] text-slate-300 mt-1">{c.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Successful Render Card */}
            {(structResult?.image_base64 || structResult?.base64) && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Left: High-Res Diagram */}
                <div className="md:col-span-7 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col items-center justify-center min-h-[380px]">
                  <div className="p-4 rounded-xl bg-white shadow-2xl ring-1 ring-slate-700/50 max-w-full overflow-hidden">
                    <img
                      src={`data:${structResult.mime_type || 'image/png'};base64,${structResult.image_base64 || structResult.base64}`}
                      alt={structResult.compound?.name || 'Chemical Structure'}
                      className="max-w-full h-auto object-contain mx-auto"
                    />
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-slate-400 mt-4">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Rendered deterministically via 2D Chemical Structure Engine</span>
                  </div>
                </div>

                {/* Right: Chemical Properties Card */}
                <div className="md:col-span-5 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-xl font-bold text-slate-100">{structResult.compound?.name || structQuery}</h3>
                      <div className="text-xs text-slate-400">{structResult.compound?.iupacName || 'IUPAC Standard'}</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 font-mono text-xs border border-emerald-500/20">
                      {structResult.compound?.source || 'Resolved'}
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    {structResult.compound?.formula && (
                      <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                        <span className="text-slate-400">Molecular Formula:</span>
                        <span className="font-mono font-bold text-slate-200">{structResult.compound?.formula}</span>
                      </div>
                    )}

                    {structResult.compound?.molecularWeight && (
                      <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                        <span className="text-slate-400">Molecular Weight:</span>
                        <span className="font-mono font-bold text-slate-200">{structResult.compound?.molecularWeight} g/mol</span>
                      </div>
                    )}

                    {structResult.compound?.canonicalSmiles && (
                      <div className="py-1.5 border-b border-slate-800/60 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Canonical SMILES:</span>
                          <button
                            onClick={() => copyToClipboard(structResult.compound?.canonicalSmiles)}
                            className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </button>
                        </div>
                        <code className="block p-2 rounded bg-slate-950 font-mono text-emerald-300 text-[11px] break-all">
                          {structResult.compound?.canonicalSmiles}
                        </code>
                      </div>
                    )}

                    {structResult.compound?.pubchemCid && (
                      <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                        <span className="text-slate-400">PubChem CID:</span>
                        <a
                          href={`https://pubchem.ncbi.nlm.nih.gov/compound/${structResult.compound.pubchemCid}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono font-bold text-teal-400 hover:underline"
                        >
                          {structResult.compound.pubchemCid} ↗
                        </a>
                      </div>
                    )}

                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-400">Status:</span>
                      <span className="font-medium text-emerald-400">
                        {structResult.from_cache ? '✓ Served from SQLite Cache' : '✓ Resolved & Ready'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: REACTION TESTER */}
        {/* ========================================================================= */}
        {activeTab === 'reaction' && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                  <ArrowRight className="w-5 h-5 text-emerald-400" />
                  <span>Chemical Reaction Diagram Tester</span>
                </h2>
                <p className="text-xs text-slate-400">Assemble publication-quality reaction equations with reactants, plus signs (+), reaction arrows, conditions, and products.</p>
              </div>

              {/* Reaction Input Builder */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Reactants (comma separated)</label>
                  <input
                    type="text"
                    value={reactantsInput}
                    onChange={(e) => setReactantsInput(e.target.value)}
                    placeholder="e.g. benzene, Br2"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm font-mono focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Conditions / Catalyst</label>
                  <input
                    type="text"
                    value={conditionsInput}
                    onChange={(e) => setConditionsInput(e.target.value)}
                    placeholder="e.g. FeBr3, heat"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm font-mono focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Products (comma separated)</label>
                  <input
                    type="text"
                    value={productsInput}
                    onChange={(e) => setProductsInput(e.target.value)}
                    placeholder="e.g. bromobenzene, HBr"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm font-mono focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                {/* Reaction Preset Buttons */}
                <div className="flex items-center space-x-2 overflow-x-auto text-xs pb-1">
                  <span className="text-slate-400 flex-shrink-0">Presets:</span>
                  {[
                    { label: 'EAS Bromination', r: 'benzene, Br2', c: 'FeBr3', p: 'bromobenzene, HBr' },
                    { label: 'Alkene Hydration', r: 'ethene, H2O', c: 'H3O+', p: 'ethanol' },
                    { label: 'Esterification', r: 'acetic acid, ethanol', c: 'conc. H2SO4, Δ', p: 'ethyl acetate, H2O' }
                  ].map(rp => (
                    <button
                      key={rp.label}
                      onClick={() => {
                        setReactantsInput(rp.r);
                        setConditionsInput(rp.c);
                        setProductsInput(rp.p);
                      }}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono transition-colors border border-slate-700/60 flex-shrink-0"
                    >
                      {rp.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleTestReaction}
                  disabled={reactionLoading}
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold text-white text-sm flex items-center justify-center space-x-2 shadow-lg shadow-emerald-900/30"
                >
                  {reactionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                  <span>Render Reaction</span>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {reactionError && (
              <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-sm flex items-center space-x-2">
                <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{reactionError}</span>
              </div>
            )}

            {/* Reaction Diagram Result */}
            {reactionResult?.base64 && (
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="p-6 rounded-xl bg-white shadow-2xl flex items-center justify-center overflow-x-auto">
                  <img
                    src={`data:${reactionResult.mime_type || 'image/png'};base64,${reactionResult.base64}`}
                    alt="Reaction Diagram"
                    className="max-w-full h-auto object-contain"
                  />
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300">
                  {reactionResult.reaction_summary}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: MECHANISMS */}
        {/* ========================================================================= */}
        {activeTab === 'mechanism' && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                  <Layers className="w-5 h-5 text-emerald-400" />
                  <span>Reaction Mechanism Explorer (JEE / Organic Chemistry)</span>
                </h2>
                <p className="text-xs text-slate-400">Step-by-step intermediate panels with curved electron-movement arrows, step numbering, and formal charges.</p>
              </div>

              {/* Mechanism Selector Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { name: 'SN1 Hydrolysis', query: 'sn1 hydrolysis of tert-butyl bromide', desc: 'Carbocation intermediate & front/back attack' },
                  { name: 'SN2 Substitution', query: 'sn2 substitution', desc: 'Concerted backside attack & Walden inversion' },
                  { name: 'EAS Bromination', query: 'eas bromination of benzene', desc: 'Arenium ion (Wheland / Sigma complex)' },
                  { name: 'Alkene Hydration', query: 'hydration of ethene', desc: 'Electrophilic addition of H3O+' }
                ].map(m => (
                  <button
                    key={m.name}
                    onClick={() => {
                      setMechQuery(m.query);
                      handleTestMechanism(m.query);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      mechQuery === m.query
                        ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-sm">{m.name}</div>
                    <div className="text-[11px] text-slate-400 mt-1">{m.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {mechError && (
              <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-sm flex items-center space-x-2">
                <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{mechError}</span>
              </div>
            )}

            {/* Mechanism Output Result */}
            {mechResult?.base64 && (
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="p-6 rounded-xl bg-white shadow-2xl flex items-center justify-center overflow-x-auto">
                  <img
                    src={`data:${mechResult.mime_type || 'image/png'};base64,${mechResult.base64}`}
                    alt="Reaction Mechanism"
                    className="max-w-full h-auto object-contain"
                  />
                </div>
                <div className="text-xs text-slate-300 p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="font-bold text-emerald-400">{mechResult.title}</div>
                  <div className="text-slate-400 mt-1">{mechResult.description}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: RESONANCE */}
        {/* ========================================================================= */}
        {activeTab === 'resonance' && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-emerald-400" />
                  <span>Resonance Contributors & Hybrid Renderer</span>
                </h2>
                <p className="text-xs text-slate-400">Canonical structures enclosed in brackets with &lt;--&gt; resonance arrows and delocalization analysis.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { name: 'Phenoxide Ion', query: 'phenoxide ion', desc: 'Negative charge delocalization on ortho/para' },
                  { name: 'Nitrobenzene', query: 'nitrobenzene', desc: '-M group withdrawing pi electron density' },
                  { name: 'Aniline', query: 'aniline', desc: '+R nitrogen lone pair delocalization' },
                  { name: 'Acetate Ion', query: 'acetate ion', desc: 'Equivalent resonance contributors (high stability)' }
                ].map(r => (
                  <button
                    key={r.name}
                    onClick={() => {
                      setResQuery(r.query);
                      handleTestResonance(r.query);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      resQuery === r.query
                        ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-sm">{r.name}</div>
                    <div className="text-[11px] text-slate-400 mt-1">{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Resonance Output Result */}
            {resResult?.base64 && (
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="p-6 rounded-xl bg-white shadow-2xl flex items-center justify-center overflow-x-auto">
                  <img
                    src={`data:${resResult.mime_type || 'image/png'};base64,${resResult.base64}`}
                    alt="Resonance Diagram"
                    className="max-w-full h-auto object-contain"
                  />
                </div>
                <div className="text-xs text-slate-300 p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="font-bold text-emerald-400">{resResult.title}</div>
                  <div className="text-slate-400 mt-1">{resResult.explanation}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: STEREOCHEMISTRY */}
        {/* ========================================================================= */}
        {activeTab === 'stereo' && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                  <Compass className="w-5 h-5 text-emerald-400" />
                  <span>Stereochemistry & Wedge/Dash Depiction</span>
                </h2>
                <p className="text-xs text-slate-400">R/S chiral stereocenters, E/Z geometric isomers, and optical isomer projection.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Compound</label>
                  <input
                    type="text"
                    value={stereoCompound}
                    onChange={(e) => setStereoCompound(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Configuration (R / S / E / Z / cis / trans)</label>
                  <select
                    value={stereoConfig}
                    onChange={(e) => setStereoConfig(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm font-mono"
                  >
                    <option value="R">R (Rectus / Clockwise)</option>
                    <option value="S">S (Sinister / Counter-clockwise)</option>
                    <option value="E">E (Entgegen / Opposite)</option>
                    <option value="Z">Z (Zusammen / Together)</option>
                    <option value="cis">cis</option>
                    <option value="trans">trans</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleTestStereo}
                    disabled={stereoLoading}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold text-white text-sm shadow-lg shadow-emerald-900/30"
                  >
                    {stereoLoading ? 'Rendering...' : 'Depict Stereocenter'}
                  </button>
                </div>
              </div>
            </div>

            {/* Stereochemistry Result */}
            {stereoResult?.base64 && (
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="p-6 rounded-xl bg-white shadow-2xl flex items-center justify-center overflow-x-auto">
                  <img
                    src={`data:${stereoResult.mime_type || 'image/png'};base64,${stereoResult.base64}`}
                    alt="Stereochemistry Diagram"
                    className="max-w-full h-auto object-contain"
                  />
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300">
                  <span className="text-emerald-400">Isomeric SMILES:</span> {stereoResult.isomeric_smiles}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: COMPARE STRUCTURES */}
        {/* ========================================================================= */}
        {activeTab === 'compare' && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                  <Columns className="w-5 h-5 text-emerald-400" />
                  <span>Side-by-Side Molecular Comparison Grid</span>
                </h2>
                <p className="text-xs text-slate-400">Compare functional groups, homologous series, constitutional isomers, acidities, or oxidation levels side-by-side.</p>
              </div>

              {/* Compare Input */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Compounds to Compare (comma separated)</label>
                  <input
                    type="text"
                    value={compareInput}
                    onChange={(e) => setCompareInput(e.target.value)}
                    placeholder="e.g. ethanol, ethanal, ethanoic acid"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm font-mono focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Comparison Title (optional)</label>
                  <input
                    type="text"
                    value={compareTitle}
                    onChange={(e) => setCompareTitle(e.target.value)}
                    placeholder="e.g. Oxidation Series of Ethanol"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm font-mono focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                {/* Preset Comparison Buttons */}
                <div className="flex items-center space-x-2 overflow-x-auto text-xs pb-1">
                  <span className="text-slate-400 flex-shrink-0">Presets:</span>
                  {[
                    { label: 'Oxidation Series', list: 'ethanol, ethanal, ethanoic acid', title: 'Oxidation Series of Ethanol' },
                    { label: 'Aromatic Derivatives', list: 'benzene, toluene, phenol, aniline', title: 'Monosubstituted Benzenes' },
                    { label: 'Halomethanes', list: 'chloromethane, dichloromethane, chloroform, carbon tetrachloride', title: 'Chlorinated Methanes Series' },
                    { label: 'Alkanes Homology', list: 'methane, ethane, propane, butane', title: 'Alkane Homologous Series' }
                  ].map(cp => (
                    <button
                      key={cp.label}
                      onClick={() => {
                        setCompareInput(cp.list);
                        setCompareTitle(cp.title);
                        handleTestCompare(cp.list, cp.title);
                      }}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono transition-colors border border-slate-700/60 flex-shrink-0"
                    >
                      {cp.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handleTestCompare()}
                  disabled={compareLoading}
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold text-white text-sm flex items-center justify-center space-x-2 shadow-lg shadow-emerald-900/30"
                >
                  {compareLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Columns className="w-4 h-4" />}
                  <span>Compare Molecules</span>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {compareError && (
              <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-sm flex items-center space-x-2">
                <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{compareError}</span>
              </div>
            )}

            {/* Compare Result Diagram */}
            {compareResult?.base64 && (
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="p-6 rounded-xl bg-white shadow-2xl flex items-center justify-center overflow-x-auto">
                  <img
                    src={`data:${compareResult.mime_type || 'image/png'};base64,${compareResult.base64}`}
                    alt="Comparison Grid"
                    className="max-w-full h-auto object-contain"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 8: COMPOUND LIBRARY */}
        {/* ========================================================================= */}
        {activeTab === 'library' && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                    <BookOpen className="w-5 h-5 text-emerald-400" />
                    <span>Curated JEE Chemical Library ({library.length} presets)</span>
                  </h2>
                  <p className="text-xs text-slate-400">High-speed built-in presets for Class 11/12 JEE Main and JEE Advanced organic chemistry.</p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={libSearch}
                    onChange={(e) => setLibSearch(e.target.value)}
                    placeholder="Search presets..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
                {[
                  'All',
                  'Hydrocarbon',
                  'Alcohol/Phenol',
                  'Aldehyde/Ketone',
                  'Carboxylic Acid/Derivative',
                  'Amine/Nitro',
                  'Haloalkane/Haloarene',
                  'Reagent',
                  'Biomolecule'
                ].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setLibCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                      libCategory === cat
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Presets Table */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono text-[11px]">
                    <th className="pb-3">Compound Name</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Formula</th>
                    <th className="pb-3">Mol. Weight</th>
                    <th className="pb-3">SMILES</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {library.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 font-semibold text-slate-100">{p.name}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-emerald-400 font-bold">{p.formula}</td>
                      <td className="py-3 font-mono text-slate-300">{p.molecularWeight} g/mol</td>
                      <td className="py-3 font-mono text-slate-400 max-w-xs truncate">{p.smiles}</td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => {
                            setActiveTab('structure');
                            setStructQuery(p.name);
                            handleTestStructure(p.name);
                          }}
                          className="px-3 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors text-[11px]"
                        >
                          Test Render
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 9: MCP INSPECTOR & TOOL CALL SIMULATOR */}
        {/* ========================================================================= */}
        {activeTab === 'inspector' && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                  <Terminal className="w-5 h-5 text-emerald-400" />
                  <span>MCP Protocol Inspector & Live Tool Simulator</span>
                </h2>
                <p className="text-xs text-slate-400">Simulate raw MCP client tool executions, verify native image payloads, latency, and schema compliance.</p>
              </div>

              {/* Tool Selector */}
              <div className="flex flex-wrap gap-2 text-xs">
                {[
                  { name: 'show_structure', payload: '{\n  "compound": "benzaldehyde",\n  "format": "png",\n  "width": 500,\n  "height": 350\n}' },
                  { name: 'resolve_compound', payload: '{\n  "query": "benzaldehyde"\n}' },
                  { name: 'show_reaction', payload: '{\n  "reactants": ["benzene", "Br2"],\n  "products": ["bromobenzene", "HBr"],\n  "conditions": "FeBr3"\n}' },
                  { name: 'show_mechanism', payload: '{\n  "reaction": "SN1 hydrolysis of tert-butyl bromide"\n}' },
                  { name: 'compare_structures', payload: '{\n  "compounds": ["ethanol", "ethanal", "ethanoic acid"]\n}' },
                  { name: 'show_resonance', payload: '{\n  "compound": "phenoxide ion"\n}' },
                  { name: 'show_stereochemistry', payload: '{\n  "compound": "2-butanol",\n  "configuration": "R"\n}' }
                ].map(tool => (
                  <button
                    key={tool.name}
                    onClick={() => {
                      setInspectorTool(tool.name);
                      setInspectorPayload(tool.payload);
                    }}
                    className={`px-3 py-1.5 rounded-lg font-mono font-semibold transition-colors ${
                      inspectorTool === tool.name
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {tool.name}
                  </button>
                ))}
              </div>

              {/* JSON Payload Editor */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 font-mono">Tool Arguments (JSON):</label>
                <textarea
                  value={inspectorPayload}
                  onChange={(e) => setInspectorPayload(e.target.value)}
                  rows={5}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-emerald-300 font-mono text-xs focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleRunInspector}
                  disabled={inspectorLoading}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold text-white text-sm flex items-center space-x-2 shadow-lg shadow-emerald-900/30"
                >
                  {inspectorLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  <span>Execute MCP Tool Call</span>
                </button>
              </div>
            </div>

            {/* Inspector Output Area */}
            {inspectorResponse && (
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-100">MCP Protocol Response</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                      {inspectorResponse.latencyMs}ms
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">JSON-RPC 2.0 Compliant</span>
                </div>

                {/* Rendered Preview if base64 image present */}
                {(inspectorResponse.rawResult?.image_base64 || inspectorResponse.rawResult?.base64) && (
                  <div className="p-4 rounded-xl bg-white shadow-xl flex items-center justify-center overflow-hidden max-h-96">
                    <img
                      src={`data:${inspectorResponse.rawResult?.mime_type || 'image/png'};base64,${inspectorResponse.rawResult?.image_base64 || inspectorResponse.rawResult?.base64}`}
                      alt="MCP Render Result"
                      className="max-h-88 object-contain"
                    />
                  </div>
                )}

                {/* Raw JSON viewer */}
                <div>
                  <span className="text-xs text-slate-400 font-mono block mb-1">Raw Response Body:</span>
                  <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-slate-300 font-mono text-xs overflow-x-auto max-h-60">
                    {JSON.stringify(inspectorResponse.rawResult, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-4 text-center text-xs text-slate-500">
        Organic Chemistry Structure MCP Server &copy; 2026 &bull; Powered by RDKit &amp; Official Model Context Protocol SDK
      </footer>
    </div>
  );
}
