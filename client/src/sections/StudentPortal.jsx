import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Reveal from "../components/Reveal.jsx";
import GiantWord from "../components/GiantWord.jsx";
import { EVENTS } from "../data/events.js";
import { TALENTIA_CONFIG } from "../data/config.js";
import { studentMe, studentUpdateMe, studentRegisterEvents, studentCancelRegistration, studentLogout } from "../utils/api.js";

const emptyMember = () => ({ name: "", registerNumber: "", department: "", phone: "", email: "" });
const blankEntry = () => ({ mode: "individual", teamName: "", members: [] });

/**
 * Logged-in student page: profile details + per-event entry.
 * EVERY event gets its own choice: apply INDIVIDUALLY or AS A TEAM
 * (each team: you + up to 2 members, size 1–3).
 */
export default function StudentPortal({ token, presetEvents = [], onLogout, onBack }) {
  const [me, setMe] = useState(null);
  const [joined, setJoined] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [editing, setEditing] = useState(false);
  const [contact, setContact] = useState({ department: "", year: "", phone: "", email: "" });
  const [saveMsg, setSaveMsg] = useState("");

  const [eventIds, setEventIds] = useState(presetEvents);
  const [perEvent, setPerEvent] = useState({});
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [serverError, setServerError] = useState("");
  const [result, setResult] = useState(null);
  const [confirmRemove, setConfirmRemove] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [removeMsg, setRemoveMsg] = useState("");

  const doRemove = async (eventId) => {
    setRemoving(eventId);
    setRemoveMsg("");
    try {
      await studentCancelRegistration(token, eventId, TALENTIA_CONFIG.apiBase);
      setConfirmRemove(null);
      setRemoveMsg("✓ Entry removed — re-select it below to join again.");
      setEventIds((ids) => ids.filter((x) => x !== eventId));
      setPerEvent((p) => {
        const next = { ...p };
        delete next[eventId];
        return next;
      });
      load();
    } catch (e) {
      setRemoveMsg(e.message);
    } finally {
      setRemoving(null);
    }
  };

  const load = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const data = await studentMe(token, TALENTIA_CONFIG.apiBase);
      setMe(data.student);
      setJoined(data.joined || []);
      setContact({
        department: data.student.department || "",
        year: data.student.year || "First Year",
        phone: data.student.phone || "",
        email: data.student.email || "",
      });
    } catch (e) {
      if (e.status === 401) return onLogout();
      setLoadError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  const logout = async () => {
    await studentLogout(token, TALENTIA_CONFIG.apiBase);
    sessionStorage.removeItem("talentia_student_token");
    onLogout();
  };

  const joinedIds = new Set(joined.map((j) => j.event_id));
  const freshIds = eventIds.filter((id) => !joinedIds.has(id));

  const entryOf = (id) => perEvent[id] || blankEntry();
  const setEntry = (id, patch) => {
    setPerEvent((p) => ({ ...p, [id]: { ...entryOf(id), ...patch } }));
    setErrors((er) => {
      const next = { ...er };
      Object.keys(next).filter((k) => k.startsWith(`team:${id}:`)).forEach((k) => delete next[k]);
      return next;
    });
  };

  const toggleEvent = (id) => {
    if (joinedIds.has(id)) return;
    setEventIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
    setErrors((er) => ({ ...er, eventIds: undefined }));
  };

  const setM = (id, i, k) => (e) => {
    const en = entryOf(id);
    setEntry(id, { members: en.members.map((m, j) => (j === i ? { ...m, [k]: e.target.value } : m)) });
  };

  const copyTeamFrom = (toId) => {
    const srcId = freshIds.find((id) => id !== toId && entryOf(id).mode === "team" && (entryOf(id).teamName || entryOf(id).members.length));
    if (!srcId) return;
    const src = entryOf(srcId);
    setEntry(toId, { mode: "team", teamName: src.teamName, members: src.members.map((m) => ({ ...m })) });
  };

  const saveContact = async () => {
    setSaveMsg("");
    try {
      const data = await studentUpdateMe(token, contact, TALENTIA_CONFIG.apiBase);
      setMe(data.student);
      setEditing(false);
      setSaveMsg("✓ Details updated.");
    } catch (e) {
      setSaveMsg(e.message);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const er = {};
    if (!freshIds.length) er.eventIds = joined.length ? "You have already joined every selected event." : "Select at least one event.";
    freshIds.forEach((id) => {
      const en = entryOf(id);
      if (en.mode === "team") {
        const seen = new Set([String(me.register_number).toUpperCase()]);
        en.members.forEach((m, j) => {
          if (m.name.trim().length < 2) er[`team:${id}:m${j}name`] = "Required.";
          const rn = m.registerNumber.trim().toUpperCase();
          if (!rn) er[`team:${id}:m${j}registerNumber`] = "Required.";
          else if (seen.has(rn)) er[`team:${id}:m${j}registerNumber`] = "Duplicate in team.";
          else seen.add(rn);
        });
      }
    });
    setErrors(er);
    if (Object.keys(er).length) return;
    setStatus("sending");
    setServerError("");
    try {
      const data = await studentRegisterEvents(token,
        {
          entries: freshIds.map((id) => {
            const en = entryOf(id);
            return { eventId: id, participationType: en.mode, teamName: en.teamName, members: en.mode === "team" ? en.members : [] };
          }),
        },
        TALENTIA_CONFIG.apiBase);
      setResult(data.registration);
      setStatus("success");
      setEventIds([]);
      setPerEvent({});
      load();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setStatus("error");
      setServerError(err.message);
      if (err.details) setErrors(err.details);
    }
  };

  const cls = (bad) => `field ${bad ? "field-error" : ""}`;
  const tech = EVENTS.filter((x) => x.category === "Technical");
  const nonTech = EVENTS.filter((x) => x.category === "Non-Technical");
  const evName = (id) => EVENTS.find((x) => x.id === id)?.name || id;

  if (loading) {
    return (
      <section className="relative py-24">
        <div className="mx-auto max-w-3xl px-5"><div className="glass animate-pulse rounded-3xl p-10 text-center text-white/50">Loading your profile…</div></div>
      </section>
    );
  }
  if (loadError) {
    return (
      <section className="relative py-24">
        <div className="mx-auto max-w-md px-5 text-center">
          <p className="text-red-200">{loadError}</p>
          <button onClick={load} className="btn-magnetic mt-4 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-black">RETRY</button>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden py-24">
      <GiantWord word="YOU" />
      <div className="relative mx-auto max-w-3xl px-5">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="font-mono2 text-xs tracking-[0.2em] text-white/50 hover:text-white">← HOME</button>
          <button onClick={logout} className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-2 text-xs font-bold text-red-200">LOGOUT</button>
        </div>

        <Reveal>
          <h2 className="font-display mt-4 text-3xl font-black sm:text-4xl">
            HI, {me.name.split(" ")[0].toUpperCase()} <span className="gradient-text">👋</span>
          </h2>
          <p className="mt-1 font-mono2 text-xs tracking-[0.2em] text-white/45">{me.register_number} • APPLY INDIVIDUALLY OR AS A TEAM</p>
        </Reveal>

        {status === "success" && result && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-2xl border border-emerald-300/30 bg-emerald-400/10 p-5 text-center">
            <p className="font-display font-extrabold text-emerald-200">✓ REGISTRATION CONFIRMED</p>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {result.entries.map((en) => (
                <span key={en.eventId} className="rounded-full border border-emerald-300/30 px-3 py-1 text-xs font-bold">
                  {evName(en.eventId)} · {en.participationType === "team" ? `TEAM (${1 + (en.teamMembers || []).length})` : "SOLO"}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* 1 — profile details */}
        <Reveal>
          <div className="glass mt-6 rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xs font-bold tracking-[0.25em] text-white/60">1 · YOUR DETAILS</h3>
              {!editing ? (
                <button onClick={() => setEditing(true)} className="rounded-xl bg-white/10 px-3 py-1.5 text-xs font-bold hover:bg-white/20">✎ EDIT</button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => setEditing(false)} className="rounded-xl px-3 py-1.5 text-xs font-bold text-white/60">CANCEL</button>
                  <button onClick={saveContact} className="rounded-xl bg-white px-3 py-1.5 text-xs font-extrabold text-black">SAVE</button>
                </div>
              )}
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-white/[0.04] px-4 py-3">
                <p className="font-mono2 text-[10px] tracking-[0.2em] text-white/45">FULL NAME</p>
                <p className="font-bold">{me.name}</p>
              </div>
              <div className="rounded-xl bg-white/[0.04] px-4 py-3">
                <p className="font-mono2 text-[10px] tracking-[0.2em] text-white/45">REGISTER NUMBER</p>
                <p className="font-mono2 font-bold text-cyan-200">{me.register_number}</p>
              </div>
              {[["department", "DEPARTMENT"], ["year", "YEAR"], ["phone", "PHONE"], ["email", "EMAIL"]].map(([k, label]) => (
                <div key={k} className="rounded-xl bg-white/[0.04] px-4 py-3">
                  <p className="font-mono2 text-[10px] tracking-[0.2em] text-white/45">{label}</p>
                  {editing ? (
                    <input value={contact[k]} onChange={(e) => setContact((c) => ({ ...c, [k]: e.target.value }))} className="mt-1 w-full bg-transparent font-semibold outline-none" />
                  ) : (
                    <p className="font-semibold">{me[k] || "—"}</p>
                  )}
                </div>
              ))}
            </div>
            {saveMsg && <p className="mt-2 text-xs text-cyan-200">{saveMsg}</p>}
          </div>
        </Reveal>

        {!!joined.length && (
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-5">
            <div className="flex items-center justify-between">
              <p className="font-mono2 text-[10px] tracking-[0.25em] text-white/45">YOUR EVENTS ({joined.length}) · TAP ✕ TO REMOVE & RE-CHOOSE</p>
            </div>
            <div className="mt-3 space-y-2">
              {joined.map((j, i) => (
                <div key={i} className="flex items-center justify-between gap-3 rounded-xl border border-emerald-300/20 bg-emerald-400/5 px-4 py-2.5">
                  <p className="text-sm font-bold text-emerald-100">
                    ✓ {j.event_name}
                    <span className="font-mono2 ml-2 text-[11px] font-normal text-emerald-200/70">
                      {j.participation_type === "team" ? `TEAM${j.team_name ? ` · ${j.team_name}` : ""}${j.member_count ? ` (${1 + j.member_count})` : ""}` : "SOLO"}
                    </span>
                  </p>
                  {confirmRemove === j.event_id ? (
                    <span className="flex shrink-0 gap-2">
                      <button onClick={() => doRemove(j.event_id)} disabled={removing === j.event_id}
                        className="rounded-lg bg-red-500 px-3 py-1.5 text-[11px] font-extrabold text-white disabled:opacity-60">
                        {removing === j.event_id ? "…" : "CONFIRM"}
                      </button>
                      <button onClick={() => setConfirmRemove(null)} className="rounded-lg bg-white/10 px-3 py-1.5 text-[11px] font-bold">KEEP</button>
                    </span>
                  ) : (
                    <button onClick={() => setConfirmRemove(j.event_id)} title="Remove this entry"
                      className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white/10 text-sm text-white/70 hover:bg-red-500/30 hover:text-red-200">✕</button>
                  )}
                </div>
              ))}
            </div>
            {removeMsg && <p className="mt-2 text-xs text-cyan-200">{removeMsg}</p>}
            <p className="mt-2 font-mono2 text-[10px] text-white/35">TIP: TO SWITCH SOLO ↔ TEAM, REMOVE THE ENTRY AND RE-ADD IT BELOW.</p>
          </div>
        )}

        {/* 2 — pick events */}
        <div className="glass mt-4 rounded-3xl p-6">
          <h3 className="font-display text-xs font-bold tracking-[0.25em] text-white/60">2 · SELECT EVENTS</h3>
          {[["TECHNICAL", tech], ["NON-TECHNICAL", nonTech]].map(([label, list]) => (
            <div key={label} className="mt-3">
              <p className="font-mono2 text-[10px] tracking-[0.25em] text-white/40">{label}</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                {list.map((e) => {
                  const doneJoined = joinedIds.has(e.id);
                  const on = eventIds.includes(e.id);
                  return (
                    <button type="button" key={e.id} onClick={() => toggleEvent(e.id)} disabled={doneJoined}
                      className={`rounded-2xl border p-3 text-left transition ${doneJoined ? "border-emerald-300/25 bg-emerald-400/5 opacity-70" : on ? "border-cyan-300/50 bg-white/10" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"}`}>
                      <p className="flex items-center justify-between text-xs font-extrabold tracking-widest">
                        {e.name}
                        <span className={`grid h-5 w-5 place-items-center rounded-md border text-[11px] ${doneJoined ? "border-emerald-300 bg-emerald-300 text-black" : on ? "border-cyan-300 bg-cyan-300 text-black" : "border-white/25 text-transparent"}`}>✓</span>
                      </p>
                      <p className="mt-1 font-mono2 text-[10px] text-white/40">{doneJoined ? "✓ JOINED" : `${e.slot?.toUpperCase()} · ${e.time}`}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {errors.eventIds && <p className="mt-2 text-xs text-red-300">{errors.eventIds}</p>}
        </div>

        {/* 3 — per-event individual/team choice */}
        {!!freshIds.length && (
          <div className="mt-4 space-y-4">
            <h3 className="font-display text-xs font-bold tracking-[0.25em] text-white/60">3 · FOR EACH EVENT: SOLO OR TEAM?</h3>
            {freshIds.map((id) => {
              const en = entryOf(id);
              const size = 1 + en.members.length;
              const canCopy = freshIds.some((x) => x !== id && entryOf(x).mode === "team" && (entryOf(x).teamName || entryOf(x).members.length));
              return (
                <div key={id} className="glass rounded-3xl p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-display text-sm font-extrabold tracking-widest">{evName(id)}</p>
                      <p className="font-mono2 text-[10px] tracking-wider text-cyan-200/80">🕘 {EVENTS.find((x) => x.id === id)?.slot?.toUpperCase()} · {EVENTS.find((x) => x.id === id)?.time}</p>
                    </div>
                    <div className="flex gap-2">
                      {[["individual", "🧍 SOLO"], ["team", "👥 TEAM"]].map(([v, t]) => (
                        <button key={v} type="button" onClick={() => setEntry(id, { mode: v })}
                          className={`rounded-xl px-4 py-2 text-xs font-extrabold tracking-widest transition ${en.mode === v ? "bg-white text-black" : "border border-white/15 bg-white/5 text-white/70 hover:text-white"}`}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {en.mode === "team" && (
                    <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-mono2 text-[11px] tracking-[0.2em] text-white/55">THIS EVENT'S TEAM · SIZE {size}/3</p>
                        <div className="flex gap-2">
                          {canCopy && (
                            <button type="button" onClick={() => copyTeamFrom(id)} className="rounded-xl bg-white/10 px-3 py-1.5 text-xs font-bold hover:bg-white/20">⧉ COPY TEAM</button>
                          )}
                          {en.members.length < 2 && (
                            <button type="button" onClick={() => setEntry(id, { members: [...en.members, emptyMember()] })}
                              className="rounded-xl bg-white/10 px-3 py-1.5 text-xs font-bold hover:bg-white/20">+ ADD MEMBER</button>
                          )}
                        </div>
                      </div>
                      <input value={en.teamName} onChange={(e) => setEntry(id, { teamName: e.target.value })}
                        placeholder="Team name for this event (optional)" className="field mt-3" />
                      {en.members.map((m, j) => (
                        <div key={j} className="mt-3 rounded-xl border border-white/10 p-3">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold tracking-widest text-white/70">MEMBER {j + 1}</p>
                            <button type="button" onClick={() => setEntry(id, { members: en.members.filter((_, k) => k !== j) })} className="text-xs text-red-300">Remove ✕</button>
                          </div>
                          <div className="mt-2 grid gap-3 sm:grid-cols-2">
                            <label className="block"><span className="font-mono2 mb-1 block text-[10px] text-white/50">NAME *</span>
                              <input value={m.name} onChange={setM(id, j, "name")} className={cls(errors[`team:${id}:m${j}name`])} placeholder="Member name" />
                              {errors[`team:${id}:m${j}name`] && <span className="text-xs text-red-300">{errors[`team:${id}:m${j}name`]}</span>}</label>
                            <label className="block"><span className="font-mono2 mb-1 block text-[10px] text-white/50">REGISTER NUMBER *</span>
                              <input value={m.registerNumber} onChange={setM(id, j, "registerNumber")} className={cls(errors[`team:${id}:m${j}registerNumber`])} placeholder="Reg. number" />
                              {errors[`team:${id}:m${j}registerNumber`] && <span className="text-xs text-red-300">{errors[`team:${id}:m${j}registerNumber`]}</span>}</label>
                            <label className="block"><span className="font-mono2 mb-1 block text-[10px] text-white/50">DEPARTMENT</span>
                              <input value={m.department} onChange={setM(id, j, "department")} className="field" placeholder="Department" /></label>
                            <label className="block"><span className="font-mono2 mb-1 block text-[10px] text-white/50">PHONE / EMAIL</span>
                              <input value={m.phone} onChange={setM(id, j, "phone")} className="field" placeholder="Phone or email" /></label>
                          </div>
                        </div>
                      ))}
                      {errors[`team:${id}:members`] && <p className="mt-2 text-xs text-red-300">{errors[`team:${id}:members`]}</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <form onSubmit={onSubmit} noValidate>
          {status === "error" && <p className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{serverError}</p>}
          <button type="submit" disabled={status === "sending" || !freshIds.length}
            className="btn-magnetic mt-6 w-full rounded-2xl bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-400 px-7 py-4 text-sm font-extrabold tracking-[0.2em] text-black disabled:opacity-50">
            {status === "sending" ? "SUBMITTING…" : `SUBMIT${freshIds.length ? ` · ${freshIds.length} EVENT${freshIds.length > 1 ? "S" : ""}` : ""} →`}
          </button>
        </form>
      </div>
    </section>
  );
}
