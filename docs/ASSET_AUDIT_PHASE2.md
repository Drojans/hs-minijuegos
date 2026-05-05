# Asset audit fase 2 — Home book

Esta fase limpia solo assets de `public/ui/book`.

## Cambio funcional mínimo

`src/App.css` ahora usa:

```css
url("/ui/book/cartoon-v1/parchment-note-render.png")
```

en lugar de:

```css
url("/ui/book/render-v1/parchment-note-render.png")
```

Así podemos archivar `render-v1` sin romper la nota del tabernero.

## Assets activos que se mantienen en `public/ui/book/cartoon-v1`

- `button-primary-purple-cartoon.png`
- `divider-thin-black-cartoon.png`
- `home-open-book-cartoon.png`
- `home-tavern-backdrop-cartoon.webp`
- `icon-featured-mission-star-cartoon.png`
- `icon-mode-database-cartoon.png`
- `icon-mode-grid-cartoon.png`
- `icon-mode-impostor-cartoon.png`
- `icon-mode-mana-cartoon.png`
- `language-en-frame-cartoon.png`
- `language-es-frame-cartoon.png`
- `panel-featured-mission-cartoon.png`
- `panel-game-row-cartoon.png`
- `parchment-note-render.png`
- `prop-bottom-coins-cartoon.png`
- `prop-bottom-left-cards-cartoon.png`
- `prop-left-candle-cartoon.png`
- `prop-right-mug-cartoon.png`
- `section-divider-cartoon.png`
- `status-check-cartoon.png`
- `status-cross-cartoon.png`
- `status-minus-cartoon.png`

## Assets archivables detectados

### `public/ui/book/` raíz

- `public/ui/book/featured-quest-frame-large.png`
- `public/ui/book/featured-quest-frame.png`
- `public/ui/book/icon-database.png`
- `public/ui/book/icon-grid.png`
- `public/ui/book/icon-impostor.png`
- `public/ui/book/icon-mana.png`
- `public/ui/book/open-book-overlay.webp`
- `public/ui/book/parchment-note-aged.png`
- `public/ui/book/parchment-note.png`
- `public/ui/book/purple-button.png`
- `public/ui/book/quest-row-aged-frame.png`
- `public/ui/book/quest-row-frame.png`
- `public/ui/book/quest-row-status-slot.png`
- `public/ui/book/tavern-background.webp`
- `public/ui/book/wood-button.png`

### Banderas/botones de idioma antiguos en `cartoon-v1`

- `public/ui/book/cartoon-v1/flag-es-cartoon.png`
- `public/ui/book/cartoon-v1/flag-es-flat-cartoon.png`
- `public/ui/book/cartoon-v1/flag-gb-cartoon.png`
- `public/ui/book/cartoon-v1/flag-gb-flat-cartoon.png`
- `public/ui/book/cartoon-v1/toggle-language-button-dark-cartoon.png`
- `public/ui/book/cartoon-v1/toggle-language-button-gold-cartoon.png`

### `public/ui/book/render-v1`

Se archiva completa después de copiar `parchment-note-render.png` a `cartoon-v1`.

## Cómo aplicar

1. Copia/machaca los archivos del zip.
2. Recarga y comprueba que la Home se ve igual.
3. Ejecuta:

```powershell
.\scripts\cleanup\archive-unused-book-assets-phase2.ps1
```

El script mueve archivos a:

```text
public/ui/book/_archive-unused-20260505/
```

No borra nada definitivamente.
