# NIDO - Backend (Spring Boot 4 & Java 21) ⚙️

Servicio REST API robusto para **NIDO: Organización e Inventario Doméstico**, desarrollado con **Java 21**, **Spring Boot 4.1**, **Spring Security**, **Spring Data JPA**, **Flyway** y base de datos relacional **PostgreSQL 17**.

---

## ⚡ Tecnologías y Librerías

- **Lenguaje**: Java 21 (LTS).
- **Framework**: Spring Boot 4.1.1 (`spring-boot-starter-webmvc`, `spring-boot-starter-validation`).
- **Seguridad**: Spring Security con cifrado BCrypt y gestión de sesiones con cookies seguras `JSESSIONID`.
- **Persistencia**: Spring Data JPA (Hibernate 6) sobre PostgreSQL 17.
- **Migraciones de BD**: Flyway Database Migration (`db/migration/V1` a `V7`).
- **Testing**: JUnit 5, MockMvc, `@SpringBootTest`, Spring Security Test.

---

## 📂 Arquitectura y Estructura del Código

```text
backend/src/main/java/com/nido/backend/
├── config/         # Seguridad (SecurityConfig), encriptación y CORS
├── controller/     # Controladores REST API agrupados por dominio
├── dto/            # Data Transfer Objects (Requests & Responses con validaciones)
├── entity/         # Entidades JPA (User, Household, Location, Item, Stock, etc.)
├── exception/      # Manejador global de excepciones (@ControllerAdvice)
├── repository/     # Repositorios JPA de acceso a datos
└── service/        # Lógica de negocio transaccional y reglas de dominio
```

---

## 🛠️ Ejecución y Pruebas

```powershell
# Compilar y ejecutar en modo desarrollo
.\mvnw.cmd spring-boot:run

# Ejecutar suite de pruebas de integración (requiere PostgreSQL levantado)
.\mvnw.cmd clean test

# Generar empaquetado JAR ejecutable para producción
.\mvnw.cmd clean package -DskipTests
```

---

## 🗄️ Esquema de Base de Datos y Migraciones

Flyway gestiona de forma versionada las migraciones en `src/main/resources/db/migration/`:
- `V1__create_categories.sql`: Catálogo base de categorías del hogar.
- `V2__create_users.sql`: Usuarios y contraseñas cifradas.
- `V3__create_households_and_members.sql`: Hogares multi-usuario e invitaciones temporales con roles (`OWNER`, `MEMBER`).
- `V4__create_locations.sql`: Espacios y habitaciones jerárquicas con validación de ciclos.
- `V5__create_items_and_stock.sql`: Productos, atributos específicos (tallas/colores) y existencias por lote.
- `V6__create_movements_and_shopping_list.sql`: Registro de entradas, salidas, traslados, ajustes y lista de compra sincronizada.
- `V7__add_item_photo_and_market_prices.sql`: Soporte para imágenes de producto y precios de mercado.
