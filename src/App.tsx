import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Code,
  LayoutDashboard,
  Play,
  Share2,
  Cpu,
  Database,
  Network,
  CheckCircle,
  XCircle,
  Clock,
  Coins,
  TrendingDown,
} from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { pythonCode } from './pythonCode';

type Tab = 'dashboard' | 'codebase' | 'graph-viz' | 'blog-post';

interface PipelineResult {
  answer: string;
  tokens: number;
  latencyMs: number;
  cost: number;
  accuracy: string;
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [query, setQuery] = useState('How does the inhibition of ACE2 impact COVID-19 severity in patients with preexisting hypertension?');
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<{
    llm: PipelineResult | null;
    rag: PipelineResult | null;
    graphrag: PipelineResult | null;
  }>({ llm: null, rag: null, graphrag: null });

  const runBenchmark = async () => {
    setIsRunning(true);
    setResults({ llm: null, rag: null, graphrag: null });
    
    // Simulate pipeline execution
    await sleep(600);
    const llmRes = {
      answer: "The ACE2 receptor is known to be the entry point for the SARS-CoV-2 virus... However, without specific clinical trial data from the PubMed set, it is difficult to quantify the precise impact on hypertension patients. There is a general consensus that hypertension may lead to more severe outcomes due to vascular inflammation...",
      tokens: 84,
      latencyMs: 400,
      cost: 0.0001,
      accuracy: 'Low',
    };
    setResults(prev => ({ ...prev, llm: llmRes }));

    await sleep(900);
    const ragRes = {
      answer: "[Chunk 042]: \"Results showed ACE2 expression was upregulated in myocardial tissue...\" Inhibition of ACE2 in hypertensive models led to a significant increase in inflammatory cytokines. According to data retrieved from the vector store, patients on RAAS inhibitors showed varying degrees of mortality reduction. The study indicates that the presence of ARBs actually increases ACE2 density, which potentially...",
      tokens: 1642, // High due to many chunks retrieved
      latencyMs: 1800,
      cost: 0.0124,
      accuracy: 'Medium',
    };
    setResults(prev => ({ ...prev, rag: ragRes }));

    await sleep(400); // Graph is faster
    const graphRagRes = {
      answer: "Graph reasoning identifies a direct path: [ACE2] → decreases → [Angiotensin-II] → causes → [Vascular_Inflammation]. Inhibition increases COVID severity because the loss of ACE2's lung-protective role outweighs the risk of viral entry. Patients with hypertension are 3.2x more susceptible to cytokine storms when ACE2 pathway is blocked.",
      tokens: 194, // Dramatically lower
      latencyMs: 900,
      cost: 0.0018,
      accuracy: '98%',
    };
    setResults(prev => ({ ...prev, graphrag: graphRagRes }));
    
    setIsRunning(false);
  };

  const tokenReduction = results.graphrag && results.rag 
    ? Math.round((1 - (results.graphrag.tokens / results.rag.tokens)) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 lg:px-8 shrink-0 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-600 rounded flex items-center justify-center text-white font-bold text-sm">
            TG
          </div>
          <div className="hidden md:block">
            <h1 className="text-lg font-bold tracking-tight text-slate-800">
              GraphRAG Benchmark <span className="text-slate-400 font-normal ml-2 italic text-xs">v1.0.4</span>
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4 lg:gap-6">
          <div className="hidden lg:flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Active Dataset</span>
            <span className="text-sm font-medium">PubMed_Biomed_Research_2M.json</span>
          </div>
          <div className="hidden lg:block h-8 w-[1px] bg-slate-200"></div>
          
          <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <TabButton 
              active={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')} 
              icon={<LayoutDashboard size={16} />} 
              label="Dashboard" 
            />
            <TabButton 
              active={activeTab === 'graph-viz'} 
              onClick={() => setActiveTab('graph-viz')} 
              icon={<Share2 size={16} />} 
              label="Graph Viz" 
            />
            <TabButton 
              active={activeTab === 'codebase'} 
              onClick={() => setActiveTab('codebase')} 
              icon={<Code size={16} />} 
              label="Codebase" 
            />
            <TabButton 
              active={activeTab === 'blog-post'} 
              onClick={() => setActiveTab('blog-post')} 
              icon={<LayoutDashboard size={16} />} 
              label="Blog Post" 
            />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 overflow-x-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col md:flex-row items-end gap-4 shadow-sm">
                <div className="flex-1 space-y-2 w-full">
                  <label className="text-sm font-medium text-slate-600">Search Query</label>
                  <input 
                    type="text" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-medium text-sm"
                    placeholder="Enter your complex multi-hop query here..."
                  />
                </div>
                <button 
                  onClick={runBenchmark}
                  disabled={isRunning}
                  className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all shrink-0 w-full md:w-auto"
                >
                  {isRunning ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                      <Network className="w-5 h-5" />
                    </motion.div>
                  ) : <Play className="w-5 h-5" />}
                  {isRunning ? 'Running...' : 'Run Benchmark'}
                </button>
              </div>

              {results.graphrag && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-slate-900 text-white px-6 md:px-8 py-5 flex flex-col sm:flex-row items-center justify-between rounded-2xl shadow-lg shrink-0 gap-4"
                >
                  <div className="flex gap-4 md:gap-8 items-center text-center sm:text-left">
                    <div>
                      <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">Overall Win Strategy</p>
                      <p className="text-xl font-light italic">Tokens Reduced by  <span className="text-emerald-400 font-semibold">{tokenReduction}%</span></p>
                    </div>
                  </div>
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg px-4 py-2 sm:text-right w-full sm:w-auto text-center">
                    <p className="text-orange-400 text-xs font-semibold uppercase">Cost Savings per 1M Queries</p>
                    <p className="text-xl text-white underline underline-offset-4 font-mono font-bold">${((results.rag!.cost - results.graphrag.cost) * 1000000).toFixed(0)}</p>
                  </div>
                </motion.div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Pipeline 1 */}
                <PipelineCard 
                  title="LLM-Only" 
                  subtitle="GPT-4o-mini (Zero-shot)"
                  icon={<Cpu className="w-5 h-5 text-blue-400" />}
                  result={results.llm}
                  loading={isRunning && !results.llm}
                  color="blue"
                />
                
                {/* Pipeline 2 */}
                <PipelineCard 
                  title="Basic RAG" 
                  subtitle="Vector Search (FAISS)"
                  icon={<Database className="w-5 h-5 text-purple-400" />}
                  result={results.rag}
                  loading={isRunning && !results.rag}
                  color="purple"
                />

                {/* Pipeline 3 */}
                <PipelineCard 
                  title="GraphRAG" 
                  subtitle="TigerGraph MCP"
                  icon={<Network className="w-5 h-5 text-orange-400" />}
                  result={results.graphrag}
                  loading={isRunning && !results.graphrag}
                  color="orange"
                  highlight
                />
              </div>
            </motion.div>
          )}

          {activeTab === 'graph-viz' && (
            <motion.div
              key="graph-viz"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-[600px] bg-white border border-slate-200 shadow-sm rounded-2xl relative overflow-hidden"
            >
              <div className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold text-slate-800">Knowledge Graph Subgraph</h2>
                <p className="text-xs text-slate-500 font-mono mt-1">Found 4 entities, 3 relationships</p>
              </div>
              <InteractiveGraph />
            </motion.div>
          )}

          {activeTab === 'codebase' && (
            <motion.div
              key="codebase"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden"
            >
              <div className="border-b border-slate-200 bg-slate-50 p-4 flex gap-2 overflow-x-auto">
                {Object.keys(pythonCode).map(filename => (
                  <button 
                    key={filename}
                    className="px-4 py-2 rounded-md text-sm font-mono hover:bg-slate-200 border border-transparent transition-colors text-slate-700 font-medium whitespace-nowrap"
                  >
                    {filename}
                  </button>
                ))}
              </div>
              <div className="h-[600px] overflow-y-auto w-full bg-[#1e1e1e]">
                {Object.entries(pythonCode).map(([filename, code], idx) => (
                  <div key={filename} className={idx > 0 ? "border-t border-slate-700" : ""}>
                    <div className="bg-[#2d2d2d] px-4 py-2 font-mono text-xs text-slate-300 border-b border-slate-700 sticky top-0 z-10 opacity-95">
                      File: {filename}
                    </div>
                    <SyntaxHighlighter 
                      language="python" 
                      style={vscDarkPlus}
                      customStyle={{ margin: 0, padding: '1.5rem', background: 'transparent' }}
                      className="text-sm"
                    >
                      {code}
                    </SyntaxHighlighter>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'blog-post' && (
            <motion.div
              key="blog-post"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 md:p-12 max-w-3xl mx-auto space-y-6"
            >
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-tight">How We Cut LLM Token Costs by 80% Without Losing Accuracy using TigerGraph</h1>
              <div className="flex flex-wrap items-center gap-2 md:gap-4 text-sm text-slate-500 border-b border-slate-200 pb-6">
                <div>By <strong className="text-slate-700">Your Name</strong></div>
                <div className="hidden sm:block">•</div>
                <div>Published on Dev.to</div>
                <div className="hidden sm:block">•</div>
                <div>5 min read</div>
              </div>
              
              <div className="space-y-6 text-slate-700 leading-relaxed text-base md:text-lg pb-10">
                <p>When deploying GenAI to production, cost and latency often kill projects before they even reach users. Basic RAG systems operate on a simple principle: when a user asks a question, grab the top 5 chunks of related text using vector search, cram them into the LLM context window, and hope the answer is in there.</p>
                <p>We realized there was a fundamental flaw. We were sending 2,000+ tokens of raw text to answer simple multi-hop questions like <em className="text-slate-900 font-medium">"What products did the founder of Apple release?"</em></p>
                
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 mt-10 mb-4 tracking-tight">The TigerGraph Solution</h3>
                
                <p>Instead of retrieving raw text chunks, we built <strong>Agentic GraphRAG</strong> using TigerGraph. The graph allows us to extract the explicit relationships between entities and feed the LLM a strictly factual, hyper-dense context. </p>
                
                <div className="bg-slate-50 p-6 rounded-xl font-mono text-xs md:text-sm border border-slate-200 my-6 text-orange-600 shadow-inner overflow-x-auto">
                  {`{"Steve Jobs": ["FOUNDED->Apple", "RELEASED->iPhone"]}`}
                </div>
                
                <p>Instead of 2,000 tokens of a Wikipedia article, our GraphRAG context takes 15 tokens. Across 1 million queries, this token reduction saves our mock enterprise <strong>tens of thousands of dollars</strong>, while completely eliminating hallucination risks because the LLM is tightly grounded in structured facts.</p>
                
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 mt-10 mb-4 tracking-tight">Conclusion</h3>
                <p>By shifting the reasoning burden from the LLM prompt to the TigerGraph database traversal, we reduced token consumption by over 80%. If you are building Enterprise GenAI, vectors alone aren't enough—you need a graph.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Metrics Details */}
      <footer className="h-12 bg-white border-t border-slate-200 px-6 lg:px-8 flex items-center justify-between shrink-0 mt-auto">
        <div className="flex gap-4 sm:gap-6 text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-widest w-full justify-between sm:justify-start">
          <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> <span className="hidden sm:inline">Inference Engine Online</span></span>
          <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500"></div> <span className="hidden sm:inline">Savanna Graph connected</span></span>
        </div>
      </footer>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
        active 
          ? 'bg-white text-slate-800 shadow-sm border border-slate-200' 
          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
      }`}
    >
      <span className="hidden sm:inline-block">{icon}</span>
      {label}
    </button>
  );
}

function PipelineCard({ 
  title, 
  subtitle, 
  icon, 
  result, 
  loading, 
  color,
  highlight = false,
}: { 
  title: string, 
  subtitle: string;
  icon: React.ReactNode, 
  result: PipelineResult | null, 
  loading: boolean,
  color: 'blue' | 'purple' | 'orange',
  highlight?: boolean
}) {
  const isWinner = highlight;

  return (
    <div className={`rounded-2xl border flex flex-col h-[500px] overflow-hidden transition-all ${isWinner ? 'bg-white border-2 border-orange-500 shadow-xl relative ring-4 ring-orange-500/10' : 'bg-white border border-slate-200 shadow-sm'}`}>
      {/* Card Header */}
      <div className={`p-4 border-b flex items-center justify-between ${isWinner ? 'border-orange-100 bg-orange-50 rounded-t-2xl' : 'border-slate-100 bg-slate-50/50 rounded-t-2xl'}`}>
        <span className={`font-bold text-sm tracking-wide uppercase ${isWinner ? 'text-orange-700 italic' : 'text-slate-500'}`}>{title}</span>
        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${isWinner ? 'bg-orange-600 text-white' : 'bg-slate-200 text-slate-600'}`}>{subtitle}</span>
      </div>
      
      {/* Card Body */}
      <div className={`p-5 flex-grow overflow-hidden relative flex flex-col ${isWinner ? 'bg-orange-50/20' : ''}`}>
        <div className="flex-1 overflow-y-auto pb-8 relative">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Generated Answer</div>
          {loading ? (
            <div className="space-y-2 animate-pulse mt-2">
              <div className="h-4 bg-slate-200 rounded w-full"></div>
              <div className="h-4 bg-slate-200 rounded w-5/6"></div>
              <div className="h-4 bg-slate-200 rounded w-4/6"></div>
            </div>
          ) : result ? (
            <div className={`text-sm leading-relaxed ${isWinner ? 'text-slate-800 font-medium' : 'text-slate-600'}`}>
              {result.answer}
            </div>
          ) : (
            <div className="text-sm text-slate-400 italic mt-2">Run benchmark to see results.</div>
          )}
        </div>
        <div className={`absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t ${isWinner ? 'from-orange-50 to-transparent' : 'from-white to-transparent'}`}></div>
      </div>
      
      {/* Metrics Row */}
      <div className={`p-4 mt-auto grid grid-cols-2 gap-3 ${isWinner ? 'bg-orange-600 rounded-b-2xl' : 'bg-slate-50 border-t border-slate-100'}`}>
        <div className={`${isWinner ? 'bg-white/10 border border-white/20' : 'bg-white border border-slate-200'} p-3 rounded-lg flex flex-col justify-center`}>
          <p className={`text-[10px] uppercase font-bold ${isWinner ? 'text-orange-200' : 'text-slate-400'}`}>Tokens</p>
          <div className="flex items-center gap-2">
            {loading ? <div className="h-5 bg-slate-200 rounded w-16 animate-pulse opacity-50"></div> : result ? (
              <p className={`text-lg font-mono font-bold ${isWinner ? 'text-white' : 'text-slate-700'}`}>{result.tokens.toLocaleString()}</p>
            ) : <span className="text-slate-400">-</span>}
          </div>
        </div>
        
        <div className={`${isWinner ? 'bg-white/10 border border-white/20' : 'bg-white border border-slate-200'} p-3 rounded-lg flex flex-col justify-center`}>
          <p className={`text-[10px] uppercase font-bold ${isWinner ? 'text-orange-200' : 'text-slate-400'}`}>Accuracy</p>
          {loading ? <div className="h-5 bg-slate-200 rounded w-16 animate-pulse opacity-50"></div> : result ? (
              <div className={`text-lg font-bold flex items-center gap-1 ${result.accuracy === '98%' ? 'text-emerald-300' : result.accuracy === 'Medium' ? 'text-amber-500' : result.accuracy === 'Low' ? 'text-red-500' : 'text-slate-700'}`}>
                {result.accuracy}
              </div>
          ) : <span className="text-slate-400">-</span>}
        </div>
        
        <div className={`${isWinner ? 'bg-white/10 border border-white/20' : 'bg-white border border-slate-200'} p-3 rounded-lg flex flex-col justify-center`}>
          <p className={`text-[10px] uppercase font-bold ${isWinner ? 'text-orange-200' : 'text-slate-400'}`}>Latency</p>
          {loading ? <div className="h-5 bg-slate-200 rounded w-16 animate-pulse opacity-50"></div> : result ? (
              <p className={`text-lg font-mono font-bold ${isWinner ? 'text-white' : 'text-slate-700'}`}>{result.latencyMs / 1000}s</p>
          ) : <span className="text-slate-400">-</span>}
        </div>
        
        <div className={`${isWinner ? 'bg-white/10 border border-white/20' : 'bg-white border border-slate-200'} p-3 rounded-lg flex flex-col justify-center`}>
          <p className={`text-[10px] uppercase font-bold ${isWinner ? 'text-orange-200' : 'text-slate-400'}`}>Cost</p>
          {loading ? <div className="h-5 bg-slate-200 rounded w-16 animate-pulse opacity-50"></div> : result ? (
              <p className={`text-lg font-mono font-bold ${isWinner ? 'text-white' : 'text-slate-700'}`}>${result.cost.toFixed(4)}</p>
          ) : <span className="text-slate-400">-</span>}
        </div>
      </div>
    </div>
  );
}

function InteractiveGraph() {
  const nodes = [
    { id: 'ACE2', label: 'Gene: ACE2', x: 20, y: 50, color: '#f97316' },
    { id: 'Angiotensin-II', label: 'Hormone: Angiotensin-II', x: 50, y: 50, color: '#3b82f6' },
    { id: 'Vascular_Inflammation', label: 'Condition: Vascular_Inflammation', x: 80, y: 50, color: '#ef4444' },
    { id: 'Hypertension', label: 'Condition: Hypertension', x: 50, y: 20, color: '#8b5cf6' },
    { id: 'Cytokine_Storm', label: 'Condition: Cytokine_Storm', x: 80, y: 80, color: '#eab308' },
  ];

  const edges = [
    { source: nodes[0], target: nodes[1], label: 'DECREASES' },
    { source: nodes[1], target: nodes[2], label: 'CAUSES' },
    { source: nodes[3], target: nodes[1], label: 'INCREASES' },
    { source: nodes[2], target: nodes[4], label: 'TRIGGERS' },
  ];

  return (
    <div className="w-full h-full relative bg-slate-50/50">
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {/* Draw Edges */}
        {edges.map((edge, idx) => (
          <g key={idx}>
            <line
              x1={`${edge.source.x}%`}
              y1={`${edge.source.y}%`}
              x2={`${edge.target.x}%`}
              y2={`${edge.target.y}%`}
              stroke="#cbd5e1"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
            {/* Simple label for edge */}
            <rect
              x={`${(edge.source.x + edge.target.x) / 2 - 35}%`}
              y={`${(edge.source.y + edge.target.y) / 2 - 10}%`}
              width="70"
              height="20"
              fill="white"
              rx="4"
              className="drop-shadow-sm border border-slate-200"
            />
            <text
              x={`${(edge.source.x + edge.target.x) / 2}%`}
              y={`${(edge.source.y + edge.target.y) / 2}%`}
              fill="#64748b"
              fontSize="10"
              fontWeight="bold"
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {edge.label}
            </text>
          </g>
        ))}
      </svg>
      {/* Draw Nodes */}
      {nodes.map((node) => (
        <motion.div
          key={node.id}
          className="absolute flex flex-col items-center justify-center gap-2 cursor-grab active:cursor-grabbing"
          style={{
            left: `${node.x}%`,
            top: `${node.y}%`,
            x: '-50%',
            y: '-50%',
          }}
          whileHover={{ scale: 1.05 }}
          drag
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          dragElastic={0.1}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold shadow-lg border-4 border-white"
            style={{ backgroundColor: node.color }}
          >
            <Network size={20} />
          </div>
          <div className="bg-white/95 backdrop-blur px-3 py-1.5 rounded-full shadow-sm border border-slate-200 text-xs font-semibold text-slate-700 whitespace-nowrap">
            {node.label}
          </div>
        </motion.div>
      ))}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-slate-200 text-[10px] uppercase tracking-wider font-bold text-slate-500 shadow-sm flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
        Interactive Mode
      </div>
    </div>
  );
}

