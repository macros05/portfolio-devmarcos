export interface Project {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  techStack: string[];
  aiIntegration: string;
  challenges: string;
  githubUrl?: string;
  demoUrl?: string;
  videoUrl?: string;
}
