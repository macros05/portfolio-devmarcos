# Propuestas comerciales

Documentos privados en `/propuestas/:slug`. No aparecen en el menú. La página envía `noindex, nofollow`. Si más adelante hay un sitemap, estas URLs no se añaden.

La de muestra es [`/propuestas/ejemplo`](/propuestas/ejemplo): datos ficticios, sin cliente real y sin precios reales.

## Crear una propuesta

1. Copia `src/app/proposals/data/ejemplo.ts` a `src/app/proposals/data/<slug>.ts`.
2. Cambia `slug` para que coincida con el nombre del archivo. Quita `example` (o ponlo a `false`). Sustituye el texto.
3. Añade el export en `src/app/proposals/registry.ts`.
4. Abre `/propuestas/<slug>`.

No hace falta un componente nuevo. Un bloque que no esté en los datos no se pinta.

## Idioma

- Texto en los dos idiomas: `{ es: '...', en: '...' }`. El botón ES/EN del sitio cambia la propuesta.
- Un solo idioma: `lang: 'es'` o `lang: 'en'` y strings normales. La página se queda en ese idioma y el botón de idioma se oculta.

## Fondo

No usa el campo WebGL de la home. Cada propuesta puede elegir el suyo en el dato `background`:

- sin el campo: el loop compartido de abajo
- `{ kind: 'video', mp4, webm, poster, mobileMp4?, mobileWebm? }`
- `{ kind: 'gradient' }` — el degradado fijo, sin vídeo
- `{ kind: 'none' }` — negro plano

El clip definitivo (gente arreglada, con maletín, caminando hacia el trabajo por una calle tipo Larios) se genera aparte. Mientras esos archivos no estén, la página enseña el degradado. Para activar el vídeo, deja los archivos aquí:

```
public/assets/proposals/street.mp4
public/assets/proposals/street.webm
public/assets/proposals/street-poster.jpg
```

Formato: 1080p, loop de 6 a 10 segundos, sin audio. `street.mp4` en H.264 y `street.webm` en VP9, el par por debajo de unos 4 MB. El poster es un fotograma (jpg o webp). Opcional, una versión más ligera para móvil: `street-mobile.mp4` / `street-mobile.webm`, y se apunta con `mobileMp4` / `mobileWebm`.

El vídeo va `muted`, `autoplay`, `loop`, `playsinline`, oscurecido para que el texto se lea. Con `prefers-reduced-motion`, ahorro de datos o conexión lenta se queda en el poster (o en el degradado si el poster tampoco está). En la impresión no hay fondo.

## Impresión

El botón «Imprimir / PDF» abre el diálogo del navegador. En papel el documento pasa a fondo blanco, esconde la cabecera, el vídeo y el pie, y evita cortar una sección por la mitad. Guardar como PDF usa esos mismos estilos.

---

# Commercial proposals

Private documents at `/propuestas/:slug`. They are not in the menu. The page sends `noindex, nofollow`. If a sitemap is added later, leave these URLs out.

The sample is [`/propuestas/ejemplo`](/propuestas/ejemplo): fictional data, no real client, no real prices.

## Add a proposal

1. Copy `src/app/proposals/data/ejemplo.ts` to `src/app/proposals/data/<slug>.ts`.
2. Set `slug` to the file name. Remove `example` (or set it to `false`). Replace the copy.
3. Add the export in `src/app/proposals/registry.ts`.
4. Open `/propuestas/<slug>`.

No new component. A block missing from the data is not rendered.

## Language

- Both languages: `{ es: '...', en: '...' }`. The site ES/EN toggle switches the proposal.
- One language: `lang: 'es'` or `lang: 'en'` and plain strings. The page stays in that language and the language button is hidden.

## Background

Proposal pages do not use the home WebGL field. Each file can set `background`:

- omit it: the shared loop below
- `{ kind: 'video', mp4, webm, poster, mobileMp4?, mobileWebm? }`
- `{ kind: 'gradient' }` — the still gradient, no video
- `{ kind: 'none' }` — flat black

The finished clip (well-dressed people with briefcases, walking to work on a Larios-like street) is made separately. Until those files exist, the page shows the gradient. To turn the video on, drop them here:

```
public/assets/proposals/street.mp4
public/assets/proposals/street.webm
public/assets/proposals/street-poster.jpg
```

Spec: 1080p, a 6–10 second loop, no audio. `street.mp4` is H.264 and `street.webm` is VP9, together under about 4 MB. The poster is one frame (jpg or webp). Optional lighter mobile files: `street-mobile.mp4` / `street-mobile.webm`, referenced with `mobileMp4` / `mobileWebm`.

Playback is `muted`, `autoplay`, `loop`, `playsinline`, darkened so the type stays readable. `prefers-reduced-motion`, data saver, or a slow connection keeps the poster (or the gradient if the poster is missing too). Print has no background.

## Print

«Print / PDF» opens the browser dialog. On paper the document turns white, hides the header, the video, and the footer, and keeps a section from splitting across a page. Save as PDF uses the same styles.
