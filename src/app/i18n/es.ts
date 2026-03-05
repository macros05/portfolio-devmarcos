export const ES = {
  nav: {
    inicio: 'Inicio',
    about: 'Sobre Mí',
    projects: 'Proyectos',
    contact: 'Contacto',
  },
  hero: {
    greeting: 'Hola, mi nombre es',
    subtitle: 'Construyo soluciones con IA.',
    bio: 'Soy un desarrollador enfocado en crear herramientas modernas, escalables y eficientes. Aquí puedes explorar mis proyectos técnicos principales:',
    cta: 'Ver mis proyectos',
    and: 'y',
  },
  about: {
    title: 'Sobre Mí',
    bio: 'Soy un desarrollador de software especializado en construir aplicaciones web completas con Angular en el frontend e integración de Inteligencia Artificial en el backend. Me apasiona resolver problemas reales creando herramientas que combinan buena experiencia de usuario con tecnología de vanguardia.',
    downloadCv: 'Descargar CV',
    techTitle: 'Tecnologías',
  },
  projects: {
    builtWith: 'Construido con:',
    viewDemo: 'Ver Demo Técnica',
    viewCode: 'Ver Código',
    back: '← Volver al inicio',
    notFound: 'Proyecto no encontrado',
    notFoundBack: 'Volver al inicio',
    sectionTitle: 'Proyectos Destacados',
    detailSections: {
      tech: 'Tecnologías',
      links: 'Enlaces',
      sourceCode: 'Ver Código Fuente',
      liveDemo: 'Ver Demo en Vivo',
      ai: 'Integración de Inteligencia Artificial',
      challenges: 'Retos Técnicos y Soluciones',
      videoDemo: 'Demo en vídeo',
    },
    items: {
      tecnoambiente: {
        shortDescription: 'Plataforma de gestión documental con extracción inteligente de metadatos mediante IA para una empresa medioambiental.',
        fullDescription: 'Tecnoambiente es una aplicación web desarrollada para Tradebe que centraliza la gestión de documentación técnica medioambiental. Permite subir PDFs, extraer automáticamente metadatos como título, autores, año y palabras clave usando la API de Gemini, y clasificarlos por familia y especie. Incluye un sistema de búsqueda avanzada con filtros múltiples y un panel de administración para gestión de usuarios.',
        aiIntegration: 'Integración con Google Gemini para extracción automática de metadatos desde PDFs: título, autores, año de publicación, palabras clave, familia y especie.',
        challenges: 'Procesamiento asíncrono de PDFs de gran tamaño y extracción precisa de metadatos con IA, garantizando coherencia en documentos con formatos heterogéneos. El sistema implementa detección de duplicados mediante hash de archivo, evitando que dos PDFs con diferente nombre pero contenido idéntico se indexen dos veces.',      },
      sentinel: {
        shortDescription: 'App de productividad con temporizador Pomodoro, bloqueo de distracciones y monitoreo de hábitos digitales mediante extensión de Chrome.',
        fullDescription: 'Sentinel es una herramienta de productividad que combina un temporizador Pomodoro personalizable con un sistema de monitoreo de distracciones digitales. Los usuarios definen una lista de apps/webs prohibidas durante sus sesiones de enfoque. Una extensión de Chrome detecta en tiempo real cuánto tiempo pasa el usuario en esas webs y lo reporta al servidor, visualizándose en el dashboard. Incluye sistema de recompensas con monedas por sesiones completadas.',
        aiIntegration: 'Sistema de detección de patrones de distracción y análisis de hábitos digitales a través de una extensión de Chrome con reporte en tiempo real.',
        challenges: 'Arquitectura del watcher de procesos: al estar el backend en Docker sin acceso a los procesos del cliente, se diseñó una extensión de Chrome como solución profesional que monitorea las pestañas activas y reporta al servidor.',
      },
      'lead-scout': {
        shortDescription: 'Herramienta de generación de leads con IA que analiza negocios locales, detecta oportunidades de mejora web y automatiza el outreach.',
        fullDescription: 'Lead Scout es una plataforma que combina la API de Google Places con análisis de IA para identificar negocios locales con potencial de mejora digital. Busca empresas por sector y ubicación, analiza su presencia web mediante PageSpeed Insights, y usa Gemini AI para generar informes personalizados con oportunidades de mejora. Diseñado para agencias digitales y freelancers que buscan automatizar la prospección de clientes.',
        aiIntegration: 'Gemini AI analiza los datos de cada negocio y genera automáticamente un informe con puntos débiles de su presencia digital y recomendaciones de mejora personalizadas.',
        challenges: 'Coordinación de múltiples APIs externas (Google Places, PageSpeed, Gemini) con control de rate limiting y manejo de errores para garantizar resultados consistentes.',
      },
    },
  },
  contact: {
    title: 'Contacto',
    subtitle: '¿Tienes alguna pregunta o quieres que trabajemos juntos? Déjame tus datos y te responderé lo antes posible.',
    name: 'Nombre',
    email: 'Email',
    message: 'Mensaje',
    send: 'Enviar',
  },
  footer: {
    rights: '© 2026 Marcos Morales. Todos los derechos reservados.',
  },
};
