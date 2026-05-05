import { useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "hearthdle-home-layout-editor-v10";
const PANEL_STORAGE_KEY = "hearthdle-home-layout-editor-panel-v10";
const TEXT_STORAGE_KEY = "hearthdle-home-layout-text-v7";

const SECTIONS = [
  [
    "Escena / libro",
    [
      [
        "--stage-max-w",
        "Stage max width",
        1000,
        3000,
        10,
        "px"
      ],
      [
        "--stage-pad-x",
        "Stage pad X",
        0,
        100,
        1,
        "px"
      ],
      [
        "--stage-pad-y",
        "Stage pad Y",
        0,
        100,
        1,
        "px"
      ],
      [
        "--backdrop-brightness",
        "Fondo brillo",
        0.5,
        1.6,
        0.01,
        ""
      ],
      [
        "--backdrop-saturation",
        "Fondo saturaciÃ³n",
        0.5,
        1.8,
        0.01,
        ""
      ],
      [
        "--book-x",
        "Libro X",
        -60,
        60,
        0.1,
        "%"
      ],
      [
        "--book-y",
        "Libro Y",
        -60,
        60,
        0.1,
        "%"
      ],
      [
        "--book-scale",
        "Libro escala",
        0.4,
        2.2,
        0.01,
        ""
      ],
      [
        "--z-book",
        "Libro capa",
        0,
        250,
        1,
        ""
      ]
    ]
  ],
  [
    "PÃ¡ginas",
    [
      [
        "--left-page-x",
        "PÃ¡gina izq X",
        -30,
        120,
        0.1,
        "%"
      ],
      [
        "--left-page-y",
        "PÃ¡gina izq Y",
        -30,
        120,
        0.1,
        "%"
      ],
      [
        "--left-page-w",
        "PÃ¡gina izq ancho",
        5,
        160,
        0.1,
        "%"
      ],
      [
        "--left-page-h",
        "PÃ¡gina izq alto",
        5,
        160,
        0.1,
        "%"
      ],
      [
        "--z-left-page",
        "PÃ¡gina izq capa",
        0,
        250,
        1,
        ""
      ],
      [
        "--right-page-x",
        "PÃ¡gina der X",
        -30,
        130,
        0.1,
        "%"
      ],
      [
        "--right-page-y",
        "PÃ¡gina der Y",
        -30,
        130,
        0.1,
        "%"
      ],
      [
        "--right-page-w",
        "PÃ¡gina der ancho",
        5,
        160,
        0.1,
        "%"
      ],
      [
        "--right-page-h",
        "PÃ¡gina der alto",
        5,
        160,
        0.1,
        "%"
      ],
      [
        "--z-right-page",
        "PÃ¡gina der capa",
        0,
        250,
        1,
        ""
      ]
    ]
  ],
  [
    "Props",
    [
      [
        "--candle-x",
        "Vela X",
        -140,
        180,
        0.1,
        "%"
      ],
      [
        "--candle-y",
        "Vela Y",
        -120,
        180,
        0.1,
        "%"
      ],
      [
        "--candle-w",
        "Vela ancho",
        1,
        180,
        0.1,
        "%"
      ],
      [
        "--candle-h",
        "Vela alto",
        1,
        180,
        0.1,
        "%"
      ],
      [
        "--z-candle",
        "Vela capa",
        0,
        250,
        1,
        ""
      ],
      [
        "--cards-x",
        "Cartas X",
        -140,
        180,
        0.1,
        "%"
      ],
      [
        "--cards-bottom",
        "Cartas bottom",
        -120,
        180,
        0.1,
        "%"
      ],
      [
        "--cards-w",
        "Cartas ancho",
        1,
        180,
        0.1,
        "%"
      ],
      [
        "--cards-h",
        "Cartas alto",
        1,
        180,
        0.1,
        "%"
      ],
      [
        "--cards-rotate",
        "Cartas rotaciÃ³n",
        -180,
        180,
        1,
        "deg"
      ],
      [
        "--z-cards",
        "Cartas capa",
        0,
        250,
        1,
        ""
      ],
      [
        "--coins-x",
        "Monedas X",
        -140,
        200,
        0.1,
        "%"
      ],
      [
        "--coins-bottom",
        "Monedas bottom",
        -120,
        200,
        0.1,
        "%"
      ],
      [
        "--coins-w",
        "Monedas ancho",
        1,
        180,
        0.1,
        "%"
      ],
      [
        "--coins-h",
        "Monedas alto",
        1,
        180,
        0.1,
        "%"
      ],
      [
        "--z-coins",
        "Monedas capa",
        0,
        250,
        1,
        ""
      ],
      [
        "--mug-right",
        "Jarra right",
        -140,
        180,
        0.1,
        "%"
      ],
      [
        "--mug-bottom",
        "Jarra bottom",
        -120,
        200,
        0.1,
        "%"
      ],
      [
        "--mug-w",
        "Jarra ancho",
        1,
        180,
        0.1,
        "%"
      ],
      [
        "--mug-h",
        "Jarra alto",
        1,
        180,
        0.1,
        "%"
      ],
      [
        "--z-mug",
        "Jarra capa",
        0,
        250,
        1,
        ""
      ]
    ]
  ],
  [
    "Izquierda",
    [
      [
        "--kicker-x",
        "SubtÃ­tulo X",
        -60,
        140,
        0.1,
        "%"
      ],
      [
        "--z-kicker",
        "SubtÃ­tulo capa",
        0,
        250,
        1,
        ""
      ],
      [
        "--main-title-x",
        "TÃ­tulo X",
        -60,
        140,
        0.1,
        "%"
      ],
      [
        "--main-title-y",
        "TÃ­tulo Y",
        -60,
        140,
        0.1,
        "%"
      ],
      [
        "--z-main-title",
        "TÃ­tulo capa",
        0,
        250,
        1,
        ""
      ],
      [
        "--note-x",
        "Nota X",
        -80,
        160,
        0.1,
        "%"
      ],
      [
        "--note-y",
        "Nota Y",
        -80,
        160,
        0.1,
        "%"
      ],
      [
        "--note-w",
        "Nota ancho",
        5,
        180,
        0.1,
        "%"
      ],
      [
        "--note-h",
        "Nota alto",
        5,
        160,
        0.1,
        "%"
      ],
      [
        "--note-rotate",
        "Nota rotaciÃ³n",
        -80,
        80,
        0.1,
        "deg"
      ],
      [
        "--z-note",
        "Nota capa",
        0,
        250,
        1,
        ""
      ],
      [
        "--featured-x",
        "Destacada X",
        -80,
        160,
        0.1,
        "%"
      ],
      [
        "--featured-y",
        "Destacada Y",
        -80,
        160,
        0.1,
        "%"
      ],
      [
        "--featured-w",
        "Destacada ancho",
        5,
        180,
        0.1,
        "%"
      ],
      [
        "--featured-h",
        "Destacada alto",
        5,
        160,
        0.1,
        "%"
      ],
      [
        "--z-featured",
        "Destacada capa",
        0,
        250,
        1,
        ""
      ]
    ]
  ],
  [
    "Derecha / tÃ­tulo",
    [
      [
        "--wanted-x",
        "TÃ­tulo X base",
        -80,
        160,
        0.1,
        "%"
      ],
      [
        "--wanted-y",
        "TÃ­tulo Y base",
        -80,
        160,
        0.1,
        "%"
      ],
      [
        "--wanted-title-offset-x",
        "TÃ­tulo X fino",
        -160,
        160,
        0.1,
        "%"
      ],
      [
        "--wanted-title-offset-y",
        "TÃ­tulo Y fino",
        -160,
        160,
        0.1,
        "%"
      ],
      [
        "--z-wanted-title",
        "TÃ­tulo capa",
        0,
        250,
        1,
        ""
      ],
      [
        "--wanted-divider-x",
        "LÃ­nea X",
        -80,
        160,
        0.1,
        "%"
      ],
      [
        "--wanted-divider-y",
        "LÃ­nea Y",
        -120,
        120,
        0.1,
        "%"
      ],
      [
        "--wanted-divider-w",
        "LÃ­nea ancho",
        1,
        140,
        0.1,
        "%"
      ],
      [
        "--wanted-divider-h",
        "LÃ­nea alto",
        0.2,
        20,
        0.1,
        "%"
      ],
      [
        "--wanted-divider-opacity",
        "LÃ­nea opacidad",
        0,
        1,
        0.01,
        ""
      ],
      [
        "--z-wanted-divider",
        "LÃ­nea capa",
        0,
        250,
        1,
        ""
      ]
    ]
  ],
  [
    "Derecha / bloque global",
    [
      [
        "--rows-top",
        "Filas top",
        -80,
        160,
        0.1,
        "%"
      ],
      [
        "--rows-gap",
        "Filas separaciÃ³n",
        0,
        40,
        0.05,
        "%"
      ],
      [
        "--row-x",
        "Filas X global",
        -160,
        160,
        0.1,
        "%"
      ],
      [
        "--row-w",
        "Fila ancho global",
        10,
        220,
        0.1,
        "%"
      ],
      [
        "--row-panel-scale-x",
        "Fila escala X global",
        0.2,
        4,
        0.01,
        ""
      ],
      [
        "--row-panel-scale-y",
        "Fila escala Y global",
        0.2,
        4,
        0.01,
        ""
      ],
      [
        "--z-quest-row",
        "Texto capa global",
        0,
        250,
        1,
        ""
      ],
      [
        "--button-w",
        "BotÃ³n ancho",
        10,
        200,
        0.1,
        "%"
      ],
      [
        "--button-h",
        "BotÃ³n alto",
        1,
        50,
        0.1,
        "%"
      ],
      [
        "--button-scale-x",
        "BotÃ³n escala X",
        0.2,
        4,
        0.01,
        ""
      ],
      [
        "--button-scale-y",
        "BotÃ³n escala Y",
        0.2,
        4,
        0.01,
        ""
      ],
      [
        "--button-top",
        "BotÃ³n top",
        -80,
        160,
        0.1,
        "%"
      ],
      [
        "--z-purple-button",
        "BotÃ³n capa",
        0,
        250,
        1,
        ""
      ],
      [
        "--signature-top",
        "Firma top",
        -60,
        140,
        0.1,
        "%"
      ],
      [
        "--z-signature",
        "Firma capa",
        0,
        250,
        1,
        ""
      ]
    ]
  ],
  [
    "Fila completa",
    [
      [
        "--row-guess-x",
        "Adivina fila X",
        -160,
        160,
        0.1,
        "%"
      ],
      [
        "--row-guess-y",
        "Adivina fila Y",
        -160,
        160,
        0.1,
        "%"
      ],
      [
        "--row-guess-w",
        "Adivina fila ancho",
        10,
        220,
        0.1,
        "%"
      ],
      [
        "--row-guess-h",
        "Adivina fila alto",
        20,
        260,
        1,
        "px"
      ],
      [
        "--row-guess-scale-x",
        "Adivina fila escala X",
        0.2,
        4,
        0.01,
        ""
      ],
      [
        "--row-guess-scale-y",
        "Adivina fila escala Y",
        0.2,
        4,
        0.01,
        ""
      ],
      [
        "--z-row-guess",
        "Adivina fila capa",
        0,
        250,
        1,
        ""
      ],
      [
        "--row-impostor-x",
        "Impostor fila X",
        -160,
        160,
        0.1,
        "%"
      ],
      [
        "--row-impostor-y",
        "Impostor fila Y",
        -160,
        160,
        0.1,
        "%"
      ],
      [
        "--row-impostor-w",
        "Impostor fila ancho",
        10,
        220,
        0.1,
        "%"
      ],
      [
        "--row-impostor-h",
        "Impostor fila alto",
        20,
        260,
        1,
        "px"
      ],
      [
        "--row-impostor-scale-x",
        "Impostor fila escala X",
        0.2,
        4,
        0.01,
        ""
      ],
      [
        "--row-impostor-scale-y",
        "Impostor fila escala Y",
        0.2,
        4,
        0.01,
        ""
      ],
      [
        "--z-row-impostor",
        "Impostor fila capa",
        0,
        250,
        1,
        ""
      ],
      [
        "--row-grid-x",
        "Grid fila X",
        -160,
        160,
        0.1,
        "%"
      ],
      [
        "--row-grid-y",
        "Grid fila Y",
        -160,
        160,
        0.1,
        "%"
      ],
      [
        "--row-grid-w",
        "Grid fila ancho",
        10,
        220,
        0.1,
        "%"
      ],
      [
        "--row-grid-h",
        "Grid fila alto",
        20,
        260,
        1,
        "px"
      ],
      [
        "--row-grid-scale-x",
        "Grid fila escala X",
        0.2,
        4,
        0.01,
        ""
      ],
      [
        "--row-grid-scale-y",
        "Grid fila escala Y",
        0.2,
        4,
        0.01,
        ""
      ],
      [
        "--z-row-grid",
        "Grid fila capa",
        0,
        250,
        1,
        ""
      ],
      [
        "--row-cards-x",
        "BD fila X",
        -160,
        160,
        0.1,
        "%"
      ],
      [
        "--row-cards-y",
        "BD fila Y",
        -160,
        160,
        0.1,
        "%"
      ],
      [
        "--row-cards-w",
        "BD fila ancho",
        10,
        220,
        0.1,
        "%"
      ],
      [
        "--row-cards-h",
        "BD fila alto",
        20,
        260,
        1,
        "px"
      ],
      [
        "--row-cards-scale-x",
        "BD fila escala X",
        0.2,
        4,
        0.01,
        ""
      ],
      [
        "--row-cards-scale-y",
        "BD fila escala Y",
        0.2,
        4,
        0.01,
        ""
      ],
      [
        "--z-row-cards",
        "BD fila capa",
        0,
        250,
        1,
        ""
      ]
    ]
  ],
  [
    "Fondo visual del panel",
    [
      [
        "--panel-bg-guess-x",
        "Adivina fondo X",
        -160,
        160,
        0.1,
        "%"
      ],
      [
        "--panel-bg-guess-y",
        "Adivina fondo Y",
        -160,
        160,
        0.1,
        "%"
      ],
      [
        "--panel-bg-guess-w",
        "Adivina fondo ancho",
        10,
        240,
        0.1,
        "%"
      ],
      [
        "--panel-bg-guess-h",
        "Adivina fondo alto",
        10,
        240,
        0.1,
        "%"
      ],
      [
        "--panel-bg-guess-scale-x",
        "Adivina fondo escala X",
        0.2,
        4,
        0.01,
        ""
      ],
      [
        "--panel-bg-guess-scale-y",
        "Adivina fondo escala Y",
        0.2,
        4,
        0.01,
        ""
      ],
      [
        "--z-panel-bg-guess",
        "Adivina fondo capa",
        -20,
        200,
        1,
        ""
      ],
      [
        "--panel-bg-impostor-x",
        "Impostor fondo X",
        -160,
        160,
        0.1,
        "%"
      ],
      [
        "--panel-bg-impostor-y",
        "Impostor fondo Y",
        -160,
        160,
        0.1,
        "%"
      ],
      [
        "--panel-bg-impostor-w",
        "Impostor fondo ancho",
        10,
        240,
        0.1,
        "%"
      ],
      [
        "--panel-bg-impostor-h",
        "Impostor fondo alto",
        10,
        240,
        0.1,
        "%"
      ],
      [
        "--panel-bg-impostor-scale-x",
        "Impostor fondo escala X",
        0.2,
        4,
        0.01,
        ""
      ],
      [
        "--panel-bg-impostor-scale-y",
        "Impostor fondo escala Y",
        0.2,
        4,
        0.01,
        ""
      ],
      [
        "--z-panel-bg-impostor",
        "Impostor fondo capa",
        -20,
        200,
        1,
        ""
      ],
      [
        "--panel-bg-grid-x",
        "Grid fondo X",
        -160,
        160,
        0.1,
        "%"
      ],
      [
        "--panel-bg-grid-y",
        "Grid fondo Y",
        -160,
        160,
        0.1,
        "%"
      ],
      [
        "--panel-bg-grid-w",
        "Grid fondo ancho",
        10,
        240,
        0.1,
        "%"
      ],
      [
        "--panel-bg-grid-h",
        "Grid fondo alto",
        10,
        240,
        0.1,
        "%"
      ],
      [
        "--panel-bg-grid-scale-x",
        "Grid fondo escala X",
        0.2,
        4,
        0.01,
        ""
      ],
      [
        "--panel-bg-grid-scale-y",
        "Grid fondo escala Y",
        0.2,
        4,
        0.01,
        ""
      ],
      [
        "--z-panel-bg-grid",
        "Grid fondo capa",
        -20,
        200,
        1,
        ""
      ],
      [
        "--panel-bg-cards-x",
        "BD fondo X",
        -160,
        160,
        0.1,
        "%"
      ],
      [
        "--panel-bg-cards-y",
        "BD fondo Y",
        -160,
        160,
        0.1,
        "%"
      ],
      [
        "--panel-bg-cards-w",
        "BD fondo ancho",
        10,
        240,
        0.1,
        "%"
      ],
      [
        "--panel-bg-cards-h",
        "BD fondo alto",
        10,
        240,
        0.1,
        "%"
      ],
      [
        "--panel-bg-cards-scale-x",
        "BD fondo escala X",
        0.2,
        4,
        0.01,
        ""
      ],
      [
        "--panel-bg-cards-scale-y",
        "BD fondo escala Y",
        0.2,
        4,
        0.01,
        ""
      ],
      [
        "--z-panel-bg-cards",
        "BD fondo capa",
        -20,
        200,
        1,
        ""
      ]
    ]
  ],
  [
    "Texto de paneles",
    [
      [
        "--copy-guess-x",
        "Adivina texto X",
        -160,
        160,
        0.1,
        "%"
      ],
      [
        "--copy-guess-y",
        "Adivina texto Y",
        -160,
        160,
        0.1,
        "%"
      ],
      [
        "--copy-guess-scale",
        "Adivina texto escala",
        0.2,
        4,
        0.01,
        ""
      ],
      [
        "--z-copy-guess",
        "Adivina texto capa",
        0,
        250,
        1,
        ""
      ],
      [
        "--copy-impostor-x",
        "Impostor texto X",
        -160,
        160,
        0.1,
        "%"
      ],
      [
        "--copy-impostor-y",
        "Impostor texto Y",
        -160,
        160,
        0.1,
        "%"
      ],
      [
        "--copy-impostor-scale",
        "Impostor texto escala",
        0.2,
        4,
        0.01,
        ""
      ],
      [
        "--z-copy-impostor",
        "Impostor texto capa",
        0,
        250,
        1,
        ""
      ],
      [
        "--copy-grid-x",
        "Grid texto X",
        -160,
        160,
        0.1,
        "%"
      ],
      [
        "--copy-grid-y",
        "Grid texto Y",
        -160,
        160,
        0.1,
        "%"
      ],
      [
        "--copy-grid-scale",
        "Grid texto escala",
        0.2,
        4,
        0.01,
        ""
      ],
      [
        "--z-copy-grid",
        "Grid texto capa",
        0,
        250,
        1,
        ""
      ],
      [
        "--copy-cards-x",
        "BD texto X",
        -160,
        160,
        0.1,
        "%"
      ],
      [
        "--copy-cards-y",
        "BD texto Y",
        -160,
        160,
        0.1,
        "%"
      ],
      [
        "--copy-cards-scale",
        "BD texto escala",
        0.2,
        4,
        0.01,
        ""
      ],
      [
        "--z-copy-cards",
        "BD texto capa",
        0,
        250,
        1,
        ""
      ]
    ]
  ],
  [
    "Iconos izquierda",
    [
      [
        "--row-icon-size",
        "Iconos tamaÃ±o global",
        5,
        260,
        0.1,
        "%"
      ],
      [
        "--row-icon-x",
        "Iconos X global",
        -160,
        160,
        0.1,
        "%"
      ],
      [
        "--row-icon-y",
        "Iconos Y global",
        -160,
        160,
        0.1,
        "%"
      ],
      [
        "--row-icon-scale",
        "Iconos escala global",
        0.1,
        5,
        0.01,
        ""
      ],
      [
        "--z-quest-icon",
        "Iconos capa global",
        0,
        250,
        1,
        ""
      ],
      [
        "--icon-guess-x",
        "Adivina icono X",
        -160,
        160,
        0.1,
        "%"
      ],
      [
        "--icon-guess-y",
        "Adivina icono Y",
        -160,
        160,
        0.1,
        "%"
      ],
      [
        "--icon-guess-scale",
        "Adivina icono escala",
        0.1,
        5,
        0.01,
        ""
      ],
      [
        "--z-icon-guess",
        "Adivina icono capa",
        0,
        250,
        1,
        ""
      ],
      [
        "--icon-impostor-x",
        "Impostor icono X",
        -160,
        160,
        0.1,
        "%"
      ],
      [
        "--icon-impostor-y",
        "Impostor icono Y",
        -160,
        160,
        0.1,
        "%"
      ],
      [
        "--icon-impostor-scale",
        "Impostor icono escala",
        0.1,
        5,
        0.01,
        ""
      ],
      [
        "--z-icon-impostor",
        "Impostor icono capa",
        0,
        250,
        1,
        ""
      ],
      [
        "--icon-grid-x",
        "Grid icono X",
        -160,
        160,
        0.1,
        "%"
      ],
      [
        "--icon-grid-y",
        "Grid icono Y",
        -160,
        160,
        0.1,
        "%"
      ],
      [
        "--icon-grid-scale",
        "Grid icono escala",
        0.1,
        5,
        0.01,
        ""
      ],
      [
        "--z-icon-grid",
        "Grid icono capa",
        0,
        250,
        1,
        ""
      ],
      [
        "--icon-cards-x",
        "BD icono X",
        -160,
        160,
        0.1,
        "%"
      ],
      [
        "--icon-cards-y",
        "BD icono Y",
        -160,
        160,
        0.1,
        "%"
      ],
      [
        "--icon-cards-scale",
        "BD icono escala",
        0.1,
        5,
        0.01,
        ""
      ],
      [
        "--z-icon-cards",
        "BD icono capa",
        0,
        250,
        1,
        ""
      ]
    ]
  ],
  [
    "Estados derecha",
    [
      [
        "--row-status-size",
        "Estados tamaÃ±o global",
        5,
        180,
        0.1,
        "px"
      ],
      [
        "--row-status-x",
        "Estados X global",
        -160,
        160,
        0.1,
        "%"
      ],
      [
        "--row-status-y",
        "Estados Y global",
        -160,
        160,
        0.1,
        "%"
      ],
      [
        "--row-status-scale",
        "Estados escala global",
        0.1,
        5,
        0.01,
        ""
      ],
      [
        "--z-quest-status",
        "Estados capa global",
        0,
        250,
        1,
        ""
      ],
      [
        "--status-guess-x",
        "Adivina tick X",
        -160,
        160,
        0.1,
        "%"
      ],
      [
        "--status-guess-y",
        "Adivina tick Y",
        -160,
        160,
        0.1,
        "%"
      ],
      [
        "--status-guess-scale",
        "Adivina tick escala",
        0.1,
        5,
        0.01,
        ""
      ],
      [
        "--z-status-guess",
        "Adivina tick capa",
        0,
        250,
        1,
        ""
      ],
      [
        "--status-impostor-x",
        "Impostor guion X",
        -160,
        160,
        0.1,
        "%"
      ],
      [
        "--status-impostor-y",
        "Impostor guion Y",
        -160,
        160,
        0.1,
        "%"
      ],
      [
        "--status-impostor-scale",
        "Impostor guion escala",
        0.1,
        5,
        0.01,
        ""
      ],
      [
        "--z-status-impostor",
        "Impostor guion capa",
        0,
        250,
        1,
        ""
      ],
      [
        "--status-grid-x",
        "Grid X icono X",
        -160,
        160,
        0.1,
        "%"
      ],
      [
        "--status-grid-y",
        "Grid X icono Y",
        -160,
        160,
        0.1,
        "%"
      ],
      [
        "--status-grid-scale",
        "Grid X icono escala",
        0.1,
        5,
        0.01,
        ""
      ],
      [
        "--z-status-grid",
        "Grid X icono capa",
        0,
        250,
        1,
        ""
      ]
    ]
  ],
  [
    "Hitbox clicable",
    [
      [
        "--hitbox-guess-x",
        "Adivina hitbox X",
        -80,
        120,
        0.1,
        "%"
      ],
      [
        "--hitbox-guess-y",
        "Adivina hitbox Y",
        -80,
        120,
        0.1,
        "%"
      ],
      [
        "--hitbox-guess-w",
        "Adivina hitbox ancho",
        5,
        160,
        0.1,
        "%"
      ],
      [
        "--hitbox-guess-h",
        "Adivina hitbox alto",
        5,
        160,
        0.1,
        "%"
      ],
      [
        "--hitbox-impostor-x",
        "Impostor hitbox X",
        -80,
        120,
        0.1,
        "%"
      ],
      [
        "--hitbox-impostor-y",
        "Impostor hitbox Y",
        -80,
        120,
        0.1,
        "%"
      ],
      [
        "--hitbox-impostor-w",
        "Impostor hitbox ancho",
        5,
        160,
        0.1,
        "%"
      ],
      [
        "--hitbox-impostor-h",
        "Impostor hitbox alto",
        5,
        160,
        0.1,
        "%"
      ],
      [
        "--hitbox-grid-x",
        "Grid hitbox X",
        -80,
        120,
        0.1,
        "%"
      ],
      [
        "--hitbox-grid-y",
        "Grid hitbox Y",
        -80,
        120,
        0.1,
        "%"
      ],
      [
        "--hitbox-grid-w",
        "Grid hitbox ancho",
        5,
        160,
        0.1,
        "%"
      ],
      [
        "--hitbox-grid-h",
        "Grid hitbox alto",
        5,
        160,
        0.1,
        "%"
      ],
      [
        "--hitbox-cards-x",
        "BD hitbox X",
        -80,
        120,
        0.1,
        "%"
      ],
      [
        "--hitbox-cards-y",
        "BD hitbox Y",
        -80,
        120,
        0.1,
        "%"
      ],
      [
        "--hitbox-cards-w",
        "BD hitbox ancho",
        5,
        160,
        0.1,
        "%"
      ],
      [
        "--hitbox-cards-h",
        "BD hitbox alto",
        5,
        160,
        0.1,
        "%"
      ]
    ]
  ],
  [
    "Idioma",
    [
      [
        "--lang-right",
        "Idioma right",
        -140,
        180,
        0.1,
        "%"
      ],
      [
        "--lang-top",
        "Idioma top",
        -140,
        180,
        0.1,
        "%"
      ],
      [
        "--lang-scale",
        "Idioma escala",
        0.05,
        5,
        0.01,
        ""
      ],
      [
        "--lang-button-size",
        "BotÃ³n idioma tamaÃ±o",
        10,
        90,
        1,
        "px"
      ],
      [
        "--lang-gap",
        "Idioma separaciÃ³n",
        0,
        40,
        1,
        "px"
      ],
      [
        "--lang-radius",
        "Idioma borde redondeado",
        0,
        24,
        1,
        "px"
      ],
      [
        "--lang-flag-size",
        "Bandera tamaÃ±o",
        8,
        60,
        1,
        "px"
      ],
      [
        "--z-language",
        "Idioma capa",
        0,
        300,
        1,
        ""
      ]
    ]
  ]
];
const TEXT_FIELDS = [
  [
    "wanted.title",
    "TÃ­tulo principal derecha"
  ],
  [
    "guessMana.title",
    "Adivina coste - tÃ­tulo"
  ],
  [
    "guessMana.description",
    "Adivina coste - descripciÃ³n"
  ],
  [
    "impostor.title",
    "Impostor - tÃ­tulo"
  ],
  [
    "impostor.description",
    "Impostor - descripciÃ³n"
  ],
  [
    "grid.title",
    "Grid - tÃ­tulo"
  ],
  [
    "grid.description",
    "Grid - descripciÃ³n"
  ],
  [
    "cards.title",
    "Base de datos - tÃ­tulo"
  ],
  [
    "cards.description",
    "Base de datos - descripciÃ³n"
  ]
];

const ALL_CONTROLS = SECTIONS.flatMap((section) => section[1]);
const STATIC_ROOT_VARS = [
  [
    "color-scheme",
    "dark"
  ],
  [
    "--hs-ink",
    "#2b1208"
  ],
  [
    "--hs-text",
    "#f7edd8"
  ],
  [
    "--z-backdrop",
    "0"
  ],
  [
    "--z-vignette",
    "1"
  ],
  [
    "--z-stage",
    "2"
  ],
  [
    "--z-updated",
    "20"
  ],
  [
    "--z-quest-list",
    "auto"
  ],
  [
    "--z-props-default",
    "30"
  ],
  [
    "--kicker-font",
    "clamp(0.52rem, 0.9vw, 0.86rem)"
  ],
  [
    "--main-title-font",
    "clamp(1.75rem, 3.55vw, 4.3rem)"
  ],
  [
    "--note-heading-font",
    "clamp(0.48rem, 0.82vw, 0.82rem)"
  ],
  [
    "--note-text-font",
    "clamp(0.6rem, 0.98vw, 1.04rem)"
  ],
  [
    "--featured-title-font",
    "clamp(0.58rem, 0.94vw, 0.96rem)"
  ],
  [
    "--featured-body-font",
    "clamp(0.46rem, 0.75vw, 0.78rem)"
  ],
  [
    "--updated-x",
    "2.4%"
  ],
  [
    "--updated-bottom",
    "1.35%"
  ],
  [
    "--updated-font",
    "clamp(0.38rem, 0.6vw, 0.64rem)"
  ],
  [
    "--wanted-font",
    "clamp(1.42rem, 2.75vw, 3.05rem)"
  ],
  [
    "--row-h",
    "clamp(68px, 6.75vw, 112px)"
  ],
  [
    "--row-title-font",
    "clamp(0.72rem, 1.13vw, 1.2rem)"
  ],
  [
    "--row-desc-font",
    "clamp(0.45rem, 0.68vw, 0.74rem)"
  ],
  [
    "--button-font",
    "clamp(0.54rem, 0.86vw, 0.92rem)"
  ],
  [
    "--signature-font",
    "clamp(0.52rem, 0.84vw, 0.86rem)"
  ],
  [
    "--status-cards-x",
    "0%"
  ],
  [
    "--status-cards-y",
    "0%"
  ],
  [
    "--status-cards-scale",
    "0.83"
  ],
  [
    "--status-cards-opacity",
    "0.81"
  ],
  [
    "--z-status-cards",
    "22"
  ]
];

function parseNumber(value, fallback = 0) {
  const match = String(value ?? "").match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : fallback;
}

function getCssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function formatValue(value, unit) {
  if (unit === "") return String(value);
  return `${value}${unit}`;
}

function readTextValues() {
  try {
    return JSON.parse(localStorage.getItem(TEXT_STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function getDefaultPanelPosition() {
  if (typeof window === "undefined") return { x: 12, y: 12 };

  try {
    const saved = JSON.parse(localStorage.getItem(PANEL_STORAGE_KEY) || "null");
    if (saved && Number.isFinite(saved.x) && Number.isFinite(saved.y)) return saved;
  } catch {
    // ignore
  }

  return { x: Math.max(12, window.innerWidth - 410), y: 12 };
}

export default function LayoutEditor() {
  const [values, setValues] = useState({});
  const [textValues, setTextValues] = useState(() => readTextValues());
  const [collapsed, setCollapsed] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [message, setMessage] = useState("");
  const [panelPosition, setPanelPosition] = useState(getDefaultPanelPosition);
  const [scrollTop, setScrollTop] = useState(0);

  const scrollRef = useRef(null);
  const scrollMemoryRef = useRef(0);
  const scrollRafRef = useRef(null);

  const controlsByName = useMemo(() => {
    return Object.fromEntries(ALL_CONTROLS.map((control) => [control[0], control]));
  }, []);

  useEffect(() => {
    let saved = {};
    try {
      saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch {
      saved = {};
    }

    Object.entries(saved).forEach(([name, value]) => {
      document.documentElement.style.setProperty(name, value);
    });

    const initial = {};

    ALL_CONTROLS.forEach(([name, _label, _min, _max, _step, unit]) => {
      const raw = saved[name] ?? getCssVar(name);
      initial[name] = parseNumber(raw, 0);

      if (saved[name]) {
        document.documentElement.style.setProperty(name, saved[name]);
      } else if (raw) {
        document.documentElement.style.setProperty(name, raw);
      } else {
        document.documentElement.style.setProperty(name, formatValue(initial[name], unit));
      }
    });

    setValues(initial);
  }, []);

  useEffect(() => {
    localStorage.setItem(PANEL_STORAGE_KEY, JSON.stringify(panelPosition));
  }, [panelPosition]);

  useEffect(() => {
    if (!hidden && scrollRef.current) {
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollTop;
        }
      });
    }
    // Solo restauramos al volver a mostrar el panel. No en cada scroll,
    // porque eso crea una pelea entre el usuario y React y hace que el panel tiemble.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hidden]);

  function updateValue(name, value) {
    const control = controlsByName[name];
    const unit = control?.[5] ?? "";
    const numeric = Number(value);

    setValues((current) => {
      const next = { ...current, [name]: numeric };
      const saved = {};

      Object.entries(next).forEach(([key, val]) => {
        const unitForKey = controlsByName[key]?.[5] ?? "";
        saved[key] = formatValue(val, unitForKey);
      });

      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
      return next;
    });

    document.documentElement.style.setProperty(name, formatValue(numeric, unit));
  }

  function updateTextValue(name, value) {
    setTextValues((current) => {
      const next = { ...current, [name]: value };
      localStorage.setItem(TEXT_STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event("hearthdle-layout-text-change"));
      return next;
    });
  }

  function beginDrag(event) {
    if (event.button !== 0) return;

    const startX = event.clientX;
    const startY = event.clientY;
    const start = { ...panelPosition };

    function onMove(moveEvent) {
      setPanelPosition({
        x: Math.max(0, Math.min(window.innerWidth - 60, start.x + moveEvent.clientX - startX)),
        y: Math.max(0, Math.min(window.innerHeight - 44, start.y + moveEvent.clientY - startY)),
      });
    }

    function onUp() {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  async function copyCss() {
    const lines = [":root {"];
    lines.push("  /* Base obligatoria */");

    STATIC_ROOT_VARS.forEach(([name, value]) => {
      lines.push(`  ${name}: ${value};`);
    });

    lines.push("");

    SECTIONS.forEach(([sectionTitle, controls]) => {
      lines.push(`  /* ${sectionTitle} */`);
      controls.forEach(([name, _label, _min, _max, _step, unit]) => {
        const value = values[name] ?? parseNumber(getCssVar(name), 0);
        lines.push(`  ${name}: ${formatValue(value, unit)};`);
      });
      lines.push("");
    });

    lines.push("}");

    await navigator.clipboard.writeText(lines.join("\n"));
    setMessage("ROOT completo copiado");
    window.setTimeout(() => setMessage(""), 1600);
  }

  async function copyTextJson() {
    await navigator.clipboard.writeText(JSON.stringify(textValues, null, 2));
    setMessage("Textos copiados");
    window.setTimeout(() => setMessage(""), 1600);
  }

  function resetEditor() {
    localStorage.removeItem(STORAGE_KEY);
    ALL_CONTROLS.forEach(([name]) => document.documentElement.style.removeProperty(name));
    window.location.reload();
  }

  function resetTexts() {
    localStorage.removeItem(TEXT_STORAGE_KEY);
    setTextValues({});
    window.dispatchEvent(new Event("hearthdle-layout-text-change"));
  }

  function hideEditor() {
    if (scrollRef.current) {
      scrollMemoryRef.current = scrollRef.current.scrollTop;
      setScrollTop(scrollMemoryRef.current);
    }

    setHidden(true);
  }

  const panelStyle = {
    ...styles.panel,
    left: panelPosition.x,
    top: panelPosition.y,
    width: collapsed ? 210 : 405,
  };

  if (hidden) {
    return (
      <button
        type="button"
        style={{ ...styles.showButton, left: panelPosition.x, top: panelPosition.y }}
        onClick={() => setHidden(false)}
      >
        Mostrar editor
      </button>
    );
  }

  return (
    <aside style={panelStyle}>
      <div style={styles.header} onPointerDown={beginDrag}>
        <strong>Layout editor</strong>
        <div style={styles.headerActions} onPointerDown={(event) => event.stopPropagation()}>
          <button type="button" style={styles.smallButton} onClick={() => setCollapsed((v) => !v)}>
            {collapsed ? "Abrir" : "Plegar"}
          </button>
          <button type="button" style={styles.smallButton} onClick={hideEditor}>
            Ocultar
          </button>
        </div>
      </div>

      {!collapsed ? (
        <>
          <p style={styles.help}>
            v10: banderas con marco e hitboxes ceÃ±idas a los paneles.
          </p>

          <div style={styles.actions}>
            <button type="button" style={styles.primaryButton} onClick={copyCss}>
              Copiar ROOT
            </button>
            <button type="button" style={styles.secondaryButton} onClick={copyTextJson}>
              Copiar textos
            </button>
            <button type="button" style={styles.dangerButton} onClick={resetEditor}>
              Reset v10
            </button>
          </div>

          {message ? <div style={styles.message}>{message}</div> : null}

          <div
            ref={scrollRef}
            style={styles.scrollArea}
            onScroll={(event) => {
              scrollMemoryRef.current = event.currentTarget.scrollTop;

              if (scrollRafRef.current) return;

              scrollRafRef.current = requestAnimationFrame(() => {
                scrollRafRef.current = null;
                setScrollTop(scrollMemoryRef.current);
              });
            }}
          >
            <details open style={styles.section}>
              <summary style={styles.summary}>Textos</summary>

              {TEXT_FIELDS.map(([name, label]) => (
                <label key={name} style={styles.control}>
                  <span style={styles.label}>
                    {label}
                    <code style={styles.code}>{name}</code>
                  </span>
                  <textarea
                    style={styles.textarea}
                    rows={name.includes("description") ? 2 : 1}
                    value={textValues[name] ?? ""}
                    placeholder="VacÃ­o = usa la traducciÃ³n normal"
                    onChange={(event) => updateTextValue(name, event.target.value)}
                  />
                </label>
              ))}

              <button type="button" style={styles.dangerButton} onClick={resetTexts}>
                Reset textos
              </button>
            </details>

            {SECTIONS.map(([sectionTitle, controls]) => (
              <details key={sectionTitle} open style={styles.section}>
                <summary style={styles.summary}>{sectionTitle}</summary>

                {controls.map(([name, label, min, max, step, unit]) => {
                  const value = values[name] ?? 0;

                  return (
                    <label key={name} style={styles.control}>
                      <span style={styles.label}>
                        {label}
                        <code style={styles.code}>{name}</code>
                      </span>

                      <div style={styles.row}>
                        <input
                          style={styles.range}
                          type="range"
                          min={min}
                          max={max}
                          step={step}
                          value={value}
                          onChange={(event) => updateValue(name, event.target.value)}
                        />
                        <input
                          style={styles.number}
                          type="number"
                          min={min}
                          max={max}
                          step={step}
                          value={value}
                          onChange={(event) => updateValue(name, event.target.value)}
                        />
                        <span style={styles.unit}>{unit || " "}</span>
                      </div>
                    </label>
                  );
                })}
              </details>
            ))}
          </div>
        </>
      ) : null}
    </aside>
  );
}

const styles = {
  panel: {
    position: "fixed",
    zIndex: 99999,
    transform: "translateZ(0)",
    contain: "layout paint style",
    overflow: "hidden",
    WebkitFontSmoothing: "antialiased",
    textRendering: "geometricPrecision",
    maxWidth: "calc(100vw - 24px)",
    maxHeight: "calc(100vh - 24px)",
    padding: 12,
    borderRadius: 14,
    border: "1px solid rgba(255, 218, 150, 0.35)",
    background: "rgba(20, 10, 6, 0.92)",
    color: "#f8e8c5",
    boxShadow: "0 18px 40px rgba(0,0,0,.45)",
    backdropFilter: "blur(8px)",
    fontFamily: "Inter, system-ui, sans-serif",
    fontSize: 12,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 8,
    fontFamily: '"Belwe HS", Georgia, serif',
    fontSize: 16,
    textTransform: "uppercase",
    cursor: "move",
    userSelect: "none",
  },
  headerActions: {
    display: "flex",
    gap: 6,
    alignItems: "center",
  },
  showButton: {
    position: "fixed",
    zIndex: 99999,
    border: "1px solid rgba(255, 218, 150, 0.42)",
    borderRadius: 999,
    padding: "9px 12px",
    background: "rgba(20, 10, 6, 0.88)",
    color: "#ffe8bd",
    boxShadow: "0 10px 24px rgba(0,0,0,.36)",
    backdropFilter: "blur(8px)",
    cursor: "pointer",
    fontFamily: '"Belwe HS", Georgia, serif',
    fontSize: 12,
    fontWeight: 900,
    textTransform: "uppercase",
  },
  help: {
    margin: "0 0 8px",
    color: "#ddc7a2",
    lineHeight: 1.35,
  },
  actions: {
    display: "flex",
    gap: 8,
    marginBottom: 8,
  },
  primaryButton: {
    flex: 1,
    border: 0,
    borderRadius: 9,
    padding: "8px 10px",
    background: "linear-gradient(180deg, #a24dff, #55149a)",
    color: "#fff2c8",
    cursor: "pointer",
    fontWeight: 800,
  },
  secondaryButton: {
    border: 0,
    borderRadius: 9,
    padding: "8px 10px",
    background: "#3b2a1c",
    color: "#ffe8bd",
    cursor: "pointer",
    fontWeight: 800,
  },
  dangerButton: {
    border: 0,
    borderRadius: 9,
    padding: "8px 10px",
    background: "#5a2018",
    color: "#ffe3d8",
    cursor: "pointer",
    fontWeight: 800,
  },
  smallButton: {
    border: 0,
    borderRadius: 8,
    padding: "5px 8px",
    background: "#3b2a1c",
    color: "#ffe8bd",
    cursor: "pointer",
    fontSize: 12,
  },
  message: {
    marginBottom: 8,
    padding: 8,
    borderRadius: 8,
    background: "rgba(88, 156, 69, .25)",
    color: "#dfffd0",
    fontWeight: 800,
  },
  scrollArea: {
    overflowY: "auto",
    overflowX: "hidden",
    maxHeight: "calc(100vh - 170px)",
    paddingRight: 4,
    overscrollBehavior: "contain",
    scrollbarGutter: "stable",
  },
  section: {
    borderTop: "1px solid rgba(255, 218, 150, 0.18)",
    paddingTop: 8,
    marginTop: 8,
  },
  summary: {
    cursor: "pointer",
    fontWeight: 900,
    color: "#ffd98a",
    marginBottom: 6,
  },
  control: {
    display: "block",
    marginBottom: 8,
    lineHeight: 1.2,
  },
  label: {
    display: "flex",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 3,
    color: "#f7dfb5",
  },
  code: {
    color: "#bda27b",
    fontSize: 10,
  },
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 72px 22px",
    gap: 6,
    alignItems: "center",
  },
  range: {
    width: "100%",
    display: "block",
    transform: "none",
  },
  number: {
    width: "100%",
    height: 34,
    border: "1px solid rgba(255,255,255,.15)",
    borderRadius: 6,
    padding: "4px 5px",
    background: "rgba(0,0,0,.32)",
    color: "#fff4dc",
  },
  unit: {
    color: "#cdb38a",
  },
  textarea: {
    width: "100%",
    resize: "vertical",
    display: "block",
    minHeight: 34,
    border: "1px solid rgba(255,255,255,.15)",
    borderRadius: 8,
    padding: "6px 7px",
    background: "rgba(0,0,0,.32)",
    color: "#fff4dc",
    fontFamily: "Inter, system-ui, sans-serif",
    fontSize: 12,
    lineHeight: 1.25,
  },
};

