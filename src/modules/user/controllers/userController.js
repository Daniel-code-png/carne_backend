const userService = require('../services/userService');

class UserController {
  async getProfile(req, res) {
    try {
      const user = await userService.getProfile(req.user.id);
      return res.status(200).json({ success: true, data: user });
    } catch (error) {
      return res.status(error.status || 500).json({ success: false, message: error.message });
    }
  }

  async updateTheme(req, res) {
    try {
      const { theme } = req.body;
      if (!theme) return res.status(400).json({ success: false, message: 'El tema es requerido' });
      const user = await userService.updateTheme(req.user.id, theme);
      return res.status(200).json({ success: true, data: user });
    } catch (error) {
      return res.status(error.status || 500).json({ success: false, message: error.message });
    }
  }

  async updateFcmToken(req, res) {
    try {
      const { fcmToken } = req.body;
      if (!fcmToken) return res.status(400).json({ success: false, message: 'fcmToken es requerido' });
      const result = await userService.updateFcmToken(req.user.id, fcmToken);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      return res.status(error.status || 500).json({ success: false, message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const users = await userService.getAll();
      return res.status(200).json({ success: true, data: users });
    } catch (error) {
      return res.status(error.status || 500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new UserController();