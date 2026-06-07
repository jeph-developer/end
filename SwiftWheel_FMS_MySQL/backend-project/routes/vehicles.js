const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");
const requireAuth = require("../middleware/auth");

// GET /api/vehicles
router.get("/", requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        id,
        vehicle_name  AS vehicleName,
        plate_number  AS plateNumber,
        model,
        fuel_type     AS fuelType,
        capacity,
        created_at    AS createdAt
      FROM vehicles
      ORDER BY created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/vehicles  — INSERT only per spec
router.post("/", requireAuth, async (req, res) => {
  try {
    const { vehicleName, plateNumber, model, fuelType, capacity } = req.body;
    if (!vehicleName || !plateNumber || !model || !fuelType || !capacity)
      return res.status(400).json({ message: "All fields are required" });

    const [result] = await pool.query(
      "INSERT INTO vehicles (vehicle_name, plate_number, model, fuel_type, capacity) VALUES (?, ?, ?, ?, ?)",
      [vehicleName, plateNumber, model, fuelType, capacity]
    );
    const [rows] = await pool.query(`
      SELECT id, vehicle_name AS vehicleName, plate_number AS plateNumber,
             model, fuel_type AS fuelType, capacity, created_at AS createdAt
      FROM vehicles WHERE id = ?
    `, [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res.status(400).json({ message: "Plate number already exists" });
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
