const express = require('express')
const router  = express.Router()
const c = require('../controllers/userManagementController')
const { authMiddleware, adminMiddleware } = require('../../../middlewares/authMiddleware')
const { uploadPhoto, uploadImport } = require('../../../middlewares/uploadMiddleware')

router.use(authMiddleware)

// Perfil del usuario autenticado
router.get('/profile', async (req, res) => {
  try {
    const User = require('../models/User')
    const user = await User.findById(req.user.id).select('-password').populate('university', 'name slug logo primaryColor secondaryColor')
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' })
    res.json({ success: true, data: { ...user.toObject(), canScan: user.canScan() } })
  } catch (e) { res.status(500).json({ success: false, message: e.message }) }
})

// FCM token
router.patch('/fcm-token', async (req, res) => {
  try {
    const User = require('../models/User')
    await User.findByIdAndUpdate(req.user.id, { fcmToken: req.body.fcmToken })
    res.json({ success: true, message: 'FCM token actualizado' })
  } catch (e) { res.status(500).json({ success: false, message: e.message }) }
})

// Tema visual
router.patch('/theme', async (req, res) => {
  try {
    const User = require('../models/User')
    const user = await User.findByIdAndUpdate(req.user.id, { theme: req.body.theme }, { new: true, select: '-password' })
    res.json({ success: true, data: user })
  } catch (e) { res.status(500).json({ success: false, message: e.message }) }
})

// Gestión (solo admins)
router.use(adminMiddleware)
router.get('/list',              c.getAll)
router.get('/import/template',   c.downloadTemplate)
router.post('/',                 uploadPhoto.single('photo'),  c.createOne)
router.post('/import',           uploadImport.single('file'),  c.import)
router.put('/:id',               uploadPhoto.single('photo'),  c.updateOne)
router.patch('/:id/toggle',      c.toggleActive)
router.patch('/:id/reset-password', c.resetPassword)

module.exports = router