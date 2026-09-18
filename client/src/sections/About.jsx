import Reveal from "../components/Reveal.jsx";
import GiantWord from "../components/GiantWord.jsx";
import { TALENTIA_CONFIG } from "../data/config.js";

const PILLARS = [
  { icon: "◈", title: "Logic", text: "Binary, aptitude & deduction battles." },
  { icon: "▣", title: "Data", text: "Spreadsheets, patterns & insight." },
  { icon: "✦", title: "Creativity", text: "Memes, translation & expression." },
  { icon: "⬢", title: "Competition", text: "Six arenas. One conqueror mindset." },
];

export default function About() {
  const cfg = TALENTIA_CONFIG;
  return (
    <section id="about" className="relative overflow-hidden py-20">
      <GiantWord word="THINK" className="opacity-60" />
      <div className="relative mx-auto max-w-6xl px-5">
        <Reveal>
          <p className="font-mono2 text-[11px] tracking-[0.3em] text-cyan-300">01 — ABOUT</p>
          <h2 className="font-display mt-3 text-3xl font-black sm:text-5xl">{cfg.about.heading}</h2>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-white/70">{cfg.about.text}</p>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.08}>
              <div className="glass card-3d rounded-3xl p-6 text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400/30 to-violet-500/30 text-xl">{p.icon}</div>
                <h3 className="font-display mt-3 font-bold tracking-widest">{p.title.toUpperCase()}</h3>
                <p className="mt-1 text-sm text-white/60">{p.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
