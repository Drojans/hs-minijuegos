# Estado actual estable

## Resumen

El proyecto está en un estado estable después de la migración completa a imágenes de cartas localizadas por idioma.

Funciona actualmente:

```text
Home: ES/EN OK
Base de datos: ES/EN OK
Adivina el coste: ES/EN OK
Grid de cartas: ES/EN OK
Impostor: ES/EN OK con overlays para minions, hechizos y armas
```

## Datos activos

La app carga una única base de cartas:

```text
public/data/cards.multilang.generated.json
```

La carga está centralizada en:

```text
src/hooks/useCardsData.js
```

No hay base legacy activa ni fallback a una base antigua.

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

La selección de nombres, textos, etiquetas e imágenes por idioma está centralizada en:

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

Los componentes no deben construir rutas de imágenes manualmente. Deben pedirlas a estos helpers.

## Impostor

Impostor usa renders `adapted` localizados más overlays locales:

```text
src/games/Impostor/minion-neutral-overlay-full.png
src/games/Impostor/spell-neutral-overlay-full.png
src/games/Impostor/weapon-neutral-overlay-full.png
```

## Limpieza realizada

Se eliminaron las carpetas y scripts legacy de imágenes, previews, reports y backups temporales. La estructura actual queda reducida al pipeline v2 y a la carpeta generada `public/card-images/`.
