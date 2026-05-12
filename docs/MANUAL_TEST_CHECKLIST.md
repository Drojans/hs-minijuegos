# Manual Test Checklist

Checklist manual para revisar la web después de cambios de estructura, lógica, estilos o assets.

La idea no es probar absolutamente todas las combinaciones posibles, sino tener una ruta fija para detectar rápido si algo importante se ha roto.

---

## 0. Antes de empezar

### Comandos básicos

Desde la raíz del proyecto:

```bash
npm install
npm run lint
npm run build
npm run dev
```

### Resultado esperado

- `npm run lint` termina con **0 errores y 0 avisos**.
- `npm run build` termina correctamente.
- `npm run dev` levanta la web sin errores en terminal.
- La consola del navegador no muestra errores rojos al cargar la home.

### Navegadores mínimos a revisar

- Chrome o Edge en escritorio.
- Vista móvil/responsive desde DevTools.

---

## 1. Revisión global de navegación

### Header global

Revisar en todas estas rutas:

- `/`
- `/guess-mana`
- `/higher-lower`
- `/hidden-card`
- `/impostor`
- `/pyramid`
- `/grid`
- `/cards`
- `/collection`
- `/profile`

Comprobar:

- El header aparece arriba en todas las páginas.
- Logo/nombre de la web visible.
- Los enlaces principales funcionan.
- El selector de idioma aparece y funciona.
- El header no se duplica.
- El header no tapa contenido importante.
- En móvil no rompe el ancho de pantalla.

---

## 2. Revisión de idioma

Probar en español e inglés.

Comprobar:

- Cambiar idioma desde el header.
- La home cambia sus textos principales.
- Las instrucciones de los minijuegos cambian.
- Los botones comunes cambian.
- Los modales de resultado cambian.
- Base de datos, colección y perfil no muestran textos mezclados raros.
- No aparecen caracteres corruptos tipo `Ã¡`, `âœ`, `Â`, etc.

---

## 3. Home

Ruta:

- `/`

Comprobar:

- La página carga sin pantalla negra.
- El fondo se ve correctamente.
- Las tarjetas/secciones principales aparecen.
- Los botones de minijuegos llevan a la ruta correcta.
- Las secciones de progreso diario se ven si existen.
- No hay imágenes rotas.
- No hay scroll horizontal en escritorio ni en móvil.
- La home sigue siendo usable después de cambiar idioma.

---

## 4. Flujo común de minijuegos

Este bloque se repite en todos los minijuegos:

- Adivina el coste: `/guess-mana`
- Mayor o menor: `/higher-lower`
- Carta oculta: `/hidden-card`
- Impostor: `/impostor`
- Pirámide: `/pyramid`
- Grid: `/grid`

### Al entrar

Comprobar:

- Aparece el header global.
- Aparece el fondo/layout común de minijuegos.
- Aparece el modal/pantalla de instrucciones.
- El título del minijuego es correcto.
- La descripción del minijuego es correcta.
- Las reglas se leen bien.
- La recompensa diaria se muestra si aplica.
- Los botones de modo diario/infinito aparecen si ese juego los usa.
- El botón de empezar funciona.

### Durante la partida

Comprobar:

- La UI principal carga correctamente.
- Las cartas/imágenes aparecen.
- No hay imágenes rotas.
- No hay elementos solapados.
- Los botones se pueden pulsar.
- El juego responde a la interacción.
- No aparecen errores rojos en consola.

### Al ganar o acertar

Comprobar:

- Aparece `GameResultOverlay` como modal centrado.
- El fondo queda oscurecido/desenfocado.
- El modal no aparece debajo del contenido.
- El título del resultado es correcto.
- El texto del resultado es correcto.
- La recompensa aparece en modo diario cuando corresponde.
- El botón **Ver resultados** funciona.
- El botón **Volver** funciona.
- No queda bloqueada la página al cerrar/continuar.

### Al perder o fallar

Comprobar:

- Aparece el mismo modal común de resultado.
- El mensaje de fallo/derrota es correcto.
- No se entrega recompensa si no corresponde.
- **Ver resultados** funciona.
- **Volver** funciona.
- El juego no se queda en pantalla negra.

### Modo infinito

Comprobar:

- Permite jugar sin consumir el reto diario.
- Permite repetir partida cuando corresponde.
- No entrega recompensa diaria.
- No marca el reto diario como completado.

### Modo diario

Comprobar:

- Carga el reto diario.
- Al completarlo, queda marcado como completado.
- Al volver a entrar, aparece como ya jugado/revisable si esa es la lógica del juego.
- La recompensa diaria se guarda solo una vez.

---

## 5. Adivina el coste

Ruta:

- `/guess-mana`

Comprobar:

- La carta aparece con el coste oculto.
- El selector de cristales/coste aparece de 0 a 10.
- Se puede seleccionar un coste.
- Al responder, se revela si era correcto o incorrecto.
- El modal final aparece con el mismo diseño común.
- El botón de otra carta/otra partida aparece donde corresponde después de ver resultados.
- En modo diario, la recompensa aparece si aciertas.
- En modo infinito, no se guarda recompensa diaria.

---

## 6. Mayor o menor

Ruta:

- `/higher-lower`

Comprobar:

- Aparecen dos cartas comparables.
- La pregunta/métrica se entiende.
- Los botones de elección funcionan.
- Al acertar, avanza el duelo.
- Al fallar, aparece el modal común.
- Si hay empate, el comportamiento es correcto.
- El historial/resultados diarios se muestran al pulsar **Ver resultados**.
- No salta directamente a resultados sin modal.
- Modo infinito permite jugar otra partida.

---

## 7. Carta oculta

Ruta:

- `/hidden-card`

Comprobar:

- La carta aparece oculta/borrosa según diseño.
- Las pistas se muestran correctamente.
- El input de respuesta funciona.
- Las sugerencias o intentos no rompen la UI.
- Las respuestas incorrectas reducen intentos o se registran según lógica.
- Al acertar, se muestra el modal común.
- Al fallar, se muestra el modal común.
- El botón de otra carta funciona en modo infinito.
- No se repite mal la carta anterior al pedir otra carta.

---

## 8. Impostor

Ruta:

- `/impostor`

Comprobar:

- Aparece el grupo de cartas.
- La condición/regla de la ronda se entiende.
- Se puede seleccionar una carta.
- La selección correcta se marca correctamente.
- La selección incorrecta muestra el impostor/explicación correcta.
- El modal final aparece con el diseño común.
- En diario, recompensa solo si corresponde.
- En infinito, permite nueva ronda.

---

## 9. Pirámide

Ruta:

- `/pyramid`

Comprobar:

- Aparece la categoría objetivo.
- Aparecen los huecos de la pirámide.
- El buscador/input funciona.
- Las sugerencias aparecen.
- Se puede añadir una carta válida.
- Una carta inválida muestra mensaje de error.
- Una carta duplicada no se añade dos veces.
- El temporizador funciona.
- Al completar la pirámide, aparece el modal común.
- En diario, el modal muestra la recompensa de caja arcana si corresponde.
- Si se acaba el tiempo, aparece el modal de derrota.
- **Ver resultados** funciona.

---

## 10. Grid

Ruta:

- `/grid`

Comprobar:

- La pantalla no queda negra.
- El tablero carga con filas y columnas.
- Las categorías de filas/columnas se leen bien.
- Se puede seleccionar una celda.
- El buscador/input funciona.
- Las sugerencias aparecen.
- Una respuesta válida rellena la celda.
- Una respuesta inválida muestra error.
- No se puede rellenar mal una celda ya completada.
- El progreso se actualiza.
- El temporizador o contador funciona si aplica.
- Al completar el grid, aparece el modal común.
- En diario, recompensa solo si corresponde.
- **Ver resultados** funciona.

---

## 11. Base de datos de cartas

Ruta:

- `/cards`

Comprobar:

- La página carga sin errores.
- El listado de cartas aparece.
- Las imágenes de cartas cargan.
- La búsqueda funciona.
- Los filtros funcionan.
- Los contadores son coherentes.
- El cambio de idioma no rompe la página.
- No hay scroll horizontal.
- No aparecen assets rotos.

---

## 12. Colección

Ruta:

- `/collection`

Comprobar:

- La colección carga correctamente.
- Los contadores de cartas/cajas aparecen.
- Las cartas poseídas se muestran bien.
- Los filtros o pestañas funcionan si existen.
- Abrir cajas funciona si está disponible.
- No se pierden datos al recargar.
- El cambio de idioma no rompe textos ni layout.

---

## 13. Perfil

Ruta:

- `/profile`

Comprobar:

- La página carga correctamente.
- Estadísticas/progreso visibles.
- Misiones/logros/recompensas visibles si existen.
- No aparecen valores `undefined`, `NaN` o vacíos raros.
- El cambio de idioma no rompe textos ni layout.

---

## 14. Responsive

Probar con DevTools:

- 390 x 844 aprox. móvil.
- 768 x 1024 tablet.
- 1366 x 768 escritorio.

Comprobar:

- No hay scroll horizontal.
- Header usable.
- Modales centrados y legibles.
- Botones grandes suficientes en móvil.
- Cartas no se salen de su contenedor.
- Grid y Pirámide siguen siendo jugables.

---

## 15. Persistencia y localStorage

Comprobar:

- Jugar un reto diario.
- Recargar página.
- Volver al mismo minijuego.
- El estado diario se conserva.
- Las recompensas no se duplican indebidamente.
- La colección/progreso se mantiene.

Prueba opcional de limpieza:

1. Abrir DevTools.
2. Application → Local Storage.
3. Borrar datos del sitio.
4. Recargar.
5. Confirmar que la web arranca como usuario nuevo.

---

## 16. Consola del navegador

Durante la revisión completa:

- No debe haber errores rojos de React.
- No debe haber rutas de assets 404.
- No deben aparecer errores tipo `Cannot read properties of undefined`.
- Avisos de extensiones del navegador se pueden ignorar si no vienen de la app.

Ejemplo de aviso normalmente externo:

```txt
Unchecked runtime.lastError: The message port closed before a response was received.
```

Ese aviso suele venir de extensiones del navegador, no necesariamente de la web.

---

## 17. Checklist rápida antes de commit

Antes de cada commit importante:

```bash
npm run lint
npm run build
npm run dev
```

Y revisar como mínimo:

- Home.
- Un minijuego en modo diario.
- Un minijuego en modo infinito.
- Un modal de instrucciones.
- Un modal de resultado.
- Base de datos.
- Colección.
- Perfil.
- Cambio de idioma.

---

## 18. Checklist completa antes de publicar

Antes de publicar o compartir una versión:

- Ejecutar `npm run lint`.
- Ejecutar `npm run build`.
- Probar todas las rutas principales.
- Probar los 6 minijuegos en diario e infinito.
- Probar victoria y derrota cuando sea posible.
- Probar español e inglés.
- Probar escritorio y móvil.
- Comprobar consola sin errores rojos propios de la app.
- Confirmar que no hay assets rotos.
- Confirmar que el zip/build no incluye carpetas pesadas innecesarias.

---

## 19. Resultado de prueba

Usa este bloque al final de una ronda manual:

```txt
Fecha:
Rama/commit:
Navegador:
Dispositivo/resolución:

Lint: OK / Error
Build: OK / Error
Home: OK / Revisar
Adivina el coste: OK / Revisar
Mayor o menor: OK / Revisar
Carta oculta: OK / Revisar
Impostor: OK / Revisar
Pirámide: OK / Revisar
Grid: OK / Revisar
Base de datos: OK / Revisar
Colección: OK / Revisar
Perfil: OK / Revisar
Idioma ES/EN: OK / Revisar
Responsive: OK / Revisar
Consola: OK / Revisar

Notas:
-
-
-
```
