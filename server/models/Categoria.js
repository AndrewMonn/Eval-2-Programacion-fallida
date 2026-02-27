const mongoose = require('mongoose');

const categoriaSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    descripcion: { type: String, required: true },
    activa: { type: Boolean, default: true },
    codigo: { type: String, required: true, unique: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Categoria', categoriaSchema);
