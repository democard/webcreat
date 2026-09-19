export interface Post {
  id: string;
  slug: string;
  title: string;
  summary: string;
  date: string;
  readTime: string;
  tags: string[];
  featured?: boolean;
  updated?: string;
  readingMinutes?: number;
}

export interface Heading { id: string; text: string; level: number }
export interface ArticleBody { slug: string; html: string; headings: Heading[] }

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
