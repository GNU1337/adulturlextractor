import React, { useState, useEffect } from "react";
import { 
  Plus, Settings, Database, FolderOpen, Activity, AlertCircle, 
  HelpCircle, ShieldCheck, HeartPulse, RefreshCw, Terminal, 
  Sparkles, Layers, Sliders, PlayCircle, Eye, LogOut, CheckCircle, Search, Trash2,
  DownloadIcon
} from "lucide-react";
import { SpiderConfig, SpiderStatus, ScrapedUrl, Folder, CrawlMetricPoint, DownloadItem } from "./types";
import SpidersList from "./components/SpidersList";
import SpiderForm from "./components/SpiderForm";
import ResultsGallery from "./components/ResultsGallery";
import PerformanceChart from "./components/PerformanceChart";
import NotificationPanel from "./components/NotificationPanel";
import DownloadCenter from "./components/DownloadCenter";

export default function App() {
  // Spiders state
  const [spiders, setSpiders] = useState<Array<{ config: SpiderConfig; status: SpiderStatus }>>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [urls, setUrls] = useState<ScrapedUrl[]>([]);
  
  // Realtime Chart Metrics
  const [metrics, setMetrics] = useState<CrawlMetricPoint[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Downloads view state
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [activeTab, setActiveTab] = useState<'spiders' | 'downloads'>('spiders');

  // Selected state indices
  const [selectedFolderId, setSelectedFolderId] = useState("f-all");
  const [showDeployForm, setShowDeployForm] = useState(false);
  const [editingConfig, setEditingConfig] = useState<SpiderConfig | null>(null);
  
  // Filter panel details inside media drawer
  const [searchQuery, setSearchQuery] = useState("");
  const [resolutionFilter, setResolutionFilter] = useState("");
  const [minDurationFilter, setMinDurationFilter] = useState("");
  const [maxDurationFilter, setMaxDurationFilter] = useState("");

  // Inspect Live logs panel state
  const [viewLogsSpider, setViewLogsSpider] = useState<{ config: SpiderConfig; status: SpiderStatus } | null>(null);

  // Loading Indicator
  const [syncing, setSyncing] = useState(false);

  // Fetch all states initially
  const syncData = async () => {
    setSyncing(true);
    try {
      const spRes = await fetch("/api/spiders");
      if (spRes.ok) {
        const data = await spRes.json();
        setSpiders(data);
      }

      const fRes = await fetch("/api/folders");
      if (fRes.ok) {
        const data = await fRes.json();
        setFolders(data);
      }

      const mRes = await fetch("/api/metrics");
      if (mRes.ok) {
        const data = await mRes.json();
        setMetrics(data);
      }

      const nRes = await fetch("/api/notifications");
      if (nRes.ok) {
        const data = await nRes.json();
        setNotifications(data);
      }

      const dlRes = await fetch("/api/downloads");
      if (dlRes.ok) {
        const data = await dlRes.json();
        setDownloads(data);
      }

      await fetchUrls();
    } catch (e) {
      console.error("API sync failure:", e);
    } finally {
      setSyncing(false);
    }
  };

  const fetchUrls = async () => {
    try {
      let queryParams = `?category=${selectedFolderId}`;
      if (searchQuery) queryParams += `&keyword=${encodeURIComponent(searchQuery)}`;
      if (resolutionFilter) queryParams += `&resolution=${resolutionFilter}`;
      if (minDurationFilter) queryParams += `&minDuration=${minDurationFilter}`;
      if (maxDurationFilter) queryParams += `&maxDuration=${maxDurationFilter}`;

      const uRes = await fetch(`/api/urls${queryParams}`);
      if (uRes.ok) {
        const data = await uRes.json();
        setUrls(data);
      }
    } catch (e) {
      console.error("Failed fetching URLs catalog:", e);
    }
  };

  // Re-fetch parameters when selection indices shift
  useEffect(() => {
    fetchUrls();
  }, [selectedFolderId, searchQuery, resolutionFilter, minDurationFilter, maxDurationFilter]);

  // Periodic poll to show realtime crawl speeds, page changes and updates
  useEffect(() => {
    syncData();
    const interval = setInterval(() => {
      // Re-fetch dynamic stats silent
      fetch("/api/spiders")
        .then(res => res.json())
        .then(data => {
          setSpiders(data);
          // If we are currently inspecting a specific spider logs, update it
          if (viewLogsSpider) {
            const current = data.find((s: any) => s.config.id === viewLogsSpider.config.id);
            if (current) setViewLogsSpider(current);
          }
        });

      fetch("/api/metrics")
        .then(res => res.json())
        .then(data => setMetrics(data));

      fetch("/api/notifications")
        .then(res => res.json())
        .then(data => setNotifications(data));

      fetch("/api/downloads")
        .then(res => res.json())
        .then(data => setDownloads(data));

      fetchUrls();
    }, 4000);

    return () => clearInterval(interval);
  }, [selectedFolderId]);

  // Deploy / Update Spider Trigger
  const handleSaveSpider = async (configData: any) => {
    try {
      if (configData.id) {
        // Edit Mode
        const res = await fetch(`/api/spiders/${configData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(configData)
        });
        if (res.ok) {
          syncData();
          setEditingConfig(null);
          setShowDeployForm(false);
        }
      } else {
        // Create Mode
        const res = await fetch("/api/spiders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(configData)
        });
        if (res.ok) {
          syncData();
          setShowDeployForm(false);
        }
      }
    } catch (e) {
      console.error("Failed persisting Spider Config:", e);
    }
  };

  // Operations
  const handleStart = async (id: string) => {
    try {
      await fetch(`/api/spiders/${id}/start`, { method: "POST" });
      syncData();
    } catch (e) {
      console.error(e);
    }
  };

  const handlePause = async (id: string) => {
    try {
      await fetch(`/api/spiders/${id}/pause`, { method: "POST" });
      syncData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleResume = async (id: string) => {
    try {
      await fetch(`/api/spiders/${id}/resume`, { method: "POST" });
      syncData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleStop = async (id: string) => {
    try {
      await fetch(`/api/spiders/${id}/stop`, { method: "POST" });
      syncData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleReset = async (id: string) => {
    try {
      await fetch(`/api/spiders/${id}/reset`, { method: "POST" });
      syncData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteSpider = async (id: string) => {
    if (confirm("Are you sure you want to stop and delete this Spider Configuration? Logs and status outputs will be cleared.")) {
      try {
        await fetch(`/api/spiders/${id}`, { method: "DELETE" });
        syncData();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleAddFolder = async (name: string, color: string, description?: string) => {
    try {
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color, description })
      });
      if (res.ok) syncData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteFolder = async (id: string) => {
    try {
      const res = await fetch(`/api/folders/${id}`, { method: "DELETE" });
      if (res.ok) syncData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteUrl = async (id: string) => {
    try {
      const res = await fetch(`/api/urls/${id}`, { method: "DELETE" });
      if (res.ok) fetchUrls();
    } catch (e) {
      console.error(e);
    }
  };

  const handleBulkCategorize = async (urlIds: string[], folderId: string) => {
    try {
      const res = await fetch("/api/urls/categorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urlIds, categoryId: folderId })
      });
      if (res.ok) fetchUrls();
    } catch (e) {
      console.error(e);
    }
  };

  const handleQueueDownload = async (urlId: string) => {
    try {
      const res = await fetch("/api/downloads/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urlId })
      });
      if (res.ok) {
        const dlRes = await fetch("/api/downloads");
        if (dlRes.ok) {
          const dlData = await dlRes.json();
          setDownloads(dlData);
        }
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to enqueue download.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleQueuePlaylist = async (playlistUrl: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/downloads/playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playlistUrl })
      });
      if (res.ok) {
        const dlRes = await fetch("/api/downloads");
        if (dlRes.ok) {
          const dlData = await dlRes.json();
          setDownloads(dlData);
        }
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const handlePauseDownload = async (id: string) => {
    try {
      await fetch(`/api/downloads/${id}/pause`, { method: "POST" });
      const dlRes = await fetch("/api/downloads");
      if (dlRes.ok) {
        const dlData = await dlRes.json();
        setDownloads(dlData);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleResumeDownload = async (id: string) => {
    try {
      await fetch(`/api/downloads/${id}/resume`, { method: "POST" });
      const dlRes = await fetch("/api/downloads");
      if (dlRes.ok) {
        const dlData = await dlRes.json();
        setDownloads(dlData);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteDownload = async (id: string) => {
    try {
      await fetch(`/api/downloads/${id}`, { method: "DELETE" });
      const dlRes = await fetch("/api/downloads");
      if (dlRes.ok) {
        const dlData = await dlRes.json();
        setDownloads(dlData);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearNotifications = async () => {
    try {
      await fetch("/api/notifications/clear", { method: "POST" });
      syncData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none antialiased">
      {/* Dynamic Header */}
      <header className="bg-slate-900 border-b border-indigo-950 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600/10 p-2.5 rounded-xl border border-indigo-500/30">
            <Activity className="h-6 w-6 text-indigo-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight uppercase text-indigo-50">
                SPIDER CONTROL ROOM
              </h1>
              <span className="text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-800/60 px-2 py-0.5 rounded font-bold uppercase tracking-widest">
                STAGE ONE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              Autonomous Extraction Node, Criteria Aggregators & Multi-Platform Web Scrubbers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-4 bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800/80">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs text-slate-400">PROXY: <strong className="text-slate-200">ACTIVE ROTATOR</strong></span>
            </div>
            <div className="h-4 w-[1px] bg-slate-800" />
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-400">HOST: <strong className="text-indigo-400">0.0.0.0:3000</strong></span>
            </div>
          </div>

          <button 
            onClick={syncData}
            disabled={syncing}
            className={`p-2.5 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-xl transition-all ${syncing ? "animate-spin" : ""}`}
            title="Force telemetry rebuild"
          >
            <RefreshCw className="h-4 w-4 text-slate-300" />
          </button>

          <button 
            onClick={() => {
              setEditingConfig(null);
              setShowDeployForm(true);
              setActiveTab('spiders');
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl tracking-wider uppercase transition-all shadow-lg shadow-indigo-600/20 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Deploy Crawler
          </button>
        </div>
      </header>

      {/* View Choice Navigation Strip */}
      <div className="bg-slate-900 border-b border-indigo-950/40 px-6 py-2">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button
            onClick={() => setActiveTab('spiders')}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'spiders'
                ? 'bg-slate-950 text-indigo-400 border border-slate-800'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/50'
            }`}
          >
            <Sliders className="h-4 w-4 text-indigo-500" />
            Configured Spiders
          </button>
          
          <button
            onClick={() => setActiveTab('downloads')}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer relative ${
              activeTab === 'downloads'
                ? 'bg-slate-950 text-indigo-400 border border-slate-800'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/50'
            }`}
          >
            <DownloadIcon className="h-4 w-4 text-indigo-500" />
            System Download Queue
            {downloads.filter(d => ["queued", "downloading"].includes(d.status)).length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[8px] font-mono font-bold text-white tracking-normal shadow">
                {downloads.filter(d => ["queued", "downloading"].includes(d.status)).length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid Area */}
      <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Dynamic Warning Alert banner for adult content scraper disclaimer */}
        <div className="bg-amber-950/20 border border-amber-900/40 p-4 rounded-2xl text-xs text-amber-300 leading-relaxed flex items-start gap-4">
          <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-slate-200 mb-1">
              PROCEED WITH ETHICAL DATA PARSING PRACTICE
            </h4>
            <p className="text-amber-400/90 leading-relaxed max-w-5xl">
              This node compiles scraping agents configured with anti-scraping mitigation bypass mechanics (headers, dynamic delays, user-agents). Please utilize proper delays (<strong className="text-amber-200">&gt; 1 sec</strong>) when scrubbing heavy streaming platforms. Video URLs extracted represent streaming targets configured by user filters.
            </p>
          </div>
        </div>

        {/* System Alert Notification Panel drawer */}
        <NotificationPanel 
          notifications={notifications} 
          onClear={handleClearNotifications} 
        />

        {/* Form Deployment section */}
        {showDeployForm && activeTab === 'spiders' && (
          <div className="animate-in fade-in slide-in-from-top duration-300">
            <SpiderForm 
              folders={folders}
              editingConfig={editingConfig}
              onSave={handleSaveSpider}
              onCancel={() => {
                setShowDeployForm(false);
                setEditingConfig(null);
              }}
            />
          </div>
        )}

        {/* Tab-driven layout rendering */}
        {activeTab === 'spiders' ? (
          <>
            {/* Dynamic Spiders active & idle grids */}
            <div className="space-y-6">
              {/* Active crawlers with live metrics */}
              <SpidersList 
                spiders={spiders}
                activeOnly={true}
                onStart={handleStart}
                onPause={handlePause}
                onResume={handleResume}
                onStop={handleStop}
                onReset={handleReset}
                onDelete={handleDeleteSpider}
                onConfigureEdit={(config) => {
                  setEditingConfig(config);
                  setShowDeployForm(true);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                onSelectSpiderLogs={(item) => setViewLogsSpider(item)}
              />

              {/* Idle configured Spiders list */}
              <SpidersList 
                spiders={spiders}
                activeOnly={false}
                onStart={handleStart}
                onPause={handlePause}
                onResume={handleResume}
                onStop={handleStop}
                onReset={handleReset}
                onDelete={handleDeleteSpider}
                onConfigureEdit={(config) => {
                  setEditingConfig(config);
                  setShowDeployForm(true);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                onSelectSpiderLogs={(item) => setViewLogsSpider(item)}
              />
            </div>

            {/* Selected spider runtime log modal segment */}
            {viewLogsSpider && (
              <div className="bg-slate-900 border border-indigo-950 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-5 w-5 text-indigo-400" />
                    <h4 className="font-bold text-xs tracking-widest uppercase text-slate-200">
                      CRITICAL RUNTIME DIAGNOSTIC LOGS: {viewLogsSpider.config.name}
                    </h4>
                  </div>
                  <button 
                    onClick={() => setViewLogsSpider(null)}
                    className="text-xs font-bold text-rose-400 hover:text-rose-300"
                  >
                    Close Trace Log
                  </button>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-950 font-mono text-[11px] h-48 overflow-y-auto space-y-1 text-slate-300">
                  {viewLogsSpider.status.logs.length === 0 ? (
                    <div className="text-slate-600 italic">No logs initialized yet. Trigger run...</div>
                  ) : (
                    viewLogsSpider.status.logs.map((log, idx) => {
                      let logColor = "text-slate-400";
                      if (log.includes("[SAVED]")) logColor = "text-emerald-400 font-bold";
                      if (log.includes("[WARNING]")) logColor = "text-amber-400";
                      if (log.includes("[CRITICAL]") || log.includes("[FILTERED]")) logColor = "text-rose-400";
                      if (log.includes("[SYSTEM]")) logColor = "text-indigo-400";

                      return (
                        <div key={idx} className={`${logColor} hover:bg-slate-900/40 p-0.5 rounded transition-colors`}>
                          {log}
                        </div>
                      );
                    })
                  )}
                </div>
                
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                  <span>BUFFER THREADING: ACTIVE SECURE CLOUD GATEWAY</span>
                  <span>LINES TRACKED: {viewLogsSpider.status.logs.length}</span>
                </div>
              </div>
            )}

            {/* Realtime Performance Graph Grid */}
            <section>
              <PerformanceChart metrics={metrics} />
            </section>
          </>
        ) : (
          <div className="animate-in fade-in duration-300">
            <DownloadCenter 
              downloads={downloads}
              onPause={handlePauseDownload}
              onResume={handleResumeDownload}
              onDelete={handleDeleteDownload}
              onQueuePlaylist={handleQueuePlaylist}
              syncData={syncData}
            />
          </div>
        )}

        {/* Ingested media library shelf */}
        <section className="space-y-4">
          <div className="border-b border-indigo-950 pb-2">
            <h3 className="font-bold text-xs tracking-widest uppercase text-indigo-400">
              📁 INGESTED TARGETS MEDIA HARVEST REPOSITORY
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Browse video stream links classified into target folders matching custom spider criteria.
            </p>
          </div>

          {/* Catalog Filters Bar */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Search Keywords</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="e.g. beach, Eva, vacation"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-200 outline-none"
                />
                <Search className="absolute right-2.5 top-2 h-3.5 w-3.5 text-slate-500" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Target Resolution</label>
              <select 
                value={resolutionFilter}
                onChange={e => setResolutionFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-300 outline-none"
              >
                <option value="">All Formats & Pixels</option>
                <option value="1080p">1080p Full-HD</option>
                <option value="720p">720p HD</option>
                <option value="480p">480p Media Standard</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Min Duration (Mins)</label>
              <input 
                type="number" 
                value={minDurationFilter}
                onChange={e => setMinDurationFilter(e.target.value)}
                placeholder="No limit"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Max Duration (Mins)</label>
              <input 
                type="number" 
                value={maxDurationFilter}
                onChange={e => setMaxDurationFilter(e.target.value)}
                placeholder="No limit"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 outline-none"
              />
            </div>
          </div>

          <ResultsGallery 
            urls={urls}
            folders={folders}
            selectedFolderId={selectedFolderId}
            onSelectFolder={(id) => setSelectedFolderId(id)}
            onDeleteUrl={handleDeleteUrl}
            onBulkCategorize={handleBulkCategorize}
            onAddFolder={handleAddFolder}
            onDeleteFolder={handleDeleteFolder}
            onQueueDownload={handleQueueDownload}
            downloadItemIds={downloads.map(dl => dl.id)}
          />
        </section>
      </main>

      {/* Control Room Footer metrics */}
      <footer className="mt-12 bg-slate-900 border-t border-indigo-950 py-6 px-6 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 font-mono">
          <div>
            <span>SYSTEM CONTEXT ROOT: SERVER SIDE APIS OPERATIONAL ON PORT 3000</span>
          </div>
          <div className="flex gap-4">
            <span className="text-emerald-500 font-bold">● NODE INSTANCES READY</span>
            <span>Uptime: 2026-05-20 UTC</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
