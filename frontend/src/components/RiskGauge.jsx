const COLORS = { LOW: "#34d399", MEDIUM: "#fbbf24", HIGH: "#ef4444" };
// Semicircle gauge, 0-100. Needle angle maps score to 180 degrees.
export default function RiskGauge({ score, level }) {
  const r = 80, cx = 100, cy = 100;
  const arc = (from, to) => {
    const p = (s) => { const a = Math.PI * (1 - s / 100); return [cx + r * Math.cos(a), cy - r * Math.sin(a)]; };
    const [x1, y1] = p(from), [x2, y2] = p(to);
    return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`;
  };
  const a = Math.PI * (1 - score / 100);
  const nx = cx + (r - 12) * Math.cos(a), ny = cy - (r - 12) * Math.sin(a);
  return (
    <svg viewBox="0 0 200 120" role="img" aria-label={`Risk score ${score} out of 100, ${level}`} className="w-full max-w-xs">
      <path d={arc(0, 35)} stroke={COLORS.LOW} strokeWidth="14" fill="none" opacity="0.35" />
      <path d={arc(35, 65)} stroke={COLORS.MEDIUM} strokeWidth="14" fill="none" opacity="0.35" />
      <path d={arc(65, 100)} stroke={COLORS.HIGH} strokeWidth="14" fill="none" opacity="0.35" />
      <path d={arc(0, Math.max(score, 0.5))} stroke={COLORS[level]} strokeWidth="14" fill="none" strokeLinecap="round" style={{ transition: "all .7s" }} />
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" style={{ transition: "all .7s" }} />
      <circle cx={cx} cy={cy} r="6" fill="#e2e8f0" />
      <text x={cx} y={cy + 18} textAnchor="middle" fontSize="18" fontWeight="700" fill={COLORS[level]}>{score}</text>
    </svg>
  );
}
