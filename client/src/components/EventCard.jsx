import { motion } from "framer-motion";
import { useTilt } from "../hooks/useTilt.js";
import EventVisual from "../three/EventVisual.jsx";

export default function EventCard({ event, onDetails, index = 0 }) {
  const { ref, onMouseMove, onMouseLeave } = useTilt(9);
  const isTech = event.category === "Technical";

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay: (index % 3) * 0.1 }}
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="card-3d glass group relative overflow-hidden rounded-3xl p-5 hover:border-white/25"
      style={{ boxShadow: `0 20px 60px rgba(0,0,0,.5), 0 0 0 rgba(0,0,0,0)` }}
    >
      <div
        className="pointer-events-none absolute -top-20 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full blur-3xl transition-opacity duration-500 opacity-30 group-hover:opacity-70"
        style={{ background: event.accent }}
      />
      <div className="relative flex items-start justify-between">
        <span className="font-display text-4xl font-black text-white/10 transition group-hover:text-white/25">
          {event.number}
        </span>
        <span
          className={`rounded-full border px-3 py-1 font-mono2 text-[10px] tracking-[0.18em] ${
            isTech ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-200" : "border-pink-300/30 bg-pink-300/10 text-pink-200"
          }`}
        >
          {isTech ? "● TECHNICAL" : "◆ NON-TECHNICAL"}
        </span>
      </div>

      <EventVisual kind={event.visual} accent={event.accent} />

      <h3 className="font-display mt-2 text-xl font-bold tracking-wide">{event.name}</h3>
      <p className="mt-2 min-h-[60px] text-sm leading-relaxed text-white/65">{event.description}</p>
      <p className="mt-2 flex items-center gap-2 font-mono2 text-[11px] tracking-wider text-cyan-200/90">
        <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: event.accent }} />
        🕘 {event.slot?.toUpperCase()} · {event.time} · 3 × 1-HR SETS
      </p>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => onDetails(event)}
          className="btn-magnetic flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold tracking-widest hover:bg-white/10"
        >
          VIEW DETAILS
        </button>
        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent("talentia:select-event", { detail: event.id }));
          }}
          className="btn-magnetic rounded-xl bg-white px-4 py-2.5 text-xs font-bold tracking-widest text-black"
        >
          JOIN →
        </button>
      </div>
    </motion.article>
  );
}
