import React from "react";
import { X, AlertCircle, Info, ShieldAlert, CheckCircle } from "lucide-react";

interface NotificationPanelProps {
  notifications: Array<{ type: "success" | "error" | "info"; title: string; body: string; time: string }>;
  onClear: () => void;
}

export default function NotificationPanel({ notifications, onClear }: NotificationPanelProps) {
  if (notifications.length === 0) return null;

  return (
    <div className="bg-slate-900 border border-indigo-950 rounded-2xl p-5 mb-6">
      <div className="flex items-center justify-between border-b border-indigo-950 pb-2.5 mb-3">
        <h4 className="font-bold text-xs tracking-widest uppercase text-indigo-400 flex items-center gap-1.5">
          <ShieldAlert className="h-4 w-4 text-indigo-400 animate-pulse" />
          SYSTEM ALERT DRAWER ({notifications.length})
        </h4>
        <button 
          onClick={onClear}
          className="text-[10px] uppercase font-bold text-slate-400 hover:text-rose-400 font-mono transition-colors"
        >
          Clear Alerts
        </button>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {notifications.map((not, idx) => (
          <div 
            key={idx} 
            className={`border rounded-xl p-3.5 flex items-start gap-3 text-xs leading-relaxed transition-all ${
              not.type === "error" 
                ? "bg-rose-950/20 border-rose-900/40 text-rose-300"
                : not.type === "success"
                ? "bg-emerald-950/20 border-emerald-990/40 text-emerald-300"
                : "bg-slate-950/60 border-slate-800 text-slate-300"
            }`}
          >
            {not.type === "error" && <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />}
            {not.type === "success" && <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />}
            {not.type === "info" && <Info className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />}

            <div className="flex-1">
              <div className="flex items-center justify-between gap-4 font-bold">
                <span className="text-slate-100">{not.title}</span>
                <span className="text-[10px] font-mono font-normal text-slate-500">{not.time}</span>
              </div>
              <p className="mt-1 text-slate-300 font-mono text-[11px] leading-relaxed">
                {not.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
