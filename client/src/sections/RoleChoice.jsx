import Reveal from "../components/Reveal.jsx";

/**
 * Landing choice: ADMIN vs STUDENT portals.
 */
export default function RoleChoice({ onSelect }) {
  return (
    <section id="portal" className="relative py-14">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal>
          <p className="font-mono2 text-center text-[11px] tracking-[0.3em] text-cyan-300">CHOOSE YOUR PATH</p>
          <h2 className="font-display mt-3 text-center text-2xl font-black sm:text-4xl">
            ENTER AS <span className="gradient-text">ADMIN</span> OR <span className="gradient-text">STUDENT</span>
          </h2>
        </Reveal>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <Reveal>
            <button
              onClick={() => onSelect("student")}
              className="card-3d glass group block w-full rounded-3xl p-8 text-left transition hover:border-cyan-300/40"
            >
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400/40 to-violet-500/40 text-2xl">
                🎓
              </div>
              <h3 className="font-display mt-4 text-xl font-extrabold tracking-wide">STUDENT / USER</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                Log in with your register number, fill your details on your own
                page, pick your challenges, get instant confirmation.
              </p>
              <span className="btn-magnetic mt-5 inline-block rounded-xl bg-gradient-to-r from-cyan-300 to-violet-400 px-6 py-3 text-xs font-extrabold tracking-widest text-black">
                STUDENT LOGIN →
              </span>
            </button>
          </Reveal>
          <Reveal delay={0.1}>
            <button
              onClick={() => onSelect("admin")}
              className="card-3d glass group block w-full rounded-3xl p-8 text-left transition hover:border-amber-300/40"
            >
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-amber-300/40 to-pink-500/40 text-2xl">
                🛡️
              </div>
              <h3 className="font-display mt-4 text-xl font-extrabold tracking-wide">ADMIN</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                Secure login to the organizer dashboard — view students, teams,
                filter by event, track totals and export registration data.
              </p>
              <span className="btn-magnetic mt-5 inline-block rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-xs font-extrabold tracking-widest">
                OPEN ADMIN LOGIN →
              </span>
            </button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
