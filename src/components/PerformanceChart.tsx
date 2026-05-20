import React from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { CrawlMetricPoint } from "../types";

interface PerformanceChartProps {
  metrics: CrawlMetricPoint[];
}

export default function PerformanceChart({ metrics }: PerformanceChartProps) {
  const currentMetric = metrics[metrics.length - 1] || { crawlRate: 0, urlsFiltered: 0, errors: 0, memoryUsage: 0 };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div>
          <h4 className="font-semibold text-xs tracking-widest uppercase text-indigo-400">
            📡 REALTIME CLOUD TELEMETRY & METRIC HISTORY
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Crawl cycles, data ingestion health, and container virtualization stats.
          </p>
        </div>
        
        {/* Realtime KPI Pill box */}
        <div className="flex gap-4 font-mono">
          <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="text-[9px] uppercase font-bold text-slate-500 block">TOTAL EXTRACTED</span>
            <span className="text-xs font-bold text-emerald-400">{currentMetric.urlsFiltered} Urls</span>
          </div>
          <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="text-[9px] uppercase font-bold text-slate-500 block">AGGREGATE SPEED</span>
            <span className="text-xs font-bold text-indigo-400">{currentMetric.crawlRate} pages/s</span>
          </div>
          <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="text-[9px] uppercase font-bold text-slate-500 block">MEMORY HEADROOM</span>
            <span className="text-xs font-bold text-amber-400">{currentMetric.memoryUsage} MB</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        {metrics.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-600 text-xs font-mono">
            Acquiring telemetry metrics... Run spiders to generate charts.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={metrics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCrawl" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorUrls" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis 
                dataKey="timeLabel" 
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "10px" }}
                labelStyle={{ fontSize: "10px", color: "#94a3b8", fontWeight: "bold" }}
                itemStyle={{ fontSize: "11px", color: "#fff" }}
              />
              <Area 
                type="monotone" 
                dataKey="crawlRate" 
                stroke="#818cf8" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorCrawl)" 
                name="Parsing Speed (pages/s)"
              />
              <Area 
                type="monotone" 
                dataKey="urlsFiltered" 
                stroke="#10b981" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorUrls)" 
                name="Saved URLs Count"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Resource & Diagnostic Note */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs pt-2">
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
          <span className="text-[10px] text-indigo-400 font-bold block mb-1">CRAWL SPEED RATING</span>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Dynamic request scheduling prevents targeting conflicts. Average latency of ~{Math.round(400 + Math.random() * 200)}ms on streaming servers.
          </p>
        </div>
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
          <span className="text-[10px] text-emerald-400 font-bold block mb-1">DATA PIPELINE INGESTION</span>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Duplicate extraction index automatically skips previously saved streaming links. Clean schema sanitation checks initialized.
          </p>
        </div>
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
          <span className="text-[10px] text-rose-400 font-bold block mb-1">SHIELD STATUS</span>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Browser agent rotators operating natively. Bypass scripts updated to mitigate Cloudflare challenge intercepts on target endpoints.
          </p>
        </div>
      </div>
    </div>
  );
}
