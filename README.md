# Cedaspy

<div align="center">

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green?style=flat-square&logo=node.js)](https://nodejs.org/)
[![discord.js](https://img.shields.io/badge/discord.js-v14-blue?style=flat-square&logo=discord)](https://discord.js.org/)
[![Puppeteer](https://img.shields.io/badge/Puppeteer-Scraping-red?style=flat-square&logo=puppeteer)](https://pptr.dev/)

</div>

Agente diseñado para la extracción de datos entre Cedapug  mediante técnicas de web scraping.

> [!IMPORTANT]
> **Seguridad Operativa:**
>
> - **Restricción de Canal:** El bot ignora cualquier mensaje fuera del `ALLOWED_CHANNEL_ID` configurado, evitando fugas de información.
> - **Scraping:** Utiliza **Puppeteer** para navegar la UI de Cedapug y extraer MMR e historiales de baneo que no son accesibles vía API pública tradicional.

---

## Módulos de Comando

| Comando    | Parámetro   | Resultado                                                           |
| :--------- | :---------- | :------------------------------------------------------------------ |
| `#id`      | `[name/id]` | Perfil detallado: Avatar, SteamID, MMR (Color-coded) y Actividad.   |
| `#bans`    | `[name/id]` | Auditoría: Historial completo de sanciones.                         |
| `#cedaspy` | -           | Resumen de estado del agente.                                       |

---

## Configuración (.env)

| Variable             | Descripción                                        |
| :------------------- | :------------------------------------------------- |
| `TOKEN`              | Token de acceso para la API de Discord.            |
| `ALLOWED_CHANNEL_ID` | Único ID del canal donde el bot aceptará comandos. |

---

## Despliegue

```bash
git clone https://github.com/froddodev/cedaspy.git
cd cedaspy
npm install
npm start
```

---

> [!NOTE]
> **Nota del Desarrollador:**
> Este bot es solo para fines educativos y personales. Utiliza web scraping para recopilar datos, lo que se hace sin el consentimiento explícito de Cedapug.
> El bot no tiene la intención de violar las políticas o términos de servicio de Cedapug ni de Steam. Úsalo de manera responsable y respeta las plataformas y pautas de estas.
