const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { pool } = require("../config/db");

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: "Username and password are required" });
    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    const [existing] = await pool.query("SELECT id FROM users WHERE username = ?", [username]);
    if (existing.length > 0)
      return res.status(400).json({ message: "Username already exists" });

    const hashed = await bcrypt.hash(password, 12);
    await pool.query("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashed]);
    res.status(201).json({ message: "Account created successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: "Username and password are required" });

    const [rows] = await pool.query("SELECT * FROM users WHERE username = ?", [username]);
    if (rows.length === 0)
      return res.status(401).json({ message: "Invalid username or password" });

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid username or password" });

    req.session.userId   = user.id;
    req.session.username = user.username;
    res.json({ message: "Login successful", username: user.username });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: "Logout failed" });
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out successfully" });
  });
});

// GET /api/auth/me — check active session
router.get("/me", (req, res) => {
  if (req.session && req.session.userId)
    return res.json({ loggedIn: true, username: req.session.username });
  res.json({ loggedIn: false });
});

module.exports = router;
