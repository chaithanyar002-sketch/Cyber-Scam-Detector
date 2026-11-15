import { useState } from "react";
import RiskGauge from "./RiskGauge";

const STYLE = {
  LOW: { color: "text-emerald-400", note: "Looks safe" },
  MEDIUM: { color: "text-amber-400", note: "Be careful" },
  HIGH: { color: "text-red-400", note: "Likely phishing" },
};
const Meter = ({ label, value }) => (
  <div>
    <div className="flex justify-between text-xs text-slate-400"><span>{label}</span><span>{Math.round(value * 100)}%</span></div>
    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-800"><div className="h-full bg-violet transition-all duration-700" style={{ width: `${value * 100}%` }} /></div>
  </div>
);

export default function ResultCard({ result, detail, onFeedback, feedbackSent }) {
  const s = STYLE[result.level];
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    const txt = `${result.label} - risk ${result.risk_score}/100 (ML ${result.ml_score}, rules ${result.rule_score})\n` + result.reasons.map((r) => `- ${r}`).join("\n");
    try { await navigator.clipboard.writeText(txt); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* clipboard blocked */ }
  };
  return (
    <div className="card animate-fadeUp">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">Verdict</p>
          <p className={`text-3xl font-bold ${s.color}`}>{result.label}</p>
          <p className="text-sm text-slate-400">{s.note}</p>
        </div>
        <RiskGauge score={result.risk_score} level={result.level} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Meter label="ML model probability" value={result.ml_score} />
        <Meter label="Rule score" value={result.rule_score} />
      </div>
      <p className="mt-2 text-xs text-slate-500">Final score = 70% ML + 30% rules</p>

      <h3 className="mt-5 mb-2 font-semibold text-white">Why this result?</h3>
      <ul className="space-y-1.5 text-sm">
        {result.reasons.map((r, i) => <li key={i} className="flex gap-2"><span aria-hidden>{result.level === "LOW" ? "✅" : "⚠️"}</span>{r}</li>)}
      </ul>

      {detail?.top_terms?.length > 0 && (
        <div className="mt-4">
          <h4 className="mb-2 text-sm font-semibold text-white">Words that moved the model</h4>
          <div className="flex flex-wrap gap-2">
            {detail.top_terms.map((t) => (
              <span key={t.term} className={`rounded-full px-2.5 py-1 text-xs ${t.weight > 0 ? "bg-red-500/15 text-red-300" : "bg-emerald-500/15 text-emerald-300"}`}>
                {t.term} {t.weight > 0 ? "+" : ""}{t.weight}
              </span>
            ))}
          </div>
          <p className="mt-1 text-xs text-slate-500">Red pushes toward scam, green toward safe.</p>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-800 pt-4 text-sm">
        {onFeedback && (feedbackSent ? <span className="text-emerald-400">Feedback saved for future training.</span> : <>
          <span className="text-slate-400">Was this correct?</span>
          <button onClick={() => onFeedback(true)} className="rounded-lg bg-emerald-500/20 px-3 py-1 text-emerald-300 hover:bg-emerald-500/30">Correct</button>
          <button onClick={() => onFeedback(false)} className="rounded-lg bg-red-500/20 px-3 py-1 text-red-300 hover:bg-red-500/30">Incorrect</button></>)}
        <button onClick={copy} className="ml-auto rounded-lg border border-slate-700 px-3 py-1 text-slate-200 hover:border-neon">{copied ? "Copied" : "Copy result"}</button>
      </div>
    </div>
  );
}
