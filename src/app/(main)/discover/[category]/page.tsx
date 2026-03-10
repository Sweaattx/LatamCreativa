'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Heart, Eye, MessageCircle, SlidersHorizontal,
    Flame, Clock, Compass, TrendingUp, Grid, List,
    Sparkles, Filter, ArrowUpDown, ChevronDown,
} from 'lucide-react';
import { NAV_SECTIONS, NAV_SECTIONS_DEV } from '@/data/navigation';

// ============================================
// RICH MOCK DATA PER CATEGORY
// ============================================

interface MockProject {
    id: string;
    title: string;
    artist: string;
    artistAvatar: string;
    image: string;
    category: string;
    likes: number;
    views: number;
    comments: number;
    featured?: boolean;
    tools?: string[];
    createdAt: string;
}

const IMAGES = [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=80',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',
    'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=600&q=80',
    'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=600&q=80',
    'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=600&q=80',
    'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&q=80',
    'https://images.unsplash.com/photo-1555421689-d68471e189f2?w=600&q=80',
    'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=600&q=80',
    'https://images.unsplash.com/photo-1581291518633-83b4eef1d2fa?w=600&q=80',
    'https://images.unsplash.com/photo-1558655146-d09347e92766?w=600&q=80',
    'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=600&q=80',
];

const ARTISTS = [
    { name: 'María García', avatar: 'https://ui-avatars.com/api/?name=Maria+Garcia&background=ec4899&color=fff' },
    { name: 'Carlos Mendoza', avatar: 'https://ui-avatars.com/api/?name=Carlos+Mendoza&background=6366f1&color=fff' },
    { name: 'Ana López', avatar: 'https://ui-avatars.com/api/?name=Ana+Lopez&background=f59e0b&color=fff' },
    { name: 'Diego Fernández', avatar: 'https://ui-avatars.com/api/?name=Diego+Fernandez&background=10b981&color=fff' },
    { name: 'Valentina Ríos', avatar: 'https://ui-avatars.com/api/?name=Valentina+Rios&background=06b6d4&color=fff' },
    { name: 'Sebastián Mora', avatar: 'https://ui-avatars.com/api/?name=Sebastian+Mora&background=ef4444&color=fff' },
    { name: 'Camila Herrera', avatar: 'https://ui-avatars.com/api/?name=Camila+Herrera&background=a855f7&color=fff' },
    { name: 'Andrés Velasco', avatar: 'https://ui-avatars.com/api/?name=Andres+Velasco&background=14b8a6&color=fff' },
];

// Category-specific project titles
const CATEGORY_TITLES: Record<string, string[]> = {
    'home': ['Reel Showdown 2024', 'Cena para dos — Blender Cycles', 'Dashboard UI Fintech', 'Mural digital Quito', 'Motion Reel Primavera', 'App Concept RunLatam', 'Brand Identity Café Austral', 'Ilustración Sci-Fi Bogotá'],
    'tendencias': ['Viral: Robot Dreams Fan Art', 'Trending: Neon Cityscapes', 'Hot: Minimalist App UI', 'Viral: 3D Typography', 'Trending: Isometric Worlds', 'Hot: Dark Mode Portfolio'],
    'nuevos': ['Debut: Primer Render en Blender', 'Nuevo: Landing Page SaaS', 'Fresh: Logo para Startup', 'Debut: Animación Stop Motion', 'Nuevo: Dashboard Analytics', 'Fresh: Tipografía Experimental'],
    'modelado-3d': ['Character Turntable — Cyber Samurai', 'Hard Surface Vehicle Concept', 'Organic Sculpt — Forest Guardian', 'Sci-Fi Helmet — PBR Ready', 'Low Poly Environment Pack', 'Mech Design — Industrial', 'Robot Companion Pet', 'Fantasy Weapon Set'],
    'escultura': ['ZBrush Dragon Bust', 'Digital Sculpture — Poseidon', 'Creature Design — Deep Sea', 'Portrait Study — Clay Render', 'Anatomy Study — Dynamic Pose', 'Stylized Character Head'],
    'texturizado': ['PBR Material Study — Rusted Metal', 'Substance Painter — Sci-Fi Prop', 'Hand-Painted Texture Pack', 'Realistic Skin Shader', 'Weathered Wood Collection', 'Fabric Material Library'],
    'archviz': ['Penthouse Interior — V-Ray', 'Modern Villa Exterior', 'Urban Apartment Concept', 'Restaurant Design — Lumion', 'Office Space Visualization', 'Museum Gallery Render'],
    'animacion-3d': ['Walk Cycle Study — Bipedal Robot', 'Character Rig Demo Reel', 'Physics Simulation — Cloth', 'Facial Animation Test', 'Action Sequence — Chase', 'Dance Motion Capture Edit'],
    'animacion-2d': ['Frame by Frame — Rain Scene', 'Cut-Out Animation — Music Video', 'Traditional Style — Water Effect', 'Character Expression Sheet', 'Parallax Scrolling Demo', 'Animated Short — Solitude'],
    'vfx': ['Explosion FX Breakdown', 'Particle System — Magic Spell', 'Compositing Demo Reel', 'Fluid Simulation — Ocean', 'Destruction Sequence', 'Weather Effects Pack'],
    'motion-graphics': ['Title Sequence — Documentary', 'Social Media Promo Pack', 'Logo Reveal — Metallic', 'Infographic Animation', 'Event Opener — Conference', 'Product Launch Video'],
    'game-dev': ['RPG Prototype — Unreal Engine', 'Platformer Mechanics — Unity', 'Shader Graph — Stylized Water', 'Procedural Generation Demo', 'Inventory UI System', 'Multiplayer Lobby Design'],
    'level-design': ['Sci-Fi Corridor — UE5', 'Fantasy Village Layout', 'Horror Atmosphere — Lighting', 'Open World Terrain', 'Puzzle Room Design', 'Arena Map — Competitive'],
    'concept-art': ['Character Design — Post-Apocalyptic', 'Environment Concept — Floating City', 'Creature Design — Mythical', 'Weapon Concept Sheet', 'Vehicle Design — Cyberpunk', 'Costume Study — Historical'],
    'ilustracion': ['Editorial Illustration — Climate', 'Childrens Book Spread', 'Portrait Series — Latam Women', 'Botanical Illustration Set', 'Pattern Design — Geometric', 'Poster Art — Festival'],
    // Dev categories
    'frontend': ['React Dashboard Component Kit', 'Vue.js E-commerce Template', 'Next.js Portfolio Starter', 'Svelte Animation Playground', 'Angular Material Admin', 'Tailwind UI Components'],
    'backend': ['Node.js REST API Boilerplate', 'Python FastAPI + PostgreSQL', 'Go Microservice Architecture', 'GraphQL Server Template', 'Redis Caching Layer', 'JWT Auth System'],
    'ui-ux-code': ['Framer Motion Page Transitions', 'CSS Grid Masonry Layout', 'Three.js Product Viewer', 'GSAP Scroll Animations', 'Tailwind Dark Mode System', 'Rive Interactive Buttons'],
    'devops': ['Docker Compose Multi-Service', 'Kubernetes Helm Charts', 'CI/CD Pipeline — GitHub Actions', 'Terraform AWS Infrastructure', 'Monitoring Stack — Grafana', 'Blue-Green Deployment'],
    'base-de-datos': ['PostgreSQL Schema Migration', 'MongoDB Aggregation Pipelines', 'Redis Pub/Sub Messaging', 'Supabase Real-Time App', 'Database Optimization Guide', 'SQL Query Performance'],
    'ai-ml': ['LLM Fine-Tuning Pipeline', 'Image Classification — PyTorch', 'RAG System — LangChain', 'Computer Vision — Object Detection', 'NLP Sentiment Analysis', 'Stable Diffusion Integration'],
    'mobile-dev': ['React Native Social App', 'Flutter E-commerce UI', 'Swift iOS Weather App', 'Kotlin Android Camera', 'Expo Notification System', 'Cross-Platform Auth Flow'],
    'game-code': ['C++ Game Engine Architecture', 'Unity C# Inventory System', 'GLSL Shader Collection', 'Godot GDScript Platformer', 'Lua Gameplay Scripting', 'Physics Engine Implementation'],
};

function generateMockProjects(categorySlug: string): MockProject[] {
    const titles = CATEGORY_TITLES[categorySlug] || CATEGORY_TITLES['home'] || [];
    const tools = getCategoryTools(categorySlug);

    return titles.map((title, i) => ({
        id: `${categorySlug}-${i}`,
        title,
        artist: ARTISTS[i % ARTISTS.length].name,
        artistAvatar: ARTISTS[i % ARTISTS.length].avatar,
        image: IMAGES[i % IMAGES.length],
        category: getCategoryLabel(categorySlug),
        likes: Math.floor(Math.random() * 800) + 50,
        views: Math.floor(Math.random() * 5000) + 200,
        comments: Math.floor(Math.random() * 60) + 2,
        featured: i === 0,
        tools: tools.slice(0, 3 + (i % 2)),
        createdAt: new Date(Date.now() - i * 86400000 * 3).toISOString(),
    }));
}

function getCategoryLabel(slug: string): string {
    const allSections = [...NAV_SECTIONS, ...NAV_SECTIONS_DEV];
    for (const section of allSections) {
        for (const item of section.items) {
            if (item.slug === slug) return item.label;
        }
    }
    return slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function getCategoryTools(slug: string): string[] {
    const allSections = [...NAV_SECTIONS, ...NAV_SECTIONS_DEV];
    for (const section of allSections) {
        for (const item of section.items) {
            if (item.slug === slug && item.subItems) return item.subItems;
        }
    }
    return [];
}

function getCategoryInfo(slug: string) {
    const allSections = [...NAV_SECTIONS, ...NAV_SECTIONS_DEV];
    for (const section of allSections) {
        for (const item of section.items) {
            if (item.slug === slug) {
                return { label: item.label, subLabel: item.subLabel || '', sectionTitle: section.title, icon: item.icon };
            }
        }
    }
    return { label: getCategoryLabel(slug), subLabel: '', sectionTitle: 'Descubrir', icon: Compass };
}

// ============================================
// SORT / VIEW OPTIONS
// ============================================
type SortMode = 'recent' | 'popular' | 'trending';
type ViewMode = 'grid' | 'list';

const SORT_OPTIONS: { id: SortMode; label: string; icon: React.ElementType }[] = [
    { id: 'recent', label: 'Recientes', icon: Clock },
    { id: 'popular', label: 'Populares', icon: TrendingUp },
    { id: 'trending', label: 'Tendencias', icon: Flame },
];

// ============================================
// MAIN COMPONENT
// ============================================
export default function DiscoverCategoryPage() {
    const params = useParams();
    const categorySlug = String(params.category || 'home');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortMode, setSortMode] = useState<SortMode>('recent');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [showTools, setShowTools] = useState(false);
    const [selectedTool, setSelectedTool] = useState<string | null>(null);

    const info = getCategoryInfo(categorySlug);
    const Icon = info.icon;
    const tools = getCategoryTools(categorySlug);

    const projects = useMemo(() => {
        let items = generateMockProjects(categorySlug);

        if (searchQuery) {
            items = items.filter(p =>
                p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.artist.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (selectedTool) {
            items = items.filter(p => p.tools?.includes(selectedTool));
        }

        switch (sortMode) {
            case 'popular': items.sort((a, b) => b.likes - a.likes); break;
            case 'trending': items.sort((a, b) => b.views - a.views); break;
            default: break;
        }

        return items;
    }, [categorySlug, searchQuery, sortMode, selectedTool]);

    const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n;

    return (
        <div className="min-h-screen bg-dark-0">
            {/* Category Header */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="relative overflow-hidden border-b border-dark-5/50"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-accent-500/5 via-transparent to-dev-500/5" />
                <div className="relative max-w-7xl mx-auto px-4 lg:px-8 py-10 sm:py-14">
                    <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-accent-500/10 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-6 h-6 text-accent-400" strokeWidth={1.5} />
                        </div>
                        <div>
                            <p className="text-xs text-content-3 font-medium uppercase tracking-wider mb-1">{info.sectionTitle}</p>
                            <h1 className="text-3xl sm:text-4xl font-light text-content-1">{info.label}</h1>
                            {info.subLabel && (
                                <p className="text-content-3 mt-1">{info.subLabel}</p>
                            )}
                        </div>
                    </div>

                    {/* Tool pills */}
                    {tools.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="flex flex-wrap gap-2 mt-4"
                        >
                            {tools.map((tool) => (
                                <button
                                    key={tool}
                                    onClick={() => setSelectedTool(selectedTool === tool ? null : tool)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${selectedTool === tool
                                        ? 'bg-accent-500 text-white'
                                        : 'bg-dark-2 text-content-2 border border-dark-5 hover:border-accent-500/30 hover:text-content-1'
                                        }`}
                                >
                                    {tool}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </div>
            </motion.div>

            {/* Controls Bar */}
            <div className="max-w-7xl mx-auto px-4 lg:px-8 py-5">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-content-3" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar en esta categoría..."
                            className="w-full h-10 pl-10 pr-4 bg-dark-1 border border-dark-5 rounded-xl text-content-1 text-sm placeholder:text-content-3 focus:outline-none focus:border-accent-500/50 transition-colors"
                        />
                    </div>

                    {/* Sort */}
                    <div className="flex items-center gap-2">
                        {SORT_OPTIONS.map((opt) => (
                            <button
                                key={opt.id}
                                onClick={() => setSortMode(opt.id)}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${sortMode === opt.id
                                    ? 'bg-accent-500/10 text-accent-400'
                                    : 'text-content-3 hover:text-content-1 hover:bg-dark-2/50'
                                    }`}
                            >
                                <opt.icon className="w-3.5 h-3.5" /> {opt.label}
                            </button>
                        ))}

                        {/* View toggle */}
                        <div className="flex items-center gap-0.5 ml-2 bg-dark-1 border border-dark-5 rounded-lg p-0.5">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-dark-3 text-content-1' : 'text-content-3 hover:text-content-2'}`}
                            >
                                <Grid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-dark-3 text-content-1' : 'text-content-3 hover:text-content-2'}`}
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Result count */}
                <p className="text-xs text-content-3 mt-3">
                    {projects.length} proyecto{projects.length !== 1 ? 's' : ''} encontrado{projects.length !== 1 ? 's' : ''}
                    {selectedTool && <span className="text-accent-400"> — filtrado por {selectedTool}</span>}
                </p>
            </div>

            {/* Content Grid */}
            <div className="max-w-7xl mx-auto px-4 lg:px-8 pb-16">
                <AnimatePresence mode="wait">
                    {viewMode === 'grid' ? (
                        <motion.div
                            key="grid"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
                        >
                            {projects.map((project, idx) => (
                                <motion.div
                                    key={project.id}
                                    initial={{ opacity: 0, y: 16, scale: 0.97 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ duration: 0.35, delay: idx * 0.04, ease: [0.22, 1, 0.36, 1] }}
                                >
                                    <Link
                                        href={`/portfolio/${project.id}`}
                                        className={`group block rounded-2xl overflow-hidden bg-dark-1 border transition-all duration-300 hover:-translate-y-1 hover:shadow-card ${project.featured
                                            ? 'border-accent-500/25 ring-1 ring-accent-500/10'
                                            : 'border-dark-5/50 hover:border-accent-500/30'
                                            }`}
                                    >
                                        {/* Image */}
                                        <div className="aspect-[4/3] relative overflow-hidden">
                                            <Image
                                                src={project.image}
                                                alt={project.title}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                unoptimized
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-dark-0/90 via-dark-0/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                            {/* Featured badge */}
                                            {project.featured && (
                                                <span className="absolute top-3 left-3 px-2.5 py-1 bg-accent-500/90 text-white text-[10px] font-bold uppercase tracking-wider rounded-md flex items-center gap-1">
                                                    <Sparkles className="w-3 h-3" /> Destacado
                                                </span>
                                            )}

                                            {/* Hover overlay stats */}
                                            <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                                <div className="flex items-center gap-3 text-white/80 text-xs">
                                                    <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {fmt(project.likes)}</span>
                                                    <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {fmt(project.views)}</span>
                                                    <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> {project.comments}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Info */}
                                        <div className="p-3.5">
                                            <h3 className="text-sm font-medium text-content-1 truncate group-hover:text-accent-400 transition-colors">
                                                {project.title}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-2">
                                                <Image
                                                    src={project.artistAvatar}
                                                    alt={project.artist}
                                                    width={20}
                                                    height={20}
                                                    className="rounded-full"
                                                    unoptimized
                                                />
                                                <span className="text-xs text-content-3 truncate">{project.artist}</span>
                                            </div>

                                            {/* Tools */}
                                            {project.tools && project.tools.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2.5">
                                                    {project.tools.slice(0, 2).map((tool) => (
                                                        <span key={tool} className="px-1.5 py-0.5 bg-dark-3 text-content-3 text-[10px] rounded">
                                                            {tool}
                                                        </span>
                                                    ))}
                                                    {project.tools.length > 2 && (
                                                        <span className="px-1.5 py-0.5 bg-dark-3 text-content-3 text-[10px] rounded">
                                                            +{project.tools.length - 2}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-3"
                        >
                            {projects.map((project, idx) => (
                                <motion.div
                                    key={project.id}
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: idx * 0.04 }}
                                >
                                    <Link
                                        href={`/portfolio/${project.id}`}
                                        className={`group flex gap-4 p-4 rounded-2xl bg-dark-1 border transition-all duration-300 hover:bg-dark-2/40 ${project.featured ? 'border-accent-500/25' : 'border-dark-5/50 hover:border-accent-500/30'
                                            }`}
                                    >
                                        <div className="w-28 h-20 rounded-xl overflow-hidden flex-shrink-0 relative">
                                            <Image src={project.image} alt={project.title} fill className="object-cover" unoptimized />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                {project.featured && (
                                                    <span className="px-1.5 py-0.5 bg-accent-500/20 text-accent-400 text-[10px] font-bold rounded">FEATURED</span>
                                                )}
                                                <h3 className="text-sm font-medium text-content-1 truncate group-hover:text-accent-400 transition-colors">
                                                    {project.title}
                                                </h3>
                                            </div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Image src={project.artistAvatar} alt="" width={16} height={16} className="rounded-full" unoptimized />
                                                <span className="text-xs text-content-3">{project.artist}</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-content-3">
                                                <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {fmt(project.likes)}</span>
                                                <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {fmt(project.views)}</span>
                                                <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {project.comments}</span>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Empty state */}
                {projects.length === 0 && (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 rounded-2xl bg-dark-2 flex items-center justify-center mx-auto mb-4">
                            <Filter className="w-8 h-8 text-content-3" />
                        </div>
                        <p className="text-content-2 font-medium">Sin resultados</p>
                        <p className="text-content-3 text-sm mt-1">Intenta cambiar tus filtros o buscar algo diferente.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
