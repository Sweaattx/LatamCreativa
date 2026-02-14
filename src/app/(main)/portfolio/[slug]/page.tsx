import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { ProjectDetail } from '@/components/portfolio/ProjectDetail';
import type { Metadata } from 'next';
import type { PortfolioItem } from '@/types/content';

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

interface ProjectAuthor {
  id: string;
  username?: string;
  name?: string;
  avatar?: string;
  role?: string;
}

// Generar metadata dinámica para SEO
export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from('projects')
    .select('title, description, image, category, tags')
    .eq('slug', slug)
    .single();

  const project = data as {
    title: string;
    description: string | null;
    image: string | null;
    category: string | null;
    tags: string[] | null;
  } | null;

  if (!project) {
    return {
      title: 'Proyecto no encontrado',
    };
  }

  return {
    title: project.title,
    description: project.description || `Proyecto de ${project.category || 'creatividad'}`,
    keywords: project.tags || [],
    openGraph: {
      title: `${project.title} | LatamCreativa`,
      description: project.description || 'Proyecto creativo en LatamCreativa',
      images: project.image ? [{ url: project.image, width: 1200, height: 630 }] : [],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description: project.description || 'Proyecto creativo en LatamCreativa',
      images: project.image ? [project.image] : [],
    },
  };
}

// Dynamic rendering - pages generated on-demand
export const dynamic = 'force-dynamic';

// Tipos para los datos de Supabase
interface DbProject {
  id: string;
  slug: string | null;
  title: string;
  author_id: string;
  image: string;
  views: number | null;
  likes: number | null;
  category: string;
  description: string | null;
  images: string[] | null;
  gallery: { url: string; caption: string; type?: 'image' | 'video' | 'youtube' | 'sketchfab' }[] | null;
  tags: string[] | null;
  tools: string[] | null;
  status: string | null;
  created_at: string | null;
}

interface DbUser {
  id: string;
  name: string | null;
  username: string | null;
  avatar: string | null;
  role: string | null;
}

async function getProject(slug: string): Promise<{
  project: PortfolioItem;
  author: ProjectAuthor | null;
  relatedProjects: PortfolioItem[];
} | null> {
  const supabase = await createClient();

  // Obtener proyecto
  const { data: projectData, error } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !projectData) return null;

  // Cast a tipo conocido
  const dbProject = projectData as unknown as DbProject;

  // Mapear datos a PortfolioItem
  const project: PortfolioItem = {
    id: dbProject.id,
    slug: dbProject.slug ?? undefined,
    title: dbProject.title,
    authorId: dbProject.author_id,
    image: dbProject.image,
    views: dbProject.views ?? 0,
    likes: dbProject.likes ?? 0,
    category: dbProject.category,
    description: dbProject.description ?? undefined,
    images: dbProject.images ?? undefined,
    gallery: dbProject.gallery ?? undefined,
    tags: dbProject.tags ?? undefined,
    tools: dbProject.tools ?? undefined,
    status: (dbProject.status as PortfolioItem['status']) ?? undefined,
    createdAt: dbProject.created_at ?? undefined,
  };

  // Obtener autor
  const { data: authorData } = await supabase
    .from('users')
    .select('id, name, username, avatar, role')
    .eq('id', project.authorId)
    .single();

  const dbAuthor = authorData as unknown as DbUser | null;
  const author: ProjectAuthor | null = dbAuthor ? {
    id: dbAuthor.id,
    username: dbAuthor.username ?? undefined,
    name: dbAuthor.name ?? undefined,
    avatar: dbAuthor.avatar ?? undefined,
    role: dbAuthor.role ?? undefined,
  } : null;

  // Obtener proyectos relacionados
  const { data: relatedData } = await supabase
    .from('projects')
    .select('id, slug, title, image, category, views, likes, author_id')
    .eq('status', 'published')
    .eq('category', project.category)
    .neq('id', project.id)
    .limit(4);

  const dbRelated = (relatedData ?? []) as unknown as DbProject[];
  const relatedProjects: PortfolioItem[] = dbRelated.map((item) => ({
    id: item.id,
    slug: item.slug ?? undefined,
    title: item.title,
    authorId: item.author_id,
    image: item.image,
    views: item.views ?? 0,
    likes: item.likes ?? 0,
    category: item.category,
  }));

  return { project, author, relatedProjects };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const data = await getProject(slug);

  if (!data) {
    notFound();
  }

  const { project, author, relatedProjects } = data;

  return (
    <ProjectDetail
      project={project}
      author={author}
      relatedProjects={relatedProjects}
    />
  );
}
