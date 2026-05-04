const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const DB_PATH = path.join(__dirname, '../imoveis.db');
const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors());
app.use(express.json());

function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH);
    db.all(sql, params, (err, rows) => {
      db.close();
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// Endpoints REST
const tables = [
  'imoveis', 'contratos', 'locadores', 'contrato_locador', 'pagamentos',
  'aditivos', 'servicos', 'etapas', 'alertas', 'timeline_eventos'
];

tables.forEach(table => {
  app.get(`/api/${table}`, async (req, res) => {
    try {
      const rows = await dbAll(`SELECT * FROM ${table}`);
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get(`/api/${table}/:id`, async (req, res) => {
    try {
      const rows = await dbAll(`SELECT * FROM ${table} WHERE id = ?`, [req.params.id]);
      if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
      res.json(rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
});

// Projecao financeira (view)
app.get('/api/projecao_financeira', async (req, res) => {
  try {
    const rows = await dbAll('SELECT * FROM projecao_financeira');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => {
  res.send('API SQLite Imóveis - OK');
});

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});
