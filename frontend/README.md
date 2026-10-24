# NIDO - Frontend (Angular 21) 🎨

Interfaz de usuario moderna, reactiva y elegante para **NIDO: Organización e Inventario Doméstico**, construida con **Angular 21 Standalone Components**, sistema de diseño en **SCSS con CSS Tokens**, y gestión de estado con **Angular Signals**.

---

## ⚡ Tecnologías Principales

- **Framework**: Angular 21 (Standalone Components & Signals).
- **Enrutador**: Angular Router con `authGuard` funcional.
- **Estilos**: Vanilla SCSS modular con Design Tokens (variables CSS HSL, diseño responsive, microinteracciones).
- **Cliente HTTP**: Angular `HttpClient` con interceptores de credenciales y cookies `JSESSIONID`.
- **Inteligencia Artificial**: Asistente conversacional multi-modelo integrado con la API de Google Gemini (Flash 2.0 / 1.5).
- **Testing**: Vitest + Angular Build Unit Test runner.

---

## 📂 Estructura del Código Fuente

```text
frontend/src/
├── app/
│   ├── components/         # Vistas y componentes funcionales
│   │   ├── ai-assistant/   # Panel flotante del asistente IA Gemini
│   │   ├── categories/     # Gestión de categorías de productos
│   │   ├── clothing/       # Armario Sostenible (ropa sin uso y venta)
│   │   ├── dashboard/      # Panel principal y métricas en tiempo real
│   │   ├── inventory/      # Gestión de productos, stock y movimientos
│   │   ├── locations/      # Explorador de ubicaciones jerárquicas
│   │   ├── login/          # Autenticación de usuarios
│   │   ├── recipes/        # Recomendador inteligente de recetas
│   │   ├── register/       # Registro de nuevos usuarios
│   │   └── shopping/       # Lista de la compra y reposición directa
│   ├── guards/             # Protección de rutas (auth.guard.ts)
│   ├── models/             # Tipado TypeScript (nido.models.ts, user.ts, category.ts)
│   └── services/           # Servicios HTTP y estado reactivo
├── styles.scss             # Sistema de diseño global y variables CSS
└── main.ts                 # Bootstrap de la aplicación standalone
```

---

## 🚀 Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo con proxy a la API (localhost:4200 -> localhost:8080)
npm start

# Compilación de producción (archivos optimizados en dist/nido-frontend/browser)
npm run build

# Ejecutar pruebas unitarias interactivas
npm test

# Ejecutar pruebas en modo CI (ejecución única para pipelines)
npm run test:ci
```

---

## 🔌 Configuración del Proxy de Desarrollo

Las peticiones al backend `/api/**` se redirigen automáticamente mediante `proxy.conf.json` a `http://localhost:8080`:

```json
{
  "/api": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true
  }
}
```
Esto permite trabajar en desarrollo evitando problemas de CORS y asegurando la persistencia de la cookie de sesión (`JSESSIONID`).
