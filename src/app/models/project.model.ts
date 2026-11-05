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
  /** Still shown until a clip is playing, and when there is no clip yet. */
  imageUrl?: string;
  /**
   * Optional 16:9 preview. Omit until the files exist.
   * Set `src` and `poster` to public paths and the card loops it, muted.
   */
  video?: ProjectClip;
  /** Two or three concrete points. Not the stack. */
  highlights: Copy[];
  /** Full-width plate. The first three leads are the prominent set. */
  lead?: boolean;
  /** Language-neutral steps for the architecture diagram. */
  flow: string[];
  /** How the system is actually put together. No metrics. */
  system: Copy;
  /** Short status, e.g. a launch date. */
  meta?: Copy;
}

/** Drop a file in `public/` and point these paths at it. */
export interface ProjectClip {
  src: string;
  poster: string;
}
