import React, { useState } from "react";
import { Plus, X, ListPlus, FolderPlus, Database } from "lucide-react";
import { SpiderConfig, Folder } from "../types";

interface SpiderFormProps {
  folders: Folder[];
  editingConfig?: SpiderConfig | null;
  onSave: (config: any) => void;
  onCancel: () => void;
}

export default function SpiderForm({ folders, editingConfig, onSave, onCancel }: SpiderFormProps) {
  // Input builders
  const [name, setName] = useState(editingConfig?.name || "");
  const [targetUrlsInput, setTargetUrlsInput] = useState(editingConfig?.targetUrls.join("\n") || "");
  const [depth, setDepth] = useState(editingConfig?.depth || 2);
  const [maxUrls, setMaxUrls] = useState(editingConfig?.maxUrls || 100);
  const [rateLimitMs, setRateLimitMs] = useState(editingConfig?.rateLimitMs || 1500);
  const [bypassAntiScraping, setBypassAntiScraping] = useState(editingConfig?.bypassAntiScraping ?? true);
  const [userAgentType, setUserAgentType] = useState<any>(editingConfig?.userAgentType || "desktop");
  const [folderId, setFolderId] = useState(editingConfig?.folderId || "f-all");
  const [schedulePattern, setSchedulePattern] = useState(editingConfig?.schedulePattern || "manual");

  // Filters state
  const [includeInput, setIncludeInput] = useState(editingConfig?.filters.includeKeywords.join(", ") || "");
  const [excludeInput, setExcludeInput] = useState(editingConfig?.filters.excludeKeywords.join(", ") || "");
  const [minDuration, setMinDuration] = useState<any>(editingConfig?.filters.minDurationPct ?? "");
  const [maxDuration, setMaxDuration] = useState<any>(editingConfig?.filters.maxDurationPct ?? "");
  const [uploadDateWithin, setUploadDateWithin] = useState<any>(editingConfig?.filters.uploadDateWithin || "any");
  const [actorsInput, setActorsInput] = useState(editingConfig?.filters.actors.join(", ") || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const splitUrls = targetUrlsInput
      .split("\n")
      .map(item => item.trim())
      .filter(item => item.length > 0);

    if (!name.trim()) {
      alert("Please provide a name for this Spider target.");
      return;
    }

    if (splitUrls.length === 0) {
      alert("At least one target parent URL list is required.");
      return;
    }

    const compiledFilters = {
      includeKeywords: includeInput.split(",").map(i => i.trim()).filter(i => i.length > 0),
      excludeKeywords: excludeInput.split(",").map(i => i.trim()).filter(i => i.length > 0),
      minDurationPct: minDuration !== "" ? parseFloat(minDuration) : undefined,
      maxDurationPct: maxDuration !== "" ? parseFloat(maxDuration) : undefined,
      uploadDateWithin: uploadDateWithin,
      actors: actorsInput.split(",").map(i => i.trim()).filter(i => i.length > 0)
    };

    onSave({
      id: editingConfig?.id,
      name: name.trim(),
      targetUrls: splitUrls,
      depth: parseInt(String(depth)) || 1,
      maxUrls: parseInt(String(maxUrls)) || 100,
      rateLimitMs: parseInt(String(rateLimitMs)) || 1500,
      bypassAntiScraping,
      userAgentType,
      filters: compiledFilters,
      folderId: folderId === "f-all" ? undefined : folderId,
      schedulePattern
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-slate-100 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-lg font-bold text-indigo-400">
            {editingConfig ? "🔧 RECONFIGURE SPIDER NODE" : "🛡️ DEPLOY NEW WEB SPIDER"}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure path depths, cookie bypass algorithms, and precise target filters.
          </p>
        </div>
        <button 
          type="button" 
          onClick={onCancel}
          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-100 rounded-lg transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Basic configuration */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Spider Name *
            </label>
            <input 
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Xhamster Vlogger Harvester"
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Target Site URL Pattern(s) (One per line) *
            </label>
            <textarea 
              value={targetUrlsInput}
              onChange={e => setTargetUrlsInput(e.target.value)}
              placeholder="https://xhamster.com/videos/vlogger&#10;https://xnxx.com/best-rated"
              rows={4}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-200 outline-none focus:border-indigo-500 transition-colors"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Supports relative streams on xhamster.com, eporner.com, xnxx.com or custom domains.
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Crawl Depth
              </label>
              <input 
                type="number" 
                value={depth} 
                onChange={e => setDepth(Number(e.target.value))}
                min={1} 
                max={5}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Max Saved URLs
              </label>
              <input 
                type="number" 
                value={maxUrls} 
                onChange={e => setMaxUrls(Number(e.target.value))}
                min={1} 
                max={1000}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Rate Limit (ms)
              </label>
              <input 
                type="number" 
                value={rateLimitMs} 
                onChange={e => setRateLimitMs(Number(e.target.value))}
                min={200}
                step={100}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                  Bypass Anti-Bot Shields
                </label>
                <p className="text-[10px] text-slate-500">
                  Rotates cookies, TLS fingerprints & referrer origins.
                </p>
              </div>
              <input 
                type="checkbox" 
                checked={bypassAntiScraping}
                onChange={e => setBypassAntiScraping(e.target.checked)}
                className="h-4 w-4 bg-slate-950 accent-indigo-500 rounded border-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-900">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  User-Agent Mode
                </label>
                <select 
                  value={userAgentType} 
                  onChange={e => setUserAgentType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-xs rounded p-1.5 text-slate-300 outline-none"
                >
                  <option value="desktop">Desktop Chrome</option>
                  <option value="mobile">Safari Mobile</option>
                  <option value="bot">Google Cloud crawler</option>
                  <option value="random">Dynamic Random Rotation</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Schedule Run
                </label>
                <select 
                  value={schedulePattern} 
                  onChange={e => setSchedulePattern(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-xs rounded p-1.5 text-slate-300 outline-none"
                >
                  <option value="manual">Manual Trigger Only</option>
                  <option value="1m">Interval (Every 1 Minute)</option>
                  <option value="5m">Interval (Every 5 Minutes)</option>
                  <option value="1h">Interval (Every Hourly Run)</option>
                  <option value="daily">Daily Cron Scheduler</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Ingest Criteria & exclusion Filters */}
        <div className="space-y-4">
          <div className="border-b border-indigo-950 pb-1.5">
            <span className="text-xs font-semibold tracking-wider text-indigo-400 uppercase">
              📊 TARGET PATTERNS & CRITERIA FILTERS
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1">
              Include Keywords (Comma separated)
            </label>
            <input 
              type="text" 
              value={includeInput}
              onChange={e => setIncludeInput(e.target.value)}
              placeholder="e.g. amateur, couple, pool, vlog"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-indigo-500 transition-colors"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Leave empty to pull all links regardless of title keywords.
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-rose-400 mb-1">
              Banned Keywords (Exclusion Filter)
            </label>
            <input 
              type="text" 
              value={excludeInput}
              onChange={e => setExcludeInput(e.target.value)}
              placeholder="e.g. ad, banner, game, casino, clickbait"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-rose-500 transition-colors"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Spiders ignore scraped URLs containing any matches here.
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Min Duration (Minutes)
              </label>
              <input 
                type="number" 
                value={minDuration} 
                onChange={e => setMinDuration(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="No Minimum"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Max Duration (Minutes)
              </label>
              <input 
                type="number" 
                value={maxDuration} 
                onChange={e => setMaxDuration(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="No Maximum"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Upload Frequency
              </label>
              <select 
                value={uploadDateWithin}
                onChange={e => setUploadDateWithin(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 outline-none"
              >
                <option value="any">Any Time Frame</option>
                <option value="day">Uploaded Within Last 24h</option>
                <option value="week">Uploaded Past Week</option>
                <option value="month">Uploaded Past 30 Days</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Assign Storage Folder
              </label>
              <select 
                value={folderId}
                onChange={e => setFolderId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 outline-none"
              >
                {folders.map(fold => (
                  <option key={fold.id} value={fold.id}>
                    📦 {fold.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Creator/Pornstar Names (Comma separated)
            </label>
            <input 
              type="text" 
              value={actorsInput}
              onChange={e => setActorsInput(e.target.value)}
              placeholder="e.g. Eva, John, Sally"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
        <button 
          type="button" 
          onClick={onCancel}
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-5 py-2.5 rounded-xl transition-all"
        >
          Decline Changes
        </button>
        <button 
          type="submit" 
          className="bg-indigo-600 hover:bg-indigo-500 text-slate-100 text-xs font-bold px-6 py-2.5 rounded-xl tracking-wider uppercase transition-all flex items-center gap-1.5 shadow-lg shadow-indigo-600/20"
        >
          <Database className="h-4 w-4" />
          {editingConfig ? "Save Configuration" : "Deploy Active Spider"}
        </button>
      </div>
    </form>
  );
}
