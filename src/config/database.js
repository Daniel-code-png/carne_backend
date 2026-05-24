const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error conectando a MongoDB: ${error.message}`);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => console.warn('⚠️  MongoDB desconectado'));
mongoose.connection.on('reconnected', () => console.log('🔄 MongoDB reconectado'));

module.exports = connectDB;