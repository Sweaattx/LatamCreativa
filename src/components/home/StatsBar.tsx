'use client';

import React from 'react';
import { Users, Briefcase, BookOpen, Compass } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useCountUp } from '@/hooks/useCountUp';
import { useAppStore } from '@/hooks/useAppStore';

const stats = [
    { icon: Users, value: 2400, suffix: '+', label: 'Creadores' },
    { icon: Briefcase, value: 850, suffix: '+', label: 'Proyectos' },
    { icon: BookOpen, value: 320, suffix: '+', label: 'Artículos' },
    { icon: Compass, value: 45, suffix: '', label: 'Países' },
];

export function StatsBar() {
    const [sectionRef, isVisible] = useScrollReveal<HTMLElement>();
    const { state } = useAppStore();
    const isDevMode = state.contentMode === 'dev';

    return (
        <section ref={sectionRef} className="py-12 bg-dark-0 border-y border-dark-5/30">
            <div className="max-w-5xl mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat, i) => (
                        <StatItem
                            key={i}
                            stat={stat}
                            isVisible={isVisible}
                            delay={i * 0.1}
                            isDevMode={isDevMode}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

function StatItem({
    stat,
    isVisible,
    delay,
    isDevMode
}: {
    stat: typeof stats[0];
    isVisible: boolean;
    delay: number;
    isDevMode: boolean;
}) {
    const { formattedCount } = useCountUp({
        end: isVisible ? stat.value : 0,
        duration: 2000,
        delay: delay * 1000,
        suffix: stat.suffix,
    });
    const Icon = stat.icon;

    return (
        <div
            className="text-center transition-all duration-500"
            style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
                transitionDelay: `${delay}s`
            }}
        >
            <div className="flex items-center justify-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${isDevMode ? 'text-dev-400' : 'text-accent-500'}`} strokeWidth={1.5} />
                <span className="text-3xl font-light text-content-1 tabular-nums">
                    {formattedCount}
                </span>
            </div>
            <p className="text-sm text-content-3">{stat.label}</p>
        </div>
    );
}
