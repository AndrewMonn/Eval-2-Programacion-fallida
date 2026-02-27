const express = require('express');
const {
  getProductos,
  getProductosBajos,
  getProductoById,
  createProducto,
  updateProducto,
  deleteProducto
} = require('../controllers/productoController');

const router = express.Router();

router.get('/bajos', getProductosBajos);
router.get('/', getProductos);
router.get('/:id', getProductoById);
router.post('/', createProducto);
router.put('/:id', updateProducto);
router.delete('/:id', deleteProducto);

module.exports = router;
