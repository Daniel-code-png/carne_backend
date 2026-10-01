const University = require('../models/University')
const User       = require('../../user/models/User')
const s3Service  = require('../../notifications/services/s3Service')
const bcrypt     = require('bcryptjs')

class UniversityService {
  async getAll(filters = {}) {
    const query = {}
    if (filters.search) query.name = { $regex: filters.search, $options: 'i' }
    if (filters.isActive !== undefined) query.isActive = filters.isActive === 'true'
    return University.find(query).sort({ createdAt: -1 })
  }

  async getById(id) {
    const u = await University.findById(id)
    if (!u) throw { status: 404, message: 'Universidad no encontrada' }
    return u
  }

  async getBySlug(slug) {
    const u = await University.findOne({ slug })
    if (!u) throw { status: 404, message: 'Universidad no encontrada' }
    return u
  }

  async create({ name, slug, email, phone, address, city, country, primaryColor, secondaryColor, website, adminName, adminDocument, adminEmail }, logoPath) {
    // Verificar slug único
    const existing = await University.findOne({ slug: slug.toLowerCase() })
    if (existing) throw { status: 409, message: `El slug "${slug}" ya está en uso` }

    // Subir logo a S3 si viene
    let logoUrl = ''
    if (logoPath) {
      logoUrl = await s3Service.uploadLogo(logoPath, slug.toLowerCase())
    }

    const university = await University.create({
      name, slug: slug.toLowerCase(),
      email, phone, address, city,
      country: country || 'Colombia',
      primaryColor:   primaryColor   || '#1a3a6b',
      secondaryColor: secondaryColor || '#FFD700',
      website, logo: logoUrl,
      domain: `${slug.toLowerCase()}.carnetdigital.com`,
    })

    // Crear admin de la universidad automáticamente
    if (adminName && adminDocument && adminEmail) {
      await User.create({
        university: university._id,
        name:       adminName,
        document:   adminDocument,
        email:      adminEmail.toLowerCase(),
        role:       'admin',
        password:   adminDocument,
        firstLogin: true,
        career:     'Administrador del Sistema',
      })
    }

    return university
  }

  async update(id, data, logoPath) {
    const university = await University.findById(id)
    if (!university) throw { status: 404, message: 'Universidad no encontrada' }

    if (logoPath) {
      if (university.logo) await s3Service.deletePhoto(university.logo)
      data.logo = await s3Service.uploadLogo(logoPath, university.slug)
    }

    return University.findByIdAndUpdate(id, data, { new: true })
  }

  async toggleActive(id) {
    const u = await University.findById(id)
    if (!u) throw { status: 404, message: 'Universidad no encontrada' }
    u.isActive = !u.isActive
    await u.save()
    return u
  }

  async getStats(id) {
    const [users, equipment, loans] = await Promise.all([
      User.countDocuments({ university: id }),
      require('../../equipment/models/Equipment').countDocuments({ university: id }),
      require('../../loans/models/Loan').countDocuments({ university: id }),
    ])
    return { users, equipment, loans }
  }
}

const universityService = new UniversityService()

// Controller inline
const universityController = {
  async getAll(req, res) {
    try { res.json({ success: true, data: await universityService.getAll(req.query) }) }
    catch (e) { res.status(e.status || 500).json({ success: false, message: e.message }) }
  },
  async getById(req, res) {
    try { res.json({ success: true, data: await universityService.getById(req.params.id) }) }
    catch (e) { res.status(e.status || 500).json({ success: false, message: e.message }) }
  },
  async create(req, res) {
    try { res.status(201).json({ success: true, data: await universityService.create(req.body, req.file?.path) }) }
    catch (e) { res.status(e.status || 500).json({ success: false, message: e.message }) }
  },
  async update(req, res) {
    try { res.json({ success: true, data: await universityService.update(req.params.id, req.body, req.file?.path) }) }
    catch (e) { res.status(e.status || 500).json({ success: false, message: e.message }) }
  },
  async toggleActive(req, res) {
    try { res.json({ success: true, data: await universityService.toggleActive(req.params.id) }) }
    catch (e) { res.status(e.status || 500).json({ success: false, message: e.message }) }
  },
  async getStats(req, res) {
    try { res.json({ success: true, data: await universityService.getStats(req.params.id) }) }
    catch (e) { res.status(e.status || 500).json({ success: false, message: e.message }) }
  },
}

module.exports = { universityService, universityController }