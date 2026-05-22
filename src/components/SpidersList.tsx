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
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filtered.map(item => {
            const { config, status } = item;
            const isRunning = status.state === "running";
            const isPaused = status.state === "paused";
            const isFailed = status.state === "failed";
            const isCompleted = status.state === "completed";

            return (
              <div 
                key={config.id} 
                className={`relative rounded-xl border p-5 transition-all duration-300 bg-slate-900 ${
                  isRunning 
                    ? "border-emerald-500/40 shadow-lg shadow-emerald-500/5 hover:border-emerald-500/60" 
                    : isPaused
                    ? "border-amber-500/30 hover:border-amber-500/50"
                    : isFailed
                    ? "border-rose-500/40 hover:border-rose-500/60"
                    : "border-slate-800 hover:border-slate-700"
                }`}
              >
                {/* Visual state pill in top right corner */}
                <span className={`absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border ${
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
                  <span className={`h-1.5 w-1.5 rounded-full ${
                    isRunning ? "bg-emerald-400" : isPaused ? "bg-amber-400" : isFailed ? "bg-rose-400" : "bg-slate-400"
                  }`} />
                  {status.state}
                </span>

                <div className="mb-3">
                  <h4 className="text-base font-bold text-slate-100 tracking-tight flex items-center gap-2">
                    {config.name}
                  </h4>
                  <p className="text-xs text-slate-400 font-mono mt-1 break-all line-clamp-1">
                    Targets: {config.targetUrls.join(", ")}
                  </p>
                </div>

                {/* Technical filters review inline */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  <span className="text-[10px] font-mono bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-indigo-400">
                    Depth: {config.depth}
                  </span>
                  <span className="text-[10px] font-mono bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-amber-400">
                    Limit: {config.maxUrls} urls
                  </span>
                  {config.bypassAntiScraping && (
                    <span className="text-[10px] font-mono bg-emerald-950/60 border border-emerald-500/20 px-2 py-0.5 rounded text-emerald-300">
                      Anti-Bypass Verified
                    </span>
                  )}
                  {config.filters.includeKeywords.length > 0 && (
                    <span className="text-[10px] font-mono bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-slate-300">
                      Keywords: {config.filters.includeKeywords.length}
                    </span>
                  )}
                  {config.filters.excludeKeywords.length > 0 && (
                    <span className="text-[10px] font-mono bg-rose-950/40 border border-rose-500/10 px-2 py-0.5 rounded text-rose-300">
                      Banned: {config.filters.excludeKeywords.length}
                    </span>
                  )}
                </div>

                {/* Sub metrics grid */}
                <div className="grid grid-cols-3 gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 mb-4 text-center">
                  <div>
                    <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Pages</div>
                    <div className="text-sm font-mono font-bold text-slate-200 mt-0.5">{status.pagesProcessed}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Found</div>
                    <div className="text-sm font-mono font-bold text-amber-400 mt-0.5">{status.urlsFound}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Saved</div>
                    <div className="text-sm font-mono font-bold text-emerald-400 mt-0.5">{status.urlsSaved}</div>
                  </div>
                </div>

                {/* Active Action Progress message */}
                {(isRunning || status.currentAction) && (
                  <div className="mb-4 bg-slate-950/60 border border-slate-800/80 px-3 py-1.5 rounded-lg">
                    <div className="text-[9px] uppercase font-bold tracking-widest text-slate-500">Current Action Output</div>
                    <p className="text-xs font-mono text-slate-300 truncate mt-0.5">
                      {status.currentAction || "Initializing client..."}
                    </p>
                  </div>
                )}

                {/* Live stats footer */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-4 border-t border-slate-800/80 pt-3">
                  <div className="flex gap-3">
                    <span>Rate: <strong className="text-indigo-400">{status.crawlRate} p/s</strong></span>
                    <span>Bytes: <strong className="text-indigo-400">{(status.dataProcessedKB / 1024).toFixed(1)} MB</strong></span>
                  </div>
                  <div className="flex items-center gap-1">
                    {status.errorCount > 0 ? (
                      <span className="text-rose-400 flex items-center gap-0.5 font-bold animate-pulse">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        {status.errorCount} Err
                      </span>
                    ) : (
                      <span className="text-emerald-400 flex items-center gap-0.5">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Normal
                      </span>
                    )}
                  </div>
                </div>

                {/* Handle Critical Failure Display */}
                {status.lastErrorReason && (
                  <div className="mb-4 bg-rose-950/30 border border-rose-900/40 p-3 rounded-lg text-xs text-rose-300">
                    <div className="font-bold flex items-center gap-1.5 mb-1 text-rose-200">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-rose-400" />
                      TERMINATED DUING SCRAPE ROUTINE
                    </div>
                    <p className="font-mono mt-0.5 bg-rose-950 p-1.5 rounded text-rose-400 border border-rose-900/30 break-all select-all">
                      {status.lastErrorReason}
                    </p>
                    <div className="mt-2.5 flex justify-end">
                      <button 
                        onClick={() => onStart(config.id)}
                        className="bg-rose-900/60 hover:bg-rose-800 border border-rose-700 text-rose-100 font-bold px-3 py-1 rounded text-[10px] tracking-wider uppercase transition-colors"
                      >
                        ⚡ RERUN SPIDER (1-CLICK RECOVERY)
                      </button>
                    </div>
                  </div>
                )}

                {/* Interactive Operations Buttons Drawer */}
                <div className="flex items-center justify-between border-t border-slate-800/60 pt-3 gap-2">
                  <div className="flex items-center gap-1.5">
                    {/* Launch / Start */}
                    {(status.state === "idle" || status.state === "completed") && (
                      <button 
                        onClick={() => onStart(config.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-slate-100 rounded text-xs font-bold transition-all text-[11px] uppercase tracking-wider"
                      >
                        <Play className="h-3 w-3 fill-current" /> Trigger Run
                      </button>
                    )}

                    {/* Pause */}
                    {isRunning && (
                      <button 
                        onClick={() => onPause(config.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-100 rounded text-xs font-bold transition-all text-[11px] uppercase tracking-wider"
                      >
                        <Pause className="h-3 w-3 fill-current" /> Suspend
                      </button>
                    )}

                    {/* Resume */}
                    {isPaused && (
                      <button 
                        onClick={() => onResume(config.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-100 rounded text-xs font-bold transition-all text-[11px] uppercase tracking-wider"
                      >
                        <Play className="h-3 w-3 fill-current" /> Resume
                      </button>
                    )}

                    {/* Stop / Idle reset */}
                    {(isRunning || isPaused) && (
                      <button 
                        onClick={() => onStop(config.id)}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded text-xs font-bold transition-all text-[11px]"
                      >
                        Kill
                      </button>
                    )}

                    {/* Reset Stats */}
                    {status.pagesProcessed > 0 && !isRunning && (
                      <button 
                        onClick={() => onReset(config.id)}
                        className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded text-[11px]"
                        title="Reset counters"
                      >
                        <RefreshCw className="h-3 w-3" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => onSelectSpiderLogs(item)}
                      className="px-2.5 py-1.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-indigo-400 rounded text-xs font-medium transition-all"
                    >
                      Logs
                    </button>
                    <button 
                      onClick={() => onConfigureEdit(config)}
                      className="px-2.5 py-1.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-indigo-400 rounded text-xs font-medium transition-all"
                    >
                      Config
                    </button>
                    <button 
                      onClick={() => onDelete(config.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded transition-all"
                      title="Clear database config"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
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
