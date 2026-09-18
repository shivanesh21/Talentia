// Verifies a test registration landed in Supabase, then removes it.
// Usage: node verify-supabase.js
require("dotenv").config();
const { Client } = require("pg");

(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  const found = await c.query("SELECT id, name, selected_event FROM registrations WHERE register_number = 'TEST999'");
  console.log("TEST999 rows in Supabase: " + found.rowCount);
  found.rows.forEach((r) => console.log(" - " + r.id + " | " + r.name + " | " + r.selected_event));
  const del = await c.query("DELETE FROM registrations WHERE register_number = 'TEST999'");
  console.log("deleted: " + del.rowCount);
  const t = await c.query("SELECT COUNT(*)::int AS c FROM registrations");
  console.log("total rows now: " + t.rows[0].c);
  await c.end();
})().catch((e) => {
  console.error("VERIFY FAILED: " + e.message);
  process.exit(1);
});
