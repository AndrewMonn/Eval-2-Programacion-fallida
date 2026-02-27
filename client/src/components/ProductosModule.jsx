import { useEffect, useState } from 'react';

const API_URL = 'http://localhost:5000/api/productos';

const initialForm = {
  nombre: '',
  descripcion: '',
  precio: '',
  stock: '',
  categoria: '',
  proveedor: ''
};

function ProductosModule() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [soloBajos, setSoloBajos] = useState(false);
  const [formData, setFormData] = useState(initialForm);

  const fetchProductos = async (bajos = false) => {
    setLoading(true);
    setError('');
    try {
      const endpoint = bajos ? `${API_URL}/bajos` : API_URL;
      const res = await fetch(endpoint);
      if (!res.ok) {
        throw new Error('No se pudo obtener la información');
      }
      const data = await res.json();
      setProductos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos(false);
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData(initialForm);
    setShowModal(true);
  };

  const openEditModal = (producto) => {
    setEditingId(producto._id);
    setFormData({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      stock: producto.stock,
      categoria: producto.categoria?._id || '',
      proveedor: producto.proveedor?._id || ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData(initialForm);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      ...formData,
      precio: Number(formData.precio),
      stock: Number(formData.stock)
    };

    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${API_URL}/${editingId}` : API_URL;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.mensaje || 'Error al guardar');
      }

      closeModal();
      await fetchProductos(soloBajos);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    const confirmar = window.confirm('¿Seguro que deseas eliminar este producto?');
    if (!confirmar) return;

    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('No se pudo eliminar el producto');
      await fetchProductos(soloBajos);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFilterToggle = async () => {
    const nuevoEstado = !soloBajos;
    setSoloBajos(nuevoEstado);
    await fetchProductos(nuevoEstado);
  };

  return (
    <section className="rounded-xl bg-white p-6 shadow">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-dark">Módulo de Productos</h2>
        <div className="flex gap-2">
          <button
            onClick={handleFilterToggle}
            className="rounded bg-dark px-4 py-2 text-white hover:opacity-90"
          >
            {soloBajos ? 'Ver todos' : 'Stock bajo (<10)'}
          </button>
          <button onClick={openCreateModal} className="rounded bg-primary px-4 py-2 text-white hover:opacity-90">
            + Nuevo producto
          </button>
        </div>
      </div>

      {error && <p className="mb-4 rounded bg-red-100 px-3 py-2 text-sm text-red-700">{error}</p>}

      {loading ? (
        <p className="text-slate-600">Cargando productos...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-slate-200">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-3 py-2 text-left">Nombre</th>
                <th className="px-3 py-2 text-left">Precio</th>
                <th className="px-3 py-2 text-left">Stock</th>
                <th className="px-3 py-2 text-left">Categoría</th>
                <th className="px-3 py-2 text-left">Proveedor</th>
                <th className="px-3 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((producto) => (
                <tr key={producto._id} className="border-t">
                  <td className="px-3 py-2">{producto.nombre}</td>
                  <td className="px-3 py-2">${producto.precio}</td>
                  <td className={`px-3 py-2 ${producto.stock < 10 ? 'font-bold text-red-600' : ''}`}>
                    {producto.stock}
                  </td>
                  <td className="px-3 py-2">{producto.categoria?.nombre || 'Sin categoría'}</td>
                  <td className="px-3 py-2">{producto.proveedor?.nombre || 'Sin proveedor'}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(producto)}
                        className="rounded bg-amber-500 px-3 py-1 text-sm text-white"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(producto._id)}
                        className="rounded bg-red-600 px-3 py-1 text-sm text-white"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {productos.length === 0 && (
                <tr>
                  <td className="px-3 py-4 text-center text-slate-500" colSpan="6">
                    No hay productos para mostrar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-dark">
              {editingId ? 'Editar Producto' : 'Agregar Producto'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                className="w-full rounded border px-3 py-2"
                placeholder="Nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                required
              />
              <textarea
                className="w-full rounded border px-3 py-2"
                placeholder="Descripción"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  className="w-full rounded border px-3 py-2"
                  placeholder="Precio"
                  name="precio"
                  type="number"
                  min="0"
                  value={formData.precio}
                  onChange={handleInputChange}
                  required
                />
                <input
                  className="w-full rounded border px-3 py-2"
                  placeholder="Stock"
                  name="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <input
                className="w-full rounded border px-3 py-2"
                placeholder="ID Categoría"
                name="categoria"
                value={formData.categoria}
                onChange={handleInputChange}
                required
              />
              <input
                className="w-full rounded border px-3 py-2"
                placeholder="ID Proveedor"
                name="proveedor"
                value={formData.proveedor}
                onChange={handleInputChange}
                required
              />

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={closeModal} className="rounded border px-4 py-2">
                  Cancelar
                </button>
                <button type="submit" className="rounded bg-primary px-4 py-2 text-white">
                  {editingId ? 'Guardar cambios' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default ProductosModule;
