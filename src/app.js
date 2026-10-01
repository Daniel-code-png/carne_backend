require('dotenv').config()
const express = require('express')
const cors    = require('cors')
const connectDB = require('./config/database')
const tenantMiddleware = require('./middlewares/tenantMiddleware')

// ── Rutas ──────────────────────────────────────────────────────
const authRoutes            = require('./modules/auth/routes/authRoutes')
const userRoutes            = require('./modules/user/routes/userRoutes')
const userManagementRoutes  = require('./modules/user/routes/userManagementRoutes')
const universityRoutes      = require('./modules/universites/routes/universityRoutes')
const accessRoutes          = require('./modules/access/routes/accessRoutes')

// Módulos con universidad scope
const equipmentRoutes  = require('./modules/equipment/routes/equipmentRoutes')
const loanRoutes       = require('./modules/loans/routes/loanRoutes')

const app = express()
connectDB()

// Firebase Admin
const admin = require('firebase-admin')
const path  = require('path')
try {
  if (!admin.apps.length) {
    const serviceAccount = require(path.join(process.cwd(), 'firebase-service-account.json'))
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
    console.log('✅ Firebase Admin inicializado')
  }
} catch (e) {
  console.warn('⚠️  Firebase no configurado:', e.message)
}

app.use(cors({
  origin: '*',
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','X-University-Slug'],
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Tenant middleware — identifica la universidad en cada request
app.use(tenantMiddleware)

// ── Health check ───────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Carné Digital SaaS API',
    version: '4.0.0',
    university: req.universitySlug || 'super-admin',
    timestamp: new Date().toISOString(),
  })
})

// ── API ────────────────────────────────────────────────────────
const API = '/api/v1'
app.use(`${API}/auth`,         authRoutes)
app.use(`${API}/user`,         userRoutes)
app.use(`${API}/users`,        userManagementRoutes)
app.use(`${API}/universities`, universityRoutes)
app.use(`${API}/access`,       accessRoutes)
app.use(`${API}/equipment`, equipmentRoutes)
app.use(`${API}/loans`,     loanRoutes)

app.use('*', (req, res) => res.status(404).json({ success: false, message: `Ruta ${req.originalUrl} no encontrada` }))
app.use((err, req, res, next) => res.status(err.status || 500).json({ success: false, message: err.message }))

const PORT = Number(process.env.PORT) || 3000

const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`🚀 Servidor SaaS corriendo en http://localhost:${port}`)
    console.log(`🏛️  Multi-tenant activo — identificación por subdominio o header X-University-Slug`)
  })

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      if (port === 3000) {
        const fallbackPort = 3001
        console.warn(`⚠️ Puerto ${port} ocupado. Reintentando en ${fallbackPort}...`)
        startServer(fallbackPort)
        return
      }

      console.error(`❌ Puerto ${port} también está en uso. Cierra el proceso anterior o cambia PORT en tu archivo .env.`)
      process.exit(1)
    } else {
      console.error('❌ Error inesperado al iniciar el servidor:', err)
      process.exit(1)
    }
  })
}

startServer(PORT)

module.exports = app