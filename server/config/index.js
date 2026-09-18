require("dotenv").config();

module.exports = {
  port: process.env.PORT || 5000,
  databaseUrl: process.env.DATABASE_URL || "",
  adminKey: process.env.ADMIN_KEY || "talentia-admin-dev-key",
  adminUsername: process.env.ADMIN_USERNAME || "admin",
  // CHANGE THIS in server/.env — default is for first-run only.
  adminPassword: process.env.ADMIN_PASSWORD || "Talentia@2026",
  corsOrigin: process.env.CORS_ORIGIN || "*",
};
