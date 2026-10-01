const Equipment = require('../models/Equipment');

class EquipmentService {
  async getAll(universityId, filters = {}) {
    const query = { university: universityId, isActive: true };
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

  async getById(id, universityId) {
    const equipment = await Equipment.findOne({ _id: id, university: universityId }).populate('currentLoan');
    if (!equipment) throw { status: 404, message: 'Equipo no encontrado' };
    return equipment;
  }

  async create(universityId, data) {
    const existing = await Equipment.findOne({ university: universityId, code: data.code?.toUpperCase() });
    if (existing) throw { status: 400, message: 'Ya existe un equipo con ese código' };
    return Equipment.create({ ...data, university: universityId });
  }

  async update(id, universityId, data) {
    const equipment = await Equipment.findOneAndUpdate({ _id: id, university: universityId }, data, { new: true });
    if (!equipment) throw { status: 404, message: 'Equipo no encontrado' };
    return equipment;
  }

  async delete(id, universityId) {
    const equipment = await Equipment.findOne({ _id: id, university: universityId });
    if (!equipment) throw { status: 404, message: 'Equipo no encontrado' };
    if (equipment.status === 'prestado') {
      throw { status: 400, message: 'No se puede eliminar un equipo prestado' };
    }
    equipment.isActive = false;
    await equipment.save();
    return { message: 'Equipo eliminado correctamente' };
  }

  async getStats(universityId) {
    const stats = await Equipment.aggregate([
      { $match: { university: universityId, isActive: true } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const total = await Equipment.countDocuments({ university: universityId, isActive: true });
    return { total, byStatus: stats };
  }
}

module.exports = new EquipmentService();