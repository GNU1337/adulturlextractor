import React, { useState, useEffect } from "react";
import { 
  Play, Pause, RefreshCw, AlertTriangle, CheckCircle2, 
  Trash2, FolderOpen, Calendar, UserCheck, Timer, ShieldAlert
} from "lucide-react";
import { SpiderConfig, SpiderStatus } from "../types";

interface SpidersListProps {
  spiders: Array<{ config: SpiderConfig; status: SpiderStatus }>;
  activeOnly: boolean;
  onStart: (id: string) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onStop: (id: string) => void;
  onReset: (id: string) => void;
  onDelete: (id: string) => void;
  onConfigureEdit: (config: SpiderConfig) => void;
  onSelectSpiderLogs: (spider: { config: SpiderConfig; status: SpiderStatus }) => void;
}

export default function SpidersList({
  spiders,
  activeOnly,
  onStart,
  onPause,
  onResume,
  onStop,
  onReset,
  onDelete,
  onConfigureEdit,
  onSelectSpiderLogs
}: SpidersListProps) {
  const filtered = spiders.filter(item => {
    const isRunningOrPaused = item.status.state === "running" || item.status.state === "paused";
    return activeOnly ? isRunningOrPaused : !isRunningOrPaused;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <h3 className="font-semibold text-sm tracking-widest uppercase text-indigo-400">
          {activeOnly ? "📺 CONTROL ROOM: ACTIVE RUNNERS" : "⚙️ INSTALLED SPIDERS (IDLE)"}
        </h3>
        <span className="text-xs bg-slate-900 border border-slate-700 font-mono px-2.5 py-0.5 rounded-full text-slate-400">
          COUNT: {filtered.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center text-slate-500 text-sm">
          {activeOnly 
            ? "No dynamic spiders currently crawling. Activate one from the setup panel." 
            : "No registered spiders found. Create your first crawler setup above!"
          }
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => {
            const { config, status } = item;
            const isRunning = status.state === "running";
            const isPaused = status.state === "paused";
            const isFailed = status.state === "failed";
            const isCompleted = status.state === "completed";

            return (
              <div 
                key={config.id} 
                className={`relative rounded-2xl border p-5 transition-all duration-300 bg-slate-900 flex flex-col justify-between h-[368px] w-full mx-auto max-w-[380px] shadow-sm ${
                  isRunning 
                    ? "border-emerald-500/40 shadow-emerald-500/5 hover:border-emerald-500/60" 
                    : isPaused
                    ? "border-amber-500/30 hover:border-amber-500/50"
                    : isFailed
                    ? "border-rose-500/40 hover:border-rose-500/60"
                    : "border-slate-800 hover:border-slate-700"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-slate-100 tracking-tight flex items-center gap-2 truncate pr-16">
                      {config.name}
                    </h4>
                    {/* Visual state pill in top right corner */}
                    <span className={`absolute top-4 right-4 flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider uppercase border ${
                      isRunning 
                        ? "bg-emerald-950/60 text-emerald-400 border-emerald-500/30 animate-pulse" 
                        : isPaused
                        ? "bg-amber-950/60 text-amber-300 border-amber-500/30"
                        : isFailed
                        ? "bg-rose-950/60 text-rose-400 border-rose-500/30"
                        : isCompleted
                        ? "bg-indigo-950/60 text-indigo-300 border-indigo-500/30"
                        : "bg-slate-950/60 text-slate-400 border-slate-700/60"
                    }`}>
                      <span className={`h-1 w-1 rounded-full ${
                        isRunning ? "bg-emerald-400" : isPaused ? "bg-amber-400" : isFailed ? "bg-rose-400" : "bg-slate-400"
                      }`} />
                      {status.state}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-500 font-mono mb-3 break-all line-clamp-1 border-b border-slate-800 pb-2">
                    {config.targetUrls[0]}
                    {config.targetUrls.length > 1 && ` (+${config.targetUrls.length - 1} more)`}
                  </p>

                  {/* Technical filters review inline */}
                  <div className="flex flex-wrap gap-1 mb-4 h-12 overflow-y-auto scrollbar-hide">
                    <span className="text-[9px] font-mono bg-slate-950 border border-slate-800/60 px-1.5 py-0.5 rounded text-indigo-400">
                      D:{config.depth}
                    </span>
                    <span className="text-[9px] font-mono bg-slate-950 border border-slate-800/60 px-1.5 py-0.5 rounded text-amber-400">
                      L:{config.maxUrls}
                    </span>
                    {config.bypassAntiScraping && (
                      <span className="text-[9px] font-mono bg-emerald-950/40 border border-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-400/90">
                        SAFE
                      </span>
                    )}
                    {config.filters.includeKeywords.length > 0 && (
                      <span className="text-[9px] font-mono bg-slate-950 border border-slate-800/60 px-1.5 py-0.5 rounded text-slate-400">
                        KW:{config.filters.includeKeywords.length}
                      </span>
                    )}
                  </div>

                  {/* Sub metrics grid */}
                  <div className="grid grid-cols-3 gap-1.5 bg-slate-950/50 p-2 rounded-xl border border-slate-800/40 mb-4 text-center">
                    <div>
                      <div className="text-[8px] uppercase font-bold tracking-widest text-slate-600">Pages</div>
                      <div className="text-xs font-mono font-bold text-slate-300 mt-0.5">{status.pagesProcessed}</div>
                    </div>
                    <div>
                      <div className="text-[8px] uppercase font-bold tracking-widest text-slate-600">Found</div>
                      <div className="text-xs font-mono font-bold text-amber-500 mt-0.5">{status.urlsFound}</div>
                    </div>
                    <div>
                      <div className="text-[8px] uppercase font-bold tracking-widest text-slate-600">Saved</div>
                      <div className="text-xs font-mono font-bold text-emerald-400 mt-0.5">{status.urlsSaved}</div>
                    </div>
                  </div>
                </div>

                <div>
                  {/* Active Action Progress message */}
                  {(isRunning || status.currentAction) && (
                    <div className="mb-4 bg-slate-950/40 border border-slate-800/40 px-2 py-1 rounded-lg">
                      <p className="text-[9px] font-mono text-slate-500 uppercase tracking-tighter truncate">
                        {status.currentAction || "Initializing..."}
                      </p>
                    </div>
                  )}

                  {/* Live stats footer */}
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mb-4 border-t border-slate-800/40 pt-3">
                    <div className="flex gap-2.5">
                      <span>{status.crawlRate} p/s</span>
                      <span>{(status.dataProcessedKB / 1024).toFixed(1)}MB</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {status.errorCount > 0 ? (
                        <span className="text-rose-500 font-bold">{status.errorCount} Err</span>
                      ) : (
                        <span className="text-emerald-500">Stable</span>
                      )}
                    </div>
                  </div>

                  {/* Interactive Operations Buttons Drawer */}
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1">
                      {/* Launch / Start */}
                      {(status.state === "idle" || status.state === "completed") && (
                        <button 
                          onClick={() => onStart(config.id)}
                          className="flex items-center gap-1 px-2 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                        >
                          <Play className="h-2.5 w-2.5 fill-current" /> Run
                        </button>
                      )}

                      {/* Pause */}
                      {isRunning && (
                        <button 
                          onClick={() => onPause(config.id)}
                          className="flex items-center gap-1 px-2 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                        >
                          <Pause className="h-2.5 w-2.5 fill-current" /> Hold
                        </button>
                      )}

                      {/* Resume */}
                      {isPaused && (
                        <button 
                          onClick={() => onResume(config.id)}
                          className="flex items-center gap-1 px-2 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                        >
                          <Play className="h-2.5 w-2.5 fill-current" /> Resume
                        </button>
                      )}

                      {/* Stop / Idle reset */}
                      {(isRunning || isPaused) && (
                        <button 
                          onClick={() => onStop(config.id)}
                          className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                        >
                          Kill
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => onSelectSpiderLogs(item)}
                        className="px-2 py-1.5 bg-slate-800/40 hover:bg-slate-800 border border-slate-700/60 text-slate-400 hover:text-indigo-400 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                        title="Logs"
                      >
                        Log
                      </button>
                      <button 
                        onClick={() => onConfigureEdit(config)}
                        className="p-1.5 text-slate-500 hover:text-indigo-400 hover:bg-indigo-950/20 rounded-lg transition-all cursor-pointer"
                        title="Edit Config"
                      >
                        <RefreshCw className="h-3 w-3" />
                      </button>
                      <button 
                        onClick={() => onDelete(config.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg transition-all cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
