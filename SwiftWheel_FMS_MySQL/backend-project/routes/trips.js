const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");
const requireAuth = require("../middleware/auth");

// GET /api/trips
router.get("/", requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        t.id,
        t.vehicle_id      AS vehicleId,
        v.vehicle_name    AS vehicleName,
        v.plate_number    AS plateNumber,
        v.fuel_type       AS fuelType,
        t.driver,
        t.trip_date       AS tripDate,
        t.destination,
        t.fuel_consumed   AS fuelConsumed,
        t.trip_cost       AS tripCost,
        t.created_at      AS createdAt
      FROM trips t
      JOIN vehicles v ON t.vehicle_id = v.id
      ORDER BY t.trip_date DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/trips  — INSERT only per spec
router.post("/", requireAuth, async (req, res) => {
  try {
    const { vehicleId, driver, tripDate, destination, fuelConsumed, tripCost } = req.body;
    if (!vehicleId || !driver || !tripDate || !destination || fuelConsumed == null || tripCost == null)
      return res.status(400).json({ message: "All fields are required" });

    const [result] = await pool.query(
      "INSERT INTO trips (vehicle_id, driver, trip_date, destination, fuel_consumed, trip_cost) VALUES (?, ?, ?, ?, ?, ?)",
      [vehicleId, driver, tripDate, destination, fuelConsumed, tripCost]
    );
    const [rows] = await pool.query(`
      SELECT t.id, t.vehicle_id AS vehicleId, v.vehicle_name AS vehicleName,
             v.plate_number AS plateNumber, t.driver,
             t.trip_date AS tripDate, t.destination,
             t.fuel_consumed AS fuelConsumed, t.trip_cost AS tripCost
      FROM trips t JOIN vehicles v ON t.vehicle_id = v.id
      WHERE t.id = ?
    `, [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
