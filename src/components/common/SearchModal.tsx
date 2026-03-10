'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Search, X, Layers, FileText, Users, ArrowRight, Loader2 } from 'lucide-react';
import { globalSearch, SearchResult } from '@/services/supabase/search';

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const TYPE_CONFIG = {
    project: { label: 'Proyectos', icon: Layers, color: 'text-accent-500', href: (r: SearchResult) => `/portfolio/${r.slug || r.id}` },
    article: { label: 'Artículos', icon: FileText, color: 'text-blue-400', href: (r: SearchResult) => `/blog/${r.slug || r.id}` },
    user: { label: 'Usuarios', icon: Users, color: 'text-emerald-400', href: (r: SearchResult) => `/user/${r.username || r.id}` },
} as const;

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // Focus input on open
    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setResults([]);
            setActiveIndex(-1);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    // ⌘K global shortcut
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                if (isOpen) onClose();
                // Parent handles open; this just prevents default
            }
            if (e.key === 'Escape' && isOpen) onClose();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    // Debounced search
    const doSearch = useCallback(async (term: string) => {
        if (term.trim().length < 2) {
            setResults([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const data = await globalSearch(term, { maxResults: 15 });
            setResults(data);
        } catch {
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleChange = (value: string) => {
        setQuery(value);
        setActiveIndex(-1);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (value.trim().length >= 2) {
            setLoading(true);
            debounceRef.current = setTimeout(() => doSearch(value), 300);
        } else {
            setResults([]);
            setLoading(false);
        }
    };

    // Group results by type
    const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
        (acc[r.type] = acc[r.type] || []).push(r);
        return acc;
    }, {});

    // Flat list for keyboard nav
    const flatResults = Object.values(grouped).flat();

    const navigateTo = (result: SearchResult) => {
        const cfg = TYPE_CONFIG[result.type];
        router.push(cfg.href(result));
        onClose();
    };

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(i => Math.min(i + 1, flatResults.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(i => Math.max(i - 1, -1));
        } else if (e.key === 'Enter' && activeIndex >= 0 && flatResults[activeIndex]) {
            e.preventDefault();
            navigateTo(flatResults[activeIndex]);
        }
    };

    if (!isOpen || typeof document === 'undefined') return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999]" onClick={onClose}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className="relative max-w-2xl mx-auto mt-[15vh] animate-scale-in"
                onClick={e => e.stopPropagation()}
            >
                <div className="bg-dark-2 border border-dark-5 rounded-2xl shadow-modal overflow-hidden">
                {/* Input row */}
                <div className="flex items-center gap-3 px-5 h-14 border-b border-dark-5/50">
                    <Search className="w-5 h-5 text-content-3 flex-shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={e => handleChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Buscar proyectos, artículos, usuarios..."
                        className="flex-1 bg-transparent text-content-1 placeholder:text-content-3 text-sm outline-none"
                        autoComplete="off"
                    />
                    {loading && <Loader2 className="w-4 h-4 text-content-3 animate-spin flex-shrink-0" />}
                    <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-content-3 bg-dark-3 rounded border border-dark-5">
                        ESC
                    </kbd>
                    <button onClick={onClose} className="p-1 text-content-3 hover:text-content-1 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Results */}
                <div className="max-h-[50vh] overflow-y-auto p-2">
                    {query.length < 2 && (
                        <div className="py-12 text-center">
                            <Search className="w-8 h-8 text-content-3/40 mx-auto mb-3" />
                            <p className="text-sm text-content-3">Escribe al menos 2 caracteres para buscar</p>
                            <p className="text-xs text-content-3/60 mt-1">
                                Tip: usa <kbd className="px-1 py-0.5 bg-dark-3 rounded text-[10px] font-mono">⌘K</kbd> para abrir rápidamente
                            </p>
                        </div>
                    )}

                    {query.length >= 2 && !loading && results.length === 0 && (
                        <div className="py-12 text-center">
                            <p className="text-sm text-content-2">Sin resultados para &quot;{query}&quot;</p>
                            <p className="text-xs text-content-3 mt-1">Intenta con otros términos</p>
                        </div>
                    )}

                    {Object.entries(grouped).map(([type, items]) => {
                        const cfg = TYPE_CONFIG[type as keyof typeof TYPE_CONFIG];
                        const Icon = cfg.icon;
                        return (
                            <div key={type} className="mb-2">
                                <div className="flex items-center gap-2 px-3 py-2">
                                    <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                                    <span className="text-2xs font-semibold text-content-3 uppercase tracking-widest">
                                        {cfg.label}
                                    </span>
                                    <span className="text-2xs text-content-3/50">{items.length}</span>
                                </div>
                                {items.map((result) => {
                                    const flatIdx = flatResults.indexOf(result);
                                    const isActive = flatIdx === activeIndex;
                                    return (
                                        <button
                                            key={result.id}
                                            onClick={() => navigateTo(result)}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors group ${isActive ? 'bg-dark-3' : 'hover:bg-dark-3/50'
                                                }`}
                                        >
                                            {result.image ? (
                                                <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-dark-3">
                                                    <Image
                                                        src={result.image}
                                                        alt=""
                                                        width={36}
                                                        height={36}
                                                        className="w-full h-full object-cover"
                                                        unoptimized
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-9 h-9 rounded-lg bg-dark-3 flex items-center justify-center flex-shrink-0">
                                                    <Icon className={`w-4 h-4 ${cfg.color}`} />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-content-1 truncate">{result.title}</p>
                                                {result.subtitle && (
                                                    <p className="text-xs text-content-3 truncate">{result.subtitle}</p>
                                                )}
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-content-3/40 group-hover:text-content-2 transition-colors flex-shrink-0" />
                                        </button>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                {results.length > 0 && (
                    <div className="px-4 py-2.5 border-t border-dark-5/50 flex items-center justify-between text-[10px] text-content-3/50">
                        <span>{results.length} resultados</span>
                        <div className="flex items-center gap-3">
                            <span><kbd className="px-1 py-0.5 bg-dark-3 rounded font-mono">↑↓</kbd> navegar</span>
                            <span><kbd className="px-1 py-0.5 bg-dark-3 rounded font-mono">⏎</kbd> abrir</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
        </div >,
        document.body
    );
}

export default SearchModal;
