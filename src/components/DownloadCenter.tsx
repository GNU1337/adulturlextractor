import React, { useState } from "react";
import { 
  DownloadIcon, Play, Pause, Trash2, Loader2, FolderArchive, 
  HelpCircle, AlertCircle, Sparkles, FileVideo, CheckCircle2, 
  RefreshCw, CloudDownload, Disc, Gauge, ArrowDownUp, Clock
} from "lucide-react";
import { DownloadItem } from "../types";

interface DownloadCenterProps {
  downloads: DownloadItem[];
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onDelete: (id: string) => void;
  onQueuePlaylist: (url: string) => Promise<boolean>;
  syncData: () => void;
}

export default function DownloadCenter({
  downloads,
  onPause,
  onResume,
  onDelete,
  onQueuePlaylist,
  syncData
}: DownloadCenterProps) {
  const [playlistInput, setPlaylistInput] = useState("");
  const [submittingPlaylist, setSubmittingPlaylist] = useState(false);
  const [playlistMessage, setPlaylistMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handlePlaylistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlistInput.trim()) return;

    setSubmittingPlaylist(true);
    setPlaylistMessage(null);
    try {
      const success = await onQueuePlaylist(playlistInput.trim());
      if (success) {
        setPlaylistMessage({
          type: "success",
          text: "Playlist crawled successfully! Videos have been queued at the bottom."
        });
        setPlaylistInput("");
        // Clear message after 4s
        setTimeout(() => setPlaylistMessage(null), 4000);
      } else {
        setPlaylistMessage({
          type: "error",
          text: "Failed to parse playlist link. Verify layout formats."
        });
      }
    } catch (err) {
      setPlaylistMessage({
        type: "error",
        text: "An error occurred while connecting to playlist parsers."
      });
    } finally {
      setSubmittingPlaylist(false);
    }
  };

  // Group downloads for summary metrics
  const activeCount = downloads.filter(d => d.status === "downloading").length;
  const queuedCount = downloads.filter(d => d.status === "queued").length;
  const pausedCount = downloads.filter(d => d.status === "paused").length;
  const completedCount = downloads.filter(d => d.status === "completed").length;

  // Render thumbnail fallback
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  return (
    <div className="space-y-6">
      {/* Upper control block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Playlist link pasting block */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FolderArchive className="h-5 w-5 text-indigo-400" />
              <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wide">
                🔗 MULTI-FORMAT PLAYLIST INGESTER
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
              Paste playlist links from supported channels (e.g. xhamster, eporner, or custom creators). The spider indexers will extract each segment, crawl dimensions, and enqueue individual items.
            </p>
          </div>

          <form onSubmit={handlePlaylistSubmit} className="space-y-3">
            <div className="flex flex-col md:flex-row gap-2.5">
              <input 
                type="url"
                value={playlistInput}
                onChange={e => setPlaylistInput(e.target.value)}
                placeholder="e.g. https://xhamster.com/playlists/verified-yacht-vlogs"
                required
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-600 outline-none focus:border-indigo-500/50 transition-colors"
              />
              <button
                type="submit"
                disabled={submittingPlaylist}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase px-5 py-2 rounded-xl transition-all shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
              >
                {submittingPlaylist ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Parsing...
                  </>
                ) : (
                  <>
                    <CloudDownload className="h-3.5 w-3.5" />
                    Grab Playlist
                  </>
                )}
              </button>
            </div>

            {playlistMessage && (
              <div className={`p-3 rounded-lg text-xs leading-relaxed flex items-start gap-2 border ${
                playlistMessage.type === "success" 
                  ? "bg-emerald-950/20 text-emerald-300 border-emerald-900/40" 
                  : "bg-rose-950/20 text-rose-300 border-rose-900/40"
              }`}>
                <AlertCircle className={`h-4 w-4 shrink-0 mt-0.5 ${playlistMessage.type === "success" ? "text-emerald-400" : "text-rose-400"}`} />
                <span>{playlistMessage.text}</span>
              </div>
            )}
          </form>
        </div>

        {/* Telemetry card */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider">
              🚦 CONCURRENCY CONTROLLER
            </h4>
            <span className="text-[10px] font-mono bg-indigo-950 border border-indigo-800 text-indigo-300 px-1.5 py-0.5 rounded font-bold uppercase">
              Limit: 5 Max
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3.5 text-xs font-mono">
            <div className="bg-slate-950/40 border border-slate-805/40 p-3 rounded-xl flex flex-col justify-between">
              <span className="text-[10px] text-slate-500 uppercase">downloading</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-lg font-black text-indigo-400">{activeCount}</span>
                <span className="text-[10px] text-slate-600">/ 5 active</span>
              </div>
            </div>

            <div className="bg-slate-950/40 border border-slate-805/40 p-3 rounded-xl flex flex-col justify-between">
              <span className="text-[10px] text-slate-500 uppercase">queued / waiting</span>
              <span className="text-lg font-black text-amber-400 mt-1">{queuedCount}</span>
            </div>

            <div className="bg-slate-950/40 border border-slate-805/40 p-3 rounded-xl flex flex-col justify-between">
              <span className="text-[10px] text-slate-500 uppercase">paused / slow</span>
              <span className="text-lg font-black text-slate-400 mt-1">{pausedCount}</span>
            </div>

            <div className="bg-slate-950/40 border border-slate-805/40 p-3 rounded-xl flex flex-col justify-between">
              <span className="text-[10px] text-slate-500 uppercase">completed</span>
              <span className="text-lg font-black text-emerald-400 mt-1">{completedCount}</span>
            </div>
          </div>

          <button 
            onClick={syncData}
            className="w-full py-1.5 bg-slate-950 hover:bg-slate-850/80 border border-slate-800 rounded-xl text-[10px] text-slate-400 hover:text-slate-200 transition-all font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="h-3 w-3" /> Force Synchronize Status
          </button>
        </div>
      </div>

      {/* Mandatory system speed limit warning banners */}
      <div className="bg-indigo-950/15 border border-indigo-900/30 p-4 rounded-xl text-xs text-indigo-300 flex items-start gap-3.5">
        <Sparkles className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <h5 className="font-bold text-slate-200 mb-0.5">SPEED THRESHOLD AUTOMATION REGISTERED</h5>
          <p className="text-indigo-400/90 leading-relaxed">
            Every <strong className="text-indigo-200">60 seconds</strong>, the automatic monitor computes the average speed of active downloads. Any video averaging <strong className="text-amber-200">&lt; 350 KB/s</strong> is dynamically paused, reclassified back into the bottom of the Queue, allowing pending queue files to stream instead.
          </p>
        </div>
      </div>

      {/* Queue Details List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-850 pb-2">
          <h4 className="font-bold text-xs uppercase tracking-widest text-slate-400">
            ⚓️ DOWNLOAD PROGRESS QUEUE ({downloads.length} Items)
          </h4>
        </div>

        {downloads.length === 0 ? (
          <div className="bg-slate-950/20 border border-dashed border-slate-850 p-16 text-center rounded-2xl">
            <CloudDownload className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <h5 className="font-bold text-slate-300 text-sm">Download Queue Empty</h5>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No saved video URLs have been enqueued for download yet. Pick video nodes from the gallery dashboard and trigger "Grab" or paste a Playlist URL above!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Display downloading first, then queued, then paused, then completed */}
            {[...downloads]
              .sort((a, b) => {
                const order: Record<string, number> = { downloading: 1, queued: 2, paused: 3, completed: 4, failed: 5 };
                const stateDiff = (order[a.status] || 9) - (order[b.status] || 9);
                if (stateDiff !== 0) return stateDiff;
                // Otherwise sort by addedAt ascending
                return new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
              })
              .map(item => {
                const isDownloading = item.status === "downloading";
                const isQueued = item.status === "queued";
                const isPaused = item.status === "paused";
                const isCompleted = item.status === "completed";

                // Generate speed string
                let speedLabel = "0 KB/s";
                if (isDownloading) {
                  speedLabel = `${item.speedKBps} KB/s`;
                }

                // Average speed estimation
                const avgSpeed = item.speedChecksCount > 0 
                  ? item.speedSum / item.speedChecksCount 
                  : 0;

                // Time remaining estimation
                let etaLabel = "--:--";
                if (isDownloading && item.speedKBps > 0) {
                  const remainingMB = item.totalSizeMB - item.downloadedMB;
                  const remainingSec = (remainingMB * 1024) / item.speedKBps;
                  if (remainingSec > 0 && remainingSec < 3600) {
                    const mins = Math.floor(remainingSec / 60);
                    const secs = Math.floor(remainingSec % 60);
                    etaLabel = `${mins}m ${secs}s`;
                  } else if (remainingSec >= 3600) {
                    etaLabel = `${Math.floor(remainingSec / 3600)}h+`;
                  }
                }

                return (
                  <div 
                    key={item.id}
                    className={`bg-slate-900 border rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4 transition-all ${
                      isDownloading 
                        ? "border-indigo-500/50 bg-slate-900 shadow-md shadow-indigo-600/5" 
                        : (isCompleted ? "border-slate-800/60 bg-slate-900/40" : "border-slate-800")
                    }`}
                  >
                    {/* Fallback frame aspect ratio container */}
                    <div className="relative aspect-video w-32 shrink-0 bg-slate-950 rounded-lg overflow-hidden border border-slate-800 self-start md:self-center">
                      {imgErrors[item.id] || !item.thumbnailUrl ? (
                        <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 to-indigo-950/40 flex items-center justify-center p-2">
                          <FileVideo className="h-5 w-5 text-indigo-400" />
                        </div>
                      ) : (
                        <img 
                          src={item.thumbnailUrl} 
                          alt={item.title}
                          referrerPolicy="no-referrer"
                          onError={() => setImgErrors(prev => ({ ...prev, [item.id]: true }))}
                          className="absolute inset-0 w-full h-full object-cover opacity-60"
                        />
                      )}
                      <div className="absolute inset-0 bg-slate-950/20 pointer-events-none" />
                      <div className="absolute bottom-1 right-1 bg-slate-950/80 px-1 py-0.2 rounded text-[8px] font-mono text-slate-400 border border-slate-800">
                        {item.resolution}
                      </div>
                    </div>

                    {/* Metadata column */}
                    <div className="flex-1 min-w-0 space-y-2.5 w-full">
                      <div className="flex flex-wrap items-center justify-between gap-2.5">
                        <div className="min-w-0">
                          {item.playlistTitle && (
                            <span className="text-[9px] font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-900 px-1.5 py-0.2 rounded-full mr-2 shrink-0 block md:inline-block max-w-[200px] truncate mb-1 md:mb-0">
                              🎼 {item.playlistTitle}
                            </span>
                          )}
                          <h5 className="font-bold text-xs text-slate-200 truncate pr-4 leading-snug">
                            {item.title}
                          </h5>
                          <span className="text-[10px] text-slate-500 font-mono truncate block mt-0.5">
                            Target: <span className="text-slate-400">{item.url}</span>
                          </span>
                        </div>

                        {/* Status identifier pill */}
                        <div className="shrink-0 flex items-center">
                          {isDownloading && (
                            <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-950/50 border border-indigo-700/60 px-2.5 py-1 rounded-full flex items-center gap-1.5 uppercase shadow">
                              <span className="h-2 w-2 rounded-full bg-indigo-400 animate-ping shrink-0" />
                              Active Download
                            </span>
                          )}
                          {isQueued && (
                            <span className="text-[10px] font-mono font-bold text-amber-500 bg-amber-950/20 border border-amber-900/40 px-2.5 py-1 rounded-full flex items-center gap-1.5 uppercase">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0 animate-pulse" />
                              Queued
                            </span>
                          )}
                          {isPaused && (
                            <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-full flex items-center gap-1.5 uppercase">
                              <span className="h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
                              Paused
                            </span>
                          )}
                          {isCompleted && (
                            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/20 border border-emerald-900/40 px-2.5 py-1 rounded-full flex items-center gap-1.5 uppercase">
                              <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                              Completed
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Info stats block */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-t border-slate-850/60 pt-2.5 text-[10px] font-mono text-slate-400">
                        <div className="flex items-center gap-1">
                          <ArrowDownUp className="h-3.5 w-3.5 text-slate-500" />
                          <span>Progress: <strong className="text-slate-200">{item.downloadedMB.toFixed(1)}</strong> / {item.totalSizeMB.toFixed(1)} MB</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Gauge className="h-3.5 w-3.5 text-slate-500" />
                          <span>Inst Speed: <strong className="text-indigo-400">{speedLabel}</strong></span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Gauge className="h-3.5 w-3.5 text-slate-500" />
                          <span>Avg Speed: <strong className="text-amber-400">{avgSpeed > 0 ? `${avgSpeed.toFixed(0)} KB/s` : "0 KB/s"}</strong></span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-slate-500" />
                          <span>ETA: <strong className="text-slate-200">{etaLabel}</strong></span>
                        </div>
                      </div>

                      {/* Display beautiful progress gauge bar */}
                      <div className="relative pt-1">
                        <div className="overflow-hidden h-2.5 rounded-full bg-slate-950 flex border border-slate-850">
                          <div 
                            style={{ width: `${item.progressPct}%` }}
                            className={`h-full rounded-full transition-all duration-1000 ${
                              isDownloading 
                                ? "bg-gradient-to-r from-indigo-600 to-indigo-400 animate-pulse" 
                                : (isCompleted ? "bg-emerald-500" : "bg-slate-700")
                            }`}
                          />
                        </div>
                        <span className="absolute right-0 top-[-14px] text-[10px] font-mono font-bold text-slate-500">
                          {item.progressPct}%
                        </span>
                      </div>
                    </div>

                    {/* Operational controls button shelf */}
                    <div className="flex sm:flex-col gap-1.5 shrink-0 self-end md:self-center w-full md:w-auto justify-end md:justify-center border-t md:border-t-0 border-slate-850 pt-3 md:pt-0 mt-2 md:mt-0">
                      {isDownloading && (
                        <button
                          onClick={() => onPause(item.id)}
                          className="flex items-center gap-1 text-[10px] font-bold text-amber-400 hover:text-amber-300 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-xl transition-colors cursor-pointer w-full md:w-28 uppercase tracking-wider justify-center"
                        >
                          <Pause className="h-3 w-3 text-amber-400" />
                          Pause
                        </button>
                      )}

                      {(isPaused || isQueued) && (
                        <button
                          onClick={() => onResume(item.id)}
                          className="flex items-center gap-1 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-705 px-3 py-1.5 rounded-xl transition-colors cursor-pointer w-full md:w-28 uppercase tracking-wider justify-center"
                        >
                          <Play className="h-3 w-3 text-indigo-400" />
                          {isQueued ? "Boost" : "Resume"}
                        </button>
                      )}

                      {!isCompleted && !isDownloading && !isQueued && !isPaused && (
                        <div className="h-7 w-28 shrink-0 hidden md:block" />
                      )}

                      <button
                        onClick={() => onDelete(item.id)}
                        className="flex items-center gap-1 text-[10px] font-bold text-rose-400 hover:text-rose-100 bg-slate-950 hover:bg-rose-950/20 border border-slate-800 hover:border-rose-900 px-3 py-1.5 rounded-xl transition-colors cursor-pointer w-full md:w-28 uppercase tracking-wider justify-center"
                        title="Cancel download item"
                      >
                        <Trash2 className="h-3 w-3" />
                        Cancel
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
