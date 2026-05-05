# Guess Mana language toggle v30

Parche pequeño sobre tu versión actual de `Adivina el coste`.

## Qué añade

- Botones de idioma ES/EN en `/guess-mana`.
- Usa el componente compartido:

```text
src/shared/components/LanguageToggle/LanguageToggle.jsx
```

- Usa la misma variante visual de la Home:

```jsx
<LanguageToggle compact variant="book" />
```

- Reutiliza estos assets ya existentes:

```text
public/ui/book/language-es-frame-cartoon.png
public/ui/book/language-en-frame-cartoon.png
```

## Archivos tocados

```text
src/games/GuessManaCost/GuessManaCost.jsx
src/games/GuessManaCost/GuessManaCost.css
src/dev/GuessManaLayoutEditor.jsx
docs/GUESS_MANA_LANGUAGE_TOGGLE_V30.md
```

## Variables nuevas

Añadidas al `:root` de `GuessManaCost.css`:

```css
--gm-lang-right
--gm-lang-top
--gm-lang-scale
--gm-lang-button-size
--gm-lang-gap
--gm-lang-radius
--gm-z-language
```

También se han añadido al editor de layout de Guess Mana para que puedas moverlos con sliders.

## Uso

Abre:

```text
http://localhost:5173/guess-mana
```

Para editar posición:

```text
http://localhost:5173/guess-mana?layoutEditor=1
```

En el editor verás una sección nueva llamada `Idiomas`.
