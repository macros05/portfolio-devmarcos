<div align="center">

# 🚀 Portfolio — Marcos Dev

[![Angular](https://img.shields.io/badge/Angular-21-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

**🌐 [Ver en vivo / Live Demo](https://marcosmorales.dev)**  
**🌍 [ES](#español) · [EN](#english)**

</div>

---

## Español

### 📋 Descripción

Portfolio personal de desarrollador construido con **Angular 21**, **TypeScript** y **Tailwind CSS**. Presenta mis proyectos, habilidades y formas de contacto en una interfaz moderna, responsiva y con soporte para dos idiomas (Español / Inglés).

### ✨ Características

- ⚡ Desarrollado con Angular 21 (Standalone Components)
- 🎨 Estilos con Tailwind CSS
- 🌍 Soporte bilingüe: **Español / Inglés** con cambio dinámico desde el navbar
- 📱 Diseño completamente responsivo (mobile-first)
- 🗂️ Secciones: **Sobre mí**, **Proyectos**, **Contacto**
- 🚀 Listo para producción y desplegable en Vercel / Netlify / GitHub Pages

### 🛠️ Tecnologías

| Tecnología | Versión | Uso |
|---|---|---|
| Angular | 21 | Framework principal |
| TypeScript | 5 | Lenguaje |
| Tailwind CSS | 3 | Estilos utilitarios |
| Angular CLI | 21 | Scaffolding y build |
| Vitest | latest | Testing unitario |

### 📁 Estructura del proyecto

```
portfolio-devmarcos/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── navbar/          # Barra de navegación + botón ES/EN
│   │   │   ├── about/           # Sección "Sobre mí"
│   │   │   ├── projects/        # Sección "Proyectos"
│   │   │   └── contact/         # Sección "Contacto"
│   │   ├── services/
│   │   │   └── language.service.ts  # Servicio de internacionalización
│   │   ├── i18n/
│   │   │   ├── es.ts            # Traducciones en español
│   │   │   └── en.ts            # Traducciones en inglés
│   │   └── app.component.ts
│   ├── public/
│   └── styles.css
├── angular.json
├── tailwind.config.js
└── package.json
```

### 🚀 Instalación y uso local

```bash
# 1. Clonar el repositorio
git clone https://github.com/macros05/portfolio-devmarcos.git

# 2. Entrar al directorio
cd portfolio-devmarcos

# 3. Instalar dependencias
npm install

# 4. Iniciar servidor de desarrollo
ng serve

# 5. Abrir en el navegador
# http://localhost:4200
```

### 🏗️ Build para producción

```bash
ng build
```
Los archivos compilados se generan en `dist/`. Listos para desplegar en Vercel, Netlify o GitHub Pages.

### 🌍 Sistema de idiomas

El portfolio incluye un sistema de traducción propio (sin librerías externas) que permite cambiar entre **Español** e **Inglés** con un botón en el navbar. El idioma seleccionado se persiste en `localStorage`.

**Archivos clave:**
- `src/app/i18n/es.ts` — Textos en español
- `src/app/i18n/en.ts` — Textos en inglés
- `src/app/services/language.service.ts` — Servicio reactivo de idioma

### 🧪 Tests

```bash
# Tests unitarios
ng test

# Tests e2e
ng e2e
```

### 📬 Contacto

- **GitHub:** [@macros05](https://github.com/macros05)
- **LinkedIn:** [Marcos Morales](https://www.linkedin.com/in/marcos-morales-gonzález/)
- **Email:** contacto@marcosmorales.dev

---

## English

### 📋 Description

Personal developer portfolio built with **Angular 21**, **TypeScript**, and **Tailwind CSS**. It showcases my projects, skills, and contact information through a modern, responsive interface with bilingual support (Spanish / English).

### ✨ Features

- ⚡ Built with Angular 21 (Standalone Components)
- 🎨 Styled with Tailwind CSS
- 🌍 Bilingual support: **Spanish / English** with dynamic toggle from the navbar
- 📱 Fully responsive design (mobile-first)
- 🗂️ Sections: **About**, **Projects**, **Contact**
- 🚀 Production-ready, deployable to Vercel / Netlify / GitHub Pages

### 🛠️ Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Angular | 21 | Main framework |
| TypeScript | 5 | Language |
| Tailwind CSS | 3 | Utility-first styling |
| Angular CLI | 21 | Scaffolding & build |
| Vitest | latest | Unit testing |

### 📁 Project Structure

```
portfolio-devmarcos/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── navbar/          # Navigation bar + ES/EN toggle button
│   │   │   ├── about/           # About section
│   │   │   ├── projects/        # Projects section
│   │   │   └── contact/         # Contact section
│   │   ├── services/
│   │   │   └── language.service.ts  # i18n service
│   │   ├── i18n/
│   │   │   ├── es.ts            # Spanish translations
│   │   │   └── en.ts            # English translations
│   │   └── app.component.ts
│   ├── public/
│   └── styles.css
├── angular.json
├── tailwind.config.js
└── package.json
```

### 🚀 Installation & Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/macros05/portfolio-devmarcos.git

# 2. Navigate to directory
cd portfolio-devmarcos

# 3. Install dependencies
npm install

# 4. Start development server
ng serve

# 5. Open in browser
# http://localhost:4200
```

### 🏗️ Production Build

```bash
ng build
```
Compiled files are output to `dist/`. Ready to deploy on Vercel, Netlify, or GitHub Pages.

### 🌍 Language System

The portfolio includes a custom translation system (no external libraries) that allows switching between **Spanish** and **English** via a navbar button. The selected language persists in `localStorage`.

**Key files:**
- `src/app/i18n/es.ts` — Spanish strings
- `src/app/i18n/en.ts` — English strings
- `src/app/services/language.service.ts` — Reactive language service

### 🧪 Tests

```bash
# Unit tests
ng test

# End-to-end tests
ng e2e
```

### 📬 Contact

- **GitHub:** [@macros05](https://github.com/macros05)
- **LinkedIn:** [Marcos Morales](https://www.linkedin.com/in/marcos-morales-gonzález/)
- **Email:** contacto@marcosmorales.dev

---

<div align="center">

Made with ❤️ by **Marcos** · [macros05](https://github.com/macros05)

</div>
