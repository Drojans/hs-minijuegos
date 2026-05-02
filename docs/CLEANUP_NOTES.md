# Notas de limpieza

## Punto estable actual

El commit estable actual incluye:

```text
Selector global de idioma en Home
CardBrowser usando idioma global
Preview localizada funcionando en Base de datos
```

No seguir aplicando idioma a minijuegos hasta limpiar helpers y carga de datos.

## Ignorado en Git

Assets pesados/locales ignorados en `.gitignore`:

```text
public/cards/
public/card-art/
public/cards-optimized/
public/cards-normalized/
public/card-art-optimized/
public/cards-localized/
public/cards-optimized-localized/
public/cards-normalized-localized/
```

Esto no borra nada del disco. Solo evita que Git los meta en commits.

## No borrar todavía

No borrar todavía:

```text
public/cards/
public/cards-optimized/
public/cards-normalized/
public/card-art-optimized/
```

Motivo: siguen referenciadas por `cards.json` y/o componentes como rutas runtime o fallback.

## Candidatos a mover/archivar después

```text
public/data/cards.backup.json
public/data/cards.before-art.json
public/data/cards.before-normalized-renders.json
public/data/cards.generated.es.json
public/data/cards.generated.es.with-images.json
public/data/cards.original.before-generated-es.json
public/data/normalized-renders-report.json
```

Posibles destinos:

```text
data-archive/
reports/archive/
```

## Antes de tocar minijuegos otra vez

Hacer primero:

```text
1. Mejorar LanguageProvider para soportar t(key, variables)
2. Añadir helpers globales de etiquetas de cartas
3. Centralizar helpers de imagen/nombre/texto de cartas
4. Centralizar carga de datos de cartas
5. Aplicar idioma a un minijuego cada vez
6. Probar
7. Commit
```

Orden recomendado:

```text
1. GuessManaCost
2. CardGrid
3. Impostor
```

Impostor debería ir al final porque tiene preload, plantillas neutrales y renderizado más delicado.
