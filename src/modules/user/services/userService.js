const User = require('../models/User');

class UserService {
  async getProfile(userId) {
    const user = await User.findById(userId).select('-password');
    if (!user) throw { status: 404, message: 'Usuario no encontrado' };
    return user;
  }

  async updateTheme(userId, theme) {
    const validThemes = ['institucional', 'kawaii', 'dark', 'spiderman', 'kuromi'];
    if (!validThemes.includes(theme)) {
      throw { status: 400, message: `Tema inválido. Opciones: ${validThemes.join(', ')}` };
    }
    const user = await User.findByIdAndUpdate(userId, { theme }, { new: true, select: '-password' });
    if (!user) throw { status: 404, message: 'Usuario no encontrado' };
    return user;
  }

  async updateFcmToken(userId, fcmToken) {
    await User.findByIdAndUpdate(userId, { fcmToken });
    return { message: 'FCM token actualizado' };
  }

  async getAll() {
    return User.find({ isActive: true }).select('name document role career email phone photo');
  }
}

module.exports = new UserService();