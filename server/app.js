const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const config = require("./config");
const apiRoutes = require("./routes/api");

const app = express();
app.use(cors({ origin: config.corsOrigin === "*" ? "*" : config.corsOrigin.split(",") }));
app.use(express.json({ limit: "256kb" }));

app.use("/api", apiRoutes);

// CSV export for admins: GET /api/admin/export.csv?adminKey=...
app.get("/api/admin/export.csv", require("./middleware/admin").requireAdmin, async (req, res, next) => {
  try {
    const { list } = require("./models/registrations");
    const { rows } = await list({ limit: 5000, offset: 0 });
    const cols = ["id", "name", "registerNumber", "department", "year", "phone", "email", "selectedEvent", "team_members", "created_at"];
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=talentia-registrations.csv");
    res.send(csv);
  } catch (e) {
    next(e);
  }
});

// ── Single-server mode: serve the built website (client/dist) on the SAME
// port as the API, so only ONE process needs to run. No Vite proxy involved.
// Build it with: npm --prefix client run build
const DIST = path.join(__dirname, "..", "client", "dist");
if (fs.existsSync(path.join(DIST, "index.html"))) {
  app.use(express.static(DIST));
  // SPA fallback (everything that isn't /api serves the app)
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(DIST, "index.html"));
  });
  console.log("  Web: serving client/dist on the same port");
} else {
  console.log("  Web: client/dist not built — API-only mode (run: npm --prefix client run build)");
}

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("[api]", err.message);
  // Database connectivity failures get an actionable message instead of generic 500.
  const dbDown = ["ENOTFOUND", "ECONNREFUSED", "ETIMEDOUT", "EAI_AGAIN", "ENETUNREACH"].includes(err.code);
  res.status(500).json({
    ok: false,
    message: dbDown
      ? "Database unreachable from the server network. Check DATABASE_URL / network, then retry."
      : "Something went wrong. Please try again.",
  });
});

module.exports = app;
