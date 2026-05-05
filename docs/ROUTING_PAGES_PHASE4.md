# Fase 4 — páginas/rutas por minijuego

La app deja de usar `currentView` en `App.jsx` y pasa a tener rutas internas con History API.

## Rutas

- `/` → Home
- `/guess-mana` → Adivina el coste
- `/impostor` → Impostor
- `/grid` → Grid
- `/cards` → Base de datos

## Archivos nuevos

```text
src/pages/HomePage.jsx
src/pages/GuessManaPage.jsx
src/pages/ImpostorPage.jsx
src/pages/CardGridPage.jsx
src/pages/CardDatabasePage.jsx
```

Las páginas son envoltorios finos. No se toca la lógica interna de los minijuegos.

## Home

`src/features/HomeBook/homeBookConfig.js` añade `route` a cada modo.

`HomeBook.jsx` ya no navega con ids de vista (`guessMana`, `cards`, etc.), sino con rutas (`/guess-mana`, `/cards`, etc.).

## Sin dependencia nueva

No se ha añadido `react-router-dom`. Se usa `window.history.pushState` y `popstate`, suficiente para esta fase.
