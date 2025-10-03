const mysql = require("mysql2");
const db = mysql.createPool({
  host: "localhost",
  user: "TU_USUARIO",
  password: "TU_PASSWORD",
  database: "dashboard_indicadores"
});

db.query("SELECT 1 + 1 AS resultado", (err, rows) => {
  if(err) console.error(err);
  else console.log("Conexión OK:", rows);
});
