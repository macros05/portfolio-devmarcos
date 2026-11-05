export interface Copy {
  en: string;
  es: string;
}

export interface Project {
  id: string;
  title: string;
  /** Discipline tag, written in both languages. */
  category: Copy;
  /** One line on the card. */
  summary: Copy;
  shortDescription: string;
  fullDescription: string;
  techStack: string[];
  aiIntegration: string;
  challenges: string;
  githubUrl?: string;
  /** Shown as text when the source is not public. Never a link. */
  privateRepo?: boolean;
  demoUrl?: string;
  /** Optional preview clip. Leave unset to show `imageUrl`. */
  videoUrl?: string;
  /** Still shown in the card's preview slot. */
  imageUrl?: string;
}
