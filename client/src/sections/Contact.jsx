import Reveal from "../components/Reveal.jsx";
import GiantWord from "../components/GiantWord.jsx";
import { EVENTS } from "../data/events.js";
import { TALENTIA_CONFIG } from "../data/config.js";

/**
 * CONTACT → the volunteer team behind every event + photography crew.
 * (Faculty section removed.)
 */
export default function Contact() {
  const cfg = TALENTIA_CONFIG;
  const byId = Object.fromEntries(EVENTS.map((e) => [e.id, e]));

  return (
    <section id="contact" className="relative overflow-hidden py-20">
      <GiantWord word="TEAM" />
      <div className="relative mx-auto max-w-6xl px-5">
        <Reveal>
          <p className="font-mono2 text-[11px] tracking-[0.3em] text-cyan-300">05 — CONTACT</p>
          <h2 className="font-display mt-3 text-3xl font-black sm:text-5xl">MEET THE TEAM</h2>
          <p className="mt-3 text-white/60">
            Event volunteers — reach out to the team of any event for help with registration, teams or event details.
          </p>
        </Reveal>

        <Reveal>
          <div className="glass relative mt-8 overflow-hidden rounded-3xl p-8 text-center sm:p-10">
            <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-96 -translate-x-1/2 rounded-full bg-gradient-to-r from-cyan-400/20 via-violet-500/20 to-pink-500/20 blur-3xl" />
            <p className="font-mono2 relative text-[11px] tracking-[0.35em] text-amber-300">★ COORDINATORS ★</p>
            <div className="relative mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {cfg.headCoordinators.map((name, i) => (
                <div key={name}>
                  <p className="font-display text-6xl font-black text-white/10">0{i + 1}</p>
                  <p className="font-display gradient-text -mt-7 text-2xl font-black sm:text-3xl">{name}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {cfg.volunteers.map((v, i) => {
            const e = byId[v.eventId];
            if (!e) return null;
            return (
              <Reveal key={v.eventId} delay={(i % 3) * 0.08}>
                <div className="glass card-3d h-full rounded-3xl p-6">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-mono2 text-[10px] tracking-[0.22em] text-cyan-300">{e.category.toUpperCase()}</p>
                    <span className="font-mono2 text-[10px] text-white/40">{e.slot?.toUpperCase()} · {e.time}</span>
                  </div>
                  <h3 className="font-display mt-2 text-lg font-extrabold tracking-wide">{e.name}</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {v.members.map((m) => (
                      <span key={m} className="rounded-full border border-white/12 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-white/85">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.1}>
          <div className="glass mt-5 rounded-3xl p-6">
            <p className="font-mono2 text-[10px] tracking-[0.25em] text-pink-300">📸 PHOTOGRAPHY</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {cfg.photography.map((m) => (
                <span key={m} className="rounded-full border border-white/12 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-white/85">
                  {m}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
