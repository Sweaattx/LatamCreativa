'use client';

import { Users, Sparkles, FolderOpen, Clock, Star, ArrowRight, Search, Filter, Plus } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAppStore } from '@/hooks/useAppStore';

// Placeholder data structure for future implementation
const FEATURED_PROJECT = {
    id: '1',
    title: 'Cortometraje Animado: "Raíces"',
    description: 'Buscamos animadores 2D/3D, ilustradores de fondos y compositores musicales para un cortometraje sobre identidad cultural latinoamericana.',
    image: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&auto=format&fit=crop&q=80',
    roles: ['Animador 3D', 'Ilustrador', 'Compositor'],
    members: 8,
    deadline: '15 días restantes',
    category: 'Animación'
};

const PROJECT_CATEGORIES = [
    { id: 'all', label: 'Todos', count: 24 },
    { id: 'animation', label: 'Animación', count: 8 },
    { id: '3d', label: '3D & CGI', count: 6 },
    { id: 'game', label: 'Videojuegos', count: 5 },
    { id: 'film', label: 'Cine', count: 3 },
    { id: 'design', label: 'Diseño', count: 2 },
];

export default function ProyectosPage() {
    const { state } = useAppStore();
    const isDevMode = state.contentMode === 'dev';

    return (
        <div className="min-h-screen bg-dark-1">
            {/* Hero */}
            <div className="relative overflow-hidden border-b border-dark-5/50">
                <div className={`absolute inset-0 bg-gradient-to-br ${isDevMode ? 'from-dev-500/5 via-transparent to-dev-400/5' : 'from-accent-500/5 via-transparent to-accent-400/5'}`} />

                <div className="relative max-w-7xl mx-auto px-4 lg:px-8 py-16">
                    <div className="text-center mb-12">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 ${isDevMode ? 'bg-dev-500/10 text-dev-400' : 'bg-accent-500/10 text-accent-400'} rounded-full text-sm font-medium mb-6`}>
                            <Sparkles className="w-4 h-4" />
                            Colabora con la comunidad
                        </div>
                        <h1 className="text-4xl md:text-5xl font-light text-content-1 mb-4">
                            Proyectos Colaborativos
                        </h1>
                        <p className="text-xl text-content-3 max-w-2xl mx-auto">
                            Únete a proyectos creativos, encuentra colaboradores y construye tu portafolio trabajando en equipo.
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="flex justify-center gap-12 text-center">
                        <div>
                            <div className="text-2xl font-light text-content-1">24</div>
                            <div className="text-sm text-content-3">Proyectos activos</div>
                        </div>
                        <div>
                            <div className="text-2xl font-light text-content-1">156</div>
                            <div className="text-sm text-content-3">Colaboradores</div>
                        </div>
                        <div>
                            <div className="text-2xl font-light text-content-1">12</div>
                            <div className="text-sm text-content-3">Roles disponibles</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Coming Soon Content */}
            <div className="max-w-7xl mx-auto px-4 lg:px-8 py-16">

                {/* Featured Project Preview */}
                <div className="mb-16">
                    <h2 className="text-lg font-medium text-content-1 mb-6 flex items-center gap-2">
                        <Star className={`w-5 h-5 ${isDevMode ? 'text-dev-400' : 'text-accent-500'}`} />
                        Proyecto Destacado
                    </h2>

                    <div className="relative rounded-2xl overflow-hidden bg-dark-2 border border-dark-5">
                        <div className="aspect-[21/9] relative">
                            <Image
                                src={FEATURED_PROJECT.image}
                                alt={FEATURED_PROJECT.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 80vw, 1200px"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-dark-2 via-dark-2/50 to-transparent" />
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                            <div className="flex flex-wrap gap-2 mb-3">
                                {FEATURED_PROJECT.roles.map((role) => (
                                    <span
                                        key={role}
                                        className={`px-2.5 py-1 text-xs font-medium rounded-full ${isDevMode ? 'bg-dev-500/20 text-dev-400' : 'bg-accent-500/20 text-accent-400'}`}
                                    >
                                        {role}
                                    </span>
                                ))}
                            </div>

                            <h3 className="text-2xl font-light text-content-1 mb-2">
                                {FEATURED_PROJECT.title}
                            </h3>
                            <p className="text-content-2 mb-4 max-w-2xl">
                                {FEATURED_PROJECT.description}
                            </p>

                            <div className="flex items-center gap-6 text-sm text-content-3">
                                <span className="flex items-center gap-1.5">
                                    <Users className="w-4 h-4" />
                                    {FEATURED_PROJECT.members} miembros
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Clock className="w-4 h-4" />
                                    {FEATURED_PROJECT.deadline}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Coming Soon Notice */}
                <div className={`rounded-2xl border ${isDevMode ? 'border-dev-500/30 bg-dev-500/5' : 'border-accent-500/30 bg-accent-500/5'} p-8 text-center`}>
                    <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl ${isDevMode ? 'bg-dev-500/20' : 'bg-accent-500/20'} flex items-center justify-center`}>
                        <FolderOpen className={`w-8 h-8 ${isDevMode ? 'text-dev-400' : 'text-accent-500'}`} />
                    </div>

                    <h2 className="text-2xl font-light text-content-1 mb-3">
                        Próximamente
                    </h2>
                    <p className="text-content-2 max-w-lg mx-auto mb-6">
                        Estamos construyendo una plataforma donde podrás crear proyectos, buscar colaboradores por habilidades,
                        y trabajar juntos en tiempo real. ¡Muy pronto!
                    </p>

                    <div className="flex flex-wrap justify-center gap-4">
                        <span className="px-4 py-2 bg-dark-3 rounded-lg text-sm text-content-2">
                            🎯 Publicar proyectos
                        </span>
                        <span className="px-4 py-2 bg-dark-3 rounded-lg text-sm text-content-2">
                            🔍 Buscar colaboradores
                        </span>
                        <span className="px-4 py-2 bg-dark-3 rounded-lg text-sm text-content-2">
                            💬 Chat de equipo
                        </span>
                        <span className="px-4 py-2 bg-dark-3 rounded-lg text-sm text-content-2">
                            📁 Compartir archivos
                        </span>
                    </div>
                </div>

                {/* Categories Preview */}
                <div className="mt-16">
                    <h2 className="text-lg font-medium text-content-1 mb-6">
                        Categorías de proyectos
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {PROJECT_CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                className="p-4 rounded-xl bg-dark-2 border border-dark-5 hover:border-dark-6 transition-colors text-left group"
                            >
                                <div className="text-sm font-medium text-content-1 group-hover:text-content-1">
                                    {cat.label}
                                </div>
                                <div className="text-xs text-content-3 mt-1">
                                    {cat.count} proyectos
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
