import { useState } from "react";
import Reveal from "../components/Reveal.jsx";
import GiantWord from "../components/GiantWord.jsx";
import { TALENTIA_CONFIG } from "../data/config.js";
import { studentLogin, studentCreateProfile, friendlyMessage } from "../utils/api.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d][\d\s-]{6,15}$/;

/**
 * Student entry page: LOGIN tab (register no + phone) or
 * NEW PROFILE tab (first-time details) → both land in the portal.
 */
export default function StudentLogin({ onBack, onSuccess, presetEvents = [] }) {
  const [tab, setTab] = useState("login");
  const [login, setLogin] = useState({ registerNumber: "", phone: "" });
  const [profile, setProfile] = useState({ name: "", registerNumber: "", department: "", year: "First Year", phone: "", email: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [busy, setBusy] = useState(false);

  const done = (data) => {
    sessionStorage.setItem("talentia_student_token", data.token);
    onSuccess(data.token, presetEvents);
  };

  const doLogin = async (e) => {
    e.preventDefault();
    const er = {};
    if (!login.registerNumber.trim()) er.registerNumber = "Register number is required.";
    if (!login.phone.trim()) er.phone = "Phone number is required.";
    setErrors(er);
    if (Object.keys(er).length) return;
    setBusy(true);
    setServerError("");
    try {
      done(await studentLogin(login.registerNumber.trim(), login.phone.trim(), TALENTIA_CONFIG.apiBase));
    } catch (err) {
      setServerError(friendlyMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const doCreate = async (e) => {
    e.preventDefault();
    const er = {};
    if (profile.name.trim().length < 2) er.name = "Enter your full name.";
    if (!profile.registerNumber.trim()) er.registerNumber = "Register number is required.";
    if (!profile.department.trim()) er.department = "Department is required.";
    if (!PHONE_RE.test(profile.phone.trim())) er.phone = "Enter a valid phone number.";
    if (!EMAIL_RE.test(profile.email.trim())) er.email = "Enter a valid email address.";
    setErrors(er);
    if (Object.keys(er).length) return;
    setBusy(true);
    setServerError("");
    try {
      done(await studentCreateProfile(profile, TALENTIA_CONFIG.apiBase));
    } catch (err) {
      setServerError(friendlyMessage(err));
      if (err.details) setErrors(err.details);
    } finally {
      setBusy(false);
    }
  };

  const setL = (k) => (e) => { setLogin((v) => ({ ...v, [k]: e.target.value })); setErrors((e2) => ({ ...e2, [k]: undefined })); };
  const setP = (k) => (e) => { setProfile((v) => ({ ...v, [k]: e.target.value })); setErrors((e2) => ({ ...e2, [k]: undefined })); };
  const cls = (bad) => `field ${bad ? "field-error" : ""}`;
  const err = (k) => errors[k] && <span className="mt-1 block text-xs text-red-300">{errors[k]}</span>;

  return (
    <section className="relative overflow-hidden py-24">
      <GiantWord word="LOGIN" />
      <div className="relative mx-auto max-w-md px-5">
        <button onClick={onBack} className="font-mono2 mb-6 text-xs tracking-[0.2em] text-white/50 hover:text-white">← BACK</button>
        <Reveal>
          <div className="glass rounded-3xl p-8">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400/40 to-violet-500/40 text-2xl">🎓</div>
            <h2 className="font-display mt-4 text-center text-2xl font-black">STUDENT LOGIN</h2>
            <p className="mt-1 text-center font-mono2 text-[11px] tracking-[0.2em] text-white/45">FIRST YEAR M.Sc. • 2026</p>

            <div className="glass mt-6 grid grid-cols-2 gap-1 rounded-xl p-1">
              {[["login", "LOGIN"], ["new", "NEW PROFILE"]].map(([v, t]) => (
                <button key={v} type="button" onClick={() => { setTab(v); setErrors({}); setServerError(""); }}
                  className={`rounded-lg px-3 py-2.5 text-xs font-extrabold tracking-widest transition ${tab === v ? "bg-white text-black" : "text-white/60 hover:text-white"}`}>
                  {t}
                </button>
              ))}
            </div>

            {tab === "login" ? (
              <form onSubmit={doLogin} className="mt-5 space-y-4">
                <label className="block">
                  <span className="font-mono2 mb-1.5 block text-[11px] tracking-[0.18em] text-white/55">REGISTER NUMBER</span>
                  <input value={login.registerNumber} onChange={setL("registerNumber")} className={cls(errors.registerNumber)} placeholder="e.g. 2026MSC001" autoComplete="username" />
                  {err("registerNumber")}
                </label>
                <label className="block">
                  <span className="font-mono2 mb-1.5 block text-[11px] tracking-[0.18em] text-white/55">PHONE NUMBER</span>
                  <input type="tel" value={login.phone} onChange={setL("phone")} className={cls(errors.phone)} placeholder="Registered phone number" autoComplete="tel" />
                  {err("phone")}
                </label>
                {serverError && <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-200">{serverError}</p>}
                <button disabled={busy} className="btn-magnetic w-full rounded-2xl bg-gradient-to-r from-cyan-300 to-violet-400 px-6 py-3.5 text-sm font-extrabold tracking-widest text-black disabled:opacity-60">
                  {busy ? "VERIFYING…" : "LOGIN →"}
                </button>
                <p className="text-center text-xs text-white/45">
                  First time here?{" "}
                  <button type="button" onClick={() => setTab("new")} className="font-bold text-cyan-300 hover:text-cyan-200">Create your profile</button>
                </p>
              </form>
            ) : (
              <form onSubmit={doCreate} className="mt-5 space-y-4" noValidate>
                {[
                  ["name", "FULL NAME *", "text", "e.g. Priya Sharma"],
                  ["registerNumber", "REGISTER NUMBER *", "text", "e.g. 2026MSC001"],
                  ["department", "DEPARTMENT *", "text", "e.g. M.Sc. Computer Science"],
                  ["year", "YEAR", "text", "First Year"],
                  ["phone", "PHONE NUMBER *", "tel", "+91 …"],
                  ["email", "EMAIL *", "email", "you@example.com"],
                ].map(([k, label, type, ph]) => (
                  <label key={k} className="block">
                    <span className="font-mono2 mb-1.5 block text-[11px] tracking-[0.18em] text-white/55">{label}</span>
                    <input type={type} value={profile[k]} onChange={setP(k)} className={cls(errors[k])} placeholder={ph} />
                    {err(k)}
                  </label>
                ))}
                {serverError && <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-200">{serverError}</p>}
                <button disabled={busy} className="btn-magnetic w-full rounded-2xl bg-gradient-to-r from-cyan-300 to-violet-400 px-6 py-3.5 text-sm font-extrabold tracking-widest text-black disabled:opacity-60">
                  {busy ? "CREATING…" : "CREATE PROFILE & CONTINUE →"}
                </button>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
