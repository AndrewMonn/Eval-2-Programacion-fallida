# Tech-Inventory Pro

Tech-Inventory Pro es una aplicación **Full Stack MERN** para la gestión de inventario tecnológico. Permite administrar productos con un CRUD completo, detectar artículos con bajo stock y mantener una base inicial de datos relacionada con categorías, proveedores, clientes y ventas.

## Stack tecnológico

- **Frontend:** React + Vite + TailwindCSS
- **Backend:** Node.js + Express
- **Base de datos:** MongoDB Atlas + Mongoose
- **Ejecución unificada:** `concurrently` desde la raíz con `npm start`

## Estructura del proyecto

```bash
Tech-Inventory-Pro/
├── client/        # Frontend React + Tailwind
├── server/        # API Express + Mongoose
├── package.json   # Script único para ejecutar cliente y servidor
└── README.md
```

## 1) Clonar el proyecto

```bash
git clone <URL_DEL_REPOSITORIO>
cd Tech-Inventory-Pro
```

## 2) Instalar dependencias

> Instala dependencias en la raíz, en el servidor y en el cliente.

```bash
npm install
npm install --prefix server
npm install --prefix client
```

## 3) Configurar variables de entorno

1. Copia el archivo de ejemplo:

```bash
cp server/.env.example server/.env
```

2. Edita `server/.env` y configura los valores:

```env
PORT=5000
MONGODB_URI=mongodb+srv://andrewmonn_dev:<db_password>@cluster-andrew.dl98kgx.mongodb.net/techinventory?retryWrites=true&w=majority&appName=Cluster-Andrew
```

> Reemplaza `<db_password>` por tu contraseña real de MongoDB Atlas.

## 4) Poblar la base de datos (seed)

Este comando inserta **exactamente 4 documentos** en cada colección: `Categoria`, `Producto`, `Cliente`, `Proveedor` y `Venta`.

```bash
npm run seed --prefix server
```

## 5) Ejecutar el proyecto completo (comando único)

Desde la raíz:

```bash
npm start
```

Esto levantará:

- API backend en: `http://localhost:5000`
- Frontend en: `http://localhost:5173`

## API disponible de Productos

Base URL: `http://localhost:5000/api/productos`

- `GET /` → Listar productos
- `GET /bajos` → Listar productos con `stock < 10`
- `GET /:id` → Obtener producto por ID
- `POST /` → Crear producto
- `PUT /:id` → Actualizar producto
- `DELETE /:id` → Eliminar producto

## Módulo de Productos en frontend

`ProductosModule.jsx` incluye:

- Tabla de productos
- Modal para agregar/editar
- Botón para eliminar
- Filtro para consultar productos con bajo stock (`/bajos`)

## Notas importantes

- El formulario de productos solicita los IDs de `categoria` y `proveedor` para crear/editar registros.
- Asegúrate de ejecutar el seed antes de usar el CRUD para tener datos relacionados válidos.


## Solución al error común de conexión

Si ves el error:

```
The `uri` parameter to `openUri()` must be a string, got "undefined"
```

significa que **`MONGODB_URI` no fue cargada**. Verifica lo siguiente:

1. Ejecutaste `cp server/.env.example server/.env`.
2. En `server/.env` existe la variable `MONGODB_URI` (sin comillas).
3. Reemplazaste `<db_password>` por la contraseña real del usuario `andrewmonn_dev`.
4. Estás iniciando desde la raíz con `npm start` o el backend con `npm run dev --prefix server`.

Ejemplo válido en `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://andrewmonn_dev:TU_PASSWORD@cluster-andrew.dl98kgx.mongodb.net/techinventory?retryWrites=true&w=majority&appName=Cluster-Andrew
```



## Solución para `querySrv ECONNREFUSED _mongodb._tcp...`

Si ya configuraste usuario/contraseña y ahora aparece:

```
Error conectando a MongoDB: querySrv ECONNREFUSED _mongodb._tcp.cluster-andrew.dl98kgx...
```

el problema suele ser de **DNS/red** (tu entorno no puede resolver registros SRV de `mongodb+srv`).

### Opción A (recomendada): usar fallback directo

1. Entra a MongoDB Atlas → **Connect** → **Drivers**.
2. Copia la cadena **Standard connection string (mongodb://...)** (no SRV).
3. Pégala en `server/.env` como `MONGODB_URI_DIRECT`.

Ejemplo:

```env
PORT=5000
MONGODB_URI=mongodb+srv://andrewmonn_dev:TU_PASSWORD@cluster-andrew.dl98kgx.mongodb.net/techinventory?retryWrites=true&w=majority&appName=Cluster-Andrew
MONGODB_URI_DIRECT=mongodb://host1:27017,host2:27017,host3:27017/techinventory?replicaSet=atlas-xxxx-shard-0&ssl=true&authSource=admin&retryWrites=true&w=majority
```

La app intentará primero `MONGODB_URI` (SRV) y, si falla por DNS, usará automáticamente `MONGODB_URI_DIRECT`.

### Opción B: ajustar red

- Cambia DNS local a `8.8.8.8` / `1.1.1.1`.
- Si estás en red corporativa, revisa firewall/proxy que bloquee `_mongodb._tcp`.
- Verifica que en Atlas esté permitido tu IP en **Network Access**.
