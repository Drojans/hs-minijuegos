# Scripts v2

Pipeline activo de imágenes de cartas.

## Script principal

```text
generate-card-images-multilang.mjs
```

Genera imágenes localizadas en:

```text
public/card-images/es/thumb/
public/card-images/es/game/
public/card-images/es/adapted/
public/card-images/en/thumb/
public/card-images/en/game/
public/card-images/en/adapted/
```

Y genera:

```text
public/data/cards.multilang.generated.json
```

## Uso rápido

```powershell
node scripts/v2/generate-card-images-multilang.mjs --limit=20
node scripts/v2/generate-card-images-multilang.mjs --all
```

## Notas

- No guarda PNG raw.
- No genera `detail` ni `art`.
- `adapted` sustituye al antiguo `normalized`.
- `public/card-images/` está ignorado por Git.
- `reports/` está ignorado por Git.
