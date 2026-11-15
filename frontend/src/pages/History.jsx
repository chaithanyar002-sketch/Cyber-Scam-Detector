import { useEffect, useState } from "react";
import { getLogs } from "../services/api";
const COLOR = { SAFE: "text-emerald-400", SUSPICIOUS: "text-amber-400", PHISHING: "text-red-400" };
export default function History({ reanalyze }) {
  const [data, setData] = useState(null);
  useEffect(() => { getLogs(50).then(setData).catch(() => setData({ logs: [], summary: {} })); }, []);
  return (
    <div className="animate-fadeUp space-y-4 py-6 md:py-8">
      <h2 className="text-2xl font-bold text-white">Your scan history</h2>
      <p className="text-xs text-slate-500">Stored for this device only.</p>
      {data && Object.keys(data.summary).length > 0 && (
        <div className="flex flex-wrap gap-2 text-sm">
          {Object.entries(data.summary).map(([k, v]) => <span key={k} className={`rounded-full bg-slate-900 px-3 py-1 ${COLOR[k]}`}>{k}: {v}</span>)}
        </div>
      )}
      {data === null && <p className="text-slate-400">Loading...</p>}
      {data?.logs.length === 0 && <p className="card text-slate-400">No scans yet. Run one from the Scan tab.</p>}
      {data?.logs.map((h) => (
        <div key={h.id} className="card flex items-center gap-3 p-4">
          <div className="min-w-0 flex-1">
            <p className="truncate text-slate-200" title={h.input_text}>{h.input_text}</p>
            <p className="text-xs text-slate-500">{h.time.replace("T", " ").slice(0, 16)} UTC</p>
          </div>
          <div className="text-right"><p className="text-lg font-bold text-white">{h.risk_score}</p><p className={`text-xs font-semibold ${COLOR[h.label]}`}>{h.label}</p></div>
          <button onClick={() => reanalyze(h.input_text)} className="rounded-lg border border-slate-700 px-3 py-1 text-sm hover:border-neon">Re-scan</button>
        </div>
      ))}
    </div>
  );
}
