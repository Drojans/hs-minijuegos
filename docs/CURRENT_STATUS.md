# Estado actual estable

## Resumen

El proyecto está en un estado estable después de estas fases:

```text
Fase 1: CSS de Home limpiado
Fase 2: assets de Home limpiados y aplanados
Fase 3: Home separada en src/features/HomeBook/
Fase 4: páginas/rutas por minijuego añadidas
```

Funciona actualmente:

```text
Home/libro: ES/EN OK, hitboxes OK, hover OK
Base de datos: ES/EN OK
Adivina el coste: ES/EN OK
Grid de cartas: ES/EN OK
Impostor: ES/EN OK con overlays para minions, hechizos y armas
```

## Rutas activas

```text
/             Home
/guess-mana   Adivina el coste
/impostor     Impostor
/grid         Grid de cartas
/cards        Base de datos
```

Cada sección tiene su página en:

```text
src/pages/
```

## Home actual

La Home vive en:

```text
src/features/HomeBook/
```

Archivos principales:

```text
HomeBook.jsx
HomeBook.css
homeBookConfig.js
```

La Home usa assets directos en:

```text
public/ui/book/
```

No debería depender de carpetas antiguas como:

```text
public/ui/book/cartoon-v1/
public/ui/book/render-v1/
```

## Hitboxes y hover de Home

Los botones de la Home usan zonas reales de click/hover definidas en `HomeBook.css`.

Elementos cubiertos:

```text
modos de juego
misión destacada
botón morado
idiomas
```

Los idiomas ya usan botones reales con assets completos:

```text
language-es-frame-cartoon.png
language-en-frame-cartoon.png
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

## Imágenes activas de cartas

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

## Comprobaciones recomendadas

```powershell
npm run dev
npm run build
```

Pruebas manuales:

```text
Cambiar ES/EN en Home
Entrar a /guess-mana desde Home y volver
Entrar a /impostor desde Home y volver
Entrar a /grid desde Home y volver
Entrar a /cards desde Home y volver
Recargar directamente en cada ruta
Comprobar hover/click de Home
```
