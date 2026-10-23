<div align="center">
  <img src="./banner.jpg" alt="NIDO - Smart Domestic Inventory & Household Management" width="100%" />

  <br />

  <p>
    <img src="https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java 21" />
    <img src="https://img.shields.io/badge/Spring_Boot-4.x-6DB33F?style=for-the-badge&logo=spring&logoColor=white" alt="Spring Boot" />
    <img src="https://img.shields.io/badge/Angular-21-DD0031?style=for-the-badge&logo=angular&logoColor=white" alt="Angular 21" />
    <img src="https://img.shields.io/badge/PostgreSQL-17-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Docker_Compose-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker Compose" />
    <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License" />
  </p>

  <p>
    <strong>NIDO</strong> es una solución web <em>Full-Stack</em> moderna, integral e intuitiva diseñada para el control inteligente del hogar: saber qué tienes, cuánto tienes, dónde está almacenado y qué necesitas comprar o cocinar.
  </p>
</div>

---

## 🌟 Características Principales

### 🔐 1. Autenticación y Seguridad Integral
- Registro seguro con cifrado unidireccional de contraseñas mediante **BCrypt**.
- Sesiones seguras HTTP (`JSESSIONID`) orquestadas con **Spring Security**.
- Aislamiento multi-hogar: control de acceso estricto a nivel de entidad en cada endpoint.
- Rutas protegidas en el cliente mediante guards de Angular (`authGuard`).

### 🏡 2. Gestión Multi-Hogar y Convivencia
- Soporte para múltiples hogares por usuario con roles diferenciados: Propietario (`OWNER`) y Miembro (`MEMBER`).
- Sistema de **códigos de invitación seguros** con expiración temporal (7 días) para vincular convivientes de forma sencilla y privada.

### 🗄️ 3. Ubicaciones Jerárquicas
- Modelado de espacios organizativos anidados (*Cocina > Armario superior > Balda 2*).
- Cálculo automático de ruta jerárquica completa (`fullPath`).
- Algoritmo de detección y prevención de ciclos en el árbol de dependencias.

### 📦 4. Inventario, Productos y Trazabilidad
- Clasificación inteligente por categorías (*Alimentos, Limpieza, Ropa, Vajilla, Otros*).
- Manejo diferencial de artículos consumibles vs. duraderos con desglose por lotes y fechas de caducidad.
- Atributos específicos para prendas (talla, color) y registro del último uso.

### 🔄 5. Movimientos de Stock Atómicos
- **Entrada (`ENTRY`)**: Incorporaciones o compras con lote y fecha de vencimiento.
- **Salida / Consumo (`EXIT`)**: Deducción de existencias con validación contra stock negativo.
- **Traslado (`TRANSFER`)**: Movimiento de artículos entre ubicaciones dentro del hogar con atomicidad transaccional.
- **Ajuste (`ADJUSTMENT`)**: Conciliación de inventario con registro obligatorio de motivo.

### 🛒 6. Lista de la Compra Sincronizada
- Sugerencias automatizadas cuando un producto cae por debajo de su umbral mínimo de stock.
- Conciliación directa: marcar la compra recibida descuenta los pendientes e ingresa las existencias automáticamente al inventario.

### 🍳 7. Recomendador de Recetas Basado en Despensa
- Motor de sugerencias que prioriza recetas según los ingredientes reales disponibles en el hogar.
- Optimización contra el desperdicio alimentario: prioriza insumos con caducidad cercana y añade ingredientes faltantes a la lista de la compra en un clic.

### 👗 8. Armario Sostenible (Economía Circular)
- Monitorización de prendas sin uso según ventanas configurables (30 a 365 días).
- Generador de fichas listas para publicación en plataformas de segunda mano (*Vinted*, *Wallapop*) o donación.

---

## 🏗️ Arquitectura y Tecnologías

```text
├── frontend/             # SPA Angular 21 (Componentes Standalone, TypeScript, SCSS)
├── backend/              # REST API Spring Boot (Java 21, Spring Security, JPA/Hibernate)
│   └── src/main/resources/db/migration/ # Migraciones versionadas con Flyway
├── docs/                 # Especificaciones, modelo de datos y guías de arquitectura
└── compose.yaml          # Infraestructura Docker (PostgreSQL 17)
```

| Capa | Tecnologías |
| :--- | :--- |
| **Frontend** | Angular 21, TypeScript, SCSS con diseño por tokens, RxJS |
| **Backend** | Java 21, Spring Boot 4.x, Spring Security, Spring Data JPA |
| **Base de Datos** | PostgreSQL 17 con versionado de esquemas mediante **Flyway** |
| **Infraestructura** | Docker Compose, Git |

---

## 🚀 Puesta en Marcha Rápida (Local Setup)

### 1. Prerrequisitos
- **Java 21** o superior
- **Node.js** (v18+) & npm
- **Docker** y **Docker Compose**

### 2. Configuración del entorno
Clona el repositorio y crea tu archivo de variables de entorno:

```bash
git clone https://github.com/aliciiasarrio/NIDO.git
cd NIDO
cp .env.example .env
```

Edita `.env` para asignar una contraseña local a la base de datos:
```env
POSTGRES_DB=nido
POSTGRES_USER=nido
POSTGRES_PASSWORD=tu_password_aqui
```

### 3. Levantar la Base de Datos
```bash
docker compose up -d
```

### 4. Ejecutar el Backend
```bash
cd backend
./mvnw spring-boot:run
```
*El backend se ejecutará en `http://localhost:8080` y Flyway aplicará automáticamente las migraciones.*

### 5. Ejecutar el Frontend
```bash
cd frontend
npm install
npm start
```
*Accede a la aplicación en `http://localhost:4200`.*

---

## 📚 Documentación Técnica Detallada

- [Guía de ejecución local paso a paso](docs/local-setup.md)
- [Modelo de datos relacional](docs/data-model.md)
- [Plan de implementación y seguimiento](docs/implementation-plan.md)
- [Requisitos del sistema](docs/requirements.md)

---

## 👩‍💻 Autora

Desarrollado por **[Alicia Sarrío](https://github.com/aliciiasarrio)** — *Ingeniera Informática (UPV) & Full-Stack Developer*.  
💼 **LinkedIn:** [alicia-sarrío](https://www.linkedin.com/in/alicia-sarri%C3%B3-4b6b6633a/) | 📧 **Contacto:** [sarriocolomaralicia@gmail.com](mailto:sarriocolomaralicia@gmail.com)

---

## 📄 Licencia

Este proyecto se distribuye bajo la licencia **MIT**. Consulta el archivo [LICENSE](./LICENSE) para más información.