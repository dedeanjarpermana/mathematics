// const mysql = require('mysql2');
const dotenv = require('dotenv');
// const mysql = require("mysql2/promise"); // Gunakan versi promise
dotenv.config();


const mysql = require("mysql2/promise"); // Gunakan versi promise

// Buat koneksi pool
// const db = mysql.createPool({
//   host: "localhost",      // Ganti dengan host database Anda
//   user: "root",           // Ganti dengan username database Anda
//   password: "!DedeAnjar1986",           // Ganti dengan password database Anda
//   database: "mathematics", // Ganti dengan nama database Anda
// });



const db = mysql.createPool({
  host: "sql311.infinityfree.com",      // Ganti dengan host database Anda
  user: "if0_38426739",           // Ganti dengan username database Anda
  password: "DedeAnjar1986",           // Ganti dengan password database Anda
  database: "if0_38426739_mathematics", // Ganti dengan nama database Anda
});
module.exports = db;


