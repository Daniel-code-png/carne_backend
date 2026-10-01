const express = require('express')
const router  = express.Router()
const authController = require('../controllers/authController')
const { authMiddleware } = require('../../../middlewares/authMiddleware')

router.post('/login',           authController.login.bind(authController))
router.put('/change-password',  authMiddleware, authController.changePassword.bind(authController))

module.exports = router