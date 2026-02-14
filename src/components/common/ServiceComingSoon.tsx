/**
 * Service Coming Soon View
 * Displays a coming soon page with service-specific information
 */
import React from 'react';
import { ArrowLeft, Bell, Rocket, Timer, LucideIcon, Check } from 'lucide-react';

interface ServiceComingSoonProps {
    title: string;
    subtitle: string;
    description: string;
    features: string[];
    icon: LucideIcon;
    accentColor?: 'orange' | 'blue' | 'purple' | 'green';
}

export const ServiceComingSoon: React.FC<ServiceComingSoonProps> = ({
    title,
    subtitle,
    description,
    features,
    icon: Icon,
    accentColor = 'orange'
}) => {
    const colorClasses = {
        orange: {
            gradient: 'from-accent-500 to-orange-600',
            glow: 'bg-accent-500/20',
            button: 'from-accent-500 to-accent-600',
            shadow: 'shadow-glow-orange',
            icon: 'text-accent-500',
            check: 'text-accent-500'
        },
        blue: {
            gradient: 'from-dev-400 to-blue-500',
            glow: 'bg-dev-500/20',
            button: 'from-dev-500 to-dev-600',
            shadow: 'shadow-glow-blue',
            icon: 'text-dev-400',
            check: 'text-dev-500'
        },
        purple: {
            gradient: 'from-purple-400 to-pink-500',
            glow: 'bg-purple-500/20',
            button: 'from-purple-500 to-pink-600',
            shadow: 'shadow-purple-500/20',
            icon: 'text-purple-400',
            check: 'text-purple-500'
        },
        green: {
            gradient: 'from-emerald-400 to-teal-500',
            glow: 'bg-emerald-500/20',
            button: 'from-emerald-500 to-teal-600',
            shadow: 'shadow-emerald-500/20',
            icon: 'text-emerald-400',
            check: 'text-emerald-500'
        }
    };

    const colors = colorClasses[accentColor];

    return (
        <div className="relative min-h-[80vh] flex items-center justify-center p-6 overflow-hidden animate-fadeIn">
            {/* Background Gradients */}
            <div className={`absolute top-1/4 left-1/4 w-96 h-96 ${colors.glow} rounded-full blur-[120px] -z-10 animate-pulse`}></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-dark-5/10 rounded-full blur-[120px] -z-10"></div>

            <div className="max-w-4xl w-full relative z-10">
                <div className="grid md:grid-cols-2 gap-8 items-center">

                    {/* Left: Service Info */}
                    <div className="p-8 md:p-10 rounded-2xl border border-dark-5/50 shadow-2xl bg-dark-2/80 backdrop-blur-xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-dark-3 border border-dark-5/50 text-accent-500 text-xs font-bold uppercase tracking-widest mb-6">
                            <Timer className="h-3 w-3" /> Próximamente
                        </div>

                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${colors.button} flex items-center justify-center mb-6 ${colors.shadow} shadow-lg`}>
                            <Icon className="w-8 h-8 text-white" />
                        </div>

                        <h1 className="text-4xl md:text-5xl font-light text-content-1 mb-3 leading-tight">
                            {title}
                        </h1>
                        <p className={`text-lg font-medium bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent mb-4`}>
                            {subtitle}
                        </p>
                        <p className="text-content-2 leading-relaxed mb-8">
                            {description}
                        </p>

                        {/* Features List */}
                        <div className="space-y-3 mb-8">
                            {features.map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-dark-3 flex items-center justify-center">
                                        <Check className={`w-3 h-3 ${colors.check}`} />
                                    </div>
                                    <span className="text-content-2 text-sm">{feature}</span>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => window.history.back()}
                            className="text-content-3 hover:text-content-1 text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" /> Volver atrás
                        </button>
                    </div>

                    {/* Right: Newsletter Signup */}
                    <div className="p-8 rounded-2xl border border-dark-5/50 shadow-2xl bg-dark-2/60 backdrop-blur-xl text-center">
                        <Rocket className={`w-12 h-12 ${colors.icon} mx-auto mb-6`} />
                        <h2 className="text-2xl font-medium text-content-1 mb-3">
                            Sé el primero en probarlo
                        </h2>
                        <p className="text-content-3 text-sm mb-6">
                            Únete a la lista de espera y te avisaremos cuando esté disponible.
                        </p>

                        <div className="space-y-3">
                            <div className="relative">
                                <Bell className="absolute left-4 top-3.5 h-5 w-5 text-content-3" />
                                <input
                                    type="email"
                                    placeholder="tucorreo@ejemplo.com"
                                    className="w-full bg-dark-3 border border-dark-5 rounded-xl py-3 pl-12 pr-4 text-content-1 placeholder-content-3 focus:outline-none focus:border-accent-500/50 focus:bg-dark-2 transition-all"
                                />
                            </div>
                            <button className={`w-full px-8 py-3 bg-gradient-to-r ${colors.button} text-white font-medium rounded-xl hover:shadow-lg ${colors.shadow} hover:scale-[1.02] transition-all flex items-center justify-center gap-2`}>
                                <Rocket className="h-4 w-4" />
                                Notificarme
                            </button>
                        </div>

                        <p className="text-content-3 text-xs mt-4">
                            Sin spam. Solo una notificación cuando esté listo.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceComingSoon;
