import { TALENTIA_CONFIG, waLink } from "../data/config.js";

export default function Footer({ onNavigate = () => {} }) {
  const cfg = TALENTIA_CONFIG;
  const go = (view, anchor) => (e) => {
    e.preventDefault();
    onNavigate(view);
    if (anchor) setTimeout(() => document.querySelector(anchor)?.scrollIntoView({ behavior: "smooth" }), 80);
  };
  return (
    <footer className="relative border-t border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-display text-2xl font-black">TALENTIA <span className="text-cyan-300">’26</span></p>
          <p className="mt-2 font-mono2 text-xs tracking-[0.2em] text-white/50">“{cfg.tagline}”</p>
          <p className="mt-3 max-w-sm text-sm text-white/60">First Year M.Sc. Event — six challenges across logic, data, creativity and competition.</p>
        </div>
        <div>
          <p className="font-display text-xs font-bold tracking-[0.25em] text-white/50">QUICK LINKS</p>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            {[["Home", "home", "#home"], ["About", "home", "#about"], ["Events", "home", "#events"], ["Schedule", "home", "#schedule"], ["Student Login", "student", null], ["Contact", "home", "#contact"], ["Admin", "admin", null]].map(([l, v, h]) => (
              <a key={l} href={h || "#"} onClick={go(v, h)} className="text-left text-white/65 hover:text-white">{l}</a>
            ))}
          </div>
        </div>
        <div>
          <p className="font-display text-xs font-bold tracking-[0.25em] text-white/50">CONNECT</p>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            <a
              href={waLink(TALENTIA_CONFIG.whatsapp.number, TALENTIA_CONFIG.whatsapp.prefilledMessage)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2 font-bold text-black"
            >
              ✆ WhatsApp · 7092879289
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center font-mono2 text-[11px] tracking-widest text-white/40">
        © 2026 TALENTIA ’26. All Rights Reserved.
      </div>
    </footer>
  );
}
