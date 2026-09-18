import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EVENTS } from "../data/events.js";
import { TALENTIA_CONFIG } from "../data/config.js";
import { validateRegistration } from "../utils/validation.js";
import { submitRegistration } from "../utils/api.js";
import Reveal from "../components/Reveal.jsx";
import GiantWord from "../components/GiantWord.jsx";

const initial = {
  name: "",
  registerNumber: "",
  department: "",
  year: "",
  phone: "",
  email: "",
  selectedEvent: "",
  teamMembers: "",
};

export default function RegisterForm() {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    const handler = (e) => setValues((v) => ({ ...v, selectedEvent: e.detail }));
    window.addEventListener("talentia:select-event", handler);
    return () => window.removeEventListener("talentia:select-event", handler);
  }, []);

  const set = (k) => (e) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const errs = validateRegistration(values);
    setErrors(errs);
    if (Object.keys(errs).length) {
      document.getElementById("register")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    setStatus("sending");
    setServerError("");
    try {
      await submitRegistration(values, TALENTIA_CONFIG.apiBase);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setServerError(err.message);
      if (err.details) setErrors(err.details);
    }
  };

  const reset = () => {
    setValues(initial);
    setErrors({});
    setStatus("idle");
  };

  return (
    <section id="register" className="relative overflow-hidden py-20">
      <GiantWord word="ENTER" />
      <div className="relative mx-auto max-w-6xl px-5">
        <Reveal>
          <p className="font-mono2 text-center text-[11px] tracking-[0.3em] text-cyan-300">04 — JOIN</p>
          <h2 className="font-display mt-3 text-center text-3xl font-black sm:text-5xl">{TALENTIA_CONFIG.registration.heading}</h2>
          <p className="mt-3 text-center text-white/60">{TALENTIA_CONFIG.registration.subtext}</p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="glass relative mx-auto mt-10 max-w-3xl overflow-hidden rounded-3xl p-6 sm:p-10">
            <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-cyan-400/15 blur-3xl" />
            <AnimatePresence mode="wait">
              {status === "success" ? (
                <motion.div key="ok" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-10 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.1 }}
                    className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-emerald-300 to-cyan-400 text-3xl font-black text-black shadow-[0_0_60px_rgba(52,211,153,0.5)]"
                  >
                    ✓
                  </motion.div>
                  <h3 className="font-display mt-6 text-2xl font-black tracking-wide">REGISTRATION CONFIRMED</h3>
                  <p className="mt-2 text-white/65">Welcome to TALENTIA ’26{values.name ? `, ${values.name.split(" ")[0]}` : ""}.</p>
                  <p className="mt-1 font-mono2 text-xs text-white/40">A confirmation has been recorded. Our coordinators will reach out soon.</p>
                  <button onClick={reset} className="btn-magnetic mt-6 rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-xs font-bold tracking-widest">
                    REGISTER ANOTHER PARTICIPANT
                  </button>
                </motion.div>
              ) : (
                <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={onSubmit} noValidate className="relative">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {[
                      ["name", "Full Name", "text", "e.g. Priya Sharma", 0],
                      ["registerNumber", "Register Number", "text", "e.g. 2026MSC001", 0],
                      ["department", "Department", "text", "e.g. M.Sc. Computer Science", 0],
                      ["year", "Year", "text", "e.g. First Year", 0],
                      ["phone", "Phone Number", "tel", "+91 …", 0],
                      ["email", "Email", "email", "you@example.com", 0],
                    ].map(([k, label, type, ph]) => (
                      <label key={k} className="block">
                        <span className="font-mono2 mb-1.5 block text-[11px] tracking-[0.18em] text-white/55">{label.toUpperCase()} *</span>
                        <input type={type} value={values[k]} onChange={set(k)} placeholder={ph} className={`field ${errors[k] ? "field-error" : ""}`} />
                        {errors[k] && <span className="mt-1 block text-xs text-red-300">{errors[k]}</span>}
                      </label>
                    ))}
                    <label className="block sm:col-span-2">
                      <span className="font-mono2 mb-1.5 block text-[11px] tracking-[0.18em] text-white/55">SELECTED EVENT *</span>
                      <select value={values.selectedEvent} onChange={set("selectedEvent")} className={`field ${errors.selectedEvent ? "field-error" : ""}`}>
                        <option value="">— Choose your challenge —</option>
                        {EVENTS.map((e) => (
                          <option key={e.id} value={e.id}>{e.name} ({e.category})</option>
                        ))}
                      </select>
                      {errors.selectedEvent && <span className="mt-1 block text-xs text-red-300">{errors.selectedEvent}</span>}
                    </label>
                    <label className="block sm:col-span-2">
                      <span className="font-mono2 mb-1.5 block text-[11px] tracking-[0.18em] text-white/55">TEAM MEMBERS (IF REQUIRED)</span>
                      <textarea value={values.teamMembers} onChange={set("teamMembers")} rows={3} placeholder="Names + register numbers of teammates, one per line (optional)" className="field resize-none" />
                    </label>
                  </div>

                  {status === "error" && (
                    <p className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{serverError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="btn-magnetic mt-6 w-full rounded-2xl bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-400 px-7 py-4 text-sm font-extrabold tracking-[0.2em] text-black shadow-[0_0_40px_rgba(34,211,238,0.35)] disabled:opacity-60"
                  >
                    {status === "sending" ? "SECURING YOUR SPOT…" : "REGISTER NOW →"}
                  </button>
                  <p className="mt-3 text-center font-mono2 text-[11px] text-white/35">
                    Fee: {TALENTIA_CONFIG.registration.fee} • Deadline: {TALENTIA_CONFIG.registration.deadline}
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
