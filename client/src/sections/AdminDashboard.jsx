import { useEffect, useMemo, useState } from "react";
import GiantWord from "../components/GiantWord.jsx";
import { TALENTIA_CONFIG } from "../data/config.js";
import { fetchAdminStats, fetchAdminRegistrations, adminExportUrl, adminLogout } from "../utils/api.js";

const FILTERS = ["All", "Technical", "Non-Technical"];

export default function AdminDashboard({ token, onLogout, onBack }) {
  const [stats, setStats] = useState(null);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [eventFilter, setEventFilter] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [s, r] = await Promise.all([
        fetchAdminStats(token, TALENTIA_CONFIG.apiBase),
        fetchAdminRegistrations(token, { limit: 500 }, TALENTIA_CONFIG.apiBase),
      ]);
      setStats(s);
      setRows(r.rows || []);
      setTotal(r.total || 0);
    } catch (e) {
      if (e.status === 401) return onLogout();
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  const logout = async () => {
    await adminLogout(token, TALENTIA_CONFIG.apiBase);
    sessionStorage.removeItem("talentia_admin_token");
    onLogout();
  };

  const visible = useMemo(() => {
    return rows.filter((r) => {
      if (eventFilter && r.event_id !== eventFilter) return false;
      if (catFilter !== "All" && r.category !== catFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const hay = [r.student_name, r.register_number, r.email, r.team_name, r.department,
          ...(r.members || []).map((m) => `${m.name} ${m.register_number}`)].join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rows, eventFilter, catFilter, search]);

  const eventOptions = useMemo(() => {
    const map = new Map();
    rows.forEach((r) => map.set(r.event_id, r.event_name));
    return [...map.entries()];
  }, [rows]);

  return (
    <section className="relative overflow-hidden py-24">
      <GiantWord word="DATA" />
      <div className="relative mx-auto max-w-6xl px-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono2 text-[11px] tracking-[0.3em] text-amber-300">ADMIN DASHBOARD</p>
            <h2 className="font-display mt-1 text-2xl font-black sm:text-3xl">REGISTRATIONS</h2>
          </div>
          <div className="flex gap-2">
            <button onClick={onBack} className="btn-magnetic rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold">← SITE</button>
            <a href={adminExportUrl(token, TALENTIA_CONFIG.apiBase)} className="btn-magnetic rounded-xl bg-emerald-300 px-4 py-2 text-xs font-extrabold text-black">⬇ EXPORT CSV</a>
            <button onClick={logout} className="btn-magnetic rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-2 text-xs font-bold text-red-200">LOGOUT</button>
          </div>
        </div>

        {loading ? (
          <div className="glass mt-6 animate-pulse rounded-3xl p-10 text-center text-white/50">Loading dashboard…</div>
        ) : error ? (
          <div className="glass mt-6 rounded-3xl p-8 text-center">
            <p className="text-red-200">{error}</p>
            <button onClick={load} className="btn-magnetic mt-4 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-black">RETRY</button>
          </div>
        ) : (
          <>
            {/* stat cards */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["TOTAL PARTICIPANTS", stats?.totalStudents ?? 0, "from-cyan-400/30 to-blue-500/20"],
                ["TOTAL TEAMS", stats?.totalTeams ?? 0, "from-violet-400/30 to-purple-500/20"],
                ["EVENT ENTRIES", stats?.totalRegistrations ?? total, "from-pink-400/30 to-rose-500/20"],
                ["EVENTS ACTIVE", stats?.byEvent?.length ?? 0, "from-emerald-300/30 to-teal-500/20"],
              ].map(([k, v, grad]) => (
                <div key={k} className={`rounded-2xl border border-white/10 bg-gradient-to-br ${grad} p-5`}>
                  <p className="font-mono2 text-[10px] tracking-[0.22em] text-white/55">{k}</p>
                  <p className="font-display mt-1 text-3xl font-black">{v}</p>
                </div>
              ))}
            </div>

            {/* per-event breakdown */}
            <div className="glass mt-4 rounded-2xl p-5">
              <p className="font-mono2 text-[10px] tracking-[0.25em] text-white/45">ENTRIES PER EVENT</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(stats?.byEvent || []).map((b) => (
                  <button key={b.event} onClick={() => setEventFilter((f) => (f === b.event ? "" : b.event))}
                    className={`rounded-full border px-4 py-1.5 text-xs font-bold tracking-wider transition ${eventFilter === b.event ? "border-cyan-300 bg-cyan-300 text-black" : "border-white/15 bg-white/5 hover:bg-white/10"}`}>
                    {b.event_name} · {b.count}
                  </button>
                ))}
                {!(stats?.byEvent || []).length && <p className="text-sm text-white/40">No registrations yet.</p>}
              </div>
            </div>

            {/* filters */}
            <div className="mt-4 flex flex-wrap gap-2">
              <select value={eventFilter} onChange={(e) => setEventFilter(e.target.value)} className="field max-w-[220px]">
                <option value="">All events</option>
                {eventOptions.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
              </select>
              <div className="glass flex items-center gap-1 rounded-xl p-1">
                {FILTERS.map((c) => (
                  <button key={c} onClick={() => setCatFilter(c)}
                    className={`rounded-lg px-3 py-2 text-[11px] font-bold tracking-widest ${catFilter === c ? "bg-white text-black" : "text-white/60 hover:text-white"}`}>{c.toUpperCase()}</button>
                ))}
              </div>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 Search name / reg. no / email / team…"
                className="field min-w-[220px] flex-1" />
              <button onClick={load} className="btn-magnetic rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold">↻ REFRESH</button>
            </div>

            <p className="mt-3 font-mono2 text-[11px] tracking-[0.2em] text-white/40">
              SHOWING {visible.length} OF {total} ENTRIES
            </p>

            {/* table */}
            <div className="glass mt-3 overflow-x-auto rounded-2xl">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="font-mono2 border-b border-white/10 text-[10px] tracking-[0.2em] text-white/45">
                    <th className="px-4 py-3">STUDENT</th>
                    <th className="px-4 py-3">CONTACT</th>
                    <th className="px-4 py-3">EVENT</th>
                    <th className="px-4 py-3">TYPE / TEAM</th>
                    <th className="px-4 py-3">DETAILS</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((r) => (
                    <>
                      <tr key={r.id} className="border-b border-white/5 align-top hover:bg-white/[0.03]">
                        <td className="px-4 py-3">
                          <p className="font-bold">{r.student_name}</p>
                          <p className="font-mono2 text-[11px] text-cyan-200">{r.register_number}</p>
                          <p className="text-xs text-white/50">{r.department}</p>
                        </td>
                        <td className="px-4 py-3 font-mono2 text-xs text-white/70">
                          <p>{r.phone}</p>
                          <p className="break-all">{r.email}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-bold tracking-wider">{r.event_name}</span>
                          <p className="font-mono2 mt-1 text-[10px] text-white/40">{r.category?.toUpperCase()}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${r.participation_type === "team" ? "bg-violet-400/20 text-violet-200" : "bg-cyan-300/15 text-cyan-200"}`}>
                            {r.participation_type === "team" ? `👥 TEAM${r.team_name ? ` · ${r.team_name}` : ""} (${1 + (r.members || []).length})` : "🧍 INDIVIDUAL"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {r.participation_type === "team" ? (
                            <button onClick={() => setExpanded((x) => (x === r.id ? null : r.id))} className="rounded-lg bg-white/10 px-3 py-1.5 text-[11px] font-bold hover:bg-white/20">
                              {expanded === r.id ? "HIDE MEMBERS ▲" : `VIEW MEMBERS (${(r.members || []).length}) ▼`}
                            </button>
                          ) : <span className="font-mono2 text-[11px] text-white/35">—</span>}
                        </td>
                      </tr>
                      {expanded === r.id && (
                        <tr key={`${r.id}-m`} className="border-b border-white/10 bg-white/[0.03]">
                          <td colSpan={5} className="px-6 py-3">
                            <p className="font-mono2 text-[10px] tracking-[0.25em] text-white/45">TEAM MEMBERS</p>
                            {(r.members || []).map((m) => (
                              <p key={m.id} className="mt-1 text-xs text-white/75">
                                • <b>{m.name}</b> <span className="font-mono2 text-cyan-200">{m.register_number}</span>
                                {m.department && <span className="text-white/50"> · {m.department}</span>}
                                {[m.phone, m.email].filter(Boolean).join(" · ") && <span className="font-mono2 text-white/50"> · {[m.phone, m.email].filter(Boolean).join(" · ")}</span>}
                              </p>
                            ))}
                            {!(r.members || []).length && <p className="text-xs text-white/40">Leader only (team of 1).</p>}
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
              {!visible.length && <p className="p-8 text-center text-sm text-white/45">No entries match this filter.</p>}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
