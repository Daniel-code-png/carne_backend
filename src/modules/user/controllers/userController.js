const userService = require('../services/userService');

class UserController {
  /**
   * GET /user/profile
   * Retorna datos del carné digital del usuario autenticado.
   */
  async getProfile(req, res) {
    try {
      const user = await userService.getProfile(req.user.id);
      return res.status(200).json({ success: true, data: user });
    } catch (error) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor',
      });
    }
  }

  /**
   * PATCH /user/theme
   * Actualiza preferencia de tema visual.
   */
  async updateTheme(req, res) {
    try {
      const { theme } = req.body;
      if (!theme) {
        return res.status(400).json({ success: false, message: 'El tema es requerido' });
      }
      const user = await userService.updateTheme(req.user.id, theme);
      return res.status(200).json({ success: true, data: user });
    } catch (error) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor',
      });
    }
  }
}

module.exports = new UserController();