const crypto = require("crypto");
const config = require("../config");

// Token sessions for the admin dashboard (in-memory, 12h expiry).
// For multi-instance production, swap with Redis/JWT.
const sessions = new Map();
const TTL_MS = 12 * 60 * 60 * 1000;

function issueSession() {
  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, Date.now() + TTL_MS);
  return token;
}

function verifyToken(token) {
  if (!token) return false;
  const exp = sessions.get(token);
  if (!exp) return false;
  if (exp < Date.now()) {
    sessions.delete(token);
    return false;
  }
  return true;
}

function revokeToken(token) {
  sessions.delete(token);
}

// Accepts `Authorization: Bearer <token>` (dashboard login)
// or the legacy shared `x-admin-key` (scripts/exports).
function requireAdmin(req, res, next) {
  const header = req.headers.authorization || "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7) : null;
  const legacy = req.headers["x-admin-key"] || req.query.adminKey || req.query.token;
  if ((bearer && verifyToken(bearer)) || (legacy && legacy === config.adminKey)) {
    return next();
  }
  // also allow token via query for CSV download links
  if (legacy && verifyToken(legacy)) return next();
  return res.status(401).json({ ok: false, message: "Unauthorized. Please log in as admin." });
}

function safeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

module.exports = { requireAdmin, issueSession, verifyToken, revokeToken, safeEqual };
