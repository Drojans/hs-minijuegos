# Scripts v2

## Pipeline actual

El script activo es:

```text
generate-card-images-multilang.mjs
```

Genera imágenes localizadas en WebP para los dos idiomas de la app:

```text
public/card-images/es/thumb/
public/card-images/es/game/
public/card-images/es/adapted/
public/card-images/en/thumb/
public/card-images/en/game/
public/card-images/en/adapted/
```

También actualiza:

```text
public/data/cards.multilang.generated.json
```

## Uso recomendado

Prueba rápida:

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

## Notas

- No se guardan PNG raw.
- No se generan variantes `detail` ni `art`.
- `public/card-images/` y `reports/` están ignorados por Git.
- La app debe leer las rutas mediante `src/utils/cardLocale.js`.
