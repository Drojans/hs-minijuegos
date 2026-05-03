# Estado actual estable

## Resumen

El proyecto está en un estado estable después de la migración de imágenes multiidioma y la limpieza de assets antiguos.

Funciona actualmente:

```text
Home: ES/EN OK
Base de datos: ES/EN OK
Adivina el coste: ES/EN OK
Grid de cartas: ES/EN OK
Impostor: ES/EN OK con overlays para minions, hechizos y armas
```

## Datos activos

La app carga las cartas desde:

```text
public/data/cards.multilang.generated.json
```

Y mantiene este archivo como fallback:

```text
public/data/cards.json
```

La carga está centralizada en:

```text
src/hooks/useCardsData.js
```

## Imágenes activas

La estructura activa de imágenes es:

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

Esta carpeta está ignorada en Git porque contiene imágenes generadas y pesa demasiado para el repositorio normal.

## Helpers activos

La selección de nombres, textos e imágenes por idioma se centraliza en:

```text
src/utils/cardLocale.js
```

Helpers principales:

```text
getCardName
getSecondaryCardName
getCardText
getThumbImage
getGameImage
getAdaptedImage
getDetailImage
translateCardClass
translateCardType
translateCardRarity
translateCardRace
```

Todos los juegos deberían pedir imágenes mediante estos helpers, no leyendo campos antiguos directamente.

## Impostor

Impostor usa renders localizados `adapted` más overlays locales:

```text
src/games/Impostor/minion-neutral-overlay-full.png
src/games/Impostor/spell-neutral-overlay-full.png
src/games/Impostor/weapon-neutral-overlay-full.png
```

Ya no depende de:

```text
public/ui/
public/card-art/
public/card-art-optimized/
```

## Carpetas antiguas eliminadas o archivadas fuera del proyecto

```text
public/cards/
public/cards-optimized/
public/cards-normalized/
public/cards-localized/
public/cards-optimized-localized/
public/cards-normalized-localized/
public/card-art/
public/card-art-optimized/
public/ui/
src/assets/
reports/
data-archive/
```

Si alguna reaparece por ejecutar scripts viejos o copiar backups, `.gitignore` evita que entren en Git.
