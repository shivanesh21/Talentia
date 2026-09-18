const config = require("../config");
const { safeEqual, issueSession, revokeToken } = require("../middleware/admin");
const { issueStudentSession, revokeStudentSession } = require("../middleware/student");
const Store = require("../models/store");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d][\d\s-]{6,15}$/;
const VALID_EVENTS = new Set(Store.EVENTS_FALLBACK.map((e) => e.id));

function vStudent(s) {
  const e = {};
  if (!s || (s.name || "").trim().length < 2) e.name = "Enter your full name.";
  if (!s || !String(s.registerNumber || "").trim()) e.registerNumber = "Register number is required.";
  if (!s || !String(s.department || "").trim()) e.department = "Department is required.";
  if (!s || !PHONE_RE.test(String(s.phone || "").trim())) e.phone = "Enter a valid phone number.";
  if (!s || !EMAIL_RE.test(String(s.email || "").trim())) e.email = "Enter a valid email address.";
  return e;
}

// Per-event entries: [{ eventId, participationType, teamName, members }]
// Each event is applied for individually or with its own team (size 1–3).
function normalizeEntries(body) {
  if (Array.isArray(body.entries)) {
    return body.entries.map((en) => ({
      eventId: String(en.eventId || ""),
      participationType: en.participationType || "individual",
      teamName: en.teamName || "",
      members: Array.isArray(en.members) ? en.members : [],
    }));
  }
  // legacy shape: one type/team for all eventIds
  const { participationType = "individual", teamName = "", members = [], eventIds = [] } = body || {};
  return [...new Set((eventIds || []).map(String))].filter(Boolean).map((eventId) => ({
    eventId, participationType, teamName, members: Array.isArray(members) ? members : [],
  }));
}

function validateEntries(entries, leaderRegNo) {
  const errors = {};
  if (!entries.length) {
    errors.eventIds = "Select at least one event.";
    return { errors, norm: [] };
  }
  const seenEvents = new Set();
  const norm = [];
  entries.forEach((en, i) => {
    if (!VALID_EVENTS.has(en.eventId)) {
      errors.eventIds = `Unknown event selected: ${en.eventId}`;
      return;
    }
    if (seenEvents.has(en.eventId)) {
      errors.eventIds = `Duplicate entry for ${en.eventId}.`;
      return;
    }
    seenEvents.add(en.eventId);
    if (!["individual", "team"].includes(en.participationType)) {
      errors[`team:${en.eventId}:mode`] = "Choose individual or team.";
      return;
    }
    const memList = en.members;
    if (en.participationType === "team") {
      if (memList.length > 2) errors[`team:${en.eventId}:members`] = "Team size is maximum 3 (you + up to 2 members).";
      const seen = new Set([String(leaderRegNo || "").trim().toUpperCase()]);
      memList.forEach((m, j) => {
        if (!m || String(m.name || "").trim().length < 2) errors[`team:${en.eventId}:m${j}name`] = "Member name is required.";
        const rn = String(m?.registerNumber || "").trim().toUpperCase();
        if (!rn) errors[`team:${en.eventId}:m${j}registerNumber`] = "Member register number is required.";
        else if (seen.has(rn)) errors[`team:${en.eventId}:m${j}registerNumber`] = "Duplicate register number in team.";
        else seen.add(rn);
      });
    }
    norm.push({ eventId: en.eventId, participationType: en.participationType, teamName: en.teamName, memList });
  });
  return { errors, norm };
}

// Shared core: student row already resolved → validate, dedupe, write.
async function doEventRegistration(stu, body) {
  const entries = normalizeEntries(body);
  const { errors, norm } = validateEntries(entries, stu.register_number);
  if (Object.keys(errors).length) {
    const err = new Error("Please fix the highlighted fields.");
    err.status = 400;
    err.errors = errors;
    throw err;
  }
  const leaderReg = String(stu.register_number).trim().toUpperCase();
  // All-or-nothing duplicate check across every entry.
  const conflicts = [];
  for (const en of norm) {
    const regNos = en.participationType === "team"
      ? [leaderReg, ...en.memList.map((m) => String(m.registerNumber).trim().toUpperCase())]
      : [leaderReg];
    const hit = await Store.findConflict(en.eventId, regNos);
    if (hit) conflicts.push({ event: en.eventId, registerNumber: hit });
  }
  if (conflicts.length) {
    const err = new Error(
      `Already registered: ${conflicts.map((c) => `${c.registerNumber} in ${c.event}`).join("; ")}. One registration per student/team per event.`
    );
    err.status = 409;
    err.conflicts = conflicts;
    throw err;
  }
  const done = [];
  for (const en of norm) {
    let team = null;
    let teamMembers = [];
    if (en.participationType === "team") {
      const created = await Store.createTeam(en.teamName, stu.id, en.memList);
      team = created.team;
      teamMembers = created.members;
    }
    const reg = await Store.createRegistration(en.eventId, stu.id, team ? team.id : null, en.participationType);
    done.push({ eventId: en.eventId, participationType: en.participationType, team, teamMembers, id: reg.id });
  }
  return {
    student: stu,
    entries: done,
    events: done.map((d) => d.eventId),
    count: done.length,
  };
}

// POST /api/register — public multi-event (+optional team) registration
async function registerStudent(req, res, next) {
  try {
    const { student } = req.body || {};
    const errors = vStudent(student);
    if (Object.keys(errors).length) {
      return res.status(400).json({ ok: false, message: "Please fix the highlighted fields.", errors });
    }
    const stu = await Store.findOrCreateStudent(student);
    try {
      const registration = await doEventRegistration(stu, req.body || {});
      res.status(201).json({
        ok: true,
        message: `Registration confirmed for ${registration.events.length} event${registration.events.length > 1 ? "s" : ""}. Welcome to TALENTIA ’26.`,
        registration,
      });
    } catch (e) {
      if (e.status) return res.status(e.status).json({ ok: false, message: e.message, errors: e.errors, conflicts: e.conflicts });
      throw e;
    }
  } catch (e) {
    if (e.isDuplicate) {
      return res.status(409).json({ ok: false, message: "Duplicate registration: this student/team is already registered for that event." });
    }
    next(e);
  }
}

// ── Student self-service (token) ──

// POST /api/student/profile — first-time profile creation + auto-login
async function studentCreateProfile(req, res, next) {
  try {
    const student = req.body || {};
    const errors = vStudent(student);
    if (Object.keys(errors).length) {
      return res.status(400).json({ ok: false, message: "Please fix the highlighted fields.", errors });
    }
    const existing = await Store.findStudentByRegNo(student.registerNumber);
    if (existing) {
      return res.status(409).json({
        ok: false,
        message: "This register number already has a profile. Please log in instead.",
      });
    }
    const stu = await Store.findOrCreateStudent(student);
    res.status(201).json({ ok: true, token: issueStudentSession(stu.id), student: stu });
  } catch (e) { next(e); }
}

// POST /api/student/login — { registerNumber, phone }
async function studentLogin(req, res) {
  const { registerNumber = "", phone = "" } = req.body || {};
  const stu = await Store.findStudentByRegNo(registerNumber);
  if (stu && safeEqual(String(stu.phone || "").trim(), String(phone || "").trim())) {
    return res.json({ ok: true, token: issueStudentSession(stu.id), student: stu });
  }
  await new Promise((r) => setTimeout(r, 500));
  return res.status(401).json({
    ok: false,
    message: "No matching profile found. Check your register number and phone, or create a new profile.",
  });
}

// POST /api/student/logout
async function studentLogout(req, res) {
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) revokeStudentSession(header.slice(7));
  res.json({ ok: true });
}

// GET /api/student/me — profile + already-joined events
async function studentMe(req, res, next) {
  try {
    const stu = await Store.getStudentById(req.studentId);
    if (!stu) return res.status(401).json({ ok: false, message: "Profile not found. Please log in again." });
    const joined = await Store.registrationsForStudent(stu);
    res.json({ ok: true, student: stu, joined });
  } catch (e) { next(e); }
}

// PUT /api/student/me — update contact details (dept/year/phone/email)
async function studentUpdateMe(req, res, next) {
  try {
    const { department = "", year = "First Year", phone = "", email = "" } = req.body || {};
    const errors = {};
    if (!String(department).trim()) errors.department = "Department is required.";
    if (!PHONE_RE.test(String(phone).trim())) errors.phone = "Enter a valid phone number.";
    if (!EMAIL_RE.test(String(email).trim())) errors.email = "Enter a valid email address.";
    if (Object.keys(errors).length) {
      return res.status(400).json({ ok: false, message: "Please fix the highlighted fields.", errors });
    }
    const stu = await Store.updateStudentContact(req.studentId, { department, year, phone, email });
    res.json({ ok: true, student: stu });
  } catch (e) { next(e); }
}

// POST /api/student/register — event/team entry for the logged-in student
async function studentRegisterEvents(req, res, next) {
  try {
    const stu = await Store.getStudentById(req.studentId);
    if (!stu) return res.status(401).json({ ok: false, message: "Profile not found. Please log in again." });
    try {
      const registration = await doEventRegistration(stu, req.body || {});
      res.status(201).json({
        ok: true,
        message: `Registration confirmed for ${registration.events.length} event${registration.events.length > 1 ? "s" : ""}.`,
        registration,
      });
    } catch (e) {
      if (e.status) return res.status(e.status).json({ ok: false, message: e.message, errors: e.errors, conflicts: e.conflicts });
      throw e;
    }
  } catch (e) {
    if (e.isDuplicate) {
      return res.status(409).json({ ok: false, message: "Duplicate registration: already registered for that event." });
    }
    next(e);
  }
}

// DELETE /api/student/registrations/:eventId — student removes their own entry.
// Only the leader (owner) can cancel; team rows + orphan team are cleaned up.
// To switch solo↔team, remove the entry and re-add it with the other type.
async function studentCancelRegistration(req, res, next) {
  try {
    const { eventId } = req.params;
    const out = await Store.deleteStudentRegistration(req.studentId, eventId);
    if (!out.deleted) {
      return res.status(404).json({
        ok: false,
        message: "Entry not found. Only the team leader can cancel an entry — members should ask their leader.",
      });
    }
    res.json({ ok: true, message: "Entry removed. You can re-join this event any time before the deadline." });
  } catch (e) { next(e); }
}

// POST /api/admin/login
async function adminLogin(req, res) {
  const { username = "", password = "" } = req.body || {};
  if (safeEqual(username.trim(), config.adminUsername) && safeEqual(password, config.adminPassword)) {
    return res.json({ ok: true, token: issueSession(), username: config.adminUsername });
  }
  // small delay to slow brute force
  await new Promise((r) => setTimeout(r, 600));
  return res.status(401).json({ ok: false, message: "Invalid admin credentials." });
}

// POST /api/admin/logout
async function adminLogout(req, res) {
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) revokeToken(header.slice(7));
  res.json({ ok: true });
}

async function adminStats(req, res, next) {
  try {
    res.json({ ok: true, ...(await Store.adminStats()) });
  } catch (e) { next(e); }
}

async function adminRegistrations(req, res, next) {
  try {
    const { event = "", search = "", limit = "200", offset = "0" } = req.query;
    const data = await Store.adminList({
      event: String(event).slice(0, 50),
      search: String(search).slice(0, 100),
      limit: Math.min(parseInt(limit, 10) || 200, 1000),
      offset: Math.max(parseInt(offset, 10) || 0, 0),
    });
    res.json({ ok: true, ...data });
  } catch (e) { next(e); }
}

async function adminExport(req, res, next) {
  try {
    const { rows } = await Store.adminList({ limit: 5000, offset: 0 });
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const cols = ["registration_id", "event_id", "event_name", "category", "type", "team_name",
      "leader_name", "leader_regno", "leader_dept", "leader_phone", "leader_email", "members", "created_at"];
    const lines = [cols.join(",")];
    for (const r of rows) {
      const mem = (r.members || []).map((m) => `${m.name} (${m.register_number})`).join("; ");
      lines.push([r.id, r.event_id, r.event_name, r.category, r.participation_type, r.team_name,
        r.student_name, r.register_number, r.department, r.phone, r.email, mem, r.created_at].map(esc).join(","));
    }
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=talentia-registrations.csv");
    res.send(lines.join("\n"));
  } catch (e) { next(e); }
}

async function publicEvents(req, res, next) {
  try {
    res.json({ ok: true, events: await Store.getEvents() });
  } catch (e) { next(e); }
}

module.exports = {
  registerStudent,
  studentCreateProfile, studentLogin, studentLogout, studentMe, studentUpdateMe, studentRegisterEvents,
  studentCancelRegistration,
  adminLogin, adminLogout, adminStats, adminRegistrations, adminExport, publicEvents,
};
