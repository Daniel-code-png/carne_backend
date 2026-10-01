require('dotenv').config()
const mongoose   = require('mongoose')
const University = require('../modules/universites/models/University')
const User       = require('../modules/user/models/User')

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('✅ MongoDB conectado')

  await University.deleteMany({})
  await User.deleteMany({})
  console.log('🗑️  Colecciones limpiadas')

  // ── Superadmin (sin universidad) ───────────────────────────
  await User.create({
    name:       'Super Administrador',
    document:   '0000000000',
    email:      'superadmin@carnetdigital.com',
    role:       'superadmin',
    password:   'superadmin123',
    firstLogin: false,
    career:     'Super Administrador de la Plataforma',
  })
  console.log('✅ Superadmin creado — 0000000000 / superadmin123')

  // ── Universidad de prueba ──────────────────────────────────
  const uni = await University.create({
    name:           'Universidad Católica',
    slug:           'unicatolica',
    domain:         'unicatolica.carnetdigital.com',
    email:          'info@unicatolica.edu.co',
    phone:          '(601) 327 7300',
    address:        'Av. Caracas #46-72',
    city:           'Bogotá',
    country:        'Colombia',
    primaryColor:   '#1a3a6b',
    secondaryColor: '#FFD700',
    plan:           'pro',
  })
  console.log(`✅ Universidad creada: ${uni.name} (slug: ${uni.slug})`)

  // ── Admin de la universidad ────────────────────────────────
  await User.create({
    university: uni._id,
    name:       'Administrador UniCatólica',
    document:   '9999999999',
    email:      'admin@unicatolica.edu.co',
    role:       'admin',
    password:   'admin123',
    firstLogin: false,
    career:     'Administrador del Sistema',
  })

  // ── Usuarios de prueba ─────────────────────────────────────
  const testUsers = [
    { name: 'María García López',    document: '1001234567', email: 'maria.garcia@unicatolica.edu.co',    role: 'estudiante',    career: 'Ingeniería de Sistemas',  firstLogin: true  },
    { name: 'Carlos Rodríguez Mejía',document: '2009876543', email: 'carlos.rodriguez@unicatolica.edu.co',role: 'docente',       career: 'Docente de Matemáticas', firstLogin: true  },
    { name: 'Ana Martínez Torres',   document: '3005551234', email: 'ana.martinez@unicatolica.edu.co',    role: 'administrativo',career: 'Coordinadora Académica', firstLogin: false },
    { name: 'Pedro Guardia',         document: '4001112222', email: 'pedro.guardia@unicatolica.edu.co',   role: 'guardia',       career: 'Guardia de Seguridad',   firstLogin: false },
  ]

  for (const u of testUsers) {
    await User.create({ university: uni._id, password: u.document, ...u })
  }
  console.log(`✅ ${testUsers.length + 1} usuarios creados para ${uni.name}`)

  console.log('\n🔑 Credenciales:')
  console.log('   Superadmin:  0000000000 / superadmin123')
  console.log('   Admin uni:   9999999999 / admin123      (header: unicatolica)')
  console.log('   Estudiante:  1001234567 / 1001234567    (header: unicatolica)')
  console.log('   Guardia:     4001112222 / 4001112222    (header: unicatolica)')
  console.log('\n📱 En Postman/app agregar header: X-University-Slug: unicatolica')

  process.exit(0)
}

seed().catch(e => { console.error(e); process.exit(1) })