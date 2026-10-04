# Ejecución local de NIDO (Windows / PowerShell)

Esta guía explica cómo ejecutar la aplicación completa NIDO en un entorno Windows utilizando PowerShell.

---

## Requisitos previos

- **Java 21**: JDK instalado y disponible en el `PATH` (`java -version`).
- **Node.js 20+ y npm**: Para compilar y ejecutar el frontend (`node -v`, `npm -v`).
- **Docker Desktop**: En funcionamiento para el contenedor de base de datos PostgreSQL.

---

## 1. Configuración de Variables de Entorno

En la raíz del repositorio (`C:\Projects\NIDO`), asegúrate de tener el archivo `.env` configurado (puedes tomar `.env.example` como referencia):

```properties
POSTGRES_DB=nido
POSTGRES_USER=nido
POSTGRES_PASSWORD=tu_contraseña_local
```

> **Importante:** `.env` está añadido al `.gitignore` y no debe subirse a Git.

---

## 2. Iniciar la Base de Datos

Desde la raíz del repositorio, inicia el servicio de PostgreSQL en Docker Compose:

```powershell
docker compose up -d
```

Para comprobar que el contenedor está saludable:
```powershell
docker compose ps
```

---

## 3. Iniciar el Backend (Spring Boot)

Abre una consola de PowerShell en la raíz del repositorio:

```powershell
cd backend
$lines = Get-Content ..\.env; foreach ($line in $lines) { $p = $line.Split('=', 2); if ($p.Length -eq 2) { Set-Item -Path ('env:' + $p[0].Trim()) -Value $p[1].Trim() } }
.\mvnw.cmd spring-boot:run
```

El backend se iniciará en `http://localhost:8080`.
Flyway aplicará automáticamente las migraciones (`V1` a `V6`) en la base de datos conservando todos los datos existentes.

---

## 4. Iniciar el Frontend (Angular)

En una segunda consola de PowerShell:

```powershell
cd frontend
npm start
```

El servidor de desarrollo de Angular arrancará en `http://localhost:4200/`.
Las peticiones a `/api/**` se redirigen automáticamente mediante el proxy de desarrollo hacia `http://localhost:8080`.

---

## 5. Acceder a la Aplicación

Abre tu navegador en [http://localhost:4200](http://localhost:4200).

- **Registro**: Puedes registrar una cuenta nueva en `/register` con tu nombre, correo y contraseña.
- **Inicio de sesión**: En `/login`, inicia sesión con tus credenciales.
- **Creación de Hogar**: En el primer inicio, utiliza el asistente o el selector superior para crear tu hogar (ej: *Mi Casa*) o introduce un código de invitación recibido de otro usuario.
- **Navegación**: Utiliza la barra superior para explorar:
  - **Panel**: Resumen en tiempo real, alertas de stock bajo y productos próximos a caducar.
  - **Inventario**: Consulta y añade productos o prendas, consulta existencias por ubicación y realiza entradas, consumos, traslados o ajustes.
  - **Ubicaciones**: Organiza la jerarquía de habitaciones, armarios o baldas.
  - **Compra**: Añade artículos a comprar o importa sugerencias de productos bajo stock mínimo.
  - **Recetas**: Consulta qué cocinar con lo que tienes disponible, priorizando alimentos a punto de caducar.
  - **Ropa**: Revisa prendas que llevan meses sin usarse y genera un borrador listo para vender en Vinted o donar.

---

## 6. Ejecución de Pruebas Automatizadas

### Backend (JUnit 5 + Spring Boot Test)
Con PostgreSQL en marcha y las variables de entorno cargadas en la consola:

```powershell
cd backend
$lines = Get-Content ..\.env; foreach ($line in $lines) { $p = $line.Split('=', 2); if ($p.Length -eq 2) { Set-Item -Path ('env:' + $p[0].Trim()) -Value $p[1].Trim() } }
.\mvnw.cmd test
```

### Frontend (Vitest + Angular CLI)
```powershell
cd frontend
npx ng test --no-watch
```

### Compilación de Producción del Frontend
```powershell
cd frontend
npm run build
```

---

## 7. Detener los Servicios

- Para detener el backend o frontend: pulsa `Ctrl + C` en sus respectivas consolas.
- Para detener el contenedor de base de datos conservando los datos:
  ```powershell
  docker compose stop
  ```
- Si en algún momento necesitas destruir los datos del contenedor:
  ```powershell
  docker compose down -v
  ```
