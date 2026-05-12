# Mapa del proyecto HS minijuegos

Este documento explica qué controla cada carpeta y qué archivo tocar cuando quieras cambiar textos, estilos, lógica o assets.

## Regla rápida para orientarte

- **Rutas y navegación general:** `src/App.jsx`
- **Header de toda la web:** `src/shared/components/SiteHeader/`
- **Fondo y ancho base de los minijuegos:** `src/shared/components/GamePageShell/`
- **Instrucciones / selección diario-infinito:** `src/shared/components/GameModeSelect/` y `src/shared/config/gameIntroCopy.js`
- **Modal final de resultado:** `src/shared/components/GameResultOverlay/`
- **Textos generales ES/EN:** `src/i18n/translations.js`
- **Textos concretos de un minijuego:** archivo `*Copy.js` dentro de ese minijuego
- **Reglas/config de un minijuego:** archivo `*Config.js`, `*Definitions.js`, `*Constants.js` o `*Utils.js` dentro de ese minijuego
- **Estilos concretos de un minijuego:** su archivo `*Game.css`
- **Datos de cartas:** `public/data/cards.multilang.generated.json`
- **Imágenes renderizadas de cartas:** `public/card-images/` — no se mete en zip ni Git normalmente

---

## Raíz del proyecto

```text
package.json
```
Define dependencias y scripts. Lo normal es usar:

```bash
npm run dev
npm run build
npm run lint
```

```text
vite.config.js
```
Configuración de Vite. No deberías tocarlo salvo que cambies build, alias o plugins.

```text
eslint.config.js
```
Reglas de lint. No hace falta tocarlo salvo que cambies convenciones del proyecto.

```text
index.html
```
HTML base donde React monta la app.

```text
Pendiente futuro.txt
```
Notas tuyas de cosas pendientes. No controla la app.

---

## `src/` — código principal React

### Archivos raíz de `src`

```text
src/main.jsx
```
Punto de entrada de React. Monta `<App />` dentro del HTML.

```text
src/App.jsx
```
Controla el router simple de la web. Aquí se decide qué página se muestra según la URL:

```text
/              → Home
/guess-mana    → Adivina el coste
/impostor      → Impostor
/grid          → Grid
/pyramid       → Pirámide
/higher-lower  → Mayor o menor
/hidden-card   → Carta oculta
/cards         → Base de datos
/collection    → Colección
/player        → Perfil
```

También carga el header global `SiteHeader` y pasa las cartas a las páginas.

```text
src/App.css
```
Variables globales, fuente, color de fondo base y layout general de la app.

```text
src/index.css
```
Reset global mínimo de HTML/body. No metas aquí estilos específicos de páginas.

---

## `src/pages/` — adaptadores de ruta

Son archivos pequeños. Cada uno conecta una ruta con su página real. Normalmente no hay que tocar mucho aquí.

```text
HomePage.jsx              → carga HomeV2
GuessManaPage.jsx         → carga GuessManaCost
HiddenCardPage.jsx        → carga HiddenCardGame
HigherLowerPage.jsx       → carga HigherLowerGame
ImpostorPage.jsx          → carga ImpostorGame
PyramidPage.jsx           → carga PyramidGame
CardGridPage.jsx          → carga CardGridGame
CardDatabasePage.jsx      → carga CardDatabase
CollectionPage.jsx        → carga CollectionHub
PlayerProfilePage.jsx     → carga PlayerProfile
```

Toca estos archivos solo si quieres cambiar qué componente se usa en una ruta o pasar props nuevas.

---

## `src/features/` — páginas que no son minijuegos

### `src/features/HomeV2/`

Controla la home actual.

```text
HomeV2.jsx
```
Estructura y lógica de la home: tarjetas de modos, progreso diario, navegación.

```text
HomeV2.css
```
Estilos específicos de la home.

```text
homeV2Config.js
```
Textos y configuración de la home: títulos, subtítulos, descripciones e items que aparecen como modos/secciones.

**Para cambiar un texto de la home:** mira primero `homeV2Config.js`.

### `src/features/CardDatabase/`

Controla la base de datos de cartas.

```text
CardDatabase.jsx
```
Interfaz, filtros, buscador, listado y estado de la página.

```text
CardDatabase.css
```
Estilos de la base de datos.

```text
cardDatabaseConfig.js
```
Configuración de filtros, órdenes de clases/tipos/rareza, textos ES/EN de la base de datos y funciones de filtrado.

**Para cambiar filtros o textos de la base de datos:** `cardDatabaseConfig.js`.

### `src/features/CollectionHub/`

Controla la colección del jugador.

```text
CollectionHub.jsx
```
Lógica e interfaz de colección: cartas obtenidas, filtros, cajas, etc.

```text
CollectionHub.css
```
Estilos de colección.

Los datos de cartas poseídas se guardan con helpers compartidos de `src/shared/collection/`.

### `src/features/PlayerProfile/`

Controla el perfil del jugador.

```text
PlayerProfile.jsx
```
Interfaz y lógica de perfil: progreso, recompensas, exportar/importar/reiniciar datos si está implementado en esa pantalla.

```text
PlayerProfile.css
```
Estilos del perfil.

Los datos reales vienen de `src/shared/player/`, `src/shared/progress/`, `src/shared/rewards/` y `src/shared/collection/`.

---

## `src/shared/` — piezas comunes reutilizadas

Esta carpeta es la más importante para no duplicar cosas.

### `src/shared/components/SiteHeader/`

Header global de toda la página.

```text
SiteHeader.jsx
SiteHeader.css
```

Aparece siempre arriba porque se renderiza desde `App.jsx`.

**Para cambiar el header en toda la web:** toca aquí.

### `src/shared/components/GamePageShell/`

Envoltorio común de las páginas de minijuego.

```text
GamePageShell.jsx
GamePageShell.css
```

Controla el fondo, espaciado y contenedor base de todos los minijuegos.

**Para cambiar el fondo/espaciado común de los minijuegos:** toca aquí.

### `src/shared/components/GameModeSelect/`

Pantalla/modal inicial de instrucciones y selección de modo.

```text
GameModeSelect.jsx
GameModeSelect.css
```

Controla la estructura visual común: título, descripción, reglas, imagen de ejemplo, diario/infinito y botón de empezar.

Los textos que muestra vienen principalmente de:

```text
src/shared/config/gameIntroCopy.js
```

**Para cambiar cómo se ve el modal de instrucciones en todos los juegos:** `GameModeSelect.css` y/o `GameModeSelect.jsx`.

**Para cambiar textos de instrucciones de un juego:** `gameIntroCopy.js`.

### `src/shared/components/GameResultOverlay/`

Modal final común de resultado.

```text
GameResultOverlay.jsx
GameResultOverlay.css
```

Controla la ventana que aparece al ganar/perder/acertar/fallar: fondo oscuro, tarjeta central, título, mensaje, recompensa, botones y animaciones.

Cada minijuego tiene un wrapper propio en su carpeta `components/*ResultOverlay.jsx`, pero todos acaban usando este componente común.

**Para cambiar el modal final de todos los juegos:** toca aquí.

### `src/shared/components/LanguageToggle/`

Selector de idioma ES/EN.

```text
LanguageToggle.jsx
LanguageToggle.css
```

Se usa en el header global.

### `src/shared/config/`

```text
gameIntroCopy.js
```
Textos de entrada/instrucciones de todos los minijuegos. Este es uno de los archivos más útiles para cambios rápidos.

```text
gameRules.js
```
IDs y reglas comunes de minijuegos, por ejemplo identificadores usados para progreso diario.

### `src/shared/gameModes/`

```text
gameModes.js
```
Constantes y helpers relacionados con modo diario/infinito y selección determinista diaria.

### `src/shared/storage/`

```text
localStorage.js
```
Helpers seguros para leer/escribir en `localStorage`.

### `src/shared/progress/`

```text
dailyProgress.js
```
Guarda y lee el progreso diario de retos.

**Si un reto diario aparece como completado o no completado:** probablemente pasa por aquí.

### `src/shared/rewards/`

```text
rewardStore.js
```
Controla recompensas/cajas obtenidas.

### `src/shared/packs/`

```text
packOpening.js
```
Lógica de apertura de cajas/sobres.

### `src/shared/collection/`

```text
collectionStore.js
```
Controla cartas que el jugador posee en localStorage.

### `src/shared/player/`

```text
playerProfileStore.js
```
Guarda/lee el perfil local del jugador.

```text
playerDataAdapter.js
```
Une datos de perfil, progreso, colección y recompensas para mostrarlos en pantallas como perfil.

```text
index.js
```
Reexporta cosas de player para importar más cómodo.

---

## `src/i18n/` — idioma general

```text
LanguageProvider.jsx
```
Contexto React que guarda el idioma actual y permite cambiarlo.

```text
translations.js
```
Diccionario general ES/EN. Aquí están textos comunes de navegación, botones, etiquetas generales y claves compartidas.

**Para cambiar textos generales de la app:** `translations.js`.

**Para cambiar textos específicos de un minijuego:** mejor mira primero su `*Copy.js` o `gameIntroCopy.js`.

---

## `src/hooks/`

```text
useCardsData.js
```
Carga `public/data/cards.multilang.generated.json` y devuelve `cards` y `loading`.

Si la web no carga cartas, revisa aquí o el JSON de `public/data/`.

---

## `src/utils/`

```text
cardLocale.js
```
Helpers para sacar nombre, texto, imagen y campos localizados de una carta según idioma.

Se usa en casi todos los juegos.

---

# Minijuegos

Todos los minijuegos siguen una idea parecida:

```text
<Nombre>Game.jsx       → estado principal y flujo del juego
<Nombre>Game.css       → estilos específicos de ese juego
*Copy.js               → textos propios del juego
*Config.js             → config/exportaciones principales
*Constants.js          → números fijos del juego
*Definitions.js        → listas de preguntas/categorías/reglas
*Utils.js              → helpers puros
components/            → piezas visuales internas del juego
assets/                → imágenes específicas de ese juego
```

## `src/games/GuessManaCost/` — Adivina el coste

```text
GuessManaCost.jsx
```
Controla modo diario/infinito, carta actual, respuesta elegida, resultado, guardado diario y recompensa.

```text
GuessManaCost.css
```
Estilos propios del juego.

```text
guessManaConfig.js
```
Configuración y helpers: número de rondas, valores de maná, qué cartas son válidas, cómo elegir carta aleatoria, imagen de carta.

```text
guessManaCopy.js
```
Textos propios del juego durante la partida y resultado.

```text
components/GuessManaCardPreview.jsx
```
Vista de la carta con el coste tapado.

```text
components/GuessManaCrystalDisplay.jsx
```
Cristal/valor seleccionado.

```text
components/GuessManaSelector.jsx
```
Botones para elegir coste 0-10.

```text
components/GuessManaStage.jsx
```
Composición principal de carta + selector + controles.

```text
components/GuessManaResultOverlay.jsx
```
Wrapper del resultado de este juego que usa `GameResultOverlay`.

```text
components/GuessManaEmptyState.jsx
```
Estado de carga/sin cartas.

**Para cambiar textos de partida:** `guessManaCopy.js`.

**Para cambiar reglas de cartas válidas o rondas:** `guessManaConfig.js`.

**Para cambiar el aspecto del juego:** `GuessManaCost.css` o componentes internos.

## `src/games/HiddenCard/` — Carta oculta

```text
HiddenCardGame.jsx
```
Controla carta oculta, intentos, pistas, formulario, victoria/derrota, diario/infinito y recompensa.

```text
HiddenCardGame.css
```
Estilos propios del juego.

```text
hiddenCardConfig.js
```
Helpers de carta válida, sugerencias, normalización de respuestas, pistas y validación de acierto.

```text
hiddenCardCopy.js
```
Textos propios de Carta oculta.

```text
components/HiddenCardPreview.jsx
```
Imagen de la carta oculta/revelada.

```text
components/HiddenCardGuessForm.jsx
```
Input y botón de adivinar.

```text
components/HiddenCardHintList.jsx
```
Lista de pistas.

```text
components/HiddenCardGuessesList.jsx
```
Lista de intentos anteriores.

```text
components/HiddenCardMessagePanel.jsx
```
Mensajes de feedback.

```text
components/HiddenCardTopbar.jsx
```
Barra superior interna del juego.

```text
components/HiddenCardStage.jsx
```
Composición principal del juego.

```text
components/HiddenCardResultOverlay.jsx
```
Wrapper del resultado que usa `GameResultOverlay`.

**Para cambiar pistas o lógica de respuestas:** `hiddenCardConfig.js`.

**Para cambiar textos del juego:** `hiddenCardCopy.js`.

## `src/games/HigherLower/` — Mayor o menor

```text
HigherLowerGame.jsx
```
Controla ronda, duelo actual, elección del jugador, historial, diario/infinito, victoria/derrota y recompensa.

```text
HigherLowerGame.css
```
Estilos propios del juego.

```text
higherLowerConfig.js
```
Archivo índice que reexporta helpers/config.

```text
higherLowerCopy.js
```
Textos propios del juego.

```text
higherLowerCardUtils.js
```
Helpers para imágenes y cartas válidas.

```text
higherLowerQuestionDefinitions.js
```
Preguntas/métricas disponibles. Aquí se define qué cosas se comparan: coste, ataque, vida, rareza, set, texto, etc.

```text
higherLowerQuestionUtils.js
```
Calcula valores, resuelve cuál carta gana y formatea respuestas.

```text
higherLowerRoundUtils.js
```
Genera rondas diarias/infinito.

```text
higherLowerHistory.js
```
Serializa/hidrata historial diario.

```text
components/HigherLowerDuelCard.jsx
```
Carta individual dentro del duelo.

```text
components/HigherLowerDuelStage.jsx
```
Zona de duelo con las dos cartas.

```text
components/HigherLowerTopbar.jsx
```
Barra interna de progreso/ronda.

```text
components/HigherLowerMessagePanel.jsx
```
Mensajes de feedback.

```text
components/HigherLowerResultsPanel.jsx
```
Resumen/historial de resultados.

```text
components/HigherLowerResultOverlay.jsx
```
Wrapper del resultado que usa `GameResultOverlay`.

**Para añadir/quitar preguntas:** `higherLowerQuestionDefinitions.js`.

**Para cambiar cómo se calcula una respuesta:** `higherLowerQuestionUtils.js`.

**Para cambiar textos:** `higherLowerCopy.js`.

## `src/games/Impostor/` — Impostor

```text
ImpostorGame.jsx
```
Controla ronda, selección del jugador, acierto/fallo, diario/infinito, recompensa y resultado.

```text
ImpostorGame.css
```
Estilos propios del juego.

```text
ImpostorNeutralCard.jsx
ImpostorNeutralCard.css
```
Render especial de cartas con marco neutral usado por Impostor.

```text
impostorGameConfig.js
```
Archivo índice que reexporta config/utilidades.

```text
impostorConstants.js
```
Números fijos del juego: tamaños, número de cartas/impostores, delays.

```text
impostorCopy.js
```
Textos propios del juego.

```text
impostorCardUtils.js
```
Helpers de carta: imagen, nombre, preload, tipos permitidos.

```text
impostorConditions.js
```
Reglas/categorías que pueden definir una ronda. Por ejemplo condiciones que cumplen las cartas normales y que rompe el impostor.

```text
impostorRoundUtils.js
```
Random, shuffle y seeded random.

```text
impostorRoundFactory.js
```
Crea rondas diarias e infinitas.

```text
components/ImpostorBoard.jsx
```
Grid de cartas.

```text
components/ImpostorActionBar.jsx
```
Botones/acciones de la partida.

```text
components/ImpostorMessagePanel.jsx
```
Mensajes de feedback.

```text
components/ImpostorResultOverlay.jsx
```
Wrapper del resultado que usa `GameResultOverlay`.

```text
assets/*.png
```
Overlays/marcos visuales específicos para minion/hechizo/arma neutral.

**Para añadir/quitar reglas del impostor:** `impostorConditions.js`.

**Para cambiar cómo se genera una ronda:** `impostorRoundFactory.js`.

**Para cambiar textos:** `impostorCopy.js`.

## `src/games/Pyramid/` — Pirámide

```text
PyramidGame.jsx
```
Controla categoría, cartas correctas, respuestas, sugerencias, temporizador, diario/infinito, victoria/derrota y recompensa.

```text
PyramidGame.css
```
Estilos propios del juego.

```text
pyramidGameConfig.js
```
Archivo índice que reexporta config/utilidades.

```text
pyramidConstants.js
```
Números fijos: tiempo diario y número de cartas objetivo.

```text
pyramidCopy.js
```
Textos propios del juego y función para formatear plantillas.

```text
pyramidCardUtils.js
```
Búsqueda de carta por respuesta, sugerencias, imagen y cartas válidas.

```text
pyramidCategoryDefinitions.js
```
Categorías/reglas de la pirámide. Aquí se define qué retos pueden salir.

```text
pyramidCategoryUtils.js
```
Construye categorías con cartas disponibles, etiqueta categorías y elige categoría aleatoria.

```text
components/PyramidTopbar.jsx
```
Barra superior interna con tiempo/progreso.

```text
components/PyramidCategoryCard.jsx
```
Tarjeta que muestra la categoría/reto.

```text
components/PyramidAnswerPanel.jsx
```
Formulario/input de respuestas.

```text
components/PyramidSuggestions.jsx
```
Sugerencias de cartas.

```text
components/PyramidSlots.jsx
```
Huecos/cartas ya acertadas.

```text
components/PyramidMessagePanel.jsx
```
Mensajes de feedback.

```text
components/PyramidStage.jsx
```
Composición principal del juego.

```text
components/PyramidResultOverlay.jsx
```
Wrapper del resultado que usa `GameResultOverlay`.

**Para añadir/quitar categorías:** `pyramidCategoryDefinitions.js`.

**Para cambiar tiempo o cantidad de cartas:** `pyramidConstants.js`.

**Para cambiar textos:** `pyramidCopy.js`.

## `src/games/CardGrid/` — Grid

```text
CardGridGame.jsx
```
Controla estado principal del grid, selección de modo, validación de cartas, progreso diario y resultado.

```text
CardGridGame.css
```
Estilos propios del Grid. Es el CSS más grande porque el juego tiene mucha UI específica.

```text
cardGridGameConfig.js
```
Configuración pesada del Grid: tamaño, condiciones, familias de filas/columnas, iconos, reglas de generación, validaciones y helpers.

```text
cardGridCopy.js
```
Textos propios del Grid.

```text
cardGridState.js
```
Guardar/cargar estado del Grid, especialmente progreso diario.

```text
components/CardGridBoard.jsx
```
Tablero principal.

```text
components/CardGridControls.jsx
```
Controles del juego.

```text
components/CardGridEmptyState.jsx
```
Carga/sin cartas.

```text
components/CardGridResultOverlay.jsx
```
Wrapper del resultado que usa `GameResultOverlay`.

```text
components/CardGridTimer.jsx
```
Temporizador.

```text
assets/*.png
```
Iconos de clases, tipos, rarezas, costes, razas, stats y keywords usados en filas/columnas.

**Para cambiar condiciones del Grid:** `cardGridGameConfig.js`.

**Para cambiar textos:** `cardGridCopy.js`.

**Para cambiar estilos del tablero:** `CardGridGame.css`.

---

## `src/dev/`

```text
GuessManaLayoutEditor.jsx
```
Editor de layout para Adivina el coste. Solo se carga en:

```text
/guess-mana?layoutEditor=1
```

Sirve para ajustar visualmente posiciones/tamaños del render de Adivina el coste. No forma parte de la experiencia normal del usuario.

---

## `public/` — datos y assets estáticos

### `public/data/`

```text
cards.multilang.generated.json
```
Base de datos de cartas ya procesada en español/inglés. La carga `useCardsData.js`.

### `public/card-images/`

No aparece normalmente en los zips porque pesa mucho.

Estructura esperada:

```text
public/card-images/es/thumb/ID.webp
public/card-images/es/game/ID.webp
public/card-images/es/adapted/ID.webp
public/card-images/en/thumb/ID.webp
public/card-images/en/game/ID.webp
public/card-images/en/adapted/ID.webp
```

Son los renders de cartas.

### `public/fonts/`

```text
Belwe Bold.otf
```
Fuente usada para estética Hearthstone.

### `public/ui/book/`

Assets comunes de estilo taberna/libro:

```text
home-tavern-backdrop-cartoon.webp   → fondo común
language-es-frame-cartoon.png       → frame selector ES
language-en-frame-cartoon.png       → frame selector EN
prop-right-mug-cartoon.png          → jarra/decoración del header
```

### `public/ui/games/`

Assets de preview e iconos por juego:

```text
card-grid-v2/mode-example.svg
hidden-card/mode-example.svg
higher-lower/mode-example.svg
impostor-v2/mode-example.svg
pyramid/mode-example.svg
guess-mana-v3/mode-example.png
guess-mana-v3/mana-cover.png
guess-mana-v3/mana-crystal.png
```

### `public/ui/home-v2-icons/`

Iconos grandes usados por la home/header/navegación:

```text
icon-mode-collection.png
icon-mode-database.png
icon-mode-grid.png
icon-mode-hidden-card.png
icon-mode-higher-lower.png
icon-mode-impostor.png
icon-mode-mana.png
icon-mode-profile.png
icon-mode-pyramid.png
```

---

## `scripts/`

### `scripts/v2/`

```text
generate-card-images-multilang.mjs
```
Script activo para generar imágenes de cartas por idioma/tamaño.

```text
README.md
```
Notas del script.

Más detalle en:

```text
docs/ASSET_PIPELINE.md
docs/SCRIPTS.md
```

---

## `docs/`

```text
PROJECT_STRUCTURE.md
```
Resumen de estructura actual.

```text
ASSET_PIPELINE.md
```
Cómo funciona el pipeline de assets/cartas.

```text
SCRIPTS.md
```
Scripts activos y cómo usarlos.

```text
MAPA_DEL_PROYECTO.md
```
Este documento.

---

# Guía rápida: “quiero cambiar X, ¿dónde voy?”

| Quiero cambiar... | Archivo/carpeta |
|---|---|
| Header de toda la web | `src/shared/components/SiteHeader/` |
| Fondo/espaciado de todos los minijuegos | `src/shared/components/GamePageShell/` |
| Modal de instrucciones de todos los juegos | `src/shared/components/GameModeSelect/` |
| Textos de instrucciones de un minijuego | `src/shared/config/gameIntroCopy.js` |
| Modal final de victoria/derrota/acierto/fallo | `src/shared/components/GameResultOverlay/` |
| Textos generales de navegación/botones | `src/i18n/translations.js` |
| Textos de Home | `src/features/HomeV2/homeV2Config.js` |
| Textos de Adivina el coste durante partida | `src/games/GuessManaCost/guessManaCopy.js` |
| Reglas de Adivina el coste | `src/games/GuessManaCost/guessManaConfig.js` |
| Textos de Carta oculta | `src/games/HiddenCard/hiddenCardCopy.js` |
| Pistas/respuestas de Carta oculta | `src/games/HiddenCard/hiddenCardConfig.js` |
| Textos de Mayor o menor | `src/games/HigherLower/higherLowerCopy.js` |
| Preguntas de Mayor o menor | `src/games/HigherLower/higherLowerQuestionDefinitions.js` |
| Textos de Impostor | `src/games/Impostor/impostorCopy.js` |
| Reglas/categorías de Impostor | `src/games/Impostor/impostorConditions.js` |
| Textos de Pirámide | `src/games/Pyramid/pyramidCopy.js` |
| Categorías de Pirámide | `src/games/Pyramid/pyramidCategoryDefinitions.js` |
| Tiempo/cantidad en Pirámide | `src/games/Pyramid/pyramidConstants.js` |
| Textos de Grid | `src/games/CardGrid/cardGridCopy.js` |
| Condiciones/iconos/reglas de Grid | `src/games/CardGrid/cardGridGameConfig.js` |
| Base de datos: filtros/textos | `src/features/CardDatabase/cardDatabaseConfig.js` |
| Colección del jugador | `src/features/CollectionHub/` y `src/shared/collection/` |
| Perfil del jugador | `src/features/PlayerProfile/` y `src/shared/player/` |
| Recompensas/cajas | `src/shared/rewards/rewardStore.js` y `src/shared/packs/packOpening.js` |
| Progreso diario | `src/shared/progress/dailyProgress.js` |
| Idioma ES/EN | `src/i18n/` |
| Datos de cartas | `public/data/cards.multilang.generated.json` |
| Renders de cartas | `public/card-images/` |
| Generar renders de cartas | `scripts/v2/generate-card-images-multilang.mjs` |

---

## Regla de oro para tocar código sin liarla

1. Si es un **texto de instrucciones antes de jugar**, mira `gameIntroCopy.js`.
2. Si es un **texto durante la partida**, mira el `*Copy.js` del juego.
3. Si es un **texto general de navegación**, mira `translations.js`.
4. Si es **estilo común**, mira `shared/components/`.
5. Si es **estilo específico de un juego**, mira el CSS del juego.
6. Si es **regla de juego**, mira `*Config.js`, `*Definitions.js`, `*Constants.js` o `*Utils.js` dentro del juego.
7. Si no sabes si algo es común o específico, busca primero en `src/shared/`. Si no está ahí, busca dentro del minijuego.
