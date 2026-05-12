# Fase 2 - Unificación de instrucciones y selección de modo

## Objetivo

Dejar la pantalla inicial de cada minijuego con una única fuente de verdad para textos, pasos, previews y modos.

Hasta ahora, cada juego tenía sus textos de instrucciones mezclados dentro del propio componente del juego. Eso hacía que para cambiar una regla visual o un texto común hubiera que revisar seis archivos distintos.

## Cambios realizados

### Nuevo archivo común

- `src/shared/config/gameIntroCopy.js`

Centraliza por juego e idioma:

- título del modal inicial
- descripción corta
- imagen de ejemplo
- texto alternativo
- pasos de instrucciones
- textos comunes de reto diario / modo infinito
- recompensa diaria
- botón de inicio / revisar reto

### Componente actualizado

- `src/shared/components/GameModeSelect/GameModeSelect.jsx`
- `src/shared/components/GameModeSelect/GameModeSelect.css`

Ahora el modal de entrada:

- usa estructura común para todos los juegos
- muestra descripción bajo el título
- muestra chip de recompensa diaria
- muestra modo diario e infinito con descripción y estado
- cambia el botón a “Revisar reto” / “Review challenge” si el reto diario ya está completado
- conserva compatibilidad con el formato antiguo de pasos por si se reutiliza en el futuro

### Juegos actualizados

Cada juego importa `getGameIntroCopy` y pasa ese copy al modal común:

- `GuessManaCost`
- `HigherLower`
- `HiddenCard`
- `Impostor`
- `Pyramid`
- `CardGrid`

También se han eliminado de los copy locales de cada juego los textos que ya pertenecen al modal de instrucciones. Los copy locales quedan más centrados en lo que usa el juego durante la partida: botones, feedback, resultados, pistas, mensajes, etc.

## Comprobaciones

- `npm run build`: correcto
- `npm run lint`: 0 errores, 4 avisos ya existentes de dependencias de hooks

## Siguiente fase recomendada

Unificar el header de minijuegos. Ahora hay seis `GameHeader` muy parecidos con pequeñas diferencias de clases/assets. Conviene convertirlo en un componente común para evitar repetir navegación, marca, mugs e idioma en cada juego.
