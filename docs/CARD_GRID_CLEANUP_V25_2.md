# Card Grid cleanup v25.2

Hotfix sobre `card-grid-cleanup-v25`.

## Problema

El Grid daba pantalla negra con:

```text
ReferenceError: getGridModes is not defined
```

## Arreglo

`CardGridGame.jsx` ya importa `getGridModes` desde:

```text
src/games/CardGrid/cardGridGameConfig.js
```

## Archivos

```text
src/games/CardGrid/CardGridGame.jsx
src/games/CardGrid/CardGridGame.css
src/games/CardGrid/cardGridGameConfig.js
docs/CARD_GRID_CLEANUP_V25.md
docs/CARD_GRID_CLEANUP_V25_2.md
```
