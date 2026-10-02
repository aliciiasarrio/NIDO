# Ejecución local de NIDO

Estas instrucciones te guiarán para ejecutar el estado actual de la aplicación NIDO en Windows utilizando PowerShell.

## Requisitos previos

- **Java 21**: Necesario para compilar y ejecutar el backend.
- **Docker Desktop**: Necesario para ejecutar la base de datos PostgreSQL en un contenedor.

## 1. Configurar las variables de entorno

En la raíz del repositorio, copia el archivo `.env.example` y renómbralo a `.env`. Completa la contraseña de la base de datos (puedes inventar una para el entorno local):

```powershell
# Ejecutar en la raíz del repositorio (C:\Projects\NIDO)
Copy-Item .env.example .env
```

Edita `.env` para que tenga un valor válido en `POSTGRES_PASSWORD`, por ejemplo:
```properties
POSTGRES_DB=nido
POSTGRES_USER=nido
POSTGRES_PASSWORD=tu_contraseña_local
```

## 2. Arrancar la base de datos PostgreSQL

Desde la raíz del repositorio, inicia la base de datos con Docker Compose en segundo plano:

```powershell
# Ejecutar en la raíz del repositorio
docker compose up -d
```

Para comprobar que el contenedor de la base de datos está funcionando correctamente:

```powershell
# Ejecutar en la raíz del repositorio
docker compose ps
```

## 3. Arrancar el backend

Antes de iniciar el backend, es necesario cargar las credenciales desde el archivo `.env` al proceso de PowerShell para que Spring Boot pueda acceder a la base de datos. 

Primero, entra en la carpeta del backend:
```powershell
cd backend
```

Carga las variables de entorno sin que se impriman en pantalla:
```powershell
# Ejecutar en la carpeta backend
Get-Content ..\.env | ForEach-Object {
    if ($_ -match '^(POSTGRES_DB|POSTGRES_USER|POSTGRES_PASSWORD)=(.*)$') {
        [Environment]::SetEnvironmentVariable($matches[1], $matches[2], 'Process')
    }
}
```

Inicia la aplicación Spring Boot:
```powershell
# Ejecutar en la carpeta backend
.\mvnw.cmd spring-boot:run
```

## 4. Probar los endpoints

Con el backend funcionando de fondo, puedes acceder a las siguientes URLs desde tu navegador o usando herramientas como `curl` o Postman:
- Estado de la aplicación: [http://localhost:8080/api/status](http://localhost:8080/api/status)
- Listado de categorías: [http://localhost:8080/api/categories](http://localhost:8080/api/categories)

## 5. Ejecutar los tests

Para ejecutar las pruebas automatizadas, asegúrate de que PostgreSQL está funcionando (paso 2) y de que has cargado las variables de entorno en la consola actual (paso 3). Luego, ejecuta:

```powershell
# Ejecutar en la carpeta backend
.\mvnw.cmd test
```

## 6. Detener la aplicación

- **Detener el backend**: En la consola de PowerShell donde se está ejecutando `spring-boot:run`, pulsa `Ctrl+C`.
- **Detener la base de datos**: En la raíz del repositorio, ejecuta:
  ```powershell
  # Ejecutar en la raíz del repositorio
  docker compose stop
  ```
  Este comando detiene los contenedores pero el volumen configurado **conserva los datos**. Las categorías y futuras tablas seguirán ahí la próxima vez que arranques.

Si en algún momento deseas eliminar los contenedores y **destruir completamente los datos** almacenados en el volumen de PostgreSQL, ejecuta:
```powershell
# Ejecutar en la raíz del repositorio
docker compose down -v
```
