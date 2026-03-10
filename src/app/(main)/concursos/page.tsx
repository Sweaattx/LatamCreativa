'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, Sparkles, Calendar, Users, Clock, Star, Gift, Target, Award, Flame, Filter, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useAppStore } from '@/hooks/useAppStore';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { contestsService } from '@/services/supabase/contests';

const CONTESTS = [
    {
        id: '1',
        title: 'Desafío de Character Design 2024',
        description: 'Diseña un personaje original inspirado en la fauna latinoamericana. Los mejores trabajos serán exhibidos en nuestra galería principal.',
        image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80',
        prize: '$500 USD',
        deadline: '21 días',
        participants: 47,
        category: 'Ilustración',
        status: 'active' as const,
        featured: true
    },
    {
        id: '2',
        title: 'Logo Design Challenge',
        description: 'Crea un logotipo moderno para una startup de tecnología sustentable en LATAM.',
        image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&auto=format&fit=crop&q=80',
        prize: '$300 USD',
        deadline: '14 días',
        participants: 89,
        category: 'Diseño',
        status: 'active' as const,
        featured: false
    },
    {
        id: '3',
        title: 'Render CGI: Arquitectura Futurista',
        description: 'Imagina cómo serán las ciudades de Latinoamérica en 2050. Presenta tu visión en un render 3D.',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
        prize: '$750 USD',
        deadline: '30 días',
        participants: 23,
        category: '3D & CGI',
        status: 'active' as const,
        featured: false
    },
    {
        id: '4',
        title: 'Motion Graphics: Identidad Cultural',
        description: 'Crea una pieza de motion graphics de 15-30 segundos que capture la esencia cultural de tu país.',
        image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=80',
        prize: '$400 USD',
        deadline: '7 días',
        participants: 62,
        category: 'Animación',
        status: 'active' as const,
        featured: false
    },
    {
        id: '5',
        title: 'Ilustración Editorial: Naturaleza LATAM',
        description: 'Ilustra una portada de revista sobre la biodiversidad de América Latina.',
        image: 'https://images.unsplash.com/photo-1578926288207-a90a5366759d?w=800&auto=format&fit=crop&q=80',
        prize: '$350 USD',
        deadline: 'Finalizado',
        participants: 124,
        category: 'Ilustración',
        status: 'ended' as const,
        featured: false
    },
    {
        id: '6',
        title: 'Game Art: Pixel Art Challenge',
        description: 'Diseña un sprite sheet completo de un personaje en estilo pixel art retro.',
        image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
        prize: '$250 USD',
        deadline: 'Finalizado',
        participants: 203,
        category: 'Videojuegos',
        status: 'ended' as const,
        featured: false
    },
    {
        id: '7',
        title: 'Branding Completo para ONG',
        description: 'Crea una identidad visual completa para una ONG dedicada a la educación digital en zonas rurales.',
        image: 'https://images.unsplash.com/photo-1561070791-36c11767b26a?w=800&auto=format&fit=crop&q=80',
        prize: '$600 USD',
        deadline: '10 días',
        participants: 35,
        category: 'Diseño',
        status: 'active' as const,
        featured: false
    },
];

const CATEGORIES = ['Todos', 'Ilustración', 'Diseño', '3D & CGI', 'Animación', 'Videojuegos'];
const STATUS_FILTER = ['Todos', 'Activos', 'Finalizados'];

const PAST_WINNERS = [
    { name: 'María García', avatar: 'https://ui-avatars.com/api/?name=Maria+Garcia&background=ec4899&color=fff', title: 'Character Design 2023', prize: '$500' },
    { name: 'Carlos Ruiz', avatar: 'https://ui-avatars.com/api/?name=Carlos+Ruiz&background=6366f1&color=fff', title: 'Render Architecture', prize: '$750' },
    { name: 'Ana Torres', avatar: 'https://ui-avatars.com/api/?name=Ana+Torres&background=10b981&color=fff', title: 'Motion LATAM', prize: '$400' },
];

export default function ConcursosPage() {
    const { state } = useAppStore();
    const isDevMode = state.contentMode === 'dev';
    const [sectionRef, isVisible] = useScrollReveal<HTMLDivElement>();
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [selectedStatus, setSelectedStatus] = useState('Todos');
    const [contests, setContests] = useState(CONTESTS);

    const fetchContests = useCallback(async () => {
        try {
            const data = await contestsService.getAll();
            if (data.length > 0) {
                setContests(data.map(c => ({
                    id: c.id,
                    title: c.title,
                    description: c.description || '',
                    image: c.image || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80',
                    prize: c.prize || '',
                    deadline: c.deadline ? `${Math.ceil((new Date(c.deadline).getTime() - Date.now()) / 86400000)} días` : '',
                    participants: c.participants_count || 0,
                    category: c.category,
                    status: c.status as 'active' | 'ended',
                    featured: c.featured
                })));
            }
        } catch { /* fallback to mock */ }
    }, []);

    useEffect(() => { fetchContests(); }, [fetchContests]);

    const accentColor = isDevMode ? 'text-dev-400' : 'text-accent-500';
    const accentBg = isDevMode ? 'bg-dev-500' : 'bg-accent-500';
    const accentBgSubtle = isDevMode ? 'bg-dev-500/10' : 'bg-accent-500/10';
    const accentBorder = isDevMode ? 'border-dev-500/30' : 'border-accent-500/30';

    const filteredContests = CONTESTS.filter(c => {
        const matchesCat = selectedCategory === 'Todos' || c.category === selectedCategory;
        const matchesStatus =
            selectedStatus === 'Todos' ||
            (selectedStatus === 'Activos' && c.status === 'active') ||
            (selectedStatus === 'Finalizados' && c.status === 'ended');
        return matchesCat && matchesStatus;
    });

    const featured = CONTESTS.find(c => c.featured);

    return (
        <div className="min-h-screen bg-dark-1">
            {/* Hero — compact */}
            <div className="relative overflow-hidden border-b border-dark-5/50">
                <div className={`absolute inset-0 bg-gradient-to-br ${isDevMode ? 'from-dev-500/5 via-transparent to-dev-400/3' : 'from-accent-500/5 via-transparent to-accent-400/3'}`} />
                <div className="relative max-w-6xl mx-auto px-6 py-14">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                        <div>
                            <span className={`text-xs uppercase tracking-widest mb-2 block ${accentColor}`}>Demuestra tu talento</span>
                            <h1 className="text-3xl md:text-4xl font-extralight text-content-1 mb-2">
                                Concursos & Desafíos
                            </h1>
                            <p className="text-content-2 max-w-lg">
                                Participa en competencias creativas, gana premios y destaca tu trabajo ante la comunidad.
                            </p>
                        </div>
                        <div className="flex gap-6 text-center">
                            <div>
                                <div className="text-2xl font-light text-content-1">{CONTESTS.filter(c => c.status === 'active').length}</div>
                                <div className="text-xs text-content-3">Activos</div>
                            </div>
                            <div>
                                <div className={`text-2xl font-light ${accentColor}`}>$3,150</div>
                                <div className="text-xs text-content-3">En premios</div>
                            </div>
                            <div>
                                <div className="text-2xl font-light text-content-1">{CONTESTS.reduce((acc, c) => acc + c.participants, 0)}</div>
                                <div className="text-xs text-content-3">Participantes</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-12" ref={sectionRef}>

                {/* Featured contest — wide banner */}
                {featured && (
                    <motion.div
                        className="mb-12"
                        initial={{ opacity: 0, y: 20 }}
                        animate={isVisible ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="relative rounded-2xl overflow-hidden group cursor-pointer">
                            <div className="aspect-[21/9] relative">
                                <Image src={featured.image} alt={featured.title} fill className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" sizes="100vw" />
                                <div className="absolute inset-0 bg-gradient-to-t from-dark-0 via-dark-0/40 to-transparent" />
                            </div>
                            <div className={`absolute top-4 right-4 px-4 py-2 rounded-lg ${accentBg} text-white text-sm font-medium flex items-center gap-2`}>
                                <Gift className="w-4 h-4" /> {featured.prize}
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                                <span className={`inline-block px-2.5 py-1 text-2xs font-medium rounded-full ${accentBgSubtle} ${accentColor} mb-3 uppercase tracking-wider`}>
                                    {featured.category}
                                </span>
                                <h2 className="text-2xl md:text-3xl font-light text-content-1 mb-2">{featured.title}</h2>
                                <p className="text-content-2 mb-4 max-w-2xl line-clamp-2">{featured.description}</p>
                                <div className="flex items-center gap-6 text-sm text-content-3">
                                    <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {featured.participants} participantes</span>
                                    <span className="flex items-center gap-1.5 text-amber-400"><Clock className="w-4 h-4" /> {featured.deadline} restantes</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                    <div className="flex gap-2 flex-wrap flex-1">
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
                    <div className="flex gap-2">
                        {STATUS_FILTER.map(st => (
                            <button
                                key={st}
                                onClick={() => setSelectedStatus(st)}
                                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${selectedStatus === st
                                    ? 'bg-dark-3 text-content-1 font-medium'
                                    : 'text-content-3 hover:text-content-1 hover:bg-dark-3/50'
                                    }`}
                            >
                                {st}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Contest grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
                    {filteredContests.filter(c => !c.featured).map((contest, i) => (
                        <motion.div
                            key={contest.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={isVisible ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.3, delay: i * 0.06 }}
                        >
                            <div className="group rounded-xl overflow-hidden bg-dark-2/30 border border-dark-5/50 hover:border-dark-6 transition-all cursor-pointer">
                                <div className="aspect-video relative">
                                    <Image src={contest.image} alt={contest.title} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.02]" sizes="(max-width: 768px) 100vw, 33vw" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-dark-0/70 to-transparent" />
                                    {/* Prize badge */}
                                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-dark-0/70 backdrop-blur-sm text-content-1 text-xs font-mono font-medium flex items-center gap-1.5">
                                        <Gift className="w-3 h-3 text-amber-400" /> {contest.prize}
                                    </div>
                                    {/* Status badge */}
                                    <div className={`absolute top-3 left-3 px-2 py-0.5 rounded-full text-2xs font-medium uppercase tracking-wider ${contest.status === 'active'
                                        ? 'bg-emerald-500/20 text-emerald-400'
                                        : 'bg-dark-3/80 text-content-3'
                                        }`}>
                                        {contest.status === 'active' ? 'Activo' : 'Finalizado'}
                                    </div>
                                </div>

                                <div className="p-5">
                                    <span className={`text-2xs font-medium uppercase tracking-wider ${accentColor}`}>
                                        {contest.category}
                                    </span>
                                    <h3 className="text-md font-medium text-content-1 mt-1 mb-2 line-clamp-1 group-hover:text-accent-400 transition-colors">
                                        {contest.title}
                                    </h3>
                                    <p className="text-sm text-content-3 line-clamp-2 mb-4">
                                        {contest.description}
                                    </p>
                                    <div className="flex items-center justify-between text-xs text-content-3">
                                        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {contest.participants}</span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" />
                                            {contest.status === 'active' ? contest.deadline : 'Finalizado'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {filteredContests.filter(c => !c.featured).length === 0 && (
                    <div className="text-center py-16 mb-16">
                        <Trophy className="w-12 h-12 text-content-3/30 mx-auto mb-3" />
                        <p className="text-content-2">No se encontraron concursos con esos filtros</p>
                    </div>
                )}

                {/* Recent winners */}
                <div>
                    <div className="flex items-center gap-2 mb-6">
                        <Award className={`w-5 h-5 ${accentColor}`} />
                        <h2 className="text-lg font-medium text-content-1">Ganadores Recientes</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {PAST_WINNERS.map((winner) => (
                            <div key={winner.name} className="flex items-center gap-4 p-4 rounded-xl bg-dark-2/30 border border-dark-5/50">
                                <Image src={winner.avatar} alt={winner.name} width={48} height={48} className="rounded-full" unoptimized />
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-content-1">{winner.name}</div>
                                    <div className="text-xs text-content-3 truncate">{winner.title}</div>
                                </div>
                                <span className={`text-sm font-mono font-medium ${accentColor}`}>{winner.prize}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
