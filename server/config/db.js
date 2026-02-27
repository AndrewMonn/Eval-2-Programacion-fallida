const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  const directUri = process.env.MONGODB_URI_DIRECT;
  const clientOptions = {
    serverApi: {
      version: '1',
      strict: true,
      deprecationErrors: true
    }
  };

  if (!uri || typeof uri !== 'string') {
    console.error(
      '❌ MONGODB_URI no está definida. Configura server/.env con tu cadena de conexión de MongoDB Atlas.'
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, clientOptions);
    console.log('✅ MongoDB conectada correctamente usando MONGODB_URI (SRV).');
  } catch (error) {
    const isSrvDnsError =
      typeof error?.message === 'string' &&
      (error.message.includes('querySrv ECONNREFUSED') || error.message.includes('ENOTFOUND'));

    if (isSrvDnsError && directUri) {
      try {
        console.warn('⚠️ Falló la resolución SRV. Intentando conexión directa con MONGODB_URI_DIRECT...');
        await mongoose.connect(directUri, clientOptions);
        console.log('✅ MongoDB conectada correctamente usando MONGODB_URI_DIRECT.');
        return;
      } catch (fallbackError) {
        console.error('❌ Error con MONGODB_URI_DIRECT:', fallbackError.message);
        process.exit(1);
      }
    }

    console.error('❌ Error conectando a MongoDB:', error.message);
    if (isSrvDnsError) {
      console.error(
        '💡 Tu red/DNS está bloqueando consultas SRV. Usa MONGODB_URI_DIRECT en server/.env con el formato mongodb://host1,host2,host3/... de Atlas.'
      );
    }
    process.exit(1);
  }
};

module.exports = connectDB;
