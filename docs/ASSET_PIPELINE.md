# Pipeline de assets de cartas

## Objetivo

Mantener un único sistema de imágenes de cartas, localizado por idioma, optimizado en WebP y sin guardar renders PNG pesados en `public/`.

## Estructura activa

```text
public/card-images/
  es/
    thumb/
    game/
    adapted/
  en/
    thumb/
    game/
    adapted/
```

## Variantes

### `thumb`

Miniatura ligera para listados, grids y base de datos.

```text
/card-images/es/thumb/ID.webp
/card-images/en/thumb/ID.webp
```

### `game`

Carta completa optimizada para minijuegos.

```text
/card-images/es/game/ID.webp
/card-images/en/game/ID.webp
```

### `adapted`

Carta recortada/adaptada para que los renders tengan tamaños visuales comparables.

```text
/card-images/es/adapted/ID.webp
/card-images/en/adapted/ID.webp
```

Es la variante usada por Impostor y por vistas donde interesa eliminar bordes/aire visual.

## Qué no se guarda ahora

No se guarda en runtime:

```text
raw PNG
detail grande
arte puro aislado
```

Si en el futuro se necesita zoom grande o minijuegos basados en arte, se puede ampliar la estructura con nuevas carpetas como `detail/` o `art/`.

## Script activo

```text
scripts/v2/generate-card-images-multilang.mjs
```

Comandos útiles:

```powershell
node scripts/v2/generate-card-images-multilang.mjs --limit=20
node scripts/v2/generate-card-images-multilang.mjs --types=MINION,SPELL,WEAPON --limit=30
node scripts/v2/generate-card-images-multilang.mjs --ids=AV_244 --overwrite
node scripts/v2/generate-card-images-multilang.mjs --all
```

## Salida del script

Genera:

```text
public/card-images/{es,en}/thumb/ID.webp
public/card-images/{es,en}/game/ID.webp
public/card-images/{es,en}/adapted/ID.webp
public/data/cards.multilang.generated.json
```

También genera reportes temporales en `reports/`, carpeta ignorada por Git.

## JSON activo

Cada carta de `cards.multilang.generated.json` usa `imagesByLocale`:

```json
{
  "imagesByLocale": {
    "es": {
      "thumb": "/card-images/es/thumb/ID.webp",
      "game": "/card-images/es/game/ID.webp",
      "adapted": "/card-images/es/adapted/ID.webp"
    },
    "en": {
      "thumb": "/card-images/en/thumb/ID.webp",
      "game": "/card-images/en/game/ID.webp",
      "adapted": "/card-images/en/adapted/ID.webp"
    }
  }
}
```

## Regla de oro

Los componentes no deben montar rutas manualmente ni leer campos legacy. Deben usar helpers de:

```text
src/utils/cardLocale.js
```
