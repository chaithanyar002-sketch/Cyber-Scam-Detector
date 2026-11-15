import { useEffect, useState } from "react";

// Android/desktop Chrome/Edge: native install prompt. iPhone Safari has none, so show the manual steps.
export default function InstallPrompt() {
  const [evt, setEvt] = useState(null);
  const [hidden, setHidden] = useState(false);
  const standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);

  useEffect(() => {
    const h = (e) => { e.preventDefault(); setEvt(e); };
    window.addEventListener("beforeinstallprompt", h);
    return () => window.removeEventListener("beforeinstallprompt", h);
  }, []);

  if (standalone || hidden || (!evt && !isIos)) return null;
  return (
    <div className="card mx-auto mt-8 flex max-w-md flex-col items-center gap-2 text-center text-sm">
      <p className="font-semibold text-white">Install this app on your phone</p>
      {evt
        ? <button className="btn" onClick={async () => { evt.prompt(); await evt.userChoice; setEvt(null); }}>Install app</button>
        : <p className="text-slate-400">Tap the <b>Share</b> button in Safari, then <b>Add to Home Screen</b>.</p>}
      <button className="text-xs text-slate-500" onClick={() => setHidden(true)}>Not now</button>
    </div>
  );
}
