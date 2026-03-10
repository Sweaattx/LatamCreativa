'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Briefcase, GraduationCap, Calendar, MapPin, ArrowRight } from 'lucide-react';
import type { ExperienceItem, EducationItem } from '@/types/user';

/* ================================================
   TYPES
   ================================================ */
interface CurriculumModalProps {
    isOpen: boolean;
    onClose: () => void;
    userName: string;
    experience: ExperienceItem[];
    education: EducationItem[];
}

/* ================================================
   MODAL
   ================================================ */
export function CurriculumModal({
    isOpen,
    onClose,
    userName,
    experience,
    education,
}: CurriculumModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />

                    {/* Centering wrapper */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            className="w-full max-w-2xl max-h-[85vh]
                                       bg-dark-1 border border-dark-5/60 rounded-2xl
                                       overflow-hidden flex flex-col shadow-modal pointer-events-auto"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-5 border-b border-dark-5/40">
                                <div>
                                    <h2 className="text-lg font-bold text-content-1">Currículum</h2>
                                    <p className="text-sm text-content-3 mt-0.5">{userName}</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-dark-2 border border-dark-5/60 text-content-3 hover:text-content-1 hover:bg-dark-3 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Scrollable Body */}
                            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 scrollbar-thin scrollbar-thumb-dark-4">
                                {/* ---- EXPERIENCIA LABORAL ---- */}
                                <section>
                                    <div className="flex items-center gap-2.5 mb-5">
                                        <div className="w-8 h-8 rounded-lg bg-accent-500/15 flex items-center justify-center">
                                            <Briefcase className="w-4 h-4 text-accent-400" />
                                        </div>
                                        <h3 className="text-xs font-bold text-content-1 uppercase tracking-wider">
                                            Experiencia Laboral
                                        </h3>
                                    </div>

                                    {experience.length > 0 ? (
                                        <div className="relative ml-4">
                                            {/* Timeline line */}
                                            <div className="absolute left-0 top-2 bottom-2 w-px bg-dark-5/60" />

                                            <div className="space-y-6">
                                                {experience.map((exp, index) => (
                                                    <motion.div
                                                        key={exp.id}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.1 }}
                                                        className="relative pl-7"
                                                    >
                                                        {/* Timeline dot */}
                                                        <div className="absolute left-0 top-1.5 -translate-x-1/2">
                                                            <div className="w-3 h-3 rounded-full border-2 border-accent-500 bg-dark-1" />
                                                        </div>

                                                        {/* Card */}
                                                        <div className="bg-dark-2/60 border border-dark-5/40 rounded-xl p-4 hover:border-dark-5/80 transition-colors">
                                                            <h4 className="text-sm font-semibold text-content-1">
                                                                {exp.role}
                                                            </h4>
                                                            <p className="text-xs font-medium text-accent-400 mt-0.5">
                                                                {exp.company}
                                                            </p>
                                                            <div className="flex items-center gap-3 mt-2 text-[11px] text-content-3">
                                                                <span className="flex items-center gap-1">
                                                                    <Calendar className="w-3 h-3" />
                                                                    {exp.period}
                                                                </span>
                                                                {exp.location && (
                                                                    <span className="flex items-center gap-1">
                                                                        <MapPin className="w-3 h-3" />
                                                                        {exp.location}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {exp.description && (
                                                                <p className="text-xs text-content-2 mt-3 leading-relaxed">
                                                                    {exp.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-content-3 italic ml-4">
                                            No hay experiencia registrada aún.
                                        </p>
                                    )}
                                </section>

                                {/* ---- EDUCACIÓN ---- */}
                                <section>
                                    <div className="flex items-center gap-2.5 mb-5">
                                        <div className="w-8 h-8 rounded-lg bg-accent-500/15 flex items-center justify-center">
                                            <GraduationCap className="w-4 h-4 text-accent-400" />
                                        </div>
                                        <h3 className="text-xs font-bold text-content-1 uppercase tracking-wider">
                                            Educación
                                        </h3>
                                    </div>

                                    {education.length > 0 ? (
                                        <div className="relative ml-4">
                                            {/* Timeline line */}
                                            <div className="absolute left-0 top-2 bottom-2 w-px bg-dark-5/60" />

                                            <div className="space-y-6">
                                                {education.map((edu, index) => (
                                                    <motion.div
                                                        key={edu.id}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: (experience.length + index) * 0.1 }}
                                                        className="relative pl-7"
                                                    >
                                                        {/* Timeline dot */}
                                                        <div className="absolute left-0 top-1.5 -translate-x-1/2">
                                                            <div className="w-3 h-3 rounded-full border-2 border-accent-500 bg-dark-1" />
                                                        </div>

                                                        {/* Card */}
                                                        <div className="bg-dark-2/60 border border-dark-5/40 rounded-xl p-4 hover:border-dark-5/80 transition-colors">
                                                            <h4 className="text-sm font-semibold text-content-1">
                                                                {edu.degree}
                                                            </h4>
                                                            <p className="text-xs font-medium text-accent-400 mt-0.5">
                                                                {edu.school}
                                                            </p>
                                                            <div className="flex items-center gap-3 mt-2 text-[11px] text-content-3">
                                                                <span className="flex items-center gap-1">
                                                                    <Calendar className="w-3 h-3" />
                                                                    {edu.period}
                                                                </span>
                                                            </div>
                                                            {edu.description && (
                                                                <p className="text-xs text-content-2 mt-3 leading-relaxed">
                                                                    {edu.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-content-3 italic ml-4">
                                            No hay educación registrada aún.
                                        </p>
                                    )}
                                </section>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}

/* ================================================
   SIDEBAR CARD — "Ver Currículum"
   ================================================ */
interface CurriculumCardProps {
    experienceCount: number;
    educationCount: number;
    onClick: () => void;
}

export function CurriculumCard({ experienceCount, educationCount, onClick }: CurriculumCardProps) {
    const totalItems = experienceCount + educationCount;
    const label = totalItems === 1
        ? '1 experiencia'
        : `${totalItems} experiencia${totalItems !== 1 ? 's' : ''}`;

    return (
        <button
            onClick={onClick}
            className="w-full group bg-dark-1 border border-accent-500/30 rounded-2xl p-4 flex items-center gap-3.5
                       hover:border-accent-500/50 hover:bg-dark-1/80 transition-all duration-200 text-left"
        >
            {/* Icon */}
            <div className="w-10 h-10 rounded-xl bg-accent-500/15 flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-5 h-5 text-accent-400" />
            </div>

            {/* Label */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-content-1">Ver Currículum</p>
                <p className="text-xs text-content-3 mt-0.5">{label}</p>
            </div>

            {/* Arrow */}
            <ArrowRight className="w-4 h-4 text-accent-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
        </button>
    );
}
