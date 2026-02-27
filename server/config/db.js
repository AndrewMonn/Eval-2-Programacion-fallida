const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    const clientOptions = {
      serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true
      }
    };

    if (!uri || typeof uri !== 'string') {
      throw new Error(
        'MONGODB_URI no está definida. Crea server/.env con MONGODB_URI=mongodb+srv://andrewmonn_dev:<db_password>@cluster-andrew.dl98kgx.mongodb.net/techinventory?retryWrites=true&w=majority&appName=Cluster-Andrew'
      );
    }

    await mongoose.connect(uri, clientOptions);
    console.log('✅ MongoDB conectada correctamente');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
