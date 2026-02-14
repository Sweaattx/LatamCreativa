/**
 * Home Page Data
 * Mock data for the home page sections
 * 
 * @module data/homeData
 */

import { Users, Sparkles, Briefcase, Globe, type LucideIcon } from 'lucide-react';

// ========== TYPES ==========
export interface MockProject {
    id: string;
    title: string;
    artist: string;
    artistAvatar: string;
    image: string;
    category: string;
    views: number;
    likes: number;
    slug: string;
}

export interface MockArticle {
    id: string;
    title: string;
    excerpt: string;
    author: string;
    authorAvatar: string;
    image: string;
    category: string;
    readTime: string;
    slug: string;
}

export interface TopArtist {
    id: string;
    name: string;
    role: string;
    avatar: string;
    followers: string;
    country: string;
    featured: string;
}

export interface Category {
    name: string;
    image: string;
    count: string;
    color: string;
}

export interface FeaturedJob {
    id: string;
    title: string;
    company: string;
    location: string;
    type: string;
    salary: string;
    logo: string;
    tags: string[];
}

export interface PlatformStat {
    label: string;
    value: string;
    icon: LucideIcon;
}

// ========== MOCK DATA ==========

export const mockProjects: MockProject[] = [
    {
        id: '1',
        title: 'Creatividad Sin Límites - Portfolio 2025',
        artist: 'María García',
        artistAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=600&fit=crop',
        category: 'Destacado',
        views: 12500,
        likes: 2340,
        slug: 'creatividad-sin-limites'
    },
    {
        id: '2',
        title: 'Ilustración Digital - Arte Conceptual',
        artist: 'Carlos Rodríguez',
        artistAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
        image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&h=600&fit=crop',
        category: 'Ilustración',
        views: 8900,
        likes: 1876,
        slug: 'ilustracion-conceptual'
    },
    {
        id: '3',
        title: 'Código Creativo - Generative Art',
        artist: 'Ana López',
        artistAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
        image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=600&fit=crop',
        category: 'Código Creativo',
        views: 15200,
        likes: 3100,
        slug: 'generative-art'
    },
    {
        id: '4',
        title: 'Dashboard UI - Diseño de Interfaces',
        artist: 'Diego Fernández',
        artistAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
        category: 'UI/UX',
        views: 21000,
        likes: 4500,
        slug: 'dashboard-ui'
    },
    {
        id: '5',
        title: 'Character Design - Personajes 3D',
        artist: 'Lucía Méndez',
        artistAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
        image: 'https://images.unsplash.com/photo-1634926878768-2a5b3c42f139?w=800&h=600&fit=crop',
        category: 'Arte de Personajes',
        views: 9800,
        likes: 2100,
        slug: 'character-3d'
    },
    {
        id: '6',
        title: 'Motion Design - Animación Abstract',
        artist: 'Roberto Sánchez',
        artistAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
        image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=600&fit=crop',
        category: 'Motion',
        views: 18500,
        likes: 3800,
        slug: 'motion-abstract'
    },
    {
        id: '7',
        title: 'Arte Digital - Composición Neon',
        artist: 'Valentina Torres',
        artistAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
        image: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=800&h=600&fit=crop',
        category: 'Arte Digital',
        views: 7600,
        likes: 1450,
        slug: 'neon-art'
    },
    {
        id: '8',
        title: 'Web Development - React Dashboard',
        artist: 'Andrés Morales',
        artistAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
        image: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&h=600&fit=crop',
        category: 'Desarrollo',
        views: 11200,
        likes: 2890,
        slug: 'react-dashboard'
    },
];

export const mockArticles: MockArticle[] = [
    {
        id: '1',
        title: 'Cómo crear un portafolio que destaque en 2025',
        excerpt: 'Descubre las mejores prácticas para mostrar tu trabajo creativo.',
        author: 'María García',
        authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
        category: 'Carrera',
        readTime: '8 min',
        slug: 'portafolio-2025'
    },
    {
        id: '2',
        title: 'Las 10 tendencias de diseño que dominarán el año',
        excerpt: 'Desde el neomorfismo hasta el diseño 3D inmersivo.',
        author: 'Carlos Rodríguez',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
        image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop',
        category: 'Tendencias',
        readTime: '12 min',
        slug: 'tendencias-diseno'
    },
    {
        id: '3',
        title: 'Guía completa de pricing para freelancers',
        excerpt: 'Aprende a valorar tu trabajo correctamente.',
        author: 'Ana López',
        authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
        image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop',
        category: 'Freelance',
        readTime: '15 min',
        slug: 'pricing-freelancers'
    },
    {
        id: '4',
        title: 'Blender 4.0: Todo lo que necesitas saber',
        excerpt: 'Las nuevas funciones que revolucionarán tu flujo.',
        author: 'Diego Fernández',
        authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
        image: 'https://images.unsplash.com/photo-1617042375876-a13e36732a04?w=800&h=600&fit=crop',
        category: 'Tutoriales',
        readTime: '20 min',
        slug: 'blender-4'
    },
];

export const topArtists: TopArtist[] = [
    {
        id: '1',
        name: 'María García',
        role: 'Ilustradora 3D',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
        followers: '12.5K',
        country: 'MX',
        featured: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=300&fit=crop'
    },
    {
        id: '2',
        name: 'Carlos Rodríguez',
        role: 'Diseñador Motion',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
        followers: '9.8K',
        country: 'AR',
        featured: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&h=300&fit=crop'
    },
    {
        id: '3',
        name: 'Ana López',
        role: 'Diseñadora de Marca',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
        followers: '15.2K',
        country: 'CO',
        featured: 'https://images.unsplash.com/photo-1626785774625-ddcddc3445e9?w=400&h=300&fit=crop'
    },
    {
        id: '4',
        name: 'Diego Fernández',
        role: 'Diseñador UI/UX',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
        followers: '8.3K',
        country: 'CL',
        featured: 'https://images.unsplash.com/photo-1545235617-9465d2a55698?w=400&h=300&fit=crop'
    },
    {
        id: '5',
        name: 'Lucía Méndez',
        role: 'Artista de Personajes',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
        followers: '11.1K',
        country: 'PE',
        featured: 'https://images.unsplash.com/photo-1633186710895-309db2eca9e4?w=400&h=300&fit=crop'
    },
    {
        id: '6',
        name: 'Roberto Sánchez',
        role: 'Director Creativo',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
        followers: '18.7K',
        country: 'BR',
        featured: 'https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=400&h=300&fit=crop'
    },
];

export const categories: Category[] = [
    { name: 'Diseño 3D', image: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=400&h=500&fit=crop', count: '12.5K', color: 'from-purple-600' },
    { name: 'Ilustración', image: 'https://images.unsplash.com/photo-1609342122563-a43ac8917a3a?w=400&h=500&fit=crop', count: '18.2K', color: 'from-pink-600' },
    { name: 'Programación', image: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&h=500&fit=crop', count: '8.7K', color: 'from-blue-600' },
    { name: 'Diseño UI/UX', image: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=400&h=500&fit=crop', count: '21.3K', color: 'from-green-600' },
    { name: 'Diseño Motion', image: 'https://images.unsplash.com/photo-1616499370260-485b3e5ed653?w=400&h=500&fit=crop', count: '15.8K', color: 'from-orange-600' },
    { name: 'Branding', image: 'https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=400&h=500&fit=crop', count: '9.4K', color: 'from-red-600' },
];

export const featuredJobs: FeaturedJob[] = [
    {
        id: '1',
        title: 'Senior UI Designer',
        company: 'Mercado Libre',
        location: 'Buenos Aires, Argentina',
        type: 'Remoto',
        salary: '$4,000 - $6,000 USD',
        logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop',
        tags: ['Figma', 'Sistemas de Diseño', 'Prototipado']
    },
    {
        id: '2',
        title: 'Full Stack Developer',
        company: 'Globant',
        location: 'CDMX, México',
        type: 'Híbrido',
        salary: '$3,500 - $5,000 USD',
        logo: 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=100&h=100&fit=crop',
        tags: ['React', 'Node.js', 'TypeScript']
    },
    {
        id: '3',
        title: '3D Artist',
        company: 'Riot Games LATAM',
        location: 'São Paulo, Brasil',
        type: 'Presencial',
        salary: '$5,000 - $8,000 USD',
        logo: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=100&h=100&fit=crop',
        tags: ['Blender', 'ZBrush', 'Unreal Engine']
    },
];

export const platformStats: PlatformStat[] = [
    { label: 'Creativos activos', value: '25K+', icon: Users },
    { label: 'Proyectos publicados', value: '150K+', icon: Sparkles },
    { label: 'Ofertas de trabajo', value: '2.5K+', icon: Briefcase },
    { label: 'Países representados', value: '21', icon: Globe },
];

export const filterCategories = ['Todos', '3D', 'Ilustración', 'UI/UX', 'Motion', 'Branding'];

export const categoryMapping: Record<string, string[]> = {
    'Todos': [],
    '3D': ['3D', 'Arte de Personajes', 'Arte Conceptual'],
    'Ilustración': ['Ilustración', 'Arte Digital', 'Arte Conceptual'],
    'UI/UX': ['UI/UX', 'Diseño Móvil'],
    'Motion': ['Motion', 'Código Creativo'],
    'Branding': ['Branding'],
};

// ========== UTILITY FUNCTIONS ==========

export const formatNumber = (n: number): string =>
    n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toString();
