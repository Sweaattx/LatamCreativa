'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Users, Sparkles, FolderOpen, Clock, Star, ArrowRight,
    Search, Plus, MapPin, Code2, Paintbrush, Film, Gamepad2, Music
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useAppStore } from '@/hooks/useAppStore';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { collabProjectsService } from '@/services/supabase/collabProjects';

const ROLE_ICONS: Record<string, React.ElementType> = {
    'Animador 3D': Film,
    'Ilustrador': Paintbrush,
    'Compositor': Music,
    'Desarrollador': Code2,
    'Game Designer': Gamepad2,
    'Director': Film,
    'Modelador 3D': Sparkles,
    'Sonidista': Music,
};

const PROJECTS = [
    {
        id: '1',
        title: 'Cortometraje Animado: "Raíces"',
        description: 'Buscamos animadores 2D/3D, ilustradores de fondos y compositores musicales para un cortometraje sobre identidad cultural latinoamericana.',
        image: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&auto=format&fit=crop&q=80',
        roles: ['Animador 3D', 'Ilustrador', 'Compositor'],
        members: 8,
        maxMembers: 12,
        deadline: '15 días',
        category: 'Animación',
        author: { name: 'Carlos M.', avatar: 'https://ui-avatars.com/api/?name=Carlos+M&background=6366f1&color=fff' },
        status: 'open' as const,
    },
    {
        id: '2',
        title: 'App Móvil: Guía Turística AR',
        description: 'Proyecto de realidad aumentada para turismo en ciudades históricas de LATAM. Buscamos desarrolladores Flutter y diseñadores UI.',
        image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=80',
        roles: ['Desarrollador', 'Ilustrador'],
        members: 4,
        maxMembers: 8,
        deadline: '30 días',
        category: 'Desarrollo',
        author: { name: 'Ana T.', avatar: 'https://ui-avatars.com/api/?name=Ana+T&background=ec4899&color=fff' },
        status: 'open' as const,
    },
    {
        id: '3',
        title: 'Videojuego Indie: "Selva Mágica"',
        description: 'RPG 2D ambientado en la selva amazónica con mecánicas de exploración y magia natural.',
        image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
        roles: ['Game Designer', 'Ilustrador', 'Compositor'],
        members: 6,
        maxMembers: 10,
        deadline: '45 días',
        category: 'Videojuegos',
        author: { name: 'Diego F.', avatar: 'https://ui-avatars.com/api/?name=Diego+F&background=10b981&color=fff' },
        status: 'open' as const,
    },
    {
        id: '4',
        title: 'Documental: "Sonidos de LATAM"',
        description: 'Serie documental sobre la diversidad musical de Latinoamérica. Producción independiente.',
        image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&auto=format&fit=crop&q=80',
        roles: ['Director', 'Sonidista', 'Ilustrador'],
        members: 5,
        maxMembers: 8,
        deadline: '20 días',
        category: 'Cine',
        author: { name: 'Lucía R.', avatar: 'https://ui-avatars.com/api/?name=Lucia+R&background=f59e0b&color=fff' },
        status: 'open' as const,
    },
    {
        id: '5',
        title: 'Visualización 3D: Ciudad del Futuro',
        description: 'Proyecto de architectural visualization imaginando ciudades sostenibles en 2050.',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
        roles: ['Modelador 3D', 'Ilustrador'],
        members: 3,
        maxMembers: 6,
        deadline: '25 días',
        category: '3D & CGI',
        author: { name: 'Pedro S.', avatar: 'https://ui-avatars.com/api/?name=Pedro+S&background=8b5cf6&color=fff' },
        status: 'open' as const,
    },
    {
        id: '6',
        title: 'Plataforma E-learning de Arte',
        description: 'Construyendo una plataforma de cursos creativos con contenido interactivo y comunidad integrada.',
        image: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&auto=format&fit=crop&q=80',
        roles: ['Desarrollador', 'Ilustrador'],
        members: 7,
        maxMembers: 7,
        deadline: 'Completo',
        category: 'Desarrollo',
        author: { name: 'Sofía L.', avatar: 'https://ui-avatars.com/api/?name=Sofia+L&background=ef4444&color=fff' },
        status: 'full' as const,
    },
];

const CATEGORIES = ['Todos', 'Animación', 'Desarrollo', 'Videojuegos', 'Cine', '3D & CGI'];

export default function ProyectosPage() {
    const { state } = useAppStore();
    const isDevMode = state.contentMode === 'dev';
    const [sectionRef, isVisible] = useScrollReveal<HTMLDivElement>();
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [searchQuery, setSearchQuery] = useState('');
    const [projects, setProjects] = useState<Array<{ id: string; title: string; description: string; image: string; roles: string[]; members: number; maxMembers: number; deadline: string; category: string; author: { name: string; avatar: string }; status: string }>>(PROJECTS);

    const fetchProjects = useCallback(async () => {
        try {
            const data = await collabProjectsService.getAll();
            if (data.length > 0) {
                setProjects(data.map(p => ({
                    id: p.id,
                    title: p.title,
                    description: p.description || '',
                    image: p.image || 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&auto=format&fit=crop&q=80',
                    roles: p.roles_needed,
                    members: p.members,
                    maxMembers: p.max_members,
                    deadline: p.deadline || '',
                    category: p.category,
                    author: { name: p.author_name || 'Creador', avatar: p.author_avatar || 'https://ui-avatars.com/api/?name=C&background=6366f1&color=fff' },
                    status: p.status as 'open' | 'full' | 'in_progress' | 'completed',
                })));
            }
        } catch { /* fallback to mock */ }
    }, []);

    useEffect(() => { fetchProjects(); }, [fetchProjects]);

    const accentColor = isDevMode ? 'text-dev-400' : 'text-accent-500';
    const accentBg = isDevMode ? 'bg-dev-500' : 'bg-accent-500';
    const accentBgSubtle = isDevMode ? 'bg-dev-500/10' : 'bg-accent-500/10';

    const filteredProjects = projects.filter(p => {
        const matchesCat = selectedCategory === 'Todos' || p.category === selectedCategory;
        const matchesSearch = searchQuery === '' ||
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.roles.some(r => r.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCat && matchesSearch;
    });

    const openProjects = PROJECTS.filter(p => p.status === 'open').length;
    const totalRoles = PROJECTS.reduce((acc, p) => acc + p.roles.length, 0);

    return (
        <div className="min-h-screen bg-dark-1">
            {/* Hero */}
            <div className="relative overflow-hidden border-b border-dark-5/50">
                <div className={`absolute inset-0 bg-gradient-to-br ${isDevMode ? 'from-dev-500/5 via-transparent to-dev-400/3' : 'from-accent-500/5 via-transparent to-accent-400/3'}`} />
                <div className="relative max-w-6xl mx-auto px-6 py-14">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                        <div>
                            <span className={`text-xs uppercase tracking-widest mb-2 block ${accentColor}`}>Colabora con la comunidad</span>
                            <h1 className="text-3xl md:text-4xl font-extralight text-content-1 mb-2">
                                Proyectos Colaborativos
                            </h1>
                            <p className="text-content-2 max-w-lg">
                                Únete a proyectos creativos, encuentra colaboradores y construye tu portafolio trabajando en equipo.
                            </p>
                        </div>
                        <div className="flex gap-6 text-center">
                            <div>
                                <div className="text-2xl font-light text-content-1">{openProjects}</div>
                                <div className="text-xs text-content-3">Abiertos</div>
                            </div>
                            <div>
                                <div className="text-2xl font-light text-content-1">{PROJECTS.reduce((a, p) => a + p.members, 0)}</div>
                                <div className="text-xs text-content-3">Colaboradores</div>
                            </div>
                            <div>
                                <div className={`text-2xl font-light ${accentColor}`}>{totalRoles}</div>
                                <div className="text-xs text-content-3">Roles</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-12" ref={sectionRef}>

                {/* Filters + search */}
                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-3" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Buscar por título, rol o descripción..."
                            className="w-full h-10 pl-9 pr-4 bg-dark-2 border border-dark-5 rounded-xl text-sm text-content-1 placeholder:text-content-3 focus:outline-none focus:border-accent-500/50 transition-colors"
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${selectedCategory === cat
                                    ? `${accentBgSubtle} ${accentColor} font-medium`
                                    : 'text-content-3 hover:text-content-1 hover:bg-dark-3/50'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Project cards — 2-col layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-12">
                    {filteredProjects.map((project, i) => {
                        const isFull = project.status === 'full';
                        return (
                            <motion.div
                                key={project.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.3, delay: i * 0.06 }}
                            >
                                <div className={`group rounded-xl overflow-hidden bg-dark-2/30 border transition-all ${isFull ? 'border-dark-5/30 opacity-70' : 'border-dark-5/50 hover:border-dark-6 cursor-pointer'
                                    }`}>
                                    {/* Image + overlay */}
                                    <div className="aspect-[2.5/1] relative">
                                        <Image src={project.image} alt={project.title} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.02]" sizes="50vw" />
                                        <div className="absolute inset-0 bg-gradient-to-r from-dark-0/80 via-dark-0/40 to-transparent" />

                                        <div className="absolute inset-0 p-5 flex flex-col justify-between">
                                            {/* Top: Status + category */}
                                            <div className="flex items-center justify-between">
                                                <span className={`px-2 py-0.5 text-2xs font-medium uppercase tracking-wider rounded-full ${isFull ? 'bg-dark-3/80 text-content-3' : 'bg-emerald-500/20 text-emerald-400'
                                                    }`}>
                                                    {isFull ? 'Completo' : 'Abierto'}
                                                </span>
                                                <span className="text-2xs text-content-3 bg-dark-0/50 backdrop-blur-sm px-2 py-0.5 rounded-full">{project.category}</span>
                                            </div>

                                            {/* Bottom: Title + meta */}
                                            <div>
                                                <h3 className="text-lg font-medium text-content-1 mb-1 line-clamp-1 group-hover:text-accent-400 transition-colors">
                                                    {project.title}
                                                </h3>
                                                <div className="flex items-center gap-4 text-xs text-content-3">
                                                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {project.members}/{project.maxMembers}</span>
                                                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {project.deadline}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-5">
                                        <p className="text-sm text-content-2 line-clamp-2 mb-4">{project.description}</p>

                                        {/* Roles needed */}
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {project.roles.map(role => {
                                                const RoleIcon = ROLE_ICONS[role] || Sparkles;
                                                return (
                                                    <span key={role} className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-dark-3/50 text-content-2 rounded-lg">
                                                        <RoleIcon className="w-3 h-3" /> {role}
                                                    </span>
                                                );
                                            })}
                                        </div>

                                        {/* Author + CTA */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Image src={project.author.avatar} alt="" width={24} height={24} className="rounded-full" unoptimized />
                                                <span className="text-xs text-content-2">{project.author.name}</span>
                                            </div>
                                            {!isFull && (
                                                <button className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${accentBgSubtle} ${accentColor} hover:bg-opacity-20`}>
                                                    Unirse
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {filteredProjects.length === 0 && (
                    <div className="text-center py-16 mb-12">
                        <FolderOpen className="w-12 h-12 text-content-3/30 mx-auto mb-3" />
                        <p className="text-content-2">No se encontraron proyectos con esos filtros</p>
                    </div>
                )}

                {/* CTA — propose */}
                <div className="text-center py-8">
                    <p className="text-content-3 text-sm mb-4">¿Tienes una idea? Propón tu proyecto a la comunidad</p>
                    <button className={`inline-flex items-center gap-2 h-11 px-6 rounded-full text-sm font-medium text-white transition-colors ${accentBg} hover:opacity-90`}>
                        <Plus className="w-4 h-4" />
                        Proponer proyecto
                    </button>
                </div>
            </div>
        </div>
    );
}
