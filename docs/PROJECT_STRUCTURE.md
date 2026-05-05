# Estructura del proyecto

Estado actualizado después de separar la Home, limpiar assets de `public/ui/book` y añadir rutas/páginas por minijuego.

## Raíz

```text
src/                 Código React de la app
public/data/         JSON activo de cartas
public/card-images/  Imágenes generadas de cartas, ignoradas por Git
public/ui/book/      Assets activos de la Home/libro
public/fonts/        Fuentes necesarias para UI/cartas
scripts/v2/          Pipeline actual de generación de imágenes
scripts/cleanup/     Scripts auxiliares de auditoría/limpieza
docs/                Documentación del proyecto
```

## Rutas de la app

La app usa rutas internas mediante History API, sin dependencia externa de router.

```text
/             Home / libro de misiones
/guess-mana   Adivina el coste
/impostor     Impostor
/grid         Grid de cartas
/cards        Base de datos
```

## `src/`

```text
src/App.jsx
src/App.css
src/index.css
src/main.jsx
```

`App.jsx` actúa como router/controlador de vistas. Carga los datos de cartas con `useCardsData()` y renderiza la página correspondiente.

`App.css` mantiene estilos globales mínimos.

## Páginas

```text
src/pages/HomePage.jsx
src/pages/GuessManaPage.jsx
src/pages/ImpostorPage.jsx
src/pages/CardGridPage.jsx
src/pages/CardDatabasePage.jsx
```

Las páginas son envoltorios finos. Sirven para que cada sección tenga su ruta propia sin mezclar la lógica interna de cada minijuego.

## Home / libro de misiones

```text
src/features/HomeBook/HomeBook.jsx
src/features/HomeBook/HomeBook.css
src/features/HomeBook/homeBookConfig.js
```

Responsabilidades:

```text
HomeBook.jsx        Estructura React de la Home
HomeBook.css        Layout, assets, hitboxes y animaciones de la Home
homeBookConfig.js   Configuración de modos, rutas, textos y variantes
```

La Home ya no vive directamente en `App.jsx`.

## Base de datos

```text
src/features/CardDatabase/CardDatabase.jsx
src/features/CardDatabase/CardDatabase.css
```

Usa los helpers de idioma e imágenes de cartas para mostrar la colección.

## Juegos

```text
src/games/GuessManaCost/
src/games/CardGrid/
src/games/Impostor/
```

Cada juego conserva su propia carpeta, CSS y lógica.

```text
src/games/GuessManaCost/GuessManaCost.jsx
src/games/GuessManaCost/GuessManaCost.css

src/games/CardGrid/CardGridGame.jsx
src/games/CardGrid/CardGridGame.css
src/games/CardGrid/assets/

src/games/Impostor/ImpostorGame.jsx
src/games/Impostor/ImpostorGame.css
src/games/Impostor/ImpostorNeutralCard.jsx
src/games/Impostor/ImpostorNeutralCard.css
```

## Componentes compartidos

```text
src/shared/components/GameLayout/
src/shared/components/LanguageToggle/
```

`LanguageToggle` controla ES/EN y en la Home usa la variante visual tipo libro con assets:

```text
public/ui/book/language-es-frame-cartoon.png
public/ui/book/language-en-frame-cartoon.png
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
public/data/cards.multilang.generated.json
```

`useCardsData()` carga el JSON activo.

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

Los componentes no deben construir rutas de imágenes manualmente. Deben pedirlas a estos helpers.

## Assets de la Home

La estructura activa está aplanada en:

```text
public/ui/book/
```

Assets activos principales:

```text
button-primary-purple-cartoon.png
divider-thin-black-cartoon.png
home-open-book-cartoon.png
home-tavern-backdrop-cartoon.webp
icon-featured-mission-star-cartoon.png
icon-mode-database-cartoon.png
icon-mode-grid-cartoon.png
icon-mode-impostor-cartoon.png
icon-mode-mana-cartoon.png
language-en-frame-cartoon.png
language-es-frame-cartoon.png
panel-featured-mission-cartoon.png
panel-game-row-cartoon.png
parchment-note-render.png
prop-bottom-coins-cartoon.png
prop-bottom-left-cards-cartoon.png
prop-left-candle-cartoon.png
prop-right-mug-cartoon.png
section-divider-cartoon.png
status-check-cartoon.png
status-cross-cartoon.png
status-minus-cartoon.png
```

Ya no deberían existir referencias activas a:

```text
public/ui/book/cartoon-v1/
public/ui/book/render-v1/
```

## Imágenes de cartas

`public/card-images/` no está en Git. Se genera con `scripts/v2/generate-card-images-multilang.mjs`.

Estructura:

```text
public/card-images/es/thumb/ID.webp
public/card-images/es/game/ID.webp
public/card-images/es/adapted/ID.webp
public/card-images/en/thumb/ID.webp
public/card-images/en/game/ID.webp
public/card-images/en/adapted/ID.webp
```

## Editor temporal de layout

```text
src/dev/LayoutEditor.jsx
```

Sigue disponible para ajustar la Home con:

```text
/?layoutEditor=1
```

Cuando el diseño quede cerrado, se puede decidir si mantenerlo solo en desarrollo o retirarlo.
