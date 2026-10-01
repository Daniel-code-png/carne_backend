const User      = require('../models/User')
const s3Service = require('../../notifications/services/s3Service')
const emailService = require('../../notifications/email/emailService')
const xlsx      = require('xlsx')
const fs        = require('fs')

class UserManagementService {
  VALID_ROLES = require('../models/User').ROLES

  // ── Crear usuario ────────────────────────────────────────────
  async createOne({ universityId, universitySlug, name, document, email, phone, role, career, sendEmail = true }, photoPath) {
    if (!name || !document || !email || !role) {
      throw { status: 400, message: 'Nombre, cédula, correo y rol son obligatorios' }
    }
    if (!this.VALID_ROLES.includes(role)) {
      throw { status: 400, message: `Rol inválido` }
    }

    const existingDoc   = await User.findOne({ university: universityId, document })
    const existingEmail = await User.findOne({ university: universityId, email: email.toLowerCase() })
    if (existingDoc)   throw { status: 409, message: `Ya existe un usuario con la cédula ${document}` }
    if (existingEmail) throw { status: 409, message: `Ya existe un usuario con el correo ${email}` }

    // Subir foto a S3 si viene
    let photoUrl = ''
    if (photoPath) {
      photoUrl = await s3Service.uploadPhoto(photoPath, universitySlug)
    }

    const user = await User.create({
      university: universityId,
      name: name.trim(),
      document: document.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || '',
      role,
      career: career?.trim() || '',
      photo: photoUrl,
      password: document.trim(),
      firstLogin: true,
    })

    if (sendEmail) {
      await emailService.sendWelcome({
        name: user.name, email: user.email,
        document: user.document, role: user.role,
      })
    }

    return user.toSafeObject()
  }

  // ── Importar CSV/Excel ───────────────────────────────────────
  async bulkImport(filePath, universityId, universitySlug, sendEmails = true) {
    const workbook = xlsx.readFile(filePath)
    const sheet    = workbook.Sheets[workbook.SheetNames[0]]
    const rawRows  = xlsx.utils.sheet_to_json(sheet, { defval: '' })
    try { fs.unlinkSync(filePath) } catch {}

    const result = { created: [], skipped: [], errors: [], emails: { sent: 0, failed: 0 }, total: rawRows.length }

    const allDocs   = rawRows.map(r => String(r.document || r.cédula || r.cedula || '').trim())
    const allEmails = rawRows.map(r => String(r.email || r.correo || '').trim().toLowerCase())

    const existingDocs   = await User.find({ university: universityId, document: { $in: allDocs }  }).select('document')
    const existingEmails = await User.find({ university: universityId, email:    { $in: allEmails } }).select('email')

    const existingDocSet   = new Set(existingDocs.map(u => u.document))
    const existingEmailSet = new Set(existingEmails.map(u => u.email))
    const processedDocs    = new Set()
    const processedEmails  = new Set()

    for (let i = 0; i < rawRows.length; i++) {
      const rowNum = i + 2
      const raw    = rawRows[i]

      const data = {
        name:     String(raw.name     || raw.nombre   || '').trim(),
        document: String(raw.document || raw.cédula   || raw.cedula || '').trim(),
        email:    String(raw.email    || raw.correo   || '').trim().toLowerCase(),
        phone:    String(raw.phone    || raw.telefono || '').trim(),
        role:     String(raw.role     || raw.rol      || '').trim().toLowerCase(),
        career:   String(raw.career   || raw.carrera  || '').trim(),
        photo:    String(raw.photo    || '').trim(),
      }

      // Validar requeridos
      const missing = ['name','document','email','role'].filter(f => !data[f])
      if (missing.length > 0) {
        result.errors.push({ row: rowNum, data, reason: `Campos vacíos: ${missing.join(', ')}` })
        continue
      }

      // Validar rol
      if (!this.VALID_ROLES.includes(data.role)) {
        result.errors.push({ row: rowNum, data, reason: `Rol "${data.role}" inválido` })
        continue
      }

      // Duplicados
      if (existingDocSet.has(data.document) || processedDocs.has(data.document)) {
        result.skipped.push({ row: rowNum, document: data.document, name: data.name, reason: 'Cédula ya existe' })
        continue
      }
      if (existingEmailSet.has(data.email) || processedEmails.has(data.email)) {
        result.skipped.push({ row: rowNum, document: data.document, name: data.name, reason: 'Correo ya existe' })
        continue
      }

      try {
        const user = await User.create({
          university: universityId,
          name:       data.name,
          document:   data.document,
          email:      data.email,
          phone:      data.phone,
          role:       data.role,
          career:     data.career,
          photo:      data.photo,
          password:   data.document,
          firstLogin: true,
        })

        processedDocs.add(data.document)
        processedEmails.add(data.email)
        result.created.push({ name: user.name, document: user.document, email: user.email })

        if (sendEmails) {
          const sent = await emailService.sendWelcome({
            name: user.name, email: user.email,
            document: user.document, role: user.role,
          })
          if (sent) result.emails.sent++
          else result.emails.failed++
        }
      } catch (error) {
        result.errors.push({ row: rowNum, data, reason: error.message })
      }
    }

    return result
  }

  // ── Actualizar ───────────────────────────────────────────────
  async updateOne(id, universityId, data, photoPath, universitySlug) {
    const user = await User.findOne({ _id: id, university: universityId })
    if (!user) throw { status: 404, message: 'Usuario no encontrado' }

    if (data.email && data.email.toLowerCase() !== user.email) {
      const existing = await User.findOne({ university: universityId, email: data.email.toLowerCase(), _id: { $ne: id } })
      if (existing) throw { status: 409, message: `El correo ya está en uso` }
    }

    let photoUrl = undefined
    if (photoPath) {
      if (user.photo) await s3Service.deletePhoto(user.photo)
      photoUrl = await s3Service.uploadPhoto(photoPath, universitySlug)
    }

    return User.findByIdAndUpdate(id, {
      ...(data.name     && { name: data.name }),
      ...(data.email    && { email: data.email.toLowerCase() }),
      ...(data.phone    !== undefined && { phone: data.phone }),
      ...(data.role     && { role: data.role }),
      ...(data.career   !== undefined && { career: data.career }),
      ...(data.isActive !== undefined && { isActive: data.isActive === 'true' || data.isActive === true }),
      ...(photoUrl      !== undefined && { photo: photoUrl }),
    }, { new: true, select: '-password' })
  }

  async toggleActive(id, universityId) {
    const user = await User.findOne({ _id: id, university: universityId })
    if (!user) throw { status: 404, message: 'Usuario no encontrado' }
    user.isActive = !user.isActive
    await user.save()
    return { isActive: user.isActive }
  }

  async resetPassword(id, universityId) {
    const user = await User.findOne({ _id: id, university: universityId }).select('+password')
    if (!user) throw { status: 404, message: 'Usuario no encontrado' }
    user.password   = user.document
    user.firstLogin = true
    await user.save()
    await emailService.sendWelcome({ name: user.name, email: user.email, document: user.document, role: user.role })
    return { message: 'Contraseña restablecida' }
  }

  async getAll(universityId, { search, role, isActive, page = 1, limit = 50 }) {
    const query = { university: universityId }
    if (search) {
      query.$or = [
        { name:     { $regex: search, $options: 'i' } },
        { document: { $regex: search, $options: 'i' } },
        { email:    { $regex: search, $options: 'i' } },
      ]
    }
    if (role)     query.role     = role
    if (isActive !== undefined && isActive !== '') query.isActive = isActive === 'true'

    const total = await User.countDocuments(query)
    const users = await User.find(query).select('-password').sort({ createdAt: -1 })
      .skip((page - 1) * limit).limit(Number(limit))

    return { users, total, page: Number(page), pages: Math.ceil(total / limit) }
  }

  generateTemplate() {
    const xlsx2 = require('xlsx')
    const ws = xlsx2.utils.aoa_to_sheet([
      ['name','document','email','phone','role','career'],
      ['María García López','1001234567','maria@universidad.edu.co','3001234567','estudiante','Ingeniería de Sistemas'],
      ['Carlos Rodríguez','2009876543','carlos@universidad.edu.co','3109876543','docente','Docente de Matemáticas'],
    ])
    ws['!cols'] = [{ wch: 25 },{ wch: 15 },{ wch: 32 },{ wch: 14 },{ wch: 20 },{ wch: 25 }]
    const wb = xlsx2.utils.book_new()
    xlsx2.utils.book_append_sheet(wb, ws, 'Usuarios')
    return xlsx2.write(wb, { type: 'buffer', bookType: 'xlsx' })
  }
}

module.exports = new UserManagementService()