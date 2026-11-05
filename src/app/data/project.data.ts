import { Project } from '../models/project.model';

/**
 * One file for the work section.
 *
 * A project clip is optional. Leave `video` off and the poster shows.
 * When the file exists, add the two paths — 16:9, muted, loops in view
 * and on hover, loaded only then:
 *
 *   video: {
 *     src: '/assets/projects/kairova.mp4',
 *     poster: '/assets/projects/kairova.webp',
 *   },
 *
 * GitHub is linked only when the repo is public.
 */
export const PROJECTS: Project[] = [
  {
    id: 'kairova',
    title: 'Kairova',
    featured: true,
    category: { en: 'Featured', es: 'Destacada' },
    meta: { en: 'Launched November 2026', es: 'Lanzada en noviembre de 2026' },
    summary: {
      en: 'AI agency for real-estate agencies with international buyers — a 24/7 multilingual lead assistant, plus lead-handling audits.',
      es: 'Agencia de IA para inmobiliarias con compradores internacionales: un asistente de leads multilingüe 24/7 y auditorías de cómo se gestionan.',
    },
    highlights: [
      {
        en: 'Answers buyers in their language, day and night',
        es: 'Contesta a los compradores en su idioma, de día y de noche',
      },
      {
        en: 'Audits how the agency handles those leads',
        es: 'Audita cómo la agencia trata esos leads',
      },
      {
        en: 'Its own brand kit',
        es: 'Brand kit propio',
      },
    ],
    techStack: ['Next.js 16', 'Docker', 'nginx', 'Cloudflare', 'Lenis'],
    demoUrl: 'https://kairovahq.com',
    imageUrl: '/assets/posters/kairova.svg',
    shortDescription:
      'AI agency for real-estate agencies with international buyers — a 24/7 multilingual lead assistant, plus lead-handling audits.',
    fullDescription:
      'Kairova is an AI agency for real-estate agencies that sell to international buyers. It is a multilingual lead assistant that works day and night, plus audits of how those leads are handled. The landing is Next.js 16, served with Docker and nginx on a VPS, DNS on Cloudflare, Lenis for scroll, and a brand kit of its own. Launched November 2026.',
    aiIntegration: '',
    challenges: '',
  },
  {
    id: 'seo-costa-del-sol',
    title: 'SEO Costa',
    category: { en: 'Local SEO', es: 'SEO local' },
    summary: {
      en: 'Local SEO for Costa del Sol businesses — keyword posts, and an ops backend.',
      es: 'SEO local para negocios de la Costa del Sol: posts por keyword y un backend de operaciones.',
    },
    highlights: [
      {
        en: 'A static page per route: title, canonical, H1, JSON-LD',
        es: 'Una página estática por ruta: title, canonical, H1, JSON-LD',
      },
      {
        en: 'City pages, service pages, and a blog',
        es: 'Páginas de ciudad, de servicio, y un blog',
      },
      {
        en: 'Breadcrumbs that fail the build if they break',
        es: 'Breadcrumbs que rompen el build si fallan',
      },
    ],
    techStack: ['React', 'Vite', 'Cloudflare Pages'],
    privateRepo: true,
    demoUrl: 'https://seocostadelsol.com',
    imageUrl: '/assets/posters/seo-costa.svg',
    shortDescription:
      'Local SEO for Costa del Sol businesses — keyword posts, and an ops backend.',
    fullDescription:
      'A local SEO landing and blog for businesses on the Costa del Sol. Posts come from keywords, with an ops backend behind the site. React and Vite, a custom static prerender per route (title, canonical, H1, JSON-LD), city and service pages, a blog, a sitemap, and a BreadcrumbList check that fails the build if the trail is broken. Hosted on Cloudflare Pages.',
    aiIntegration: '',
    challenges:
      'The BreadcrumbList is validated at build time, so a broken trail fails the build instead of shipping.',
  },
  {
    id: 'ai-reels-factory',
    title: 'Reels Factory',
    category: { en: 'AI video', es: 'Vídeo con IA' },
    summary: {
      en: 'A brief in. A short AI reel out.',
      es: 'Entra un brief. Sale un reel corto con IA.',
    },
    highlights: [
      {
        en: 'Script, shots, and voice in one pipeline',
        es: 'Guion, planos y voz en un solo pipeline',
      },
      {
        en: 'Run it from the site or from chat',
        es: 'Se maneja desde la web o desde el chat',
      },
      {
        en: 'Redo one shot without rerunning the film',
        es: 'Rehacer un plano sin repetir el reel',
      },
    ],
    techStack: ['Python', 'FastAPI', 'React', 'Claude', 'ElevenLabs'],
    githubUrl: 'https://github.com/macros05/ai-reels-factory',
    imageUrl: '/assets/posters/ai-reels.svg',
    shortDescription: 'A brief in. A short AI reel out.',
    fullDescription:
      'End-to-end pipeline for short AI reels. Claude writes the script and the shot plan, the video model renders, ElevenLabs voices it. Same controls from the web UI or an MCP server, and one shot can be redone without rerunning the rest.',
    aiIntegration: 'Claude for script, style, and shot plan. ElevenLabs for voice.',
    challenges: 'Redo one shot without rerunning the rest of the film.',
  },
  {
    id: 'leads-scout',
    title: 'Leads Scout',
    category: { en: 'Leads', es: 'Leads' },
    summary: {
      en: 'Find local businesses, score the site, move the deal.',
      es: 'Encuentra negocios locales, puntúa la web y mueve el trato.',
    },
    highlights: [
      {
        en: 'Search businesses by sector',
        es: 'Búsqueda de negocios por sector',
      },
      {
        en: 'An AI read of the site and its stack',
        es: 'La IA lee la web y su stack',
      },
      {
        en: 'The sales pipeline, in the same app',
        es: 'El pipeline de ventas, en la misma app',
      },
    ],
    techStack: ['Java', 'Spring Boot', 'Angular', 'Gemini'],
    githubUrl: 'https://github.com/macros05/Leads-scout',
    imageUrl: '/assets/posters/leads-scout.svg',
    shortDescription: 'Find local businesses, score the site, move the deal.',
    fullDescription:
      'Finds local businesses by sector, reads their sites with AI, detects the tech stack, and tracks them through a sales pipeline.',
    aiIntegration: 'Gemini reads each business site and helps score it.',
    challenges: '',
  },
  {
    id: 'trading-systems',
    title: 'Trading desk',
    category: { en: 'Real-time', es: 'Tiempo real' },
    summary: {
      en: 'A BTC bot, a dashboard, and a Polymarket copy-trader.',
      es: 'Un bot de BTC, un dashboard y un copy-trader de Polymarket.',
    },
    highlights: [
      {
        en: 'Momentum strategy with a news filter',
        es: 'Estrategia de momentum con filtro de noticias',
      },
      {
        en: 'WebSocket prices, REST if the socket drops',
        es: 'Precios por WebSocket, REST si se cae',
      },
      {
        en: 'Checked on 129,602 one-minute candles',
        es: 'Probado con 129.602 velas de un minuto',
      },
    ],
    techStack: ['Python', 'asyncio', 'FastAPI', 'Next.js'],
    githubUrl: 'https://github.com/macros05/trading-bot',
    imageUrl: '/assets/posters/trading.svg',
    shortDescription: 'A BTC bot, a dashboard, and a Polymarket copy-trader.',
    fullDescription:
      'Real-time trading systems. The public bot trades BTC/USDT with momentum (RSI + SMA), a news filter, and WebSocket prices that fall back to REST. The strategy was checked on 129,602 one-minute candles. A dashboard and a Polymarket copy-trader sit beside it.',
    aiIntegration: 'A news filter reads the market with Gemini before the strategy gets aggressive.',
    challenges: 'Keep the candle stream alive when the WebSocket drops.',
  },
  {
    id: 'tecnoambiente',
    title: 'TecnoAmbiente',
    category: { en: 'Shipped', es: 'Entregado' },
    summary: {
      en: 'A bibliography app, delivered to Tecnoambiente.',
      es: 'Una app de bibliografía, entregada a Tecnoambiente.',
    },
    highlights: [
      {
        en: 'Catalogue of their biological references',
        es: 'Catálogo de sus referencias biológicas',
      },
      {
        en: 'Search and filters',
        es: 'Búsqueda y filtros',
      },
      {
        en: 'Shipped to the client',
        es: 'Entregada al cliente',
      },
    ],
    techStack: ['Angular', 'FastAPI', 'MySQL'],
    githubUrl: 'https://github.com/macros05/TecnoAmbiente-bibliography',
    imageUrl: '/assets/posters/tecnoambiente.svg',
    shortDescription: 'A bibliography app, delivered to Tecnoambiente.',
    fullDescription:
      'Bibliography app delivered to Tecnoambiente. Catalogue, search, and filters for their biological references. Angular on the front, FastAPI and MySQL behind it.',
    aiIntegration: '',
    challenges: '',
  },
];
