# Guía de cambios rápidos

## Cambiar textos

### Textos del header o navegación

Ir a:

```text
src/i18n/translations.js
```

### Textos de la home

Ir a:

```text
src/features/HomeV2/homeV2Config.js
```

### Textos del modal inicial de instrucciones

Ir a:

```text
src/shared/config/gameIntroCopy.js
```

Ahí están los textos de entrada de todos los minijuegos.

### Textos durante una partida

Ir al `*Copy.js` del minijuego:

```text
src/games/GuessManaCost/guessManaCopy.js
src/games/HiddenCard/hiddenCardCopy.js
src/games/HigherLower/higherLowerCopy.js
src/games/Impostor/impostorCopy.js
src/games/Pyramid/pyramidCopy.js
src/games/CardGrid/cardGridCopy.js
```

## Cambiar estilos

### Header global

```text
src/shared/components/SiteHeader/SiteHeader.css
```

### Fondo y layout común de minijuegos

```text
src/shared/components/GamePageShell/GamePageShell.css
```

### Modal de instrucciones

```text
src/shared/components/GameModeSelect/GameModeSelect.css
```

### Modal final de resultado

```text
src/shared/components/GameResultOverlay/GameResultOverlay.css
```

### Estilo de un minijuego concreto

```text
src/games/GuessManaCost/GuessManaCost.css
src/games/HiddenCard/HiddenCardGame.css
src/games/HigherLower/HigherLowerGame.css
src/games/Impostor/ImpostorGame.css
src/games/Pyramid/PyramidGame.css
src/games/CardGrid/CardGridGame.css
```

## Cambiar reglas de juego

### Adivina el coste

```text
src/games/GuessManaCost/guessManaConfig.js
```

### Carta oculta

```text
src/games/HiddenCard/hiddenCardConfig.js
```

### Mayor o menor

Preguntas:

```text
src/games/HigherLower/higherLowerQuestionDefinitions.js
```

Cálculo de respuestas:

```text
src/games/HigherLower/higherLowerQuestionUtils.js
```

Generación de rondas:

```text
src/games/HigherLower/higherLowerRoundUtils.js
```

### Impostor

Condiciones/reglas:

```text
src/games/Impostor/impostorConditions.js
```

Generación de rondas:

```text
src/games/Impostor/impostorRoundFactory.js
```

### Pirámide

Categorías:

```text
src/games/Pyramid/pyramidCategoryDefinitions.js
```

Tiempo/cantidad:

```text
src/games/Pyramid/pyramidConstants.js
```

### Grid

Condiciones/iconos/reglas:

```text
src/games/CardGrid/cardGridGameConfig.js
```

Estado diario:

```text
src/games/CardGrid/cardGridState.js
```

## Cambiar datos, progreso o recompensas

### Progreso diario

```text
src/shared/progress/dailyProgress.js
```

### Recompensas/cajas

```text
src/shared/rewards/rewardStore.js
src/shared/packs/packOpening.js
```

### Colección de cartas poseídas

```text
src/shared/collection/collectionStore.js
```

### Agrupar cartas repetidas

```text
src/shared/cards/cardIdentity.js
```

Ahí se decide cuándo dos cartas de distintos sets se consideran la misma carta jugable.

### Perfil del jugador

```text
src/shared/player/playerProfileStore.js
src/shared/player/playerDataAdapter.js
```

## Cambiar datos de cartas

### JSON de cartas

```text
public/data/cards.multilang.generated.json
```

La app no muestra este JSON tal cual: al cargarlo, `src/hooks/useCardsData.js` aplica la agrupación de duplicados de `src/shared/cards/cardIdentity.js`.

### Renders de cartas

```text
public/card-images/
```

### Script para regenerar renders

```text
scripts/v2/generate-card-images-multilang.mjs
```
