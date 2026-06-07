-- =============================================================
--  SwiftWheel Fleet Management System — MySQL Queries Reference
--  Database: swiftwheel_fms
-- =============================================================


-- =============================================================
--  SECTION 1: DATABASE & TABLE CREATION (run once to set up)
-- =============================================================

CREATE DATABASE IF NOT EXISTS swiftwheel_fms;
USE swiftwheel_fms;

-- Users table (session-based auth)
CREATE TABLE IF NOT EXISTS users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  username   VARCHAR(100) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,           -- bcrypt hashed
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vehicle table
CREATE TABLE IF NOT EXISTS vehicles (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  vehicle_name VARCHAR(150) NOT NULL,
  plate_number VARCHAR(50)  NOT NULL UNIQUE,
  model        VARCHAR(100) NOT NULL,
  fuel_type    ENUM('Petrol','Diesel','Electric','Hybrid') NOT NULL,
  capacity     INT NOT NULL,                  -- carrying capacity in tons
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trip table
CREATE TABLE IF NOT EXISTS trips (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  vehicle_id    INT NOT NULL,
  driver        VARCHAR(150) NOT NULL,
  trip_date     DATE NOT NULL,
  destination   VARCHAR(200) NOT NULL,
  fuel_consumed DECIMAL(10,2) NOT NULL,       -- litres
  trip_cost     DECIMAL(10,2) NOT NULL,       -- RWF
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- Maintenance table
CREATE TABLE IF NOT EXISTS maintenance (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  vehicle_id       INT NOT NULL,
  service_type     VARCHAR(150) NOT NULL,
  maintenance_cost DECIMAL(10,2) NOT NULL,    -- RWF
  maintenance_date DATE NOT NULL,
  vehicle_status   ENUM('Available','Under Maintenance','Out of Service') NOT NULL,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);


-- =============================================================
--  SECTION 2: AUTHENTICATION QUERIES
-- =============================================================

-- Register: check if username already exists
SELECT id FROM users WHERE username = 'jean_claude';

-- Register: insert new user (password is hashed by bcryptjs in Node.js)
INSERT INTO users (username, password)
VALUES ('jean_claude', '$2a$12$hashedPasswordHere');

-- Login: fetch user record by username
SELECT * FROM users WHERE username = 'jean_claude';


-- =============================================================
--  SECTION 3: VEHICLE QUERIES
-- =============================================================

-- List all vehicles (newest first)
SELECT
  id,
  vehicle_name  AS vehicleName,
  plate_number  AS plateNumber,
  model,
  fuel_type     AS fuelType,
  capacity,
  created_at    AS createdAt
FROM vehicles
ORDER BY created_at DESC;

-- Insert a new vehicle
INSERT INTO vehicles (vehicle_name, plate_number, model, fuel_type, capacity)
VALUES ('Toyota Land Cruiser', 'RAB 001 A', '2022', 'Diesel', 5);

-- Fetch a newly inserted vehicle by its ID
SELECT
  id,
  vehicle_name  AS vehicleName,
  plate_number  AS plateNumber,
  model,
  fuel_type     AS fuelType,
  capacity,
  created_at    AS createdAt
FROM vehicles
WHERE id = 1;


-- =============================================================
--  SECTION 4: TRIP QUERIES
-- =============================================================

-- List all trips with vehicle info (newest trip first)
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
ORDER BY t.trip_date DESC;

-- Insert a new trip record
INSERT INTO trips (vehicle_id, driver, trip_date, destination, fuel_consumed, trip_cost)
VALUES (1, 'Jean Claude Hakizimana', '2026-06-04', 'Musanze District', 45.50, 25000.00);

-- Fetch a newly inserted trip with vehicle info
SELECT
  t.id,
  t.vehicle_id      AS vehicleId,
  v.vehicle_name    AS vehicleName,
  v.plate_number    AS plateNumber,
  t.driver,
  t.trip_date       AS tripDate,
  t.destination,
  t.fuel_consumed   AS fuelConsumed,
  t.trip_cost       AS tripCost
FROM trips t
JOIN vehicles v ON t.vehicle_id = v.id
WHERE t.id = 1;


-- =============================================================
--  SECTION 5: MAINTENANCE QUERIES  (full CRUD)
-- =============================================================

-- Reusable SELECT pattern for maintenance records
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
JOIN vehicles v ON m.vehicle_id = v.id;

-- READ: List all maintenance records (newest first)
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
ORDER BY m.maintenance_date DESC;

-- READ: Fetch a single maintenance record by ID
SELECT
  m.id,
  m.vehicle_id          AS vehicleId,
  v.vehicle_name        AS vehicleName,
  v.plate_number        AS plateNumber,
  v.model,
  m.service_type        AS serviceType,
  m.maintenance_cost    AS maintenanceCost,
  m.maintenance_date    AS maintenanceDate,
  m.vehicle_status      AS vehicleStatus
FROM maintenance m
JOIN vehicles v ON m.vehicle_id = v.id
WHERE m.id = 1;

-- INSERT: Add a new maintenance record
INSERT INTO maintenance (vehicle_id, service_type, maintenance_cost, maintenance_date, vehicle_status)
VALUES (1, 'Oil Change', 50000.00, '2026-06-04', 'Under Maintenance');

-- UPDATE: Edit an existing maintenance record
UPDATE maintenance
SET
  vehicle_id       = 1,
  service_type     = 'Tire Replacement',
  maintenance_cost = 75000.00,
  maintenance_date = '2026-06-04',
  vehicle_status   = 'Available'
WHERE id = 1;

-- DELETE: Remove a maintenance record
DELETE FROM maintenance WHERE id = 1;


-- =============================================================
--  SECTION 6: REPORT QUERIES
-- =============================================================

-- REPORT 1: Daily Trip Report — filter trips by a specific date
-- Replace '2026-06-04' with the desired date
SELECT
  t.id,
  v.vehicle_name    AS vehicleName,
  v.plate_number    AS plateNumber,
  v.fuel_type       AS fuelType,
  t.driver,
  t.trip_date       AS tripDate,
  t.destination,
  t.fuel_consumed   AS fuelConsumed,
  t.trip_cost       AS tripCost
FROM trips t
JOIN vehicles v ON t.vehicle_id = v.id
WHERE DATE(t.trip_date) = '2026-06-04'
ORDER BY t.trip_date DESC;

-- Summary totals for the daily trip report
SELECT
  COUNT(*)                   AS totalTrips,
  COALESCE(SUM(fuel_consumed), 0) AS totalFuelConsumed,
  COALESCE(SUM(trip_cost), 0)     AS totalCost
FROM trips
WHERE DATE(trip_date) = '2026-06-04';


-- REPORT 2: Daily Fleet Status Report
-- Columns: Vehicle Name | Fuel Consumed | Maintenance Status | Vehicle Availability
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
ORDER BY v.vehicle_name;


-- =============================================================
--  SECTION 7: SAMPLE DATA (optional — for testing)
-- =============================================================

-- Sample vehicles
INSERT INTO vehicles (vehicle_name, plate_number, model, fuel_type, capacity) VALUES
('Toyota Land Cruiser',  'RAB 001 A', '2022', 'Diesel',  5),
('Isuzu NPR',            'RAB 002 B', '2021', 'Diesel',  3),
('Toyota Hiace',         'RAB 003 C', '2023', 'Petrol',  2),
('Mitsubishi Fuso',      'RAB 004 D', '2020', 'Diesel', 10);

-- Sample trips
INSERT INTO trips (vehicle_id, driver, trip_date, destination, fuel_consumed, trip_cost) VALUES
(1, 'Jean Claude Hakizimana', '2026-06-04', 'Musanze District',   45.50, 25000.00),
(2, 'Alice Uwimana',          '2026-06-04', 'Huye District',      60.00, 35000.00),
(3, 'Bob Niyonzima',          '2026-06-03', 'Rubavu District',    30.00, 18000.00),
(1, 'Jean Claude Hakizimana', '2026-06-03', 'Nyagatare District', 80.00, 48000.00);

-- Sample maintenance records
INSERT INTO maintenance (vehicle_id, service_type, maintenance_cost, maintenance_date, vehicle_status) VALUES
(1, 'Oil Change',        50000.00, '2026-06-01', 'Available'),
(2, 'Tire Replacement',  75000.00, '2026-06-02', 'Under Maintenance'),
(3, 'Brake Inspection',  30000.00, '2026-06-03', 'Available'),
(4, 'Engine Overhaul',  200000.00, '2026-06-04', 'Out of Service');


-- =============================================================
--  SECTION 8: USEFUL UTILITY QUERIES
-- =============================================================

-- View all vehicles with their latest maintenance status
SELECT
  v.vehicle_name    AS vehicleName,
  v.plate_number    AS plateNumber,
  v.fuel_type       AS fuelType,
  COALESCE(
    (SELECT vehicle_status FROM maintenance
     WHERE vehicle_id = v.id ORDER BY maintenance_date DESC LIMIT 1),
    'No Maintenance Record'
  ) AS currentStatus
FROM vehicles v
ORDER BY v.vehicle_name;

-- Count total trips per vehicle
SELECT
  v.vehicle_name  AS vehicleName,
  v.plate_number  AS plateNumber,
  COUNT(t.id)     AS totalTrips,
  COALESCE(SUM(t.fuel_consumed), 0) AS totalFuelConsumed,
  COALESCE(SUM(t.trip_cost), 0)     AS totalCost
FROM vehicles v
LEFT JOIN trips t ON t.vehicle_id = v.id
GROUP BY v.id
ORDER BY totalTrips DESC;

-- Find vehicles currently under maintenance or out of service
SELECT
  v.vehicle_name  AS vehicleName,
  v.plate_number  AS plateNumber,
  m.service_type  AS serviceType,
  m.vehicle_status AS vehicleStatus,
  m.maintenance_date AS maintenanceDate
FROM maintenance m
JOIN vehicles v ON m.vehicle_id = v.id
WHERE m.vehicle_status IN ('Under Maintenance', 'Out of Service')
  AND m.maintenance_date = (
    SELECT MAX(maintenance_date) FROM maintenance m2
    WHERE m2.vehicle_id = m.vehicle_id
  );

-- Total maintenance cost per vehicle
SELECT
  v.vehicle_name  AS vehicleName,
  v.plate_number  AS plateNumber,
  COUNT(m.id)     AS maintenanceCount,
  COALESCE(SUM(m.maintenance_cost), 0) AS totalMaintenanceCost
FROM vehicles v
LEFT JOIN maintenance m ON m.vehicle_id = v.id
GROUP BY v.id
ORDER BY totalMaintenanceCost DESC;
