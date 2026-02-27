const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    descripcion: { type: String, required: true },
    precio: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0 },
    categoria: { type: mongoose.Schema.Types.ObjectId, ref: 'Categoria', required: true },
    proveedor: { type: mongoose.Schema.Types.ObjectId, ref: 'Proveedor', required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Producto', productoSchema);
