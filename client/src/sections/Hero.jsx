import { motion } from "framer-motion";
import { TALENTIA_CONFIG } from "../data/config.js";
import GiantWord from "../components/GiantWord.jsx";
import HeroObject from "../three/HeroObject.jsx";

export default function Hero({ onRegister = () => {} }) {
  const cfg = TALENTIA_CONFIG;
  return (
    <section id="home" className="relative overflow-hidden pb-10 pt-32 sm:pt-36">
      <GiantWord />
      <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-5 lg:grid-cols-2">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-1.5 font-mono2 text-[11px] tracking-[0.22em] text-cyan-200"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" />
            {cfg.badge}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display mt-5 text-5xl font-black leading-[0.95] sm:text-7xl"
          >
            TALENTIA
            <span className="gradient-text text-glow block">’26</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="font-display mt-4 text-sm font-semibold tracking-[0.3em] text-white/80 sm:text-base"
          >
            “{cfg.tagline}”
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-3 max-w-md leading-relaxed text-white/60"
          >
            {cfg.supportingText}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-7 flex flex-wrap gap-3"
          >
            <button onClick={onRegister} className="btn-magnetic rounded-2xl bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-400 px-7 py-3.5 text-sm font-extrabold tracking-widest text-black shadow-[0_0_40px_rgba(34,211,238,0.35)]">
              STUDENT LOGIN
            </button>
            <a href="#events" className="btn-magnetic glass rounded-2xl px-7 py-3.5 text-sm font-bold tracking-widest">
              EXPLORE EVENTS ↓
            </a>
          </motion.div>

          <div className="mt-8 flex gap-6 font-mono2 text-[11px] tracking-[0.2em] text-white/40">
            <span>◆ 6 CHALLENGES</span>
            <span>◆ {cfg.schedule.date}</span>
            <span className="hidden sm:inline">◆ {cfg.schedule.venue}</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="relative"
        >
          <div className="absolute inset-0 -z-0 mx-auto h-3/4 w-3/4 rounded-full bg-gradient-to-br from-cyan-500/25 via-violet-500/20 to-pink-500/15 blur-3xl" />
          <HeroObject />
          <p className="text-center font-mono2 text-[10px] tracking-[0.3em] text-white/35">◈ DRAG-FREE · AUTO-ROTATING 3D CORE · MOUSE PARALLAX ◈</p>
        </motion.div>
      </div>
    </section>
  );
}
