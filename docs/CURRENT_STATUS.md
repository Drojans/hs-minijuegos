# Estado actual estable

## Resumen

El proyecto queda en estado estable antes de tocar Impostor.

## Funciona actualmente

```text
Home: ES/EN OK
Base de datos: ES/EN OK
Adivina el coste: ES/EN OK
Grid de cartas: ES/EN OK
```

## Pendiente

```text
Impostor: pendiente de adaptar a idioma global
```

## Arquitectura actual

```text
src/hooks/useCardsData.js
  Carga cards.json y cards.multilang.preview.json.
  Mezcla imagesByLocale.
  Devuelve cartas preparadas.

src/utils/cardLocale.js
  Centraliza nombres, textos, imágenes y labels de cartas.

src/i18n/LanguageProvider.jsx
src/i18n/translations.js
  Centralizan idioma global y textos de la interfaz.
```

## Git/assets

Las imágenes pesadas están en local e ignoradas:

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

Esto mantiene el repo limpio, pero implica que un clon nuevo necesitará regenerar o copiar assets.

## Punto recomendado

Antes de tocar Impostor, crear un tag:

```bash
git tag stable-before-impostor-i18n
```

Opcionalmente subirlo si se usa remoto:

```bash
git push origin stable-before-impostor-i18n
```
