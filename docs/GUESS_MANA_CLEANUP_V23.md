# Guess Mana cleanup v23

## Objetivo

Limpiar internamente `Adivina el coste` sin cambiar su diseño ni sus rutas.

## Archivos tocados

```text
src/games/GuessManaCost/GuessManaCost.jsx
src/games/GuessManaCost/GuessManaCost.css
src/games/GuessManaCost/guessManaConfig.js
```

## Cambios

- Se extraen constantes y helpers a `guessManaConfig.js`.
- Se divide el JSX en componentes internos pequeños:
  - `GuessManaStatus`
  - `GuessManaShell`
  - `EmptyState`
  - `EndScreen`
  - `CardPreview`
  - `CardInfo`
  - `ManaSelector`
  - `RoundFeedback`
- Se elimina `gm-scan-beam`, que se renderizaba pero estaba siempre en `display: none`.
- Se fusiona el antiguo bloque final `FULL WIDTH PLAYABLE LAYOUT PATCH` dentro del CSS principal.
- Se eliminan clases no usadas como `gm-info-panel` y `gm-selector-panel`.
- Se añade `type="button"` a botones internos para evitar comportamiento implícito de submit si se reutiliza dentro de formularios.
- Se mantiene el uso de `getAdaptedImage` para la carta del juego.

## Qué no cambia

- Ruta `/guess-mana`.
- Props públicas del componente: `cards`, `onBack`.
- Textos/traducciones.
- Estilo visual esperado.
- Flujo de juego: 10 rondas, costes 0–10, puntuación y resultado.
