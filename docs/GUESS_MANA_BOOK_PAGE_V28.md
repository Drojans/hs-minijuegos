# Guess Mana book page v28

Primera implementación real de la página propia de **Adivina el coste** con layout de libro/taberna, basada en el estado actual del proyecto.

## Archivos tocados

```text
src/games/GuessManaCost/GuessManaCost.jsx
src/games/GuessManaCost/GuessManaCost.css
src/games/GuessManaCost/guessManaConfig.js
docs/GUESS_MANA_BOOK_PAGE_V28.md
```

## Assets específicos esperados

Todos estos assets deben estar en:

```text
public/ui/games/guess-mana/
```

```text
guess-mana-back-button-cartoon.png
guess-mana-card-data-panel-cartoon.png
guess-mana-card-frame-cartoon.png
guess-mana-question-badge-cartoon.png
guess-mana-score-panel-cartoon.png
```

## Monedas individuales

La página usa una imagen distinta para cada coste normal:

```text
guess-mana-cost-button-cartoon-0.png
guess-mana-cost-button-cartoon-1.png
guess-mana-cost-button-cartoon-2.png
guess-mana-cost-button-cartoon-3.png
guess-mana-cost-button-cartoon-4.png
guess-mana-cost-button-cartoon-5.png
guess-mana-cost-button-cartoon-6.png
guess-mana-cost-button-cartoon-7.png
guess-mana-cost-button-cartoon-8.png
guess-mana-cost-button-cartoon-9.png
guess-mana-cost-button-cartoon-10.png
```

Y una imagen distinta para cada coste activo/dorado:

```text
guess-mana-cost-button-active-cartoon-0.png
guess-mana-cost-button-active-cartoon-1.png
guess-mana-cost-button-active-cartoon-2.png
guess-mana-cost-button-active-cartoon-3.png
guess-mana-cost-button-active-cartoon-4.png
guess-mana-cost-button-active-cartoon-5.png
guess-mana-cost-button-active-cartoon-6.png
guess-mana-cost-button-active-cartoon-7.png
guess-mana-cost-button-active-cartoon-8.png
guess-mana-cost-button-active-cartoon-9.png
guess-mana-cost-button-active-cartoon-10.png
```

## Assets compartidos reutilizados

Siguen en:

```text
public/ui/book/
```

```text
home-tavern-backdrop-cartoon.webp
home-open-book-cartoon.png
prop-left-candle-cartoon.png
prop-bottom-left-cards-cartoon.png
prop-bottom-coins-cartoon.png
prop-right-mug-cartoon.png
section-divider-cartoon.png
button-primary-purple-cartoon.png
```

## Botón confirmar

No se usa asset específico de confirmar. Se reutiliza:

```text
public/ui/book/button-primary-purple-cartoon.png
```

Así evitamos depender de `guess-mana-confirm-button-cartoon.png`, que no aparece en los assets actuales.

## Cambio funcional

Antes, al pulsar una moneda, la respuesta se resolvía al instante.

Ahora:

```text
1. Pulsas una moneda.
2. La moneda queda seleccionada/dorada.
3. Pulsas Confirmar coste.
4. Se muestra correcto/incorrecto.
5. El botón pasa a Siguiente carta o Ver resultado.
```

## Variables principales

Los ajustes están al principio de:

```text
src/games/GuessManaCost/GuessManaCost.css
```

Variables útiles:

```css
--gm-book-x
--gm-book-y
--gm-book-scale

--gm-left-page-x
--gm-left-page-y
--gm-right-page-x
--gm-right-page-y

--gm-card-area-x
--gm-card-area-y
--gm-card-area-w
--gm-card-area-h

--gm-data-x
--gm-data-y
--gm-data-w
--gm-data-h

--gm-mana-x
--gm-mana-y
--gm-cost-size
--gm-cost-gap

--gm-score-x
--gm-score-y
--gm-confirm-w
```

## Pruebas

```text
http://localhost:5173/guess-mana
```

Checklist:

```text
1. Fondo taberna carga.
2. Libro carga.
3. Props cargan.
4. Botón volver funciona.
5. Carta aparece en la izquierda.
6. Badge ? aparece antes de responder.
7. Panel de datos aparece en la derecha.
8. Monedas 0-10 aparecen con su número integrado.
9. Al seleccionar moneda cambia a versión dorada.
10. Confirmar coste funciona.
11. Siguiente carta funciona.
12. Resultado final funciona.
13. ES/EN funciona.
```
