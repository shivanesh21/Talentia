const { readLocal, writeLocal, query, hasPg } = require("../config/db");

const ALLOWED_EVENTS = new Set([
  "binary-quest",
  "data-deductive",
  "aptitude-arena",
  "flip-frenzy",
  "meme-decode",
  "gift-hunt",
]);

async function create(payload) {
  const row = {
    id: `reg_${Date.now().toString(36)}${Math.floor(Math.random() * 1e4)}`,
    ...payload,
    team_members: payload.teamMembers || "",
    created_at: new Date().toISOString(),
  };
  if (hasPg()) {
    await query(
      `INSERT INTO registrations
       (id, name, register_number, department, year, phone, email, selected_event, team_members, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [row.id, row.name, row.registerNumber, row.department, row.year, row.phone, row.email, row.selectedEvent, row.team_members, row.created_at]
    );
    return row;
  }
  const rows = readLocal();
  rows.push(row);
  writeLocal(rows);
  return row;
}

async function list({ search = "", event = "", limit = 100, offset = 0 }) {
  if (hasPg()) {
    const conds = [];
    const params = [];
    if (search) {
      params.push(`%${search}%`);
      conds.push(`(name ILIKE $${params.length} OR register_number ILIKE $${params.length} OR email ILIKE $${params.length})`);
    }
    if (event) {
      params.push(event);
      conds.push(`selected_event = $${params.length}`);
    }
    const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";
    params.push(limit, offset);
    const { rows } = await query(
      `SELECT * FROM registrations ${where} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    const count = await query(`SELECT COUNT(*)::int AS c FROM registrations ${where}`, params.slice(0, params.length - 2));
    return { rows, total: count.rows[0]?.c ?? rows.length };
  }
  let rows = readLocal().sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
  if (event) rows = rows.filter((r) => r.selectedEvent === event);
  if (search) {
    const s = search.toLowerCase();
    rows = rows.filter((r) => [r.name, r.registerNumber, r.email].join(" ").toLowerCase().includes(s));
  }
  const total = rows.length;
  return { rows: rows.slice(offset, offset + limit), total };
}

async function stats() {
  if (hasPg()) {
    const total = await query("SELECT COUNT(*)::int AS c FROM registrations");
    const byEvent = await query("SELECT selected_event AS event, COUNT(*)::int AS count FROM registrations GROUP BY selected_event");
    return { total: total.rows[0].c, byEvent: byEvent.rows };
  }
  const rows = readLocal();
  const byEvent = {};
  rows.forEach((r) => { byEvent[r.selectedEvent] = (byEvent[r.selectedEvent] || 0) + 1; });
  return { total: rows.length, byEvent: Object.entries(byEvent).map(([event, count]) => ({ event, count })) };
}

module.exports = { create, list, stats, ALLOWED_EVENTS };
