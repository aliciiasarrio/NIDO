# Requisitos de NIDO

## 1. Objetivo

NIDO permite conocer qué productos y objetos hay en un hogar,
en qué cantidad y dónde están guardados.

Incluye alimentos, productos de limpieza, ropa, vajilla y otros
objetos. También permite identificar productos que necesitan
reposición y gestionar una lista de compra.

La información del inventario se mantiene mediante los registros
y movimientos que introduce el usuario.

## 2. Alcance de la primera versión

Cada usuario podrá crear y gestionar un hogar propio.
Los hogares compartidos y las invitaciones se incorporarán
en una versión posterior.

### RF-01. Cuenta de usuario

- Registrarse con nombre, correo electrónico y contraseña.
- Iniciar y cerrar sesión.
- Acceder únicamente a los datos de su propio hogar.
- No permitir dos cuentas con el mismo correo electrónico.

### RF-02. Hogar

- Crear un hogar indicando su nombre.
- Consultar y modificar el nombre del hogar.

### RF-03. Ubicaciones

- Crear, consultar, editar y eliminar ubicaciones.
- Organizar ubicaciones dentro de otras ubicaciones.
- Ejemplo: dormitorio → armario → cajón superior.
- Mostrar la ruta completa de una ubicación.
- Eliminar una ubicación significa archivarla.
- Una ubicación con existencias a cero puede archivarse
  si no contiene ubicaciones internas activas.

### RF-04. Categorías

- Clasificar el inventario en categorías.
- Disponer inicialmente de: alimentos, limpieza, ropa,
  vajilla y otros.
- Las categorías indican qué tipo de objeto es;
  las ubicaciones indican dónde está.

### RF-05. Productos y objetos

- Crear, consultar, editar y eliminar registros del inventario.
- Registrar nombre, categoría, tipo y descripción opcional.
- Distinguir consumibles y objetos duraderos.
- Un mismo producto podrá tener existencias en varias ubicaciones.
- Mostrar su cantidad por ubicación y su cantidad total.
- En la primera versión, las cantidades se expresarán
  en unidades enteras: paquetes, botellas, prendas, piezas, etc.

### RF-06. Movimientos de inventario

- Registrar entradas por compras o incorporaciones.
- Registrar salidas por consumo, retirada o pérdida.
- Trasladar unidades entre ubicaciones del mismo hogar.
- Corregir cantidades mediante un ajuste con motivo.
- Conservar un historial con fecha, tipo de movimiento
  y cantidad.
- Actualizar las existencias al registrar un movimiento.

### RF-07. Búsqueda

- Buscar productos y objetos por nombre.
- Filtrar por categoría y ubicación.
- Al filtrar una ubicación, incluir también sus ubicaciones
  internas.
- Consultar dónde está guardado cada resultado.

### RF-08. Existencias mínimas

- Configurar opcionalmente un mínimo por producto consumible.
- Comparar el mínimo con la cantidad total del producto
  en el hogar.
- Mostrar los productos cuya cantidad esté por debajo del mínimo.
- Permitir añadirlos a la lista de compra.

### RF-09. Lista de compra

- Añadir productos del inventario con una cantidad pendiente.
- Añadir artículos que todavía no están registrados.
- Editar cantidades y eliminar elementos.
- Si se añade un producto que ya está pendiente,
  actualizar su cantidad en lugar de duplicarlo.
- Al registrar una compra, indicar la cantidad adquirida
  y su ubicación de destino.
- Crear el producto si todavía no existe.
- Incrementar las existencias y descontar la cantidad
  adquirida de la cantidad pendiente.
- Si no queda cantidad pendiente, marcar el elemento
  como completado.

## 3. Reglas de negocio

- Las cantidades disponibles y los mínimos no pueden ser negativos.
- Las cantidades de un movimiento deben ser mayores que cero.
- No se puede consumir, retirar o trasladar más unidades
  de las disponibles en la ubicación de origen.
- Un traslado reduce las existencias del origen e incrementa
  las del destino, sin modificar el total del hogar.
- Una ubicación no puede contenerse a sí misma, directamente
  ni a través de otras ubicaciones.
- Los objetos y las ubicaciones relacionados deben pertenecer
  al mismo hogar.
- Dos ubicaciones con el mismo padre no pueden tener
  el mismo nombre; tampoco dos ubicaciones raíz del mismo hogar.
- Los objetos duraderos pueden retirarse o trasladarse,
  pero no necesitan un mínimo de reposición.
- Los nombres de productos no son únicos: pueden existir
  objetos distintos con el mismo nombre.
- Eliminar objetos significa archivarlos.
- Eliminar un registro con existencias requiere confirmación
  explícita del usuario.
- Un objeto con entradas de compra pendientes no puede archivarse
  hasta resolverlas.

## 4. Requisitos de calidad

- Los datos deben conservarse al cerrar y volver a abrir
  la aplicación.
- El backend debe validar los datos y los permisos,
  aunque el frontend ya los compruebe.
- Las contraseñas deben almacenarse mediante un hash
  adecuado, nunca en texto plano.
- Un movimiento y la actualización de existencias deben
  guardarse juntos: si una parte falla, ninguna se aplica.
- Las actualizaciones simultáneas no deben producir
  cantidades negativas ni perder movimientos.
- Los errores deben mostrarse con mensajes comprensibles.
- Las pantallas deben poder utilizarse desde ordenador y móvil.
- El proyecto debe documentar cómo ejecutarlo localmente.

## 5. Ampliaciones futuras

- Hogares compartidos, invitaciones y roles.
- Fotografías de productos y objetos.
- Caducidades y lotes.
- Lectura de códigos de barras.
- Cantidades en otras unidades: litros, gramos, etc.
- Notificaciones de reposición.
- Atributos específicos: talla de ropa, marca, color, etc.
- Recomendaciones de recetas según los alimentos disponibles,
  priorizando los lotes próximos a caducar e indicando
  los ingredientes que faltan.
- Registro del uso de prendas y detección de ropa que lleva
  un tiempo configurable sin utilizarse.
- Sugerencias para conservar, donar o vender prendas poco utilizadas.
- Preparación de borradores de anuncios de venta con fotografías
  y datos de la prenda, para su revisión y publicación por el usuario.
