const Equipment = require('../models/Equipment');

class EquipmentService {
  async getAll(filters = {}) {
    const query = { isActive: true };
    if (filters.category) query.category = filters.category;
    if (filters.status) query.status = filters.status;
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { code: { $regex: filters.search, $options: 'i' } },
      ];
    }
    return Equipment.find(query).populate('currentLoan').sort({ createdAt: -1 });
  }

  async getById(id) {
    const equipment = await Equipment.findById(id).populate('currentLoan');
    if (!equipment) throw { status: 404, message: 'Equipo no encontrado' };
    return equipment;
  }

  async create(data) {
    const existing = await Equipment.findOne({ code: data.code?.toUpperCase() });
    if (existing) throw { status: 400, message: 'Ya existe un equipo con ese código' };
    return Equipment.create(data);
  }

  async update(id, data) {
    const equipment = await Equipment.findByIdAndUpdate(id, data, { new: true });
    if (!equipment) throw { status: 404, message: 'Equipo no encontrado' };
    return equipment;
  }

  async delete(id) {
    const equipment = await Equipment.findById(id);
    if (!equipment) throw { status: 404, message: 'Equipo no encontrado' };
    if (equipment.status === 'prestado') {
      throw { status: 400, message: 'No se puede eliminar un equipo prestado' };
    }
    equipment.isActive = false;
    await equipment.save();
    return { message: 'Equipo eliminado correctamente' };
  }

  async getStats() {
    const stats = await Equipment.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const total = await Equipment.countDocuments({ isActive: true });
    return { total, byStatus: stats };
  }
}

module.exports = new EquipmentService();