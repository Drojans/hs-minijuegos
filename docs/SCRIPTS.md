# Scripts del proyecto

## Script activo

El pipeline actual vive en:

```text
scripts/v2/generate-card-images-multilang.mjs
```

Los scripts legacy de la raíz de `scripts/` fueron eliminados para evitar recrear carpetas antiguas.

## Qué hace

```text
1. Lee public/data/cards.json.
2. Descarga renders desde HearthstoneJSON para ES y EN.
3. Genera WebP optimizados en public/card-images/{es,en}/.
4. No guarda PNG raw.
5. No genera detail ni art.
6. Crea public/data/cards.multilang.generated.json.
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

## Carpetas generadas ignoradas

```text
public/card-images/
reports/
```

## Archivos de datos

Entrada:

```text
public/data/cards.json
```

Salida activa:

```text
public/data/cards.multilang.generated.json
```

## Después de regenerar

Probar:

```powershell
npm run dev
```

Revisar visualmente:

```text
Base de datos ES/EN
Guess Mana ES/EN
Grid ES/EN
Impostor ES/EN
```

## No usar ya

No recrear ni volver a usar pipelines que generen:

```text
public/cards/
public/cards-optimized/
public/cards-normalized/
public/cards-localized/
public/cards-optimized-localized/
public/cards-normalized-localized/
public/card-art/
public/card-art-optimized/
```
