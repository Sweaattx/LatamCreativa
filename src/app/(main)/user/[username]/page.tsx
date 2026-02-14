import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { UserProfile } from '@/components/user/UserProfile';
import type { Metadata } from 'next';

interface UserPageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({
  params,
}: UserPageProps): Promise<Metadata> {
  const { username } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from('users')
    .select('name, bio, role, avatar')
    .or(`username.eq.${username},id.eq.${username}`)
    .single();

  const user = data as {
    name: string;
    bio: string | null;
    role: string | null;
    avatar: string | null;
  } | null;

  if (!user) {
    return { title: 'Usuario no encontrado' };
  }

  return {
    title: user.name,
    description: user.bio || `Perfil de ${user.name} en LatamCreativa`,
    openGraph: {
      title: `${user.name} | LatamCreativa`,
      description: user.bio || `${user.role || 'Creativo'} en LatamCreativa`,
      type: 'profile',
      images: user.avatar ? [{ url: user.avatar, width: 200, height: 200 }] : [],
    },
    twitter: {
      card: 'summary',
      title: user.name,
      description: user.bio || `${user.role || 'Creativo'} en LatamCreativa`,
      images: user.avatar ? [user.avatar] : [],
    },
  };
}

// Dynamic rendering - pages generated on-demand
export const dynamic = 'force-dynamic';

async function getUserData(username: string) {
  const supabase = await createClient();

  // Try by username first, then by ID
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();

  let user = userData as Record<string, unknown> | null;

  if (!user) {
    const { data: userById } = await supabase
      .from('users')
      .select('*')
      .eq('id', username)
      .single();
    user = userById as Record<string, unknown> | null;
  }

  if (!user) return null;

  const userId = user.id as string;

  // Get user's projects
  const { data: projectsData } = await supabase
    .from('projects')
    .select('*')
    .eq('author_id', userId)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(12);

  // Get user's articles
  const { data: articlesData } = await supabase
    .from('articles')
    .select('*')
    .eq('author_id', userId)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(6);

  // Get follower count
  const { count: followersCount } = await supabase
    .from('followers')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', userId);

  // Get following count
  const { count: followingCount } = await supabase
    .from('followers')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', userId);

  const projects = (projectsData || []) as Record<string, unknown>[];
  const articles = (articlesData || []) as Record<string, unknown>[];

  return {
    user,
    projects,
    articles,
    stats: {
      followers: followersCount || 0,
      following: followingCount || 0,
      projects: projects.length,
    },
  };
}

export default async function UserPage({ params }: UserPageProps) {
  const { username } = await params;
  const data = await getUserData(username);

  if (!data) {
    notFound();
  }

  return (
    <UserProfile
      user={data.user}
      projects={data.projects}
      articles={data.articles}
      stats={data.stats}
    />
  );
}
