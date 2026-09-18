import Reveal from "../components/Reveal.jsx";
import { TALENTIA_CONFIG } from "../data/config.js";

export default function RegistrationInfo() {
  const r = TALENTIA_CONFIG.registration;
  const items = [
    ["REGISTRATION FEE", r.fee],
    ["REGISTRATION DEADLINE", r.deadline],
    ["ELIGIBILITY", r.eligibility],
    ["MAXIMUM PARTICIPANTS", r.maxParticipants],
  ];
  return (
    <section id="info" className="relative py-16">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal>
          <div className="glass relative overflow-hidden rounded-3xl p-8 sm:p-10">
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
            <p className="font-mono2 text-[11px] tracking-[0.3em] text-cyan-300">03 — REGISTRATION</p>
            <h2 className="font-display mt-2 text-2xl font-black sm:text-4xl">REGISTRATION</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {items.map(([k, v]) => (
                <div key={k} className="rounded-2xl border border-white/10 bg-black/30 p-5">
                  <p className="font-mono2 text-[10px] tracking-[0.22em] text-white/45">{k}</p>
                  <p className="font-display mt-2 text-lg font-bold text-white">{v}</p>
                </div>
              ))}
            </div>
            <a href="#register" className="btn-magnetic mt-6 inline-block rounded-2xl bg-white px-7 py-3 text-sm font-extrabold tracking-widest text-black">
              REGISTER NOW
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
