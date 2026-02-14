import {
  Home, Move3d, MonitorPlay, Clapperboard, Gamepad2, GraduationCap, Palette, Box, Users,
  ImageIcon, Newspaper, Compass, Flame, Clock, Briefcase, MessageCircleQuestion, Trophy, Building2,
  PenTool, Cuboid, Brush, Camera, Lightbulb, Code, Smartphone, Server, Database, Cloud, Cpu,
  Folder, Award, type LucideIcon
} from 'lucide-react';
import { NavItem, NavSection, Chip, CategoryItem } from '../types';

// ============================================
// MENU GROUPS (Para Mega Menú)
// ============================================

export interface MenuGroup {
  id: string;
  label: string;
  items: MenuGroupItem[];
}

export interface MenuGroupItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  description: string;
  badge?: string;
}

export const MENU_GROUPS: MenuGroup[] = [
  {
    id: 'explorar',
    label: 'Explorar',
    items: [
      {
        id: 'portfolio',
        label: 'Portafolio',
        href: '/portfolio',
        icon: ImageIcon,
        description: 'Trabajos y proyectos de la comunidad'
      },
      {
        id: 'blog',
        label: 'Blog',
        href: '/blog',
        icon: Newspaper,
        description: 'Artículos, tutoriales y noticias'
      },
      {
        id: 'forum',
        label: 'Foro',
        href: '/forum',
        icon: MessageCircleQuestion,
        description: 'Discusiones y ayuda de la comunidad'
      },
      {
        id: 'concursos',
        label: 'Concursos',
        href: '/concursos',
        icon: Trophy,
        description: 'Competencias y desafíos creativos',
        badge: 'Próximamente'
      }
    ]
  },
  {
    id: 'aprender',
    label: 'Aprender',
    items: [
      {
        id: 'courses',
        label: 'Cursos',
        href: '/courses',
        icon: GraduationCap,
        description: 'Formación en habilidades creativas',
        badge: 'Próximamente'
      }
    ]
  },
  {
    id: 'oportunidades',
    label: 'Oportunidades',
    items: [
      {
        id: 'jobs',
        label: 'Bolsa de Trabajo',
        href: '/jobs',
        icon: Building2,
        description: 'Empleos en la industria creativa',
        badge: 'Próximamente'
      },
      {
        id: 'freelance',
        label: 'Freelance',
        href: '/freelance',
        icon: Briefcase,
        description: 'Servicios y gigs creativos',
        badge: 'Próximamente'
      },
      {
        id: 'proyectos',
        label: 'Proyectos',
        href: '/proyectos',
        icon: Users,
        description: 'Únete a proyectos en equipo',
        badge: 'Próximamente'
      }
    ]
  }
];

// ============================================
// PRIMARY NAV (8 categorías - para mobile drawer)
// ============================================

export const PRIMARY_NAV_ITEMS: NavItem[] = [
  { id: 'home', icon: Home, label: 'Inicio' },
  { id: 'portfolio', icon: ImageIcon, label: 'Portafolio' },
  { id: 'blog', icon: Newspaper, label: 'Blog' },
  { id: 'forum', icon: MessageCircleQuestion, label: 'Foro' },
  { id: 'courses', icon: GraduationCap, label: 'Cursos', comingSoon: true },
  { id: 'freelance', icon: Briefcase, label: 'Freelance', comingSoon: true },
  { id: 'jobs', icon: Building2, label: 'Bolsa de Trabajo', comingSoon: true },
  { id: 'proyectos', icon: Users, label: 'Proyectos', comingSoon: true },
  { id: 'concursos', icon: Trophy, label: 'Concursos', comingSoon: true },
];

// ============================================
// MOBILE BOTTOM NAV
// ============================================

export interface BottomNavItem {
  id: string;
  icon: LucideIcon;
  label: string;
  href?: string;
  action?: 'menu' | 'create';
}

export const BOTTOM_NAV_ITEMS: BottomNavItem[] = [
  { id: 'home', icon: Home, label: 'Inicio', href: '/' },
  { id: 'explore', icon: Compass, label: 'Explorar', action: 'menu' },
  { id: 'create', icon: Folder, label: 'Crear', action: 'create' },
  { id: 'profile', icon: Users, label: 'Perfil', href: '/settings' },
];

// ============================================
// SECONDARY SIDEBAR ITEMS (CREATIVE)
// ============================================

export const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Descubrir',
    items: [
      { icon: Compass, label: 'Inicio', slug: 'home', subLabel: 'Para ti', active: true },
      { icon: Flame, label: 'Tendencias', slug: 'tendencias', subLabel: 'Viral hoy' },
      { icon: Clock, label: 'Nuevos', slug: 'nuevos', subLabel: 'Recién salidos' },
    ]
  },
  {
    title: '3D & CGI',
    items: [
      { icon: Move3d, label: 'Modelado 3D', slug: 'modelado-3d', subLabel: 'Hard Surface, Organic', subItems: ['Blender', 'Maya', '3ds Max', 'Cinema 4D', 'Houdini'] },
      { icon: Cuboid, label: 'Escultura', slug: 'escultura', subLabel: 'ZBrush, Mudbox', subItems: ['ZBrush', 'Mudbox', 'Blender Sculpt', '3DCoat'] },
      { icon: Brush, label: 'Texturizado', slug: 'texturizado', subLabel: 'Substance, Mari', subItems: ['Substance Painter', 'Mari', 'Marmoset Toolbag', 'Quixel Mixer'] },
      { icon: Users, label: 'ArchViz', slug: 'archviz', subLabel: 'Interiores, Arquitectura', subItems: ['V-Ray', 'Corona', 'Lumion', 'Twinmotion', 'D5 Render'] },
    ]
  },
  {
    title: 'Animación & Cine',
    items: [
      { icon: MonitorPlay, label: 'Animación 3D', slug: 'animacion-3d', subLabel: 'Personajes, Rigging', subItems: ['Maya', 'Blender', 'iClone', 'Cascadeur'] },
      { icon: Clapperboard, label: 'Animación 2D', slug: 'animacion-2d', subLabel: 'Tradicional, Cut-out', subItems: ['Toon Boom Harmony', 'TVPaint', 'After Effects', 'Moho'] },
      { icon: Box, label: 'VFX', slug: 'vfx', subLabel: 'Simulaciones, Comp', subItems: ['Nuke', 'Houdini', 'After Effects', 'Fusion'] },
      { icon: Camera, label: 'Motion Graphics', slug: 'motion-graphics', subLabel: 'Publicidad, Title Seq', subItems: ['After Effects', 'Cinema 4D', 'Rive', 'Cavalry'] },
    ]
  },
  {
    title: 'Desarrollo de Juegos',
    items: [
      { icon: Gamepad2, label: 'Desarrollo de Juegos', slug: 'game-dev', subLabel: 'Unity, Unreal', subItems: ['Unreal Engine', 'Unity', 'Godot', 'GameMaker'] },
      { icon: Lightbulb, label: 'Diseño de Niveles', slug: 'level-design', subLabel: 'Entornos, Lighting', subItems: ['Unreal Engine', 'Unity', 'Hammer'] },
    ]
  },
  {
    title: 'Arte 2D',
    items: [
      { icon: Palette, label: 'Arte Conceptual', slug: 'concept-art', subLabel: 'Personajes, Fondos', subItems: ['Photoshop', 'Procreate', 'Clip Studio Paint', 'Krita'] },
      { icon: PenTool, label: 'Ilustración', slug: 'ilustracion', subLabel: 'Digital, Vectorial', subItems: ['Illustrator', 'Affinity Designer', 'Inkscape'] },
    ]
  }
];

// ============================================
// SECONDARY SIDEBAR ITEMS (DEVELOPER)
// ============================================

export const NAV_SECTIONS_DEV: NavSection[] = [
  {
    title: 'Descubrir',
    items: [
      { icon: Compass, label: 'Inicio', slug: 'home', subLabel: 'Feed Tech', active: true },
      { icon: Flame, label: 'Tendencias', slug: 'tendencias', subLabel: 'GitHub Stars' },
      { icon: Clock, label: 'Nuevos', slug: 'nuevos', subLabel: 'Lanzamientos' },
    ]
  },
  {
    title: 'Desarrollo Web',
    items: [
      { icon: Code, label: 'Frontend', slug: 'frontend', subLabel: 'React, Vue, Angular', subItems: ['React', 'Vue', 'Angular', 'Svelte', 'Next.js'] },
      { icon: Server, label: 'Backend', slug: 'backend', subLabel: 'Node, Python, Go', subItems: ['Node.js', 'Python', 'Go', 'Java', 'PHP'] },
      { icon: Palette, label: 'UI/UX Code', slug: 'ui-ux-code', subLabel: 'CSS, Tailwind, Animation', subItems: ['Tailwind CSS', 'Framer Motion', 'GSAP', 'Three.js'] },
    ]
  },
  {
    title: 'Infraestructura',
    items: [
      { icon: Cloud, label: 'DevOps', slug: 'devops', subLabel: 'AWS, Docker, K8s', subItems: ['Docker', 'Kubernetes', 'AWS', 'Azure', 'Terraform'] },
      { icon: Database, label: 'Base de Datos', slug: 'base-de-datos', subLabel: 'SQL, NoSQL, Redis', subItems: ['PostgreSQL', 'MongoDB', 'Redis', 'MySQL', 'Supabase'] },
    ]
  },
  {
    title: 'Emergentes',
    items: [
      { icon: Cpu, label: 'AI & ML', slug: 'ai-ml', subLabel: 'LLMs, PyTorch, TensorFlow', subItems: ['Python', 'PyTorch', 'TensorFlow', 'OpenAI API'] },
      { icon: Smartphone, label: 'Desarrollo Móvil', slug: 'mobile-dev', subLabel: 'iOS, Android, React Native', subItems: ['React Native', 'Flutter', 'Swift', 'Kotlin'] },
      { icon: Gamepad2, label: 'Código de Juegos', slug: 'game-code', subLabel: 'C++, C#, Shaders', subItems: ['C++', 'C#', 'HLSL/GLSL', 'Lua'] },
    ]
  }
];

export const CATEGORY_ITEMS: CategoryItem[] = NAV_SECTIONS.flatMap(section => section.items);

// ============================================
// HEADER CHIPS
// ============================================

const GENERAL_CHIPS: Chip[] = [
  { id: 'g1', label: 'Blender', image: 'https://ih1.redbubble.net/image.5193480187.3281/bg,f8f8f8-flat,750x,075,f-pad,750x1000,f8f8f8.webp?w=800&q=80', active: true },
  { id: 'g2', label: 'Cinema 4D', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60' },
  { id: 'g3', label: 'Unreal Engine', image: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=100&auto=format&fit=crop&q=60' },
  { id: 'g4', label: 'After Effects', image: 'https://images.unsplash.com/photo-1626785774573-4b799314346d?w=100&auto=format&fit=crop&q=60' },
  { id: 'g11', label: 'Otros programas' },
];

export const CATEGORY_CHIPS_MAP: Record<string, Chip[]> = {
  'Inicio': GENERAL_CHIPS,
};
