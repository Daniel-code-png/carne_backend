/**
 * Seed de base de datos — Usuarios de prueba.
 * Ejecutar: npm run seed
 *
 * Contraseña por defecto = cédula (firstLogin: true)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../modules/user/models/User');

const testUsers = [
  {
    name: 'María García López',
    document: '1001234567',
    email: 'maria.garcia@universidad.edu.co',
    phone: '3001234567',
    role: 'estudiante',
    career: 'Ingeniería de Sistemas',
    password: '1001234567', // Contraseña = cédula (se encripta en el hook)
    firstLogin: true,
    photo: 'https://i.pravatar.cc/300?img=47',
    theme: 'kawaii',
  },
  {
    name: 'Carlos Rodríguez Mejía',
    document: '2009876543',
    email: 'carlos.rodriguez@universidad.edu.co',
    phone: '3109876543',
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
    phone: '3205551234',
    role: 'administrativo',
    career: 'Coordinadora Académica',
    password: '3005551234',
    firstLogin: false, // Este usuario ya cambió su contraseña
    photo: 'https://i.pravatar.cc/300?img=32',
    theme: 'dark',
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Limpiar usuarios existentes
    await User.deleteMany({});
    console.log('🗑️  Colección de usuarios limpiada');

    // Crear usuarios (el hook pre-save encripta las contraseñas)
    const created = await User.create(testUsers);
    console.log(`✅ ${created.length} usuarios creados:`);

    created.forEach((u) => {
      console.log(`   📋 ${u.name} | Cédula: ${u.document} | Rol: ${u.role}`);
    });

    console.log('\n🔑 Credenciales de prueba:');
    console.log('   Cédula: 1001234567 | Contraseña: 1001234567 (debe cambiarla)');
    console.log('   Cédula: 2009876543 | Contraseña: 2009876543 (debe cambiarla)');
    console.log('   Cédula: 3005551234 | Contraseña: 3005551234 (ya activo)');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error en seed:', error.message);
    process.exit(1);
  }
};

seed();