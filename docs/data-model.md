# Modelo de datos inicial de NIDO

## Entidades

| Entidad | Representa | Datos principales |
|---|---|---|
| User | Una cuenta de usuario | Identificador, nombre, correo y hash de contraseña |
| Household | Un hogar | Identificador, nombre y propietario |
| Location | Un espacio de almacenamiento | Identificador, nombre, hogar y ubicación padre opcional |
| Category | Una categoría del inventario | Identificador y nombre |
| Item | Un producto u objeto | Identificador, hogar, nombre, categoría, tipo, descripción y mínimo opcional |
| Stock | Existencias en una ubicación | Identificador, objeto, ubicación y cantidad |
| InventoryMovement | Una entrada, salida, traslado o ajuste | Identificador, objeto, tipo, cantidad, origen y destino opcionales según el tipo, fecha y motivo |
| ShoppingListEntry | Un elemento de la lista de compra | Identificador, hogar, objeto opcional, nombre, cantidad pendiente y estado |

## Relaciones

- Cada usuario puede tener un hogar en la primera versión.
- Cada hogar pertenece a un usuario.
- Un hogar contiene múltiples ubicaciones, objetos y entradas de compra.
- Una ubicación puede contener otras ubicaciones del mismo hogar.
- Cada objeto pertenece a una categoría.
- Las categorías iniciales son comunes a todos los hogares:
  alimentos, limpieza, ropa, vajilla y otros.
- Un objeto puede tener existencias en varias ubicaciones.
- Cada registro de existencias relaciona un objeto con una ubicación.
- Cada movimiento pertenece a un objeto.
- Una entrada de compra puede enlazar con un objeto existente
  o contener solo un nombre si todavía no está registrado.

## Ejemplo de existencias

El objeto "Platos blancos" pertenece a la categoría "Vajilla".

| Objeto | Ubicación | Cantidad |
|---|---|---|
| Platos blancos | Cocina → Armario | 6 |
| Platos blancos | Trastero → Caja de vajilla | 4 |

Hay un único objeto y dos registros de existencias.
La cantidad total es de 10 unidades.

Si trasladamos dos platos del trastero a la cocina:
- Cocina → Armario pasa de 6 a 8 unidades.
- Trastero → Caja de vajilla pasa de 4 a 2 unidades.
- El total sigue siendo de 10 unidades.
- Se registra un movimiento de tipo traslado, con cantidad 2,
  ubicación de origen, ubicación de destino y fecha.

## Restricciones iniciales

- Solo puede existir un registro de existencias por pareja
  de objeto y ubicación.
- Las existencias no pueden ser negativas.
- Un objeto y sus ubicaciones deben pertenecer al mismo hogar.
- Una ubicación no puede ser su propio padre ni formar ciclos.
- Un movimiento y las actualizaciones de existencias se guardan
  en una misma transacción: se aplican todos o ninguno.

## Alcance del documento

Este documento contiene el diseño relacional inicial.
Antes de implementarlo se concretarán las restricciones SQL,
los índices y el control de actualizaciones simultáneas.

## Diseño relacional inicial

PK significa clave primaria y FK significa clave foránea.
Los identificadores serán generados automáticamente.

### Tabla users

| Campo | Tipo PostgreSQL | Reglas |
|---|---|---|
| id | BIGINT | PK, generado automáticamente |
| name | VARCHAR(100) | Obligatorio |
| email | VARCHAR(254) | Obligatorio y único; normalizado a minúsculas antes de guardarlo |
| password_hash | VARCHAR(255) | Obligatorio; contiene el hash de la contraseña, nunca la contraseña en texto plano |
| created_at | TIMESTAMPTZ | Obligatorio; fecha y hora de creación |

### Tabla households

| Campo | Tipo PostgreSQL | Reglas |
|---|---|---|
| id | BIGINT | PK, generado automáticamente |
| name | VARCHAR(100) | Obligatorio |
| owner_id | BIGINT | FK a users.id; obligatorio y único |
| created_at | TIMESTAMPTZ | Obligatorio; fecha y hora de creación |

owner_id es único porque cada usuario puede tener como máximo
un hogar en la primera versión. Un usuario recién registrado
puede no tener todavía un hogar.

### Tabla locations

| Campo | Tipo PostgreSQL | Reglas |
|---|---|---|
| id | BIGINT | PK, generado automáticamente |
| household_id | BIGINT | FK a households.id; obligatorio |
| parent_id | BIGINT | FK a locations.id; opcional |
| name | VARCHAR(100) | Obligatorio |
| archived_at | TIMESTAMPTZ | Opcional; NULL indica que la ubicación está activa |

parent_id es NULL cuando la ubicación está directamente
en el hogar. Si está dentro de otra ubicación, contiene
el identificador de esa ubicación padre.

### Ejemplo de jerarquía

Las tres ubicaciones pertenecen al mismo hogar.

| id | name | parent_id |
|---|---|---|
| 1 | Cocina | NULL |
| 2 | Armario | 1 |
| 3 | Cajón superior | 2 |

La ruta "Cocina → Armario → Cajón superior" se construye siguiendo
los padres; no se almacena como texto en cada registro.

### Reglas adicionales

- Los nombres obligatorios no pueden quedar vacíos ni contener
  únicamente espacios.
- El padre de una ubicación debe pertenecer al mismo hogar.
- Una ubicación no puede ser su propio padre.
- No se permiten ciclos en la jerarquía.
- Para comprobar duplicados, quitar espacios exteriores
  e ignorar mayúsculas.
- La unicidad se aplica solo a ubicaciones activas dentro
  del mismo hogar y con el mismo padre.
- Las ubicaciones raíz también deben cumplir esa unicidad.
- La implementación concretará qué reglas se garantizan
  mediante restricciones de base de datos y cuáles requieren
  validación adicional en el backend.

### Tabla categories

Categorías comunes a todos los hogares en la primera versión.

| Campo | Tipo PostgreSQL | Reglas |
|---|---|---|
| id | BIGINT | PK, generado automáticamente |
| name | VARCHAR(100) | Obligatorio y único |

Categorías iniciales: alimentos, limpieza, ropa, vajilla y otros.
En la primera versión, el usuario podrá seleccionarlas,
pero no crearlas ni modificarlas.

### Tabla items

Describe un producto u objeto del inventario de un hogar.
Su cantidad y ubicación se almacenan en stock.

| Campo | Tipo PostgreSQL | Reglas |
|---|---|---|
| id | BIGINT | PK, generado automáticamente |
| household_id | BIGINT | FK a households.id; obligatorio |
| category_id | BIGINT | FK a categories.id; obligatorio |
| name | VARCHAR(150) | Obligatorio; no puede estar vacío ni contener solo espacios |
| description | TEXT | Opcional |
| item_type | VARCHAR(20) | Obligatorio; valores permitidos: CONSUMABLE o DURABLE |
| minimum_quantity | INTEGER | Opcional; si existe, debe ser mayor o igual que cero |
| created_at | TIMESTAMPTZ | Obligatorio; fecha y hora de creación |
| archived_at | TIMESTAMPTZ | Opcional; NULL indica que el objeto está activo |

Reglas:
- CONSUMABLE representa productos que se consumen, como arroz
  o detergente.
- DURABLE representa objetos como prendas o vajilla.
- minimum_quantity solo puede configurarse para CONSUMABLE.
- Para DURABLE, minimum_quantity debe ser NULL.
- NULL significa que no se ha configurado un mínimo.
- Los nombres no son únicos: dos objetos diferentes pueden
  tener el mismo nombre.
- La cantidad total se calcula sumando las existencias del objeto.
  No se guarda como un campo adicional en items.

### Tabla stock

Representa la cantidad de un objeto en una ubicación.

| Campo | Tipo PostgreSQL | Reglas |
|---|---|---|
| id | BIGINT | PK, generado automáticamente |
| item_id | BIGINT | FK a items.id; obligatorio |
| location_id | BIGINT | FK a locations.id; obligatorio |
| quantity | INTEGER | Obligatorio; mayor o igual que cero |

Reglas:
- La pareja (item_id, location_id) debe ser única.
- El objeto y la ubicación deben pertenecer al mismo hogar.
- Las cantidades se expresan en unidades enteras en esta versión.
- Se permite conservar un registro con cantidad cero.
- Un objeto sin registros de stock tiene una cantidad total de cero.
- Las cantidades se modifican mediante movimientos de inventario,
  incluyendo un movimiento inicial al incorporar existencias.
- Cuando se implementen las actualizaciones simultáneas,
  deberán impedir cantidades negativas y pérdida de cambios.

### Ejemplo de producto y existencias

En items existe un único registro:
- id: 10
- name: Platos blancos
- item_type: DURABLE
- category_id: identificador de Vajilla
- minimum_quantity: NULL

En stock existen dos registros:

| item_id | Ubicación | quantity |
|---|---|---|
| 10 | Cocina → Armario | 6 |
| 10 | Trastero → Caja de vajilla | 4 |

La cantidad total de Platos blancos es 10.
Las ubicaciones se referencian mediante location_id;
sus nombres se muestran aquí únicamente para explicar el ejemplo.

### Tabla inventory_movements

Historial de los cambios de existencias.

| Campo | Tipo PostgreSQL | Reglas |
|---|---|---|
| id | BIGINT | PK, generado automáticamente |
| item_id | BIGINT | FK a items.id; obligatorio |
| movement_type | VARCHAR(20) | Obligatorio: ENTRY, EXIT, TRANSFER o ADJUSTMENT |
| quantity | INTEGER | Obligatorio; mayor que cero |
| source_location_id | BIGINT | FK a locations.id; opcional según el tipo |
| destination_location_id | BIGINT | FK a locations.id; opcional según el tipo |
| reason | TEXT | Obligatorio para ajustes; opcional para el resto |
| created_at | TIMESTAMPTZ | Obligatorio; fecha y hora de registro |

Reglas por tipo:
- ENTRY: solo destino. Incrementa sus existencias.
- EXIT: solo origen. Reduce sus existencias.
- TRANSFER: origen y destino distintos. Reduce el origen
  e incrementa el destino en la misma cantidad.
- ADJUSTMENT: exactamente una ubicación.
  Si incrementa existencias, utiliza destino.
  Si reduce existencias, utiliza origen.
  Requiere un motivo no vacío.

Reglas generales:
- Todas las ubicaciones afectadas deben pertenecer al hogar del objeto.
- Una salida, traslado o ajuste de reducción no puede superar
  las existencias disponibles.
- Una corrección a una cantidad concreta registra como quantity
  la diferencia absoluta respecto a la cantidad anterior.
- Si la cantidad no cambia, no se crea un movimiento.
- El movimiento y los cambios en stock se guardan en una
  única transacción.
- Los movimientos no se editan ni se eliminan desde la aplicación.
  Los errores se corrigen mediante un nuevo movimiento.
- Se conserva el historial aunque se retire un objeto del inventario.

### Conservación del historial

- Eliminar un objeto desde la aplicación significa archivarlo,
  conservando sus datos y movimientos.
- Si tiene existencias, se requiere confirmación y se registran
  salidas por retirada antes de archivarlo.
- Archivar un objeto, registrar sus salidas y dejar sus existencias
  a cero debe realizarse en una única transacción.
- No se permiten nuevos movimientos para objetos archivados.
- No se pueden añadir objetos archivados a la lista ni registrar
  compras vinculadas a ellos.
- Si un objeto tiene entradas PENDING, se debe impedir archivarlo
  hasta que el usuario elimine esas entradas o registre las compras.
- Eliminar una ubicación significa archivarla.
- Una ubicación solo puede archivarse si no contiene
  ubicaciones internas activas ni existencias mayores que cero.
- Los registros de stock con cantidad cero no impiden archivarla.
- Una ubicación archivada no puede recibir nuevas existencias
  ni ser padre de nuevas ubicaciones.
- Los nombres de ubicaciones archivadas pueden reutilizarse;
  la regla de nombres únicos se aplica a las ubicaciones activas.

### Tabla shopping_list_entries

Cada hogar tiene una lista de compra en la primera versión.
Cada fila representa un elemento de esa lista.

| Campo | Tipo PostgreSQL | Reglas |
|---|---|---|
| id | BIGINT | PK, generado automáticamente |
| household_id | BIGINT | FK a households.id; obligatorio |
| item_id | BIGINT | FK a items.id; opcional |
| name | VARCHAR(150) | Obligatorio; no vacío ni solo espacios |
| pending_quantity | INTEGER | Obligatorio; mayor o igual que cero |
| status | VARCHAR(20) | Obligatorio: PENDING o COMPLETED |
| created_at | TIMESTAMPTZ | Obligatorio; fecha y hora de creación |

Reglas:
- item_id es NULL si el producto aún no existe en el inventario.
- Si hay item_id, el objeto debe pertenecer al mismo hogar.
- PENDING requiere pending_quantity mayor que cero.
- COMPLETED requiere pending_quantity igual a cero.
- Solo puede existir una entrada PENDING por objeto y hogar.
- Al añadir otra vez ese objeto, se suma la cantidad solicitada
  a su entrada pendiente.
- Para entradas sin item_id, se agrupan los nombres iguales
  tras quitar espacios exteriores e ignorar mayúsculas.
- Registrar una compra requiere cantidad adquirida y ubicación.
- Al registrar su compra, permitir seleccionar un objeto activo
  existente del hogar o crear uno nuevo.
- Si al vincularlo ya existe otra entrada PENDING para ese objeto,
  fusionar las cantidades pendientes en una sola entrada antes
  de descontar la compra, sin perder cantidades.
- La compra registra un movimiento ENTRY e incrementa stock.
- La cantidad pendiente se reduce hasta un mínimo de cero.
- Si se compra más de lo pendiente, toda la cantidad comprada
  entra en stock y la entrada queda COMPLETED.
- Realizar todos estos cambios en la misma transacción.

### Ejemplos

Ajuste:
Hay 6 platos en una ubicación, pero al contarlos hay 5.
Se registra ADJUSTMENT con quantity 1, ubicación de origen
y motivo "Corrección tras recuento". El stock queda en 5.

Compra:
Hay 3 botellas de detergente pendientes.
Se compran 2 y se guardan en el armario de limpieza.
Se registra ENTRY de 2 unidades y queda 1 pendiente.
