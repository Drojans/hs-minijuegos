# Asset audit fase 2 — completado

Esta auditoría correspondía a la limpieza de assets de la Home/libro.

## Estado final

Los assets activos de Home quedaron aplanados en:

```text
public/ui/book/
```

Ya no se usan rutas activas a:

```text
public/ui/book/cartoon-v1/
public/ui/book/render-v1/
```

## Assets activos esperados

```text
public/ui/book/button-primary-purple-cartoon.png
public/ui/book/divider-thin-black-cartoon.png
public/ui/book/home-open-book-cartoon.png
public/ui/book/home-tavern-backdrop-cartoon.webp
public/ui/book/icon-featured-mission-star-cartoon.png
public/ui/book/icon-mode-database-cartoon.png
public/ui/book/icon-mode-grid-cartoon.png
public/ui/book/icon-mode-impostor-cartoon.png
public/ui/book/icon-mode-mana-cartoon.png
public/ui/book/language-en-frame-cartoon.png
public/ui/book/language-es-frame-cartoon.png
public/ui/book/panel-featured-mission-cartoon.png
public/ui/book/panel-game-row-cartoon.png
public/ui/book/parchment-note-render.png
public/ui/book/prop-bottom-coins-cartoon.png
public/ui/book/prop-bottom-left-cards-cartoon.png
public/ui/book/prop-left-candle-cartoon.png
public/ui/book/prop-right-mug-cartoon.png
public/ui/book/section-divider-cartoon.png
public/ui/book/status-check-cartoon.png
public/ui/book/status-cross-cartoon.png
public/ui/book/status-minus-cartoon.png
```

## Comprobación

```powershell
.\scripts\cleanup\audit-book-assets-phase2.ps1
```

La salida esperada es que los assets activos aparezcan como `Used True`.

Si aparece algún asset `False`, revisar si es un asset reservado para futuro o eliminarlo.

## Nota

El script de archivado no borra definitivamente; mueve a `_archive`. Si ya has eliminado manualmente las carpetas antiguas, no hace falta volver a ejecutarlo.
