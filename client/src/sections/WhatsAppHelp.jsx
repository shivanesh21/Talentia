import Reveal from "../components/Reveal.jsx";
import { TALENTIA_CONFIG, waLink, whatsappHelpLink, isPlaceholder } from "../data/config.js";

export default function WhatsAppHelp() {
  const cfg = TALENTIA_CONFIG.whatsapp;
  const chatHref = whatsappHelpLink();
  const queryHref = waLink(TALENTIA_CONFIG.whatsapp.number, TALENTIA_CONFIG.whatsapp.prefilledMessage);
  const disabled = isPlaceholder(TALENTIA_CONFIG.whatsapp.number);

  return (
    <section className="relative py-10">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-emerald-300/20 bg-gradient-to-br from-emerald-400/10 via-transparent to-cyan-400/10 p-8 text-center sm:p-10">
            <p className="font-mono2 text-[11px] tracking-[0.3em] text-emerald-300">WHATSAPP SUPPORT</p>
            <h2 className="font-display mt-2 text-2xl font-black sm:text-3xl">{cfg.helpTitle}</h2>
            <p className="mx-auto mt-2 max-w-xl text-white/60">{cfg.helpText}</p>
            {disabled && (
              <p className="mx-auto mt-3 max-w-xl rounded-xl border border-amber-300/25 bg-amber-300/10 px-4 py-2 font-mono2 text-[11px] text-amber-200">
                WhatsApp number not configured yet — update `whatsapp.number` in src/data/config.js.
              </p>
            )}
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a href={chatHref} target={disabled ? "_self" : "_blank"} rel="noreferrer" className="btn-magnetic rounded-2xl bg-[#25D366] px-7 py-3.5 text-sm font-extrabold tracking-widest text-black">
                ✆ CHAT ON WHATSAPP
              </a>
              <a href={queryHref} target={disabled ? "_self" : "_blank"} rel="noreferrer" className="btn-magnetic glass rounded-2xl px-7 py-3.5 text-sm font-bold tracking-widest">
                SEND REGISTRATION QUERY →
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
