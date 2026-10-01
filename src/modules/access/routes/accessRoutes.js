const jwt      = require('jsonwebtoken')
const User     = require('../../user/models/User')
const AccessLog = require('../models/AccessLog')

class QRScannerService {
  /**
   * Validar y registrar escaneo de QR.
   * El QR contiene: { id, document, sessionId, universityId }
   *
   * @param {string} qrData    - Contenido del QR escaneado (JSON string)
   * @param {string} scannedBy - ID del usuario que escanea (guardia/admin)
   * @param {string} type      - 'entrada' | 'salida'
   * @param {string} universityId - ID de la universidad
   * @param {string} location  - Ubicación del escaneo
   */
  async scan(qrData, scannedBy, type, universityId, location = 'Principal') {
    // Parsear datos del QR
    let parsed
    try {
      parsed = JSON.parse(qrData)
    } catch {
      throw { status: 400, message: 'QR inválido o mal formado' }
    }

    const { sessionId, type: qrType } = parsed

    if (qrType !== 'carnet_digital') {
      throw { status: 400, message: 'Este QR no pertenece al sistema de Carné Digital' }
    }

    const userId = parsed.id
    const user = await User.findOne({ _id: userId, university: universityId, isActive: true })
      .populate('university', 'name slug')

    if (!user) {
      throw { status: 404, message: 'Usuario no encontrado o no pertenece a esta universidad' }
    }

    const lastAccess = await AccessLog.findOne({ university: universityId, user: userId })
      .sort({ timestamp: -1 })
      .limit(1)

    const resolvedType = lastAccess && lastAccess.type === 'entrada' ? 'salida' : 'entrada'
    const finalType = resolvedType || type || 'entrada'

    const log = await AccessLog.create({
      university: universityId,
      user: userId,
      scannedBy,
      type: finalType,
      sessionId,
      qrValid: true,
      location,
    })

    await User.findByIdAndUpdate(userId, {
      $push: { accessHistory: log._id },
    })

    return {
      log,
      user: {
        name: user.name,
        document: user.document,
        role: user.role,
        career: user.career,
        photo: user.photo,
        university: user.university?.name,
      },
      type: finalType,
      message: `${finalType === 'entrada' ? '✅ Entrada' : '⬇️ Salida'} registrada para ${user.name}`,
    }
  }

  async getAll(universityId, filters = {}) {
    const query = { university: universityId }
    if (filters.type)   query.type = filters.type
    if (filters.userId) query.user = filters.userId
    if (filters.date) {
      const start = new Date(filters.date)
      const end   = new Date(filters.date)
      end.setDate(end.getDate() + 1)
      query.timestamp = { $gte: start, $lt: end }
    }

    return AccessLog.find(query)
      .populate('user',      'name document role photo')
      .populate('scannedBy', 'name role')
      .sort({ timestamp: -1 })
      .limit(filters.limit ? parseInt(filters.limit) : 200)
  }
}

const scannerService = new QRScannerService()

// Express router
const express = require('express')
const router  = express.Router()
const { authMiddleware, scannerMiddleware } = require('../../../middlewares/authMiddleware')

router.use(authMiddleware)

// POST /access/scan — Escanear QR
router.post('/scan', scannerMiddleware, async (req, res) => {
  try {
    const { qrData, location } = req.body
    if (!qrData) {
      return res.status(400).json({ success: false, message: 'qrData es requerido' })
    }
    const result = await scannerService.scan(qrData, req.user.id, req.body.type, req.universityId, location)
    res.status(201).json({ success: true, data: result })
  } catch (e) { res.status(e.status || 500).json({ success: false, message: e.message }) }
})

// GET /access — Historial de accesos
router.get('/', async (req, res) => {
  try {
    const logs = await scannerService.getAll(req.universityId, req.query)
    res.json({ success: true, data: logs })
  } catch (e) { res.status(500).json({ success: false, message: e.message }) }
})

// POST /access — Registro manual (web admin)
router.post('/', async (req, res) => {
  try {
    const { userId, type, location, notes } = req.body
    if (!userId || !type) return res.status(400).json({ success: false, message: 'userId y type son requeridos' })
    const log = await AccessLog.create({
      university:  req.universityId,
      user:        userId,
      scannedBy:   req.user.id,
      type,
      sessionId:   'manual',
      location:    location || 'Principal',
      notes:       notes || '',
    })
    const populated = await AccessLog.findById(log._id).populate('user scannedBy')
    res.status(201).json({ success: true, data: populated })
  } catch (e) { res.status(500).json({ success: false, message: e.message }) }
})

module.exports = router