export interface Project {
  id: string;
  title: string;
  /** Short, language-neutral discipline tag, e.g. "AI Video Pipeline". */
  category?: string;
  shortDescription: string;
  fullDescription: string;
  techStack: string[];
  aiIntegration: string;
  challenges: string;
  githubUrl?: string;
  demoUrl?: string;
  videoUrl?: string;
  /** Animated poster shown when there is no screen recording yet. */
  imageUrl?: string;
}
