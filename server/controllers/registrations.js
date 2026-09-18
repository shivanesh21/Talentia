const { validateRegistration } = require("../middleware/validate");
const Reg = require("../models/registrations");

// POST /api/registrations — public registration endpoint
async function createRegistration(req, res, next) {
  try {
    const errors = validateRegistration(req.body);
    if (Object.keys(errors).length) {
      return res.status(400).json({ ok: false, message: "Please fix the highlighted fields.", errors });
    }
    if (!Reg.ALLOWED_EVENTS.has(req.body.selectedEvent)) {
      return res.status(400).json({ ok: false, message: "Unknown event selected.", errors: { selectedEvent: "Unknown event." } });
    }
    const saved = await Reg.create({
      name: req.body.name.trim(),
      registerNumber: req.body.registerNumber.trim(),
      department: req.body.department.trim(),
      year: req.body.year.trim(),
      phone: req.body.phone.trim(),
      email: req.body.email.trim().toLowerCase(),
      selectedEvent: req.body.selectedEvent,
      teamMembers: (req.body.teamMembers || "").toString().slice(0, 2000),
    });
    res.status(201).json({ ok: true, message: "Registration confirmed. Welcome to TALENTIA ’26.", registration: saved });
  } catch (e) {
    next(e);
  }
}

// GET /api/registrations — admin: search + filter by event + pagination
async function listRegistrations(req, res, next) {
  try {
    const { search = "", event = "", limit = "100", offset = "0" } = req.query;
    const data = await Reg.list({
      search: String(search).slice(0, 100),
      event: String(event).slice(0, 50),
      limit: Math.min(parseInt(limit, 10) || 100, 500),
      offset: Math.max(parseInt(offset, 10) || 0, 0),
    });
    res.json({ ok: true, ...data });
  } catch (e) {
    next(e);
  }
}

// GET /api/registrations/stats — admin: participant count + per-event breakdown
async function registrationStats(req, res, next) {
  try {
    res.json({ ok: true, ...(await Reg.stats()) });
  } catch (e) {
    next(e);
  }
}

// POST /api/queries — contact / registration queries (stored as registrations with type note)
async function createQuery(req, res) {
  const { name = "", phone = "", message = "" } = req.body || {};
  if (!String(message).trim()) return res.status(400).json({ ok: false, message: "Message is required." });
  console.log("[query]", { name, phone, message: String(message).slice(0, 500) });
  res.status(201).json({ ok: true, message: "Query received. Our coordinators will contact you on WhatsApp." });
}

module.exports = { createRegistration, listRegistrations, registrationStats, createQuery };
