const crypto = require("crypto");

// Student sessions (in-memory, 7-day expiry). Separate from admin sessions.
const sessions = new Map(); // token -> { studentId, exp }
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

function issueStudentSession(studentId) {
  const token = "st_" + crypto.randomBytes(32).toString("hex");
  sessions.set(token, { studentId, exp: Date.now() + TTL_MS });
  return token;
}

function getStudentId(token) {
  if (!token) return null;
  const s = sessions.get(token);
  if (!s) return null;
  if (s.exp < Date.now()) {
    sessions.delete(token);
    return null;
  }
  return s.studentId;
}

function revokeStudentSession(token) {
  sessions.delete(token);
}

function requireStudent(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  const studentId = getStudentId(token);
  if (!studentId) {
    return res.status(401).json({ ok: false, message: "Student session expired. Please log in again." });
  }
  req.studentId = studentId;
  req.studentToken = token;
  next();
}

module.exports = { issueStudentSession, getStudentId, revokeStudentSession, requireStudent };
