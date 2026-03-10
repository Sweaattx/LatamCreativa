import { createClient } from '@/lib/supabase/server';
import { UserProfileView } from '@/components/user/UserProfileView';
import type { Metadata } from 'next';

interface UserPageProps {
  params: Promise<{ username: string }>;
}

// Mock fallback data when no Supabase user found
function getMockUser(username: string) {
  const MOCK_USERS: Record<string, Record<string, unknown>> = {
    mariagarcia: {
      id: 'mock-1', name: 'María García', username: 'mariagarcia',
      avatar: 'https://ui-avatars.com/api/?name=Maria+Garcia&background=ec4899&color=fff&size=256',
      banner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80',
      bio: 'Diseñadora UI/UX con 8+ años de experiencia en productos digitales para Latam. Apasionada por el diseño centrado en el usuario y los sistemas de diseño escalables.',
      role: 'Diseñadora UI/UX Senior', location: 'Ciudad de México, México',
      website: 'https://mariagarcia.design', created_at: '2023-06-15',
      skills: ['Figma', 'Diseño UI', 'Investigación UX', 'Design Systems', 'Prototipado'],
    },
    carlosmendoza: {
      id: 'mock-2', name: 'Carlos Mendoza', username: 'carlosmendoza',
      avatar: 'https://ui-avatars.com/api/?name=Carlos+Mendoza&background=6366f1&color=fff&size=256',
      banner: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200&q=80',
      bio: 'Artista 3D y Animator con experiencia en producciones cinematográficas y publicidad. Especializado en Blender, Maya y ZBrush.',
      role: 'Artista 3D & Animator', location: 'Buenos Aires, Argentina',
      website: 'https://carlosmendoza.art', created_at: '2023-03-22',
      skills: ['Blender', 'Maya', 'ZBrush', 'Animación 3D', 'Substance Painter'],
    },
  };

  // Return specific mock user or generate one from the username
  if (MOCK_USERS[username]) return MOCK_USERS[username];

  const displayName = username
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());

  return {
    id: `mock-${username}`, name: displayName, username,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=FF4D00&color=fff&size=256`,
    banner: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=1200&q=80',
    bio: `Miembro de la comunidad LatamCreativa. Explorando el arte digital y la creatividad en Latinoamérica.`,
    role: 'Creativo', location: 'Latinoamérica',
    website: null, created_at: '2024-01-01',
    skills: ['Creatividad', 'Diseño Digital', 'Arte'],
  };
}

const MOCK_PROJECTS = [
  { id: 'p1', title: 'Dashboard Fintech', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80', category: 'UI/UX', likes: 342, views: 2100, slug: 'dashboard-fintech', created_at: '2024-01-15' },
  { id: 'p2', title: 'Brand Identity — Café Austral', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=80', category: 'Branding', likes: 218, views: 1650, slug: 'brand-cafe-austral', created_at: '2024-01-08' },
  { id: 'p3', title: 'App Deportiva — RunLatam', image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&q=80', category: 'Mobile', likes: 157, views: 980, slug: 'app-runlatam', created_at: '2023-12-20' },
  { id: 'p4', title: 'E-commerce Artesanal', image: 'https://images.unsplash.com/photo-1555421689-d68471e189f2?w=600&q=80', category: 'Web', likes: 289, views: 1830, slug: 'ecommerce-artesanal', created_at: '2023-12-05' },
  { id: 'p5', title: 'Ilustración Mural Urbano', image: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=600&q=80', category: 'Ilustración', likes: 412, views: 3200, slug: 'mural-urbano', created_at: '2023-11-18' },
  { id: 'p6', title: 'Motion Reel 2024', image: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=600&q=80', category: 'Motion', likes: 531, views: 4100, slug: 'motion-reel-2024', created_at: '2023-11-01' },
];

const MOCK_ARTICLES = [
  { id: 'a1', title: 'Cómo construí mi sistema de diseño en Figma', slug: 'sistema-diseno-figma', category: 'Tutorial', likes: 89, views: 1200, comments: 23, created_at: '2024-01-20', image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=600&q=80' },
  { id: 'a2', title: 'Tendencias de UI/UX para 2025 en Latam', slug: 'tendencias-uiux-2025', category: 'Artículo', likes: 156, views: 2400, comments: 41, created_at: '2024-01-10', image: 'https://images.unsplash.com/photo-1581291518633-83b4eef1d2fa?w=600&q=80' },
  { id: 'a3', title: 'De freelancer a estudio: mi historia', slug: 'freelancer-a-estudio', category: 'Historia', likes: 234, views: 3100, comments: 67, created_at: '2023-12-28', image: 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=600&q=80' },
];

export async function generateMetadata({ params }: UserPageProps): Promise<Metadata> {
  const { username } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from('users')
    .select('name, bio, role, avatar')
    .or(`username.eq.${username},id.eq.${username}`)
    .single();

  const user = (data as { name: string; bio: string | null; role: string | null; avatar: string | null } | null)
    || getMockUser(username) as { name: string; bio: string | null; role: string | null; avatar: string | null };

  return {
    title: `${user.name} | LatamCreativa`,
    description: user.bio || `Perfil de ${user.name} en LatamCreativa`,
    openGraph: {
      title: `${user.name} | LatamCreativa`,
      description: user.bio || `${user.role || 'Creativo'} en LatamCreativa`,
      type: 'profile',
      images: user.avatar ? [{ url: user.avatar, width: 200, height: 200 }] : [],
    },
  };
}

export const dynamic = 'force-dynamic';

async function getUserData(username: string) {
  const supabase = await createClient();

  const { data: userData } = await supabase.from('users').select('*').eq('username', username).single();
  let user = userData as Record<string, unknown> | null;

  if (!user) {
    const { data: userById } = await supabase.from('users').select('*').eq('id', username).single();
    user = userById as Record<string, unknown> | null;
  }

  if (user) {
    const userId = user.id as string;
    const { data: projectsData } = await supabase.from('projects').select('*').eq('author_id', userId).eq('status', 'published').order('created_at', { ascending: false }).limit(12);
    const { data: articlesData } = await supabase.from('articles').select('*').eq('author_id', userId).eq('status', 'published').order('created_at', { ascending: false }).limit(6);
    const { count: followersCount } = await supabase.from('followers').select('*', { count: 'exact', head: true }).eq('following_id', userId);
    const { count: followingCount } = await supabase.from('followers').select('*', { count: 'exact', head: true }).eq('follower_id', userId);

    return {
      user,
      projects: (projectsData || []) as Record<string, unknown>[],
      articles: (articlesData || []) as Record<string, unknown>[],
      stats: { followers: followersCount || 0, following: followingCount || 0, projects: (projectsData || []).length },
    };
  }

  // Fallback to mock data — NEVER 404
  const mockUser = getMockUser(username);
  return {
    user: mockUser,
    projects: MOCK_PROJECTS as Record<string, unknown>[],
    articles: MOCK_ARTICLES as Record<string, unknown>[],
    stats: { followers: 1247, following: 382, projects: MOCK_PROJECTS.length },
  };
}

export default async function UserPage({ params }: UserPageProps) {
  const { username } = await params;
  const data = await getUserData(username);

  return (
    <UserProfileView
      user={data.user}
      projects={data.projects}
      articles={data.articles}
      stats={data.stats}
    />
  );
}
