const mongoose = require('mongoose');
 
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Opciones preparadas para producción
    });
    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error conectando a MongoDB: ${error.message}`);
    process.exit(1);
  }
};
 
// Eventos de conexión para monitoreo futuro
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB desconectado');
});
 
mongoose.connection.on('reconnected', () => {
  console.log('🔄 MongoDB reconectado');
});
 
module.exports = connectDB;