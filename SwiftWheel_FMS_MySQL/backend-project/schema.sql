-- SwiftWheel Fleet Management System - MySQL Schema
-- Run this file once to set up the database

CREATE DATABASE IF NOT EXISTS VRS;
USE VRS;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vehicle table
CREATE TABLE IF NOT EXISTS vehicles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vehicle_name VARCHAR(150) NOT NULL,
  plate_number VARCHAR(50) NOT NULL UNIQUE,
  model VARCHAR(100) NOT NULL,
  fuel_type ENUM('Petrol','Diesel','Electric','Hybrid') NOT NULL,
  capacity INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trip table
CREATE TABLE IF NOT EXISTS trips (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vehicle_id INT NOT NULL,
  driver VARCHAR(150) NOT NULL,
  trip_date DATE NOT NULL,
  destination VARCHAR(200) NOT NULL,
  fuel_consumed DECIMAL(10,2) NOT NULL,
  trip_cost DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- Maintenance table
CREATE TABLE IF NOT EXISTS maintenance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vehicle_id INT NOT NULL,
  service_type VARCHAR(150) NOT NULL,
  maintenance_cost DECIMAL(10,2) NOT NULL,
  maintenance_date DATE NOT NULL,
  vehicle_status ENUM('Available','Under Maintenance','Out of Service') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);
