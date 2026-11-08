# 🗽 NYC · 21–28 nov 2026

Itinerario interactivo del viaje: **https://jacoal1234-creator.github.io/nyc-trip-2026/**

## Cómo cambiar algo
- **Proponer un cambio:** botón "✏️ Proponer cambio" en cada actividad (abre un Issue).
- **Editar directo:** `data/itinerario.csv` (actividades) y `data/reservas.csv` (checklist). La página se actualiza sola en 1–2 min.

### Columnas de `itinerario.csv`
| Columna | Qué es |
|---|---|
| fecha / hora | `AAAA-MM-DD` y `HH:MM` (24 h) |
| lat / lon | coordenadas para el mapa |
| costo_usd_pp | costo **estimado** por persona en USD (0 = gratis/variable) |
| reserva | `si` / `no` |
| estado | `Confirmado`, `Por reservar` o `Por confirmar` |
| opcional | `si` = plan alternativo (no suma al presupuesto por defecto) |

⚠️ Repo público: **no pongan códigos de reserva, nombres completos ni datos personales.**
