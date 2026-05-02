# Pipeline de assets

## Situación actual

El proyecto usa varias carpetas de imágenes generadas. Algunas son assets reales de la app y otras son fuente o temporales.

## Carpetas runtime

Estas carpetas se usan actualmente por la app o por rutas en `cards.json`:

```text
public/cards/
public/cards-optimized/
public/cards-normalized/
public/card-art-optimized/
public/grid-icons/
public/ui/
public/fonts/
```

## Carpetas fuente o temporales

```text
public/card-art/
```

Parece contener arte fuente sin optimizar. Más adelante debería moverse fuera de `public/`, por ejemplo:

```text
asset-sources/card-art/
```

Pero solo después de actualizar los scripts que dependan de esa carpeta.

## Prioridad recomendada de imágenes

La app debería preferir imágenes optimizadas/localizadas cuando existan.

Orden general:

```text
1. imagesByLocale[locale][imageType]
2. imagesByLocale[otherLocale][imageType]
3. card[imageType]
4. campos fallback de imagen
```

Helper actual:

```text
src/utils/cardLocale.js
```

## Preview multiidioma

La preview ES/EN actual usa:

```text
public/data/cards.multilang.preview.json
public/cards-localized/
public/cards-optimized-localized/
public/cards-normalized-localized/
```

Es una preview validada, no el pipeline definitivo completo.

Antes de generar miles de imágenes multiidioma, hay que decidir la estructura final.

## Posible estructura futura

```text
public/card-images/
  es/
    raw/
    thumb/
    game/
    detail/
    normalized/
    art/
  en/
    raw/
    thumb/
    game/
    detail/
    normalized/
    art/
```

Esto evitaría tener tantas carpetas separadas en la raíz de `public/`.

## Regla de limpieza

Nunca borrar una carpeta de imágenes hasta comprobar:

```text
1. cards.json ya no la referencia
2. ningún componente la referencia
3. los scripts están actualizados
4. un script de validación confirma que no faltan rutas
```
