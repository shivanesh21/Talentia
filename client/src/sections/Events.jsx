import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EVENTS } from "../data/events.js";
import EventCard from "../components/EventCard.jsx";
import EventModal from "../components/EventModal.jsx";
import Reveal from "../components/Reveal.jsx";
import GiantWord from "../components/GiantWord.jsx";

export default function Events() {
  const [filter, setFilter] = useState("All");
  const [active, setActive] = useState(null);

  const visible = EVENTS.filter((e) => filter === "All" || e.category === filter);
  const tech = EVENTS.filter((e) => e.category === "Technical");
  const nonTech = EVENTS.filter((e) => e.category === "Non-Technical");

  const registerFor = (event) => {
    setActive(null);
    window.dispatchEvent(new CustomEvent("talentia:select-event", { detail: event.id }));
  };

  return (
    <section id="events" className="relative overflow-hidden py-20">
      <GiantWord word="ARENA" />
      <div className="relative mx-auto max-w-6xl px-5">
        <Reveal>
          <p className="font-mono2 text-[11px] tracking-[0.3em] text-cyan-300">02 — EVENTS</p>
          <h2 className="font-display mt-3 text-3xl font-black sm:text-5xl">THE SIX CHALLENGES</h2>
          <p className="mt-3 text-white/60">Three technical battles. Three non-technical challenges.</p>
          <p className="mt-2 inline-block rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-1.5 font-mono2 text-[11px] tracking-[0.18em] text-cyan-200">
            🕘 MORNING 9–12:30 · AFTERNOON 1:30–4:30 · 3 ONE-HOUR SETS EACH — ATTEND ALL SIX
          </p>
        </Reveal>

        {/* Interactive category selector */}
        <Reveal delay={0.1}>
          <div className="glass mt-8 flex flex-wrap items-center gap-2 rounded-2xl p-2 sm:w-fit">
            {["All", "Technical", "Non-Technical"].map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`rounded-xl px-5 py-2.5 text-xs font-bold tracking-widest transition ${
                  filter === c ? "bg-white text-black shadow-lg" : "text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                {c === "All" ? "ALL SIX" : c === "Technical" ? "[ TECHNICAL ]" : "[ NON-TECHNICAL ]"}
              </button>
            ))}
          </div>
          <p className="mt-3 font-mono2 text-[11px] tracking-[0.2em] text-white/40">
            SHOWING: {filter === "All" ? "BINARY QUEST • DATA DEDUCTIVE • APTITUDE ARENA • FLIP FRENZY • MEME DECODE • THE GIFT HUNT" : filter === "Technical"
              ? tech.map((t) => t.name).join(" • ")
              : nonTech.map((t) => t.name).join(" • ")}
          </p>
        </Reveal>

        <motion.div layout className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {visible.map((e, i) => (
              <motion.div key={e.id} layout initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }} transition={{ duration: 0.35 }}>
                <EventCard event={e} index={i} onDetails={setActive} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <EventModal event={active} onClose={() => setActive(null)} onRegister={registerFor} />
    </section>
  );
}
