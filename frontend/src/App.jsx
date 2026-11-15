import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import Feedback from "./pages/Feedback";
import Admin from "./pages/Admin";
import About from "./pages/About";
import InstallPrompt from "./components/InstallPrompt";
import { getHealth } from "./services/api";
export default function App() {
  const [page, setPage] = useState("landing");
  const [prefill, setPrefill] = useState("");
  const [server, setServer] = useState("waking"); // free hosting sleeps when idle; wake it on app open
  useEffect(() => { getHealth().then(() => setServer("ok")).catch(() => setServer("down")); }, []);
  const reanalyze = (t) => { setPrefill(t); setPage("dashboard"); };
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,#1e1b4b,#020617_60%)]">
      <Navbar page={page} go={setPage} />
      {server !== "ok" && (
        <p className={`px-4 py-2 text-center text-xs ${server === "down" ? "bg-red-500/10 text-red-300" : "bg-amber-500/10 text-amber-300"}`}>
          {server === "down" ? "Can't reach the server. Check your connection and reload." : "Connecting to the server... the first request can take up to a minute."}
        </p>
      )}
      <main className="mx-auto max-w-5xl px-4 pb-24 md:pb-10">
        {page === "landing" && <><Landing go={setPage} /><InstallPrompt /></>}
        {page === "dashboard" && <Dashboard prefill={prefill} clearPrefill={() => setPrefill("")} />}
        {page === "history" && <History reanalyze={reanalyze} />}
        {page === "feedback" && <Feedback go={setPage} />}
        {page === "admin" && <Admin />}
        {page === "about" && <About />}
      </main>
    </div>
  );
}
