# 🗽 NYC · 21–28 nov 2026

Itinerario interactivo del viaje: **https://jacoal1234-creator.github.io/nyc-trip-2026/**

## Cómo cambiar algo
- **Proponer un cambio:** botón "✏️ Proponer cambio" en cada actividad (abre un Issue).
- **Editar directo** (la página se actualiza sola en 1–2 min):
  - `data/itinerario.csv`: el plan día por día
  - `data/reservas.csv`: checklist de reservas
  - `data/opciones.csv`: catálogo de lugares de la sección Explorar (coordenadas sacadas de OpenStreetMap/Nominatim)
  - `data/rutas.csv`: rutas a pie (paradas separadas por `|`)
  - `data/inspiracion.csv`: videos, hashtags y guías web
  - `data/emergencia.csv`: tarjeta de emergencia (taxi, 911, consulado, hotel)

## App en el celular (funciona sin internet)
- **Android (Chrome):** botón «Instalar en el celular» en la sección Hoy, o menú ⋮ → Instalar app.
- **iPhone (Safari):** Compartir ⬆️ → «Agregar a inicio».
- Ábranla una vez con internet para que guarde todo. El mapa necesita conexión (solo guarda lo que ya vieron).
- Si cambian el código (`index.html`, `city3d.js`), suban la versión `V` en `sw.js` para que los celulares bajen lo nuevo.
- Para probar el modo Hoy: `?ahora=2026-11-24T14:10` al final del link.

### Columnas de `itinerario.csv`
| Columna | Qué es |
|---|---|
| fecha / hora | `AAAA-MM-DD` y `HH:MM` (24 h) |
| lat / lon | coordenadas para el mapa |
| costo_usd_pp | costo **estimado** por persona en USD (0 = gratis/variable) |
| reserva | `si` / `no` |
| estado | `Confirmado`, `Por reservar` o `Por confirmar` |
| opcional | `si` = plan alternativo (no suma al presupuesto por defecto) |
| categoria | Comida, Vistas, Barrios, Museos, Temporada, Noche, Compras, Experiencias, Shows, Deportes, Íconos, Transporte u Hotel (define color e ícono) |

⚠️ Repo público: **no pongan códigos de reserva, nombres completos ni datos personales.**
