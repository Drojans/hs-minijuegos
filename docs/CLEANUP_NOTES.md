# Notas de limpieza

## Estado final

El proyecto quedó migrado a una estructura única de imágenes localizadas:

```text
public/card-images/{es,en}/{thumb,game,adapted}/
```

La app usa una única base de datos:

```text
public/data/cards.multilang.generated.json
```

## Limpiezas realizadas

Se eliminaron del proyecto las estructuras legacy de imágenes, previews multiidioma antiguas, reports generados, backups de datos, scripts legacy y assets iniciales no usados.

La carpeta `public/card-images/` queda fuera de Git porque contiene imágenes generadas.

## Comprobaciones recomendadas

Búsqueda de referencias legacy en código activo:

```powershell
Get-ChildItem -Path "src","scripts\v2" -Recurse -File |
  Select-String -Pattern "cards.multilang.preview|public/ui|/ui/|cards-normalized-localized|cards-optimized-localized|public/cards/|/cards/|card-art|cards-normalized|cards-optimized|imageArt|imageDetail|imageGame|imageThumb|imageRenderNormalized"
```

Esta búsqueda debería no devolver resultados.

Prueba funcional:

```powershell
npm run dev
```

Prueba de build:

```powershell
npm run build
```

## Regla de mantenimiento

Si se añade una nueva variante de imagen en el futuro, debe añadirse dentro de `public/card-images/{locale}/` y exponerse mediante helpers de `src/utils/cardLocale.js`.
