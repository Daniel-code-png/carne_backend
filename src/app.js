require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

// ── Importar rutas de módulos ──────────────────────────────────
const authRoutes = require('./modules/auth/routes/authRoutes');
const userRoutes = require('./modules/user/routes/userRoutes');

// 🔮 Futuras rutas (descomentar al implementar):
// const loanRoutes = require('./modules/loans/routes/loanRoutes');
// const accessRoutes = require('./modules/access/routes/accessRoutes');

const app = express();

// ── Conectar base de datos ────────────────────────────────────
connectDB();

// ── Middlewares globales ──────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health check ──────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Carné Digital API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ── Rutas de la API ───────────────────────────────────────────
const API_PREFIX = '/api/v1';

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/user`, userRoutes);

// 🔮 Módulos futuros (descomentar al implementar):
// app.use(`${API_PREFIX}/loans`, loanRoutes);
// app.use(`${API_PREFIX}/access`, accessRoutes);

// ── Manejo de rutas no encontradas ───────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta ${req.originalUrl} no encontrada`,
  });
});

// ── Manejo de errores global ──────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
  });
});

// ── Iniciar servidor ──────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🔑 API: http://localhost:${PORT}/api/v1`);
});

module.exports = app;