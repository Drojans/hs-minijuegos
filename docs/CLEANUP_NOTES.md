# Notas de limpieza

## Limpieza completada

Se eliminaron o archivaron fuera del proyecto:

```text
public/cards/
public/cards-optimized/
public/cards-normalized/
public/cards-localized/
public/cards-optimized-localized/
public/cards-normalized-localized/
public/card-art/
public/card-art-optimized/
public/ui/
src/assets/
reports/
data-archive/
scripts legacy de la raíz de scripts/
public/data/cards.multilang.preview.json
```

## Estructura final activa

```text
public/data/cards.json
public/data/cards.multilang.generated.json
public/card-images/{es,en}/{thumb,game,adapted}/
scripts/v2/generate-card-images-multilang.mjs
src/utils/cardLocale.js
src/hooks/useCardsData.js
```

## Estado de juegos

```text
Home: OK
Base de datos: OK
Guess Mana: OK
Grid: OK
Impostor: OK
Idioma ES/EN: OK
```

## Regla para nuevos cambios

Antes de borrar cualquier cosa:

```text
1. git status limpio
2. buscar referencias en src/
3. mover a backup temporal, no borrar directo
4. probar npm run dev
5. probar ES/EN y minijuegos principales
6. commit
7. borrar backup temporal
```

## Búsquedas útiles

Referencias legacy en código:

```powershell
Get-ChildItem src -Recurse -File | Select-String -Pattern "cards-optimized-localized|cards-normalized-localized|cards.multilang.preview|/ui/|public/ui|imageArt|card-art|cards-optimized|cards-normalized|/cards/"
```

Rutas antiguas en todo el proyecto excepto docs:

```powershell
Get-ChildItem . -Recurse -File |
  Where-Object { $_.FullName -notmatch "\\.git\\|\\node_modules\\|\\docs\\" } |
  Select-String -Pattern "cards.multilang.preview|public/ui|cards-normalized-localized|cards-optimized-localized"
```

Estado de datos:

```powershell
Get-ChildItem public\data | Select-Object Name, Length
```

Estado Git:

```powershell
git status
```

## Carpetas que deben seguir ignoradas

```text
public/card-images/
reports/
data-archive/
```

Y también las carpetas legacy de imágenes, por si algún script viejo o backup las recrea.
