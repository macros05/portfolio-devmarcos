import { Proposal } from '../proposal.model';

/**
 * Sample proposal. Copy this file to `data/<slug>.ts`, set `slug`, and add it
 * to `registry.ts`. See `../README.md`.
 *
 * Bilingual copy uses `{ es, en }`. For a single language, set `lang` and use
 * plain strings. Omit a block to hide that section.
 * Fictional on purpose: no real client, no real price.
 */
export const ejemplo: Proposal = {
  slug: 'ejemplo',
  example: true,
  client: { es: 'Cliente Ejemplo', en: 'Example Client' },
  date: { es: 'marzo 2026', en: 'March 2026' },
  title: {
    es: 'Una web clara para presentar el trabajo y recibir encargos',
    en: 'A clear site to present the work and take it on',
  },
  subtitle: {
    es: 'Propuesta de ejemplo. Nombres, plazos y cifras son ficticios.',
    en: 'Sample proposal. Names, timing, and figures are fictional.',
  },
  preparedBy: 'Marcos Morales',
  // Shared street loop. Replace the files in public/assets/proposals/ — see README.
  // Other proposals can set `{ kind: 'none' }`, `{ kind: 'gradient' }`, or their own paths.
  background: {
    kind: 'video',
    mp4: '/assets/proposals/street.mp4',
    webm: '/assets/proposals/street.webm',
    poster: '/assets/proposals/street-poster.jpg',
  },
  context: {
    paragraphs: [
      {
        es: 'Cliente Ejemplo es un estudio pequeño. Hoy explica lo que hace en un PDF y cierra los encargos por correo. Quien llega a la web no entiende el servicio ni cómo empezar.',
        en: 'Example Client is a small studio. It explains the work in a PDF and closes jobs by email. Someone landing on the site cannot tell what the service is or how to start.',
      },
      {
        es: 'El encargo no es un rediseño amplio. Es una página que cuente el trabajo, muestre tres casos y deje un mensaje en un solo sitio.',
        en: 'This is not a broad redesign. It is a page that states the work, shows three cases, and collects a message in one place.',
      },
    ],
  },
  solution: {
    paragraphs: [
      {
        es: 'Una web estática, rápida y en los dos idiomas del estudio. El contenido vive en archivos, sin un gestor que mantener.',
        en: "A fast static site, in the studio's two languages. Content lives in files, with no CMS to keep up.",
      },
    ],
    points: [
      {
        title: { es: 'Relato', en: 'Story' },
        detail: {
          es: 'Portada y página de servicio: qué hacen, para quién y qué no hacen.',
          en: 'A cover and a service page: what they do, who it is for, and what they do not do.',
        },
      },
      {
        title: { es: 'Casos', en: 'Cases' },
        detail: {
          es: 'Tres trabajos contados en corto, sin métricas inventadas.',
          en: 'Three short pieces of work, with no invented metrics.',
        },
      },
      {
        title: { es: 'Contacto', en: 'Contact' },
        detail: {
          es: 'Un formulario que llega a un buzón, con aviso de que el mensaje se ha recibido.',
          en: 'A form that lands in one inbox, with a note that the message arrived.',
        },
      },
    ],
  },
  scope: {
    paragraphs: [
      {
        es: 'El alcance es el sitio público. Lo que quede fuera se anota para no mezclarlo con esta fase.',
        en: 'The scope is the public site. Anything beyond that is written down so it does not slip into this phase.',
      },
    ],
    deliverables: [
      {
        title: { es: 'Mapa y textos base', en: 'Map and base copy' },
        detail: {
          es: 'Estructura, titulares y el formulario.',
          en: 'Structure, headlines, and the form.',
        },
      },
      {
        title: { es: 'Pantallas clave', en: 'Key screens' },
        detail: {
          es: 'Portada, servicio, caso y contacto, en móvil y escritorio.',
          en: 'Cover, service, case, and contact, on mobile and desktop.',
        },
      },
      {
        title: { es: 'Sitio publicado', en: 'Site in production' },
        detail: {
          es: 'Implementación, dominio y una ronda de revisión.',
          en: 'Implementation, domain, and one review pass.',
        },
      },
      {
        title: { es: 'Entrega', en: 'Handoff' },
        detail: {
          es: 'Repositorio, cómo cambiar un texto y a quién escribir si algo falla.',
          en: 'The repository, how to change a line of copy, and who to write if something breaks.',
        },
      },
    ],
    outOfScope: [
      { es: 'Anuncios y redes.', en: 'Ads and social networks.' },
      { es: 'Aplicación nativa o área de clientes.', en: 'A native app or a client area.' },
      { es: 'Redacción continua después de la entrega.', en: 'Ongoing writing after handoff.' },
    ],
  },
  phases: {
    items: [
      {
        name: { es: 'Descubrimiento', en: 'Discovery' },
        duration: { es: '1 semana', en: '1 week' },
        detail: {
          es: 'Una conversación, el mapa y los textos base.',
          en: 'One conversation, the map, and the base copy.',
        },
      },
      {
        name: { es: 'Diseño', en: 'Design' },
        duration: { es: '2 semanas', en: '2 weeks' },
        detail: {
          es: 'Pantallas clave y una ronda de cambios.',
          en: 'Key screens and one round of changes.',
        },
      },
      {
        name: { es: 'Construcción', en: 'Build' },
        duration: { es: '3 semanas', en: '3 weeks' },
        detail: {
          es: 'El sitio, el formulario y el contenido de muestra.',
          en: 'The site, the form, and the sample content.',
        },
      },
      {
        name: { es: 'Publicación', en: 'Launch' },
        duration: { es: '1 semana', en: '1 week' },
        detail: {
          es: 'Dominio, revisión y entrega.',
          en: 'Domain, review, and handoff.',
        },
      },
    ],
  },
  investment: {
    note: {
      es: 'Importes de muestra. No son un precio ni una oferta.',
      en: 'Sample amounts. Not a price and not an offer.',
    },
    rows: [
      {
        concept: { es: 'Descubrimiento y textos', en: 'Discovery and copy' },
        amount: '€ ----',
      },
      { concept: { es: 'Diseño', en: 'Design' }, amount: '€ ----' },
      {
        concept: { es: 'Construcción y publicación', en: 'Build and launch' },
        amount: '€ ----',
      },
    ],
    total: { label: { es: 'Total de ejemplo', en: 'Sample total' }, amount: '€ ----' },
  },
  why: {
    paragraphs: [
      {
        es: 'El diseño y el código los hago yo, de la primera conversación a la publicación. El documento se parece a esta página: claro, y no una baraja de diapositivas.',
        en: 'I do the design and the code, from the first conversation to launch. The document looks like this page: clear, and not a slide deck.',
      },
    ],
    cases: [
      {
        title: { es: 'Herramienta interna', en: 'Internal tool' },
        summary: {
          es: 'Un equipo dejó de perseguir el trabajo en hojas sueltas. Caso genérico, sin cliente real.',
          en: 'A team stopped chasing work across loose spreadsheets. A generic case, not a real client.',
        },
      },
      {
        title: { es: 'Página de captación', en: 'Landing page' },
        summary: {
          es: 'Un servicio pasó de un PDF a una página que explica la oferta y recoge el contacto. Caso genérico, sin cliente real.',
          en: 'A service moved from a PDF to a page that explains the offer and collects contact. A generic case, not a real client.',
        },
      },
    ],
  },
  nextSteps: {
    steps: [
      {
        es: 'Responder a este documento si el encargo encaja.',
        en: 'Reply to this document if the work fits.',
      },
      {
        es: 'Una llamada de media hora para cerrar alcance y calendario.',
        en: 'A half-hour call to settle scope and calendar.',
      },
      {
        es: 'Arranque con el descubrimiento. Sin compromiso antes de esa llamada.',
        en: 'Start with discovery. No commitment before that call.',
      },
    ],
  },
  contact: {
    name: 'Marcos Morales',
    role: { es: 'Producto, diseño y código', en: 'Product, design, and code' },
    email: 'contacto@marcosmorales.dev',
    web: 'https://marcosmorales.dev',
    note: {
      es: 'Escribe y dime qué hay que construir. Esta página es la plantilla: el siguiente documento llevará el nombre del cliente.',
      en: "Write and tell me what needs building. This page is the template: the next document will carry the client's name.",
    },
  },
};
