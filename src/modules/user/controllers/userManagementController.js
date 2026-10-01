const userManagementService = require('../services/userManagementService')

class UserManagementController {
  async getAll(req, res) {
    try {
      const result = await userManagementService.getAll(req.universityId, req.query)
      res.json({ success: true, data: result })
    } catch (e) { res.status(e.status || 500).json({ success: false, message: e.message }) }
  }

  async createOne(req, res) {
    try {
      const user = await userManagementService.createOne(
        { ...req.body, universityId: req.universityId, universitySlug: req.universitySlug },
        req.file?.path
      )
      res.status(201).json({ success: true, data: user })
    } catch (e) { res.status(e.status || 500).json({ success: false, message: e.message }) }
  }

  async updateOne(req, res) {
    try {
      const user = await userManagementService.updateOne(
        req.params.id, req.universityId, req.body, req.file?.path, req.universitySlug
      )
      res.json({ success: true, data: user })
    } catch (e) { res.status(e.status || 500).json({ success: false, message: e.message }) }
  }

  async toggleActive(req, res) {
    try {
      const result = await userManagementService.toggleActive(req.params.id, req.universityId)
      res.json({ success: true, data: result })
    } catch (e) { res.status(e.status || 500).json({ success: false, message: e.message }) }
  }

  async resetPassword(req, res) {
    try {
      const result = await userManagementService.resetPassword(req.params.id, req.universityId)
      res.json({ success: true, data: result })
    } catch (e) { res.status(e.status || 500).json({ success: false, message: e.message }) }
  }

  async import(req, res) {
    try {
      if (!req.file) return res.status(400).json({ success: false, message: 'No se subió ningún archivo' })
      const sendEmails = req.body.sendEmails !== 'false'
      const result = await userManagementService.bulkImport(
        req.file.path, req.universityId, req.universitySlug, sendEmails
      )
      res.json({ success: true, data: result })
    } catch (e) { res.status(e.status || 500).json({ success: false, message: e.message }) }
  }

  async downloadTemplate(req, res) {
    try {
      const buffer = userManagementService.generateTemplate()
      res.setHeader('Content-Disposition', 'attachment; filename="plantilla_usuarios.xlsx"')
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      res.send(buffer)
    } catch (e) { res.status(500).json({ success: false, message: e.message }) }
  }
}

module.exports = new UserManagementController()