# Card Grid cleanup v25

Limpieza conservadora del minijuego Grid.

## Archivos tocados

```text
src/games/CardGrid/CardGridGame.jsx
src/games/CardGrid/CardGridGame.css
src/games/CardGrid/cardGridGameConfig.js
```

## Cambios principales

- Se crea `cardGridGameConfig.js` para mover fuera del componente:
  - imports de iconos;
  - mapas de iconos;
  - constantes del grid;
  - generación de condiciones;
  - generación de tableros;
  - búsqueda/sugerencias de cartas;
  - helpers de normalización.
- `CardGridGame.jsx` queda centrado en estado, eventos y render.
- Se separan componentes internos:
  - `ConditionContent`
  - `EmptyState`
  - `GridHeader`
  - `SolvedCard`
  - `AnswerCell`
  - `GridBoard`
  - `ModeSelector`
  - `Suggestions`
  - `AnswerForm`
  - `ControlPanel`
- Se añaden `type="button"` en botones que no envían formularios.
- Se quita estilo inline redundante de la imagen resuelta; ya lo controla CSS.
- Se arregla mojibake en la condición de texto `último aliento`.
- Se renombran comentarios de CSS para que no parezcan parches temporales, pero no se cambia el layout visual.

## Assets revisados

Estos assets de `src/games/CardGrid/assets/` no aparecen referenciados por la lógica actual:

```text
stat_attack_7_plus.png
stat_health_2_plus.png
text_charge.png
```

No los he borrado en este parche porque podrían estar preparados para futuras condiciones.
Si tras probar decides que no los quieres conservar, pueden archivarse o eliminarse.

## Qué probar

```text
http://localhost:5173/grid
```

Checklist:

```text
1. Carga un grid.
2. Cambiar Fácil/Normal funciona.
3. Seleccionar casillas funciona.
4. Escribir respuesta correcta funciona.
5. Sugerencias funcionan.
6. Respuesta incorrecta suma fallo.
7. Revelar respuesta funciona.
8. Nuevo grid funciona.
9. Volver a Home funciona.
10. ES/EN sigue funcionando.
```
