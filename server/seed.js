const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Categoria = require('./models/Categoria');
const Producto = require('./models/Producto');
const Cliente = require('./models/Cliente');
const Proveedor = require('./models/Proveedor');
const Venta = require('./models/Venta');

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    await Promise.all([
      Categoria.deleteMany({}),
      Producto.deleteMany({}),
      Cliente.deleteMany({}),
      Proveedor.deleteMany({}),
      Venta.deleteMany({})
    ]);

    const categorias = await Categoria.insertMany([
      { nombre: 'Laptops', descripcion: 'Portátiles para trabajo y gaming', activa: true, codigo: 'CAT-LAP' },
      { nombre: 'Periféricos', descripcion: 'Mouse, teclados y accesorios', activa: true, codigo: 'CAT-PER' },
      { nombre: 'Monitores', descripcion: 'Pantallas y monitores LED', activa: true, codigo: 'CAT-MON' },
      { nombre: 'Redes', descripcion: 'Equipos y accesorios de red', activa: true, codigo: 'CAT-RED' }
    ]);

    const proveedores = await Proveedor.insertMany([
      { nombre: 'TechNova', telefono: '555-1001', email: 'ventas@technova.com', direccion: 'Av. Central 123' },
      { nombre: 'CompuGlobal', telefono: '555-1002', email: 'contacto@compuglobal.com', direccion: 'Calle 45 #80' },
      { nombre: 'DigitalWare', telefono: '555-1003', email: 'info@digitalware.com', direccion: 'Zona Industrial 12' },
      { nombre: 'Nexa Supplies', telefono: '555-1004', email: 'soporte@nexa.com', direccion: 'Bulevar Norte 77' }
    ]);

    const clientes = await Cliente.insertMany([
      { nombre: 'Ana Martínez', email: 'ana@email.com', telefono: '555-2001', ciudad: 'Ciudad de México' },
      { nombre: 'Luis Gómez', email: 'luis@email.com', telefono: '555-2002', ciudad: 'Monterrey' },
      { nombre: 'Carla Ruiz', email: 'carla@email.com', telefono: '555-2003', ciudad: 'Guadalajara' },
      { nombre: 'Pedro Salas', email: 'pedro@email.com', telefono: '555-2004', ciudad: 'Puebla' }
    ]);

    const productos = await Producto.insertMany([
      {
        nombre: 'Laptop Pro 14',
        descripcion: 'Laptop de alto rendimiento 16GB RAM',
        precio: 28000,
        stock: 7,
        categoria: categorias[0]._id,
        proveedor: proveedores[0]._id
      },
      {
        nombre: 'Mouse Inalámbrico X',
        descripcion: 'Mouse ergonómico con sensor óptico',
        precio: 600,
        stock: 35,
        categoria: categorias[1]._id,
        proveedor: proveedores[1]._id
      },
      {
        nombre: 'Monitor 27 4K',
        descripcion: 'Monitor UHD para diseño y edición',
        precio: 8900,
        stock: 5,
        categoria: categorias[2]._id,
        proveedor: proveedores[2]._id
      },
      {
        nombre: 'Router AX3000',
        descripcion: 'Router WiFi 6 de doble banda',
        precio: 2200,
        stock: 12,
        categoria: categorias[3]._id,
        proveedor: proveedores[3]._id
      }
    ]);

    await Venta.insertMany([
      { cliente: clientes[0]._id, producto: productos[0]._id, cantidad: 1, total: 28000 },
      { cliente: clientes[1]._id, producto: productos[1]._id, cantidad: 2, total: 1200 },
      { cliente: clientes[2]._id, producto: productos[2]._id, cantidad: 1, total: 8900 },
      { cliente: clientes[3]._id, producto: productos[3]._id, cantidad: 1, total: 2200 }
    ]);

    console.log('✅ Seed completado: 4 documentos en cada colección.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  }
};

seedData();
