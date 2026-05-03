const User = require('../models/User');

/**
 * UserService — Lógica de negocio para gestión de usuarios.
 */
class UserService {
  /**
   * Obtiene perfil completo del usuario (sin contraseña).
   */
  async getProfile(userId) {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw { status: 404, message: 'Usuario no encontrado' };
    }
    return user;
  }

  /**
   * Actualiza el tema visual del usuario.
   */
  async updateTheme(userId, theme) {
    const validThemes = ['institucional', 'kawaii', 'dark', 'spiderman', 'kuromi'];
    if (!validThemes.includes(theme)) {
      throw { status: 400, message: `Tema inválido. Opciones: ${validThemes.join(', ')}` };
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { theme },
      { new: true, select: '-password' }
    );

    if (!user) {
      throw { status: 404, message: 'Usuario no encontrado' };
    }

    return user;
  }

  // 🔮 Preparado para fase 2
  // async getLoans(userId) { ... }
  // async getAccessHistory(userId) { ... }
}

module.exports = new UserService();