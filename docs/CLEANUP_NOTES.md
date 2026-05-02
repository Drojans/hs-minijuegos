# Notas de limpieza

## Estado estable actual

El proyecto está en un punto estable con:

```text
Home multiidioma
Base de datos multiidioma
Adivina el coste multiidioma
Grid de cartas multiidioma
Carga centralizada de cartas
Helpers globales de idioma/carta
public/data limpio
assets pesados fuera del tracking de Git
scripts documentados
```

Pendiente principal:

```text
Impostor todavía no está adaptado al idioma global.
```

## Limpieza ya completada

```text
.gitignore ordenado
docs creados
public/data limpiado
JSON temporales archivados fuera de public/data
scripts documentados
Maná movido a su propia carpeta
helpers globales añadidos
carga centralizada añadida
Maná adaptado a idioma global
Grid adaptado a idioma global
assets pesados destrackeados de Git
```

## No borrar todavía

No borrar estas carpetas locales aunque estén ignoradas:

```text
public/cards/
public/cards-optimized/
public/cards-normalized/
public/card-art/
public/card-art-optimized/
public/cards-localized/
public/cards-optimized-localized/
public/cards-normalized-localized/
```

Motivo:

```text
La app local todavía puede depender de esas rutas para renders y fallback.
```

## Mantener en Git

```text
src/
public/data/cards.json
public/data/cards.multilang.preview.json
public/fonts/
public/grid-icons/
public/ui/
docs/
scripts/
package.json
package-lock.json
vite.config.*
```

## Scripts

De momento:

```text
No eliminar scripts.
No mover scripts.
No ejecutar scripts destructivos sin revisar.
```

Consultar antes:

```text
docs/SCRIPTS.md
```

## Antes de tocar Impostor

Hacer siempre:

```text
1. git status limpio
2. commit/tag estable previo
3. tocar un archivo cada vez si se puede
4. no tocar CSS salvo necesidad real
5. probar Home, Base de datos, Maná y Grid después
6. commit propio de Impostor
```

## Orden recomendado a partir de ahora

```text
1. Crear tag estable antes de Impostor
2. Revisar estructura de Impostor sin cambiar lógica
3. Adaptar solo textos visibles de Impostor
4. Adaptar nombres/renders localizados de cartas
5. Probar
6. Commit
```

## Comandos útiles de comprobación

Ver estado:

```bash
git status
```

Comprobar que Git no trackea assets pesados:

```bash
git ls-files public/cards public/cards-optimized public/cards-normalized public/card-art public/card-art-optimized public/cards-localized public/cards-optimized-localized public/cards-normalized-localized
```

Debe no devolver nada.

Comprobar `public/data`:

```powershell
Get-ChildItem public\data | Select-Object Name, Length
```

Debe mostrar solo:

```text
cards.json
cards.multilang.preview.json
```
