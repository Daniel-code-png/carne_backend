require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../modules/user/models/User');
const Equipment = require('../modules/equipment/models/Equipment');

const testUsers = [
  {
    name: 'María García López',
    document: '1001234567',
    email: 'maria.garcia@universidad.edu.co',
    phone: '300 123 4567',
    role: 'estudiante',
    career: 'Ingeniería de Sistemas',
    password: '1001234567',
    firstLogin: true,
    photo: 'https://i.pravatar.cc/300?img=47',
    theme: 'kawaii',
  },
  {
    name: 'Carlos Rodríguez Mejía',
    document: '2009876543',
    email: 'carlos.rodriguez@universidad.edu.co',
    phone: '310 987 6543',
    role: 'docente',
    career: 'Docente de Matemáticas',
    password: '2009876543',
    firstLogin: true,
    photo: 'https://i.pravatar.cc/300?img=12',
    theme: 'institucional',
  },
  {
    name: 'Ana Martínez Torres',
    document: '3005551234',
    email: 'ana.martinez@universidad.edu.co',
    phone: '320 555 1234',
    role: 'administrativo',
    career: 'Coordinadora Académica',
    password: '3005551234',
    firstLogin: false,
    photo: 'https://i.pravatar.cc/300?img=32',
    theme: 'dark',
  },
  {
    name: 'Admin Sistema',
    document: '9999999999',
    email: 'admin@universidad.edu.co',
    phone: '300 000 0000',
    role: 'admin',
    career: 'Administrador del Sistema',
    password: 'admin123',
    firstLogin: false,
    photo: '',
    theme: 'institucional',
  },
];

const testEquipment = [
  { name: 'Laptop Dell Inspiron 15', code: 'LAP-001', category: 'laptop', description: 'Laptop para uso académico', status: 'disponible' },
  { name: 'Laptop HP Pavilion', code: 'LAP-002', category: 'laptop', description: 'Laptop para presentaciones', status: 'disponible' },
  { name: 'Proyector Epson X41', code: 'PRO-001', category: 'proyector', description: 'Proyector 3500 lúmenes', status: 'disponible' },
  { name: 'Proyector BenQ MH535', code: 'PRO-002', category: 'proyector', description: 'Proyector Full HD', status: 'disponible' },
  { name: 'Cable HDMI 3m', code: 'CAB-001', category: 'cable', description: 'Cable HDMI de 3 metros', status: 'disponible' },
  { name: 'Tablet Samsung A8', code: 'TAB-001', category: 'tablet', description: 'Tablet para laboratorio', status: 'disponible' },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    await User.deleteMany({});
    await Equipment.deleteMany({});
    console.log('🗑️  Colecciones limpiadas');

    const users = await User.create(testUsers);
    console.log(`✅ ${users.length} usuarios creados`);

    const equipment = await Equipment.create(testEquipment);
    console.log(`✅ ${equipment.length} equipos creados`);

    console.log('\n🔑 Credenciales de prueba:');
    console.log('   Admin:    9999999999 / admin123');
    console.log('   Estudiante: 1001234567 / 1001234567 (primer login)');
    console.log('   Docente:  2009876543 / 2009876543 (primer login)');
    console.log('   Admin2:   3005551234 / 3005551234');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error en seed:', error.message);
    process.exit(1);
  }
};

seed();