const app = require("./app");
const config = require("./config");

// Startup connectivity ping so DB problems show up in the terminal immediately.
async function pingDb() {
  if (!config.databaseUrl) return "local JSON fallback (set DATABASE_URL for Postgres)";
  try {
    const { pool } = require("./config/db");
    const client = await pool.connect();
    try {
      await client.query("SELECT 1");
    } finally {
      client.release();
    }
    return "PostgreSQL ✓";
  } catch (e) {
    return `PostgreSQL ✗ UNREACHABLE (${e.code || e.message}) — registrations will fail until the DB is reachable`;
  }
}

const server = app.listen(config.port, async () => {
  console.log(`✓ TALENTIA ’26 API running on http://localhost:${config.port}`);
  console.log(`  DB: ${await pingDb()}`);
});

// Clear message instead of a raw stack trace when the port is taken
// (e.g. a previous `npm run dev` is still running somewhere).
server.on("error", (err) => {
  if (err && err.code === "EADDRINUSE") {
    console.error(
      `✗ Port ${config.port} is already in use — another API instance is running.\n` +
      `  Stop the other one (Ctrl+C in its terminal) and save any server file to retry.`
    );
    process.exit(1);
  }
  throw err;
});
