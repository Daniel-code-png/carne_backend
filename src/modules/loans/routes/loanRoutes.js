const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');
const authMiddleware = require('../../../middlewares/authMiddleware');

router.use(authMiddleware);

// POST /loans — Crear nuevo préstamo
router.post('/', loanController.create.bind(loanController));

// GET /loans — Obtener todos los préstamos
router.get('/', loanController.getAll.bind(loanController));

// GET /loans/my-loans — Obtener mis préstamos
router.get('/my-loans', loanController.getMyLoans.bind(loanController));

// GET /loans/:id — Obtener préstamo por ID
router.get('/:id', loanController.getById.bind(loanController));

// PUT /loans/:id/mark-returned — Marcar equipo como devuelto
router.put('/:id/mark-returned', loanController.markReturned.bind(loanController));

// PUT /loans/:id/user-confirm — Confirmar préstamo (usuario)
router.put('/:id/user-confirm', loanController.userConfirm.bind(loanController));

// PUT /loans/:id/accept-terms — Aceptar términos del préstamo
router.put('/:id/accept-terms', loanController.acceptTerms.bind(loanController));

module.exports = router;
