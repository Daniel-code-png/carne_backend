const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const User = require('../../user/models/User');

/**
 * AuthService — Lógica de negocio para autenticación.
 * Separado del controlador para facilitar testing y reutilización.
 */
class AuthService {
  /**
   * Login: valida credenciales y genera JWT + QR session token.
   */
  async login(document, password) {
    // 1. Buscar usuario (incluir password que está oculto por defecto)
    const user = await User.findOne({ document, isActive: true }).select('+password');
    if (!user) {
      throw { status: 401, message: 'Credenciales incorrectas' };
    }

    // 2. Verificar contraseña
    const isValid = await user.comparePassword(password);
    if (!isValid) {
      throw { status: 401, message: 'Credenciales incorrectas' };
    }

    // 3. Generar QR session token (único por sesión, cambia en cada login)
    const sessionId = uuidv4();

    // 4. Generar JWT con payload mínimo y seguro
    const tokenPayload = {
      id: user._id,
      document: user.document,
      role: user.role,
      sessionId, // Para invalidar QR cuando expire la sesión
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    });

    return {
      token,
      firstLogin: user.firstLogin,
      sessionId, // El QR se genera en el cliente con este ID
      user: user.toSafeObject(),
    };
  }

  /**
   * Cambio de contraseña en primer inicio de sesión.
   * Valida reglas de negocio y actualiza el usuario.
   */
  async changePassword(userId, newPassword) {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw { status: 404, message: 'Usuario no encontrado' };
    }

    // Regla: no puede ser igual a la cédula
    if (newPassword === user.document) {
      throw { status: 400, message: 'La contraseña no puede ser igual a tu cédula' };
    }

    // Regla: mínimo 6 caracteres (también validado en el modelo)
    if (newPassword.length < 6) {
      throw { status: 400, message: 'La contraseña debe tener al menos 6 caracteres' };
    }

    // Actualizar contraseña y marcar primer login como completado
    user.password = newPassword; // El hook pre-save hace el hash
    user.firstLogin = false;
    await user.save();

    return { message: 'Contraseña actualizada correctamente' };
  }

  /**
   * Decodifica y verifica un JWT.
   * Usado por el middleware de autenticación.
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      throw { status: 401, message: 'Token inválido o expirado' };
    }
  }
}

module.exports = new AuthService();