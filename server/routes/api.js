const express = require("express");
const { createRegistration, listRegistrations, registrationStats, createQuery } = require("../controllers/registrations");
const {
  registerStudent, adminLogin, adminLogout, adminStats,
  adminRegistrations, adminExport, publicEvents,
  studentCreateProfile, studentLogin, studentLogout, studentMe, studentUpdateMe, studentRegisterEvents,
  studentCancelRegistration,
} = require("../controllers/portal");
const { requireAdmin } = require("../middleware/admin");
const { requireStudent } = require("../middleware/student");

const router = express.Router();

router.post("/registrations", createRegistration);
router.post("/queries", createQuery);

// ── V2: student portal + secure admin ──
router.get("/events", publicEvents);
router.post("/register", registerStudent);

// Student self-service (profile → login → details/events page)
router.post("/student/profile", studentCreateProfile);
router.post("/student/login", studentLogin);
router.post("/student/logout", studentLogout);
router.get("/student/me", requireStudent, studentMe);
router.put("/student/me", requireStudent, studentUpdateMe);
router.post("/student/register", requireStudent, studentRegisterEvents);
router.delete("/student/registrations/:eventId", requireStudent, studentCancelRegistration);
router.post("/admin/login", adminLogin);
router.post("/admin/logout", adminLogout);
router.get("/admin/stats", requireAdmin, adminStats);
router.get("/admin/registrations", requireAdmin, adminRegistrations);
router.get("/admin/export.csv", requireAdmin, adminExport);

// ── Legacy admin (protected by x-admin-key) ──
router.get("/registrations", requireAdmin, listRegistrations);
router.get("/registrations/stats", requireAdmin, registrationStats);

router.get("/health", (req, res) => res.json({ ok: true, service: "talentia-26-api" }));

module.exports = router;
