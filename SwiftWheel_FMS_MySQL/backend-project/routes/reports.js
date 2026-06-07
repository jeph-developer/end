const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");
const requireAuth = require("../middleware/auth");

// GET /api/reports/daily-trips?date=YYYY-MM-DD
router.get("/daily-trips", requireAuth, async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split("T")[0];

    const [trips] = await pool.query(`
      SELECT
        t.id,
        v.vehicle_name  AS vehicleName,
        v.plate_number  AS plateNumber,
        v.fuel_type     AS fuelType,
        t.driver,
        t.trip_date     AS tripDate,
        t.destination,
        t.fuel_consumed AS fuelConsumed,
        t.trip_cost     AS tripCost
      FROM trips t
      JOIN vehicles v ON t.vehicle_id = v.id
      WHERE DATE(t.trip_date) = ?
      ORDER BY t.trip_date DESC
    `, [date]);

    const totalFuel = trips.reduce((s, t) => s + parseFloat(t.fuelConsumed), 0);
    const totalCost = trips.reduce((s, t) => s + parseFloat(t.tripCost), 0);

    res.json({
      date,
      trips,
      summary: { totalTrips: trips.length, totalFuelConsumed: totalFuel, totalCost },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/reports/fleet-status
router.get("/fleet-status", requireAuth, async (req, res) => {
  try {
    const [report] = await pool.query(`
      SELECT
        v.vehicle_name    AS vehicleName,
        v.plate_number    AS plateNumber,
        v.model,
        v.fuel_type       AS fuelType,
        COALESCE(SUM(t.fuel_consumed), 0) AS totalFuelConsumed,
        COALESCE(
          (SELECT m2.vehicle_status
           FROM maintenance m2
           WHERE m2.vehicle_id = v.id
           ORDER BY m2.maintenance_date DESC
           LIMIT 1),
          'No Record'
        ) AS maintenanceStatus
      FROM vehicles v
      LEFT JOIN trips t ON t.vehicle_id = v.id
      GROUP BY v.id
      ORDER BY v.vehicle_name
    `);

    const data = report.map((r) => ({
      ...r,
      vehicleAvailability:
        r.maintenanceStatus === "Available"         ? "Available" :
        r.maintenanceStatus === "Under Maintenance" ? "Unavailable" :
        r.maintenanceStatus === "Out of Service"    ? "Out of Service" : "Available",
    }));

    res.json({ report: data, generatedAt: new Date() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
