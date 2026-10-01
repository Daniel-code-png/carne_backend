const express = require('express')
const router  = express.Router()
const { universityController } = require('../service/universityService')
const { authMiddleware, superAdminMiddleware } = require('../../../middlewares/authMiddleware')
const { uploadLogo } = require('../../../middlewares/uploadMiddleware')

router.use(authMiddleware, superAdminMiddleware)

router.get('/',                    universityController.getAll)
router.get('/:id',                 universityController.getById)
router.get('/:id/stats',           universityController.getStats)
router.post('/', uploadLogo.single('logo'), universityController.create)
router.put('/:id', uploadLogo.single('logo'), universityController.update)
router.patch('/:id/toggle',        universityController.toggleActive)

module.exports = router