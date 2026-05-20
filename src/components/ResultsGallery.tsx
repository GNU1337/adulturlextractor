import React, { useState } from "react";
import { 
  FolderOpen, Plus, Sparkles, Trash2, Tag, 
  Clock, DownloadIcon, CheckSquare, Square, CheckSquare2, FileVideo, Globe
} from "lucide-react";
import { ScrapedUrl, Folder } from "../types";

interface ResultsGalleryProps {
  urls: ScrapedUrl[];
  folders: Folder[];
  selectedFolderId: string;
  onSelectFolder: (id: string) => void;
  onDeleteUrl: (id: string) => void;
  onBulkCategorize: (ids: string[], folderId: string) => void;
  onAddFolder: (name: string, color: string, description?: string) => void;
  onDeleteFolder: (id: string) => void;
}

export default function ResultsGallery({
  urls,
  folders,
  selectedFolderId,
  onSelectFolder,
  onDeleteUrl,
  onBulkCategorize,
  onAddFolder,
  onDeleteFolder
}: ResultsGalleryProps) {
  // Input builders for adding folders
  const [showAddFold, setShowAddFold] = useState(false);
  const [newFoldName, setNewFoldName] = useState("");
  const [newFoldColor, setNewFoldColor] = useState("text-indigo-400");
  const [newFoldDesc, setNewFoldDesc] = useState("");

  // Bulk operation tracking
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [targetCategory, setTargetCategory] = useState("");

  const toggleSelectAll = () => {
    if (selectedIds.length === urls.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(urls.map(u => u.id));
    }
  };

  const toggleSelectId = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(i => i !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const handleBulkMove = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.length === 0 || !targetCategory) return;
    onBulkCategorize(selectedIds, targetCategory);
    setSelectedIds([]);
    setTargetCategory("");
  };

  const submitFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFoldName.trim()) return;
    onAddFolder(newFoldName.trim(), newFoldColor, newFoldDesc.trim());
    setNewFoldName("");
    setNewFoldDesc("");
    setShowAddFold(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Dynamic Folder Sidebar */}
      <div className="lg:col-span-1 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h4 className="font-semibold text-xs tracking-widest uppercase text-slate-400">
            📦 HARVEST STORAGE
          </h4>
          <button 
            onClick={() => setShowAddFold(prev => !prev)}
            className="text-[10px] bg-slate-800 hover:bg-indigo-900 border border-slate-700 hover:border-indigo-700 px-2 py-1 rounded text-indigo-400 hover:text-indigo-100 transition-all font-bold uppercase"
          >
            {showAddFold ? "Cancel" : "Add Folder"}
          </button>
        </div>

        {showAddFold && (
          <form onSubmit={submitFolder} className="bg-slate-900/60 border border-slate-800 p-3 rounded-lg space-y-2 text-xs">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Folder Name</label>
              <input 
                type="text" 
                value={newFoldName}
                onChange={e => setNewFoldName(e.target.value)}
                placeholder="Premium, Amateurs, etc"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200 outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Color Theme</label>
              <select 
                value={newFoldColor}
                onChange={e => setNewFoldColor(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-300"
              >
                <option value="text-indigo-400">Indigo Slate</option>
                <option value="text-rose-400">Rose Red</option>
                <option value="text-emerald-400">Emerald Green</option>
                <option value="text-amber-400">Amber Gold</option>
                <option value="text-sky-400">Sky Blue</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Summary Note</label>
              <input 
                type="text" 
                value={newFoldDesc}
                onChange={e => setNewFoldDesc(e.target.value)}
                placeholder="Optional filter description"
                className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-300 outline-none"
              />
            </div>
            <button 
              type="submit" 
              className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-505 text-white font-bold rounded"
            >
              Verify & Create
            </button>
          </form>
        )}

        <div className="space-y-1.5">
          {folders.map(fold => {
            const isSelected = selectedFolderId === fold.id;
            const itemUrlCount = urls.filter(u => fold.id === "f-all" || u.category === fold.id).length;

            return (
              <div 
                key={fold.id}
                onClick={() => onSelectFolder(fold.id)}
                className={`w-full group text-left px-3 py-2.5 rounded-xl cursor-pointer hover:bg-slate-850/60 border transition-all flex items-center justify-between ${
                  isSelected 
                    ? "bg-slate-800 border-indigo-500/50 shadow-md" 
                    : "bg-slate-950/20 border-slate-800/80 hover:border-slate-800"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <FolderOpen className={`h-4 w-4 shrink-0 ${fold.color || "text-slate-400"}`} />
                  <div className="truncate">
                    <span className="text-xs font-bold text-slate-200 block truncate group-hover:text-indigo-300">
                      {fold.name}
                    </span>
                    {fold.description && (
                      <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                        {fold.description}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold bg-slate-950 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800">
                    {itemUrlCount}
                  </span>
                  
                  {/* Option to delete non-system folders */}
                  {!["f-all", "f-1", "f-2", "f-3"].includes(fold.id) && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Delete custom folder storage? Items inside fall back to 'All Scraped URLs'")) {
                          onDeleteFolder(fold.id);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-500 hover:text-rose-400 rounded transition-opacity"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Results Table / Media Shelf */}
      <div className="lg:col-span-3 space-y-4">
        {/* Bulk Management Drawer */}
        <div className="flex flex-wrap items-center justify-between bg-slate-900 border border-slate-800 p-3.5 rounded-xl gap-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleSelectAll}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-300 bg-slate-950 hover:bg-slate-850 border border-slate-800 px-3 py-1.5 rounded transition-all"
            >
              {selectedIds.length === urls.length && urls.length > 0 ? "Deselect All" : "Select All Items"}
            </button>
            <span className="text-xs text-slate-400">
              Selected: <strong className="text-indigo-400 font-mono">{selectedIds.length}</strong> / {urls.length} URLs
            </span>
          </div>

          {selectedIds.length > 0 && (
            <form onSubmit={handleBulkMove} className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Bulk Reorganize:</span>
              <select 
                value={targetCategory}
                onChange={e => setTargetCategory(e.target.value)}
                required
                className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-300 outline-none"
              >
                <option value="">Choose Destination...</option>
                {folders.filter(f => f.id !== "f-all").map(fol => (
                  <option key={fol.id} value={fol.id}>{fol.name}</option>
                ))}
              </select>
              <button 
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3 py-1.5 rounded transition-colors"
              >
                Move Bulk
              </button>
            </form>
          )}
        </div>

        {/* Gallery Items Grid */}
        {urls.length === 0 ? (
          <div className="bg-slate-950/20 border border-dashed border-slate-850 p-16 text-center rounded-2xl">
            <FolderOpen className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <h5 className="font-bold text-slate-300 text-sm">Empty Folder Harvest</h5>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Your spiders haven't indexed video URLs matching this folder configuration category. Start crawling to ingest links.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {urls.map(item => {
              const isSelected = selectedIds.includes(item.id);
              const durationMins = Math.floor(item.durationSec / 60);

              return (
                <div 
                  key={item.id}
                  className={`group relative bg-slate-900 rounded-xl border transition-all overflow-hidden flex flex-col ${
                    isSelected 
                      ? "border-indigo-500 bg-slate-850 shadow-lg shadow-indigo-600/5" 
                      : "border-slate-800 hover:border-slate-755"
                  }`}
                >
                  {/* Checkbox selector layer */}
                  <button 
                    onClick={() => toggleSelectId(item.id)}
                    className="absolute top-3 left-3 z-10 p-1 bg-slate-950/80 rounded border border-slate-800 hover:bg-slate-900 transition-colors"
                  >
                    {isSelected ? (
                      <CheckSquare2 className="h-4 w-4 text-indigo-400 fill-indigo-950" />
                    ) : (
                      <div className="h-4 w-4 rounded-sm border border-slate-600" />
                    )}
                  </button>

                  <div className="relative aspect-video bg-slate-950 group">
                    {/* Placeholder image representation with themed search attributes */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent z-10" />
                    <img 
                      src={item.thumbnails[0]} 
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Meta stats in image */}
                    <div className="absolute bottom-2 left-2 z-20 flex flex-wrap gap-1">
                      <span className="text-[9px] font-mono bg-indigo-600 text-white font-bold px-1.5 py-0.5 rounded">
                        {item.resolution}
                      </span>
                      <span className="text-[9px] font-mono bg-slate-900 text-slate-200 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <Clock className="h-2.5 w-2.5" /> {durationMins} min
                      </span>
                    </div>

                    <div className="absolute bottom-2 right-2 z-20">
                      <span className="text-[9px] font-mono bg-slate-950 border border-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                        {item.fileSizeMB} MB
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[10px] font-mono text-indigo-400 truncate">
                          📡 {item.spiderName}
                        </span>
                        <span className="text-[9px] font-mono text-slate-500">
                          {new Date(item.extractedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <h5 className="text-xs font-bold text-slate-100 line-clamp-2 leading-medium tracking-tight group-hover:text-indigo-300">
                        {item.title}
                      </h5>

                      {/* Display channels and actors extracted */}
                      <div className="mt-2.5 space-y-1">
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                          <Globe className="h-3 w-3 text-slate-500" />
                          <span className="truncate">{item.channelName || "Creator Channel"}</span>
                        </div>
                        {item.pornstars.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1.5">
                            {item.pornstars.map((star, sIdx) => (
                              <span key={sIdx} className="text-[9px] font-mono bg-slate-950 border border-slate-800 text-indigo-300 px-1.5 py-0.2 rounded-full">
                                star: {star}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs font-mono">
                      {/* Secure link extraction button */}
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[10px] text-indigo-300 hover:text-indigo-100 font-bold bg-slate-950/80 hover:bg-indigo-950 px-2 rounded-lg py-1 border border-slate-850 hover:border-indigo-800 transition-all flex items-center gap-1"
                      >
                        <FileVideo className="h-3 w-3 text-indigo-400" />
                        Copy/Open Media Url
                      </a>

                      <button 
                        onClick={() => onDeleteUrl(item.id)}
                        className="p-1 hover:bg-rose-950/20 rounded text-slate-500 hover:text-rose-400"
                        title="Delete record"
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
    </div>
  );
}
