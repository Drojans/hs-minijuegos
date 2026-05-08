# Guess Mana editor read CSS v31

Parche para que el editor de `/guess-mana` arranque siempre desde el `:root` real guardado en `GuessManaCost.css`.

## Qué cambia

- El editor deja de arrancar desde los valores guardados en `localStorage`.
- Al abrir `/guess-mana?layoutEditor=1`, borra overrides inline antiguos y lee `getComputedStyle(document.documentElement)`.
- Botón `Leer CSS` para volver a cargar el `:root` actual en cualquier momento.
- `Copiar ROOT` ahora incluye también variables extra no editables pero necesarias:
  - `--gm-z-backdrop`
  - `--gm-z-vignette`
  - `--gm-z-stage`
  - colores `--gm-ink`, `--gm-deep-ink`, etc.
- Se conserva el guardado de posición del panel del editor.

## Archivos

```text
src/dev/GuessManaLayoutEditor.jsx
src/games/GuessManaCost/GuessManaCost.css
src/games/GuessManaCost/GuessManaCost.jsx
```

## Uso seguro

```text
http://localhost:5173/guess-mana?layoutEditor=1
```

Ahora el editor debería partir de lo que tengas guardado en `GuessManaCost.css`, no de una sesión antigua del editor.
