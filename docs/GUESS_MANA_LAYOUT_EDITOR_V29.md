# Guess Mana layout editor v29

Añade un editor visual específico para `/guess-mana`.

## Archivos

```text
src/games/GuessManaCost/GuessManaCost.jsx
src/games/GuessManaCost/GuessManaCost.css
src/games/GuessManaCost/guessManaConfig.js
src/dev/GuessManaLayoutEditor.jsx
docs/GUESS_MANA_LAYOUT_EDITOR_V29.md
```

## Cómo abrirlo

```text
http://localhost:5173/guess-mana?layoutEditor=1
```

## Qué permite editar

- escena/libro;
- páginas izquierda/derecha;
- props de la taberna;
- botón volver;
- bloque de carta;
- marco/render/badge de interrogación;
- temporada;
- score;
- título/subtítulo/divisor;
- panel de datos;
- selector de monedas;
- feedback;
- botón confirmar;
- capas principales.

## Cómo guardar cambios

El editor aplica cambios en vivo y los guarda en este navegador con `localStorage`.

Cuando te guste el resultado:

1. Pulsa `Copiar ROOT`.
2. Pega ese bloque en `src/games/GuessManaCost/GuessManaCost.css`, sustituyendo o completando las variables del `:root`.
3. Haz commit.

## Pegar variables guardadas

Si tienes un bloque `:root` copiado en un bloc de notas, usa `Pegar` dentro del editor.

## Reset

`Reset v1` vuelve a los valores base de este parche.
