# Estructura del proyecto

## Raíz

```text
src/                 Código React de la app
public/data/         JSON activos de cartas
public/card-images/  Imágenes generadas por idioma, ignoradas por Git
public/fonts/        Fuentes necesarias para la UI/cartas
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

Carga la app, la navegación principal y la home.

## Componentes globales

```text
src/components/CardBrowser.jsx
src/components/CardBrowser.css
src/components/LanguageToggle.jsx
src/components/LanguageToggle.css
```

`CardBrowser` usa:

```text
thumb     → casillas/listado
adapted   → vista grande/detalle
```

Siempre mediante helpers de `src/utils/cardLocale.js`.

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

Carga primero:

```text
/data/cards.multilang.generated.json
```

Y si falla, usa fallback:

```text
/data/cards.json
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
fallbacks seguros
bloqueo de rutas legacy eliminadas
```

## Juegos

```text
src/games/GuessManaCost/
src/games/CardGrid/
src/games/Impostor/
```

Todos están conectados al idioma global.

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
cards.json
cards.multilang.generated.json
```

`cards.multilang.generated.json` es la base activa.

`cards.json` queda como fallback de seguridad.

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
