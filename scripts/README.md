# Scripts de Utilidad y Datos de Prueba 🛠️

Este directorio contiene herramientas y scripts auxiliares para inicializar entornos de prueba, poblar datos de demostración y regenerar recursos visuales en la base de datos de **NIDO**.

---

## 📄 Contenido del Directorio

| Archivo | Tipo | Descripción |
| :--- | :--- | :--- |
| **`seed-moixent.sql`** | SQL | Script completo de datos de demostración para el hogar *"Moixent"*. Genera una jerarquía profunda de ubicaciones (cocina, despensa, nevera, armarios, trastero), artículos clasificados en 5 categorías, existencias con alertas de caducidad inminente, prendas para el Armario Sostenible y lista de la compra. |
| **`update_images.py`** | Python | Generador automatizado de Data URIs en formato SVG vectorizado y optimizado para los productos del catálogo. |
| **`update-images.sql`** | SQL | Sentencias `UPDATE` generadas por `update_images.py` para asignar los iconos vectoriales SVG limpios a cada producto en PostgreSQL. |

---

## 🚀 Cómo Ejecutar los Scripts

### 1. Poblar Datos de Demostración (`seed-moixent.sql`)

> **Requisito previo:** Tener registrado al menos un usuario en la aplicación y haber creado un hogar que contenga la palabra *"Moixent"* (o modificar el script para que apunte al ID de tu hogar deseado).

#### Opción A: Mediante Docker Compose (Recomendado)
```bash
docker compose exec -T db psql -U nido -d nido < scripts/seed-moixent.sql
```

#### Opción B: Mediante PowerShell en local
```powershell
Get-Content scripts/seed-moixent.sql | docker compose exec -T db psql -U nido -d nido
```

#### Opción C: Desde un cliente SQL (DBeaver, pgAdmin, DataGrip)
Abre una sesión contra `localhost:5432`, base de datos `nido`, y ejecuta el contenido del archivo en el editor SQL.

---

### 2. Regenerar y Aplicar Iconos SVG a Productos

Si modificas o añades nuevos iconos SVG vectoriales en `update_images.py`:

```bash
# 1. Regenerar el archivo SQL
python scripts/update_images.py

# 2. Aplicar los cambios a la base de datos
docker compose exec -T db psql -U nido -d nido < scripts/update-images.sql
```
