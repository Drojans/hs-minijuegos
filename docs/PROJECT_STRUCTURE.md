# Estructura del proyecto

## Raíz

```text
src/                 Código React de la app
public/data/         JSON activo de cartas
public/card-images/  Imágenes generadas por idioma, ignoradas por Git
public/fonts/        Fuentes necesarias para UI/cartas
public/grid-icons/   Iconos del modo Grid
scripts/v2/          Pipeline actual de generación de imágenes
```

## `src/`

```text
src/App.jsx
src/App.css
src/index.css
src/main.jsx
```

Contiene la app, navegación principal y estilos globales.

## Componentes globales

```text
src/components/CardBrowser.jsx
src/components/CardBrowser.css
src/components/LanguageToggle.jsx
src/components/LanguageToggle.css
```

`CardBrowser` usa imágenes localizadas mediante helpers:

```text
thumb   → casillas/listado
adapted → vista grande/detalle
```

## Idioma

```text
src/i18n/LanguageProvider.jsx
src/i18n/translations.js
```

Controlan idioma global ES/EN y textos de interfaz.

## Datos de cartas

```text
src/hooks/useCardsData.js
```

Carga:

```text
/data/cards.multilang.generated.json
```

## Helpers de cartas

```text
src/utils/cardLocale.js
```

Responsable de:

```text
nombres por idioma
texto por idioma
rutas de imágenes por idioma
traducciones de clase/tipo/rareza/raza
```

## Juegos

```text
src/games/GuessManaCost/
src/games/CardGrid/
src/games/Impostor/
```

Todos están conectados al idioma global y usan los helpers de cartas.

## Impostor

```text
src/games/Impostor/ImpostorGame.jsx
src/games/Impostor/ImpostorGame.css
src/games/Impostor/ImpostorNeutralCard.jsx
src/games/Impostor/ImpostorNeutralCard.css
src/games/Impostor/minion-neutral-overlay-full.png
src/games/Impostor/spell-neutral-overlay-full.png
src/games/Impostor/weapon-neutral-overlay-full.png
```

Las cartas ocultas se montan con:

```text
render adapted localizado + overlay PNG local
```

## `public/data/`

```text
cards.multilang.generated.json
```

Es la única base activa de cartas.

## `public/card-images/`

No está en Git. Se genera con `scripts/v2/generate-card-images-multilang.mjs`.

Estructura:

```text
public/card-images/es/thumb/ID.webp
public/card-images/es/game/ID.webp
public/card-images/es/adapted/ID.webp
public/card-images/en/thumb/ID.webp
public/card-images/en/game/ID.webp
public/card-images/en/adapted/ID.webp
```
