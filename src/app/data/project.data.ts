import { Project } from '../models/project.model';

/**
 * Featured work. One-line summaries come from the public repos
 * (github.com/macros05), the live sites, and what Marcos described.
 * Private source is labeled, never linked. The trading dashboard and
 * polymarket-copytrade sit beside the public trading bot.
 */
export const PROJECTS: Project[] = [
  {
    id: 'seo-costa-del-sol',
    title: 'SEO Costa del Sol',
    category: { en: 'Local SEO', es: 'SEO local' },
    summary: {
      en: 'Local SEO landing and blog for Costa del Sol businesses, with keyword-driven posts and an ops backend.',
      es: 'Landing y blog de SEO local para negocios de la Costa del Sol, con posts por keyword y un backend de operaciones.',
    },
    techStack: ['React', 'Vite', 'Prerender', 'JSON-LD', 'Cloudflare Pages'],
    privateRepo: true,
    demoUrl: 'https://seocostadelsol.com',
    imageUrl: '/assets/posters/seo-costa.svg',
    shortDescription:
      'Local SEO landing and blog for Costa del Sol businesses, with keyword-driven posts and an ops backend.',
    fullDescription:
      'A local SEO landing and blog for businesses on the Costa del Sol. Posts are generated from keywords, and an ops backend sits behind the site. React and Vite, with a custom static prerender per route (title, canonical, H1, JSON-LD), city and service pages, a blog, a sitemap, and a BreadcrumbList check that fails the build if the trail is broken. Hosted on Cloudflare Pages.',
    aiIntegration: '',
    challenges:
      'The BreadcrumbList is validated at build time, so a broken trail fails the build instead of shipping.',
  },
  {
    id: 'ai-reels-factory',
    title: 'AI Reels Factory',
    category: { en: 'AI video', es: 'Vídeo con IA' },
    summary: {
      en: 'End-to-end pipeline for short AI reels — a brief goes in, script, voice, and the cut come out.',
      es: 'Pipeline de punta a punta para reels cortos con IA: entra un brief y salen guion, voz y el corte.',
    },
    techStack: ['Python', 'FastAPI', 'React', 'Claude', 'ElevenLabs', 'Remotion'],
    githubUrl: 'https://github.com/macros05/ai-reels-factory',
    imageUrl: '/assets/posters/ai-reels.svg',
    shortDescription:
      'End-to-end pipeline for short AI reels — a brief goes in, script, voice, and the cut come out.',
    fullDescription:
      'End-to-end pipeline for AI-generated short reels. Claude writes the script and the shot plan, Higgsfield renders, ElevenLabs voices it, and Remotion sits in the branded path. Same tools from the web UI or an MCP server.',
    aiIntegration:
      'Claude for script, style, and shot plan. ElevenLabs for voice. Whisper for subtitles.',
    challenges:
      'Keeping a multi-step video pipeline editable, so one shot can be redone without rerunning the rest.',
  },
  {
    id: 'leads-scout',
    title: 'Leads Scout',
    category: { en: 'Lead tooling', es: 'Leads' },
    summary: {
      en: 'Finds local businesses, scores their sites with AI, and runs the sales pipeline.',
      es: 'Encuentra negocios locales, puntúa sus webs con IA y mueve el pipeline de ventas.',
    },
    techStack: ['Java', 'Spring Boot', 'Angular', 'Gemini'],
    githubUrl: 'https://github.com/macros05/Leads-scout',
    imageUrl: '/assets/posters/leads-scout.svg',
    shortDescription:
      'Finds local businesses, scores their sites with AI, and runs the sales pipeline.',
    fullDescription:
      'Fullstack platform for local lead prospecting. It finds businesses by sector, reads their sites with AI, detects the tech stack, and tracks them through a sales pipeline.',
    aiIntegration: 'Gemini reads each business site and helps score it.',
    challenges: '',
  },
  {
    id: 'trading-systems',
    title: 'Trading systems',
    category: { en: 'Real-time trading', es: 'Trading en tiempo real' },
    summary: {
      en: 'BTC momentum bot checked on 129,602 candles, plus a dashboard and a Polymarket copy-trader.',
      es: 'Bot de momentum para BTC, probado con 129.602 velas, más un dashboard y un copy-trader de Polymarket.',
    },
    techStack: ['Python', 'asyncio', 'FastAPI', 'Next.js'],
    githubUrl: 'https://github.com/macros05/trading-bot',
    imageUrl: '/assets/posters/trading.svg',
    shortDescription:
      'BTC momentum bot checked on 129,602 candles, plus a dashboard and a Polymarket copy-trader.',
    fullDescription:
      'Real-time trading systems. The public bot trades BTC/USDT with a momentum strategy (RSI + SMA), a macro filter, and WebSocket prices with a REST fallback. It was checked on a 90-day backtest of 129,602 one-minute candles. A dashboard and a Polymarket copy-trader sit beside it.',
    aiIntegration: 'A macro filter reads market news with Gemini before the strategy gets aggressive.',
    challenges:
      'Keeping the candle stream alive across WebSocket drops without missing a minute.',
  },
  {
    id: 'tecnoambiente',
    title: 'TecnoAmbiente',
    category: { en: 'Client work', es: 'Para un cliente' },
    summary: {
      en: 'Bibliography app delivered to Tecnoambiente — catalogue, search, and filters for their references.',
      es: 'App de bibliografía entregada a Tecnoambiente: catálogo, búsqueda y filtros para sus referencias.',
    },
    techStack: ['Angular', 'FastAPI', 'MySQL'],
    githubUrl: 'https://github.com/macros05/TecnoAmbiente-bibliography',
    imageUrl: '/assets/posters/tecnoambiente.svg',
    shortDescription:
      'Bibliography app delivered to Tecnoambiente — catalogue, search, and filters for their references.',
    fullDescription:
      'Web app delivered to Tecnoambiente for their biological bibliography. People can browse the catalogue, search, filter, and manage references. Angular on the front, FastAPI and MySQL behind it.',
    aiIntegration: '',
    challenges: '',
  },
];
