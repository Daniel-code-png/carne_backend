const Loan = require('../models/Loan');
const Equipment = require('../../equipment/models/Equipment');
const User = require('../../user/models/User');
const notificationService = require('../../notifications/services/notificationService');

class LoanService {
  /**
   * Admin registra nuevo préstamo.
   * Cambia estado del equipo y envía notificación push al usuario.
   */
  async create(adminId, { equipmentId, userId, expectedReturnDate, notes }) {
    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) throw { status: 404, message: 'Equipo no encontrado' };
    if (equipment.status !== 'disponible') {
      throw { status: 400, message: `El equipo no está disponible (estado: ${equipment.status})` };
    }

    const user = await User.findById(userId);
    if (!user) throw { status: 404, message: 'Usuario no encontrado' };

    const loan = await Loan.create({
      equipment: equipmentId,
      user: userId,
      registeredBy: adminId,
      expectedReturnDate: expectedReturnDate || null,
      notes: notes || '',
      status: 'pendiente',
      fcmTokenSnapshot: user.fcmToken || '',
    });

    // Cambiar estado del equipo
    equipment.status = 'prestado';
    equipment.currentLoan = loan._id;
    await equipment.save();

    // Agregar a préstamos activos del usuario
    await User.findByIdAndUpdate(userId, { $push: { activeLoans: loan._id } });

    // Enviar notificación push
    if (user.fcmToken) {
      await notificationService.notifyNewLoan(user.fcmToken, {
        loanId: loan._id.toString(),
        equipmentName: equipment.name,
      });
    }

    return Loan.findById(loan._id).populate(['equipment', 'user', 'registeredBy']);
  }

  /**
   * Usuario confirma o rechaza el préstamo desde el carné móvil.
   * confirmed: true = sí fui yo | false = no fui yo
   */
  async userConfirm(loanId, userId, confirmed) {
    const loan = await Loan.findOne({ _id: loanId, user: userId });
    if (!loan) throw { status: 404, message: 'Préstamo no encontrado' };
    if (loan.status !== 'pendiente') throw { status: 400, message: 'Este préstamo ya fue respondido' };

    loan.userConfirmed = confirmed;
    loan.userConfirmedAt = new Date();

    if (!confirmed) {
      loan.status = 'rechazado';
      await Equipment.findByIdAndUpdate(loan.equipment, { status: 'disponible', currentLoan: null });
    }

    await loan.save();
    return loan;
  }

  /**
   * Usuario acepta términos y condiciones.
   * Finaliza el flujo de aceptación → préstamo activo.
   */
  async acceptTerms(loanId, userId) {
    const loan = await Loan.findOne({ _id: loanId, user: userId });
    if (!loan) throw { status: 404, message: 'Préstamo no encontrado' };
    if (!loan.userConfirmed) throw { status: 400, message: 'Debes confirmar el préstamo primero' };
    if (loan.termsAccepted) throw { status: 400, message: 'Los términos ya fueron aceptados' };

    loan.termsAccepted = true;
    loan.termsAcceptedAt = new Date();
    loan.status = 'aceptado';
    await loan.save();

    return loan;
  }

  /**
   * Admin marca el préstamo como devuelto.
   * Libera el equipo y notifica al usuario.
   */
  async markReturned(loanId, adminId) {
    const loan = await Loan.findById(loanId).populate('equipment user');
    if (!loan) throw { status: 404, message: 'Préstamo no encontrado' };
    if (loan.status === 'devuelto') throw { status: 400, message: 'Este préstamo ya fue marcado como devuelto' };

    loan.status = 'devuelto';
    loan.returnDate = new Date();
    await loan.save();

    // Liberar equipo
    await Equipment.findByIdAndUpdate(loan.equipment._id, { status: 'disponible', currentLoan: null });

    // Quitar de préstamos activos del usuario
    await User.findByIdAndUpdate(loan.user._id, { $pull: { activeLoans: loan._id } });

    // Notificar
    if (loan.user.fcmToken) {
      await notificationService.notifyLoanReturned(loan.user.fcmToken, {
        loanId: loan._id.toString(),
        equipmentName: loan.equipment.name,
      });
    }

    return loan;
  }

  async getAll(filters = {}) {
    const query = {};
    if (filters.status) query.status = filters.status;
    if (filters.userId) query.user = filters.userId;
    return Loan.find(query).populate('equipment user registeredBy').sort({ createdAt: -1 });
  }

  async getById(id) {
    const loan = await Loan.findById(id).populate('equipment user registeredBy');
    if (!loan) throw { status: 404, message: 'Préstamo no encontrado' };
    return loan;
  }

  async getUserLoans(userId) {
    return Loan.find({ user: userId }).populate('equipment').sort({ createdAt: -1 });
  }
}

module.exports = new LoanService();