const authService = require('../services/authService');

/**
 * AuthController — Maneja request/response HTTP.
 * La lógica de negocio vive en authService.
 */
class AuthController {
  /**
   * POST /auth/login
   * Body: { document, password }
   */
  async login(req, res) {
    try {
      const { document, password } = req.body;

      if (!document || !password) {
        return res.status(400).json({
          success: false,
          message: 'Cédula y contraseña son requeridas',
        });
      }

      const result = await authService.login(document, password);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor',
      });
    }
  }

  /**
   * PUT /auth/change-password
   * Header: Authorization: Bearer <token>
   * Body: { newPassword }
   * Solo accesible con JWT válido (middleware authMiddleware)
   */
  async changePassword(req, res) {
    try {
      const { newPassword } = req.body;

      if (!newPassword) {
        return res.status(400).json({
          success: false,
          message: 'La nueva contraseña es requerida',
        });
      }

      const result = await authService.changePassword(req.user.id, newPassword);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor',
      });
    }
  }
}

module.exports = new AuthController();