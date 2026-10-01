const express = require('express')
const router  = express.Router()
const c = require('../controllers/userManagementController')
const { authMiddleware } = require('../../../middlewares/authMiddleware')
const { uploadPhoto, uploadImport } = require('../../../middlewares/uploadMiddleware')

router.use(authMiddleware)

// Gestión individual
router.get('/',    c.getAll)
router.post('/',   uploadPhoto.single('photo'), c.createOne)
router.put('/:id', uploadPhoto.single('photo'), c.updateOne)
router.patch('/:id/toggle',         c.toggleActive)
router.patch('/:id/reset-password', c.resetPassword)

// Importación masiva
router.get('/import/template',                      c.downloadTemplate)
router.post('/import', uploadImport.single('file'), c.import)

module.exports = router