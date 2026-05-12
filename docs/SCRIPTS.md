# Scripts activos

## Generar imágenes localizadas de cartas

Script activo:

```powershell
node scripts/v2/generate-card-images-multilang.mjs --limit=20
```

Regenerar todo:

```powershell
node scripts/v2/generate-card-images-multilang.mjs --all
```

Carta concreta:

```powershell
node scripts/v2/generate-card-images-multilang.mjs --ids=AV_244 --overwrite
```

El script lee y actualiza:

```text
public/data/cards.multilang.generated.json
```

Y genera:

```text
public/card-images/es/thumb/
public/card-images/es/game/
public/card-images/es/adapted/
public/card-images/en/thumb/
public/card-images/en/game/
public/card-images/en/adapted/
reports/
```

Estas carpetas generadas están ignoradas por Git.

## Limpiezas antiguas

Los scripts antiguos de limpieza de assets de `public/ui/book` se eliminaron porque ya no corresponden a la estructura actual. La app usa ahora una lista pequeña de assets públicos activos documentada en `docs/PROJECT_STRUCTURE.md`.
