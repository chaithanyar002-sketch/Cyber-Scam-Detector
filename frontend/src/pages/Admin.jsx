import { useEffect, useState } from "react";
import { getStatus, train } from "../services/api";
export default function Admin() {
  const [s, setS] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [token, setToken] = useState(() => sessionStorage.getItem("admin-token") || "");
  const load = () => getStatus().then(setS).catch(() => setMsg("Backend not reachable."));
  useEffect(() => { load(); }, []);
  const retrain = async () => { setBusy(true); setMsg(""); try { await train(token); sessionStorage.setItem("admin-token", token); setMsg("Model retrained with the latest feedback."); await load(); } catch (e) { setMsg(e.message || "Training failed."); } setBusy(false); };
  const rows = s ? [
    ["Algorithm", s.algorithm], ["Unique training messages", s.dataset_size], ["Feedback samples", s.feedback_size],
    ["Hold-out test size", s.test_size], ["Precision (scam)", s.precision], ["Recall (scam)", s.recall],
    ["F1 (scam)", s.f1], ["5-fold CV macro F1", `${s.cv_f1_macro_mean} ± ${s.cv_f1_macro_std}`],
  ] : [];
  return (
    <div className="animate-fadeUp space-y-4 py-8">
      <h2 className="text-2xl font-bold text-white">Model status</h2>
      <div className="card">
        <div className="grid gap-3 sm:grid-cols-2">{rows.map(([k, v]) => <div key={k} className="rounded-xl bg-slate-950 p-4"><p className="text-xs text-slate-500">{k}</p><p className="text-lg font-semibold text-neon">{String(v)}</p></div>)}</div>
        {s && s.dataset_size < 1000 && <p className="mt-4 text-sm text-amber-300">Small training set: these metrics are noisy. Add a larger dataset and retrain for reliable numbers.</p>}
        <input type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="Admin token (only needed on the deployed app)"
          className="mt-5 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-slate-100 outline-none focus:border-neon" />
        <button className="btn mt-3" onClick={retrain} disabled={busy}>{busy ? "Training..." : "Retrain model"}</button>
        {msg && <p className="mt-3 text-sm text-slate-300">{msg}</p>}
      </div>
    </div>
  );
}
