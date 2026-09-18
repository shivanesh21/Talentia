// Applies database/schema.sql to the Postgres in DATABASE_URL.
// Usage:  set DATABASE_URL first (see server/.env.example), then:
//   npm --prefix server run db:setup
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("✗ DATABASE_URL is not set. Copy server/.env.example → server/.env and fill it in.");
    process.exit(1);
  }
  const sql = fs.readFileSync(path.join(__dirname, "..", "database", "schema.sql"), "utf8");
  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await client.connect();
  await client.query(sql);
  await client.end();
  console.log("✓ Schema applied successfully.");
}

main().catch((e) => {
  console.error("✗ Schema setup failed:", e.message);
  process.exit(1);
});
