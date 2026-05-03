const authService = require('../modules/auth/services/authService');

/**
 * Middleware de autenticación JWT.
 * Extrae el token del header Authorization y lo verifica.
 * Agrega req.user con el payload decodificado.
 */
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = authService.verifyToken(token);

    // Adjuntar usuario al request para uso en controladores
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(error.status || 401).json({
      success: false,
      message: error.message || 'No autorizado',
    });
  }
};

module.exports = authMiddleware;