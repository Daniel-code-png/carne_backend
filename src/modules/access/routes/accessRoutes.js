const express = require('express');
const router = express.Router();
const accessController = require('../controllers/accessController');
const authMiddleware = require('../../../middlewares/authMiddleware');

router.use(authMiddleware);

router.post('/', accessController.register.bind(accessController));
router.get('/', accessController.getAll.bind(accessController));

module.exports = router;