// controllers/authController.js
const authService = require('../services/authService')

class AuthController {
  async login(req, res) {
    try {
      const { document, password } = req.body
      // Universidad viene del middleware tenant o del body
      const universitySlug = req.universitySlug || req.body.universitySlug
      if (!document || !password) {
        return res.status(400).json({ success: false, message: 'Cédula y contraseña son requeridas' })
      }
      const result = await authService.login(document, password, universitySlug)
      res.json({ success: true, data: result })
    } catch (e) { res.status(e.status || 500).json({ success: false, message: e.message }) }
  }

  async changePassword(req, res) {
    try {
      const { newPassword } = req.body
      if (!newPassword) return res.status(400).json({ success: false, message: 'La nueva contraseña es requerida' })
      const result = await authService.changePassword(req.user.id, newPassword)
      res.json({ success: true, data: result })
    } catch (e) { res.status(e.status || 500).json({ success: false, message: e.message }) }
  }
}

module.exports = new AuthController()