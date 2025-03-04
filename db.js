const mysql = require('mysql2');


// const mysql = require("mysql2/promise"); // Gunakan versi promise
require("dotenv").config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});





// Buat koneksi pool
// const db = mysql.createPool({
//   host: "localhost",      // Ganti dengan host database Anda
//   user: "root",           // Ganti dengan username database Anda
//   password: "!DedeAnjar1986",           // Ganti dengan password database Anda
//   database: "mathematics", // Ganti dengan nama database Anda
// });




module.exports = db;


