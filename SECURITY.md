# Política de Seguridad de NIDO 🛡️

En NIDO nos tomamos la seguridad y la privacidad doméstica muy en serio. Si descubres alguna vulnerabilidad de seguridad en esta aplicación, agradecemos enormemente tu colaboración responsable.

---

## 🔒 Versiones Soportadas

Actualmente, solo la rama principal `main` recibe parches y actualizaciones de seguridad.

| Versión / Rama | Soportada |
| :--- | :--- |
| `main` | ✅ Sí |
| Ramas archivadas | ❌ No |

---

## 🚨 Reportar una Vulnerabilidad

**Por favor, NO abras una incidencia (Issue) pública en GitHub para reportar problemas de seguridad.**

Para reportar una vulnerabilidad:
1. Contacta de forma privada con el autor a través de su perfil de GitHub o mediante una [Advisory de Seguridad de GitHub](https://github.com/aliciiasarrio/NIDO/security/advisories/new).
2. Incluye:
   - Descripción detallada del hallazgo.
   - Pasos exactos o prueba de concepto (PoC) para reproducir la vulnerabilidad.
   - Impacto potencial estimado.
3. Recibirás acuse de recibo en un plazo inferior a 48 horas con el seguimiento de la resolución.

---

## 🛡️ Buenas Prácticas en NIDO

- **Credenciales y Secretos:** Nunca confirmes archivos `.env` ni claves privadas en el control de versiones. Todas las contraseñas se gestionan mediante hashing criptográfico BCrypt.
- **Control de Acceso Multi-Inquilino (Hogar):** Todas las consultas SQL y servicios verifican estrictamente la pertenencia del usuario al `household_id` correspondiente para evitar fuga de datos entre hogares.
- **Asistente IA:** Las claves de API para servicios externos (como Gemini) se conservan exclusivamente en el almacenamiento local del navegador (`localStorage`) y nunca se transmiten a servidores no autorizados.
