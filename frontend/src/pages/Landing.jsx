const steps = [["1", "Paste", "Enter a suspicious message or URL."], ["2", "Analyze", "Rules and a machine learning model score it together."], ["3", "Learn", "See the risk score, reasons, and give feedback to improve the model."]];
export default function Landing({ go }) {
  return (
    <div className="animate-fadeUp py-10 text-center">
      <p className="text-6xl">🛡️</p>
      <h1 className="mt-4 bg-gradient-to-r from-neon to-violet bg-clip-text text-5xl font-extrabold text-transparent md:text-6xl">Cyber Scam Detector</h1>
      <p className="mx-auto mt-4 max-w-xl text-slate-400">Detect phishing messages and suspicious links instantly with a hybrid rule-based and machine learning engine that improves from your feedback.</p>
      <button onClick={() => go("dashboard")} className="btn mt-8 text-lg">Start Analysis →</button>
      <div className="mt-14 grid gap-4 text-left md:grid-cols-3">
        {steps.map(([n, t, d]) => (
          <div key={n} className="card"><p className="text-3xl font-bold text-violet">{n}</p><h3 className="mt-2 text-lg font-semibold text-white">{t}</h3><p className="text-sm text-slate-400">{d}</p></div>
        ))}
      </div>
    </div>
  );
}
