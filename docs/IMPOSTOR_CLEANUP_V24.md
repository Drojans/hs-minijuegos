# Impostor cleanup v24

Limpieza conservadora del minijuego Impostor.

## Archivos tocados

```text
src/games/Impostor/ImpostorGame.jsx
src/games/Impostor/ImpostorGame.css
src/games/Impostor/ImpostorNeutralCard.jsx
src/games/Impostor/ImpostorNeutralCard.css
src/games/Impostor/impostorGameConfig.js
```

## Cambios principales

- Se crea `impostorGameConfig.js` para mover fuera del componente:
  - constantes del juego;
  - construcción de condiciones;
  - selección aleatoria de rondas;
  - preload de imágenes;
  - helpers de imagen/tipo/nombre.
- `ImpostorGame.jsx` queda centrado en estado, eventos y render.
- Se separan componentes internos:
  - `MessagePanel`
  - `EndScreen`
  - `GameHeader`
  - `ConditionPanel`
  - `Board`
  - `BoardCard`
  - `ActionPanel`
- `ImpostorNeutralCard.jsx` deja de repetir tres componentes casi iguales para minion/spell/weapon.
- Se arreglan mojibakes visibles:
  - `Â·` → `·`
  - `âœ“` → `✓`
  - `Ã—` → `×`
  - etiquetas internas como `Último aliento`, `Daño`, `Misión`, etc.
- Se añaden `type="button"` donde faltaba.
- No se cambian rutas, assets ni estructura visual.

## Qué probar

```text
http://localhost:5173/impostor
```

Checklist:

```text
1. Carga tablero de 10 cartas.
2. Se puede seleccionar/deseleccionar carta.
3. "Comprobar carta" funciona.
4. Al acertar se revela la carta y aumenta el contador encontrado.
5. Al fallar se revela la ronda.
6. Al encontrar todas las correctas se gana la ronda.
7. Siguiente ronda funciona.
8. Resultado final funciona.
9. Volver a Home funciona.
10. Cambio ES/EN sigue funcionando.
```
