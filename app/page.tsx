"use client";
import { useEffect, useState, type FormEvent } from "react";
import { listWorlds, type WorldEntry } from "../client/worlds.ts";

// Measured with two bots (scripts/brain.ts): see docs/DESIGN.md#whole-campaigns-two-bots. spec/sim.test.ts bounds SHORT.
const SHORT = "about 10–20 minutes for two";
const FULL = "about 30–75 minutes for two";

function ago(ms: number): string {
  if (!ms) return "a while ago";
  const m = Math.round((Date.now() - ms) / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  return d === 1 ? "yesterday" : `${d} days ago`;
}

export default function Home() {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [worlds, setWorlds] = useState<WorldEntry[]>([]);
  useEffect(() => {
    setName(localStorage.getItem("plenty:name") ?? "");
    setWorlds(listWorlds(localStorage));
  }, []);

  const remember = (): string => {
    const n = name.trim() || "Guest";
    localStorage.setItem("plenty:name", n);
    return n;
  };

  async function create(pace: "normal" | "rapid"): Promise<void> {
    remember();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/rooms", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ pace }) });
      if (!res.ok) throw new Error(String(res.status));
      const { code } = (await res.json()) as { code: string };
      location.href = `/play/?room=${code}`;
    } catch {
      setError("Couldn't reach the server. Try again in a moment.");
      setBusy(false);
    }
  }

  function join(e: FormEvent): void {
    e.preventDefault();
    remember();
    const c = code.trim().toUpperCase();
    if (/^[A-Z0-9]{5}$/.test(c)) location.href = `/play/?room=${c}`;
    else setError("A room code is five letters and numbers.");
  }

  return (
    <main className="landing">
      <div className="card hero">
        <h1>Plenty</h1>
        <p className="lede">
          A small group shares one island. Gather, build, run a factory, earn a datacentre and teach it to do the gathering for you. When the island
          is used up, the Plenty Cooperative has another world ready. It has five, and none of them comes back.
        </p>
        <p className="small">
          <a href="/readme/">Why it's built this way, and what it's arguing</a>
        </p>
        <label>
          Your name <input value={name} maxLength={16} onChange={(e) => setName(e.target.value)} placeholder="Guest" />
        </label>
        <div className="presets">
          <button type="button" disabled={busy} onClick={() => void create("rapid")}>
            Short campaign
            <span className="small">{SHORT}</span>
          </button>
          <button type="button" className="secondary" disabled={busy} onClick={() => void create("normal")}>
            Full campaign
            <span className="small">{FULL}</span>
          </button>
        </div>
        <p className="small">Both are the same five worlds and the same rules. The short one runs the machines five times faster and a hand harvest takes ten.</p>
        <form onSubmit={join} className="row">
          <label>
            Room code <input value={code} maxLength={5} onChange={(e) => setCode(e.target.value)} placeholder="ABC23" autoCapitalize="characters" />
          </label>
          <button type="submit">Join a friend</button>
        </form>
        {error && <p role="alert" className="bad">{error}</p>}
        {worlds.length > 0 && (
          <section aria-labelledby="yours">
            <h2 id="yours">Your worlds</h2>
            <ul className="worlds">
              {worlds.map((w) => (
                <li key={w.code}>
                  <a href={`/play/?room=${w.code}`}>
                    <strong className="code">{w.code}</strong>{" "}
                    {w.world ? (w.ended ? `${w.world}, finished` : `${w.world}, world ${w.stage} of 5`) : "a world you joined"}
                    {w.short ? " · short" : ""}
                  </a>{" "}
                  <span className="small">{ago(w.last)}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
        <p className="small">2–8 players, no account: this browser remembers who you are in each world. Best with a keyboard; a phone can walk, harvest and build by touch.</p>
      </div>
    </main>
  );
}
