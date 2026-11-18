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

## Impresión

El botón «Imprimir / PDF» abre el diálogo del navegador. En papel el documento pasa a fondo blanco, esconde la cabecera y el fondo WebGL, y evita cortar una sección por la mitad. Guardar como PDF usa esos mismos estilos.

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

## Print

«Print / PDF» opens the browser dialog. On paper the document turns white, hides the header and the WebGL background, and keeps a section from splitting across a page. Save as PDF uses the same styles.
