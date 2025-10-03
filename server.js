const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());

// Servir archivos estáticos desde la misma carpeta que server.js
app.use(express.static(__dirname));

// Conexión a la base de datos MySQL local
const db = mysql.createPool({
  host: "34.173.110.44",
  user: "root",
  password: "Cvortex2006!",
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

// Servir index.html en la raíz
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html")); // apunta al index.html dentro de DASHBOARD
});

// Iniciar el servidor
const PORT = 3000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
);