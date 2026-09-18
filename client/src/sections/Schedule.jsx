import Reveal from "../components/Reveal.jsx";
import GiantWord from "../components/GiantWord.jsx";
import { EVENTS, SCHEDULE } from "../data/events.js";

/**
 * Home-page schedule: morning / afternoon blocks.
 * Every event runs 3 × 1-hour sets → everybody can attend all 6 events.
 */
export default function Schedule() {
  const byId = Object.fromEntries(EVENTS.map((e) => [e.id, e]));
  return (
    <section id="schedule" className="relative overflow-hidden py-20">
      <GiantWord word="TIME" />
      <div className="relative mx-auto max-w-6xl px-5">
        <Reveal>
          <p className="font-mono2 text-[11px] tracking-[0.3em] text-cyan-300">SCHEDULE</p>
          <h2 className="font-display mt-3 text-3xl font-black sm:text-5xl">ONE DAY. ALL SIX EVENTS.</h2>
          <p className="mt-3 max-w-2xl text-white/60">{SCHEDULE.note}</p>
        </Reveal>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {SCHEDULE.slots.map((slot, i) => (
            <Reveal key={slot.id} delay={i * 0.08}>
              <div className="glass relative overflow-hidden rounded-3xl p-6 sm:p-8">
                <div
                  className="pointer-events-none absolute -top-16 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full blur-3xl opacity-25"
                  style={{ background: i === 0 ? "#22d3ee" : "#a78bfa" }}
                />
                <div className="relative flex items-center justify-between">
                  <h3 className="font-display text-xl font-black tracking-widest">
                    {i === 0 ? "🌅" : "🌇"} {slot.label}
                  </h3>
                  <span className="font-mono2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-bold text-cyan-200">
                    {slot.time}
                  </span>
                </div>
                <div className="relative mt-4 space-y-2">
                  {slot.eventIds.map((id) => {
                    const e = byId[id];
                    return (
                      <div key={id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                        <div>
                          <p className="text-sm font-extrabold tracking-widest">{e.name}</p>
                          <p className="font-mono2 text-[10px] tracking-[0.2em] text-white/45">{e.category.toUpperCase()} · {e.number}</p>
                        </div>
                        <span className="font-mono2 shrink-0 text-[11px] text-white/60">{e.time}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="relative mt-4 rounded-2xl border border-cyan-300/20 bg-cyan-300/5 p-4">
                  <p className="font-mono2 text-[10px] tracking-[0.25em] text-cyan-200">3 SETS × 1 HOUR — JOIN ANY SET</p>
                  <div className="mt-2 space-y-1">
                    {slot.sets.map((s) => (
                      <p key={s} className="font-mono2 text-xs text-white/70">▸ {s}</p>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <p className="mt-6 text-center font-mono2 text-[11px] tracking-[0.25em] text-white/45">
            MORNING 3 EVENTS + AFTERNOON 3 EVENTS · NO CLASHES · ATTEND EVERYTHING
          </p>
        </Reveal>
      </div>
    </section>
  );
}
