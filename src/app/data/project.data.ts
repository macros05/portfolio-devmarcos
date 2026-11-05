import { Project } from '../models/project.model';

/**
 * Work, in one file.
 *
 * `video` is the 16:9 silent cut. `lead` puts the plate full width.
 * `flow` is the architecture diagram, left to right.
 */
export const PROJECTS: Project[] = [
  {
    id: 'kairova',
    title: 'Kairova',
    lead: true,
    category: { en: 'Agency', es: 'Agencia' },
    meta: { en: 'Launched November 2026', es: 'Lanzada en noviembre de 2026' },
    summary: {
      en: 'AI agency for real-estate agencies with international buyers — a 24/7 multilingual lead assistant, plus lead-handling audits.',
      es: 'Agencia de IA para inmobiliarias con compradores internacionales: un asistente de leads multilingüe 24/7 y auditorías de cómo se gestionan.',
    },
    highlights: [
      { en: 'Answers in the buyer’s language, day and night', es: 'Contesta en el idioma del comprador, de día y de noche' },
      { en: 'Audits how the agency handles those leads', es: 'Audita cómo la agencia trata esos leads' },
      { en: 'A brand kit of its own', es: 'Brand kit propio' },
    ],
    flow: ['Browser', 'Cloudflare DNS', 'nginx', 'Next.js 16'],
    system: {
      en: 'The public site is a Next.js 16 landing. Nginx on a VPS terminates traffic, the app runs in Docker, and Cloudflare holds the DNS so the machine is not the public name. Lenis does the scroll on that landing.',
      es: 'La web pública es una landing en Next.js 16. Nginx en un VPS corta el tráfico, la app va en Docker, y Cloudflare tiene el DNS para que la máquina no sea el nombre público. Lenis hace el scroll de esa landing.',
    },
    techStack: ['Next.js 16', 'Docker', 'nginx', 'Cloudflare', 'Lenis'],
    demoUrl: 'https://kairovahq.com',
    imageUrl: '/assets/projects/kairova.webp',
    video: { src: '/assets/projects/kairova.mp4', poster: '/assets/projects/kairova.webp' },
    shortDescription:
      'AI agency for real-estate agencies with international buyers — a 24/7 multilingual lead assistant, plus lead-handling audits.',
    fullDescription:
      'Kairova is an AI agency for real-estate agencies with international buyers. The landing is Next.js 16, behind nginx and Docker on a VPS, with DNS at Cloudflare and Lenis for scroll. Launched November 2026.',
    aiIntegration: '',
    challenges: '',
  },
  {
    id: 'trading-systems',
    title: 'Trading desk',
    lead: true,
    category: { en: 'Real-time', es: 'Tiempo real' },
    summary: {
      en: 'A BTC bot, a dashboard, and a Polymarket copy-trader.',
      es: 'Un bot de BTC, un dashboard y un copy-trader de Polymarket.',
    },
    highlights: [
      { en: 'Momentum from RSI and a moving average', es: 'Momentum con RSI y una media móvil' },
      { en: 'WebSocket prices, REST if the socket drops', es: 'Precios por WebSocket, REST si se cae' },
      { en: 'A news filter sits in front of the strategy', es: 'Un filtro de noticias va delante de la estrategia' },
    ],
    flow: ['Exchange WS', 'Candles', 'RSI + SMA', 'News filter', 'REST fallback'],
    system: {
      en: 'The bot is Python on asyncio. Candles arrive on a WebSocket and fall back to REST so a dropped socket does not skip a minute. RSI and SMA decide the momentum trade. A news filter, read with Gemini, can hold the strategy back. Fills go out through FastAPI to a Next.js dashboard.',
      es: 'El bot es Python sobre asyncio. Las velas entran por WebSocket y caen a REST para no saltarse un minuto si el socket se cae. RSI y SMA deciden el momentum. Un filtro de noticias, leído con Gemini, puede frenar la estrategia. Las operaciones salen por FastAPI a un dashboard en Next.js.',
    },
    techStack: ['Python', 'asyncio', 'FastAPI', 'Next.js'],
    githubUrl: 'https://github.com/macros05/trading-bot',
    imageUrl: '/assets/projects/trading.webp',
    video: { src: '/assets/projects/trading.mp4', poster: '/assets/projects/trading.webp' },
    shortDescription: 'A BTC bot, a dashboard, and a Polymarket copy-trader.',
    fullDescription:
      'Real-time trading. WebSocket candles with a REST fallback, an RSI and SMA momentum strategy, a news filter, and a Next.js dashboard beside a Polymarket copy-trader. The strategy was checked on 129,602 one-minute candles.',
    aiIntegration: 'Gemini reads market news before the strategy gets aggressive.',
    challenges: 'Keep every candle when the WebSocket drops.',
  },
  {
    id: 'seo-costa-del-sol',
    title: 'SEO Costa',
    lead: true,
    category: { en: 'Local SEO', es: 'SEO local' },
    summary: {
      en: 'Local SEO for Costa del Sol businesses — keyword posts, and an ops backend.',
      es: 'SEO local para negocios de la Costa del Sol: posts por keyword y un backend de operaciones.',
    },
    highlights: [
      { en: 'One static HTML file per route', es: 'Un HTML estático por ruta' },
      { en: 'Title, canonical, H1, and JSON-LD written at build', es: 'Title, canonical, H1 y JSON-LD escritos en el build' },
      { en: 'A broken breadcrumb fails the build', es: 'Un breadcrumb roto rompe el build' },
    ],
    flow: ['Routes', 'Prerender', 'JSON-LD', 'Breadcrumb check', 'Pages'],
    system: {
      en: 'The site is React on Vite. A custom step after the build writes a static HTML per route with its title, canonical, H1, and JSON-LD, including city pages, service pages, and the blog. BreadcrumbList is validated in that step: if the trail is broken, the build fails. Cloudflare Pages serves the files. The repo stays private.',
      es: 'La web es React sobre Vite. Un paso propio después del build escribe un HTML estático por ruta con title, canonical, H1 y JSON-LD, incluidas las páginas de ciudad, de servicio y el blog. El BreadcrumbList se valida ahí: si el rastro está roto, el build falla. Cloudflare Pages sirve los archivos. El repo es privado.',
    },
    techStack: ['React', 'Vite', 'Cloudflare Pages'],
    privateRepo: true,
    demoUrl: 'https://seocostadelsol.com',
    imageUrl: '/assets/projects/seo-costa.webp',
    video: { src: '/assets/projects/seo-costa.mp4', poster: '/assets/projects/seo-costa.webp' },
    shortDescription:
      'Local SEO for Costa del Sol businesses — keyword posts, and an ops backend.',
    fullDescription:
      'Local SEO landing and blog. A post-build prerender writes title, canonical, H1, and JSON-LD per route, and a BreadcrumbList check fails the build if the trail breaks. Cloudflare Pages hosts it.',
    aiIntegration: '',
    challenges: 'The breadcrumb check fails the build instead of shipping a broken trail.',
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
      { en: 'Claude writes the script and the shot plan', es: 'Claude escribe el guion y el plan de planos' },
      { en: 'Same controls on the web and over MCP', es: 'Los mismos controles en la web y por MCP' },
      { en: 'One shot can be redone alone', es: 'Un plano se puede rehacer solo' },
    ],
    flow: ['Brief', 'Claude', 'Higgsfield', 'ElevenLabs', 'Remotion'],
    system: {
      en: 'A brief goes to Claude for the script, the look, and a shot plan. Higgsfield renders the clips, ElevenLabs speaks, and Remotion with ffmpeg assembles the cut. The web UI and an MCP server call the same steps, so one shot can be regenerated without rerunning the film.',
      es: 'Un brief pasa por Claude para el guion, el look y el plan de planos. Higgsfield renderiza los clips, ElevenLabs pone la voz, y Remotion con ffmpeg monta el corte. La web y un servidor MCP llaman a los mismos pasos, así que un plano se regenera sin repetir el reel.',
    },
    techStack: ['Python', 'FastAPI', 'React', 'Claude', 'Remotion'],
    githubUrl: 'https://github.com/macros05/ai-reels-factory',
    imageUrl: '/assets/projects/reels.webp',
    video: { src: '/assets/projects/reels.mp4', poster: '/assets/projects/reels.webp' },
    shortDescription: 'A brief in. A short AI reel out.',
    fullDescription:
      'Pipeline for short AI reels. Claude plans the shots, Higgsfield renders, ElevenLabs voices, Remotion assembles. One shot can be redone on its own.',
    aiIntegration: 'Claude for script and shot plan. ElevenLabs for voice.',
    challenges: 'Redo one shot without rerunning the rest.',
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
      { en: 'Search by sector', es: 'Búsqueda por sector' },
      { en: 'Gemini reads the site and the stack', es: 'Gemini lee la web y el stack' },
      { en: 'The pipeline lives in the same app', es: 'El pipeline vive en la misma app' },
    ],
    flow: ['Sector', 'Places', 'Gemini', 'Pipeline'],
    system: {
      en: 'Spring Boot on one side, Angular on the other. A sector search finds local businesses. Gemini reads each site and the stack behind it, then the lead sits in a pipeline you can move.',
      es: 'Spring Boot a un lado, Angular al otro. Una búsqueda por sector encuentra negocios locales. Gemini lee cada web y el stack que hay detrás, y el lead queda en un pipeline que se puede mover.',
    },
    techStack: ['Java', 'Spring Boot', 'Angular', 'Gemini'],
    githubUrl: 'https://github.com/macros05/Leads-scout',
    imageUrl: '/assets/projects/leads.webp',
    video: { src: '/assets/projects/leads.mp4', poster: '/assets/projects/leads.webp' },
    shortDescription: 'Find local businesses, score the site, move the deal.',
    fullDescription:
      'Local lead prospecting. Sector search, a Gemini read of the site and its stack, and a sales pipeline in the same app.',
    aiIntegration: 'Gemini reads each business site and helps score it.',
    challenges: '',
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
      { en: 'Catalogue of their references', es: 'Catálogo de sus referencias' },
      { en: 'Search and filters', es: 'Búsqueda y filtros' },
      { en: 'Shipped, not a demo', es: 'Entregada, no es una demo' },
    ],
    flow: ['Angular', 'FastAPI', 'MySQL'],
    system: {
      en: 'Angular in the browser, FastAPI in the middle, MySQL for the catalogue. Search and filters over their biological references. This one was delivered to the client.',
      es: 'Angular en el navegador, FastAPI en medio, MySQL para el catálogo. Búsqueda y filtros sobre sus referencias biológicas. Esta se entregó al cliente.',
    },
    techStack: ['Angular', 'FastAPI', 'MySQL'],
    githubUrl: 'https://github.com/macros05/TecnoAmbiente-bibliography',
    imageUrl: '/assets/projects/tecno.webp',
    video: { src: '/assets/projects/tecno.mp4', poster: '/assets/projects/tecno.webp' },
    shortDescription: 'A bibliography app, delivered to Tecnoambiente.',
    fullDescription:
      'Bibliography app delivered to Tecnoambiente. Angular, FastAPI, and MySQL. Catalogue, search, and filters.',
    aiIntegration: '',
    challenges: '',
  },
];
