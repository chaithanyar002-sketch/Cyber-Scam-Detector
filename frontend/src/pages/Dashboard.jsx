import { useEffect, useState } from "react";
import { predict, explain, sendFeedback } from "../services/api";
import ResultCard from "../components/ResultCard";
const EXAMPLES = ["URGENT! Verify your bank password now at http://secure-bank-login.example-verify.com/update", "Your OTP is 4821. Login to update details: http://bit.ly/x9Ka2", "Hey, are we still meeting for lunch tomorrow?"];
export default function Dashboard({ prefill, clearPrefill }) {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [detail, setDetail] = useState(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const run = async (t = text) => {
    if (!t.trim()) return;
    setLoading(true); setError(""); setSent(false);
    try { const [r, d] = await Promise.all([predict(t), explain(t)]); setResult(r); setDetail(d); } catch (e) { setError(`${e.message === "Failed to fetch" ? "Could not reach the server. It may be waking up; try again in a few seconds" : e.message}.`); }
    setLoading(false);
  };
  useEffect(() => { if (prefill) { setText(prefill); run(prefill); clearPrefill(); } }, [prefill]);
  const feedback = async (correct) => { await sendFeedback(text, result.level, correct); setSent(true); };
  return (
    <div className="animate-fadeUp space-y-5 py-6 md:py-8">
      <h2 className="text-2xl font-bold text-white">Analyze a message or URL</h2>
      <div className="card">
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} placeholder="Paste a message or URL here..."
          className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 p-3 text-slate-100 outline-none focus:border-neon" />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button className="btn" onClick={() => run()} disabled={loading}>{loading ? "Analyzing..." : "Analyze"}</button>
          <span className="text-xs text-slate-500">Try an example:</span>
          {EXAMPLES.map((ex, i) => <button key={i} onClick={() => setText(ex)} className="rounded-lg border border-slate-700 px-2 py-1 text-xs text-slate-300 hover:border-violet">Example {i + 1}</button>)}
        </div>
      </div>
      {error && <p className="rounded-xl bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
      {result && <ResultCard result={result} detail={detail} onFeedback={feedback} feedbackSent={sent} />}
    </div>
  );
}
