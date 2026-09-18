import { useState } from "react";
import Reveal from "../components/Reveal.jsx";
import GiantWord from "../components/GiantWord.jsx";
import { TALENTIA_CONFIG } from "../data/config.js";
import { adminLogin, friendlyMessage } from "../utils/api.js";

export default function AdminLogin({ onBack, onSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const data = await adminLogin(username.trim(), password, TALENTIA_CONFIG.apiBase);
      sessionStorage.setItem("talentia_admin_token", data.token);
      onSuccess(data.token);
    } catch (err) {
      setError(friendlyMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="relative overflow-hidden py-24">
      <GiantWord word="ADMIN" />
      <div className="relative mx-auto max-w-md px-5">
        <button onClick={onBack} className="font-mono2 mb-6 text-xs tracking-[0.2em] text-white/50 hover:text-white">← BACK</button>
        <Reveal>
          <div className="glass rounded-3xl p-8">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-amber-300/40 to-pink-500/40 text-2xl">🛡️</div>
            <h2 className="font-display mt-4 text-center text-2xl font-black">ADMIN LOGIN</h2>
            <p className="mt-1 text-center font-mono2 text-[11px] tracking-[0.2em] text-white/45">ORGANIZERS ONLY</p>
            <form onSubmit={submit} className="mt-6 space-y-4">
              <label className="block">
                <span className="font-mono2 mb-1.5 block text-[11px] tracking-[0.18em] text-white/55">USERNAME</span>
                <input value={username} onChange={(e) => setUsername(e.target.value)} className="field" placeholder="Admin username" autoComplete="username" />
              </label>
              <label className="block">
                <span className="font-mono2 mb-1.5 block text-[11px] tracking-[0.18em] text-white/55">PASSWORD</span>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="field" placeholder="••••••••" autoComplete="current-password" />
              </label>
              {error && <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-200">{error}</p>}
              <button disabled={busy} className="btn-magnetic w-full rounded-2xl bg-white px-6 py-3.5 text-sm font-extrabold tracking-widest text-black disabled:opacity-60">
                {busy ? "VERIFYING…" : "LOGIN →"}
              </button>
            </form>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
