const loanService = require('../services/loanService');

class LoanController {
  async create(req, res) {
    try {
      const data = await loanService.create(req.user.id, req.body);
      res.status(201).json({ success: true, data });
    } catch (e) { res.status(e.status || 500).json({ success: false, message: e.message }); }
  }

  async getAll(req, res) {
    try {
      const data = await loanService.getAll(req.query);
      res.json({ success: true, data });
    } catch (e) { res.status(e.status || 500).json({ success: false, message: e.message }); }
  }

  async getById(req, res) {
    try {
      const data = await loanService.getById(req.params.id);
      res.json({ success: true, data });
    } catch (e) { res.status(e.status || 500).json({ success: false, message: e.message }); }
  }

  async markReturned(req, res) {
    try {
      const data = await loanService.markReturned(req.params.id, req.user.id);
      res.json({ success: true, data });
    } catch (e) { res.status(e.status || 500).json({ success: false, message: e.message }); }
  }

  async userConfirm(req, res) {
    try {
      const { confirmed } = req.body;
      if (typeof confirmed !== 'boolean') {
        return res.status(400).json({ success: false, message: '"confirmed" debe ser true o false' });
      }
      const data = await loanService.userConfirm(req.params.id, req.user.id, confirmed);
      res.json({ success: true, data });
    } catch (e) { res.status(e.status || 500).json({ success: false, message: e.message }); }
  }

  async acceptTerms(req, res) {
    try {
      const data = await loanService.acceptTerms(req.params.id, req.user.id);
      res.json({ success: true, data });
    } catch (e) { res.status(e.status || 500).json({ success: false, message: e.message }); }
  }

  async getMyLoans(req, res) {
    try {
      const data = await loanService.getUserLoans(req.user.id);
      res.json({ success: true, data });
    } catch (e) { res.status(e.status || 500).json({ success: false, message: e.message }); }
  }
}

module.exports = new LoanController();