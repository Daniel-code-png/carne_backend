const AccessLog = require('../models/AccessLog');
const User = require('../../user/models/User');

class AccessController {
  async register(req, res) {
    try {
      const { userId, type, location, notes } = req.body;

      if (!userId || !type) {
        return res.status(400).json({ success: false, message: 'userId y type son requeridos' });
      }

      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

      const log = await AccessLog.create({
        user: userId,
        type,
        registeredBy: req.user.id,
        location: location || 'Principal',
        notes: notes || '',
      });

      // Guardar en historial del usuario
      await User.findByIdAndUpdate(userId, { $push: { accessHistory: log._id } });

      const populated = await AccessLog.findById(log._id).populate('user registeredBy');
      res.status(201).json({ success: true, data: populated });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  async getAll(req, res) {
    try {
      const query = {};
      if (req.query.userId) query.user = req.query.userId;
      if (req.query.type) query.type = req.query.type;
      if (req.query.date) {
        const start = new Date(req.query.date);
        const end = new Date(req.query.date);
        end.setDate(end.getDate() + 1);
        query.timestamp = { $gte: start, $lt: end };
      }

      const logs = await AccessLog.find(query)
        .populate('user registeredBy')
        .sort({ timestamp: -1 })
        .limit(req.query.limit ? parseInt(req.query.limit) : 100);

      res.json({ success: true, data: logs });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  }
}

module.exports = new AccessController();