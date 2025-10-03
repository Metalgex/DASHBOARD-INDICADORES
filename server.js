const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.static(__dirname));
app.use(express.json());

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

app.post("/api/guardarIndicadores", (req, res) => {
  const { mes, indicadores } = req.body;
  if (!mes || !Array.isArray(indicadores)) {
    return res.status(400).json({ error: "Payload inválido" });
  }

  const values = indicadores.map(ind => [ind.id, ind.valor, mes]);

  const sql = `
    INSERT INTO historial_indicadores (indicador_id, valor, mes) 
    VALUES ? 
    ON DUPLICATE KEY UPDATE valor = VALUES(valor)
  `;

  db.query(sql, [values], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.get("/api/meses", (req, res) => {
  db.query("SELECT DISTINCT mes FROM historial_indicadores ORDER BY mes DESC", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map(r => ({ mes: r.mes.toISOString().slice(0,10) })));
  });
});

// Endpoint API
app.get("/api/indicadores", (req, res) => {
  const { mes } = req.query;

  const getLatestSql = "SELECT MAX(mes) as mes FROM historial_indicadores";

  const queryByMonth = (month) => {
    const sql = `
      SELECT i.seccion, i.nombre, i.tipo, h.valor
      FROM indicadores i
      LEFT JOIN historial_indicadores h 
        ON h.indicador_id = i.id AND h.mes = ?
      ORDER BY i.id
    `;
    db.query(sql, [month], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      const result = {};
      rows.forEach(r => {
        if (!result[r.seccion]) result[r.seccion] = [];
        result[r.seccion].push({
          nombre: r.nombre,
          valor: r.valor || 0,
          tipo: r.tipo
        });
      });
      res.json(result);
    });
  };

  if (mes) {
    queryByMonth(mes);
  } else {
    db.query(getLatestSql, (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      const latest = rows[0].mes;
      if (!latest) return res.json({});
      queryByMonth(latest);
    });
  }
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