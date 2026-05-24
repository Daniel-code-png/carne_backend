require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

// ── Módulos Fase 1 ─────────────────────────────────────────────
const authRoutes = require('./modules/auth/routes/authRoutes');
const userRoutes = require('./modules/user/routes/userRoutes');

// ── Módulos Fase 2 ─────────────────────────────────────────────
const equipmentRoutes = require('./modules/equipment/routes/equipmentRoutes');
const loanRoutes = require('./modules/loans/routes/loanRoutes');
const accessRoutes = require('./modules/access/routes/accessRoutes');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health check ───────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Carné Digital API',
    version: '2.0.0',
    modules: ['auth', 'user', 'equipment', 'loans', 'access'],
    timestamp: new Date().toISOString(),
  });
});

// ── Rutas ──────────────────────────────────────────────────────
const API = '/api/v1';

app.use(`${API}/auth`, authRoutes);
app.use(`${API}/user`, userRoutes);
app.use(`${API}/equipment`, equipmentRoutes);
app.use(`${API}/loans`, loanRoutes);
app.use(`${API}/access`, accessRoutes);

// ── 404 ────────────────────────────────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta ${req.originalUrl} no encontrada`,
  });
});

// ── Error global ───────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📦 Módulos: auth, user, equipment, loans, access`);
  console.log(`🔑 Health: http://localhost:${PORT}/health`);
});

module.exports = app;