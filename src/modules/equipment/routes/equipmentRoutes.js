const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');
const authMiddleware = require('../../../middlewares/authMiddleware');

// GET /equipment — Obtener todos los equipos
router.get('/', equipmentController.getAll.bind(equipmentController));

// GET /equipment/stats — Obtener estadísticas
router.get('/stats', equipmentController.getStats.bind(equipmentController));

// GET /equipment/:id — Obtener equipo por ID
router.get('/:id', equipmentController.getById.bind(equipmentController));

// POST /equipment — Crear nuevo equipo (requiere autenticación)
router.post('/', authMiddleware, equipmentController.create.bind(equipmentController));

// PUT /equipment/:id — Actualizar equipo (requiere autenticación)
router.put('/:id', authMiddleware, equipmentController.update.bind(equipmentController));

// DELETE /equipment/:id — Eliminar equipo (requiere autenticación)
router.delete('/:id', authMiddleware, equipmentController.delete.bind(equipmentController));

module.exports = router;
