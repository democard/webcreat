export interface Post {
  id: string;
  slug: string;
  title: string;
  summary: string;
  date: string;
  readTime: string;
  tags: string[];
  featured?: boolean;
  content: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  githubUrl?: string;
  demoUrl?: string;
  stars?: number;
  forks?: number;
  updatedAt?: string;
  featured?: boolean;
}