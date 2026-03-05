export const EN = {
  nav: {
    inicio: 'Home',
    about: 'About Me',
    projects: 'Projects',
    contact: 'Contact',
  },
  hero: {
    greeting: 'Hi, my name is',
    subtitle: 'I build AI-powered solutions.',
    bio: 'I\'m a developer focused on building modern, scalable and efficient tools. Here you can explore my main technical projects:',
    cta: 'View my projects',
    and: 'and'
  },
  about: {
    title: 'About Me',
    bio: 'I\'m a software developer specialized in building full-stack web applications with Angular on the frontend and AI integration on the backend. I\'m passionate about solving real problems by creating tools that combine great user experience with cutting-edge technology.',
    downloadCv: 'Download CV',
    techTitle: 'Technologies',
  },
  projects: {
    builtWith: 'Built with:',
    viewDemo: 'View Technical Demo',
    viewCode: 'View Code',
    back: '← Back to home',
    notFound: 'Project not found',
    notFoundBack: 'Back to home',
    sectionTitle: 'Featured Projects',
    detailSections: {
      tech: 'Technologies',
      links: 'Links',
      sourceCode: 'View Source Code',
      liveDemo: 'View Live Demo',
      ai: 'Artificial Intelligence Integration',
      challenges: 'Technical Challenges & Solutions',
      videoDemo: 'Video demo',
    },
    items: {
      tecnoambiente: {
        shortDescription: 'Document management platform with intelligent AI-powered metadata extraction for an environmental company.',
        fullDescription: 'Tecnoambiente is a web application built for Tradebe that centralizes the management of environmental technical documentation. It allows uploading PDFs, automatically extracting metadata such as title, authors, year and keywords using the Gemini API, and classifying them by family and species. Includes an advanced search system with multiple filters and an admin panel for user management.',
        aiIntegration: 'Integration with Google Gemini for automatic metadata extraction from PDFs: title, authors, publication year, keywords, family and species.',
        challenges: 'Asynchronous processing of large PDFs and precise AI metadata extraction, ensuring consistency across documents with heterogeneous formats. The system implements duplicate detection via file hash, preventing two PDFs with different names but identical content from being indexed twice.',      },
      sentinel: {
        shortDescription: 'Productivity app with Pomodoro timer, distraction blocking and digital habit monitoring via Chrome extension.',
        fullDescription: 'Sentinel is a productivity tool that combines a customizable Pomodoro timer with a digital distraction monitoring system. Users define a list of forbidden apps/websites during their focus sessions. A Chrome extension detects in real time how long the user spends on those sites and reports it to the server, visualized on the dashboard. Includes a reward system with coins for completed sessions.',
        aiIntegration: 'Distraction pattern detection system and digital habit analysis through a Chrome extension with real-time reporting.',
        challenges: 'Process watcher architecture: since the backend runs in Docker without access to client processes, a Chrome extension was designed as a professional solution that monitors active tabs and reports to the server.',
      },
      'lead-scout': {
        shortDescription: 'AI-powered lead generation tool that analyzes local businesses, detects web improvement opportunities and automates outreach.',
        fullDescription: 'Lead Scout is a platform that combines the Google Places API with AI analysis to identify local businesses with digital improvement potential. It searches companies by sector and location, analyzes their web presence via PageSpeed Insights, and uses Gemini AI to generate personalized reports with improvement opportunities. Designed for digital agencies and freelancers looking to automate client prospecting.',
        aiIntegration: 'Gemini AI analyzes each business\'s data and automatically generates a report with weaknesses in their digital presence and personalized improvement recommendations.',
        challenges: 'Coordination of multiple external APIs (Google Places, PageSpeed, Gemini) with rate limiting control and error handling to ensure consistent results.',
      },
    },
  },
  contact: {
    title: 'Contact',
    subtitle: 'Have a question or want to work together? Leave your details and I\'ll get back to you as soon as possible.',
    name: 'Name',
    email: 'Email',
    message: 'Message',
    send: 'Send',
  },
  footer: {
    rights: '© 2026 Marcos Morales. All rights reserved.',
  },
};
