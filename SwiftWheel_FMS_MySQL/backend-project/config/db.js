const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || "localhost",
  port:     parseInt(process.env.DB_PORT || "3306", 10),
  user:     process.env.DB_USER     || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME     || "swiftwheel_fms",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const connectDB = async () => {
  try {
    const conn = await pool.getConnection();
    console.log("MySQL connected successfully");
    conn.release();
  } catch (err) {
    console.error("MySQL connection error:", err.message);
    process.exit(1);
  }
};

module.exports = { pool, connectDB };
