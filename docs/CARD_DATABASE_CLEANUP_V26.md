# Card Database cleanup v26

Limpieza conservadora de la Base de datos.

## Archivos tocados

```text
src/features/CardDatabase/CardDatabase.jsx
src/features/CardDatabase/CardDatabase.css
src/features/CardDatabase/cardDatabaseConfig.js
```

## Cambios principales

- Se crea `cardDatabaseConfig.js` para mover fuera del componente:
  - constantes de filtros;
  - límite de cartas visibles;
  - copy ES/EN específico de la página;
  - helpers de filtro;
  - helpers de imágenes/textos de cartas.
- `CardDatabase.jsx` queda centrado en estado, eventos y render.
- Se separan componentes internos:
  - `Hero`
  - `Filters`
  - `FilterSelect`
  - `ResultsHeader`
  - `CardThumb`
  - `CardTile`
  - `CardGrid`
  - `CardLargeImage`
  - `CardDetailPanel`
  - `DetailTags`
  - `DetailStats`
- Se añaden `type="button"` en botones que no envían formularios.
- Se arreglan mojibakes visibles del propio componente:
  - flecha de volver;
  - placeholder de búsqueda;
  - botón de cierre;
  - separador `·`;
  - guiones largos `—`.
- No se cambian rutas, assets ni diseño visual.

## Qué probar

```text
http://localhost:5173/cards
```

Checklist:

```text
1. Carga la base de datos.
2. Volver a Home funciona.
3. Búsqueda por nombre/texto funciona.
4. Filtros de tipo/clase/rareza funcionan.
5. Filtro de coste funciona.
6. Limpiar filtros funciona.
7. Seleccionar una carta abre detalle.
8. Cerrar detalle funciona.
9. Cambio ES/EN sigue funcionando.
```
