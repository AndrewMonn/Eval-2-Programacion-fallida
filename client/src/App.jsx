import ProductosModule from './components/ProductosModule';

function App() {
  return (
    <div className="min-h-screen bg-slate-100 text-dark">
      <header className="bg-dark text-white shadow">
        <div className="mx-auto max-w-6xl px-4 py-5">
          <h1 className="text-2xl font-bold">Tech-Inventory Pro</h1>
          <p className="text-sm text-slate-300">Gestión inteligente de inventario tecnológico</p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <ProductosModule />
      </main>
    </div>
  );
}

export default App;
