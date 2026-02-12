# Binance Lite Clone — Plataforma de Monitoreo de Criptoactivos en Tiempo Real

Aplicación construida con **Angular 17+** que simula una plataforma tipo Binance en modo oscuro para monitoreo de precios de criptoactivos en tiempo real.

## Características principales

- Arquitectura **Standalone Components** (sin NgModules).
- Estado reactivo con **Angular Signals** (`signal`, `computed`, `effect`).
- UI optimizada con **ChangeDetectionStrategy.OnPush**.
- Conexión real con **WebSocket de Binance**.
- **Fallback simulado** si falla el WebSocket.
- Cálculos de métricas (SMA y volatilidad) en **Web Worker** para no bloquear la UI.
- Directiva personalizada para resaltar cambios de precio al alza/baja.
- Sistema de alertas por umbral de precio.
- Estilos en SCSS con paleta Binance Dark Mode.
- Pruebas unitarias con Jasmine + Karma.

---

## Requisitos previos

Asegúrate de tener instalado:

- **Node.js** 18 o superior
- **npm** 9 o superior

Verifica versiones:

```bash
node -v
npm -v
```

---

## Instalación

1. Clona el repositorio:

```bash
git clone <URL_DEL_REPOSITORIO>
cd Eval-2-Programacion
```

2. Instala las dependencias:

```bash
npm install
```

---

## Ejecución en entorno local (desarrollo)

Inicia el servidor de desarrollo:

```bash
npm start
```

La aplicación quedará disponible por defecto en:

- `http://localhost:4200`

---

## Ejecutar pruebas unitarias

```bash
npm test
```

Esto ejecuta Jasmine + Karma en modo headless (según la configuración del proyecto).

---

## Generar build de producción

```bash
npm run build
```

Los artefactos se generan en:

- `dist/binance-lite-clone`

---

## Despliegue

### Opción 1: Hosting estático (Nginx, Apache, S3, Netlify, Vercel)

1. Genera el build de producción:

```bash
npm run build
```

2. Publica el contenido de `dist/binance-lite-clone/browser` (o la carpeta final generada por tu configuración de Angular) en tu servicio de hosting estático.

3. Configura redirección de rutas SPA para que todas las rutas apunten a `index.html`.

### Opción 2: Docker + Nginx (recomendado para entornos empresariales)

Puedes usar una estrategia de dos etapas:

1. Build con Node.
2. Servir estáticos con Nginx.

Ejemplo base de `Dockerfile`:

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist/binance-lite-clone/browser /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

> Si cambias la configuración de build en `angular.json`, valida la ruta exacta de salida en `dist/`.

---

## Estructura relevante

```text
src/
  app/
    core/
      models/
      services/
    features/
      components/
      dashboard/
    shared/
      directives/
    workers/
```

---

## Notas operativas

- El servicio intenta conectar al stream real de Binance (`wss://stream.binance.com:9443/ws`).
- Si la conexión falla tras varios intentos, activa un simulador de precios en intervalos de 1 segundo.
- Las estadísticas de SMA y volatilidad se calculan en segundo plano mediante worker.

---

## Scripts disponibles

- `npm start` → levanta servidor de desarrollo.
- `npm run build` → compila para producción.
- `npm test` → ejecuta pruebas unitarias.

