const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../../../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/profile', userController.getProfile.bind(userController));
router.patch('/theme', userController.updateTheme.bind(userController));
router.patch('/fcm-token', userController.updateFcmToken.bind(userController));
router.get('/list', userController.getAll.bind(userController));

module.exports = router;