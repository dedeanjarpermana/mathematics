const mysql = require("mysql2");
// const bcrypt = require("bcryptjs");
// const bodyParser = require("body-parser");
// const validator = require("validator");
const express = require("express");
const db = require("./db"); // Impor file koneksi database
const cors = require("cors"); // Import middleware CORS
const bcrypt = require('bcrypt'); // Import bcrypt
const authenticateToken = require('./controller/authenticaticateToken')
const jwt = require('jsonwebtoken');
const moment = require("moment"); // Gunakan moment.js untuk format tanggal

const authRoutes = require('./routes/auth'); // Impor file auth.js





const swaggerSetup = require ('./swagger'); // Path ke konfigurasi SwvestasiID
// const generateInvestasiID = require('./generate_id');  kalua gaya ini mah cuman satu fungsi yang dibuat 
const {  
  generateInvestasiID, 
  generateAnggotaID, 
  generateTransaksiIDTopup, 
  generateOrderKreditID, 
  generateTransaksiIDCicilan, 
  generateIDMenabung } = require('./generate_id')

// const PORT = process.env.PORT || 8000;  
const PORT = process.env.PORT || 3000; // Tambahkan fallback port




const app = express();


const corsOptions = {
  origin: '*', // Mengizinkan semua origin. Ubah sesuai kebutuhan.
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Metode HTTP yang diizinkan
  allowedHeaders: ['Content-Type', 'Authorization'], // Header yang diizinkan
};

app.use(cors(corsOptions));
app.get('/', (req, res) => {
  res.send('CORS Configuration Successful');
});

app.use(express.json()); // Middleware untuk parsing JSON

db.query("SELECT NOW()", (err, result) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
  } else {
    console.log("✅ Database connected! Server time:", result[0]);
  }
});



app.get("/favicon.ico", (req, res) => res.status(204).end());




// ================= test db ke railway ===========
app.get("/test-db", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT NOW() AS time");
    res.json({ success: true, time: rows[0].time });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== random soal ============
app.get("/api/get-soal", async (req, res) => {
  try {
    

    const [row_get_soal] = await db.query(
      `SELECT * FROM tbl_soal ORDER BY RAND() LIMIT 5`
     
    );

    if (row_get_soal.length === 0) {
      return res.status(404).json({ message: "User profile not found" });
    }

    res.json(row_get_soal);
  } catch (error) {
    console.error("Database query failed:", error.message);
    res.status(500).json({ error: error.message });
  }
});


// =====================
app.post("/api/simpan-jawaban", async (req, res) => {
  try {
    const jawabanSiswa = req.body;

    let benar = 0;
    let salah = 0;

    for (const jawaban of jawabanSiswa) {
      // Ambil jawaban benar dari database
      const [rows] = await db.query("SELECT jawaban FROM tbl_soal WHERE id_soal = ?", [jawaban.id_soal]);

      if (rows.length === 0) continue;

      const jawabanBenar = rows[0].jawaban.trim().toLowerCase();
      const hasil = jawaban.jawaban_siswa.trim().toLowerCase() === jawabanBenar ? "benar" : "salah";

      if (hasil === "benar") benar++;
      else salah++;

      // Simpan jawaban siswa ke database
      await db.query(
        "INSERT INTO tbl_jawaban_siswa (id_soal, jawaban_siswa, hasil, nama_siswa) VALUES (?, ?, ?, ?)",
        [jawaban.id_soal, jawaban.jawaban_siswa, hasil, jawaban.nama_siswa]
      );
    }

    res.status(201).json({ message: "Jawaban berhasil disimpan!", benar, salah });
  } catch (error) {
    console.error("Gagal menyimpan jawaban:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
});

// lihat hasil jawaban siswa 
app.get("/api/jawaban-siswa", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT nama_siswa, id_soal, hasil FROM tbl_jawaban_siswa ORDER BY nama_siswa"
    );

    res.json(rows);
  } catch (error) {
    console.error("Gagal mengambil data:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
});

// =========================== tambah soal =============================================================
app.post("/api/tambah-soal", async (req, res) => {
  try {
    const { id_soal, soal, jawaban } = req.body;

    // **🔍 Validasi Data**
    if (!id_soal || !soal || !jawaban) {
      return res.status(400).json({ message: "Semua field harus diisi!" });
    }

    // **🔹 Masukkan Data ke Database**
    await db.query(
      "INSERT INTO tbl_soal (id_soal, soal, jawaban) VALUES (?, ?, ?)",
      [id_soal, soal, jawaban]
    );

    res.status(201).json({ message: "Soal berhasil ditambahkan!" });
  } catch (error) {
    console.error("Gagal menambahkan soal:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
});


// lihat soal oleh admin
app.get("/api/soal", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM tbl_soal ORDER BY id_soal");
    res.json(rows);
  } catch (error) {
    console.error("Gagal mengambil soal:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
});


//  hapus soal by admin
app.delete("/api/soal/:id_soal", async (req, res) => {
  try {
    const { id_soal } = req.params;

    // Hapus soal dari database
    const [result] = await db.query("DELETE FROM tbl_soal WHERE id_soal = ?", [id_soal]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Soal tidak ditemukan." });
    }

    res.json({ message: "Soal berhasil dihapus!" });
  } catch (error) {
    console.error("Gagal menghapus soal:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
});



app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});


// Swagger setup
swaggerSetup(app);

// untuk di lokal
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });



// untuk production
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});