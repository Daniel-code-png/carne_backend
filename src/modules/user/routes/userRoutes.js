const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../../../middlewares/authMiddleware');

// Todas las rutas de usuario requieren autenticación
router.use(authMiddleware);

// GET /user/profile — Datos del carné
router.get('/profile', userController.getProfile.bind(userController));

// PATCH /user/theme — Cambiar tema visual
router.patch('/theme', userController.updateTheme.bind(userController));

// 🔮 Rutas futuras preparadas (fase 2)
// router.get('/loans', userController.getLoans);
// router.get('/access-history', userController.getAccessHistory);

module.exports = router;