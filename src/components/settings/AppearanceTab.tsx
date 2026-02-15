'use client';

import React from 'react';
import { Moon, Sun, Globe, Check } from 'lucide-react';

interface AppearanceTabProps {
    theme: 'dark' | 'light' | 'system';
    setTheme: (theme: 'dark' | 'light' | 'system') => void;
}

const THEME_OPTIONS = [
    { id: 'dark' as const, label: 'Oscuro', icon: Moon },
    { id: 'light' as const, label: 'Claro', icon: Sun },
    { id: 'system' as const, label: 'Sistema', icon: Globe },
];

export function AppearanceTab({ theme, setTheme }: AppearanceTabProps) {
    return (
        <div className="space-y-6">
            <h2 className="text-xl font-medium text-content-1">Apariencia</h2>

            <div>
                <label className="block text-sm font-medium text-content-2 mb-4">
                    Tema
                </label>
                <div className="grid grid-cols-3 gap-4">
                    {THEME_OPTIONS.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => setTheme(option.id)}
                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-colors ${theme === option.id
                                ? 'bg-accent-500/10 border-accent-500/30 text-accent-400'
                                : 'bg-dark-3/50 border-dark-5 text-content-3 hover:text-content-1'
                                }`}
                        >
                            <option.icon className="w-6 h-6" />
                            <span className="text-sm">{option.label}</span>
                            {theme === option.id && (
                                <Check className="w-4 h-4" />
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
