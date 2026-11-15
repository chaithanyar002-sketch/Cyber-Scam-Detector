import { useEffect, useState } from "react";
import { getStatus } from "../services/api";
export default function Feedback({ go }) {
  const [s, setS] = useState(null);
  useEffect(() => { getStatus().then(setS).catch(() => {}); }, []);
  return (
    <div className="animate-fadeUp space-y-4 py-8">
      <h2 className="text-2xl font-bold text-white">Feedback & self-learning</h2>
      <div className="card space-y-3 text-slate-300">
        <p>After every analysis, mark the result as <b className="text-emerald-400">Correct</b> or <b className="text-red-400">Incorrect</b>. Your feedback is stored and combined with the original dataset the next time the model is retrained.</p>
        <p className="text-3xl font-bold text-neon">{s ? s.feedback_size : "-"} <span className="text-base font-normal text-slate-400">feedback samples collected</span></p>
        <button className="btn" onClick={() => go("dashboard")}>Analyze & give feedback</button>
      </div>
    </div>
  );
}
