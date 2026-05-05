# Notas de limpieza

## Estado actual

El proyecto quedó migrado a:

```text
Home separada en src/features/HomeBook/
páginas/rutas independientes en src/pages/
assets de Home aplanados en public/ui/book/
imágenes de cartas localizadas en public/card-images/{es,en}/{thumb,game,adapted}/
```

La app usa una única base de datos:

```text
public/data/cards.multilang.generated.json
```

## Limpiezas realizadas

Se eliminaron o archivaron estructuras legacy de:

```text
assets antiguos de Home
assets render-v1
assets cartoon-v1 antiguos
emojis/banderas antiguas de idioma
CSS temporal de pruebas
clip-path
:has(...)
hitboxes rotas anteriores
```

La Home quedó centralizada en:

```text
src/features/HomeBook/HomeBook.jsx
src/features/HomeBook/HomeBook.css
src/features/HomeBook/homeBookConfig.js
```

## Assets de Home

Los assets activos están directamente en:

```text
public/ui/book/
```

Ya no deberían aparecer referencias a:

```text
/ui/book/cartoon-v1/
/ui/book/render-v1/
```

Comprobación:

```powershell
Get-ChildItem "src" -Recurse -File | Select-String -Pattern "cartoon-v1", "render-v1"
```

## Scripts de limpieza

Scripts auxiliares:

```text
scripts/cleanup/audit-book-assets-phase2.ps1
scripts/cleanup/archive-unused-book-assets-phase2.ps1
```

`audit-book-assets-phase2.ps1` lista qué assets de `public/ui/book` aparecen referenciados en el código.

## Comprobaciones recomendadas

Búsqueda de referencias legacy en código activo:

```powershell
Get-ChildItem -Path "src","scripts\v2" -Recurse -File |
  Select-String -Pattern "cards.multilang.preview|cards-normalized-localized|cards-optimized-localized|public/cards/|/cards/|card-art|cards-normalized|cards-optimized|imageArt|imageDetail|imageGame|imageThumb|imageRenderNormalized"
```

Búsqueda específica de assets antiguos de Home:

```powershell
Get-ChildItem "src" -Recurse -File |
  Select-String -Pattern "cartoon-v1", "render-v1", "flag-es-cartoon", "flag-gb-cartoon", "toggle-language-button"
```

Prueba funcional:

```powershell
npm run dev
```

Prueba de build:

```powershell
npm run build
```

## Regla de mantenimiento

Si se añade una nueva variante de imagen de carta, debe añadirse dentro de `public/card-images/{locale}/` y exponerse mediante helpers de:

```text
src/utils/cardLocale.js
```

Si se añade un nuevo asset de Home, debe ir directamente en:

```text
public/ui/book/
```

y referenciarse desde `HomeBook.css` o `homeBookConfig.js`.
