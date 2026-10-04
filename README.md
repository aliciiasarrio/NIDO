# NIDO - Organización e Inventario Doméstico

NIDO es una aplicación web full stack moderna, clara e intuitiva diseñada para tener el control total de tu hogar: saber qué tienes, cuánto tienes, dónde está guardado y qué necesitas comprar o cocinar.

---

## Funcionalidades Implementadas

1. **Autenticación y Seguridad Completa**:
   - Registro de usuarios con contraseña cifrada mediante BCrypt (mínimo 8 caracteres).
   - Inicio y cierre de sesión seguro mediante sesiones HTTP (`JSESSIONID`) gestionadas por Spring Security.
   - Protección contra fuga de credenciales y control de acceso por hogar en cada endpoint.
   - Rutas protegidas en el frontend mediante `authGuard`.

2. **Gestión de Hogares y Compartición**:
   - Soporte para múltiples hogares por usuario con roles de Propietario (`OWNER`) y Miembro (`MEMBER`).
   - Generación de códigos de invitación únicos (válidos por 7 días) para invitar a otros convivientes localmente sin necesidad de enviar correos.

3. **Ubicaciones Jerárquicas**:
   - Creación y edición de espacios organizativos anidados (Ejemplo: *Cocina > Armario superior > Balda 2*).
   - Generación automática de ruta completa (`fullPath`).
   - Prevención de ciclos en la jerarquía y validación que impide archivar ubicaciones que contienen sububicaciones activas.

4. **Inventario, Productos y Objetos**:
   - Clasificación por categorías (*Alimentos*, *Limpieza*, *Ropa*, *Vajilla*, *Otros*).
   - Distinción entre consumibles y duraderos.
   - Existencias desglosadas por ubicación, lote y fecha de caducidad.
   - Atributos específicos para prendas de ropa (talla, color) y registro del último uso.

5. **Movimientos de Inventario**:
   - **Entrada (`ENTRY`)**: incorporaciones o compras con lote y caducidad opcional.
   - **Salida / Consumo (`EXIT`)**: deducción de existencias impidiendo saldos negativos.
   - **Traslado (`TRANSFER`)**: movimiento entre ubicaciones dentro del mismo hogar de forma atómica.
   - **Ajuste (`ADJUSTMENT`)**: corrección de inventario con motivo obligatorio.
   - Historial completo y conservación de movimientos tras archivar productos.

6. **Lista de la Compra Sincronizada**:
   - Sugerencias automáticas de productos que han caído por debajo de su stock mínimo.
   - Añadir, editar cantidades y marcar como completado.
   - Acción explícita para registrar la compra recibida, descontando lo pendiente e ingresándolo directamente en la ubicación elegida del inventario.

7. **Panel Principal (Dashboard)**:
   - Métricas en tiempo real: total de objetos, ubicaciones, artículos bajo stock mínimo y alimentos que caducan en los próximos 7 días.
   - Estados vacíos guiados para nuevos hogares.

8. **Ampliación: Recomendador de Recetas Locales**:
   - Motor de sugerencias basado en los ingredientes disponibles en el hogar, sin dependencias de servicios externos.
   - Prioriza las recetas cuyos ingredientes están más próximos a caducar e indica los que faltan, permitiendo añadirlos a la lista de compra directamente.

9. **Ampliación: Armario Sostenible (Ropa sin Uso)**:
   - Detección de prendas inactivas según umbral configurable (30, 60, 90, 180, 365 días).
   - Botón para registrar uso en la fecha actual.
   - Generador de borrador de ficha para venta en segunda mano (Vinted / Wallapop) o donación, con copia al portapapeles.

---

## Tecnologías

- **Backend**: Java 21, Spring Boot 4.1.1, Spring Security, Spring Data JPA, Flyway, PostgreSQL 17.
- **Frontend**: Angular 21, TypeScript, SCSS (tokens CSS estándar), Componentes Standalone.
- **Contenedores**: Docker Compose (Servicio `db` PostgreSQL).

---

## Documentación

- [Guía de ejecución local paso a paso](docs/local-setup.md)
- [Modelo de datos relacional](docs/data-model.md)
- [Plan de implementación y seguimiento](docs/implementation-plan.md)
- [Requisitos del sistema](docs/requirements.md)