const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
const config = require("./index");

// Supports PostgreSQL when DATABASE_URL is set,
// otherwise falls back to a local JSON file store (zero-config dev).
// Swap the fallback for Postgres in production; schema in /database/schema.sql.

const DATA_FILE = path.join(__dirname, "..", "data.registrations.json");

let pool = null;
if (config.databaseUrl) {
  pool = new Pool({ connectionString: config.databaseUrl, ssl: { rejectUnauthorized: false } });
  pool.on("error", (e) => console.error("[db] pool error", e.message));
}

function readLocal() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch {
    return [];
  }
}
function writeLocal(rows) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(rows, null, 2));
}

async function query(text, params) {
  if (!pool) throw new Error("NO_PG");
  return pool.query(text, params);
}

module.exports = { pool, query, readLocal, writeLocal, hasPg: () => !!pool };
