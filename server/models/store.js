const fs = require("fs");
const path = require("path");
const { query, readLocal, writeLocal, hasPg } = require("../config/db");

// ── V2 store: students, teams, team_members, events, event_registrations ──
// Works on PostgreSQL when DATABASE_URL is set, else a local JSON fallback.

const STORE_FILE = path.join(__dirname, "..", "data.store.json");

const EVENTS_FALLBACK = [
  { id: "binary-quest", name: "BINARY QUEST", category: "Technical", slot: "Morning", time: "9:00 AM – 12:30 PM" },
  { id: "flip-frenzy", name: "FLIP FRENZY", category: "Non-Technical", slot: "Morning", time: "9:00 AM – 12:30 PM" },
  { id: "data-deductive", name: "DATA DEDUCTIVE", category: "Technical", slot: "Morning", time: "9:00 AM – 12:30 PM" },
  { id: "gift-hunt", name: "THE GIFT HUNT", category: "Non-Technical", slot: "Afternoon", time: "1:30 – 4:30 PM" },
  { id: "aptitude-arena", name: "APTITUDE ARENA", category: "Technical", slot: "Afternoon", time: "1:30 – 4:30 PM" },
  { id: "meme-decode", name: "MEME DECODE", category: "Non-Technical", slot: "Afternoon", time: "1:30 – 4:30 PM" },
];

const nid = (p) => `${p}_${Date.now().toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`;
const upper = (s) => String(s || "").trim().toUpperCase();

// ── local JSON helpers ──
function readStore() {
  try {
    const d = JSON.parse(fs.readFileSync(STORE_FILE, "utf8"));
    return { students: [], teams: [], members: [], registrations: [], ...d };
  } catch {
    return { students: [], teams: [], members: [], registrations: [] };
  }
}
function writeStore(d) {
  fs.writeFileSync(STORE_FILE, JSON.stringify(d, null, 2));
}

// ── events ──
async function getEvents() {
  if (hasPg()) {
    const { rows } = await query("SELECT id, name, category, slot, time FROM events ORDER BY category DESC, name");
    if (rows.length) return rows;
  }
  return EVENTS_FALLBACK;
}

// ── students ──
async function findOrCreateStudent(s) {
  const regNo = upper(s.registerNumber);
  if (hasPg()) {
    const f = await query("SELECT * FROM students WHERE register_number = $1", [regNo]);
    if (f.rows[0]) {
      await query(
        "UPDATE students SET name=$2, department=$3, year=$4, phone=$5, email=$6 WHERE id=$1",
        [f.rows[0].id, s.name.trim(), s.department.trim(), (s.year || "First Year").trim(), s.phone.trim(), s.email.trim().toLowerCase()]
      );
      return { ...f.rows[0], register_number: regNo };
    }
    const row = {
      id: nid("stu"), name: s.name.trim(), register_number: regNo,
      department: s.department.trim(), year: (s.year || "First Year").trim(),
      phone: s.phone.trim(), email: s.email.trim().toLowerCase(),
      created_at: new Date().toISOString(),
    };
    await query(
      "INSERT INTO students (id,name,register_number,department,year,phone,email,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)",
      [row.id, row.name, row.register_number, row.department, row.year, row.phone, row.email, row.created_at]
    );
    return row;
  }
  const d = readStore();
  let stu = d.students.find((x) => upper(x.register_number) === regNo);
  if (!stu) {
    stu = {
      id: nid("stu"), name: s.name.trim(), register_number: regNo,
      department: s.department.trim(), year: (s.year || "First Year").trim(),
      phone: s.phone.trim(), email: s.email.trim().toLowerCase(),
      created_at: new Date().toISOString(),
    };
    d.students.push(stu);
  } else {
    Object.assign(stu, {
      name: s.name.trim(), department: s.department.trim(),
      year: (s.year || "First Year").trim(), phone: s.phone.trim(), email: s.email.trim().toLowerCase(),
    });
  }
  writeStore(d);
  return stu;
}

// ── duplicate check: is any of these register numbers already in this event? ──
// Returns the conflicting register number, or null.
async function findConflict(eventId, regNos) {
  const list = [...new Set(regNos.map(upper))];
  if (hasPg()) {
    const a = await query(
      `SELECT s.register_number FROM students s
       JOIN event_registrations er ON er.student_id = s.id
       WHERE er.event_id = $1 AND s.register_number = ANY($2) LIMIT 1`,
      [eventId, list]
    );
    if (a.rows[0]) return a.rows[0].register_number;
    const b = await query(
      `SELECT tm.register_number FROM team_members tm
       JOIN event_registrations er ON er.team_id = tm.team_id
       WHERE er.event_id = $1 AND tm.register_number = ANY($2) LIMIT 1`,
      [eventId, list]
    );
    if (b.rows[0]) return b.rows[0].register_number;
    return null;
  }
  const d = readStore();
  const regs = d.registrations.filter((r) => r.event_id === eventId);
  for (const r of regs) {
    const stu = d.students.find((s) => s.id === r.student_id);
    if (stu && list.includes(upper(stu.register_number))) return stu.register_number;
    if (r.team_id) {
      const m = d.members.find((x) => x.team_id === r.team_id && list.includes(upper(x.register_number)));
      if (m) return m.register_number;
    }
  }
  return null;
}

// ── teams ──
async function createTeam(name, leaderId, members) {
  const team = { id: nid("team"), name: (name || "").trim(), leader_student_id: leaderId, created_at: new Date().toISOString() };
  const rows = members.map((m) => ({
    id: nid("tm"), team_id: team.id, name: m.name.trim(), register_number: upper(m.registerNumber),
    department: (m.department || "").trim(), phone: (m.phone || "").trim(), email: (m.email || "").trim().toLowerCase(),
    created_at: new Date().toISOString(),
  }));
  if (hasPg()) {
    await query("INSERT INTO teams (id,name,leader_student_id,created_at) VALUES ($1,$2,$3,$4)",
      [team.id, team.name, team.leader_student_id, team.created_at]);
    for (const r of rows) {
      await query(
        "INSERT INTO team_members (id,team_id,name,register_number,department,phone,email,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)",
        [r.id, r.team_id, r.name, r.register_number, r.department, r.phone, r.email, r.created_at]
      );
    }
    return { team, members: rows };
  }
  const d = readStore();
  d.teams.push(team);
  d.members.push(...rows);
  writeStore(d);
  return { team, members: rows };
}

// ── registrations ──
async function createRegistration(eventId, studentId, teamId, type) {
  const row = {
    id: nid("er"), event_id: eventId, student_id: studentId, team_id: teamId || null,
    participation_type: type, created_at: new Date().toISOString(),
  };
  if (hasPg()) {
    try {
      await query(
        "INSERT INTO event_registrations (id,event_id,student_id,team_id,participation_type,created_at) VALUES ($1,$2,$3,$4,$5,$6)",
        [row.id, row.event_id, row.student_id, row.team_id, row.participation_type, row.created_at]
      );
    } catch (e) {
      if (e.code === "23505") {
        const err = new Error("DUPLICATE");
        err.isDuplicate = true;
        throw err;
      }
      throw e;
    }
    return row;
  }
  const d = readStore();
  const dup = d.registrations.some((r) =>
    r.event_id === eventId &&
    (teamId ? r.team_id === teamId : r.team_id == null && r.student_id === studentId)
  );
  if (dup) {
    const err = new Error("DUPLICATE");
    err.isDuplicate = true;
    throw err;
  }
  d.registrations.push(row);
  writeStore(d);
  return row;
}

// Cancel a student's own entry (leader only). Cleans up the team if unused.
async function deleteStudentRegistration(studentId, eventId) {
  if (hasPg()) {
    const f = await query(
      "SELECT id, team_id FROM event_registrations WHERE student_id = $1 AND event_id = $2",
      [studentId, eventId]
    );
    if (!f.rows[0]) return { deleted: false };
    const teamId = f.rows[0].team_id;
    await query("DELETE FROM event_registrations WHERE id = $1", [f.rows[0].id]);
    if (teamId) {
      const left = await query("SELECT COUNT(*)::int AS c FROM event_registrations WHERE team_id = $1", [teamId]);
      if (!left.rows[0].c) await query("DELETE FROM teams WHERE id = $1", [teamId]); // members cascade
    }
    return { deleted: true };
  }
  const d = readStore();
  const ix = d.registrations.findIndex((r) => r.student_id === studentId && r.event_id === eventId);
  if (ix < 0) return { deleted: false };
  const [gone] = d.registrations.splice(ix, 1);
  if (gone.team_id && !d.registrations.some((r) => r.team_id === gone.team_id)) {
    d.teams = d.teams.filter((t) => t.id !== gone.team_id);
    d.members = d.members.filter((m) => m.team_id !== gone.team_id);
  }
  writeStore(d);
  return { deleted: true };
}

// ── student auth helpers ──
async function findStudentByRegNo(regNo) {
  const rn = upper(regNo);
  if (hasPg()) {
    const { rows } = await query("SELECT * FROM students WHERE register_number = $1", [rn]);
    return rows[0] || null;
  }
  return readStore().students.find((s) => upper(s.register_number) === rn) || null;
}

async function getStudentById(id) {
  if (hasPg()) {
    const { rows } = await query("SELECT * FROM students WHERE id = $1", [id]);
    return rows[0] || null;
  }
  return readStore().students.find((s) => s.id === id) || null;
}

async function updateStudentContact(id, { department, year, phone, email }) {
  if (hasPg()) {
    await query(
      "UPDATE students SET department=$2, year=$3, phone=$4, email=$5 WHERE id=$1",
      [id, department.trim(), (year || "First Year").trim(), phone.trim(), email.trim().toLowerCase()]
    );
    return getStudentById(id);
  }
  const d = readStore();
  const s = d.students.find((x) => x.id === id);
  if (s) {
    Object.assign(s, {
      department: department.trim(), year: (year || "First Year").trim(),
      phone: phone.trim(), email: email.trim().toLowerCase(),
    });
    writeStore(d);
  }
  return s || null;
}

// Events this student already joined (as individual/leader or team member).
async function registrationsForStudent(student) {
  const regNo = upper(student.register_number);
  if (hasPg()) {
    const { rows } = await query(
      `SELECT er.event_id, e.name AS event_name, e.category, er.participation_type, er.created_at,
              t.name AS team_name,
              (SELECT COUNT(*)::int FROM team_members tm WHERE tm.team_id = er.team_id) AS member_count
       FROM event_registrations er
       JOIN events e ON e.id = er.event_id
       LEFT JOIN teams t ON t.id = er.team_id
       WHERE er.student_id = $1
          OR er.team_id IN (SELECT team_id FROM team_members WHERE register_number = $2)
       ORDER BY er.created_at DESC`,
      [student.id, regNo]
    );
    return rows;
  }
  const d = readStore();
  const myTeamIds = new Set(d.members.filter((m) => upper(m.register_number) === regNo).map((m) => m.team_id));
  const evMap = Object.fromEntries(EVENTS_FALLBACK.map((e) => [e.id, e]));
  return d.registrations
    .filter((r) => r.student_id === student.id || (r.team_id && myTeamIds.has(r.team_id)))
    .map((r) => ({
      event_id: r.event_id, event_name: (evMap[r.event_id] || {}).name || r.event_id,
      category: (evMap[r.event_id] || {}).category || "", participation_type: r.participation_type,
      created_at: r.created_at,
      team_name: r.team_id ? (d.teams.find((t) => t.id === r.team_id) || {}).name || "" : "",
      member_count: r.team_id ? d.members.filter((m) => m.team_id === r.team_id).length : 0,
    }));
}

// ── admin reads ──
async function adminList({ event = "", search = "", limit = 200, offset = 0 }) {
  if (hasPg()) {
    const conds = [];
    const params = [];
    if (event) { params.push(event); conds.push(`er.event_id = $${params.length}`); }
    if (search) {
      params.push(`%${search}%`);
      conds.push(`(s.name ILIKE $${params.length} OR s.register_number ILIKE $${params.length} OR s.email ILIKE $${params.length} OR t.name ILIKE $${params.length})`);
    }
    const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";
    params.push(limit, offset);
    const { rows } = await query(
      `SELECT er.id, er.event_id, e.name AS event_name, e.category, er.participation_type,
              er.team_id, t.name AS team_name, er.created_at,
              s.id AS student_id, s.name AS student_name, s.register_number, s.department, s.year, s.phone, s.email
       FROM event_registrations er
       JOIN events e ON e.id = er.event_id
       JOIN students s ON s.id = er.student_id
       LEFT JOIN teams t ON t.id = er.team_id
       ${where} ORDER BY er.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    const teamIds = [...new Set(rows.filter((r) => r.team_id).map((r) => r.team_id))];
    let membersByTeam = {};
    if (teamIds.length) {
      const m = await query("SELECT * FROM team_members WHERE team_id = ANY($1)", [teamIds]);
      membersByTeam = m.rows.reduce((acc, x) => ((acc[x.team_id] = acc[x.team_id] || []).push(x), acc), {});
    }
    const count = await query(
      `SELECT COUNT(*)::int AS c FROM event_registrations er
       JOIN students s ON s.id = er.student_id LEFT JOIN teams t ON t.id = er.team_id ${where}`,
      params.slice(0, params.length - 2)
    );
    return {
      rows: rows.map((r) => ({ ...r, members: r.team_id ? membersByTeam[r.team_id] || [] : [] })),
      total: count.rows[0]?.c ?? rows.length,
    };
  }
  const d = readStore();
  let regs = [...d.registrations].sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
  if (event) regs = regs.filter((r) => r.event_id === event);
  const evMap = Object.fromEntries(EVENTS_FALLBACK.map((e) => [e.id, e]));
  let rows = regs.map((r) => {
    const s = d.students.find((x) => x.id === r.student_id) || {};
    const t = r.team_id ? d.teams.find((x) => x.id === r.team_id) : null;
    return {
      id: r.id, event_id: r.event_id, event_name: (evMap[r.event_id] || {}).name || r.event_id,
      category: (evMap[r.event_id] || {}).category || "", participation_type: r.participation_type,
      team_id: r.team_id, team_name: t ? t.name : "",
      student_name: s.name, register_number: s.register_number, department: s.department,
      year: s.year, phone: s.phone, email: s.email, created_at: r.created_at,
      members: r.team_id ? d.members.filter((m) => m.team_id === r.team_id) : [],
    };
  });
  if (search) {
    const q = search.toLowerCase();
    rows = rows.filter((r) => [r.student_name, r.register_number, r.email, r.team_name].join(" ").toLowerCase().includes(q));
  }
  return { rows: rows.slice(offset, offset + limit), total: rows.length };
}

async function adminStats() {
  if (hasPg()) {
    const s = await query("SELECT COUNT(*)::int AS c FROM students");
    const t = await query("SELECT COUNT(*)::int AS c FROM teams");
    const r = await query("SELECT COUNT(*)::int AS c FROM event_registrations");
    const by = await query(
      `SELECT er.event_id AS event, e.name AS event_name, COUNT(*)::int AS count
       FROM event_registrations er JOIN events e ON e.id = er.event_id GROUP BY er.event_id, e.name ORDER BY count DESC`
    );
    return { totalStudents: s.rows[0].c, totalTeams: t.rows[0].c, totalRegistrations: r.rows[0].c, byEvent: by.rows };
  }
  const d = readStore();
  const by = {};
  d.registrations.forEach((r) => { by[r.event_id] = (by[r.event_id] || 0) + 1; });
  const evMap = Object.fromEntries(EVENTS_FALLBACK.map((e) => [e.id, e.name]));
  return {
    totalStudents: d.students.length,
    totalTeams: d.teams.length,
    totalRegistrations: d.registrations.length,
    byEvent: Object.entries(by).map(([event, count]) => ({ event, event_name: evMap[event] || event, count })),
  };
}

module.exports = {
  EVENTS_FALLBACK, getEvents, findOrCreateStudent, findStudentByRegNo, getStudentById,
  updateStudentContact, findConflict, registrationsForStudent,
  createTeam, createRegistration, deleteStudentRegistration, adminList, adminStats,
};
