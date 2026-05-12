# Estructura actual del proyecto

Este documento describe la estructura activa. Los documentos históricos de fases/parches se eliminaron del árbol de trabajo para reducir ruido; si hace falta recuperarlos, están en el historial de Git.

## Raíz

```text
src/                Código React de la app
public/             Datos, fuentes y assets estáticos ligeros
scripts/v2/         Script activo para regenerar imágenes de cartas
docs/               Documentación mantenida
```

No deben versionarse ni incluirse en zips de revisión:

```text
node_modules/
dist/
public/card-images/
reports/
```

## Código principal

```text
src/App.jsx         Router simple y header global
src/main.jsx        Entrada React
src/index.css       Reset global mínimo
src/App.css         Variables globales, fuente y layout base
```

El header global vive en:

```text
src/shared/components/SiteHeader/
```

## Páginas

```text
src/pages/          Adaptadores de ruta
src/features/       Páginas no jugables: Home, base de datos, colección y perfil
src/games/          Minijuegos
```

`src/pages/*Page.jsx` debe ser fino: solo conecta la ruta con el feature/juego correspondiente.

## Minijuegos

Cada minijuego mantiene esta idea:

```text
<Minijuego>Game.jsx     Estado principal y flujo del juego
<minijuego>Copy.js      Textos propios del juego
<minijuego>Config.js    Reexports/config pública del juego
components/             UI interna del minijuego
*.css                   Estilos específicos del minijuego
```

La estructura visual común ya no debe duplicarse dentro de cada juego. Está centralizada en:

```text
src/shared/components/GamePageShell/      Fondo/layout base de minijuegos
src/shared/components/GameModeSelect/     Instrucciones y selección de modo
src/shared/components/GameResultOverlay/  Modal final de resultado
```

## Shared

```text
src/shared/collection/  LocalStorage de colección
src/shared/config/      IDs, reglas comunes y textos de intro
src/shared/gameModes/   Diario/infinito y selección diaria determinista
src/shared/packs/       Apertura de cajas
src/shared/player/      Perfil local y snapshots futuros de backend
src/shared/progress/    Progreso diario
src/shared/rewards/     Recompensas/cajas
src/shared/storage/     Helpers de localStorage
```

## Dev tools

```text
src/dev/GuessManaLayoutEditor.jsx
```

Se carga de forma diferida y solo aparece en `Adivina el coste` con:

```text
/guess-mana?layoutEditor=1
```

No debe importarse de forma estática en otros sitios.

## Assets activos

Assets públicos activos:

```text
public/data/cards.multilang.generated.json
public/fonts/Belwe Bold.otf
public/ui/book/home-tavern-backdrop-cartoon.webp
public/ui/book/language-es-frame-cartoon.png
public/ui/book/language-en-frame-cartoon.png
public/ui/book/prop-right-mug-cartoon.png
public/ui/games/*/mode-example.*
public/ui/games/guess-mana-v3/mana-cover.png
public/ui/games/guess-mana-v3/mana-crystal.png
public/ui/home-v2-icons/icon-mode-*.png
```

Assets de cartas generados:

```text
public/card-images/{es,en}/{thumb,game,adapted}/ID.webp
```

No están en Git y se regeneran con `scripts/v2/generate-card-images-multilang.mjs`.
