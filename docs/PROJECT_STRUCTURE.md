# Estructura del proyecto

## Estado estable actual

Estado funcional actual:

```text
Home: selector global ES/EN funcionando
Base de datos: idioma global + preview de renders ES/EN funcionando
Adivina el coste: idioma global funcionando
Grid de cartas: idioma global funcionando
Impostor: pendiente de adaptar a idioma global
```

## App en uso

Estas carpetas y archivos se usan directamente por la app durante desarrollo/ejecución:

```text
src/
public/data/cards.json
public/data/cards.multilang.preview.json
public/fonts/
public/grid-icons/
public/ui/
```

## Datos activos

Archivos activos en runtime:

```text
public/data/cards.json
public/data/cards.multilang.preview.json
```

`cards.json` es la base principal de cartas.

`cards.multilang.preview.json` añade datos/imagenes localizadas de preview para ES/EN y se mezcla de forma centralizada desde:

```text
src/hooks/useCardsData.js
```

## Carga centralizada de cartas

La carga de cartas está centralizada en:

```text
src/hooks/useCardsData.js
```

Este hook carga:

```text
/data/cards.json
/data/cards.multilang.preview.json
```

y mezcla `imagesByLocale` mediante helpers de:

```text
src/utils/cardLocale.js
```

`App.jsx` pasa las cartas ya preparadas a los juegos/componentes.

## Juegos

Estructura actual:

```text
src/games/
  GuessManaCost/
    GuessManaCost.jsx
    GuessManaCost.css
    index.js

  CardGrid/
    CardGridGame.jsx
    CardGridGame.css

  Impostor/
    ImpostorGame.jsx
    ImpostorNeutralCard.jsx
    ...
```

Estado de idioma:

```text
GuessManaCost: adaptado
CardGrid: adaptado
Impostor: pendiente
```

## Helpers globales

Idioma global:

```text
src/i18n/LanguageProvider.jsx
src/i18n/translations.js
```

Helpers de cartas:

```text
src/utils/cardLocale.js
```

Incluye helpers para:

```text
getCardImage
getThumbImage
getGameImage
getDetailImage
getArtImage
getCardName
getSecondaryCardName
getCardText
mergeLocaleImages
translateCardClass
translateCardType
translateCardRarity
translateCardRace
getCardDisplayData
```

## Carpetas de imágenes de cartas

Estas carpetas existen en local, pero ya no deben estar trackeadas por Git:

```text
public/cards/
public/cards-optimized/
public/cards-normalized/
public/card-art/
public/card-art-optimized/
public/cards-localized/
public/cards-optimized-localized/
public/cards-normalized-localized/
```

No borrarlas todavía. La app local puede depender de ellas para mostrar renders.

A futuro habrá que decidir si estos assets viven en:

```text
CDN / hosting externo
Git LFS
script de regeneración
carpeta local documentada
```

## Assets ligeros que sí quedan en Git

```text
public/fonts/
public/grid-icons/
public/ui/
```

`public/grid-icons/` sí se mantiene porque es ligero y necesario para el Grid.

## Scripts

Los scripts siguen en:

```text
scripts/
```

No se mueven todavía. Están documentados en:

```text
docs/SCRIPTS.md
```

Moverlos a subcarpetas será una fase separada.
