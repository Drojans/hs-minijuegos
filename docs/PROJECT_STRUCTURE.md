# Estructura del proyecto

## App en uso

Estas carpetas y archivos se usan directamente por la app durante el desarrollo o ejecución:

```text
src/
public/data/cards.json
public/data/cards.multilang.preview.json
public/fonts/
public/grid-icons/
public/ui/
```

## Carpetas de imágenes de cartas

Estructura actual de imágenes:

```text
public/cards/
public/cards-optimized/
public/cards-normalized/
public/card-art-optimized/
```

Significado:

```text
public/cards/
  Renders originales de cartas. Se mantienen como fallback.

public/cards-optimized/
  Variantes optimizadas de renders:
    thumb/
    game/
    detail/

public/cards-normalized/
  Renders normalizados/recortados usados por juegos donde importa el tamaño consistente.

public/card-art-optimized/
  Artes optimizados usados principalmente por las plantillas neutrales del Impostor.
```

No borrar estas carpetas todavía. Algunas cartas todavía dependen de rutas fallback.

## Carpetas multiidioma temporales / preview

```text
public/cards-localized/
public/cards-optimized-localized/
public/cards-normalized-localized/
```

Se crearon para la preview ES/EN. De momento son experimentales y no deberían tratarse aún como la estructura definitiva del sistema multiidioma.

## Datos

Archivos activos:

```text
public/data/cards.json
public/data/cards.multilang.preview.json
```

Archivos temporales/generados que no deberían vivir en `public/data` a largo plazo:

```text
public/data/cards.backup.json
public/data/cards.before-art.json
public/data/cards.before-normalized-renders.json
public/data/cards.generated.es.json
public/data/cards.generated.es.with-images.json
public/data/cards.original.before-generated-es.json
public/data/normalized-renders-report.json
```

Más adelante deberían moverse a una carpeta de archivo o reports fuera de `public`, o regenerarse cuando hagan falta.

## Scripts

Ahora mismo están en:

```text
scripts/
```

Organización recomendada para el futuro:

```text
scripts/data/
scripts/images/
scripts/dev/
```

No mover scripts hasta revisar sus comandos y rutas relativas.
