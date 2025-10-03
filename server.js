const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.static(__dirname));

// Conexión a tu base de datos en Cloud SQL
const db = mysql.createPool({
  socketPath: "/cloudsql/dashboard-474005:us-central1:indicadores", // <-- usa conexión por socket
  user: "root",
  password: "Cvortex2006!",   // ⚠️ cámbiala si usas otra
  database: "dashboard_indicadores"
});

db.getConnection((err, connection) => {
  if (err) {
    console.error("Error conectando a la BD:", err.code, err.message);
    return;
  }
  console.log("Conectado a la base de datos");
  connection.release();
});

// Endpoint API
app.get("/api/indicadores", (req, res) => {
  db.query("SELECT * FROM indicadores", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const result = {};
    rows.forEach(row => {
      if (!result[row.seccion]) result[row.seccion] = [];
      result[row.seccion].push({
        nombre: row.nombre,
        valor: row.valor,
        tipo: row.tipo
      });
    });
    res.json(result);
  });
});

// Servir index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
);
//para hacer commit extra
//commit2
//comit3