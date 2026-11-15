const links = [["landing", "Home", "🏠"], ["dashboard", "Scan", "🔍"], ["history", "History", "🕘"], ["feedback", "Feedback", "💬"], ["admin", "Model", "⚙️"], ["about", "About", "ℹ️"]];
export default function Navbar({ page, go }) {
  return (
    <>
      {/* top bar: brand on phones, brand + links on desktop */}
      <nav className="safe-top sticky top-0 z-10 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-3">
          <button onClick={() => go("landing")} className="text-lg font-bold text-neon">🛡️ Cyber Scam Detector</button>
          <div className="hidden gap-1 text-sm md:flex">
            {links.map(([id, label]) => (
              <button key={id} onClick={() => go(id)}
                className={`rounded-lg px-3 py-1.5 transition ${page === id ? "bg-violet/20 text-neon" : "text-slate-400 hover:text-white"}`}>{label}</button>
            ))}
          </div>
        </div>
      </nav>
      {/* bottom tab bar: native-app style navigation on phones */}
      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-20 border-t border-slate-800 bg-slate-950/95 backdrop-blur md:hidden" aria-label="Main">
        <div className="mx-auto grid max-w-md grid-cols-6">
          {links.map(([id, label, icon]) => (
            <button key={id} onClick={() => go(id)} aria-current={page === id ? "page" : undefined}
              className={`flex flex-col items-center gap-0.5 py-2 text-[10px] ${page === id ? "text-neon" : "text-slate-400"}`}>
              <span className="text-lg leading-none" aria-hidden>{icon}</span>{label}
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
