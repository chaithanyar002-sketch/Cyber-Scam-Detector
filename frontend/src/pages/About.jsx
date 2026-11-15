export default function About() {
  return (
    <div className="animate-fadeUp space-y-4 py-8">
      <h2 className="text-2xl font-bold text-white">About the system</h2>
      <div className="card space-y-3 text-slate-300">
        <p><b className="text-neon">Rule-based detection</b> looks for urgency and financial wording, social-engineering phrases, and risky links (shorteners, raw IPs, no HTTPS, odd domains).</p>
        <p><b className="text-neon">Machine learning</b> uses TF-IDF features with Logistic Regression trained on a labelled spam dataset plus your feedback.</p>
        <p>The final score is 70% ML probability plus 30% rule score, scaled to 0-100: under 35 is safe, 35 to 64 is suspicious, 65 and above is phishing.</p>
      </div>
      <div className="card text-slate-300"><h3 className="mb-2 font-semibold text-white">Limitations</h3>
        <ul className="list-disc space-y-1 pl-5 text-sm"><li>It cannot verify whether a website is actually live or malicious.</li><li>It is trained mostly on English SMS text.</li><li>Results are guidance, not proof. Always verify through official channels.</li></ul></div>
    </div>
  );
}
