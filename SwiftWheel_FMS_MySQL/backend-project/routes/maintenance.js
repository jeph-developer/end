const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");
const requireAuth = require("../middleware/auth");

const SELECT_MAINTENANCE = `
  SELECT
    m.id,
    m.vehicle_id          AS vehicleId,
    v.vehicle_name        AS vehicleName,
    v.plate_number        AS plateNumber,
    v.model,
    m.service_type        AS serviceType,
    m.maintenance_cost    AS maintenanceCost,
    m.maintenance_date    AS maintenanceDate,
    m.vehicle_status      AS vehicleStatus,
    m.created_at          AS createdAt
  FROM maintenance m
  JOIN vehicles v ON m.vehicle_id = v.id
`;

// GET /api/maintenance
router.get("/", requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(SELECT_MAINTENANCE + " ORDER BY m.maintenance_date DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/maintenance/:id
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(SELECT_MAINTENANCE + " WHERE m.id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: "Record not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/maintenance
router.post("/", requireAuth, async (req, res) => {
  try {
    const { vehicleId, serviceType, maintenanceCost, maintenanceDate, vehicleStatus } = req.body;
    if (!vehicleId || !serviceType || maintenanceCost == null || !maintenanceDate || !vehicleStatus)
      return res.status(400).json({ message: "All fields are required" });

    const [result] = await pool.query(
      "INSERT INTO maintenance (vehicle_id, service_type, maintenance_cost, maintenance_date, vehicle_status) VALUES (?, ?, ?, ?, ?)",
      [vehicleId, serviceType, maintenanceCost, maintenanceDate, vehicleStatus]
    );
    const [rows] = await pool.query(SELECT_MAINTENANCE + " WHERE m.id = ?", [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/maintenance/:id
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const { vehicleId, serviceType, maintenanceCost, maintenanceDate, vehicleStatus } = req.body;
    const [result] = await pool.query(
      "UPDATE maintenance SET vehicle_id=?, service_type=?, maintenance_cost=?, maintenance_date=?, vehicle_status=? WHERE id=?",
      [vehicleId, serviceType, maintenanceCost, maintenanceDate, vehicleStatus, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: "Record not found" });
    const [rows] = await pool.query(SELECT_MAINTENANCE + " WHERE m.id = ?", [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/maintenance/:id
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM maintenance WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Record not found" });
    res.json({ message: "Maintenance record deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
