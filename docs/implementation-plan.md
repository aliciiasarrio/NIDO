# Plan de Implementación de NIDO

## Estado del Proyecto y Objetivos
NIDO es una aplicación web de inventario y organización doméstica que permite gestionar hogares, ubicaciones jerárquicas, productos/objetos con distinción entre consumibles y duraderos, control de existencias por ubicación, movimientos de stock (entradas, consumos, traslados, ajustes), lista de la compra sincronizable, dashboard principal con alertas de caducidad y stock mínimo, y extensiones para recomendaciones de recetas locales y ropa sin uso (donar/vender).

---

## Fases de Implementación

### Fase 1: Arquitectura de Seguridad, Sesiones y Autenticación Completa
- [x] Backend:
  - Añadido `spring-boot-starter-security` a `pom.xml`.
  - Configurado Spring Security con sesión HTTP (`JSESSIONID`) persistida en `HttpSessionSecurityContextRepository`, protección CSRF desactivada para REST local y endpoints públicos (`/api/auth/**`, `/api/status`, `/api/categories`).
  - Implementado login (`POST /api/auth/login`), logout (`POST /api/auth/logout`) y usuario actual (`GET /api/auth/me`).
  - Contraseñas protegidas mediante BCrypt; hashes y contraseñas nunca expuestos.
- [x] Frontend:
  - Definido sistema de diseño visual en `src/styles.scss` (paleta acogedora terracota/verde bosque/arena, tipografía Plus Jakarta Sans / Outfit, microanimaciones, accesibilidad `prefers-reduced-motion`).
  - Implementado `AuthService` para `login`, `register`, `logout`, `me` (con `withCredentials: true`).
  - Creados componentes de Login y Registro (`LoginComponent`, `RegisterComponent`) con validación y guard (`authGuard`).
- [x] Verificación de Fase 1:
  - Prueba de integración `AuthIntegrationTest` ejecutada con éxito.
  - Verificación de login/logout y endpoints protegidos pasando al 100%.

### Fase 2: Gestión de Hogares y Membresía/Invitaciones
- [x] Base de Datos (Flyway):
  - Migración `V3__create_households_and_members.sql` aplicada:
    - Tabla `households`.
    - Tabla `household_members` (roles `OWNER`, `MEMBER`).
    - Tabla `household_invitations` (códigos alfanuméricos de 8 caracteres con caducidad a 7 días).
- [x] Backend:
  - Entidades `Household`, `HouseholdMember`, `HouseholdInvitation`.
  - Repositorios y `HouseholdService` con comprobación de pertenencia al hogar (`assertUserIsMember`).
  - `HouseholdController` con endpoints para listar, crear, actualizar, generar invitación y unirse por código.
- [x] Frontend:
  - `HouseholdService` con sincronización de hogar activo.
  - Selector de hogar en la barra de navegación superior, modal para crear hogar o unirse por código y generador de invitaciones.
- [x] Verificación de Fase 2:
  - Comprobado aislamiento de permisos entre hogares diferentes (`AccessDeniedDomainException`).

### Fase 3: Ubicaciones Jerárquicas
- [x] Base de Datos (Flyway):
  - Migración `V4__create_locations.sql` aplicada:
    - Tabla `locations` con `parent_id`, `household_id`, `archived_at`.
    - Índices únicos condicionales para nombres sin duplicados en el mismo nivel activo.
- [x] Backend:
  - Entidad `Location` y `LocationRepository`.
  - `LocationService` con prevención de ciclos recursivos, construcción de ruta jerárquica (breadcrumbs `Cocina > Armario > Balda`) y validación para evitar archivar ubicaciones con sububicaciones activas.
  - `LocationController` con CRUD completo y archivado.
- [x] Frontend:
  - `LocationsComponent` con vista jerárquica, buscador dinámico en tiempo real y modal de creación/edición de ubicaciones.
- [x] Verificación de Fase 3:
  - Creación de rutas jerárquicas validada en `FullDomainFlowIntegrationTest`.

### Fase 4: Inventario (Productos, Duraderos, Ropa) y Existencias
- [x] Base de Datos (Flyway):
  - Migración `V5__create_items_and_stock.sql` aplicada:
    - Tabla `items` con `item_type` (`CONSUMABLE`, `DURABLE`), `minimum_quantity`, `unit`, `clothing_size`, `clothing_color`, `last_worn_at`.
    - Tabla `stock` por ubicación, con soporte de número de lote y fecha de caducidad.
- [x] Backend:
  - Entidades `Item` y `Stock`, repositorios y lógica de agrupamiento de stock por ubicación y total.
  - Validación de campos según consumible o duradero.
- [x] Frontend:
  - `InventoryComponent` con filtrado dinámico por categoría, tipo, texto y stock bajo.
  - Tarjetas con desglose de existencias por ubicación y badge de total.
- [x] Verificación de Fase 4:
  - Validado en tests unitarios e integración.

### Fase 5: Movimientos de Inventario (Entradas, Salidas, Traslados, Ajustes)
- [x] Base de Datos (Flyway):
  - Migración `V6__create_movements_and_shopping_list.sql` aplicada:
    - Tabla `inventory_movements` (`ENTRY`, `EXIT`, `TRANSFER`, `ADJUSTMENT`).
- [x] Backend:
  - Lógica transaccional `@Transactional` en `InventoryService`:
    - `ENTRY`: añade stock a la ubicación destino con lote y caducidad.
    - `EXIT`: deduce stock validando que haya existencias suficientes (no saldos negativos).
    - `TRANSFER`: transfiere de origen a destino atómicamente.
    - `ADJUSTMENT`: corrige stock con motivo obligatorio.
  - Soporte para registrar uso de prendas (`/wear`).
- [x] Frontend:
  - Modal interactivo de movimientos en `InventoryComponent` con validación de cantidad y selección de ubicaciones.
- [x] Verificación de Fase 5:
  - Verificado en `FullDomainFlowIntegrationTest`.

### Fase 6: Lista de la Compra y Sincronización con Inventario
- [x] Base de Datos (Flyway):
  - Tabla `shopping_list_entries` con estados `PENDING` y `COMPLETED`.
- [x] Backend:
  - `ShoppingListService` y `ShoppingListController`.
  - Agrupación automática de entradas duplicadas pendientes.
  - Endpoint transaccional `purchaseEntry`: marca como comprado, descuenta la cantidad pendiente y registra automáticamente el movimiento `ENTRY` en el inventario hacia la ubicación seleccionada.
- [x] Frontend:
  - `ShoppingComponent` con sugerencias de productos en stock bajo, modificación de cantidades y modal para ubicar compras.
- [x] Verificación de Fase 6:
  - Verificado paso a paso en test de integración.

### Fase 7: Panel Principal (Dashboard) con Métricas Reales
- [x] Backend:
  - `DashboardService` y `DashboardController` (`GET /api/households/{id}/dashboard/summary`).
  - Métricas calculadas en tiempo real: total productos, total ubicaciones, conteo bajo stock, productos próximos a caducar en 7 días, compras pendientes y prendas sin usar.
- [x] Frontend:
  - `DashboardComponent` con tarjetas de métricas, estados vacíos para nuevos hogares, accesos rápidos y listas destacadas de reposición prioritaria y alimentos próximos a caducar.
- [x] Verificación de Fase 7:
  - Comprobado cálculo con datos reales.

### Fase 8: Módulos de Ampliación: Recetas Locales y Ropa Sin Uso
- [x] Recetas:
  - `RecipeService` con catálogo local de recetas españolas caseras.
  - Cálculo de porcentaje de coincidencia con los alimentos en stock del hogar.
  - Priorización de recetas con ingredientes a punto de caducar (sin sugerir caducados).
  - Componente `RecipesComponent` con botón para añadir ingredientes faltantes directamente a la lista de compra.
- [x] Ropa sin uso:
  - Detección de prendas según selector de días sin uso (30, 60, 90, 180, 365 días).
  - Acción para marcar prenda usada hoy.
  - Generador de borrador de anuncio para plataformas de segunda mano (Vinted / Wallapop / Donación) con copia al portapapeles.
  - Componente `ClothingComponent`.

### Fase 9: Verificación Global, Documentación y Cierre
- [x] Suite de tests del backend pasando 3/3 (100% éxito).
- [x] Pruebas del frontend pasando con Vitest y build de producción limpio sin errores (`ng build`).
- [x] Comprobación de persistencia y no pérdida de datos tras reinicios.
- [x] Documentación actualizada en `README.md` y `docs/local-setup.md`.
