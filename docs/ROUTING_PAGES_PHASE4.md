# Fase 4 — páginas/rutas por minijuego

La app deja de usar `currentView` como navegación principal y pasa a tener rutas internas con History API.

## Rutas

```text
/             Home
/guess-mana   Adivina el coste
/impostor     Impostor
/grid         Grid de cartas
/cards        Base de datos
```

## Archivos de página

```text
src/pages/HomePage.jsx
src/pages/GuessManaPage.jsx
src/pages/ImpostorPage.jsx
src/pages/CardGridPage.jsx
src/pages/CardDatabasePage.jsx
```

Las páginas son envoltorios finos. No se toca la lógica interna de los minijuegos.

## App

```text
src/App.jsx
```

Responsabilidades:

```text
cargar cartas con useCardsData()
sincronizar window.location.pathname
navegar con window.history.pushState
renderizar la página correspondiente
```

## Home

```text
src/features/HomeBook/homeBookConfig.js
```

Cada modo define su ruta:

```text
guessMana -> /guess-mana
impostor  -> /impostor
grid      -> /grid
cards     -> /cards
```

`HomeBook.jsx` navega usando esas rutas.

## Sin dependencia nueva

No se añadió `react-router-dom`. Se usa `window.history.pushState` y `popstate`, suficiente para esta fase.

Si en el futuro se necesitan rutas anidadas, parámetros o loaders, se puede migrar a `react-router-dom`.
