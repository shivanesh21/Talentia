import { AnimatePresence, motion } from "framer-motion";
import { TALENTIA_CONFIG, waLink } from "../data/config.js";

function Row({ k, v }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-white/[0.04] px-4 py-2.5 text-sm">
      <span className="font-mono2 text-[11px] tracking-[0.18em] text-white/50">{k}</span>
      <span className="text-right font-semibold text-white/90">{v}</span>
    </div>
  );
}

export default function EventModal({ event, onClose, onRegister }) {
  return (
    <AnimatePresence>
      {event && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="glass relative max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-3xl p-6 sm:p-8"
          >
            <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-lg hover:bg-white/15">
              ×
            </button>
            <span className="font-display text-5xl font-black text-white/10">{event.number}</span>
            <h3 className="font-display mt-1 text-2xl font-extrabold sm:text-3xl">{event.name}</h3>
            <p className="mt-1 font-mono2 text-[11px] tracking-[0.2em] text-cyan-300">{event.category.toUpperCase()} • TALENTIA ’26</p>
            <p className="mt-3 leading-relaxed text-white/75">{event.description}</p>

            <h4 className="font-display mt-6 text-xs font-bold tracking-[0.25em] text-white/60">RULES</h4>
            <ul className="mt-2 space-y-2">
              {event.rules.map((r, i) => (
                <li key={i} className="flex gap-3 text-sm text-white/75">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-cyan-300/15 text-[11px] font-bold text-cyan-200">{i + 1}</span>
                  {r}
                </li>
              ))}
            </ul>

            <h4 className="font-display mt-6 text-xs font-bold tracking-[0.25em] text-white/60">EVENT INFO</h4>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <Row k="SLOT" v={`${event.slot} · ${event.time}`} />
              <Row k="DURATION" v={event.duration} />
              <Row k="TEAM SIZE" v={event.teamSize} />
              <Row k="DATE" v={event.date} />
              <Row k="VENUE" v={event.venue} />
              <Row k="COORDINATOR" v={event.coordinator} />
            </div>

            {event.sets?.length > 0 && (
              <>
                <h4 className="font-display mt-6 text-xs font-bold tracking-[0.25em] text-white/60">3 SETS × 1 HOUR — JOIN ANY SET</h4>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  {event.sets.map((s) => (
                    <div key={s} className="rounded-xl border border-cyan-300/20 bg-cyan-300/5 px-3 py-2.5 text-center font-mono2 text-[11px] text-cyan-100">
                      {s}
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <button onClick={() => onRegister(event)} className="btn-magnetic flex-1 rounded-xl bg-gradient-to-r from-cyan-300 to-violet-400 px-5 py-3 text-sm font-extrabold tracking-widest text-black">
                REGISTER FOR THIS EVENT
              </button>
              <a
                href={waLink(TALENTIA_CONFIG.whatsapp.number, `Hi, I have a question about ${event.name} at TALENTIA ’26.`)}
                target="_blank" rel="noreferrer"
                className="btn-magnetic rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-center text-sm font-bold tracking-widest"
              >
                ASK ON WHATSAPP
              </a>
            </div>
            <p className="mt-3 text-center font-mono2 text-[11px] text-white/40">
              Fee: {TALENTIA_CONFIG.registration.fee} • Deadline: {TALENTIA_CONFIG.registration.deadline}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
