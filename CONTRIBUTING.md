# Guía de Contribución a NIDO 🏡

¡Gracias por tu interés en contribuir a **NIDO**! Este documento define las pautas y estándares para asegurar que el código se mantenga limpio, robusto, testeable y mantenible.

---

## 🧭 Flujo de Ramas (Git Workflow)

1. Haz un fork del repositorio o crea una rama a partir de `main`.
2. Las ramas deben seguir el convenio de nomenclatura semántico:
   - `feat/nombre-funcionalidad` para nuevas características (ej: `feat/barcode-scanner`).
   - `fix/nombre-error` para correcciones de fallos (ej: `fix/expired-date-calculation`).
   - `docs/nombre-mejora` para cambios exclusivamente en documentación.
   - `refactor/nombre-modulo` para refactorizaciones sin alteración funcional.
   - `test/nombre-test` para adición o corrección de pruebas.

---

## 📝 Mensajes de Commit (Conventional Commits)

Seguimos el estándar [Conventional Commits](https://www.conventionalcommits.org/es/v1.0.0/):

```
<tipo>(<ámbito opcional>): <descripción corta y clara en imperativo>

[cuerpo explicativo opcional]
```

### Tipos admitidos:
- **`feat`**: Nueva funcionalidad para el usuario.
- **`fix`**: Corrección de un bug.
- **`docs`**: Modificaciones solo de documentación o README.
- **`style`**: Ajustes de formato, espaciado o CSS sin impacto lógico.
- **`refactor`**: Refactorización de código limpio sin bugs ni nuevas features.
- **`test`**: Añadir o modificar tests unitarios o de integración.
- **`chore`**: Tareas auxiliares de configuración, build o dependencias.

*Ejemplo:* `feat(recipes): priorizar ingredientes con fecha de caducidad inminente`

---

## 🛠️ Estándares de Código y Calidad

### Backend (Spring Boot 4 / Java 21)
- Seguir principios de diseño **Clean Architecture / DDD** modular.
- Mantener validaciones DTO mediante `@Valid` / `jakarta.validation`.
- Evitar lógica de negocio en controladores (`@RestController`); desacoplarla en `@Service`.
- Todas las operaciones de base de datos multi-paso deben estar protegidas con `@Transactional`.
- Probar que compila y los tests pasan antes de abrir PR:
  ```powershell
  cd backend
  .\mvnw.cmd clean test
  ```

### Frontend (Angular 21 Standalone / SCSS)
- Utilizar componentes Standalone con arquitectura reactiva de Signals (`signal()`, `computed()`).
- Estilos en SCSS utilizando variables y tokens globales de `styles.scss` (no estilos en línea).
- Respetar accesibilidad web (etiquetas `alt`, contrastes legibles, roles semánticos).
- Ejecutar pruebas y compilación antes de subir:
  ```powershell
  cd frontend
  npm run test:ci
  npm run build
  ```

---

## 🚀 Proceso de Pull Request (PR)

1. Asegúrate de que tu rama está sincronizada con `main` (`git pull --rebase origin main`).
2. Verifica que las pruebas automatizadas del Backend y Frontend pasen localmente.
3. Rellena la plantilla de PR detallando el contexto, qué cambios introduce y cómo verificarlo.
4. El pipeline de CI en GitHub Actions debe finalizar en verde.
5. Una vez revisado y aprobado, se integrará mediante merge limpio o squash.
