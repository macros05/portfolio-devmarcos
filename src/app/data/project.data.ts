import { Project } from '../models/project.model';

export const PROJECTS: Project[] = [
  {
    id: 'tecnoambiente',
    title: 'TECNOAMBIENTE',
    shortDescription: 'Plataforma de gestión documental con extracción inteligente de metadatos mediante IA para una empresa medioambiental.',
    fullDescription: 'Tecnoambiente es una aplicación web desarrollada para Tradebe que centraliza la gestión de documentación técnica medioambiental. Permite subir PDFs, extraer automáticamente metadatos como título, autores, año y palabras clave usando la API de Gemini, y clasificarlos por familia y especie. Incluye un sistema de búsqueda avanzada con filtros múltiples y un panel de administración para gestión de usuarios.',
    techStack: ['Angular', 'FastAPI', 'Python', 'MySQL', 'Gemini AI'],
    aiIntegration: 'Integración con Google Gemini para extracción automática de metadatos desde PDFs: título, autores, año de publicación, palabras clave, familia y especie.',
    challenges: 'Procesamiento asíncrono de PDFs de gran tamaño y extracción precisa de metadatos con IA, garantizando coherencia en documentos con formatos heterogéneos.',
    demoUrl: 'https://tecno.marcosmorales.dev/',
    githubUrl: 'https://github.com/macros05/TecnoAmbiente-bibliography',
    videoUrl: '/assets/videos/tecnoambiente.mp4',
  },
  {
    id: 'sentinel',
    title: 'SENTINEL',
    shortDescription: 'App de productividad con temporizador Pomodoro, bloqueo de distracciones y monitoreo de hábitos digitales mediante extensión de Chrome.',
    fullDescription: 'Sentinel es una herramienta de productividad que combina un temporizador Pomodoro personalizable con un sistema de monitoreo de distracciones digitales. Los usuarios definen una lista de apps/webs prohibidas durante sus sesiones de enfoque. Una extensión de Chrome detecta en tiempo real cuánto tiempo pasa el usuario en esas webs y lo reporta al servidor, visualizándose en el dashboard. Incluye sistema de recompensas con monedas por sesiones completadas.',
    techStack: ['Angular', 'FastAPI', 'Python', 'MySQL', 'Chrome Extension'],
    aiIntegration: 'Sistema de detección de patrones de distracción y análisis de hábitos digitales a través de una extensión de Chrome con reporte en tiempo real.',
    challenges: 'Arquitectura del watcher de procesos: al estar el backend en Docker sin acceso a los procesos del cliente, se diseñó una extensión de Chrome como solución profesional que monitorea las pestañas activas y reporta al servidor.',
    demoUrl: 'https://sentinel.marcosmorales.dev',
    githubUrl: 'https://github.com/macros05/Sentinel',
    videoUrl: '/assets/videos/sentinel.mp4',
  },
  {
    id: 'lead-scout',
    title: 'LEAD SCOUT',
    shortDescription: 'Herramienta de generación de leads con IA que analiza negocios locales, detecta oportunidades de mejora web y automatiza el outreach.',
    fullDescription: 'Lead Scout es una plataforma que combina la API de Google Places con análisis de IA para identificar negocios locales con potencial de mejora digital. Busca empresas por sector y ubicación, analiza su presencia web mediante PageSpeed Insights, y usa Gemini AI para generar informes personalizados con oportunidades de mejora. Diseñado para agencias digitales y freelancers que buscan automatizar la prospección de clientes.',
    techStack: ['Angular', 'Spring Boot', 'Java', 'Google Places API', 'Gemini AI'],
    aiIntegration: 'Gemini AI analiza los datos de cada negocio y genera automáticamente un informe con puntos débiles de su presencia digital y recomendaciones de mejora personalizadas.',
    challenges: 'Coordinación de múltiples APIs externas (Google Places, PageSpeed, Gemini) con control de rate limiting y manejo de errores para garantizar resultados consistentes.',
    demoUrl: 'https://leads.marcosmorales.dev/',
    githubUrl: 'https://github.com/macros05/Leads-scout',
    videoUrl: '/assets/videos/leads-scout.mp4',
  }
];
