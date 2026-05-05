# Scripts del proyecto

## Pipeline activo de cartas

El pipeline actual vive en:

```text
scripts/v2/generate-card-images-multilang.mjs
```

## Qué hace

```text
1. Lee public/data/cards.multilang.generated.json.
2. Descarga renders desde HearthstoneJSON para ES y EN.
3. Genera WebP optimizados en public/card-images/{es,en}/.
4. No guarda PNG raw.
5. No genera detail ni art.
6. Actualiza public/data/cards.multilang.generated.json.
7. Genera informes temporales en reports/.
```

## Estructura generada

```text
public/card-images/es/thumb/
public/card-images/es/game/
public/card-images/es/adapted/
public/card-images/en/thumb/
public/card-images/en/game/
public/card-images/en/adapted/
```

## Comandos frecuentes

Prueba pequeña:

```powershell
node scripts/v2/generate-card-images-multilang.mjs --limit=20
```

Solo algunos tipos:

```powershell
node scripts/v2/generate-card-images-multilang.mjs --types=MINION,SPELL,WEAPON --limit=30
```

Carta concreta:

```powershell
node scripts/v2/generate-card-images-multilang.mjs --ids=AV_244 --overwrite
```

Todo:

```powershell
node scripts/v2/generate-card-images-multilang.mjs --all
```

Solo un idioma:

```powershell
node scripts/v2/generate-card-images-multilang.mjs --locales=es --limit=20
node scripts/v2/generate-card-images-multilang.mjs --locales=en --limit=20
```

## Scripts de limpieza

```text
scripts/cleanup/audit-book-assets-phase2.ps1
scripts/cleanup/archive-unused-book-assets-phase2.ps1
```

### Auditar assets de Home

```powershell
.\scripts\cleanup\audit-book-assets-phase2.ps1
```

Lista assets de `public/ui/book` y si aparecen referenciados en el código.

### Archivar assets antiguos de Home

```powershell
.\scripts\cleanup\archive-unused-book-assets-phase2.ps1
```

Mueve assets antiguos a una carpeta `_archive`. No debería usarse después de haber completado la limpieza salvo que vuelvan a aparecer assets legacy.

Si PowerShell bloquea scripts no firmados:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

## Carpetas generadas ignoradas

```text
public/card-images/
reports/
```

## Después de regenerar imágenes

Probar:

```powershell
npm run dev
```

Revisar visualmente:

```text
Home
Base de datos
Adivina el coste
Grid
Impostor
Cambio ES/EN
```

Para validación completa:

```powershell
npm run build
```
