require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const { connectDB, pool } = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

// ── Database ──────────────────────────────────────────────
connectDB();

// ── Session Store — reuse the existing pool ───────────────
const sessionStore = new MySQLStore({}, pool);

// ── Core Middleware ───────────────────────────────────────
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Sessions ──────────────────────────────────────────────
app.use(
  session({
    secret: process.env.SESSION_SECRET || "swiftwheel_secret_2026",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: { maxAge: 1000 * 60 * 60 * 8, httpOnly: true, secure: false },
  })
);

// ── Routes ────────────────────────────────────────────────
app.use("/api/auth",        require("./routes/auth"));
app.use("/api/vehicles",    require("./routes/vehicles"));
app.use("/api/trips",       require("./routes/trips"));
app.use("/api/maintenance", require("./routes/maintenance"));
app.use("/api/reports",     require("./routes/reports"));

// ── Health check ──────────────────────────────────────────
app.get("/", (req, res) => res.json({ message: "SwiftWheel FMS API (MySQL) is running" }));

// ── Global error handler ──────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error", error: err.message });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
