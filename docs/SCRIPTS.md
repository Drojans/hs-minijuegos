# Scripts del proyecto

Este documento clasifica los scripts actuales para evitar ejecutar scripts destructivos por error.

## Estado general

Los scripts siguen estando en:

```text
scripts/
```

De momento no se mueven de carpeta. Primero se documentan y se decide cuáles siguen activos, cuáles son de pipeline y cuáles son legacy.

## Scripts seguros de diagnóstico

Estos scripts leen datos y generan informes. No deberían modificar `cards.json`.

### `scripts/diagnose-cards-data.mjs`

Uso:

```bash
node scripts/diagnose-cards-data.mjs
```

Función:

```text
Lee public/data/cards.json
Comprueba campos principales
Comprueba rutas de imágenes dentro de public/
Genera reports/cards-data-diagnostic.json
Genera reports/cards-data-diagnostic.txt
```

Estado:

```text
Mantener.
Seguro para usar.
```

### `scripts/compare-hearthstonejson.mjs`

Uso:

```bash
node scripts/compare-hearthstonejson.mjs
```

Función:

```text
Compara la base actual con datos de HearthstoneJSON
Genera informes en reports/
No cambia cards.json
```

Estado:

```text
Mantener.
Seguro para usar.
```

## Scripts de pipeline HearthstoneJSON / nuevas cartas

Estos scripts fueron usados para incorporar nuevas cartas y renders.

### `scripts/generate-cards-es-preview.mjs`

Función:

```text
Lee public/data/cards.json
Genera public/data/cards.generated.es.json
Genera reports/cards-generated-preview.*
Genera reports/new-cards-to-download.*
```

Estado:

```text
Mantener como pipeline.
No ejecutar sin revisar antes.
```

Nota:

```text
public/data/cards.generated.es.json ahora está archivado/ignorado.
Si se necesita de nuevo, se regenera con este script.
```

### `scripts/download-new-card-images-test.mjs`

Función:

```text
Lee reports/new-cards-to-download.json
Descarga renders
Genera imágenes en:
  public/cards/
  public/cards-optimized/
  public/cards-normalized/
  public/card-art-optimized/
No modifica public/data/cards.json
```

Estado:

```text
Mantener como pipeline.
No ejecutar sin un plan de descarga claro.
```

### `scripts/apply-generated-image-paths.mjs`

Función:

```text
Lee public/data/cards.generated.es.json
Lee reports/new-cards-to-download.json
Genera public/data/cards.generated.es.with-images.json
Puede actualizar cards.generated.es.json con --in-place
No debería tocar cards.json salvo que se modifique el script.
```

Estado:

```text
Mantener como pipeline.
Ahora mismo depende de archivos generados que pueden estar archivados o ignorados.
```

### `scripts/switch-cards-data.mjs`

Función:

```text
Cambia public/data/cards.json por public/data/cards.generated.es.with-images.json
Puede restaurar public/data/cards.original.before-generated-es.json
```

Estado:

```text
Peligroso.
No ejecutar de momento.
```

Motivo:

```text
Los JSON generados/originales fueron movidos o ignorados.
El script sigue apuntando a public/data.
Si se mantiene, habría que adaptarlo para usar data-archive/ o regenerar los JSON antes.
```

## Scripts legacy de imágenes

Estos scripts modifican `cards.json` y generan backups. Hay que usarlos con cuidado.

### `scripts/generate-card-images.mjs`

Función:

```text
Lee public/data/cards.json
Genera public/cards-optimized/thumb
Genera public/cards-optimized/game
Genera public/cards-optimized/detail
Crea public/data/cards.backup.json
Actualiza rutas en cards.json
```

Estado:

```text
Legacy útil.
No ejecutar ahora sin revisar.
```

Pendiente:

```text
Cambiar backup de public/data/cards.backup.json a data-archive/ o reports/.
```

### `scripts/generate-card-art.mjs`

Función:

```text
Lee public/data/cards.json
Lee public/card-art/512
Genera public/card-art-optimized/512
Crea public/data/cards.before-art.json
Actualiza imageArt en cards.json
```

Estado:

```text
Legacy útil.
No ejecutar ahora sin revisar.
```

Pendiente:

```text
Mover fuente public/card-art/ fuera de public o adaptar script.
Cambiar backup a data-archive/ o reports/.
```

### `scripts/generate-card-renders-normalized.mjs`

Función:

```text
Lee public/data/cards.json
Genera public/cards-normalized
Crea public/data/cards.before-normalized-renders.json
Genera public/data/normalized-renders-report.json
Actualiza imageRenderNormalized en cards.json
```

Estado:

```text
Legacy útil.
No ejecutar ahora sin revisar.
```

Pendiente:

```text
Cambiar backup y report fuera de public/data.
```

## Script de preview multiidioma

### `scripts/create-multilang-preview.mjs`

Función:

```text
Lee public/data/cards.json
Genera public/data/cards.multilang.preview.json
Genera:
  public/cards-localized/
  public/cards-optimized-localized/
  public/cards-normalized-localized/
Genera reports/multilang-preview.*
```

Estado:

```text
Mantener como herramienta de desarrollo.
No es el pipeline multiidioma final.
```

## Reglas de uso

Antes de ejecutar cualquier script que escriba datos o imágenes:

```text
1. git status debe estar limpio
2. hacer backup/commit previo
3. revisar qué archivos escribe
4. ejecutar primero con --dry-run si existe
5. revisar resultado
6. commit separado si funciona
```

## Organización futura recomendada

Todavía no mover scripts, pero la estructura futura podría ser:

```text
scripts/data/
  compare-hearthstonejson.mjs
  generate-cards-es-preview.mjs
  apply-generated-image-paths.mjs
  switch-cards-data.mjs

scripts/images/
  generate-card-images.mjs
  generate-card-art.mjs
  generate-card-renders-normalized.mjs
  download-new-card-images-test.mjs

scripts/dev/
  diagnose-cards-data.mjs
  create-multilang-preview.mjs
```

Cuando se muevan, habrá que actualizar documentación y comandos.
