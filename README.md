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
