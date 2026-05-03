const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../../../middlewares/authMiddleware');

// POST /auth/login — Público
router.post('/login', authController.login.bind(authController));

// PUT /auth/change-password — Requiere JWT válido
router.put(
  '/change-password',
  authMiddleware,
  authController.changePassword.bind(authController)
);

// 🔮 Rutas futuras preparadas (comentadas hasta fase siguiente)
// router.post('/logout', authMiddleware, authController.logout);
// router.post('/refresh-token', authController.refreshToken);

module.exports = router;