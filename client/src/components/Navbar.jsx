import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const HOME_LINKS = [
  { label: "HOME", href: "#home" },
  { label: "ABOUT", href: "#about" },
  { label: "EVENTS", href: "#events" },
  { label: "SCHEDULE", href: "#schedule" },
  { label: "CONTACT", href: "#contact" },
];

export default function Navbar({ view = "home", onNavigate = () => {}, isAdmin = false, isStudent = false }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goHome = (href) => (e) => {
    if (view !== "home") {
      e.preventDefault();
      onNavigate("home");
      setTimeout(() => document.querySelector(href)?.scrollIntoView({ behavior: "smooth" }), 80);
    }
    setOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50 px-3 sm:px-6"
    >
      <nav
        className={`mx-auto mt-3 flex max-w-6xl items-center justify-between rounded-2xl border px-4 py-3 transition-all duration-300 ${
          scrolled
            ? "border-white/10 bg-[#0a0d13]/60 shadow-[0_10px_40px_rgba(0,0,0,0.55),0_0_28px_rgba(34,211,238,0.08)] backdrop-blur-[20px] backdrop-saturate-150"
            : "border-white/5 bg-black/20 backdrop-blur-md"
        }`}
      >
        <button onClick={() => onNavigate("home")} className="flex items-center gap-2.5">
          <span className="font-display grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 text-sm font-extrabold text-black">
            T
          </span>
          <span className="font-display text-sm font-bold tracking-widest">
            TALENTIA <span className="text-cyan-300">’26</span>
          </span>
        </button>

        <div className="hidden items-center gap-7 md:flex">
          {HOME_LINKS.map((l) => (
            <a key={l.label} href={l.href} onClick={goHome(l.href)} className="font-mono2 text-[11px] tracking-[0.2em] text-white/70 transition hover:text-white">
              {l.label}
            </a>
          ))}
          <button onClick={() => onNavigate("student")} className={`font-mono2 text-[11px] tracking-[0.2em] transition hover:text-white ${view === "student" ? "text-cyan-300" : "text-white/70"}`}>
            {isStudent ? "MY PORTAL" : "STUDENT LOGIN"}
          </button>
          <button onClick={() => onNavigate("admin")} className={`font-mono2 text-[11px] tracking-[0.2em] transition hover:text-white ${view === "admin" ? "text-amber-300" : "text-white/70"}`}>
            {isAdmin ? "DASHBOARD" : "ADMIN"}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {view !== "home" && (
            <button onClick={() => onNavigate("home")} className="btn-magnetic hidden rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold sm:block">
              ← HOME
            </button>
          )}
          <button
            onClick={() => onNavigate("student")}
            className="btn-magnetic hidden rounded-xl bg-white px-4 py-2 text-xs font-bold tracking-wider text-black sm:block"
          >
            STUDENT LOGIN
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 md:hidden"
          >
            <span className="space-y-1.5">
              <span className={`block h-0.5 w-5 bg-white transition ${open ? "translate-y-[7px] rotate-45" : ""}`} />
              <span className={`block h-0.5 w-5 bg-white transition ${open ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 w-5 bg-white transition ${open ? "-translate-y-[7px] -rotate-45" : ""}`} />
            </span>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="glass mx-auto mt-2 max-w-6xl rounded-2xl p-3 md:hidden"
          >
            {HOME_LINKS.map((l) => (
              <a key={l.label} href={l.href} onClick={goHome(l.href)}
                className="block rounded-xl px-4 py-3 text-sm font-semibold tracking-widest text-white/80 hover:bg-white/10 hover:text-white">
                {l.label}
              </a>
            ))}
            <button onClick={() => { setOpen(false); onNavigate("student"); }}
              className="mt-1 block w-full rounded-xl bg-white px-4 py-3 text-center text-sm font-bold text-black">
              STUDENT LOGIN
            </button>
            <button onClick={() => { setOpen(false); onNavigate("admin"); }}
              className="mt-2 block w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-center text-sm font-bold">
              {isAdmin ? "DASHBOARD" : "ADMIN LOGIN"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
