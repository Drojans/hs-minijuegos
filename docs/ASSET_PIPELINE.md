# Pipeline de assets

## Estado actual

El proyecto usa assets locales de cartas, pero las carpetas pesadas de imágenes ya no están trackeadas por Git.

Esto significa:

```text
La app funciona en este ordenador porque las imágenes siguen en disco.
Git ya no guarda esas carpetas pesadas.
.gitignore evita que vuelvan a entrar.
```

## Carpetas pesadas locales ignoradas

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

Estas carpetas no deben borrarse todavía.

## Carpetas runtime ligeras mantenidas en Git

```text
public/fonts/
public/grid-icons/
public/ui/
```

## Datos activos en Git

```text
public/data/cards.json
public/data/cards.multilang.preview.json
```

`cards.json` es la base principal.

`cards.multilang.preview.json` es una preview multiidioma usada por la carga centralizada.

## Carga de imágenes localizada

La carga y elección de imágenes debe pasar por:

```text
src/utils/cardLocale.js
```

Orden general recomendado:

```text
1. imagesByLocale[locale][imageType]
2. imagesByLocale[otherLocale][imageType]
3. card[imageType]
4. campos fallback de imagen
```

## Carga de datos

La carga de datos de cartas debe pasar por:

```text
src/hooks/useCardsData.js
```

No conviene que cada juego haga su propio `fetch` de cartas.

## Preview multiidioma actual

La preview ES/EN usa:

```text
public/data/cards.multilang.preview.json
public/cards-localized/
public/cards-optimized-localized/
public/cards-normalized-localized/
```

Las carpetas de imágenes localizadas son locales/ignoradas; el JSON de preview sí está en Git porque es necesario para la prueba actual.

## Posible estructura futura

Cuando se haga el pipeline multiidioma completo, se podría unificar en algo como:

```text
public/card-images/
  es/
    raw/
    thumb/
    game/
    detail/
    normalized/
    art/
  en/
    raw/
    thumb/
    game/
    detail/
    normalized/
    art/
```

Pero no se debe mover ahora sin actualizar `cards.json`, scripts y helpers.

## Regla de limpieza

Nunca borrar una carpeta de imágenes hasta comprobar:

```text
1. cards.json ya no la referencia
2. cards.multilang.preview.json ya no la referencia
3. ningún componente la referencia directamente
4. scripts están actualizados
5. un script de validación confirma que no faltan rutas
```

## Próximas decisiones pendientes

```text
Decidir dónde vivirán los assets pesados si el proyecto se despliega fuera de local.
Revisar si public/cards puede dejar de ser fallback.
Definir pipeline definitivo para ES/EN completo.
```
