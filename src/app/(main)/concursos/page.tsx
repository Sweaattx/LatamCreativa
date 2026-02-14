'use client';

import { Trophy, Sparkles, Calendar, Users, Clock, Star, Gift, Target, Award, Flame } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAppStore } from '@/hooks/useAppStore';

// Placeholder data for future implementation
const FEATURED_CONTEST = {
    id: '1',
    title: 'Desafío de Character Design 2024',
    description: 'Diseña un personaje original inspirado en la fauna latinoamericana. Los mejores trabajos serán exhibidos en nuestra galería principal.',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80',
    prize: '$500 USD + Exposición',
    deadline: '21 días restantes',
    participants: 47,
    category: 'Ilustración'
};

const PAST_WINNERS = [
    { name: 'María García', avatar: 'https://ui-avatars.com/api/?name=Maria+Garcia&background=ec4899&color=fff', title: 'Ganador - Enero 2024' },
    { name: 'Carlos Ruiz', avatar: 'https://ui-avatars.com/api/?name=Carlos+Ruiz&background=6366f1&color=fff', title: 'Ganador - Diciembre 2023' },
    { name: 'Ana Torres', avatar: 'https://ui-avatars.com/api/?name=Ana+Torres&background=10b981&color=fff', title: 'Ganador - Noviembre 2023' },
];

const CONTEST_TYPES = [
    { id: 'design', label: 'Diseño', icon: Target, count: 5 },
    { id: 'illustration', label: 'Ilustración', icon: Award, count: 8 },
    { id: '3d', label: '3D & CGI', icon: Flame, count: 4 },
    { id: 'animation', label: 'Animación', icon: Star, count: 3 },
];

export default function ConcursosPage() {
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
                            Demuestra tu talento
                        </div>
                        <h1 className="text-4xl md:text-5xl font-light text-content-1 mb-4">
                            Concursos & Desafíos
                        </h1>
                        <p className="text-xl text-content-3 max-w-2xl mx-auto">
                            Participa en competencias creativas, gana premios y destaca tu trabajo ante la comunidad.
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="flex justify-center gap-12 text-center">
                        <div>
                            <div className="text-2xl font-light text-content-1">3</div>
                            <div className="text-sm text-content-3">Concursos activos</div>
                        </div>
                        <div>
                            <div className={`text-2xl font-light ${isDevMode ? 'text-dev-400' : 'text-accent-500'}`}>$2,500</div>
                            <div className="text-sm text-content-3">En premios</div>
                        </div>
                        <div>
                            <div className="text-2xl font-light text-content-1">234</div>
                            <div className="text-sm text-content-3">Participantes</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 lg:px-8 py-16">

                {/* Featured Contest */}
                <div className="mb-16">
                    <h2 className="text-lg font-medium text-content-1 mb-6 flex items-center gap-2">
                        <Trophy className={`w-5 h-5 ${isDevMode ? 'text-dev-400' : 'text-accent-500'}`} />
                        Concurso Destacado
                    </h2>

                    <div className="relative rounded-2xl overflow-hidden bg-dark-2 border border-dark-5">
                        <div className="aspect-[21/9] relative">
                            <Image
                                src={FEATURED_CONTEST.image}
                                alt={FEATURED_CONTEST.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 80vw, 1200px"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-dark-2 via-dark-2/50 to-transparent" />

                            {/* Prize Badge */}
                            <div className={`absolute top-4 right-4 px-4 py-2 rounded-lg ${isDevMode ? 'bg-dev-500' : 'bg-accent-500'} text-white font-medium flex items-center gap-2`}>
                                <Gift className="w-4 h-4" />
                                {FEATURED_CONTEST.prize}
                            </div>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                            <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full ${isDevMode ? 'bg-dev-500/20 text-dev-400' : 'bg-accent-500/20 text-accent-400'} mb-3`}>
                                {FEATURED_CONTEST.category}
                            </span>

                            <h3 className="text-2xl font-light text-content-1 mb-2">
                                {FEATURED_CONTEST.title}
                            </h3>
                            <p className="text-content-2 mb-4 max-w-2xl">
                                {FEATURED_CONTEST.description}
                            </p>

                            <div className="flex items-center gap-6 text-sm text-content-3">
                                <span className="flex items-center gap-1.5">
                                    <Users className="w-4 h-4" />
                                    {FEATURED_CONTEST.participants} participantes
                                </span>
                                <span className="flex items-center gap-1.5 text-amber-400">
                                    <Clock className="w-4 h-4" />
                                    {FEATURED_CONTEST.deadline}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Coming Soon Notice */}
                <div className={`rounded-2xl border ${isDevMode ? 'border-dev-500/30 bg-dev-500/5' : 'border-accent-500/30 bg-accent-500/5'} p-8 text-center mb-16`}>
                    <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl ${isDevMode ? 'bg-dev-500/20' : 'bg-accent-500/20'} flex items-center justify-center`}>
                        <Trophy className={`w-8 h-8 ${isDevMode ? 'text-dev-400' : 'text-accent-500'}`} />
                    </div>

                    <h2 className="text-2xl font-light text-content-1 mb-3">
                        Próximamente
                    </h2>
                    <p className="text-content-2 max-w-lg mx-auto mb-6">
                        Estamos preparando una experiencia completa de concursos con votación comunitaria,
                        premios patrocinados y exhibición de ganadores. ¡Muy pronto!
                    </p>

                    <div className="flex flex-wrap justify-center gap-4">
                        <span className="px-4 py-2 bg-dark-3 rounded-lg text-sm text-content-2">
                            🏆 Premios en efectivo
                        </span>
                        <span className="px-4 py-2 bg-dark-3 rounded-lg text-sm text-content-2">
                            👥 Votación comunitaria
                        </span>
                        <span className="px-4 py-2 bg-dark-3 rounded-lg text-sm text-content-2">
                            🎨 Múltiples categorías
                        </span>
                        <span className="px-4 py-2 bg-dark-3 rounded-lg text-sm text-content-2">
                            📣 Exposición de ganadores
                        </span>
                    </div>
                </div>

                {/* Contest Types */}
                <div className="mb-16">
                    <h2 className="text-lg font-medium text-content-1 mb-6">
                        Tipos de concursos
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {CONTEST_TYPES.map((type) => {
                            const Icon = type.icon;
                            return (
                                <button
                                    key={type.id}
                                    className="p-6 rounded-xl bg-dark-2 border border-dark-5 hover:border-dark-6 transition-colors text-center group"
                                >
                                    <div className={`w-12 h-12 mx-auto mb-4 rounded-xl ${isDevMode ? 'bg-dev-500/10' : 'bg-accent-500/10'} flex items-center justify-center`}>
                                        <Icon className={`w-6 h-6 ${isDevMode ? 'text-dev-400' : 'text-accent-500'}`} />
                                    </div>
                                    <div className="text-sm font-medium text-content-1">
                                        {type.label}
                                    </div>
                                    <div className="text-xs text-content-3 mt-1">
                                        {type.count} concursos
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Past Winners */}
                <div>
                    <h2 className="text-lg font-medium text-content-1 mb-6 flex items-center gap-2">
                        <Award className={`w-5 h-5 ${isDevMode ? 'text-dev-400' : 'text-accent-500'}`} />
                        Ganadores Recientes
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {PAST_WINNERS.map((winner) => (
                            <div
                                key={winner.name}
                                className="p-4 rounded-xl bg-dark-2 border border-dark-5 flex items-center gap-4"
                            >
                                <Image
                                    src={winner.avatar}
                                    alt={winner.name}
                                    width={48}
                                    height={48}
                                    className="rounded-full"
                                    unoptimized
                                />
                                <div>
                                    <div className="text-sm font-medium text-content-1">
                                        {winner.name}
                                    </div>
                                    <div className="text-xs text-content-3">
                                        {winner.title}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
