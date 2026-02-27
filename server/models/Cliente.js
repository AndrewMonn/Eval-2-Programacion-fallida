const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    email: { type: String, required: true },
    telefono: { type: String, required: true },
    ciudad: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Cliente', clienteSchema);
