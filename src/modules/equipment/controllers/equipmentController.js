const equipmentService = require('../services/equipmentService');

class EquipmentController {
  async getAll(req, res) {
    try {
      const data = await equipmentService.getAll(req.universityId, req.query);
      res.json({ success: true, data });
    } catch (e) { res.status(e.status || 500).json({ success: false, message: e.message }); }
  }

  async getById(req, res) {
    try {
      const data = await equipmentService.getById(req.params.id, req.universityId);
      res.json({ success: true, data });
    } catch (e) { res.status(e.status || 500).json({ success: false, message: e.message }); }
  }

  async create(req, res) {
    try {
      const data = await equipmentService.create(req.universityId, req.body);
      res.status(201).json({ success: true, data });
    } catch (e) { res.status(e.status || 500).json({ success: false, message: e.message }); }
  }

  async update(req, res) {
    try {
      const data = await equipmentService.update(req.params.id, req.universityId, req.body);
      res.json({ success: true, data });
    } catch (e) { res.status(e.status || 500).json({ success: false, message: e.message }); }
  }

  async delete(req, res) {
    try {
      const data = await equipmentService.delete(req.params.id, req.universityId);
      res.json({ success: true, data });
    } catch (e) { res.status(e.status || 500).json({ success: false, message: e.message }); }
  }

  async getStats(req, res) {
    try {
      const data = await equipmentService.getStats(req.universityId);
      res.json({ success: true, data });
    } catch (e) { res.status(e.status || 500).json({ success: false, message: e.message }); }
  }
}

module.exports = new EquipmentController();