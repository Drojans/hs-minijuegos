# Home restructure fase 3

Este parche separa la Home/libro del `App.jsx`.

## Nueva estructura

```text
src/
  App.jsx
  App.css
  features/
    HomeBook/
      HomeBook.jsx
      HomeBook.css
      homeBookConfig.js
```

## Qué cambia

- `App.jsx` queda como router/controlador de vistas.
- `HomeBook.jsx` contiene la pantalla del libro.
- `HomeBook.css` contiene todos los estilos y variables de la Home.
- `homeBookConfig.js` contiene los modos, textos base, rutas de assets, variantes de animación y símbolos de estado.
- `App.css` queda solo con estilos globales mínimos.

## Qué NO cambia

- No se mueven assets.
- No se cambian rutas de assets.
- No se toca `LanguageToggle`.
- No se toca `LayoutEditor`.
- No se toca la lógica de los juegos.
- Se mantienen las hitboxes/hover de la fase anterior.

## Comprobaciones después de aplicar

1. Home carga igual visualmente.
2. Idiomas funcionan.
3. Minijuegos hacen hover/click bien.
4. Misión destacada y botón morado hacen hover/click bien.
5. `?layoutEditor=1` sigue abriendo el editor.
